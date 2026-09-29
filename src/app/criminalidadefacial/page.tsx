import type { Metadata } from "next";
import { connection } from "next/server";

import { CriminalidadeFacialDeactivated, CriminalidadeFacialExperience } from "@/components/CriminalidadeFacialExperience";
import { CRIMINALIDADE_FACIAL_DEACTIVATION_AT, isCriminalidadeFacialDeactivated } from "@/lib/criminalidadefacial-schedule";
import { getPeopleIndex } from "@/server/criminalidadefacial/people";

export const metadata: Metadata = {
  title: "Criminalidade facial | Goosley Digital",
  description: "Demonstração acadêmica de similaridade facial calibrada em uma galeria de referência.",
};

export default async function CriminalidadeFacialPage() {
  await connection();
  if (isCriminalidadeFacialDeactivated()) return <CriminalidadeFacialDeactivated />;

  return <CriminalidadeFacialExperience people={getPeopleIndex()} deactivationAt={CRIMINALIDADE_FACIAL_DEACTIVATION_AT} />;
}
