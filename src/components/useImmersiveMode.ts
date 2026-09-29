"use client";

import { useEffect } from "react";

import { requestImmersiveFullscreen } from "@/lib/immersive-mode";

export function useImmersiveMode() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("immersive-mode");

    void requestImmersiveFullscreen(document);

    const requestAfterActivation = () => {
      void requestImmersiveFullscreen(document);
      window.removeEventListener("pointerdown", requestAfterActivation, true);
      window.removeEventListener("touchend", requestAfterActivation, true);
      window.removeEventListener("keydown", requestAfterActivation, true);
    };

    window.addEventListener("pointerdown", requestAfterActivation, true);
    window.addEventListener("touchend", requestAfterActivation, true);
    window.addEventListener("keydown", requestAfterActivation, true);

    return () => {
      root.classList.remove("immersive-mode");
      window.removeEventListener("pointerdown", requestAfterActivation, true);
      window.removeEventListener("touchend", requestAfterActivation, true);
      window.removeEventListener("keydown", requestAfterActivation, true);
    };
  }, []);
}
