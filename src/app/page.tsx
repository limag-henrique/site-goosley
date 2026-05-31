"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { HoverReveal } from "@/components/HoverReveal";
import { InfiniteMarquee } from "@/components/InfiniteMarquee";
import { Hero } from "@/components/Hero";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Parallax transforms for the gallery
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);
  const y3 = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground" ref={containerRef}>
      
      <Hero />

      {/* Marquee Section */}
      <InfiniteMarquee speed={30}>
        <div className="flex items-center gap-16 px-8 text-4xl font-bold uppercase tracking-widest text-foreground/20">
          <span>Landing Pages</span>
          <span>E-commerces</span>
          <span>Aplicativos</span>
          <span>Automações</span>
          <span>Voice Tuning</span>
          <span>Sistemas Web</span>
          <span>Agentes IA</span>
          <span>Workflows</span>
        </div>
      </InfiniteMarquee>

      {/* Services / Hover Reveal Section */}
      <section id="services" className="py-32" data-custom-cursor>
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-5xl font-black uppercase tracking-tighter">NOSSAS SOLUÇÕES</h2>
          </motion.div>

          <div className="flex flex-col">
            <HoverReveal 
              text="LANDING PAGES" 
              imageSrc="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=3272&auto=format&fit=crop" 
              href="/landing-pages"
            />
            <HoverReveal 
              text="E-COMMERCE" 
              imageSrc="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=3270&auto=format&fit=crop" 
              href="/e-commerce"
            />
            <HoverReveal 
              text="APLICATIVOS" 
              imageSrc="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=3270&auto=format&fit=crop" 
              href="/aplicativos"
            />
            <HoverReveal 
              text="AUTOMAÇÕES & VOICE TUNING" 
              imageSrc="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=3270&auto=format&fit=crop" 
              href="/automacoes"
            />
            <HoverReveal 
              text="SISTEMAS WEB & BACKEND" 
              imageSrc="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=3270&auto=format&fit=crop" 
              href="/sistemas-web"
            />
            <HoverReveal 
              text="AGENTES IA CORPORATIVOS" 
              imageSrc="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=3270&auto=format&fit=crop" 
              href="/agentes-corporativos"
            />
            <HoverReveal 
              text="WORKFLOWS AUTÔNOMOS" 
              imageSrc="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=3270&auto=format&fit=crop" 
              href="/workflows"
            />
          </div>
        </div>
      </section>

      {/* Dynamic CTA Section */}
      <section className="relative py-48 overflow-hidden bg-white text-black flex flex-col items-center justify-center">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-orange-500/10 blur-[120px] rounded-full"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.4, 0.2],
              rotate: [0, -90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-indigo-600/10 blur-[120px] rounded-full"
          />
        </div>

        {/* Animated Background Waves */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
          <svg className="absolute w-0 h-0">
            <defs>
              <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#4f46e5" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
          <motion.div
            className="absolute top-0 left-[-100vw] w-[200vw] h-full flex"
            animate={{ x: ["0%", "50%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(2)].map((_, i) => (
              <div key={i} className="w-[100vw] h-full relative">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
                  <path d="M0,20 Q25,0 50,20 T100,20" fill="none" stroke="url(#waveGrad)" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
                  <path d="M0,40 Q25,20 50,40 T100,40" fill="none" stroke="url(#waveGrad)" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/>
                  <path d="M0,60 Q25,40 50,60 T100,60" fill="none" stroke="url(#waveGrad)" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
                  <path d="M0,80 Q25,60 50,80 T100,80" fill="none" stroke="url(#waveGrad)" strokeWidth="1.0" vectorEffect="non-scaling-stroke"/>
                </svg>
              </div>
            ))}
          </motion.div>
          <motion.div
            className="absolute top-0 left-[-100vw] w-[200vw] h-full flex"
            animate={{ x: ["0%", "50%"] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(2)].map((_, i) => (
              <div key={i} className="w-[100vw] h-full relative">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
                  <path d="M0,30 Q25,50 50,30 T100,30" fill="none" stroke="url(#waveGrad)" strokeWidth="1.2" vectorEffect="non-scaling-stroke"/>
                  <path d="M0,50 Q25,70 50,50 T100,50" fill="none" stroke="url(#waveGrad)" strokeWidth="2.0" vectorEffect="non-scaling-stroke"/>
                  <path d="M0,70 Q25,90 50,70 T100,70" fill="none" stroke="url(#waveGrad)" strokeWidth="0.8" vectorEffect="non-scaling-stroke"/>
                </svg>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="container relative z-10 mx-auto px-6 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-8">
              Já sabe quais são as melhores <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-indigo-600">
                soluções para você?
              </span>
            </h2>
            
            <p className="text-xl text-black/60 mb-12 font-medium tracking-tight">
              Descubra agora com nosso teste.
            </p>

            <Link href="/quiz">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center justify-center px-8 py-4 font-medium text-white tracking-wide bg-black/90 backdrop-blur-md border border-white/10 rounded-full overflow-hidden transition-all shadow-xl hover:shadow-[0_0_40px_rgba(234,88,12,0.3)]"
              >
                <div className="absolute inset-0 w-0 bg-gradient-to-r from-orange-500 to-indigo-600 transition-all duration-500 ease-out group-hover:w-full z-0" />
                <span className="relative z-10 flex items-center gap-3">
                  acessar soluções
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Massive Typography Section */}
      <section className="py-32 px-6 md:px-12 flex flex-col items-center justify-center text-center">
         <span className="inline-block px-4 py-1 border border-foreground rounded-full text-sm font-bold uppercase tracking-widest mb-12">
            (METODOLOGIA)
          </span>
         <div className="mask-reveal-container w-full block">
            <motion.h2 
              initial={{ y: "100%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-[10vw] leading-[0.85] font-black tracking-tighter uppercase"
            >
              SIMPLICIDADE
            </motion.h2>
          </div>
         <div className="mask-reveal-container w-full block">
            <motion.h2 
              initial={{ y: "100%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-[10vw] leading-[0.85] font-black tracking-tighter uppercase"
            >
              RADICAL.
            </motion.h2>
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl md:text-4xl max-w-4xl mt-12 font-medium tracking-tight"
          >
            Nós removemos o ruído. Construímos soluções rápidas, belas e fundamentalmente funcionais. Sem templates. Sem concessões.
          </motion.p>
      </section>

    </div>
  );
}

