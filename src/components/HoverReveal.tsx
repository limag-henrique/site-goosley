"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
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

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const content = (
    <div
      ref={containerRef}
      className="relative w-full py-6 md:py-8 border-b border-foreground/10 group cursor-pointer overflow-visible"
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

      {/* Desktop Hover Floating Image */}
      <motion.div
        className="hidden md:block absolute top-1/2 -translate-y-1/2 right-0 md:right-8 h-[200px] rounded-xl overflow-hidden pointer-events-none z-10 shadow-2xl origin-right"
        initial={false}
        animate={{
          width: isHovered ? 300 : 0,
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0.95,
        }}
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="relative w-[300px] h-[200px]">
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
