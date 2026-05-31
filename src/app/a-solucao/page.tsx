"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ASolucao() {
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
            (A SOLUÇÃO)
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-tight">
            Nossas Soluções
          </h1>
          <p className="text-2xl text-foreground/80 mb-12 leading-relaxed">
            Soluções sob medida para alavancar seu negócio.
          </p>
          
          <div className="flex flex-col gap-4">
             <Link href="/landing-pages" className="text-xl font-bold underline">Landing Pages</Link>
             <Link href="/e-commerce" className="text-xl font-bold underline">E-commerce</Link>
             <Link href="/aplicativos" className="text-xl font-bold underline">Aplicativos</Link>
             <Link href="/automacoes" className="text-xl font-bold underline">Automações</Link>
             <Link href="/sistemas-web" className="text-xl font-bold underline">Sistemas Web</Link>
             <Link href="/agentes-corporativos" className="text-xl font-bold underline">Agentes IA Corporativos</Link>
             <Link href="/workflows" className="text-xl font-bold underline">Workflows Autônomos</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
