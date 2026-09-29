export type FullscreenDocument = {
  fullscreenElement?: unknown;
  webkitFullscreenElement?: unknown;
  mozFullScreenElement?: unknown;
  msFullscreenElement?: unknown;
  documentElement?: {
    requestFullscreen?: (options?: FullscreenOptions) => Promise<void>;
    webkitRequestFullscreen?: (options?: unknown) => Promise<void> | void;
    webkitRequestFullScreen?: (options?: unknown) => Promise<void> | void;
    mozRequestFullScreen?: (options?: unknown) => Promise<void> | void;
    msRequestFullscreen?: (options?: unknown) => Promise<void> | void;
  };
  exitFullscreen?: () => Promise<void>;
  webkitExitFullscreen?: () => Promise<void> | void;
  mozCancelFullScreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
};

export function isImmersiveFullscreen(documentLike?: FullscreenDocument | null): boolean {
  if (!documentLike) return false;
  return Boolean(
    documentLike.fullscreenElement ||
    documentLike.webkitFullscreenElement ||
    documentLike.mozFullScreenElement ||
    documentLike.msFullscreenElement
  );
}

export function isImmersiveFullscreenSupported(documentLike?: FullscreenDocument | null): boolean {
  if (!documentLike?.documentElement) return false;
  const docEl = documentLike.documentElement;
  return Boolean(
    docEl.requestFullscreen ||
    docEl.webkitRequestFullscreen ||
    docEl.webkitRequestFullScreen ||
    docEl.mozRequestFullScreen ||
    docEl.msRequestFullscreen
  );
}

export async function requestImmersiveFullscreen(
  documentLike?: FullscreenDocument | null,
  options: FullscreenOptions = { navigationUI: "hide" }
): Promise<boolean> {
  if (!documentLike?.documentElement) return false;
  if (isImmersiveFullscreen(documentLike)) return true;

  const docEl = documentLike.documentElement;
  const requestFn =
    docEl.requestFullscreen ||
    docEl.webkitRequestFullscreen ||
    docEl.webkitRequestFullScreen ||
    docEl.mozRequestFullScreen ||
    docEl.msRequestFullscreen;

  if (!requestFn) return false;

  try {
    const result = (requestFn as (opts?: unknown) => Promise<void> | void).call(docEl, options);
    if (result && typeof (result as Promise<void>).then === "function") {
      await result;
    }
    return true;
  } catch {
    return false;
  }
}

export async function exitImmersiveFullscreen(documentLike?: FullscreenDocument | null): Promise<boolean> {
  if (!documentLike) return false;
  if (!isImmersiveFullscreen(documentLike)) return true;

  const exitFn =
    documentLike.exitFullscreen ||
    documentLike.webkitExitFullscreen ||
    documentLike.mozCancelFullScreen ||
    documentLike.msExitFullscreen;

  if (!exitFn) return false;

  try {
    const result = (exitFn as () => Promise<void> | void).call(documentLike);
    if (result && typeof (result as Promise<void>).then === "function") {
      await result;
    }
    return true;
  } catch {
    return false;
  }
}
