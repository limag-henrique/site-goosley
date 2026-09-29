import assert from "node:assert/strict";
import test from "node:test";

import manifest from "../src/app/manifest";
import {
  exitImmersiveFullscreen,
  isImmersiveFullscreen,
  isImmersiveFullscreenSupported,
  requestImmersiveFullscreen,
} from "../src/lib/immersive-mode";
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

test("isImmersiveFullscreen detecta elementos em fullscreen padrão e webkit", () => {
  assert.equal(isImmersiveFullscreen(null), false);
  assert.equal(isImmersiveFullscreen({ fullscreenElement: null }), false);
  assert.equal(isImmersiveFullscreen({ fullscreenElement: {} }), true);
  assert.equal(isImmersiveFullscreen({ webkitFullscreenElement: {} }), true);
  assert.equal(isImmersiveFullscreen({ mozFullScreenElement: {} }), true);
  assert.equal(isImmersiveFullscreen({ msFullscreenElement: {} }), true);
});

test("isImmersiveFullscreenSupported identifica suporte com prefixos móveis", () => {
  assert.equal(isImmersiveFullscreenSupported(null), false);
  assert.equal(isImmersiveFullscreenSupported({}), false);
  assert.equal(isImmersiveFullscreenSupported({ documentElement: {} }), false);
  assert.equal(isImmersiveFullscreenSupported({ documentElement: { requestFullscreen: async () => {} } }), true);
  assert.equal(isImmersiveFullscreenSupported({ documentElement: { webkitRequestFullscreen: () => {} } }), true);
});

test("requestImmersiveFullscreen suporta prefixo webkit e exitImmersiveFullscreen finaliza", async () => {
  let webkitCalls = 0;
  const doc = {
    fullscreenElement: null,
    documentElement: {
      webkitRequestFullscreen: () => {
        webkitCalls += 1;
      },
    },
  };
  const success = await requestImmersiveFullscreen(doc);
  assert.equal(success, true);
  assert.equal(webkitCalls, 1);

  let exitCalls = 0;
  const activeDoc = {
    fullscreenElement: {},
    exitFullscreen: async () => {
      exitCalls += 1;
    },
  };
  const exited = await exitImmersiveFullscreen(activeDoc);
  assert.equal(exited, true);
  assert.equal(exitCalls, 1);
});
