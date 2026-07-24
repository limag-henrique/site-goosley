"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AnalyticsDashboardsBI() {
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
            (ANALYTICS & BI)
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-tight">
            Analytics, Dashboards e BI
          </h1>
          <p className="text-2xl text-foreground/80 mb-12 leading-relaxed">
            Implementamos GA4, eventos, pixels, funis, dashboards executivos, relatórios automáticos e painéis operacionais para transformar dados dispersos em decisões claras. Ideal para sistemas web, e-commerces e projetos de extração de dados.
          </p>
          
          <div className="pt-12 border-t border-foreground/10 flex flex-wrap gap-4">
            <Link 
              href="/contato" 
              className="inline-flex items-center justify-center bg-foreground text-background px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform"
            >
              Iniciar Projeto
            </Link>
            <Link 
              href="/precos?categoria=analytics-dashboards-bi" 
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
