"use client";

import { LogOut, Moon, Sun, UserCircle } from "lucide-react";
import type { SafeUser } from "@/server/portal/services";

export function PortalTopActions({ user }: { user: SafeUser }) {
  async function toggleTheme() {
    const root = document.documentElement;
    const next = root.classList.contains("dark") ? "light" : "dark";
    root.classList.toggle("dark", next === "dark");
    localStorage.setItem("goosley-theme", next);
    await fetch("/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themePreference: next }),
    });
  }

  async function logout() {
    await fetch("/auth/logout", { method: "POST" });
    window.location.href = "/meu-portal";
  }

  return (
    <>
      <button
        aria-label="Toggle theme"
        onClick={toggleTheme}
        className="grid h-10 w-10 place-items-center border border-black/10 bg-white dark:border-white/10 dark:bg-white/5"
        title="Theme"
      >
        <Sun className="dark:hidden" size={18} />
        <Moon className="hidden dark:block" size={18} />
      </button>
      <button
        aria-label="Profile"
        className="hidden h-10 items-center gap-2 border border-black/10 bg-white px-3 text-sm font-semibold dark:border-white/10 dark:bg-white/5 sm:flex"
        title={user.email}
      >
        <UserCircle size={18} />
        <span>{user.name}</span>
      </button>
      <button
        aria-label="Logout"
        onClick={logout}
        className="grid h-10 w-10 place-items-center border border-black/10 bg-white text-red-600 dark:border-white/10 dark:bg-white/5 dark:text-red-300"
        title="Logout"
      >
        <LogOut size={18} />
      </button>
    </>
  );
}
