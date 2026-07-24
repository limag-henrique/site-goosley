"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type Question = {
  id: string;
  title: string;
  options: {
    text: string;
    nextId?: string;
    resultUrl?: string;
  }[];
};

const questions: Record<string, Question> = {
  q1: {
    id: "q1",
    title: "Qual é o principal desafio do seu negócio?",
    options: [
      { text: "Vender e atrair clientes na internet.", nextId: "q2a" },
      { text: "Automatizar e organizar processos internos.", nextId: "q2b" },
      { text: "Ter uma plataforma robusta ou um app próprio.", nextId: "q2c" },
      { text: "Criar uma experiência foda de atendimento com IA.", nextId: "q2d" },
      { text: "Entender quais processos valem automatizar primeiro.", resultUrl: "/diagnostico-automacao-ia" },
      { text: "Medir resultados, funis e indicadores em dashboards.", resultUrl: "/analytics-dashboards-bi" },
    ],
  },
  q2a: {
    id: "q2a",
    title: "Entendi! E como você pretende vender?",
    options: [
      { text: "Quero focar num produto/serviço só e converter o máximo possível.", resultUrl: "/landing-pages" },
      { text: "Tenho vários produtos e preciso de uma loja online completa.", resultUrl: "/e-commerce" },
      { text: "Preciso de um portal para os meus alunos ou clientes.", resultUrl: "/sistemas-web" },
      { text: "Quero criar funis automatizados de vendas no WhatsApp.", resultUrl: "/automacoes" },
      { text: "Quero um site institucional para mostrar a minha marca e serviços.", resultUrl: "/landing-pages" },
    ],
  },
  q2b: {
    id: "q2b",
    title: "Beleza. E qual o nível da bagunça hoje?",
    options: [
      { text: "São tarefas do dia a dia, como responder mensagens e enviar e-mails.", resultUrl: "/automacoes" },
      { text: "São processos complexos de vários setores que precisam se falar sozinhos.", resultUrl: "/workflows" },
      { text: "Preciso de um sistema interno para organizar tudo isso do zero.", resultUrl: "/sistemas-web" },
      { text: "Quero um Agente de IA para ler documentos e ajudar a equipe.", resultUrl: "/agentes-corporativos" },
      { text: "Quero integrar ferramentas que uso hoje e não se conversam.", resultUrl: "/workflows" },
      { text: "Ainda preciso mapear gargalos e priorizar o que automatizar.", resultUrl: "/diagnostico-automacao-ia" },
    ],
  },
  q2c: {
    id: "q2c",
    title: "Massa. E onde os seus usuários vão acessar mais?",
    options: [
      { text: "Pelo navegador (seja no computador ou celular).", resultUrl: "/sistemas-web" },
      { text: "Precisa ser um app nativo baixado na loja (Android/iOS).", resultUrl: "/aplicativos" },
      { text: "Quero uma Landing Page foda antes de lançar o sistema.", resultUrl: "/landing-pages" },
      { text: "O acesso vai ser só interno pela minha equipe.", resultUrl: "/sistemas-web" },
      { text: "Preciso de um painel de controle (dashboard) interativo para gerenciar dados.", resultUrl: "/analytics-dashboards-bi" },
    ],
  },
  q2d: {
    id: "q2d",
    title: "Sensacional! Como você imagina essa IA atuando?",
    options: [
      { text: "No WhatsApp, de forma bem humanizada e conversacional.", resultUrl: "/automacoes" },
      { text: "Quero um agente integrado no meu sistema pra ajudar o time e o cliente.", resultUrl: "/agentes-corporativos" },
      { text: "Num fluxo de processos completo que funciona sozinho (Workflows).", resultUrl: "/workflows" },
      { text: "Atendendo no meu e-commerce para recomendar produtos.", resultUrl: "/e-commerce" },
      { text: "Atendendo ligações e agendando serviços de forma inteligente por voz.", resultUrl: "/automacoes" },
    ],
  },
};

export default function QuizPage() {
  const router = useRouter();
  const [currentQuestionId, setCurrentQuestionId] = useState("q1");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const currentQuestion = questions[currentQuestionId];

  const handleOptionClick = (option: { nextId?: string; resultUrl?: string }) => {
    if (option.resultUrl) {
      setIsRedirecting(true);
      // Timeout just for aesthetic reasons so they see a feedback
      setTimeout(() => {
        router.push(option.resultUrl as string);
      }, 1500);
    } else if (option.nextId) {
      setCurrentQuestionId(option.nextId);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-16 bg-background text-foreground flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-20">
        <div className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-blue-600/30 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-purple-600/30 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl mt-8">
        <AnimatePresence mode="wait">
          {!isRedirecting ? (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col gap-16 md:gap-24"
            >
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-center leading-tight whitespace-pre-line">
                {currentQuestion.title}
              </h1>

              <div className="flex flex-col gap-4">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(option)}
                    className="group relative w-full p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-white/10 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 w-0 bg-white/5 transition-all duration-500 ease-out group-hover:w-full" />
                    <span className="relative z-10 text-xl md:text-2xl font-medium tracking-tight">
                      {option.text}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="redirecting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center gap-6"
            >
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                Perfeito!
              </h1>
              <p className="text-2xl font-medium text-white/80">
                Estamos te levando para a solução ideal...
              </p>
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mt-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
