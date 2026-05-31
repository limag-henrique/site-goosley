"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  
  // Parallax scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  // Scroll animations for text spreading
  const textXLeft = useTransform(scrollYProgress, [0, 1], ["0%", "-100%"]);
  const textXRight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section 
      ref={containerRef}
      className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Fluid Background with Parallax */}
      <motion.div 
        style={{ y: bgY }}
        className="absolute inset-0 w-full h-full scale-[1.2] transform-gpu bg-black"
      >
        {/* Base Colors */}
        <div className="absolute inset-0 bg-black" />
        
        {/* Fluid background elements (Abstract Sea) */}
        <div className="absolute top-[-20%] left-[-20%] w-[90%] h-[90%] rounded-[40%_60%_70%_30%] bg-orange-600/60 blur-[120px] animate-fluid-1" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[100%] h-[100%] rounded-[60%_40%_30%_70%] bg-blue-950/80 blur-[100px] animate-fluid-2" />
        <div className="absolute top-[10%] right-[0%] w-[80%] h-[80%] rounded-[50%_50%_60%_40%] bg-indigo-900/70 blur-[130px] animate-fluid-3" />
        <div className="absolute bottom-[0%] left-[10%] w-[70%] h-[70%] rounded-[30%_70%_50%_50%] bg-orange-500/50 blur-[110px] animate-fluid-1" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-[20%] left-[20%] w-[80%] h-[80%] rounded-[70%_30%_50%_50%] bg-slate-900/90 blur-[140px] animate-fluid-2" style={{ animationDelay: '-7s' }} />
        

        
        {/* Grain Noise Overlay */}
        <div className="grain-overlay" />
      </motion.div>

      {/* Base Text Layer (Portuguese) */}
      <motion.div 
        style={{ y: textY, opacity }}
        className="relative z-10 pointer-events-none flex flex-col items-center justify-center w-full"
      >
        <motion.div style={{ x: textXLeft }} className="mask-reveal-container">
          <motion.h1 
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[9vw] leading-[0.85] font-black tracking-tighter uppercase text-white will-change-transform"
          >
            CRIAMOS O
          </motion.h1>
        </motion.div>
        <motion.div style={{ x: textXRight }} className="mask-reveal-container">
          <motion.h1 
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1, delay: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[9vw] leading-[0.85] font-black tracking-tighter uppercase text-white will-change-transform"
          >
            FUTURO.
          </motion.h1>
        </motion.div>
      </motion.div>

    </section>
  );
}

