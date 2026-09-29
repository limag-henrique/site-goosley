import { NextRequest, NextResponse } from "next/server";
import type { FetchLike, PublicScoreResponse } from "@/lib/criminalidadefacial";

const ALLOWED_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const DEFAULT_ARCFACE_BACKEND = "https://criminalidadefacial-api.henriquelimagusmao.workers.dev";

export type ScoreHandlerOptions = {
  fetchImpl?: FetchLike;
  getBackendUrl?: () => string | undefined;
  timeoutMs?: number;
  attempts?: number;
};

function isPublicScoreResponse(value: unknown): value is PublicScoreResponse {
  if (typeof value !== "object" || value === null) return false;
  const score = value as Partial<PublicScoreResponse>;
  return score.ok === true
    && Number.isFinite(score.aggregate_relative_percent)
    && Number.isFinite(score.best_cosine)
    && Array.isArray(score.top_matches)
    && score.top_matches.every((match) => (
      typeof match === "object"
      && match !== null
      && Number.isFinite(match.match_id)
      && Number.isFinite(match.cosine)
      && typeof match.image_url === "string"
    ));
}

function errorResponse(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status, headers: { "Cache-Control": "no-store" } });
}

export function createScoreHandler({
  fetchImpl = fetch,
  getBackendUrl = () => process.env.FACIAL_SIMILARITY_BACKEND_URL ?? DEFAULT_ARCFACE_BACKEND,
  timeoutMs = 15_000,
  attempts = 2,
}: ScoreHandlerOptions = {}) {
  return async function score(request: NextRequest) {
    const contentType = (request.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      return errorResponse("Escolha uma imagem JPEG, PNG ou WebP válida.", 400);
    }

    const body = await request.arrayBuffer();
    if (body.byteLength === 0) return errorResponse("A imagem está vazia.", 400);
    if (body.byteLength > MAX_UPLOAD_BYTES) {
      return errorResponse("A imagem excede o limite de 5 MB. Escolha uma versão menor.", 413);
    }

    const backendUrl = getBackendUrl()?.replace(/\/$/u, "");
    if (!backendUrl) {
      return errorResponse("O ArcFace está indisponível porque o backend não foi configurado.", 503);
    }

    let timedOut = false;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetchImpl(`${backendUrl}/api/score`, {
          method: "POST",
          headers: { "Content-Type": contentType },
          body,
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status < 500 && response.status !== 429) {
            const payload = await response.text();
            return new NextResponse(payload, {
              status: response.status,
              headers: {
                "Cache-Control": "no-store",
                "Content-Type": response.headers.get("Content-Type") ?? "application/json; charset=utf-8",
              },
            });
          }
          continue;
        }

        const payload: unknown = await response.json();
        if (!isPublicScoreResponse(payload)) {
          return errorResponse("O ArcFace retornou um resultado inválido.", 502);
        }
        return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
      } catch (error) {
        timedOut ||= error instanceof Error && error.name === "AbortError";
      } finally {
        clearTimeout(timeout);
      }
    }

    return errorResponse(
      timedOut ? "O ArcFace excedeu o tempo de resposta. Tente novamente." : "A análise ArcFace está temporariamente indisponível.",
      timedOut ? 504 : 503,
    );
  };
}
