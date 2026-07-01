import type { ReactNode } from "react";
import { AlertCircle, Banknote, Clock3, FolderKanban, ListTodo } from "lucide-react";
import { PortalShell } from "@/components/portal/PortalShell";
import { ActionForm } from "@/components/portal/PortalForms";
import { requirePortalPageActor } from "@/server/portal/page-auth";
import { getMessages, listProgrammerDashboard } from "@/server/portal/services";

export default async function DeveloperPortalPage() {
  const actor = await requirePortalPageActor(["developer", "programmer", "admin"]);
  const dashboard = listProgrammerDashboard(actor);
  const messages = getMessages(actor).messages;
  const availableCents = dashboard.earnings.filter((earning) => earning.status === "available").reduce((sum, earning) => sum + earning.finalAmountCents, 0);
  const submittedSeconds = dashboard.timeEntries.reduce((sum, entry) => sum + entry.durationSeconds, 0);
  const blockedTasks = dashboard.tasks.filter((task) => task.status === "rejected" || task.status === "cancelled");
  const firstTask = dashboard.tasks[0];
  const firstProject = dashboard.projects[0];

  return (
    <PortalShell actor={actor} role="developer" title={`Ola, ${actor.user.name}`} subtitle="Projetos atribuidos, tarefas, links tecnicos, mensagens e historico de trabalho.">
      <section id="assigned" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<FolderKanban size={18} />} label="Assigned projects" value={dashboard.projects.length} href="#assigned" />
        <Metric icon={<ListTodo size={18} />} label="Assigned tasks" value={dashboard.tasks.length} href="#tasks" />
        <Metric icon={<Clock3 size={18} />} label="Registered hours" value={(submittedSeconds / 3600).toFixed(1)} href="#history" />
        <Metric icon={<Banknote size={18} />} label="Available earnings" value={money(availableCents)} href="#payments" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Projects assigned to me">
          <div className="grid gap-3">
            {dashboard.projects.map((project) => (
              <a key={project.id} href={`/developer/projects/${project.id}`} className="grid gap-3 border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <strong>{project.title}</strong>
                  <span className="text-xs font-black uppercase tracking-widest text-orange-500">{project.status}</span>
                </div>
                <div className="h-2 bg-zinc-200 dark:bg-white/10">
                  <div className="h-full bg-orange-400" style={{ width: `${project.progressPercentage}%` }} />
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{project.codeStatus || "Code status pending"}</p>
              </a>
            ))}
          </div>
        </Panel>

        <Panel id="tasks" title="Update task status">
          {firstTask ? (
            <ActionForm
              endpoint={`/developer/tasks/${firstTask.id}`}
              method="PATCH"
              fields={[
                { name: "status", label: "Status", type: "select", value: firstTask.status, options: ["todo", "in_progress", "review", "done", "rejected", "cancelled"].map((value) => ({ value, label: value })) },
                { name: "description", label: "Technical note", type: "textarea", value: firstTask.description },
              ]}
              submitLabel="Update task"
            />
          ) : (
            <p className="text-sm text-zinc-500">No tasks assigned.</p>
          )}
        </Panel>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="GitHub, staging and production links">
          {firstProject ? (
            <ActionForm
              endpoint={`/developer/projects/${firstProject.id}`}
              method="PATCH"
              fields={[
                { name: "githubUrl", label: "GitHub URL", type: "url", value: firstProject.githubUrl || firstProject.repositoryUrl || "" },
                { name: "stagingUrl", label: "Staging URL", type: "url", value: firstProject.stagingUrl || "" },
                { name: "productionUrl", label: "Production URL", type: "url", value: firstProject.productionUrl || firstProject.liveUrl || "" },
                { name: "technicalNotes", label: "Technical notes", type: "textarea", value: firstProject.technicalNotes || "" },
              ]}
              submitLabel="Save links"
            />
          ) : null}
        </Panel>
        <Panel id="messages" title="Messages">
          {firstProject ? (
            <ActionForm
              endpoint={`/developer/messages?projectId=${firstProject.id}`}
              fields={[{ name: "body", label: "Message", type: "textarea", required: true }]}
              submitLabel="Send message"
            />
          ) : null}
          <div className="mt-4 grid gap-2 text-sm">
            {messages.slice(-5).map((message) => (
              <a key={message.id} href={`/developer/messages/${message.conversationId}`} className="border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]">
                {message.body}
              </a>
            ))}
          </div>
        </Panel>
        <Panel id="requests" title="Change requests and blockers">
          <div className="grid gap-2 text-sm">
            {blockedTasks.length ? blockedTasks.map((task) => (
              <a key={task.id} href={`/developer/tasks/${task.id}`} className="flex items-center gap-2 border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]">
                <AlertCircle size={16} />
                {task.title}
              </a>
            )) : <p className="text-zinc-500">No blocked tasks.</p>}
          </div>
        </Panel>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel id="history" title="Project history">
          <div className="grid gap-2 text-sm">
            {dashboard.timeEntries.map((entry) => (
              <a key={entry.id} href={`/developer/time-entries/${entry.id}`} className="flex items-center justify-between border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]">
                <span>{entry.status}</span>
                <strong>{(entry.durationSeconds / 3600).toFixed(1)}h</strong>
              </a>
            ))}
          </div>
        </Panel>
        <Panel id="payments" title="Payments and payouts">
          <ActionForm
            endpoint="/developer/payout-requests"
            fields={[
              { name: "amountCents", label: "Amount cents", type: "number", value: Math.min(availableCents, 100000) },
              { name: "currency", label: "Currency", value: "BRL" },
            ]}
            submitLabel="Request payout"
          />
        </Panel>
        <Panel id="profile" title="Profile and password">
          <ActionForm
            endpoint="/auth/profile"
            method="PATCH"
            fields={[
              { name: "name", label: "Name", value: actor.user.name, required: true },
              { name: "themePreference", label: "Theme", type: "select", value: actor.user.themePreference || "dark", options: ["dark", "light", "system"].map((value) => ({ value, label: value })) },
              { name: "currentPassword", label: "Current password", type: "password" },
              { name: "newPassword", label: "New password", type: "password" },
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

function money(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
