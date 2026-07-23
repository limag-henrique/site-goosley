"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4",
          isScrolled ? "bg-background/90 backdrop-blur-md border-b border-white/5" : "bg-transparent",
          "translate-y-0 opacity-100"
        )}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 z-50 group min-h-[44px]">
            <div className="relative w-10 h-10 transition-all duration-300">
              <Image 
                src="/images/logo branco transparente.png" 
                alt="Logo Goosley" 
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-105" 
              />
            </div>
            <span className="font-bold tracking-widest uppercase transition-colors duration-300 text-white text-sm md:text-base">
              Goosley Digital
            </span>
          </Link>

          {/* Desktop Menu */}
          <nav className={cn(
            "hidden md:flex items-center gap-8 text-sm font-bold tracking-widest uppercase transition-colors duration-300 text-white"
          )}>
            <Link href="/a-solucao" className="hover:opacity-50 transition-opacity min-h-[44px] flex items-center">Nossas Soluções</Link>
            <Link href="/precos" className="hover:opacity-50 transition-opacity min-h-[44px] flex items-center">Simule seu Projeto</Link>
            <Link href="/portfolio" className="hover:opacity-50 transition-opacity min-h-[44px] flex items-center">Portfólio</Link>
            <Link href="/contato" className="hover:opacity-50 transition-opacity min-h-[44px] flex items-center">Contato</Link>
            <Link href="/meu-portal" className="hover:opacity-50 transition-opacity min-h-[44px] flex items-center">Meu Portal</Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className={cn(
              "md:hidden z-[101] min-w-[44px] min-h-[44px] p-2 flex items-center justify-center transition-colors duration-300 text-white active:scale-95"
            )}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Navegação Principal Mobile"
        className={cn(
          "fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center gap-6 text-2xl sm:text-3xl font-bold tracking-tighter uppercase transition-all duration-500 px-6",
          isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 invisible -translate-y-full pointer-events-none"
        )}
      >
        <Link 
          href="/a-solucao" 
          onClick={() => setIsMenuOpen(false)}
          className="w-full text-center py-3 min-h-[50px] flex items-center justify-center hover:text-orange-500 transition-colors"
        >
          Nossas Soluções
        </Link>
        <Link 
          href="/precos" 
          onClick={() => setIsMenuOpen(false)}
          className="w-full text-center py-3 min-h-[50px] flex items-center justify-center hover:text-orange-500 transition-colors"
        >
          Simule seu Projeto
        </Link>
        <Link 
          href="/portfolio" 
          onClick={() => setIsMenuOpen(false)}
          className="w-full text-center py-3 min-h-[50px] flex items-center justify-center hover:text-orange-500 transition-colors"
        >
          Portfólio
        </Link>
        <Link 
          href="/contato" 
          onClick={() => setIsMenuOpen(false)}
          className="w-full text-center py-3 min-h-[50px] flex items-center justify-center hover:text-orange-500 transition-colors"
        >
          Contato
        </Link>
        <Link 
          href="/meu-portal" 
          onClick={() => setIsMenuOpen(false)}
          className="w-full text-center py-3 min-h-[50px] flex items-center justify-center hover:text-orange-500 transition-colors text-orange-400"
        >
          Meu Portal
        </Link>
      </div>
    </>
  );
}
