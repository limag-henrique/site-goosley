import type { ReactNode } from "react";
import { Activity, Banknote, FolderKanban, ShieldCheck, Users } from "lucide-react";
import { requirePortalPageActor } from "@/server/portal/page-auth";
import { adminDashboard } from "@/server/portal/services";

export default async function AdminPortalPage() {
  const actor = await requirePortalPageActor(["admin"]);
  const dashboard = adminDashboard(actor);
  const verifiedCents = dashboard.payments
    .filter((payment) => payment.status === "verified")
    .reduce((sum, payment) => sum + payment.grossAmountCents, 0);

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-28 text-white md:px-12">
      <div className="mx-auto max-w-7xl">
        <PortalHeader eyebrow="Admin" title="God Mode" subtitle={`Controle total para ${actor.user.name}.`} />
        <div className="mt-10 grid gap-4 md:grid-cols-5">
          <Metric icon={<Users size={18} />} label="Usuarios" value={dashboard.users.length} />
          <Metric icon={<FolderKanban size={18} />} label="Projetos" value={dashboard.projects.length} />
          <Metric icon={<Activity size={18} />} label="Tarefas" value={dashboard.tasks.length} />
          <Metric icon={<Banknote size={18} />} label="Verificado" value={money(verifiedCents)} />
          <Metric icon={<ShieldCheck size={18} />} label="Auditoria" value={dashboard.auditLogCount} />
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-bold">Usuários</h2>
            <div className="mt-6 overflow-hidden border border-white/10">
              {dashboard.users.map((user) => (
                <div key={user.id} className="grid grid-cols-[1fr_auto] gap-4 border-b border-white/10 p-4 text-sm last:border-b-0">
                  <span>
                    <strong>{user.name}</strong>
                    <span className="ml-3 text-zinc-400">{user.email}</span>
                  </span>
                  <span className="uppercase tracking-[0.22em] text-orange-300">{user.role}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-bold">Configurações de receita</h2>
            <div className="mt-6 space-y-3">
              {dashboard.settings
                .filter((setting) => setting.key.startsWith("revenue."))
                .map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between border-b border-white/10 pb-3 text-sm">
                    <span className="text-zinc-300">{setting.key}</span>
                    <strong>{String(setting.value)}</strong>
                  </div>
                ))}
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
