"use client";

import { useEffect, useState } from "react";
import Lenis from "lenis";
import { usePathname, useSearchParams } from "next/navigation";

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const l = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    setLenis(l);

    function raf(time: number) {
      l.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Álgebra Booleana: indicamos que o carregamento terminou
    document.body.classList.add("is-loaded");

    return () => {
      l.destroy();
      setLenis(null);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (lenis) {
      // Small delay to ensure React has rendered the new page content
      requestAnimationFrame(() => {
        lenis.scrollTo(0, { immediate: true });
      });
    }
  }, [pathname, searchParams, lenis]);

  return <>{children}</>;
}
