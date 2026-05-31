"use client";

import { motion } from "framer-motion";
import { Send, MapPin, Phone, MessageCircle } from "lucide-react";
import { useState } from "react";

export default function Contato() {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `mailto:henriquelimagusmao@gmail.com?subject=Detalhes%20do%20Projeto&body=${encodeURIComponent(message)}`;
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
                  <p className="text-foreground/70">+55 31 99421-7926</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-4 bg-background rounded-2xl shadow-sm">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Localização</h4>
                  <p className="text-foreground/70">Belo Horizonte, MG - Brasil<br/>Atendimento Global</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-4 bg-background rounded-2xl shadow-sm">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">WhatsApp</h4>
                  <a href="https://wa.me/5531994217926" target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-green-600 transition-colors">
                    Converse conosco através do WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-background p-10 md:p-14 rounded-[2rem] shadow-xl shadow-foreground/5 border border-border md:hidden block"
          >
            <h3 className="text-3xl font-bold mb-8 tracking-tight">Envie uma mensagem</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="message" className="block text-sm font-semibold mb-2">Detalhes do Projeto</label>
                <textarea 
                  id="message"
                  required
                  rows={8}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl bg-accent/50 border border-transparent focus:bg-background focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                  placeholder="Como podemos te ajudar?"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold text-lg py-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                Enviar Solicitação
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
