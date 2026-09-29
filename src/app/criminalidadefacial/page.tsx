import type { Metadata } from "next";

import { CriminalidadeFacialExperience } from "@/components/CriminalidadeFacialExperience";
import { getPeopleIndex } from "@/server/criminalidadefacial/people";

export const metadata: Metadata = {
  title: "Criminalidade facial | Goosley Digital",
  description: "Demonstração acadêmica de similaridade facial calibrada em uma galeria de referência.",
};

export default function CriminalidadeFacialPage() {
  return <CriminalidadeFacialExperience people={getPeopleIndex()} />;
}
