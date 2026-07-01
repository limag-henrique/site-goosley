import type { ReactNode } from "react";
import Link from "next/link";
import { AlertCircle, CalendarDays, CheckCircle2, Clock3, ExternalLink, ShieldCheck } from "lucide-react";
import { ActionForm, DeveloperTimeTracker, PortalProjectEstimator, TaskCommentForm } from "./PortalForms";
import type { RequestActor } from "@/server/portal/types";
import {
  adminDashboard,
  getMessages,
  listBudgetsForActor,
  listClientProjects,
  listPaymentsForActor,
  listProgrammerDashboard,
  listPayoutRequests,
} from "@/server/portal/services";

export function AdminPortalContent({ actor, section = "overview" }: { actor: RequestActor; section?: string }) {
  const dashboard = adminDashboard(actor);
  const messages = getMessages(actor).messages;
  const clients = dashboard.users.filter((user) => user.role === "client");
  const developers = dashboard.users.filter((user) => user.role === "developer" || user.role === "programmer");
  const payouts = listPayoutRequests(actor);
  const firstProject = dashboard.projects[0];

  if (section === "users") {
    return (
      <Grid>
        <Panel title="Criar desenvolvedor">
          <ActionForm
            endpoint="/admin/users/programmers"
            fields={[
              { name: "name", label: "Nome", required: true },
              { name: "email", label: "Email", type: "email", required: true },
              { name: "password", label: "Senha temporaria", type: "password", value: "Portal123!", required: true },
              { name: "hourlyReferenceRateCents", label: "Valor/hora sugerido em centavos", type: "number", value: 0 },
            ]}
            submitLabel="Adicionar"
          />
        </Panel>
        <Panel title="Aprovar valor/hora">
          <div className="grid gap-4">
            {developers.map((user) => {
              const profile = dashboard.programmerProfiles.find((item) => item.userId === user.id);
              return (
                <div key={user.id} className="border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <strong>{user.name}</strong>
                    <Badge tone={profile?.hourlyRateApprovedAt ? "ok" : "warn"}>{profile?.hourlyRateApprovedAt ? "Aprovado" : "Pendente"}</Badge>
                  </div>
                  <ActionForm
                    endpoint={`/admin/users/${user.id}/programmer-profile`}
                    method="PATCH"
                    fields={[
                      { name: "hourlyReferenceRateCents", label: "Valor/hora em centavos", type: "number", value: profile?.hourlyReferenceRateCents || 0 },
                      { name: "approveRate", label: "Aprovar agora", type: "select", value: profile?.hourlyRateApprovedAt ? "true" : "false", options: yesNoOptions },
                      { name: "notes", label: "Observacoes", type: "textarea", value: profile?.notes || "" },
                    ]}
                    submitLabel="Salvar aprovacao"
                  />
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel title="Clientes">
          <List>
            {clients.map((user) => (
              <ListItem key={user.id} title={user.name} meta={`${user.email} - ${statusPt(user.status)}`} />
            ))}
          </List>
        </Panel>
      </Grid>
    );
  }

  if (section === "projects") {
    return (
      <Grid>
        <Panel title="Projetos e entregaveis">
          <List>
            {dashboard.projects.map((project) => (
              <div key={project.id} className="border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <strong>{project.title}</strong>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{project.description}</p>
                  </div>
                  <Badge>{statusPt(project.status)}</Badge>
                </div>
                <div className="mt-3 h-2 bg-zinc-200 dark:bg-white/10">
                  <div className="h-full bg-orange-400" style={{ width: `${project.progressPercentage}%` }} />
                </div>
                <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                  <SafeLink href={project.githubUrl || project.repositoryUrl} label="Repositorio" />
                  <SafeLink href={project.stagingUrl} label="Homologacao" />
                  <SafeLink href={project.productionUrl || project.liveUrl} label="Producao" />
                </div>
              </div>
            ))}
          </List>
        </Panel>
        <Panel title="Criar projeto">
          <ActionForm
            endpoint="/admin/projects"
            fields={[
              { name: "clientId", label: "Cliente", type: "select", value: clients[0]?.id || "", options: clients.map((user) => ({ value: user.id, label: user.name })) },
              { name: "title", label: "Titulo", required: true },
              { name: "description", label: "Descricao", type: "textarea", required: true },
              { name: "budgetEstimateCents", label: "Estimativa em centavos", type: "number" },
              { name: "dueDate", label: "Prazo", type: "date" },
            ]}
            submitLabel="Criar projeto"
          />
        </Panel>
      </Grid>
    );
  }

  if (section === "tasks") {
    return (
      <Grid>
        <Panel title="Criar tarefa">
          <ActionForm
            endpoint="/admin/tasks"
            fields={[
              { name: "projectId", label: "Projeto", type: "select", value: firstProject?.id || "", options: dashboard.projects.map((project) => ({ value: project.id, label: project.title })) },
              { name: "assignedToProgrammerId", label: "Responsavel", type: "select", value: developers[0]?.id || "", options: developers.map((user) => ({ value: user.id, label: user.name })) },
              { name: "title", label: "O que precisa ser feito", required: true },
              { name: "description", label: "Detalhes", type: "textarea", required: true },
              { name: "dueDate", label: "Prazo", type: "date" },
              { name: "estimatedHours", label: "Horas estimadas", type: "number" },
            ]}
            submitLabel="Criar tarefa"
          />
        </Panel>
        <Panel title="Tarefas de todos os usuarios">
          <TaskList tasks={dashboard.tasks} users={dashboard.users} />
        </Panel>
      </Grid>
    );
  }

  if (section === "messages") {
    return (
      <Grid>
        <Panel title="Enviar mensagem">
          {firstProject ? (
            <ActionForm endpoint={`/admin/messages?projectId=${firstProject.id}`} fields={[{ name: "body", label: "Mensagem", type: "textarea", required: true }]} submitLabel="Enviar" />
          ) : (
            <Empty>Nenhum projeto disponivel.</Empty>
          )}
        </Panel>
        <Panel title="Historico de mensagens">
          <MessageList messages={messages} />
        </Panel>
      </Grid>
    );
  }

  if (section === "finance") {
    return (
      <Grid>
        <Panel title="Pagamentos e repasses">
          <List>
            {dashboard.payments.map((payment) => (
              <ListItem key={payment.id} title={money(payment.grossAmountCents)} meta={`${statusPt(payment.status)} - ${payment.projectId}`} />
            ))}
            {payouts.map((payout) => (
              <ListItem key={payout.id} title={`Saque ${money(payout.amountCents)}`} meta={statusPt(payout.status)} />
            ))}
          </List>
        </Panel>
        <Panel title="Adicionar pagamento">
          <ActionForm
            endpoint="/admin/payments"
            fields={[
              { name: "projectId", label: "Projeto", type: "select", value: firstProject?.id || "", options: dashboard.projects.map((project) => ({ value: project.id, label: project.title })) },
              { name: "grossAmountCents", label: "Valor em centavos", type: "number", required: true },
              { name: "dueDate", label: "Vencimento", type: "date" },
              { name: "status", label: "Status", type: "select", options: paymentOptions },
            ]}
            submitLabel="Adicionar"
          />
        </Panel>
      </Grid>
    );
  }

  if (section === "settings" || section === "security") {
    return (
      <Grid>
        <Panel title="Configuracoes de receita">
          <ActionForm
            endpoint="/admin/settings"
            method="PATCH"
            fields={dashboard.settings
              .filter((setting) => setting.key.startsWith("revenue."))
              .map((setting) => ({ name: setting.key, label: setting.description, type: "number" as const, value: Number(setting.value) || 0 }))}
            submitLabel="Salvar"
          />
        </Panel>
        <Panel title="Seguranca e auditoria">
          <ListItem title="Registros de auditoria" meta={`${dashboard.auditLogCount} eventos monitorados`} icon={<ShieldCheck size={18} />} />
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">O administrador controla usuarios, mensagens, entregaveis, pagamentos, permissoes e revisoes de cada perfil.</p>
        </Panel>
      </Grid>
    );
  }

  return (
    <Grid>
      <Panel title="Controle central">
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Area do administrador para comandar projetos, usuarios, mensagens, entregaveis, financeiro, seguranca e aprovacoes. Cada bloco abaixo leva para uma pagina dedicada do portal.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Shortcut href="/meu-portal/admin/users" title="Usuarios" text="Criar acessos, aprovar valor/hora e revisar status." />
          <Shortcut href="/meu-portal/admin/projects" title="Projetos" text="Gerenciar progresso, links tecnicos e entregaveis." />
          <Shortcut href="/meu-portal/admin/tasks" title="Tarefas" text="Criar tarefas com prazo, responsavel e prioridade." />
          <Shortcut href="/meu-portal/admin/finance" title="Financeiro" text="Controlar pagamentos, repasses e calculos." />
        </div>
      </Panel>
      <Panel title="Entregaveis recentes">
        <List>
          {dashboard.projects.map((project) => (
            <ListItem key={project.id} title={project.title} meta={`Progresso ${project.progressPercentage}% - prazo ${project.dueDate ? date(project.dueDate) : "a definir"}`} />
          ))}
        </List>
      </Panel>
      <Panel title="Mensagens recentes">
        <MessageList messages={messages.slice(-5)} />
      </Panel>
    </Grid>
  );
}

export function ClientPortalContent({ actor, section = "overview" }: { actor: RequestActor; section?: string }) {
  const projects = listClientProjects(actor);
  const payments = listPaymentsForActor(actor);
  const budgets = listBudgetsForActor(actor);
  const messages = getMessages(actor).messages;
  const project = projects[0];

  if (section === "new-project" || section === "estimate") {
    return (
      <Panel title="Calculadora de novo projeto">
        <PortalProjectEstimator />
      </Panel>
    );
  }

  if (section === "solutions") {
    return (
      <Grid>
        {solutionCards.map((item) => (
          <Panel key={item.title} title={item.title}>
            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{item.text}</p>
            <Link href="/meu-portal/client/estimate" className="mt-4 inline-flex bg-orange-400 px-4 py-3 text-sm font-black uppercase tracking-widest text-black">
              Estimar no portal
            </Link>
          </Panel>
        ))}
      </Grid>
    );
  }

  if (section === "budgets") {
    return (
      <Panel title="Orcamentos">
        <List>
          {budgets.map((budget) => (
            <ListItem key={budget.id} title={budget.title} meta={`${money(budget.estimatedValueCents)} - ${statusPt(budget.status)}`} />
          ))}
        </List>
      </Panel>
    );
  }

  if (section === "messages") {
    return (
      <Grid>
        <Panel title="Enviar mensagem para a equipe">
          {project ? (
            <ActionForm endpoint={`/client/projects/${project.id}/messages`} fields={[{ name: "body", label: "Mensagem", type: "textarea", required: true }]} submitLabel="Enviar" />
          ) : (
            <Empty>Nenhum projeto ativo.</Empty>
          )}
        </Panel>
        <Panel title="Conversa do projeto">
          <MessageList messages={messages} />
        </Panel>
      </Grid>
    );
  }

  if (section === "payments") {
    return (
      <Panel title="Pagamentos">
        <List>
          {payments.map((payment) => (
            <ListItem key={payment.id} title={money(payment.grossAmountCents)} meta={`${statusPt(payment.status)} - ${payment.dueDate ? date(payment.dueDate) : "sem vencimento"}`} />
          ))}
        </List>
      </Panel>
    );
  }

  if (section === "profile") {
    return (
      <Panel title="Perfil">
        <ActionForm
          endpoint="/auth/profile"
          method="PATCH"
          fields={[
            { name: "name", label: "Nome", value: actor.user.name, required: true },
            { name: "themePreference", label: "Tema", type: "select", value: actor.user.themePreference || "dark", options: themeOptions },
          ]}
          submitLabel="Salvar perfil"
        />
      </Panel>
    );
  }

  return (
    <Grid>
      <Panel title="Meus projetos">
        <List>
          {projects.map((item) => (
            <div key={item.id} className="border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <strong>{item.title}</strong>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{item.description}</p>
                </div>
                <Badge>{statusPt(item.status)}</Badge>
              </div>
              <div className="mt-3 h-2 bg-zinc-200 dark:bg-white/10">
                <div className="h-full bg-orange-400" style={{ width: `${item.progressPercentage}%` }} />
              </div>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Prazo: {item.dueDate ? date(item.dueDate) : "a definir"}</p>
            </div>
          ))}
        </List>
      </Panel>
      <Panel title="Proximo projeto">
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">Simule escopo, prazo e investimento usando a calculadora interna. A estimativa vira um orcamento dentro do portal.</p>
        <Link href="/meu-portal/client/estimate" className="mt-4 inline-flex bg-orange-400 px-4 py-3 text-sm font-black uppercase tracking-widest text-black">
          Abrir calculadora
        </Link>
      </Panel>
    </Grid>
  );
}

export function DeveloperPortalContent({ actor, section = "overview" }: { actor: RequestActor; section?: string }) {
  const dashboard = listProgrammerDashboard(actor);
  const messages = getMessages(actor).messages;
  const tasks = dashboard.tasks;
  const projects = dashboard.projects;
  const firstProject = projects[0];
  const blockedTasks = tasks.filter((task) => task.status === "rejected" || task.status === "cancelled");

  if (section === "projects") {
    return (
      <Grid>
        <Panel title="Projetos atribuidos">
          <List>
            {projects.map((project) => (
              <ListItem key={project.id} title={project.title} meta={`${statusPt(project.status)} - ${project.codeStatus || "status tecnico pendente"}`} />
            ))}
          </List>
        </Panel>
        <Panel title="Links tecnicos">
          {firstProject ? (
            <ActionForm
              endpoint={`/developer/projects/${firstProject.id}`}
              method="PATCH"
              fields={[
                { name: "githubUrl", label: "GitHub", type: "url", value: firstProject.githubUrl || firstProject.repositoryUrl || "" },
                { name: "stagingUrl", label: "Homologacao", type: "url", value: firstProject.stagingUrl || "" },
                { name: "productionUrl", label: "Producao", type: "url", value: firstProject.productionUrl || firstProject.liveUrl || "" },
                { name: "technicalNotes", label: "Notas tecnicas", type: "textarea", value: firstProject.technicalNotes || "" },
              ]}
              submitLabel="Salvar links"
            />
          ) : null}
        </Panel>
      </Grid>
    );
  }

  if (section === "calendar") {
    return <TaskCalendar tasks={tasks} />;
  }

  if (section === "time") {
    return (
      <Panel title="Apontamento de horas">
        <DeveloperTimeTracker projects={projects} tasks={tasks} timeEntries={dashboard.timeEntries} />
      </Panel>
    );
  }

  if (section === "messages") {
    return (
      <Grid>
        <Panel title="Enviar mensagem">
          {firstProject ? (
            <ActionForm endpoint={`/developer/messages?projectId=${firstProject.id}`} fields={[{ name: "body", label: "Mensagem", type: "textarea", required: true }]} submitLabel="Enviar" />
          ) : null}
        </Panel>
        <Panel title="Mensagens">
          <MessageList messages={messages} />
        </Panel>
      </Grid>
    );
  }

  if (section === "requests") {
    return (
      <Panel title="Pendencias e bloqueios">
        <List>
          {blockedTasks.length ? blockedTasks.map((task) => <ListItem key={task.id} title={task.title} meta={task.description} icon={<AlertCircle size={18} />} />) : <Empty>Nenhuma pendencia critica.</Empty>}
        </List>
      </Panel>
    );
  }

  if (section === "security" || section === "profile") {
    return (
      <Grid>
        <Panel title="Perfil">
          <ActionForm
            endpoint="/auth/profile"
            method="PATCH"
            fields={[
              { name: "name", label: "Nome", value: actor.user.name, required: true },
              { name: "themePreference", label: "Tema", type: "select", value: actor.user.themePreference || "dark", options: themeOptions },
              { name: "currentPassword", label: "Senha atual", type: "password" },
              { name: "newPassword", label: "Nova senha", type: "password" },
            ]}
            submitLabel="Salvar"
          />
        </Panel>
        <RatePanel profile={dashboard.programmerProfile} />
      </Grid>
    );
  }

  return (
    <Grid>
      <Panel title="Tarefas">
        <div className="grid gap-4">
          {tasks.map((task) => (
            <div key={task.id} className="border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <strong>{task.title}</strong>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{task.description}</p>
                </div>
                <Badge tone={task.status === "done" ? "ok" : task.priority === "urgent" ? "warn" : undefined}>{statusPt(task.status)}</Badge>
              </div>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Prazo: {task.dueDate ? date(task.dueDate) : "a definir"} - estimativa: {task.estimatedHours || 0}h</p>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <ActionForm
                  endpoint={`/developer/tasks/${task.id}`}
                  method="PATCH"
                  fields={[
                    { name: "status", label: "Status", type: "select", value: task.status, options: taskOptions },
                    { name: "description", label: "Nota tecnica", type: "textarea", value: task.description },
                  ]}
                  submitLabel="Atualizar tarefa"
                />
                <TaskCommentForm task={task} endpoint={`/developer/messages?projectId=${task.projectId}`} />
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Calendario de prazos">
        <MiniCalendar tasks={tasks} />
      </Panel>
      <Panel title="Timer">
        <DeveloperTimeTracker projects={projects} tasks={tasks} timeEntries={dashboard.timeEntries} />
      </Panel>
      <RatePanel profile={dashboard.programmerProfile} />
    </Grid>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-6 xl:grid-cols-2">{children}</div>;
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-black/10 bg-zinc-50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <h2 className="mb-4 text-xl font-black">{title}</h2>
      {children}
    </section>
  );
}

function Shortcut({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <Link href={href} className="border border-black/10 bg-white p-4 transition hover:border-orange-400 dark:border-white/10 dark:bg-white/[0.04]">
      <strong>{title}</strong>
      <span className="mt-2 block text-sm text-zinc-600 dark:text-zinc-400">{text}</span>
    </Link>
  );
}

function List({ children }: { children: ReactNode }) {
  return <div className="grid gap-3">{children}</div>;
}

function ListItem({ title, meta, icon }: { title: string; meta: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border border-black/10 bg-white p-3 text-sm dark:border-white/10 dark:bg-white/[0.04]">
      <span className="flex items-center gap-2 font-semibold">{icon}{title}</span>
      <span className="text-zinc-500 dark:text-zinc-400">{meta}</span>
    </div>
  );
}

function MessageList({ messages }: { messages: { id: string; body: string; createdAt: string }[] }) {
  if (!messages.length) return <Empty>Nenhuma mensagem registrada.</Empty>;
  return (
    <List>
      {messages.slice().reverse().map((message) => (
        <ListItem key={message.id} title={message.body} meta={date(message.createdAt)} />
      ))}
    </List>
  );
}

function TaskList({ tasks, users }: { tasks: { id: string; title: string; status: string; dueDate?: string; assignedToProgrammerId?: string }[]; users: { id: string; name: string }[] }) {
  return (
    <List>
      {tasks.map((task) => (
        <ListItem
          key={task.id}
          title={task.title}
          meta={`${statusPt(task.status)} - ${users.find((user) => user.id === task.assignedToProgrammerId)?.name || "sem responsavel"} - ${task.dueDate ? date(task.dueDate) : "sem prazo"}`}
        />
      ))}
    </List>
  );
}

function TaskCalendar({ tasks }: { tasks: { id: string; title: string; status: string; dueDate?: string }[] }) {
  const dated = tasks.filter((task) => task.dueDate).sort((a, b) => new Date(a.dueDate || "").getTime() - new Date(b.dueDate || "").getTime());
  return (
    <Panel title="Calendario de tarefas">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {dated.map((task) => (
          <div key={task.id} className="border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <CalendarDays className="mb-3 text-orange-500" size={20} />
            <strong>{date(task.dueDate || "")}</strong>
            <p className="mt-2 text-sm">{task.title}</p>
            <Badge>{statusPt(task.status)}</Badge>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function MiniCalendar({ tasks }: { tasks: { id: string; title: string; dueDate?: string; status: string }[] }) {
  const dated = tasks.filter((task) => task.dueDate).slice(0, 5);
  if (!dated.length) return <Empty>Nenhum prazo definido.</Empty>;
  return (
    <List>
      {dated.map((task) => (
        <ListItem key={task.id} title={task.title} meta={`${date(task.dueDate || "")} - ${statusPt(task.status)}`} icon={<Clock3 size={16} />} />
      ))}
    </List>
  );
}

function RatePanel({ profile }: { profile?: { hourlyReferenceRateCents?: number; hourlyRateApprovedAt?: string; hourlyRatePendingCents?: number } }) {
  return (
    <Panel title="Valor/hora">
      {profile?.hourlyRateApprovedAt && profile.hourlyReferenceRateCents != null ? (
        <ListItem title={money(profile.hourlyReferenceRateCents)} meta={`Aprovado em ${date(profile.hourlyRateApprovedAt)}`} icon={<CheckCircle2 size={18} />} />
      ) : (
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Seu valor/hora ainda precisa ser aprovado pelo administrador antes de aparecer no portal. Valor sugerido: {profile?.hourlyRatePendingCents != null ? money(profile.hourlyRatePendingCents) : "a definir"}.
        </p>
      )}
    </Panel>
  );
}

function SafeLink({ href, label }: { href?: string; label: string }) {
  return href ? (
    <a href={href} className="flex items-center justify-between border border-black/10 px-3 py-2 font-semibold dark:border-white/10">
      {label}
      <ExternalLink size={15} />
    </a>
  ) : (
    <span className="border border-black/10 px-3 py-2 text-zinc-500 dark:border-white/10">{label}: pendente</span>
  );
}

function Badge({ children, tone }: { children: ReactNode; tone?: "ok" | "warn" }) {
  const className = tone === "ok" ? "text-emerald-600 dark:text-emerald-300" : tone === "warn" ? "text-red-600 dark:text-red-300" : "text-orange-500";
  return <span className={`text-xs font-black uppercase tracking-widest ${className}`}>{children}</span>;
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-zinc-500 dark:text-zinc-400">{children}</p>;
}

function money(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function date(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

function statusPt(value: string) {
  const labels: Record<string, string> = {
    active: "ativo",
    approved: "aprovado",
    available: "disponivel",
    cancelled: "cancelado",
    completed: "concluido",
    converted: "convertido",
    disabled: "desativado",
    done: "concluido",
    draft: "rascunho",
    failed: "falhou",
    in_progress: "em andamento",
    invited: "convidado",
    paid: "pago",
    paused: "pausado",
    pending: "pendente",
    payout_requested: "saque solicitado",
    rejected: "rejeitado",
    requested: "solicitado",
    review: "em revisao",
    submitted: "enviado",
    suspended: "suspenso",
    todo: "a fazer",
    verified: "verificado",
  };
  return labels[value] || value;
}

const yesNoOptions = [
  { value: "true", label: "Sim" },
  { value: "false", label: "Nao" },
];

const themeOptions = [
  { value: "dark", label: "Escuro" },
  { value: "light", label: "Claro" },
  { value: "system", label: "Sistema" },
];

const taskOptions = ["todo", "in_progress", "review", "done", "rejected", "cancelled"].map((value) => ({ value, label: statusPt(value) }));
const paymentOptions = ["pending", "paid", "verified", "failed"].map((value) => ({ value, label: statusPt(value) }));

const solutionCards = [
  { title: "Landing pages", text: "Captacao de leads com pagina rapida, clara e conectada ao seu funil." },
  { title: "E-commerce", text: "Loja completa com checkout, catalogo, operacao e acompanhamento de pagamentos." },
  { title: "Aplicativos", text: "MVP, PWA ou plataforma sob medida para operacoes internas e clientes." },
  { title: "Automacoes", text: "Fluxos para WhatsApp, CRM, atendimento, back-office e reducao de tarefas manuais." },
  { title: "Sistemas web", text: "Backends, paineis, integracoes, extracao de dados e dashboards operacionais." },
  { title: "Agentes corporativos", text: "Assistentes internos com base de conhecimento, permissoes e canais de equipe." },
];
