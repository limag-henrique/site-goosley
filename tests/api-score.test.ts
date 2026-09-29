import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { createScoreHandler } from "../src/lib/score-handler";

const activeOptions = { isDeactivated: () => false };

test("POST /api/score rejects non-image Content-Type", async () => {
  const handler = createScoreHandler(activeOptions);
  const req = new NextRequest("http://localhost:3000/api/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  const res = await handler(req);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.ok, false);
});

test("POST /api/score returns a deterministic local result without ArcFace", async () => {
  const handler = createScoreHandler({ ...activeOptions, getBackendUrl: () => undefined });
  const dummyJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  const req = new NextRequest("http://localhost:3000/api/score", {
    method: "POST",
    headers: { "Content-Type": "image/jpeg" },
    body: dummyJpeg,
  });

  const res = await handler(req);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.analysis_source, "local-fallback");
  assert.equal(data.top_matches.length, 5);
  assert.match(data.warnings[0], /contingência|ArcFace/i);

  const repeated = await handler(new NextRequest("http://localhost:3000/api/score", {
    method: "POST",
    headers: { "Content-Type": "image/jpeg" },
    body: dummyJpeg,
  }));
  assert.deepEqual(await repeated.json(), data);
});

test("POST /api/score returns only a valid ArcFace response", async () => {
  const handler = createScoreHandler({
    ...activeOptions,
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

test("POST /api/score retries ArcFace once and then returns a local result", async () => {
  let calls = 0;
  const handler = createScoreHandler({
    ...activeOptions,
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
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.ok, true);
  assert.equal(payload.analysis_source, "local-fallback");
});
