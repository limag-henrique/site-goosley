"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Menu, X, Flag } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-background/90 backdrop-blur-md py-4" : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 z-50 group">
          <Flag className="w-8 h-8 text-foreground fill-foreground/10 group-hover:fill-foreground transition-all duration-300" />
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold tracking-widest uppercase">
          <Link href="/a-solucao" className="hover:opacity-50 transition-opacity">A Solução</Link>
          <Link href="/precos" className="hover:opacity-50 transition-opacity">Preços</Link>
          <Link href="/portfolio" className="hover:opacity-50 transition-opacity">Portfólio</Link>
          <Link href="/contato" className="hover:opacity-50 transition-opacity">Contato</Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden z-50 p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>

        {/* Mobile Nav */}
        <div 
          className={cn(
            "fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center gap-8 text-4xl font-bold tracking-tighter uppercase transition-all duration-500",
            isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 invisible -translate-y-full pointer-events-none"
          )}
        >
          <Link href="/a-solucao" onClick={() => setIsMenuOpen(false)}>A Solução</Link>
          <Link href="/precos" onClick={() => setIsMenuOpen(false)}>Preços</Link>
          <Link href="/portfolio" onClick={() => setIsMenuOpen(false)}>Portfólio</Link>
          <Link href="/contato" onClick={() => setIsMenuOpen(false)}>Contato</Link>
        </div>
      </div>
    </header>
  );
}
