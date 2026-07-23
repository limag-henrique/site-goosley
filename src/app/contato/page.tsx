"use client";

import { motion } from "framer-motion";
import { Send, MapPin, Phone, MessageCircle, Mail } from "lucide-react";
import { useState } from "react";

export default function Contato() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bodyText = `Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`;
    window.location.href = `mailto:henriquelimagusmao@gmail.com?subject=Contato%20Projeto%20-${encodeURIComponent(name || 'Goosley')}&body=${encodeURIComponent(bodyText)}`;
  };

  return (
    <div className="pt-24 md:pt-32 pb-24 md:pb-32 min-h-screen bg-accent/20">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* Info Section */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter mb-4 md:mb-6">Fale Conosco</h1>
            <p className="text-base sm:text-xl text-foreground/70 mb-8 md:mb-12">
              Pronto para transformar sua ideia em uma solução premium de mercado? Preencha o formulário e nossa equipe entrará em contato.
            </p>

            <div className="space-y-6 md:space-y-8">

              <div className="flex items-start gap-4">
                <div className="p-3 sm:p-4 bg-background rounded-2xl shadow-sm shrink-0">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-base sm:text-lg">Telefone</h4>
                  <p className="text-foreground/70 text-sm sm:text-base">+55 31 99421-7926</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 sm:p-4 bg-background rounded-2xl shadow-sm shrink-0">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-base sm:text-lg">E-mail</h4>
                  <a href="mailto:henriquelimagusmao@gmail.com" className="text-foreground/70 text-sm sm:text-base hover:text-blue-600 transition-colors break-all">
                    henriquelimagusmao@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 sm:p-4 bg-background rounded-2xl shadow-sm shrink-0">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-base sm:text-lg">Localização</h4>
                  <p className="text-foreground/70 text-sm sm:text-base">Belo Horizonte, MG - Brasil<br/>Atendimento Global</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 sm:p-4 bg-background rounded-2xl shadow-sm shrink-0">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-base sm:text-lg">WhatsApp</h4>
                  <a href="https://wa.me/5531994217926" target="_blank" rel="noopener noreferrer" className="text-foreground/70 text-sm sm:text-base hover:text-green-600 transition-colors">
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
            className="bg-background p-6 sm:p-10 md:p-14 rounded-[2rem] shadow-xl shadow-foreground/5 border border-border block"
          >
            <h3 className="text-2xl sm:text-3xl font-bold mb-6 tracking-tight">Envie uma mensagem</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold mb-2">Seu Nome</label>
                <input 
                  type="text"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 sm:px-5 sm:py-4 rounded-xl bg-accent/50 border border-transparent focus:bg-background focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-base"
                  placeholder="Seu nome completo"
                  autoComplete="name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2">Seu E-mail</label>
                <input 
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 sm:px-5 sm:py-4 rounded-xl bg-accent/50 border border-transparent focus:bg-background focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-base"
                  placeholder="seuemail@exemplo.com"
                  autoComplete="email"
                  inputMode="email"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold mb-2">Detalhes do Projeto</label>
                <textarea 
                  id="message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 sm:px-5 sm:py-4 rounded-xl bg-accent/50 border border-transparent focus:bg-background focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none text-base"
                  placeholder="Como podemos te ajudar?"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold text-base sm:text-lg py-4 rounded-xl hover:bg-blue-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg"
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
