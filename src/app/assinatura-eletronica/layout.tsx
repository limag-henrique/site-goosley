import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Consulta de documento",
  description: "Consulta de documento por chave de consulta.",
  robots: { index: false, follow: false, nocache: true, nosnippet: true, noimageindex: true },
  referrer: "no-referrer",
  openGraph: { title: "Consulta de documento", description: "Consulta por chave." },
};

export default function SignatureLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh w-full items-start justify-center bg-neutral-950 px-4 py-8 text-neutral-900 sm:px-8 sm:py-16 print:bg-white print:p-0">
      <div className="w-full max-w-[68rem] rounded-sm bg-white px-6 py-8 sm:px-10 sm:py-12 print:max-w-none print:px-0">
        <header aria-label="Cabeçalho do documento" className="mb-12 grid items-center gap-6 [font-family:Arial,sans-serif] lg:grid-cols-[0.95fr_1fr_1.15fr] lg:gap-5 print:grid-cols-[0.95fr_1fr_1.15fr] print:gap-5">
          <Link
            href="/assinatura-eletronica"
            prefetch={false}
            aria-label="Consultar documento por chave"
            title="Consultar documento por chave"
            className="relative mx-auto block h-16 w-44 overflow-hidden rounded-sm focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-neutral-900 lg:mx-0 print:mx-0"
          >
            <Image src="/images/declaracao-logo.png" alt="CASU UFMG" width={251} height={64} unoptimized className="absolute -left-10 top-0 h-16 w-[251px] max-w-none" />
          </Link>
          <div className="text-center">
            <p className="text-xl font-bold leading-6 text-black">CASU UFMG</p>
            <p className="text-base leading-5 text-neutral-600">Rede Credenciada</p>
            <address className="mx-auto mt-0.5 max-w-80 text-sm leading-4 text-neutral-600 not-italic">
              Rua Paracatu, 878, Sala 802 - Barro Preto - Belo Horizonte/MG
            </address>
          </div>
          <p className="flex min-h-20 items-center justify-center border-2 border-neutral-400 px-5 py-4 text-center text-[1.375rem] font-bold leading-7 text-black">LAUDO MÉDICO</p>
        </header>
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </div>
    </main>
  );
}
