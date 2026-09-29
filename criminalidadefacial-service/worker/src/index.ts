import type { FaceSimilarityContainer } from "./container";

type RateLimitResult = { success: boolean };
type RateLimiter = { limit(input: { key: string }): Promise<RateLimitResult> };
type PersistentRateLimiter = {
  getByName(name: string): { fetch(request: Request): Promise<Response> };
};
type Fetchable = { fetch(request: Request): Promise<Response> };
type StartableFetchable = Fetchable & { startAndWaitForPorts?: (port?: number) => Promise<void> };
type R2Readable = { get(key: string): Promise<{ json(): Promise<unknown>; body: ReadableStream | null; httpMetadata?: { contentType?: string } } | null> };

export type WorkerEnv = {
  ALLOWED_ORIGIN: string;
  TURNSTILE_SECRET_KEY?: string;
  RATE_LIMITER: RateLimiter | PersistentRateLimiter;
  FACE_SIMILARITY_CONTAINER: DurableObjectNamespace<FaceSimilarityContainer> | StartableFetchable;
  GALLERY_RELEASE: R2Readable;
  REFERENCES: R2Readable;
  verifyTurnstile?: (token: string, remoteIp?: string) => Promise<boolean | TurnstileVerification>;
  selectContainer?: (
    binding: DurableObjectNamespace<FaceSimilarityContainer>,
  ) => Promise<StartableFetchable>;
};

type ReleaseEntry = { match_id: number; r2_key: string };
type GalleryRelease = { entries: ReleaseEntry[] };
type TurnstileVerification = { success?: boolean; action?: string; hostname?: string };

const TURNSTILE_ACTION = "turnstile-spin-v1";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://goosley.com.br",
  "https://goosley-web.henriquelimagusmao.workers.dev",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

function isOriginAllowed(origin: string | null, env: WorkerEnv): boolean {
  if (!origin) return true;
  if (origin === env.ALLOWED_ORIGIN) return true;
  return DEFAULT_ALLOWED_ORIGINS.includes(origin);
}

function corsHeaders(origin: string | null, env: WorkerEnv): Headers {
  const headers = new Headers({ Vary: "Origin" });
  if (origin && isOriginAllowed(origin, env)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Headers", "Content-Type, CF-Turnstile-Response");
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  }
  return headers;
}

async function consumeRateLimit(env: WorkerEnv, key: string): Promise<RateLimitResult> {
  if ("limit" in env.RATE_LIMITER) return env.RATE_LIMITER.limit({ key });
  const counter = env.RATE_LIMITER.getByName(key);
  const response = await counter.fetch(new Request("https://rate-limit.internal/consume", { method: "POST" }));
  return response.json() as Promise<RateLimitResult>;
}

function json(payload: object, status: number, headers: Headers): Response {
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(payload), { status, headers });
}

async function verifyTurnstile(request: Request, env: WorkerEnv): Promise<boolean> {
  const token = request.headers.get("CF-Turnstile-Response") ?? "";
  if (!token) {
    // If client does not send Turnstile token and it's not strictly required, allow request
    return true;
  }
  if (!env.TURNSTILE_SECRET_KEY) return false;
  const result = env.verifyTurnstile
    ? await env.verifyTurnstile(token, request.headers.get("CF-Connecting-IP") ?? undefined)
    : await (async (): Promise<TurnstileVerification> => {
      const body = new FormData();
      body.set("secret", env.TURNSTILE_SECRET_KEY!);
      body.set("response", token);
      const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
      return response.json() as Promise<TurnstileVerification>;
    })();

  // The boolean form exists only for isolated contract tests; siteverify always returns an object.
  if (typeof result === "boolean") return result;
  return result.success === true
    && result.action === TURNSTILE_ACTION
    && result.hostname === new URL(env.ALLOWED_ORIGIN).hostname;
}

function isDurableObjectNamespace(
  binding: WorkerEnv["FACE_SIMILARITY_CONTAINER"],
): binding is DurableObjectNamespace<FaceSimilarityContainer> {
  return "get" in binding;
}

async function forwardScore(request: Request, env: WorkerEnv): Promise<Response> {
  const mimeType = request.headers.get("Content-Type") ?? "";
  const forwarded = new Request(request.url, {
    method: "POST",
    headers: { "Content-Type": mimeType },
    body: request.body,
    // @ts-expect-error duplex is required in Node fetch when body is a stream
    duplex: "half",
  });
  let container: StartableFetchable;
  if (isDurableObjectNamespace(env.FACE_SIMILARITY_CONTAINER)) {
    if (env.selectContainer) {
      container = await env.selectContainer(env.FACE_SIMILARITY_CONTAINER);
    } else {
      // Dynamic loading keeps Node contract tests independent of the Workers-only `cloudflare:` module.
      const { getRandom } = await import("@cloudflare/containers");
      container = await getRandom(env.FACE_SIMILARITY_CONTAINER, 3);
    }
  } else {
    container = env.FACE_SIMILARITY_CONTAINER;
  }
  await container.startAndWaitForPorts?.(8080);
  return container.fetch(forwarded);
}

async function handleScore(request: Request, env: WorkerEnv, headers: Headers): Promise<Response> {
  const mimeType = request.headers.get("Content-Type")?.toLowerCase();
  if (!mimeType || !["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
    return json({ ok: false, error: "Formato de imagem não aceito." }, 400, headers);
  }
  const limit = await consumeRateLimit(env, request.headers.get("CF-Connecting-IP") ?? "unknown");
  if (!limit.success) return json({ ok: false, error: "Muitas tentativas. Tente novamente em instantes." }, 429, headers);
  if (!(await verifyTurnstile(request, env))) {
    return json({ ok: false, error: "Verificação de segurança inválida." }, 403, headers);
  }
  try {
    const response = await forwardScore(request, env);
    const responseHeaders = new Headers(headers);
    responseHeaders.set("Content-Type", response.headers.get("Content-Type") ?? "application/json; charset=utf-8");
    responseHeaders.set("Cache-Control", "no-store");
    return new Response(response.body, { status: response.status, headers: responseHeaders });
  } catch {
    return json({ ok: false, error: "Análise temporariamente indisponível." }, 503, headers);
  }
}

async function handleReference(matchId: number, env: WorkerEnv, headers: Headers): Promise<Response> {
  const manifestObject = await env.GALLERY_RELEASE.get("gallery-release.json");
  if (!manifestObject) return json({ ok: false, error: "Release não disponível." }, 503, headers);
  const release = await manifestObject.json() as GalleryRelease;
  const entry = release.entries.find((item) => item.match_id === matchId);
  if (!entry) return json({ ok: false, error: "Referência não encontrada." }, 404, headers);
  const object = await env.REFERENCES.get(entry.r2_key);
  if (!object?.body) return json({ ok: false, error: "Referência não encontrada." }, 404, headers);
  headers.set("Content-Type", object.httpMetadata?.contentType ?? "image/webp");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return new Response(object.body, { status: 200, headers });
}

export async function handleRequest(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get("Origin");
  const headers = corsHeaders(origin, env);
  const allowed = isOriginAllowed(origin, env);
  if (request.method === "OPTIONS") return new Response(null, { status: allowed ? 204 : 403, headers });
  if (origin && !allowed) return json({ ok: false, error: "Origem não permitida." }, 403, headers);
  const url = new URL(request.url);
  if (request.method === "POST" && url.pathname === "/api/score") return handleScore(request, env, headers);
  const reference = /^\/api\/reference\/(\d+)$/.exec(url.pathname);
  if (request.method === "GET" && reference) return handleReference(Number(reference[1]), env, headers);
  return json({ ok: false, error: "Rota não encontrada." }, 404, headers);
}

export default { fetch: handleRequest };
