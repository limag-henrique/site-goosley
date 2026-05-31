import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-32">
      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div>
          <Link href="/" className="flex items-center mb-12 relative w-32 h-32">
            <Image 
              src="/images/logo preto transparente.png" 
              alt="Logo Goosley" 
              fill
              className="object-contain" 
            />
          </Link>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-tight">
            VAMOS CONSTRUIR <br/> O FUTURO.
          </h2>
        </div>
        
        <div className="grid grid-cols-2 gap-12 lg:pt-24">
          <div>
            <h4 className="text-sm font-bold mb-8 tracking-widest uppercase text-background/50">Nossas Soluções</h4>
            <ul className="space-y-4 text-xl font-medium tracking-tight">
              <li><Link href="/landing-pages" className="hover:opacity-50 transition-opacity">Landing Pages</Link></li>
              <li><Link href="/e-commerce" className="hover:opacity-50 transition-opacity">E-commerce</Link></li>
              <li><Link href="/aplicativos" className="hover:opacity-50 transition-opacity">Aplicativos</Link></li>
              <li><Link href="/automacoes" className="hover:opacity-50 transition-opacity">Automações & Voice Tuning</Link></li>
              <li><Link href="/sistemas-web" className="hover:opacity-50 transition-opacity">Sistemas Web & Backend</Link></li>
              <li><Link href="/agentes-corporativos" className="hover:opacity-50 transition-opacity">Agentes IA Corporativos</Link></li>
              <li><Link href="/workflows" className="hover:opacity-50 transition-opacity">Workflows Autônomos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-8 tracking-widest uppercase text-background/50">Contato</h4>
            <ul className="space-y-4 text-xl font-medium tracking-tight">
              <li>+55 31 99421-7926</li>
              <li className="pt-8">
                <Link href="https://wa.me/5531994217926" target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity text-base">
                  Converse conosco através do WhatsApp
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-6 md:px-12 mt-32 pt-8 border-t border-background/20 text-sm font-bold tracking-widest uppercase text-background/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <p>&copy; {new Date().getFullYear()} GOOSLEY DIGITAL.</p>
        <p>TODOS OS DIREITOS RESERVADOS.</p>
      </div>
    </footer>
  );
}
