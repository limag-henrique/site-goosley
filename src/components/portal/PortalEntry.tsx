"use client";

import { useState } from "react";
import { ArrowRight, LockKeyhole, UserPlus } from "lucide-react";

type Mode = "login" | "register";

export function PortalEntry() {
  const [mode, setMode] = useState<Mode>("login");
  const [status, setStatus] = useState<string>("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setStatus("");

    const payload =
      mode === "login"
        ? {
            email: String(formData.get("email") || ""),
            password: String(formData.get("password") || ""),
          }
        : {
            name: String(formData.get("name") || ""),
            email: String(formData.get("email") || ""),
            password: String(formData.get("password") || ""),
          };

    const response = await fetch(`/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { redirectTo?: string; error?: { message?: string } };
    setPending(false);

    if (!response.ok) {
      setStatus(data.error?.message || "Nao foi possivel concluir.");
      return;
    }

    window.location.href = data.redirectTo || "/meu-portal/client";
  }

  return (
    <section className="min-h-screen bg-zinc-950 px-6 py-28 text-white md:px-12">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-orange-300">Meu Portal</p>
          <h1 className="text-5xl font-black tracking-tight md:text-7xl">Acompanhamento operacional Goosley.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            Clientes acompanham projetos, programadores registram trabalho e administradores controlam tudo com RBAC, auditoria e calculo de ganhos.
          </p>
          <div className="mt-10 grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
            <div className="border border-white/10 bg-white/[0.03] p-4">Projetos, tarefas e mensagens</div>
            <div className="border border-white/10 bg-white/[0.03] p-4">Horas, ganhos e saques</div>
            <div className="border border-white/10 bg-white/[0.03] p-4">Pagamentos, GitHub e auditoria</div>
          </div>
        </div>

        <div className="border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40">
          <div className="mb-6 grid grid-cols-2 border border-white/10 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-widest ${mode === "login" ? "bg-white text-black" : "text-zinc-300"}`}
            >
              <LockKeyhole size={16} />
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-widest ${mode === "register" ? "bg-white text-black" : "text-zinc-300"}`}
            >
              <UserPlus size={16} />
              Cliente
            </button>
          </div>

          <form action={handleSubmit} className="space-y-4">
            {mode === "register" ? (
              <label className="block text-sm font-medium text-zinc-300">
                Nome
                <input name="name" required className="mt-2 w-full border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-300" />
              </label>
            ) : null}
            <label className="block text-sm font-medium text-zinc-300">
              Email
              <input name="email" type="email" required className="mt-2 w-full border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-300" />
            </label>
            <label className="block text-sm font-medium text-zinc-300">
              Senha
              <input name="password" type="password" required className="mt-2 w-full border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-300" />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 bg-orange-400 px-5 py-4 font-bold uppercase tracking-widest text-black transition hover:bg-orange-300 disabled:opacity-60"
            >
              {pending ? "Processando" : mode === "login" ? "Acessar portal" : "Criar conta cliente"}
              <ArrowRight size={18} />
            </button>
            {status ? <p className="text-sm text-red-300">{status}</p> : null}
          </form>

          <div className="mt-6 border-t border-white/10 pt-5 text-xs leading-6 text-zinc-400">
            Demo local: admin@goosley.local, cliente@goosley.local, programador@goosley.local. Senha: Portal123!
          </div>
        </div>
      </div>
    </section>
  );
}
