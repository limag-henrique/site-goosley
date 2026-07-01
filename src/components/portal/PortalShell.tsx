import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarDays,
  Calculator,
  Clock3,
  CreditCard,
  FolderKanban,
  Home,
  LockKeyhole,
  MessageSquare,
  ReceiptText,
  Settings,
  ShieldCheck,
  User,
  Users,
  Wrench,
} from "lucide-react";
import type { RequestActor, UserRole } from "@/server/portal/types";
import { PortalTopActions } from "./PortalTopActions";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navByRole: Record<"admin" | "client" | "developer", NavItem[]> = {
  admin: [
    { href: "/meu-portal/admin", label: "Painel", icon: Home },
    { href: "/meu-portal/admin/users", label: "Usuarios", icon: Users },
    { href: "/meu-portal/admin/projects", label: "Projetos", icon: FolderKanban },
    { href: "/meu-portal/admin/tasks", label: "Tarefas", icon: Wrench },
    { href: "/meu-portal/admin/messages", label: "Mensagens", icon: MessageSquare },
    { href: "/meu-portal/admin/finance", label: "Financeiro", icon: CreditCard },
    { href: "/meu-portal/admin/settings", label: "Configuracoes", icon: Settings },
    { href: "/meu-portal/admin/security", label: "Seguranca", icon: ShieldCheck },
  ],
  client: [
    { href: "/meu-portal/client", label: "Meu projeto", icon: FolderKanban },
    { href: "/meu-portal/client/new-project", label: "Novo projeto", icon: Wrench },
    { href: "/meu-portal/client/solutions", label: "Solucoes", icon: Home },
    { href: "/meu-portal/client/estimate", label: "Calculadora", icon: Calculator },
    { href: "/meu-portal/client/budgets", label: "Orcamentos", icon: ReceiptText },
    { href: "/meu-portal/client/messages", label: "Mensagens", icon: MessageSquare },
    { href: "/meu-portal/client/payments", label: "Pagamentos", icon: CreditCard },
    { href: "/meu-portal/client/profile", label: "Perfil", icon: User },
  ],
  developer: [
    { href: "/meu-portal/developer", label: "Tarefas", icon: Wrench },
    { href: "/meu-portal/developer/projects", label: "Projetos", icon: FolderKanban },
    { href: "/meu-portal/developer/calendar", label: "Calendario", icon: CalendarDays },
    { href: "/meu-portal/developer/time", label: "Horas", icon: Clock3 },
    { href: "/meu-portal/developer/messages", label: "Mensagens", icon: MessageSquare },
    { href: "/meu-portal/developer/requests", label: "Pendencias", icon: ReceiptText },
    { href: "/meu-portal/developer/security", label: "Seguranca", icon: LockKeyhole },
    { href: "/meu-portal/developer/profile", label: "Perfil", icon: User },
  ],
};

export function PortalShell({
  actor,
  role,
  title,
  subtitle,
  children,
  currentPath,
}: {
  actor: RequestActor;
  role: "admin" | "client" | "developer";
  title: string;
  subtitle: string;
  children: React.ReactNode;
  currentPath?: string;
}) {
  const nav = navByRole[role];

  const themeClass = actor.user.themePreference === "light" ? "" : "dark";

  return (
    <div className={`portal-theme-root ${themeClass}`}>
    <main className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-[#080808] dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-black/10 bg-white px-4 py-4 dark:border-white/10 dark:bg-zinc-950 lg:border-b-0 lg:border-r">
          <Link href="/meu-portal" className="flex items-center gap-3 px-2 py-3">
            <span className="grid h-10 w-10 place-items-center bg-orange-400 font-black text-black">G</span>
            <span>
              <span className="block text-sm font-black uppercase tracking-[0.24em]">Goosley</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Portal operacional</span>
            </span>
          </Link>
          <nav className="mt-8 grid gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-11 items-center gap-3 px-3 text-sm font-semibold transition ${
                    currentPath === item.href
                      ? "bg-zinc-100 text-zinc-950 dark:bg-white/10 dark:text-white"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-black/10 bg-zinc-100/90 px-5 py-4 backdrop-blur dark:border-white/10 dark:bg-[#080808]/90 lg:px-8">
            <div>
              <h1 className="text-2xl font-black tracking-tight md:text-3xl">{title}</h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <button aria-label="Notificacoes" className="grid h-10 w-10 place-items-center border border-black/10 bg-white dark:border-white/10 dark:bg-white/5">
                <Bell size={18} />
              </button>
              <PortalTopActions user={actor.user} />
            </div>
          </header>
          <div className="px-5 py-6 lg:px-8">{children}</div>
        </section>
      </div>
    </main>
    </div>
  );
}

export function roleLabel(role: UserRole) {
  if (role === "admin") return "Administrador";
  if (role === "client") return "Cliente";
  return "Desenvolvedor";
}
