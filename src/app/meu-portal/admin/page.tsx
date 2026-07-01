import { PortalShell } from "@/components/portal/PortalShell";
import { AdminPortalContent } from "@/components/portal/PortalPages";
import { requirePortalPageActor } from "@/server/portal/page-auth";

export default async function AdminPortalPage() {
  const actor = await requirePortalPageActor(["admin"]);

  return (
    <PortalShell
      actor={actor}
      role="admin"
      title="Oi, Henrique"
      subtitle="Controle total de usuarios, projetos, mensagens, entregaveis, financeiro e seguranca."
      currentPath="/meu-portal/admin"
    >
      <AdminPortalContent actor={actor} />
    </PortalShell>
  );
}
