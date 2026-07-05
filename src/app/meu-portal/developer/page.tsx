import { PortalShell } from "@/components/portal/PortalShell";
import { DeveloperPortalContent } from "@/components/portal/PortalPages";
import { requirePortalPageActor } from "@/server/portal/page-auth";

export default async function DeveloperPortalPage() {
  const actor = await requirePortalPageActor(["developer", "programmer", "admin"]);

  return (
    <PortalShell
      actor={actor}
      role="developer"
      title={`Ola, ${actor.user.name}`}
      subtitle="Atualizacoes do projeto, comentarios, prazos, calendario e entregas tecnicas para o cliente."
      currentPath="/meu-portal/developer"
    >
      <DeveloperPortalContent actor={actor} />
    </PortalShell>
  );
}
