import assert from "node:assert/strict";
import test from "node:test";

import manifest from "../src/app/manifest";
import { requestImmersiveFullscreen } from "../src/lib/immersive-mode";
import { isImmersiveRoute } from "../src/lib/public-chrome";

test("manifest abre criminalidade facial como PWA fullscreen", () => {
  const value = manifest();
  assert.equal(value.start_url, "/criminalidadefacial");
  assert.equal(value.scope, "/criminalidadefacial");
  assert.equal(value.display, "fullscreen");
  assert.equal(value.background_color, "#000000");
});

test("criminalidade facial não renderiza o chrome comercial", () => {
  assert.equal(isImmersiveRoute("/criminalidadefacial"), true);
  assert.equal(isImmersiveRoute("/criminalidadefacial/resultado"), true);
  assert.equal(isImmersiveRoute("/portfolio"), false);
});

test("fullscreen é solicitado silenciosamente e rejeições do navegador são absorvidas", async () => {
  let calls = 0;
  const accepted = await requestImmersiveFullscreen({
    fullscreenElement: null,
    documentElement: { requestFullscreen: async () => { calls += 1; } },
  });
  assert.equal(accepted, true);
  assert.equal(calls, 1);

  const rejected = await requestImmersiveFullscreen({
    fullscreenElement: null,
    documentElement: { requestFullscreen: async () => { throw new Error("gesture required"); } },
  });
  assert.equal(rejected, false);
});
