"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface InfiniteMarqueeProps {
  children: ReactNode;
  speed?: number; // Duration in seconds for one full loop
  direction?: "left" | "right";
}

export function InfiniteMarquee({ children, speed = 20, direction = "left" }: InfiniteMarqueeProps) {
  return (
    <div className="w-full overflow-hidden flex whitespace-nowrap bg-background text-foreground border-y border-foreground/10 py-6">
      <motion.div
        className="flex gap-16 min-w-full shrink-0 items-center px-8"
        animate={{
          x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: speed,
        }}
      >
        {/* We duplicate the children multiple times to ensure seamless scrolling */}
        {children}
        {children}
        {children}
        {children}
      </motion.div>
    </div>
  );
}
