"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CustomCursor } from "@/components/CustomCursor";
import { isImmersiveRoute } from "@/lib/public-chrome";

export function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPortal = pathname.startsWith("/meu-portal");

  if (isPortal || isImmersiveRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <CustomCursor />
      <Navbar />
      <main className="flex-1 overflow-x-hidden">{children}</main>
      <Footer />
    </>
  );
}
