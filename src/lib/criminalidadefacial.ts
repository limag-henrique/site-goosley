export type PublicMatch = {
  match_id: number;
  subject_id: string;
  cosine: number;
  relative_percent: number;
  image_url: string;
};

export type PublicScoreResponse = {
  ok: boolean;
  aggregate_relative_percent: number;
  best_cosine: number;
  best_relative_percent?: number;
  distinctiveness_percent?: number;
  estimated_false_match_rate?: number | null;
  match_strength?: string;
  warnings?: string[];
  top_matches: PublicMatch[];
};

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const actionableErrors: Record<number, string> = {
  400: "Escolha uma imagem JPEG, PNG ou WebP válida.",
  413: "A imagem excede o limite de 5 MB. Escolha uma versão menor.",
  422: "Não foi possível localizar um rosto utilizável nesta imagem.",
  429: "Muitas tentativas. Aguarde um minuto e tente novamente.",
  503: "A análise está temporariamente indisponível. Tente novamente em instantes.",
};

export function getFacialApiOrigin(): string {
  return (process.env.NEXT_PUBLIC_FACIAL_SIMILARITY_API_ORIGIN ?? "").replace(/\/$/, "");
}

/**
 * Returns the URL for a reference image.
 * Images are served from /references/ in the public directory (local static files).
 * The `image_url` from the API typically contains the r2_key like "references/000123.webp".
 */
export function referenceImageUrl(path: string): string {
  // If path already starts with "/references/", return it as-is
  if (path.startsWith("/references/")) return path;
  // If path is like "references/000123.webp", prepend slash
  if (path.startsWith("references/")) return `/${path}`;
  // Otherwise assume it's just a filename like "000123.webp"
  return `/references/${path}`;
}

export async function scorePhoto(
  file: Blob,
  fetchImpl: FetchLike = fetch,
  apiOrigin = getFacialApiOrigin(),
): Promise<PublicScoreResponse> {
  if (!apiOrigin) throw new Error("A análise ainda não foi configurada neste ambiente.");
  if (!file.type || !["image/jpeg", "image/png", "image/webp"].includes(file.type.toLowerCase())) {
    throw new Error("Escolha uma imagem JPEG, PNG ou WebP válida.");
  }

  const response = await fetchImpl(new Request(`${apiOrigin}/api/score`, {
    method: "POST",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  }));
  if (!response.ok) throw new Error(actionableErrors[response.status] ?? "Não foi possível concluir a análise. Tente novamente.");

  const payload = await response.json() as PublicScoreResponse;
  if (!payload.ok || !Number.isFinite(payload.aggregate_relative_percent) || !Number.isFinite(payload.best_cosine)) {
    throw new Error("Não foi possível concluir a análise. Tente novamente.");
  }
  return payload;
}
