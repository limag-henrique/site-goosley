import assert from "node:assert/strict";
import test from "node:test";

import {
  attemptWipeClipboard,
  isScreenshotKey,
} from "../src/lib/anti-screenshot";

test("isScreenshotKey detecta a tecla PrintScreen", () => {
  assert.equal(isScreenshotKey({ key: "PrintScreen" }), true);
  assert.equal(isScreenshotKey({ code: "PrintScreen" }), true);
  assert.equal(isScreenshotKey({ keyCode: 44 }), true);
  assert.equal(isScreenshotKey({ key: "printscreen" }), true);
});

test("isScreenshotKey detecta atalhos de captura no Windows e Linux (Win/Ctrl + Shift + S)", () => {
  assert.equal(isScreenshotKey({ metaKey: true, shiftKey: true, key: "s" }), true);
  assert.equal(isScreenshotKey({ ctrlKey: true, shiftKey: true, key: "S" }), true);
  assert.equal(isScreenshotKey({ ctrlKey: true, shiftKey: true, code: "KeyS" }), true);
});

test("isScreenshotKey detecta atalhos de captura no macOS (Cmd + Shift + 3/4/5)", () => {
  assert.equal(isScreenshotKey({ metaKey: true, shiftKey: true, key: "3" }), true);
  assert.equal(isScreenshotKey({ metaKey: true, shiftKey: true, key: "4" }), true);
  assert.equal(isScreenshotKey({ metaKey: true, shiftKey: true, key: "5" }), true);
});

test("isScreenshotKey detecta atalhos de impressão, salvar página e DevTools", () => {
  assert.equal(isScreenshotKey({ ctrlKey: true, key: "p" }), true);
  assert.equal(isScreenshotKey({ metaKey: true, key: "P" }), true);
  assert.equal(isScreenshotKey({ ctrlKey: true, key: "s" }), true);
  assert.equal(isScreenshotKey({ key: "F12" }), true);
  assert.equal(isScreenshotKey({ ctrlKey: true, shiftKey: true, key: "i" }), true);
  assert.equal(isScreenshotKey({ ctrlKey: true, key: "u" }), true);
});

test("isScreenshotKey não bloqueia digitação comum", () => {
  assert.equal(isScreenshotKey({ key: "a" }), false);
  assert.equal(isScreenshotKey({ key: " " }), false);
  assert.equal(isScreenshotKey({ key: "Enter" }), false);
  assert.equal(isScreenshotKey({ key: "Backspace" }), false);
  assert.equal(isScreenshotKey({ shiftKey: true, key: "H" }), false);
});

test("attemptWipeClipboard sobrescreve a área de transferência", async () => {
  let writtenText = "";
  const mockClipboard = {
    writeText: async (text: string) => {
      writtenText = text;
    },
  };

  const success = await attemptWipeClipboard(mockClipboard);
  assert.equal(success, true);
  assert.match(writtenText, /proibida/i);

  const failed = await attemptWipeClipboard(undefined);
  assert.equal(failed, false);
});
