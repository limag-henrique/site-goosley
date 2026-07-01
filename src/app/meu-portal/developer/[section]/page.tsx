import { notFound } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { DeveloperPortalContent } from "@/components/portal/PortalPages";
import { requirePortalPageActor } from "@/server/portal/page-auth";

const sections = ["projects", "calendar", "time", "messages", "requests", "security", "profile"];

type DeveloperSectionContext = {
  params: Promise<{ section: string }>;
};

export default async function DeveloperPortalSectionPage({ params }: DeveloperSectionContext) {
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  const actor = await requirePortalPageActor(["developer", "programmer", "admin"]);

  return (
    <PortalShell
      actor={actor}
      role="developer"
      title={titleFor(section)}
      subtitle="Pagina dedicada para execucao tecnica, comunicacao e controle de prazo."
      currentPath={`/meu-portal/developer/${section}`}
    >
      <DeveloperPortalContent actor={actor} section={section} />
    </PortalShell>
  );
}

function titleFor(section: string) {
  const titles: Record<string, string> = {
    projects: "Projetos",
    calendar: "Calendario",
    time: "Horas",
    messages: "Mensagens",
    requests: "Pendencias",
    security: "Seguranca",
    profile: "Perfil",
  };
  return titles[section] || "Desenvolvedor";
}
