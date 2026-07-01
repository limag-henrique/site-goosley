import Link from "next/link";
import type { ReactNode } from "react";
import { CreditCard, MessageSquare, PanelsTopLeft, Pin } from "lucide-react";
import { requirePortalPageActor } from "@/server/portal/page-auth";
import { listClientProjects, listPaymentsForActor } from "@/server/portal/services";

export default async function ClientPortalPage() {
  const actor = await requirePortalPageActor(["client", "admin"]);
  const projects = listClientProjects(actor);
  const payments = listPaymentsForActor(actor);

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-28 text-white md:px-12">
      <div className="mx-auto max-w-7xl">
        <PortalHeader eyebrow="Cliente" title="Meu Portal" subtitle={`Ola, ${actor.user.name}.`} />
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          <Metric icon={<PanelsTopLeft size={18} />} label="Projetos" value={projects.length} />
          <Metric icon={<Pin size={18} />} label="Ativos" value={projects.filter((project) => project.status === "active").length} />
          <Metric icon={<CreditCard size={18} />} label="Pagamentos" value={payments.length} />
          <Metric icon={<MessageSquare size={18} />} label="Mensagens" value="API" />
        </div>

        <section className="mt-10 grid gap-4 lg:grid-cols-2">
          {projects.map((project) => (
            <article key={project.id} className="border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-orange-300">{project.status}</p>
                  <h2 className="mt-2 text-2xl font-bold">{project.title}</h2>
                </div>
                {project.liveUrl ? (
                  <Link href={project.liveUrl} className="text-sm font-bold text-orange-300">
                    Live
                  </Link>
                ) : null}
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-300">{project.description}</p>
              <div className="mt-6 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
                <span className="border border-white/10 p-3">Proximos passos e marcos visiveis</span>
                <span className="border border-white/10 p-3">Comentarios visuais e solicitacoes</span>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function PortalHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <header>
      <p className="text-sm font-bold uppercase tracking-[0.35em] text-orange-300">{eyebrow}</p>
      <h1 className="mt-3 text-5xl font-black tracking-tight md:text-7xl">{title}</h1>
      <p className="mt-4 text-zinc-300">{subtitle}</p>
    </header>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-4 text-orange-300">{icon}</div>
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}
