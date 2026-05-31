"use client";

import { motion, useScroll, useTransform, useMotionValue, useMotionTemplate, animate } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  
  const autoX = useMotionValue(-300);
  const autoY = useMotionValue(500);

  useEffect(() => {
    setMounted(true);
    // Center vertically
    autoY.set(window.innerHeight / 2);
    
    // Animate fluidly from left to right, slowing down in the middle
    const width = window.innerWidth;
    const controls = animate(autoX, [-300, width / 2 - 200, width / 2 + 200, width + 300], {
      duration: 8,
      times: [0, 0.25, 0.75, 1], // Spend 50% of the time in the middle 400px
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse",
    });
    
    return () => controls.stop();
  }, [autoX, autoY]);
  
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
  
  const lensX = useTransform(autoX, x => x - 150);
  const lensY = useTransform(autoY, y => y - 150);
  
  const maskImage = useMotionTemplate`radial-gradient(circle 150px at ${autoX}px ${autoY}px, black 98%, transparent 100%)`;

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

      {/* Glass Lens (Fluid Animation) */}
      {mounted && (
        <motion.div
          className="absolute rounded-full pointer-events-none z-20 mix-blend-overlay will-change-transform"
          style={{
            width: 300,
            height: 300,
            left: 0,
            top: 0,
            x: lensX,
            y: lensY,
            background: "radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
            opacity: 1,
            scale: 1,
          }}
        >
        </motion.div>
      )}

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
            className="text-[9vw] leading-[0.85] font-black tracking-tighter uppercase text-white/40 will-change-transform"
          >
            CRIAMOS O
          </motion.h1>
        </motion.div>
        <motion.div style={{ x: textXRight }} className="mask-reveal-container">
          <motion.h1 
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[9vw] leading-[0.85] font-black tracking-tighter uppercase text-white/40 will-change-transform"
          >
            FUTURO.
          </motion.h1>
        </motion.div>
      </motion.div>

      {/* Reveal Text Layer (English) Masked by Animated Lens */}
      {mounted && (
        <motion.div
          style={{ y: textY, opacity }}
          className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center w-full will-change-transform"
        >
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center w-full bg-transparent will-change-[mask-image]"
            style={{
              WebkitMaskImage: maskImage,
              maskImage: maskImage,
              opacity: 1,
            }}
          >
            <motion.div style={{ x: textXLeft }} className="mask-reveal-container">
              <motion.h1 
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-[5vw] leading-[0.85] font-black tracking-tighter uppercase text-white will-change-transform"
              >
                We create
              </motion.h1>
            </motion.div>
            <motion.div style={{ x: textXRight }} className="mask-reveal-container">
              <motion.h1 
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-[5vw] leading-[0.85] font-black tracking-tighter uppercase text-white will-change-transform"
              >
                the future
              </motion.h1>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

    </section>
  );
}

