import type { Metadata } from "next";

import { CriminalidadeFacialClient } from "@/components/CriminalidadeFacialClient";

export const metadata: Metadata = {
  title: "Criminalidade facial | Goosley Digital",
  description: "Demonstração acadêmica de similaridade facial calibrada em uma galeria de referência.",
};

export default function CriminalidadeFacialPage() {
  return <CriminalidadeFacialClient />;
}
