"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

const solutions = [
  { name: "Landing Pages", href: "/landing-pages", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=3272&auto=format&fit=crop" },
  { name: "E-commerce", href: "/e-commerce", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=3270&auto=format&fit=crop" },
  { name: "Aplicativos", href: "/aplicativos", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=3270&auto=format&fit=crop" },
  { name: "Automações & Voice Tuning", href: "/automacoes", image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=3270&auto=format&fit=crop" },
  { name: "Diagnóstico de Automação e IA", href: "/diagnostico-automacao-ia", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=3270&auto=format&fit=crop" },
  { name: "Sistemas Web & Backend", href: "/sistemas-web", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=3270&auto=format&fit=crop" },
  { name: "Analytics, Dashboards e BI", href: "/analytics-dashboards-bi", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=3270&auto=format&fit=crop" },
  { name: "Agentes IA Corporativos", href: "/agentes-corporativos", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=3270&auto=format&fit=crop" },
  { name: "Workflows Autônomos", href: "/workflows", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=3270&auto=format&fit=crop" },
];

export default function ASolucao() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    
    const scroll = (currentTime: number) => {
      if (containerRef.current && hoveredIndex === null) {
        const deltaTime = currentTime - lastTime;
        // Movimento vagaroso
        containerRef.current.scrollLeft += (30 * deltaTime) / 1000;
        
        if (
          containerRef.current.scrollLeft >= 
          containerRef.current.scrollWidth / 2
        ) {
          containerRef.current.scrollLeft = 0;
        }
      }
      lastTime = currentTime;
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [hoveredIndex]);

  const displaySolutions = [...solutions, ...solutions, ...solutions, ...solutions];

  return (
    <div className="pt-32 pb-32 min-h-screen bg-background overflow-hidden flex flex-col">
      <div className="container mx-auto px-6 md:px-12 mb-16">
        <Link href="/" className="inline-flex items-center gap-2 text-foreground/50 hover:text-foreground transition-colors mb-12 uppercase tracking-widest text-sm font-bold">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-1 border border-foreground rounded-full text-sm font-bold uppercase tracking-widest mb-8">
              (NOSSAS SOLUÇÕES)
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight">
              Nossas Soluções
            </h1>
            <p className="text-2xl text-foreground/80 leading-relaxed">
              Soluções sob medida para alavancar seu negócio.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href="/quiz" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-sm uppercase tracking-widest text-foreground bg-foreground/5 backdrop-blur-xl border border-foreground/10 rounded-2xl overflow-hidden transition-all duration-500 hover:bg-foreground/10 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:scale-105 max-w-sm text-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 flex items-center gap-3">
                Faça um quiz para saber qual a melhor solução para o seu negócio
                <ArrowRight className="w-5 h-5 shrink-0 transition-transform duration-500 group-hover:translate-x-2" />
              </span>
            </Link>
          </motion.div>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 w-full flex items-center overflow-x-auto pb-20 px-6 md:px-12 gap-4 hide-scrollbar"
        style={{ scrollBehavior: 'auto' }}
      >
        <div className="flex gap-4 h-[60vh] md:h-[70vh] w-max">
          {displaySolutions.map((solution, index) => {
            const isHovered = hoveredIndex === index;

            return (
              <motion.div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                animate={{
                  width: isHovered ? "800px" : "350px",
                }}
                transition={{
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`relative h-full rounded-3xl overflow-hidden flex-shrink-0 group`}
                style={{
                  maxWidth: isHovered ? "85vw" : "60vw"
                }}
              >
                <Link href={solution.href} className="block w-full h-full relative cursor-pointer">
                  <Image
                    src={solution.image}
                    alt={solution.name}
                    fill
                    className="object-cover absolute inset-0 transition-transform duration-[2s] ease-out group-hover:scale-110"
                  />
                  
                  <div className="absolute inset-0 bg-black/40 transition-opacity duration-700 group-hover:bg-black/20" />

                  <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: isHovered ? 0 : 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end pointer-events-none bg-gradient-to-t from-black/80 to-transparent h-1/2"
                  >
                    <h3 className="text-white font-bold text-2xl md:text-3xl drop-shadow-md">
                      {solution.name}
                    </h3>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ 
                      opacity: isHovered ? 1 : 0,
                      y: isHovered ? 0 : 50 
                    }}
                    transition={{ duration: 0.5, delay: isHovered ? 0.3 : 0 }}
                    className="absolute bottom-0 left-0 w-full p-8 md:p-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none"
                  >
                    <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter text-white drop-shadow-lg">
                      {solution.name}
                    </h2>
                    
                    <div className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-blue-600 hover:text-white transition-colors pointer-events-auto">
                      Saber mais <ArrowRight className="w-4 h-4" />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
