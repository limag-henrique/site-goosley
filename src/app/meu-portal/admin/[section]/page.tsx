import { notFound } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { AdminPortalContent } from "@/components/portal/PortalPages";
import { requirePortalPageActor } from "@/server/portal/page-auth";

const sections = ["users", "projects", "tasks", "messages", "finance", "settings", "security"];

type AdminSectionContext = {
  params: Promise<{ section: string }>;
};

export default async function AdminPortalSectionPage({ params }: AdminSectionContext) {
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  const actor = await requirePortalPageActor(["admin"]);

  return (
    <PortalShell
      actor={actor}
      role="admin"
      title={titleFor(section)}
      subtitle="Pagina dedicada para controle administrativo do portal."
      currentPath={`/meu-portal/admin/${section}`}
    >
      <AdminPortalContent actor={actor} section={section} />
    </PortalShell>
  );
}

function titleFor(section: string) {
  const titles: Record<string, string> = {
    users: "Usuarios",
    projects: "Projetos",
    tasks: "Tarefas",
    messages: "Mensagens",
    finance: "Financeiro",
    settings: "Configuracoes",
    security: "Seguranca",
  };
  return titles[section] || "Admin";
}
