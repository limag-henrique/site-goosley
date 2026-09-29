import { NextRequest, NextResponse } from "next/server";

import { verifyBirthYear } from "@/server/criminalidadefacial/people";

export const runtime = "nodejs";

const responseHeaders = { "Cache-Control": "no-store" };

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Envie uma confirmação válida." }, { status: 400, headers: responseHeaders });
  }

  const payload = typeof body === "object" && body !== null ? body as Record<string, unknown> : {};
  if (typeof payload.personId !== "string" || !Number.isInteger(payload.year)) {
    return NextResponse.json({ ok: false, error: "Selecione um perfil e um ano válidos." }, { status: 400, headers: responseHeaders });
  }

  const result = verifyBirthYear(payload.personId, payload.year as number);
  if (result.status === "not-found") {
    return NextResponse.json({ ok: false, error: "Perfil não encontrado." }, { status: 404, headers: responseHeaders });
  }
  if (result.status === "missing-birth-year") {
    return NextResponse.json(
      { ok: false, error: "Este perfil não possui ano de nascimento cadastrado." },
      { status: 409, headers: responseHeaders },
    );
  }
  if (result.status === "wrong-year") {
    return NextResponse.json(
      { ok: false, error: "O ano selecionado não corresponde ao perfil." },
      { status: 403, headers: responseHeaders },
    );
  }

  return NextResponse.json({ ok: true, profile: result.profile }, { headers: responseHeaders });
}
