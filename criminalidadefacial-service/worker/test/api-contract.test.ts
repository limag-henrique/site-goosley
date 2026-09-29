import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../src/index";

const release = {
  entries: [{ match_id: 7, r2_key: "references/000007.webp" }],
};

test("rejects an untrusted origin before forwarding a score request", async () => {
  let containerCalls = 0;
  const response = await handleRequest(
    new Request("https://api.example.test/api/score", {
      method: "POST",
      headers: { Origin: "https://untrusted.example", "Content-Type": "image/jpeg" },
      body: "jpeg",
    }),
    {
      ALLOWED_ORIGIN: "https://goosley.com.br",
      TURNSTILE_SECRET_KEY: "secret",
      RATE_LIMITER: { limit: async () => ({ success: true }) },
      FACE_SIMILARITY_CONTAINER: { fetch: async () => { containerCalls += 1; return new Response("{}") } },
      GALLERY_RELEASE: { get: async () => new Response(JSON.stringify(release)) },
      REFERENCES: { get: async () => null },
      verifyTurnstile: async () => true,
    },
  );

  assert.equal(response.status, 403);
  assert.equal(containerCalls, 0);
});

test("rejects an invalid Turnstile result before forwarding a score request", async () => {
  let containerCalls = 0;
  const response = await handleRequest(
    new Request("https://api.example.test/api/score", {
      method: "POST",
      headers: { Origin: "https://goosley.com.br", "Content-Type": "image/jpeg", "CF-Turnstile-Response": "invalid" },
      body: "jpeg",
    }),
    {
      ALLOWED_ORIGIN: "https://goosley.com.br",
      TURNSTILE_SECRET_KEY: "secret",
      RATE_LIMITER: { limit: async () => ({ success: true }) },
      FACE_SIMILARITY_CONTAINER: { fetch: async () => { containerCalls += 1; return new Response("{}") } },
      GALLERY_RELEASE: { get: async () => new Response(JSON.stringify(release)) },
      REFERENCES: { get: async () => null },
      verifyTurnstile: async () => false,
    },
  );

  assert.equal(response.status, 403);
  assert.equal(containerCalls, 0);
});

test("rejects a successful Turnstile response with an unexpected action", async () => {
  let containerCalls = 0;
  const response = await handleRequest(
    new Request("https://api.example.test/api/score", {
      method: "POST",
      headers: { Origin: "https://goosley.com.br", "Content-Type": "image/jpeg", "CF-Turnstile-Response": "token" },
      body: "jpeg",
    }),
    {
      ALLOWED_ORIGIN: "https://goosley.com.br",
      TURNSTILE_SECRET_KEY: "secret",
      RATE_LIMITER: { limit: async () => ({ success: true }) },
      FACE_SIMILARITY_CONTAINER: { fetch: async () => { containerCalls += 1; return new Response("{}") } },
      GALLERY_RELEASE: { get: async () => new Response(JSON.stringify(release)) },
      REFERENCES: { get: async () => null },
      verifyTurnstile: async () => ({ success: true, action: "unexpected-action", hostname: "goosley.com.br" }),
    },
  );

  assert.equal(response.status, 403);
  assert.equal(containerCalls, 0);
});

test("rejects a successful Turnstile response from an unexpected hostname", async () => {
  let containerCalls = 0;
  const response = await handleRequest(
    new Request("https://api.example.test/api/score", {
      method: "POST",
      headers: { Origin: "https://goosley.com.br", "Content-Type": "image/jpeg", "CF-Turnstile-Response": "token" },
      body: "jpeg",
    }),
    {
      ALLOWED_ORIGIN: "https://goosley.com.br",
      TURNSTILE_SECRET_KEY: "secret",
      RATE_LIMITER: { limit: async () => ({ success: true }) },
      FACE_SIMILARITY_CONTAINER: { fetch: async () => { containerCalls += 1; return new Response("{}") } },
      GALLERY_RELEASE: { get: async () => new Response(JSON.stringify(release)) },
      REFERENCES: { get: async () => null },
      verifyTurnstile: async () => ({ success: true, action: "turnstile-spin-v1", hostname: "other.example" }),
    },
  );

  assert.equal(response.status, 403);
  assert.equal(containerCalls, 0);
});

test("serves only a versioned WebP object for a numeric reference id", async () => {
  const response = await handleRequest(
    new Request("https://api.example.test/api/reference/7", { headers: { Origin: "https://goosley.com.br" } }),
    {
      ALLOWED_ORIGIN: "https://goosley.com.br",
      TURNSTILE_SECRET_KEY: "secret",
      RATE_LIMITER: { limit: async () => ({ success: true }) },
      FACE_SIMILARITY_CONTAINER: { fetch: async () => new Response("{}") },
      GALLERY_RELEASE: { get: async () => new Response(JSON.stringify(release)) },
      REFERENCES: { get: async () => new Response("webp", { headers: { "Content-Type": "image/webp" } }) },
      verifyTurnstile: async () => true,
    },
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Content-Type"), "image/webp");
  assert.match(response.headers.get("Cache-Control") ?? "", /immutable/);
});
