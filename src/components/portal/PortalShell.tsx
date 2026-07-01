import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Calculator,
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
    { href: "#overview", label: "Dashboard", icon: Home },
    { href: "#users", label: "Users", icon: Users },
    { href: "#projects", label: "Projects", icon: FolderKanban },
    { href: "#messages", label: "Messages", icon: MessageSquare },
    { href: "#finance", label: "Finance", icon: CreditCard },
    { href: "#settings", label: "Settings", icon: Settings },
    { href: "#security", label: "Security", icon: ShieldCheck },
  ],
  client: [
    { href: "#progress", label: "Check my project progress", icon: FolderKanban },
    { href: "#new-project", label: "Start new project", icon: Wrench },
    { href: "#solutions", label: "View solutions", icon: Home },
    { href: "#estimate", label: "Calculate estimates", icon: Calculator },
    { href: "#budget", label: "Submit budget", icon: ReceiptText },
    { href: "#messages", label: "Messages", icon: MessageSquare },
    { href: "#payments", label: "Payments", icon: CreditCard },
    { href: "#settings", label: "Settings", icon: Settings },
    { href: "#profile", label: "Profile", icon: User },
  ],
  developer: [
    { href: "#assigned", label: "Assigned projects", icon: FolderKanban },
    { href: "#tasks", label: "Tasks", icon: Wrench },
    { href: "#messages", label: "Messages", icon: MessageSquare },
    { href: "#requests", label: "Change requests", icon: ReceiptText },
    { href: "#security", label: "Security", icon: LockKeyhole },
    { href: "#profile", label: "Profile", icon: User },
  ],
};

export function PortalShell({
  actor,
  role,
  title,
  subtitle,
  children,
}: {
  actor: RequestActor;
  role: "admin" | "client" | "developer";
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const nav = navByRole[role];

  const themeClass = actor.user.themePreference === "light" ? "" : "dark";

  return (
    <div className={themeClass}>
    <main className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-[#080808] dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-black/10 bg-white px-4 py-4 dark:border-white/10 dark:bg-zinc-950 lg:border-b-0 lg:border-r">
          <Link href="/meu-portal" className="flex items-center gap-3 px-2 py-3">
            <span className="grid h-10 w-10 place-items-center bg-orange-400 font-black text-black">G</span>
            <span>
              <span className="block text-sm font-black uppercase tracking-[0.24em]">Goosley</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Operational Portal</span>
            </span>
          </Link>
          <nav className="mt-8 grid gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex min-h-11 items-center gap-3 px-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/5"
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </a>
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
              <button aria-label="Notifications" className="grid h-10 w-10 place-items-center border border-black/10 bg-white dark:border-white/10 dark:bg-white/5">
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
  return "Developer";
}
