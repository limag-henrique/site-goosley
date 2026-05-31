"use client";

import { motion } from "framer-motion";
import { Send, MapPin, Phone } from "lucide-react";
import { useState } from "react";

export default function Contato() {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulando um envio de formulário para experiência UI/UX
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormState({ name: "", email: "", message: "" });
    }, 1500);
  };

  return (
    <div className="pt-32 pb-32 min-h-screen bg-accent/20">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          {/* Info Section */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-6xl font-bold tracking-tighter mb-6">Fale Conosco</h1>
            <p className="text-xl text-foreground/70 mb-12">
              Pronto para transformar sua ideia em uma solução premium de mercado? Preencha o formulário e nossa equipe entrará em contato.
            </p>

            <div className="space-y-8">

              <div className="flex items-start gap-4">
                <div className="p-4 bg-background rounded-2xl shadow-sm">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Telefone</h4>
                  <p className="text-foreground/70">+55 11 99999-9999</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-4 bg-background rounded-2xl shadow-sm">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Localização</h4>
                  <p className="text-foreground/70">São Paulo, SP - Brasil<br/>Atendimento Global</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-background p-10 md:p-14 rounded-[2rem] shadow-xl shadow-foreground/5 border border-border"
          >
            <h3 className="text-3xl font-bold mb-8 tracking-tight">Envie uma mensagem</h3>
            
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 text-green-800 p-6 rounded-2xl border border-green-200"
              >
                <h4 className="font-bold text-lg mb-2">Mensagem enviada!</h4>
                <p>Nossa equipe recebeu seu contato e retornará em breve.</p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="mt-6 font-medium text-green-700 underline"
                >
                  Enviar outra mensagem
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold mb-2">Nome Completo</label>
                  <input 
                    type="text" 
                    id="name"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({...formState, name: e.target.value})}
                    className="w-full px-5 py-4 rounded-xl bg-accent/50 border border-transparent focus:bg-background focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold mb-2">E-mail Corporativo</label>
                  <input 
                    type="email" 
                    id="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({...formState, email: e.target.value})}
                    className="w-full px-5 py-4 rounded-xl bg-accent/50 border border-transparent focus:bg-background focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    placeholder="email@empresa.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold mb-2">Detalhes do Projeto</label>
                  <textarea 
                    id="message"
                    required
                    rows={5}
                    value={formState.message}
                    onChange={(e) => setFormState({...formState, message: e.target.value})}
                    className="w-full px-5 py-4 rounded-xl bg-accent/50 border border-transparent focus:bg-background focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                    placeholder="Como podemos te ajudar?"
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white font-semibold text-lg py-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Enviando..." : (
                    <>
                      Enviar Solicitação
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}
