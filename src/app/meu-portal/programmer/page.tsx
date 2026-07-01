import type { ReactNode } from "react";
import { Banknote, Clock3, FolderKanban, ListTodo } from "lucide-react";
import { requirePortalPageActor } from "@/server/portal/page-auth";
import { listProgrammerDashboard } from "@/server/portal/services";

export default async function ProgrammerPortalPage() {
  const actor = await requirePortalPageActor(["programmer", "admin"]);
  const dashboard = listProgrammerDashboard(actor);
  const availableCents = dashboard.earnings
    .filter((earning) => earning.status === "available")
    .reduce((sum, earning) => sum + earning.finalAmountCents, 0);
  const submittedSeconds = dashboard.timeEntries.reduce((sum, entry) => sum + entry.durationSeconds, 0);

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-28 text-white md:px-12">
      <div className="mx-auto max-w-7xl">
        <PortalHeader eyebrow="Programador" title="Trabalho e ganhos" subtitle={`Ola, ${actor.user.name}.`} />
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          <Metric icon={<ListTodo size={18} />} label="Tarefas" value={dashboard.tasks.length} />
          <Metric icon={<FolderKanban size={18} />} label="Projetos" value={dashboard.projects.length} />
          <Metric icon={<Clock3 size={18} />} label="Horas" value={(submittedSeconds / 3600).toFixed(1)} />
          <Metric icon={<Banknote size={18} />} label="Disponivel" value={money(availableCents)} />
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-bold">Tarefas atribuídas</h2>
            <div className="mt-6 space-y-3">
              {dashboard.tasks.map((task) => (
                <div key={task.id} className="border border-white/10 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-bold">{task.title}</h3>
                    <span className="text-xs uppercase tracking-[0.25em] text-orange-300">{task.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-300">{task.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-2xl font-bold">Ganhos</h2>
              <div className="mt-5 space-y-3">
                {dashboard.earnings.map((earning) => (
                  <div key={earning.id} className="flex items-center justify-between border-b border-white/10 pb-3 text-sm">
                    <span>{earning.status}</span>
                    <strong>{money(earning.finalAmountCents)}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-2xl font-bold">Notificações</h2>
              <div className="mt-5 space-y-3 text-sm text-zinc-300">
                {dashboard.notifications.map((notification) => (
                  <p key={notification.id}>{notification.title}</p>
                ))}
              </div>
            </div>
          </div>
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

function money(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
