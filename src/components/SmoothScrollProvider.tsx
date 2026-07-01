"use client";

import { useEffect, useState, Suspense } from "react";
import Lenis from "lenis";
import { usePathname, useSearchParams } from "next/navigation";

function RouteChangeListener({ lenis }: { lenis: Lenis | null }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (lenis) {
      requestAnimationFrame(() => {
        lenis.scrollTo(0, { immediate: true });
      });
    }
  }, [pathname, searchParams, lenis]);

  return null;
}

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
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

    const stateFrame = requestAnimationFrame(() => {
      setLenis(l);
    });

    function raf(time: number) {
      l.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Álgebra Booleana: indicamos que o carregamento terminou
    document.body.classList.add("is-loaded");

    return () => {
      cancelAnimationFrame(stateFrame);
      l.destroy();
    };
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <RouteChangeListener lenis={lenis} />
      </Suspense>
      {children}
    </>
  );
}
