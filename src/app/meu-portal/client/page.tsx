import { PortalShell } from "@/components/portal/PortalShell";
import { ClientPortalContent } from "@/components/portal/PortalPages";
import { requirePortalPageActor } from "@/server/portal/page-auth";

export default async function ClientPortalPage() {
  const actor = await requirePortalPageActor(["client", "admin"]);
  const greeting = actor.user.role === "admin" ? "Oi, Henrique" : `Ola, ${actor.user.name}`;

  return (
    <PortalShell
      actor={actor}
      role="client"
      title={greeting}
      subtitle="Acompanhe entregas, envie demandas e estime novos projetos dentro do portal."
      currentPath="/meu-portal/client"
    >
      <ClientPortalContent actor={actor} />
    </PortalShell>
  );
}
