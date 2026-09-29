import assert from "node:assert/strict";
import test from "node:test";

import {
  referenceImageUrl,
  requestBirthYearChallenge,
  scorePhoto,
  validatePhoto,
  verifyPersonBirthYear,
} from "../src/lib/criminalidadefacial";

const photo = new Blob(["jpeg"], { type: "image/jpeg" });

test("scorePhoto sends an image body to the configured API and projects score fields", async () => {
  let request: Request | undefined;
  const result = await scorePhoto(
    photo,
    async (input: RequestInfo | URL) => {
      request = input instanceof Request ? input : new Request(input);
      return Response.json({
        ok: true,
        aggregate_relative_percent: 96.4,
        best_cosine: 0.88,
        top_matches: [],
      });
    },
    "https://facial.example.test",
  );

  assert.equal(result.aggregate_relative_percent, 96.4);
  assert.equal(request?.url, "https://facial.example.test/api/score");
  assert.equal(request?.headers.get("Content-Type"), "image/jpeg");
});

test("scorePhoto converts HTTP 429 and 503 into Portuguese actionable errors", async () => {
  await assert.rejects(
    () => scorePhoto(photo, async () => new Response("{}", { status: 429 }), "https://facial.example.test"),
    /Muitas tentativas/,
  );
  await assert.rejects(
    () => scorePhoto(photo, async () => new Response("{}", { status: 503 }), "https://facial.example.test"),
    /temporariamente indisponível/,
  );
});

test("scorePhoto defaults to relative /api/score when apiOrigin is empty", async () => {
  let requestUrl = "";
  await scorePhoto(
    photo,
    async (input: RequestInfo | URL) => {
      requestUrl = input instanceof Request ? input.url : String(input);
      return Response.json({
        ok: true,
        aggregate_relative_percent: 85.0,
        best_cosine: 0.75,
        top_matches: [],
      });
    },
    "",
  );

  assert.equal(new URL(requestUrl).pathname, "/api/score");
});

test("referenceImageUrl keeps ArcFace reference paths on the configured API", () => {
  assert.equal(
    referenceImageUrl("/api/reference/42", "https://facial.example.test"),
    "https://facial.example.test/api/reference/42",
  );
  assert.equal(referenceImageUrl("https://cdn.example.test/42.webp"), "https://cdn.example.test/42.webp");
});

test("profile clients send challenge and verification payloads", async () => {
  const requests: Request[] = [];
  const fetchImpl = async (input: RequestInfo | URL) => {
    const request = input instanceof Request ? input : new Request(input);
    requests.push(request);
    if (request.url.endsWith("/challenge")) return Response.json({ ok: true, years: [1999, 2000, 2001] });
    return Response.json({ ok: true, profile: { id: "pessoa-1", fullName: "Pessoa Teste", sections: [] } });
  };

  assert.deepEqual(await requestBirthYearChallenge("pessoa-1", fetchImpl), [1999, 2000, 2001]);
  const profile = await verifyPersonBirthYear("pessoa-1", 2000, fetchImpl);
  assert.equal(profile.fullName, "Pessoa Teste");
  assert.deepEqual(await requests[0].json(), { personId: "pessoa-1" });
  assert.deepEqual(await requests[1].json(), { personId: "pessoa-1", year: 2000 });
});

test("profile client surfaces a wrong-year message", async () => {
  await assert.rejects(
    () => verifyPersonBirthYear("pessoa-1", 2001, async () => Response.json(
      { ok: false, error: "O ano selecionado não corresponde ao perfil." },
      { status: 403 },
    )),
    /não corresponde/,
  );
});

test("validatePhoto accepts supported images and rejects invalid files", () => {
  assert.equal(validatePhoto(new Blob(["jpeg"], { type: "image/jpeg" })), undefined);
  assert.match(validatePhoto(new Blob(["text"], { type: "text/plain" })) ?? "", /JPEG, PNG ou WebP/);
  assert.match(validatePhoto(new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: "image/png" })) ?? "", /5 MB/);
});
