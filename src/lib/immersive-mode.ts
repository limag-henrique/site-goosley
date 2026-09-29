type FullscreenDocument = {
  fullscreenElement: unknown;
  documentElement: {
    requestFullscreen?: () => Promise<void>;
  };
};

export async function requestImmersiveFullscreen(documentLike: FullscreenDocument): Promise<boolean> {
  if (documentLike.fullscreenElement) return true;
  const requestFullscreen = documentLike.documentElement.requestFullscreen;
  if (!requestFullscreen) return false;

  try {
    await requestFullscreen.call(documentLike.documentElement);
    return true;
  } catch {
    return false;
  }
}
