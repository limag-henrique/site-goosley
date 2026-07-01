import type { ReactNode } from "react";
import { CreditCard, ExternalLink, FolderKanban, MessageSquare, Wrench } from "lucide-react";
import { PortalShell } from "@/components/portal/PortalShell";
import { ActionForm, EstimateCalculator } from "@/components/portal/PortalForms";
import { requirePortalPageActor } from "@/server/portal/page-auth";
import { getMessages, listBudgetsForActor, listClientProjects, listPaymentsForActor } from "@/server/portal/services";

export default async function ClientPortalPage() {
  const actor = await requirePortalPageActor(["client", "admin"]);
  const projects = listClientProjects(actor);
  const payments = listPaymentsForActor(actor);
  const budgets = listBudgetsForActor(actor);
  const messages = getMessages(actor).messages;
  const greeting = actor.user.role === "admin" ? "Oi, Henrique" : `Ola, ${actor.user.name}`;
  const project = projects[0];

  return (
    <PortalShell actor={actor} role="client" title={greeting} subtitle="Acompanhe entregas, envie demandas e converse com a equipe vinculada ao seu projeto.">
      <section id="progress" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<FolderKanban size={18} />} label="Projetos" value={projects.length} href="#progress" />
        <Metric icon={<Wrench size={18} />} label="Demandas abertas" value={messages.length} href="#messages" />
        <Metric icon={<CreditCard size={18} />} label="Pagamentos" value={payments.length} href="#payments" />
        <Metric icon={<MessageSquare size={18} />} label="Mensagens" value={messages.length} href="#messages" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Check my project progress">
          <div className="grid gap-4">
            {projects.map((item) => (
              <article key={item.id} className="grid gap-4 border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-orange-500">{item.status}</p>
                    <h2 className="mt-1 text-xl font-black">{item.title}</h2>
                  </div>
                  <strong>{item.progressPercentage}%</strong>
                </div>
                <div className="h-2 bg-zinc-200 dark:bg-white/10">
                  <div className="h-full bg-orange-400" style={{ width: `${item.progressPercentage}%` }} />
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.description}</p>
                <div className="grid gap-2 text-sm sm:grid-cols-3">
                  <ProjectLink href={item.githubUrl || item.repositoryUrl} label="GitHub" />
                  <ProjectLink href={item.stagingUrl} label="Staging" />
                  <ProjectLink href={item.productionUrl || item.liveUrl} label="Production" />
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel id="new-project" title="Start new project">
          <ActionForm
            endpoint="/client/budgets"
            fields={[
              { name: "title", label: "Project title", required: true },
              { name: "description", label: "What should we build?", type: "textarea", required: true },
              { name: "features", label: "Feature count", type: "number", value: 6 },
              { name: "complexity", label: "Complexity 1-5", type: "number", value: 3 },
              { name: "integrations", label: "Integrations", type: "number", value: 1 },
            ]}
            submitLabel="Submit budget"
          />
        </Panel>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel id="solutions" title="View solutions">
          <div className="grid gap-2 text-sm">
            {["Sistemas web sob medida", "Automacoes operacionais", "Dashboards e integrações", "Portais com Cloudflare"].map((solution) => (
              <a key={solution} href={`/a-solucao?solution=${encodeURIComponent(solution)}`} className="border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]">
                {solution}
              </a>
            ))}
          </div>
        </Panel>
        <Panel id="estimate" title="Calculate estimates">
          <EstimateCalculator />
        </Panel>
        <Panel id="budget" title="Budget status">
          <div className="grid gap-2 text-sm">
            {budgets.map((budget) => (
              <a key={budget.id} href={`/client/budgets/${budget.id}`} className="flex items-center justify-between border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]">
                <span>{budget.title}</span>
                <strong>{budget.status}</strong>
              </a>
            ))}
          </div>
        </Panel>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel id="messages" title="Messages">
          {project ? (
            <ActionForm
              endpoint={`/client/projects/${project.id}/messages`}
              fields={[{ name: "body", label: "Message to team", type: "textarea", required: true }]}
              submitLabel="Send message"
            />
          ) : null}
          <div className="mt-4 grid gap-2 text-sm">
            {messages.slice(-5).map((message) => (
              <a key={message.id} href={`/client/messages/${message.conversationId}`} className="border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]">
                {message.body}
              </a>
            ))}
          </div>
        </Panel>
        <Panel id="payments" title="Payments">
          <div className="grid gap-2 text-sm">
            {payments.map((payment) => (
              <a key={payment.id} href={`/client/projects/${payment.projectId}/payments`} className="flex items-center justify-between border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]">
                <span>{payment.status}</span>
                <strong>{money(payment.grossAmountCents)}</strong>
              </a>
            ))}
          </div>
        </Panel>
        <Panel id="profile" title="Profile and settings">
          <ActionForm
            endpoint="/auth/profile"
            method="PATCH"
            fields={[
              { name: "name", label: "Name", value: actor.user.name, required: true },
              { name: "themePreference", label: "Theme", type: "select", value: actor.user.themePreference || "dark", options: ["dark", "light", "system"].map((value) => ({ value, label: value })) },
            ]}
            submitLabel="Save profile"
          />
        </Panel>
      </section>
    </PortalShell>
  );
}

function Metric({ icon, label, value, href }: { icon: ReactNode; label: string; value: ReactNode; href: string }) {
  return (
    <a href={href} className="grid gap-3 border border-black/10 bg-white p-4 transition hover:border-orange-400 dark:border-white/10 dark:bg-white/[0.04]">
      <span className="text-orange-500">{icon}</span>
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
      <strong className="text-2xl">{value}</strong>
    </a>
  );
}

function Panel({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="border border-black/10 bg-zinc-50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <h2 className="mb-4 text-xl font-black">{title}</h2>
      {children}
    </section>
  );
}

function ProjectLink({ href, label }: { href?: string; label: string }) {
  return href ? (
    <a href={href} className="flex items-center justify-between border border-black/10 px-3 py-2 font-semibold dark:border-white/10">
      {label}
      <ExternalLink size={15} />
    </a>
  ) : (
    <span className="border border-black/10 px-3 py-2 text-zinc-500 dark:border-white/10">{label}: pending</span>
  );
}

function money(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
