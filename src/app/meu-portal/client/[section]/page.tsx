import { notFound } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { ClientPortalContent } from "@/components/portal/PortalPages";
import { requirePortalPageActor } from "@/server/portal/page-auth";

const sections = ["new-project", "solutions", "estimate", "budgets", "messages", "payments", "profile"];

type ClientSectionContext = {
  params: Promise<{ section: string }>;
};

export default async function ClientPortalSectionPage({ params }: ClientSectionContext) {
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  const actor = await requirePortalPageActor(["client", "admin"]);
  const greeting = actor.user.role === "admin" ? "Oi, Henrique" : `Ola, ${actor.user.name}`;

  return (
    <PortalShell
      actor={actor}
      role="client"
      title={titleFor(section)}
      subtitle={`${greeting}. Pagina dedicada do portal do cliente.`}
      currentPath={`/meu-portal/client/${section}`}
    >
      <ClientPortalContent actor={actor} section={section} />
    </PortalShell>
  );
}

function titleFor(section: string) {
  const titles: Record<string, string> = {
    "new-project": "Novo projeto",
    solutions: "Solucoes",
    estimate: "Calculadora",
    budgets: "Orcamentos",
    messages: "Mensagens",
    payments: "Pagamentos",
    profile: "Perfil",
  };
  return titles[section] || "Cliente";
}
