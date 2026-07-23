"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarDays,
  Calculator,
  CreditCard,
  FolderKanban,
  Home,
  LockKeyhole,
  Menu,
  MessageSquare,
  ReceiptText,
  ShieldCheck,
  User,
  Users,
  Wrench,
  X,
} from "lucide-react";
import type { RequestActor } from "@/server/portal/types";
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
    { href: "/meu-portal/admin/security", label: "Seguranca", icon: ShieldCheck },
  ],
  client: [
    { href: "/meu-portal/client", label: "Meu projeto", icon: FolderKanban },
    { href: "/meu-portal/client/requests", label: "Demandas", icon: Wrench },
    { href: "/meu-portal/client/meetings", label: "Reuniao", icon: CalendarDays },
    { href: "/meu-portal/client/new-project", label: "Novo projeto", icon: Wrench },
    { href: "/meu-portal/client/solutions", label: "Solucoes", icon: Home },
    { href: "/meu-portal/client/estimate", label: "Calculadora", icon: Calculator },
    { href: "/meu-portal/client/budgets", label: "Orcamentos", icon: ReceiptText },
    { href: "/meu-portal/client/messages", label: "Mensagens", icon: MessageSquare },
    { href: "/meu-portal/client/payments", label: "Pagamentos", icon: CreditCard },
    { href: "/meu-portal/client/profile", label: "Perfil", icon: User },
  ],
  developer: [
    { href: "/meu-portal/developer", label: "Atualizacoes", icon: Wrench },
    { href: "/meu-portal/developer/projects", label: "Projetos", icon: FolderKanban },
    { href: "/meu-portal/developer/calendar", label: "Calendario", icon: CalendarDays },
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const nav = navByRole[role];

  const themeClass = actor.user.themePreference === "light" ? "" : "dark";

  return (
    <div className={`portal-theme-root ${themeClass}`}>
      <main className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-[#080808] dark:text-white">
        <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block border-r border-black/10 bg-white px-4 py-4 dark:border-white/10 dark:bg-zinc-950">
            <Link href="/meu-portal" className="flex items-center gap-3 px-2 py-3">
              <span className="relative h-10 w-10 overflow-hidden bg-white rounded-lg">
                <Image
                  src="/images/logo com fundo.png"
                  alt="Logo Goosley"
                  fill
                  sizes="40px"
                  className="object-contain"
                  priority
                />
              </span>
              <span>
                <span className="block text-sm font-black uppercase tracking-[0.24em]">Goosley</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Portal operacional</span>
              </span>
            </Link>
            <nav className="mt-8 grid gap-1.5">
              {nav.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex min-h-11 items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-zinc-900 text-white shadow-md dark:bg-white dark:text-zinc-950 font-bold scale-[1.02]"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={isActive ? "text-orange-500 dark:text-orange-600" : ""} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 dark:bg-orange-600" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Area */}
          <section className="min-w-0 flex flex-col">
            <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-black/10 bg-zinc-100/90 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-[#080808]/90 lg:px-8">
              <div className="flex items-center gap-3">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-white/5 lg:hidden"
                  aria-label="Abrir Menu"
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
                <div>
                  <h1 className="text-xl font-black tracking-tight md:text-3xl">{title}</h1>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 hidden sm:block">{subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button aria-label="Notificacoes" className="grid h-10 w-10 place-items-center rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-white/5">
                  <Bell size={18} />
                </button>
                <PortalTopActions user={actor.user} />
              </div>
            </header>

            {/* Mobile Drawer Menu */}
            {isMobileMenuOpen && (
              <div className="lg:hidden border-b border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950 shadow-xl">
                <nav className="grid gap-1">
                  {nav.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex min-h-11 items-center gap-3 px-3 rounded-lg text-sm font-semibold transition ${
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
              </div>
            )}

            <div className="px-4 py-6 lg:px-8 flex-1">{children}</div>
          </section>

        </div>
      </main>
    </div>
  );
}
