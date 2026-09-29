import type { PersonProfileResult } from "@/lib/criminalidadefacial-profile";

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

const acceptedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const actionableErrors: Record<number, string> = {
  400: "Escolha uma imagem JPEG, PNG ou WebP válida.",
  413: "A imagem excede o limite de 5 MB. Escolha uma versão menor.",
  422: "Não foi possível localizar um rosto utilizável nesta imagem.",
  429: "Muitas tentativas. Aguarde um minuto e tente novamente.",
  503: "A análise está temporariamente indisponível. Tente novamente em instantes.",
  504: "A análise demorou mais do que o esperado. Tente novamente em instantes.",
};

export function getFacialApiOrigin(): string {
  return (process.env.NEXT_PUBLIC_FACIAL_SIMILARITY_API_ORIGIN ?? "").replace(/\/$/, "");
}

function localRequestUrl(path: string): string {
  return typeof window === "undefined" ? `http://localhost${path}` : path;
}

async function errorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const payload = await response.json() as { error?: unknown };
    return typeof payload.error === "string" && payload.error ? payload.error : fallback;
  } catch {
    return fallback;
  }
}

export async function requestBirthYearChallenge(
  personId: string,
  fetchImpl: FetchLike = fetch,
): Promise<number[]> {
  const response = await fetchImpl(new Request(localRequestUrl("/api/criminalidadefacial/profile/challenge"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ personId }),
  }));
  if (!response.ok) throw new Error(await errorMessage(response, "Não foi possível carregar os anos deste perfil."));
  const payload = await response.json() as { ok?: boolean; years?: unknown };
  if (payload.ok !== true || !Array.isArray(payload.years) || !payload.years.every(Number.isInteger)) {
    throw new Error("Não foi possível carregar os anos deste perfil.");
  }
  return payload.years as number[];
}

export async function verifyPersonBirthYear(
  personId: string,
  year: number,
  fetchImpl: FetchLike = fetch,
): Promise<PersonProfileResult> {
  const response = await fetchImpl(new Request(localRequestUrl("/api/criminalidadefacial/profile/verify"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ personId, year }),
  }));
  if (!response.ok) throw new Error(await errorMessage(response, "Não foi possível confirmar o perfil."));
  const payload = await response.json() as { ok?: boolean; profile?: PersonProfileResult };
  if (payload.ok !== true || !payload.profile) throw new Error("Não foi possível confirmar o perfil.");
  return payload.profile;
}

export function validatePhoto(file: Blob): string | undefined {
  if (!file.type || !acceptedPhotoTypes.has(file.type.toLowerCase())) {
    return "Escolha uma imagem JPEG, PNG ou WebP válida.";
  }
  if (file.size > 5 * 1024 * 1024) {
    return "A imagem excede o limite de 5 MB. Escolha uma versão menor.";
  }
  return undefined;
}

/**
 * Returns the URL for a reference image.
 * Images are served from /references/ in the public directory (local static files).
 * The `image_url` from the API typically contains the r2_key like "references/000123.webp".
 */
export function referenceImageUrl(path: string, apiOrigin = getFacialApiOrigin()): string {
  if (/^https?:\/\//u.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return apiOrigin ? `${apiOrigin}${normalizedPath}` : normalizedPath;
}

export async function scorePhoto(
  file: Blob,
  fetchImpl: FetchLike = fetch,
  apiOrigin = getFacialApiOrigin(),
): Promise<PublicScoreResponse> {
  const validationError = validatePhoto(file);
  if (validationError) throw new Error(validationError);

  const endpoint = apiOrigin ? `${apiOrigin}/api/score` : "/api/score";
  const requestUrl = endpoint.startsWith("http://") || endpoint.startsWith("https://")
    ? endpoint
    : typeof window !== "undefined"
      ? endpoint
      : `http://localhost${endpoint}`;

  const response = await fetchImpl(new Request(requestUrl, {
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
