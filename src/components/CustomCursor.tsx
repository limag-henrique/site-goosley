"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 32); // Offset by half of cursor width (64/2)
      cursorY.set(e.clientY - 32);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const shouldBeVisible = !!target.closest("[data-custom-cursor]");
      const shouldBeHovering = !!(target.closest("a") || target.closest("button"));

      setIsVisible(prev => prev !== shouldBeVisible ? shouldBeVisible : prev);
      setIsHovering(prev => prev !== shouldBeHovering ? shouldBeHovering : prev);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY]);

  useEffect(() => {
    if (isVisible) {
      document.body.classList.add("no-cursor");
    } else {
      document.body.classList.remove("no-cursor");
    }
    return () => document.body.classList.remove("no-cursor");
  }, [isVisible]);

  if (isMobile) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-16 h-16 bg-blue-600 rounded-full pointer-events-none z-[100] flex items-center justify-center mix-blend-difference text-white"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? (isHovering ? 1.5 : 1) : 0,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? (isHovering ? 1.5 : 1) : 0 }}
      transition={{ opacity: { duration: 0.2 }, scale: { duration: 0.2 } }}
    >
      <ArrowUpRight className="w-6 h-6" />
    </motion.div>
  );
}
