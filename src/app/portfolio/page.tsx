"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import kitchleanImage from "@/components/portfolio/kitchlean.png";

export default function Portfolio() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const projects = [
    {
      title: "Meliora 2.0 SDF",
      category: "Sistemas Web Complexos",
      description: "Aplicação web para gestão integrada de processos e dados. Desenvolvida com Laravel 5.7 e Vue.js. Entregue em 5 meses.",
      image: "/images/portfolio/meliora.png"
    },
    {
      title: "Sistema Financeiro",
      category: "Automações Inteligentes e IA",
      description: "Plataforma de gestão financeira pessoal com inteligência de investimentos (Modelo de Markowitz) usando Python e Streamlit. Entregue em 2 semanas.",
      image: "/images/portfolio/sistema-financeiro.png"
    },
    {
      title: "Are you a criminal - Machine Learning",
      category: "Machine Learning e IA",
      description: "Sistema em Python que extrai um embedding facial normalizado e compara com um conjunto local de imagens de referência.",
      link: "https://github.com/limag-henrique/are-you-a-criminal-ML/",
      image: "/images/portfolio/machine-learning.png"
    },
    {
      title: "GWeb",
      category: "Sistemas Web Complexos",
      description: "Aplicativo de desenvolvimento de software web por interfaces gráficas facilitadas. Feito com C#.",
      link: "https://github.com/limag-henrique/gweb/",
      image: "/images/portfolio/gweb.png"
    },
    {
      title: "Capivara Romântica",
      category: "Automações Inteligentes",
      description: "Agente de IA customizado para WhatsApp utilizando OpenAI e FastAPI, simulando a personalidade de um universitário. Entregue em 1 mês.",
      link: "https://huggingface.co/spaces/limag-henrique/capivara",
      image: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=3270&auto=format&fit=crop"
    },
    {
      title: "Gusli Books",
      category: "Landing Pages e E-commerces",
      description: "Plataforma de e-commerce de livros com Node.js, React e SQLite. Demonstração de loja virtual literária completa. Entregue em 2 semanas.",
      link: "https://gusli-books.onrender.com",
      image: "/images/portfolio/gusli-books.png"
    },
    {
      title: "Kitchlean",
      category: "Sistemas Web Complexos",
      description: "Plataforma SaaS que ajuda restaurantes a transformar capacidade ociosa em marcas virtuais para delivery, com diagnóstico, recomendações de IA e projeções financeiras.",
      link: "https://kitchlean-064bc.goskip.app/",
      image: kitchleanImage
    },
    {
      title: "Gusmão Madeiras",
      category: "Landing Pages",
      description: "Portfólio web responsivo em SPA, catálogo com filtros em tempo real e integração com WhatsApp para orçamentos. Entregue em 1 semana.",
      link: "https://limag-henrique.github.io/gusmaomadeiras-site/",
      image: "/images/portfolio/gusmao-madeiras.png"
    },
    {
      title: "Revista Entre Parágrafos",
      category: "Sistemas Web Complexos",
      description: "Portal acadêmico completo com sistema back-end, área restrita para autores e leitores para publicação de artigos. Entregue em 1 mês.",
      link: "https://entreparagrafos.com.br/",
      image: "/images/portfolio/entreparagrafos.png"
    },
  ];

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Efeito de auto-scroll suave (desativado no mobile)
  useEffect(() => {
    if (isMobile) return;
    let animationFrameId: number;
    let lastTime = performance.now();
    
    const scroll = (currentTime: number) => {
      if (containerRef.current && hoveredIndex === null) {
        const deltaTime = currentTime - lastTime;
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
  }, [hoveredIndex, isMobile]);

  const displayProjects = isMobile ? projects : [...projects, ...projects, ...projects, ...projects];

  return (
    <div className="pt-24 md:pt-32 min-h-screen bg-[#0a0a0a] text-white overflow-hidden flex flex-col pb-16">
      <div className="container mx-auto px-6 md:px-12 mb-8 md:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 md:mb-6 uppercase">Nosso Portfólio</h1>
          <p className="text-base md:text-xl text-white/70">
            Descubra as soluções que desenvolvemos. Explore nossa galeria interativa abaixo.
          </p>
        </motion.div>
      </div>

      {/* Mobile Card Grid / Touch Carousel */}
      {isMobile ? (
        <div className="container mx-auto px-6 grid grid-cols-1 gap-8">
          {projects.map((project, index) => (
            <div 
              key={index}
              className="relative w-full rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 flex flex-col shadow-xl"
            >
              <div className="relative w-full h-64">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/30 to-transparent" />
              </div>
              <div className="p-6 flex flex-col gap-3 -mt-6 relative z-10">
                <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">
                  {project.category}
                </span>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  {project.title}
                </h2>
                <p className="text-white/80 text-sm leading-relaxed">
                  {project.description}
                </p>
                {project.link && (
                  <a 
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-white text-black py-3 rounded-full font-bold uppercase tracking-wider text-xs hover:bg-blue-600 hover:text-white transition-colors mt-2"
                  >
                    Ver Solução <ArrowUpRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Desktop Accordion Container */
        <div 
          ref={containerRef}
          className="flex-1 w-full flex items-center overflow-x-auto pb-20 px-6 md:px-12 gap-4 hide-scrollbar"
          style={{ scrollBehavior: 'auto' }}
        >
          <div className="flex gap-4 h-[60vh] md:h-[70vh] w-max">
            {displayProjects.map((project, index) => {
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
                  className={`relative h-full rounded-3xl overflow-hidden cursor-pointer flex-shrink-0 group`}
                >
                  <Image
                    src={project.image}
                    alt={project.title}
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
                    <span className="text-white/60 font-bold text-sm uppercase tracking-widest drop-shadow-md mb-2">
                      {project.category}
                    </span>
                    <h3 className="text-white font-bold text-2xl md:text-3xl drop-shadow-md">
                      {project.title}
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
                    <div className="text-blue-400 font-bold text-sm mb-3 uppercase tracking-widest drop-shadow-md">
                      {project.category}
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter text-white drop-shadow-lg">
                      {project.title}
                    </h2>
                    
                    <div className="max-w-xl">
                      <p className="text-white/80 text-lg md:text-xl mb-6 font-medium drop-shadow-md">
                        {project.description}
                      </p>
                      
                      {project.link && (
                        <a 
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-blue-600 hover:text-white transition-colors pointer-events-auto"
                        >
                          Ver Solução <ArrowUpRight className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

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
