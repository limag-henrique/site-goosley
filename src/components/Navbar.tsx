"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4",
          isScrolled ? "bg-background/90 backdrop-blur-md" : "bg-transparent",
          isHome && !isScrolled ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
        )}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 z-50 group">
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
            <Link href="/a-solucao" className="hover:opacity-50 transition-opacity">Nossas Soluções</Link>
            <Link href="/precos" className="hover:opacity-50 transition-opacity">Simule seu Projeto</Link>
            <Link href="/portfolio" className="hover:opacity-50 transition-opacity">Portfólio</Link>
            <Link href="/contato" className="hover:opacity-50 transition-opacity">Contato</Link>
            <Link href="/meu-portal" className="hover:opacity-50 transition-opacity">Meu Portal</Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className={cn(
              "md:hidden z-50 p-2 transition-colors duration-300 text-white"
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
        className={cn(
          "fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center gap-8 text-4xl font-bold tracking-tighter uppercase transition-all duration-500",
          isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 invisible -translate-y-full pointer-events-none"
        )}
      >
        <button 
          className="absolute top-6 right-6 p-2 text-foreground md:hidden z-50"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Close menu"
        >
          <X size={32} />
        </button>
        <Link href="/a-solucao" onClick={() => setIsMenuOpen(false)}>Nossas Soluções</Link>
        <Link href="/precos" onClick={() => setIsMenuOpen(false)}>Simule seu Projeto</Link>
        <Link href="/portfolio" onClick={() => setIsMenuOpen(false)}>Portfólio</Link>
        <Link href="/contato" onClick={() => setIsMenuOpen(false)}>Contato</Link>
        <Link href="/meu-portal" onClick={() => setIsMenuOpen(false)}>Meu Portal</Link>
      </div>
    </>
  );
}
