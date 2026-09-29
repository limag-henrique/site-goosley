export type KeyboardEventLike = {
  key?: string;
  code?: string;
  keyCode?: number;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
};

export const ANTI_SCREENSHOT_MESSAGE =
  "Ambiente seguro e confidencial. A captura, gravação ou compartilhamento de tela desta aplicação é estritamente proibida.";

export const ANTI_SCREENSHOT_WATERMARK_TEXT =
  "CAPTURA DE TELA PROIBIDA · DADOS PROTEGIDOS · GOOSLEY DIGITAL";

export function isScreenshotKey(event: KeyboardEventLike): boolean {
  const key = event.key?.toLowerCase() ?? "";
  const code = event.code?.toLowerCase() ?? "";
  const isPrintScreen = key === "printscreen" || code === "printscreen" || event.keyCode === 44;

  if (isPrintScreen) return true;

  const isCommandOrControl = Boolean(event.ctrlKey || event.metaKey);

  // Windows Snipping Tool (Win+Shift+S), Firefox Screenshot (Ctrl+Shift+S)
  if (isCommandOrControl && event.shiftKey && (key === "s" || code === "keys")) {
    return true;
  }

  // macOS screenshot shortcuts (Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5, Cmd+Shift+6)
  if (event.metaKey && event.shiftKey && ["3", "4", "5", "6", "#", "$", "%"].includes(key)) {
    return true;
  }

  // Print (Ctrl+P / Cmd+P)
  if (isCommandOrControl && (key === "p" || code === "keyp")) {
    return true;
  }

  // Save Page (Ctrl+S / Cmd+S)
  if (isCommandOrControl && !event.shiftKey && (key === "s" || code === "keys")) {
    return true;
  }

  // Inspect / DevTools (F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J, Ctrl+U)
  if (key === "f12" || code === "f12") {
    return true;
  }
  if (isCommandOrControl && event.shiftKey && ["i", "c", "j"].includes(key)) {
    return true;
  }
  if (isCommandOrControl && (key === "u" || code === "keyu")) {
    return true;
  }

  return false;
}

export async function attemptWipeClipboard(clipboardLike?: {
  writeText?: (text: string) => Promise<void>;
}): Promise<boolean> {
  if (!clipboardLike?.writeText) return false;
  try {
    await clipboardLike.writeText("Captura de tela proibida por segurança.");
    return true;
  } catch {
    return false;
  }
}
