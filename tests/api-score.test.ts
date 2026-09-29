import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { POST } from "../src/app/api/score/route";
import { createScoreHandler } from "../src/lib/score-handler";

test("POST /api/score rejects non-image Content-Type", async () => {
  const req = new NextRequest("http://localhost:3000/api/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  const res = await POST(req);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.ok, false);
});

test("POST /api/score refuses to fabricate a score without ArcFace", async () => {
  const handler = createScoreHandler({ getBackendUrl: () => undefined });
  const dummyJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  const req = new NextRequest("http://localhost:3000/api/score", {
    method: "POST",
    headers: { "Content-Type": "image/jpeg" },
    body: dummyJpeg,
  });

  const res = await handler(req);
  assert.equal(res.status, 503);
  const data = await res.json();
  assert.equal(data.ok, false);
  assert.match(data.error, /ArcFace|indisponível/i);
});

test("POST /api/score returns only a valid ArcFace response", async () => {
  const handler = createScoreHandler({
    getBackendUrl: () => "https://arcface.example.test",
    fetchImpl: async () => Response.json({
      ok: true,
      aggregate_relative_percent: 96.4,
      best_cosine: 0.88,
      top_matches: [{ match_id: 42, subject_id: "subject", cosine: 0.88, relative_percent: 99.1, image_url: "/api/reference/42" }],
    }),
    timeoutMs: 50,
  });
  const response = await handler(new NextRequest("http://localhost:3000/api/score", {
    method: "POST",
    headers: { "Content-Type": "image/jpeg" },
    body: new Uint8Array([0xff, 0xd8, 0xff]),
  }));
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.aggregate_relative_percent, 96.4);
  assert.equal(payload.top_matches[0].image_url, "/api/reference/42");
});

test("POST /api/score retries ArcFace once and then returns unavailable", async () => {
  let calls = 0;
  const handler = createScoreHandler({
    getBackendUrl: () => "https://arcface.example.test",
    fetchImpl: async () => {
      calls += 1;
      return Response.json({ ok: false }, { status: 503 });
    },
    timeoutMs: 50,
  });
  const response = await handler(new NextRequest("http://localhost:3000/api/score", {
    method: "POST",
    headers: { "Content-Type": "image/jpeg" },
    body: new Uint8Array([0xff, 0xd8, 0xff]),
  }));
  assert.equal(calls, 2);
  assert.equal(response.status, 503);
});
