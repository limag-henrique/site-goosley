import type { Metadata } from "next";
import { Inter, Dancing_Script } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CustomCursor } from "@/components/CustomCursor";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-cursive",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Goosley Digital | Premium Tech Solutions",
  description: "A Goosley Digital é uma empresa premium de tecnologia focada em criação de aplicativos, sistemas web complexos e automações.",
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
    <html lang="pt-BR" className={cn(inter.variable, dancingScript.variable, "h-full antialiased")} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <SmoothScrollProvider>
          <CustomCursor />
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

