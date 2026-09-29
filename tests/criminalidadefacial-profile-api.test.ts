import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";

import { POST as challengeProfile } from "../src/app/api/criminalidadefacial/profile/challenge/route";
import { POST as verifyProfile } from "../src/app/api/criminalidadefacial/profile/verify/route";
import { getBirthYearChallenge, getPeopleIndex } from "../src/server/criminalidadefacial/people";

function jsonRequest(path: string, body: unknown) {
  return new NextRequest(`http://localhost:3000${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

test("POST challenge retorna somente as três opções do perfil", async () => {
  const person = getPeopleIndex().find((entry) => entry.hasBirthYear);
  assert.ok(person);
  const response = await challengeProfile(jsonRequest("/api/criminalidadefacial/profile/challenge", { personId: person.id }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  const payload = await response.json();
  assert.equal(payload.ok, true);
  assert.equal(payload.years.length, 3);
  assert.equal("birthYear" in payload, false);
});

test("POST challenge diferencia perfil desconhecido e perfil sem nascimento", async () => {
  assert.equal((await challengeProfile(jsonRequest("/api/criminalidadefacial/profile/challenge", { personId: "inexistente" }))).status, 404);
  const person = getPeopleIndex().find((entry) => !entry.hasBirthYear);
  assert.ok(person);
  assert.equal((await challengeProfile(jsonRequest("/api/criminalidadefacial/profile/challenge", { personId: person.id }))).status, 409);
});

test("POST verify recusa ano incorreto e retorna o perfil filtrado no ano correto", async () => {
  const person = getPeopleIndex().find((entry) => entry.hasBirthYear);
  assert.ok(person);
  const challenge = getBirthYearChallenge(person.id);
  assert.equal(challenge.status, "ready");
  if (challenge.status !== "ready") return;
  const wrong = await verifyProfile(jsonRequest("/api/criminalidadefacial/profile/verify", { personId: person.id, year: challenge.birthYear + 1 }));
  assert.equal(wrong.status, 403);
  const correct = await verifyProfile(jsonRequest("/api/criminalidadefacial/profile/verify", { personId: person.id, year: challenge.birthYear }));
  assert.equal(correct.status, 200);
  assert.equal(correct.headers.get("Cache-Control"), "no-store");
  const payload = await correct.json();
  assert.equal(payload.profile.fullName, person.fullName);
  assert.ok(payload.profile.sections.length > 0);
});

test("rotas de perfil rejeitam JSON malformado", async () => {
  const response = await challengeProfile(new NextRequest("http://localhost:3000/api/criminalidadefacial/profile/challenge", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{",
  }));
  assert.equal(response.status, 400);
});
