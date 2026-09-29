import type { FetchLike } from "@/lib/criminalidadefacial";
import { isCriminalidadeFacialDeactivated } from "@/lib/criminalidadefacial-schedule";

const DEFAULT_ARCFACE_BACKEND = "https://criminalidadefacial-api.henriquelimagusmao.workers.dev";

export type ReferenceHandlerOptions = {
  fetchImpl?: FetchLike;
  getBackendUrl?: () => string | undefined;
  timeoutMs?: number;
  attempts?: number;
};

export type ReferenceContext = { params: Promise<{ matchId: string }> };

function jsonError(error: string, status: number) {
  return Response.json({ ok: false, error }, { status, headers: { "Cache-Control": "no-store" } });
}

export function createReferenceHandler({
  fetchImpl = fetch,
  getBackendUrl = () => process.env.FACIAL_SIMILARITY_BACKEND_URL ?? DEFAULT_ARCFACE_BACKEND,
  timeoutMs = 15_000,
  attempts = 2,
}: ReferenceHandlerOptions = {}) {
  return async function reference(_request: Request, context: ReferenceContext) {
    if (isCriminalidadeFacialDeactivated()) return jsonError("Esta página foi desativada.", 410);

    const { matchId } = await context.params;
    if (!/^\d+$/u.test(matchId)) return jsonError("Referência inválida.", 400);

    const backendUrl = getBackendUrl()?.replace(/\/$/u, "");
    if (!backendUrl) return jsonError("O ArcFace não está configurado.", 503);

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetchImpl(`${backendUrl}/api/reference/${matchId}`, { signal: controller.signal });
        if (response.ok) {
          return new Response(response.body, {
            status: 200,
            headers: {
              "Content-Type": response.headers.get("Content-Type") ?? "image/webp",
              "Cache-Control": response.headers.get("Cache-Control") ?? "public, max-age=31536000, immutable",
            },
          });
        }
        if (response.status < 500) return jsonError("Referência não encontrada.", response.status);
      } catch {
        // A second attempt handles a cold or restarting ArcFace container.
      } finally {
        clearTimeout(timeout);
      }
    }

    return jsonError("A referência está temporariamente indisponível.", 503);
  };
}
