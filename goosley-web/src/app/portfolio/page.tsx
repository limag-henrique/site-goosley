"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function Portfolio() {
  const projects = [
    {
      title: "Meliora 2.0 SDF",
      category: "Sistemas Web Complexos",
      description: "Aplicação web para gestão integrada de processos e dados. Desenvolvida com Laravel 5.7 e Vue.js. Entregue em 5 meses.",
    },
    {
      title: "Sistema Financeiro",
      category: "Automações Inteligentes e IA",
      description: "Plataforma de gestão financeira pessoal com inteligência de investimentos (Modelo de Markowitz) usando Python e Streamlit. Entregue em 2 semanas.",
    },
    {
      title: "Capivara Romântica",
      category: "Automações Inteligentes",
      description: "Agente de IA customizado para WhatsApp utilizando OpenAI e FastAPI, simulando a personalidade de um universitário. Entregue em 1 mês.",
      link: "https://huggingface.co/spaces/limag-henrique/capivara"
    },
    {
      title: "Gusli Books",
      category: "Landing Pages e E-commerces",
      description: "Plataforma de e-commerce de livros com Node.js, React e SQLite. Demonstração de loja virtual literária completa. Entregue em 2 semanas.",
      link: "https://gusli-books.onrender.com"
    },
    {
      title: "Gusmão Madeiras",
      category: "Landing Pages",
      description: "Portfólio web responsivo em SPA, catálogo com filtros em tempo real e integração com WhatsApp para orçamentos. Entregue em 1 semana.",
      link: "https://limag-henrique.github.io/gusmaomadeiras-site/"
    },
    {
      title: "Revista Entre Parágrafos",
      category: "Sistemas Web Complexos",
      description: "Portal acadêmico completo com sistema back-end, área restrita para autores e leitores para publicação de artigos. Entregue em 1 mês.",
      link: "https://entreparagrafos.com.br/"
    },
  ];

  return (
    <div className="pt-32 pb-32 min-h-screen bg-background">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-20"
        >
          <h1 className="text-6xl font-bold tracking-tighter mb-6">Nosso Portfólio</h1>
          <p className="text-xl text-foreground/70">
            Explore nossa galeria de projetos e descubra como a Goosley Digital entrega excelência técnica e visual.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {projects.map((project, index) => {
            const Wrapper = project.link ? motion.a : motion.div;
            
            return (
              <Wrapper
                key={index}
                href={project.link}
                target={project.link ? "_blank" : undefined}
                rel={project.link ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index % 2 === 0 ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={`group block ${project.link ? "cursor-pointer" : "cursor-default"}`}
              >
                <div className="aspect-[4/3] bg-accent/50 rounded-3xl mb-6 overflow-hidden relative">
                  {/* Placeholder para a imagem do projeto. Num cenário real, usaríamos <Image> do next */}
                  <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-foreground/20 group-hover:scale-105 transition-transform duration-700 ease-out" />
                  
                  {project.link && (
                    <div className="absolute top-6 right-6 bg-background rounded-full p-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      <ArrowUpRight className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-blue-600 font-medium text-sm mb-2 uppercase tracking-wider">{project.category}</div>
                  <h3 className="text-3xl font-bold mb-2 tracking-tight group-hover:text-blue-600 transition-colors">{project.title}</h3>
                  <p className="text-foreground/70 text-lg">{project.description}</p>
                </div>
              </Wrapper>
            );
          })}
        </div>
      </div>
    </div>
  );
}
