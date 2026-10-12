"use client";

import { useEffect, useState, Suspense } from "react";
import Lenis from "lenis";
import { MotionConfig } from "framer-motion";
import { usePathname } from "next/navigation";

function RouteChangeListener({ lenis }: { lenis: Lenis | null }) {
  const pathname = usePathname();


  useEffect(() => {
    window.scrollTo(0, 0);
    if (lenis) {
      requestAnimationFrame(() => {
        lenis.scrollTo(0, { immediate: true });
      });
    }
  }, [pathname, lenis]);

  return null;
}

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    document.body.classList.add("is-loaded");
    if (window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
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

    let animationFrame: number;
    function raf(time: number) {
      l.raf(time);
      animationFrame = requestAnimationFrame(raf);
    }

    animationFrame = requestAnimationFrame(raf);

    // Álgebra Booleana: indicamos que o carregamento terminou
    document.body.classList.add("is-loaded");

    return () => {
      cancelAnimationFrame(stateFrame);
      cancelAnimationFrame(animationFrame);
      l.destroy();
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <Suspense fallback={null}>
        <RouteChangeListener lenis={lenis} />
      </Suspense>
      {children}
    </MotionConfig>
  );
}
