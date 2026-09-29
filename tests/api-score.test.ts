import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { POST } from "../src/app/api/score/route";

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

test("POST /api/score returns valid score and top matches for valid JPEG", async () => {
  const dummyJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  const req = new NextRequest("http://localhost:3000/api/score", {
    method: "POST",
    headers: { "Content-Type": "image/jpeg" },
    body: dummyJpeg,
  });

  const res = await POST(req);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(typeof data.aggregate_relative_percent, "number");
  assert.equal(typeof data.best_cosine, "number");
  assert.equal(Array.isArray(data.top_matches), true);
  assert.equal(data.top_matches.length, 5);
  assert.ok(data.top_matches[0].image_url.startsWith("/references/"));
  assert.equal(typeof data.top_matches[0].cosine, "number");
});
