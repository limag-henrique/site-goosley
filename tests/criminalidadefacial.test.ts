import assert from "node:assert/strict";
import test from "node:test";

import { scorePhoto } from "../src/lib/criminalidadefacial";

const photo = new Blob(["jpeg"], { type: "image/jpeg" });

test("scorePhoto sends an image body to the configured API and projects score fields", async () => {
  let request: Request | undefined;
  const result = await scorePhoto(
    photo,
    "turnstile-token",
    async (input) => {
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
  assert.equal(request?.headers.get("CF-Turnstile-Response"), "turnstile-token");
  assert.equal(request?.headers.get("Content-Type"), "image/jpeg");
});

test("scorePhoto converts HTTP 429 and 503 into Portuguese actionable errors", async () => {
  await assert.rejects(
    () => scorePhoto(photo, "token", async () => new Response("{}", { status: 429 }), "https://facial.example.test"),
    /Muitas tentativas/,
  );
  await assert.rejects(
    () => scorePhoto(photo, "token", async () => new Response("{}", { status: 503 }), "https://facial.example.test"),
    /temporariamente indisponível/,
  );
});
