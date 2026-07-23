import type { Metadata } from "next";
import { Inter, Dancing_Script } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { PublicChrome } from "@/components/PublicChrome";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const dancingScript = Dancing_Script({
  variable: "--font-cursive",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Goosley Digital",
  description: "A Goosley Digital é uma empresa premium de tecnologia focada em criação de aplicativos, sistemas web complexos e automações.",
  icons: {
    icon: "/images/logo com fundo.png",
  },
  openGraph: {
    title: "Goosley Digital",
    description: "Criamos as melhores soluções em web e mobile.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={cn(inter.variable, dancingScript.variable, "h-full overflow-x-hidden antialiased")} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-x-hidden" suppressHydrationWarning>
        <SmoothScrollProvider>
          <PublicChrome>
            {children}
          </PublicChrome>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
