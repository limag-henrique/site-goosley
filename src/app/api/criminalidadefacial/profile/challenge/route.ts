import { NextRequest, NextResponse } from "next/server";

import { getBirthYearChallenge } from "@/server/criminalidadefacial/people";

export const runtime = "nodejs";

const responseHeaders = { "Cache-Control": "no-store" };

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Envie um perfil válido." }, { status: 400, headers: responseHeaders });
  }

  const personId = typeof body === "object" && body !== null && "personId" in body
    ? (body as { personId?: unknown }).personId
    : undefined;
  if (typeof personId !== "string" || !personId.trim()) {
    return NextResponse.json({ ok: false, error: "Selecione um perfil da lista." }, { status: 400, headers: responseHeaders });
  }

  const result = getBirthYearChallenge(personId);
  if (result.status === "not-found") {
    return NextResponse.json({ ok: false, error: "Perfil não encontrado." }, { status: 404, headers: responseHeaders });
  }
  if (result.status === "missing-birth-year") {
    return NextResponse.json(
      { ok: false, error: "Este perfil não possui ano de nascimento cadastrado." },
      { status: 409, headers: responseHeaders },
    );
  }

  return NextResponse.json({ ok: true, years: result.years }, { headers: responseHeaders });
}
