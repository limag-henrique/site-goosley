import assert from "node:assert/strict";
import test from "node:test";

import { createReferenceHandler } from "../src/lib/reference-handler";

test("GET /api/reference proxies an ArcFace reference image", async () => {
  const handler = createReferenceHandler({
    getBackendUrl: () => "https://arcface.example.test",
    fetchImpl: async () => new Response(new Uint8Array([1, 2, 3]), { headers: { "Content-Type": "image/webp" } }),
    timeoutMs: 50,
  });
  const response = await handler(new Request("http://localhost/api/reference/42"), { params: Promise.resolve({ matchId: "42" }) });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Content-Type"), "image/webp");
  assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [1, 2, 3]);
});

test("GET /api/reference rejects invalid ids and missing ArcFace configuration", async () => {
  const handler = createReferenceHandler({ getBackendUrl: () => undefined, timeoutMs: 50 });
  assert.equal((await handler(new Request("http://localhost/api/reference/x"), { params: Promise.resolve({ matchId: "x" }) })).status, 400);
  assert.equal((await handler(new Request("http://localhost/api/reference/42"), { params: Promise.resolve({ matchId: "42" }) })).status, 503);
});
