"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface HoverRevealProps {
  text: string;
  imageSrc: string;
  href?: string;
  description?: string;
  ctaText?: string;
}

export function HoverReveal({ text, imageSrc, href, description, ctaText }: HoverRevealProps) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 250 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 150; // Centered relative to 300px image width
    const y = e.clientY - rect.top - 100;  // Centered relative to 200px image height
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    handleMouseMove(e);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const content = (
    <div
      ref={containerRef}
      className="relative w-full py-6 md:py-8 border-b border-foreground/10 group cursor-pointer overflow-visible"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-2 md:gap-0">
        <div className="flex items-center justify-between w-full md:w-auto">
          <h3 className="text-2xl sm:text-4xl md:text-6xl font-bold tracking-tighter group-hover:pl-4 md:group-hover:pl-8 transition-all duration-300">
            {text}
          </h3>
          <ArrowUpRight className="w-6 h-6 md:hidden text-foreground/50 group-hover:text-foreground transition-colors shrink-0 ml-4" />
        </div>

        {description && (
          <div className="mt-2 md:mt-0 md:text-right flex flex-col items-start md:items-end group-hover:pr-4 md:group-hover:pr-8 transition-all duration-300">
            <p className="text-base md:text-xl font-medium tracking-tight text-foreground/70 mb-1">
              {description}
            </p>
            {ctaText && (
              <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-foreground underline underline-offset-4">
                {ctaText}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Desktop Mouse-Follow Floating Image */}
      <motion.div
        className="hidden md:block absolute top-0 left-0 h-[200px] w-[300px] rounded-2xl overflow-hidden pointer-events-none z-20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20"
        style={{
          x: smoothX,
          y: smoothY,
        }}
        initial={false}
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0.8,
        }}
        transition={{
          opacity: { duration: 0.25 },
          scale: { duration: 0.3 },
        }}
      >
        <div className="relative w-full h-full">
          <Image
            src={imageSrc}
            alt={text}
            fill
            className="object-cover"
          />
        </div>
      </motion.div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block w-full">{content}</Link>;
  }

  return content;
}
