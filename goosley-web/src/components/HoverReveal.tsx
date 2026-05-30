"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";

import Link from "next/link";

interface HoverRevealProps {
  text: string;
  imageSrc: string;
  href?: string;
}

export function HoverReveal({ text, imageSrc, href }: HoverRevealProps) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const [rotation, setRotation] = useState(0);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setRotation(Math.random() > 0.5 ? 2 : -2);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Calculate position relative to the container
    x.set(e.clientX - rect.left - 150); // 150 is half the image width
    y.set(e.clientY - rect.top - 100);  // 100 is half the image height
  };

  const content = (
    <div
      ref={containerRef}
      className="relative w-full py-6 border-b border-foreground/10 group cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <h3 className="text-4xl md:text-6xl font-bold tracking-tighter group-hover:pl-8 transition-all duration-300">
        {text}
      </h3>

      <motion.div
        className="absolute top-0 left-0 w-[300px] h-[200px] rounded-xl overflow-hidden pointer-events-none z-10 shadow-2xl"
        style={{
          x: xSpring,
          y: ySpring,
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0.8,
          rotate: isHovered ? rotation : 0,
        }}
        transition={{
          opacity: { duration: 0.2 },
          scale: { duration: 0.2 },
        }}
      >
        <Image
          src={imageSrc}
          alt={text}
          fill
          className="object-cover"
        />
      </motion.div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block w-full">{content}</Link>;
  }

  return content;
}
