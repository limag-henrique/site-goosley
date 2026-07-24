import Link from "next/link";
import Image from "next/image";

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
              <li><Link href="/diagnostico-automacao-ia" className="hover:opacity-50 transition-opacity">Diagnóstico de Automação e IA</Link></li>
              <li><Link href="/sistemas-web" className="hover:opacity-50 transition-opacity">Sistemas Web & Backend</Link></li>
              <li><Link href="/analytics-dashboards-bi" className="hover:opacity-50 transition-opacity">Analytics, Dashboards e BI</Link></li>
              <li><Link href="/agentes-corporativos" className="hover:opacity-50 transition-opacity">Agentes IA Corporativos</Link></li>
              <li><Link href="/workflows" className="hover:opacity-50 transition-opacity">Workflows Autônomos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-8 tracking-widest uppercase text-background/50">Contato</h4>
            <ul className="space-y-4 text-xl font-medium tracking-tight">
              <li>+55 31 99421-7926</li>
              <li>
                <a href="mailto:henriquelimagusmao@gmail.com" className="hover:opacity-70 transition-opacity">
                  henriquelimagusmao@gmail.com
                </a>
              </li>
              <li className="pt-8">
                <Link 
                  href="https://wa.me/5531994217926" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-3 hover:opacity-70 transition-opacity text-base group"
                >
                  <div className="bg-green-500 p-3 rounded-full group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <span className="font-medium tracking-tight">Converse conosco pelo WhatsApp</span>
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
