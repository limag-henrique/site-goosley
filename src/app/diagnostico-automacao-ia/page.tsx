"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DiagnosticoAutomacaoIA() {
  return (
    <div className="pt-32 pb-32 min-h-screen bg-background">
      <div className="container mx-auto px-6 md:px-12">
        <Link href="/" className="inline-flex items-center gap-2 text-foreground/50 hover:text-foreground transition-colors mb-12 uppercase tracking-widest text-sm font-bold">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl"
        >
          <span className="inline-block px-4 py-1 border border-foreground rounded-full text-sm font-bold uppercase tracking-widest mb-8">
            (DIAGNÓSTICO)
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-tight">
            Diagnóstico de Automação e IA
          </h1>
          <p className="text-2xl text-foreground/80 mb-12 leading-relaxed">
            Mapeamos processos, gargalos, ferramentas usadas e oportunidades reais de automação para priorizar iniciativas por impacto, complexidade e ROI. É a porta de entrada ideal antes de construir workflows, agentes inteligentes ou sistemas internos.
          </p>
          
          <div className="pt-12 border-t border-foreground/10 flex flex-wrap gap-4">
            <Link 
              href="/contato" 
              className="inline-flex items-center justify-center bg-foreground text-background px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform"
            >
              Iniciar Projeto
            </Link>
            <Link 
              href="/precos?categoria=diagnostico-automacao-ia" 
              className="inline-flex items-center justify-center bg-transparent border border-foreground/20 text-foreground px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:border-foreground transition-colors"
            >
              Calcular Estimativa
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
