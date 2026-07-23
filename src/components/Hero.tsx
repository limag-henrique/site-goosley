"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  // Parallax scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  // Scroll animations for text spreading
  const rawXLeft = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);
  const rawXRight = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[50vh] md:min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black text-white pt-24 pb-12"
    >
      {/* Fluid Background with Parallax */}
      <motion.div 
        style={{ y: bgY }}
        className="absolute inset-0 w-full h-full scale-[1.2] transform-gpu bg-black"
      >
        <div className="absolute inset-0 bg-black" />
        <div className="absolute top-[-20%] left-[-20%] w-[90%] h-[90%] rounded-[40%_60%_70%_30%] bg-orange-600/60 blur-[120px] animate-fluid-1" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[100%] h-[100%] rounded-[60%_40%_30%_70%] bg-blue-950/80 blur-[100px] animate-fluid-2" />
        <div className="absolute top-[10%] right-[0%] w-[80%] h-[80%] rounded-[50%_50%_60%_40%] bg-indigo-900/70 blur-[130px] animate-fluid-3" />
        <div className="absolute bottom-[0%] left-[10%] w-[70%] h-[70%] rounded-[30%_70%_50%_50%] bg-orange-500/50 blur-[110px] animate-fluid-1" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-[20%] left-[20%] w-[80%] h-[80%] rounded-[70%_30%_50%_50%] bg-slate-900/90 blur-[140px] animate-fluid-2" style={{ animationDelay: '-7s' }} />
        <div className="grain-overlay" />
      </motion.div>

      <motion.div 
        style={{ y: textY, opacity }}
        className="relative z-10 w-full max-w-[1600px] px-4 sm:px-8 md:px-12 flex flex-col justify-center"
      >
        {/* Line 1: Asterisk + IDEAS WORTH */}
        <motion.div style={{ x: isMobile ? 0 : rawXLeft }} className="flex items-center justify-start w-full mb-2 md:mb-4">
          <motion.div 
            initial={{ opacity: 0, rotate: -45 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex-shrink-0 mr-3 sm:mr-4 md:mr-8"
          >
            <svg viewBox="0 0 100 100" className="w-8 h-8 sm:w-[10vw] sm:h-[10vw] max-w-[120px] max-h-[120px]" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="50" y1="5" x2="50" y2="95" />
              <line x1="11" y1="27.5" x2="89" y2="72.5" />
              <line x1="11" y1="72.5" x2="89" y2="27.5" />
            </svg>
          </motion.div>
          <div className="mask-reveal-container">
            <motion.h1 
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="text-[8.5vw] sm:text-[10vw] lg:text-[110px] xl:text-[130px] leading-[0.85] font-medium tracking-[-0.04em] uppercase will-change-transform"
            >
              SOLUÇÕES CRIATIVAS
            </motion.h1>
          </div>
        </motion.div>

        {/* Line 2: Description (Desktop) + PARA SEU */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-end md:justify-between w-full mb-2 md:mb-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="hidden md:block w-full md:w-[40%] lg:w-[30%] order-2 md:order-1 mt-6 md:mt-0 pl-2 md:pl-[8%] xl:pl-[10%]"
          >
            <p className="text-sm sm:text-base md:text-lg font-medium leading-snug text-white/90">
              A Goosley Digital é uma consultoria que adapta à necessidade do seu negócio para desenvolver soluções criativas que geram impacto
            </p>
          </motion.div>
          
          <motion.div style={{ x: isMobile ? 0 : rawXRight }} className="mask-reveal-container order-1 md:order-2 ml-auto">
            <motion.h1 
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="text-[10vw] sm:text-[12vw] lg:text-[140px] xl:text-[160px] leading-[0.85] font-medium tracking-[-0.04em] uppercase will-change-transform"
            >
              PARA SEU
            </motion.h1>
          </motion.div>
        </div>

        {/* Line 3: Arrow + NEGÓCIO */}
        <div className="flex items-center justify-start md:justify-center w-full relative mt-4 md:mt-0">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
            className="mr-4 sm:mr-6 md:absolute md:left-[15%] md:mr-0 flex-shrink-0"
          >
            <svg viewBox="0 0 100 100" className="w-8 h-8 sm:w-[10vw] sm:h-[10vw] max-w-[100px] max-h-[100px]" fill="none" stroke="currentColor" strokeWidth="4">
              <line x1="50" y1="10" x2="50" y2="90" />
              <polyline points="20,60 50,90 80,60" />
            </svg>
          </motion.div>
          
          <motion.div style={{ x: isMobile ? 0 : rawXLeft }} className="mask-reveal-container md:ml-[20%]">
            <motion.h1 
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="text-[10vw] sm:text-[12vw] lg:text-[140px] xl:text-[160px] leading-[0.85] font-medium tracking-[-0.04em] uppercase will-change-transform flex items-start"
            >
              NEGÓCIO
            </motion.h1>
          </motion.div>
        </div>

        {/* Mobile Description */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="md:hidden w-full mt-6 pl-1"
        >
          <p className="text-sm sm:text-base font-medium leading-relaxed text-white/80">
            A Goosley Digital é uma consultoria que adapta à necessidade do seu negócio para desenvolver soluções criativas que geram impacto.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

