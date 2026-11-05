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
      <div className="w-full max-w-3xl rounded-sm bg-white px-6 py-8 sm:px-14 sm:py-12 print:max-w-none print:px-0">
        <header className="mb-10 border-b border-neutral-200 pb-7">
          <Link
            href="/assinatura-eletronica"
            prefetch={false}
            aria-label="Consultar documento por chave"
            className="inline-flex min-h-11 flex-col items-start gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-neutral-900"
          >
            <Image src="/images/declaracao-logo.png" alt="Logo da declaração" width={251} height={64} unoptimized className="h-auto max-w-full" />
            <span className="text-xs font-medium text-neutral-600 underline underline-offset-4">Consultar documento</span>
          </Link>
        </header>
        {children}
      </div>
    </main>
  );
}
