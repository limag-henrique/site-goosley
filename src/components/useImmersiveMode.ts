"use client";

import { useCallback, useEffect, useState } from "react";

import {
  exitImmersiveFullscreen,
  isImmersiveFullscreen,
  isImmersiveFullscreenSupported,
  requestImmersiveFullscreen,
} from "@/lib/immersive-mode";

export function useImmersiveMode() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.add("immersive-mode");

    const updateStatus = () => {
      setIsFullscreen(isImmersiveFullscreen(document));
      setIsSupported(isImmersiveFullscreenSupported(document));
    };

    updateStatus();

    // Silently attempt initial fullscreen if permitted
    void requestImmersiveFullscreen(document).then((ok) => {
      if (ok) updateStatus();
    });

    // Handle user gestures (click and touchend are valid activation triggers)
    const handleGesture = () => {
      if (!isImmersiveFullscreen(document)) {
        void requestImmersiveFullscreen(document).then((ok) => {
          if (ok) updateStatus();
        });
      }
    };

    window.addEventListener("click", handleGesture, { capture: true, passive: true });
    window.addEventListener("touchend", handleGesture, { capture: true, passive: true });

    const fullscreenEvents = [
      "fullscreenchange",
      "webkitfullscreenchange",
      "mozfullscreenchange",
      "MSFullscreenChange",
    ];
    fullscreenEvents.forEach((evt) => document.addEventListener(evt, updateStatus));

    return () => {
      root.classList.remove("immersive-mode");
      window.removeEventListener("click", handleGesture, true);
      window.removeEventListener("touchend", handleGesture, true);
      fullscreenEvents.forEach((evt) => document.removeEventListener(evt, updateStatus));
    };
  }, []);

  const toggle = useCallback(async () => {
    if (typeof document === "undefined") return false;
    if (isImmersiveFullscreen(document)) {
      const ok = await exitImmersiveFullscreen(document);
      setIsFullscreen(isImmersiveFullscreen(document));
      return ok;
    } else {
      const ok = await requestImmersiveFullscreen(document);
      setIsFullscreen(isImmersiveFullscreen(document));
      return ok;
    }
  }, []);

  const enter = useCallback(async () => {
    if (typeof document === "undefined") return false;
    const ok = await requestImmersiveFullscreen(document);
    setIsFullscreen(isImmersiveFullscreen(document));
    return ok;
  }, []);

  const exit = useCallback(async () => {
    if (typeof document === "undefined") return false;
    const ok = await exitImmersiveFullscreen(document);
    setIsFullscreen(isImmersiveFullscreen(document));
    return ok;
  }, []);

  return {
    isFullscreen,
    isSupported,
    toggle,
    enter,
    exit,
  };
}
