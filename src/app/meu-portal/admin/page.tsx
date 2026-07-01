import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, Banknote, CheckCircle2, Clock3, FolderKanban, MessageSquare, ShieldCheck, Users } from "lucide-react";
import { PortalShell } from "@/components/portal/PortalShell";
import { ActionForm } from "@/components/portal/PortalForms";
import { requirePortalPageActor } from "@/server/portal/page-auth";
import { adminDashboard, getMessages } from "@/server/portal/services";

export default async function AdminPortalPage() {
  const actor = await requirePortalPageActor(["admin"]);
  const dashboard = adminDashboard(actor);
  const messages = getMessages(actor).messages;
  const activeProjects = dashboard.projects.filter((project) => project.status === "active");
  const delayedProjects = dashboard.projects.filter((project) => project.status === "paused");
  const completedProjects = dashboard.projects.filter((project) => project.status === "completed");
  const receivedCents = dashboard.payments.filter((payment) => payment.status === "verified" || payment.status === "paid").reduce((sum, payment) => sum + payment.grossAmountCents, 0);
  const pendingCents = dashboard.payments.filter((payment) => payment.status === "pending").reduce((sum, payment) => sum + payment.grossAmountCents, 0);
  const estimatedCents = dashboard.projects.reduce((sum, project) => sum + (project.finalPriceCents || project.budgetEstimateCents || project.grossAmountPaidByClientCents), 0);
  const clients = dashboard.users.filter((user) => user.role === "client");
  const developers = dashboard.users.filter((user) => user.role === "developer");

  return (
    <PortalShell actor={actor} role="admin" title="Oi, Henrique" subtitle="Operacao, projetos, usuarios, financeiro e seguranca centralizados.">
      <section id="overview" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<FolderKanban size={18} />} label="Active projects" value={activeProjects.length} href="#projects" />
        <Metric icon={<AlertTriangle size={18} />} label="Delayed projects" value={delayedProjects.length} href="#projects" tone="warn" />
        <Metric icon={<CheckCircle2 size={18} />} label="Completed projects" value={completedProjects.length} href="#projects" />
        <Metric icon={<Users size={18} />} label="Active clients" value={clients.length} href="#users" />
        <Metric icon={<Banknote size={18} />} label="Estimated revenue" value={money(estimatedCents)} href="#finance" />
        <Metric icon={<Banknote size={18} />} label="Received revenue" value={money(receivedCents)} href="#finance" />
        <Metric icon={<Clock3 size={18} />} label="Pending revenue" value={money(pendingCents)} href="#finance" />
        <Metric icon={<MessageSquare size={18} />} label="Recent messages" value={messages.length} href="#messages" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel id="projects" title="Project management">
          <div className="grid gap-3">
            {dashboard.projects.map((project) => (
              <a key={project.id} href={`/admin/projects/${project.id}`} className="grid gap-3 border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <strong>{project.title}</strong>
                  <span className="text-xs font-black uppercase tracking-widest text-orange-500">{project.status}</span>
                </div>
                <div className="h-2 bg-zinc-200 dark:bg-white/10">
                  <div className="h-full bg-orange-400" style={{ width: `${project.progressPercentage}%` }} />
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{project.progressPercentage}% progress, due {project.dueDate ? date(project.dueDate) : "not scheduled"}</p>
              </a>
            ))}
          </div>
        </Panel>

        <Panel title="Create project">
          <ActionForm
            endpoint="/admin/projects"
            fields={[
              { name: "clientId", label: "Client ID", value: clients[0]?.id || "", required: true },
              { name: "title", label: "Title", required: true },
              { name: "description", label: "Description", type: "textarea", required: true },
              { name: "budgetEstimateCents", label: "Budget estimate cents", type: "number" },
              { name: "dueDate", label: "Due date", type: "date" },
            ]}
            submitLabel="Create project"
          />
        </Panel>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel id="users" title="User management">
          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <ActionForm
              endpoint="/admin/users/programmers"
              fields={[
                { name: "name", label: "Developer name", required: true },
                { name: "email", label: "Email", type: "email", required: true },
                { name: "password", label: "Temporary password", type: "password", value: "Portal123!", required: true },
              ]}
              submitLabel="Add developer"
            />
            <div className="grid gap-2 text-sm">
              <strong>Developers</strong>
              {developers.map((user) => (
                <a key={user.id} href={`/admin/users/${user.id}`} className="flex items-center justify-between border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                  <span>{user.name}</span>
                  <span className="text-zinc-500">{user.email}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="grid gap-2 text-sm">
            <strong>Clients</strong>
            {clients.map((user) => (
              <a key={user.id} href={`/admin/users/${user.id}`} className="flex items-center justify-between border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                <span>{user.name}</span>
                <span className="text-zinc-500">{user.email}</span>
              </a>
            ))}
          </div>
        </Panel>

        <Panel id="finance" title="Financial management">
          <div className="grid gap-3">
            {dashboard.payments.map((payment) => (
              <a key={payment.id} href={`/admin/payments/${payment.id}`} className="flex items-center justify-between border border-black/10 bg-white p-3 text-sm dark:border-white/10 dark:bg-white/[0.04]">
                <span>{payment.status} - {payment.projectId}</span>
                <strong>{money(payment.grossAmountCents)}</strong>
              </a>
            ))}
          </div>
          <div className="mt-5">
            <ActionForm
              endpoint="/admin/payments"
              fields={[
                { name: "projectId", label: "Project ID", value: dashboard.projects[0]?.id || "", required: true },
                { name: "grossAmountCents", label: "Amount cents", type: "number", required: true },
                { name: "dueDate", label: "Due date", type: "date" },
                { name: "status", label: "Status", type: "select", options: ["pending", "paid", "verified", "failed"].map((value) => ({ value, label: value })) },
              ]}
              submitLabel="Add payment"
            />
          </div>
        </Panel>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel id="messages" title="Messages">
          <div className="grid gap-2 text-sm">
            {messages.slice(-6).map((message) => (
              <a key={message.id} href={`/admin/messages/${message.conversationId}`} className="border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]">
                {message.body}
              </a>
            ))}
          </div>
        </Panel>
        <Panel id="settings" title="Revenue settings">
          <ActionForm
            endpoint="/admin/settings"
            method="PATCH"
            fields={dashboard.settings
              .filter((setting) => setting.key.startsWith("revenue."))
              .map((setting) => ({ name: setting.key, label: setting.key, type: "number" as const, value: Number(setting.value) || 0 }))}
            submitLabel="Save settings"
          />
        </Panel>
        <Panel id="security" title="Security and audit">
          <Link href="/admin/audit-logs" className="flex items-center justify-between border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <span>Audit records</span>
            <strong>{dashboard.auditLogCount}</strong>
          </Link>
          <Link href="/admin/users" className="mt-3 flex items-center justify-between border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <span>Permissions</span>
            <ShieldCheck size={18} />
          </Link>
        </Panel>
      </section>
    </PortalShell>
  );
}

function Metric({ icon, label, value, href, tone }: { icon: ReactNode; label: string; value: ReactNode; href: string; tone?: "warn" }) {
  return (
    <a href={href} className="grid gap-3 border border-black/10 bg-white p-4 transition hover:border-orange-400 dark:border-white/10 dark:bg-white/[0.04]">
      <span className={tone === "warn" ? "text-red-500" : "text-orange-500"}>{icon}</span>
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

function date(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}
