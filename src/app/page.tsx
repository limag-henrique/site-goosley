"use client";

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
            <h2 className="text-5xl font-black uppercase tracking-tighter">A Solução</h2>
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
              imageSrc="https://images.unsplash.com/photo-1531297172864-742d131f49b5?q=80&w=3270&auto=format&fit=crop" 
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

      {/* Parallax Image Collage with Glassmorphism */}
      <section className="py-32 relative min-h-[150vh] overflow-hidden bg-accent">
        <div className="sticky top-0 h-screen flex items-center justify-center pointer-events-none z-20">
          <div className="flex gap-4 pointer-events-auto">
            <button className="glass-panel px-8 py-3 rounded-full text-foreground font-bold tracking-widest uppercase hover:bg-white/30 transition-all">
              Marca
            </button>
            <button className="glass-panel px-8 py-3 rounded-full text-foreground font-bold tracking-widest uppercase hover:bg-white/30 transition-all">
              Visão
            </button>
            <button className="glass-panel px-8 py-3 rounded-full text-foreground font-bold tracking-widest uppercase hover:bg-white/30 transition-all">
              Cultura
            </button>
          </div>
        </div>

        <div className="absolute inset-0 flex justify-center items-start gap-8 px-6 mt-32 z-10 pointer-events-none">
          <motion.div style={{ y: y1 }} className="w-1/3 flex flex-col gap-8 pt-32">
             <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden shadow-2xl">
                <Image src="https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=3270&auto=format&fit=crop" alt="Gallery" fill className="object-cover" />
             </div>
             <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-2xl">
                <Image src="https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=3270&auto=format&fit=crop" alt="Gallery" fill className="object-cover" />
             </div>
          </motion.div>

          <motion.div style={{ y: y2 }} className="w-1/3 flex flex-col gap-8">
             <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-2xl">
                <Image src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=3164&auto=format&fit=crop" alt="Gallery" fill className="object-cover" />
             </div>
             <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden shadow-2xl">
                <Image src="https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=3270&auto=format&fit=crop" alt="Gallery" fill className="object-cover" />
             </div>
             <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden shadow-2xl">
                <Image src="https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=3270&auto=format&fit=crop" alt="Gallery" fill className="object-cover" />
             </div>
          </motion.div>

          <motion.div style={{ y: y3 }} className="w-1/3 flex flex-col gap-8 pt-64">
             <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden shadow-2xl">
                <Image src="https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=3270&auto=format&fit=crop" alt="Gallery" fill className="object-cover" />
             </div>
             <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden shadow-2xl">
                <Image src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=3270&auto=format&fit=crop" alt="Gallery" fill className="object-cover" />
             </div>
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
            Nós removemos o ruído. Construímos produtos rápidos, belos e fundamentalmente funcionais. Sem templates. Sem concessões.
          </motion.p>
      </section>

    </div>
  );
}

