"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { PortfolioScene } from "./PortfolioScene";

export interface Project {
  title: string;
  category: string;
  description: string;
  link?: string;
  image: string;
  color: string;
}

export const projectsData: Project[] = [
  {
    title: "Meliora 2.0 SDF",
    category: "Sistemas Web Complexos",
    description: "Aplicação web para gestão integrada de processos e dados. Desenvolvida com Laravel 5.7 e Vue.js.",
    image: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=3270&auto=format&fit=crop",
    color: "#2a2a2a"
  },
  {
    title: "Sistema Financeiro",
    category: "Automações Inteligentes e IA",
    description: "Plataforma de gestão financeira pessoal com inteligência de investimentos (Modelo de Markowitz) usando Python e Streamlit.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=3164&auto=format&fit=crop",
    color: "#1c2e4a"
  },
  {
    title: "Capivara Romântica",
    category: "Automações Inteligentes",
    description: "Agente de IA customizado para WhatsApp utilizando OpenAI e FastAPI, simulando a personalidade de um universitário.",
    link: "https://huggingface.co/spaces/limag-henrique/capivara",
    image: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=3270&auto=format&fit=crop",
    color: "#4a1c1c"
  },
  {
    title: "Gusli Books",
    category: "Landing Pages e E-commerces",
    description: "Plataforma de e-commerce de livros com Node.js, React e SQLite. Demonstração de loja virtual literária completa.",
    link: "https://gusli-books.onrender.com",
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=3270&auto=format&fit=crop",
    color: "#3a362a"
  },
  {
    title: "Gusmão Madeiras",
    category: "Landing Pages",
    description: "Portfólio web responsivo em SPA, catálogo com filtros em tempo real e integração com WhatsApp para orçamentos.",
    link: "https://limag-henrique.github.io/gusmaomadeiras-site/",
    image: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=3270&auto=format&fit=crop",
    color: "#4a3c2a"
  },
  {
    title: "Revista Entre Parágrafos",
    category: "Sistemas Web Complexos",
    description: "Portal acadêmico completo com sistema back-end, área restrita para autores e leitores para publicação de artigos.",
    link: "https://entreparagrafos.com.br/",
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=3270&auto=format&fit=crop",
    color: "#2a4a3a"
  },
];

export function PortfolioCanvas() {
  const [activeProject, setActiveProject] = useState<number | null>(null);

  return (
    <div className="w-full h-screen fixed inset-0 z-0 bg-[#0a0a0a] overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <PortfolioScene 
            projects={projectsData} 
            activeProject={activeProject}
            setActiveProject={setActiveProject}
          />
        </Suspense>
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10 mix-blend-difference text-white">
        <header className="flex justify-between items-center uppercase text-xs font-bold tracking-widest">
          <span>Goosley Digital</span>
          <span>Portfólio</span>
        </header>
        
        <footer className="flex justify-between items-center uppercase text-xs font-bold tracking-widest">
          <span>2024-2026 ©</span>
          <span>Scroll to explore</span>
        </footer>
      </div>
    </div>
  );
}
