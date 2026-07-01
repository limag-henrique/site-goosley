"use client";

import { useEffect, useState } from "react";
import { ArrowRight, LockKeyhole, UserPlus } from "lucide-react";

type Mode = "login" | "register" | "forgot" | "reset";

export function PortalEntry() {
  const [mode, setMode] = useState<Mode>("login");
  const [status, setStatus] = useState<string>("");
  const [pending, setPending] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("resetToken");
    const email = params.get("email");
    if (token) {
      queueMicrotask(() => {
        setResetToken(token);
        setResetEmail(email || "");
        setMode("reset");
      });
    }
  }, []);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setStatus("");

    const payload = buildPayload(mode, formData, resetToken, resetEmail);
    const endpoint =
      mode === "forgot"
        ? "/auth/forgot-password"
        : mode === "reset"
          ? "/auth/reset-password"
          : `/auth/${mode}`;

    const response = await fetch(endpoint, {
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

    if (mode === "forgot") {
      setStatus("Se o email existir, enviaremos um link seguro de recuperacao.");
      return;
    }

    if (mode === "reset") {
      setStatus("Senha redefinida. Voce ja pode acessar sua conta.");
      setMode("login");
      return;
    }

    window.location.href = data.redirectTo || "/meu-portal/client";
  }

  return (
    <main className="min-h-screen bg-[#070707] px-5 py-10 text-white md:px-10 lg:px-14">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-10 lg:grid-cols-[1fr_430px] lg:items-center">
        <section className="max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-orange-300">Meu Portal</p>
          <h1 className="text-5xl font-black tracking-tight md:text-7xl">Acompanhamento operacional Goosley.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            Acesse o ambiente seguro para acompanhar demandas, mensagens, prazos e entregas vinculadas a sua conta.
          </p>
        </section>

        <section className="border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/40 sm:p-6">
          <div className="mb-6 grid grid-cols-2 border border-white/10 p-1">
            <AccessTab active={mode === "login"} label="Acesso" icon={<LockKeyhole size={16} />} onClick={() => setMode("login")} />
            <AccessTab active={mode === "register"} label="Nova conta" icon={<UserPlus size={16} />} onClick={() => setMode("register")} />
          </div>

          <form action={handleSubmit} className="space-y-4">
            {mode === "register" ? <Input name="name" label="Nome" required /> : null}
            <Input name="email" label="Email" type="email" required defaultValue={mode === "reset" ? resetEmail : undefined} />
            {mode === "login" || mode === "register" || mode === "reset" ? (
              <Input name="password" label={mode === "reset" ? "Nova senha" : "Senha"} type="password" required />
            ) : null}
            {mode === "reset" ? <input type="hidden" name="token" value={resetToken} /> : null}
            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 bg-orange-400 px-5 py-4 font-bold uppercase tracking-widest text-black transition hover:bg-orange-300 disabled:opacity-60"
            >
              {buttonLabel(mode, pending)}
              <ArrowRight size={18} />
            </button>
            {mode === "login" ? (
              <button type="button" onClick={() => setMode("forgot")} className="text-sm font-semibold text-orange-300 hover:text-orange-200">
                Esqueci minha senha
              </button>
            ) : null}
            {status ? <p className="rounded border border-white/10 bg-black/30 p-3 text-sm text-zinc-200">{status}</p> : null}
          </form>

          <div className="mt-6 border-t border-white/10 pt-5 text-xs leading-6 text-zinc-400">
            Acesso local: admin@goosley.local, caetano@goosley.local, raul@goosley.local, rodrigo@goosley.local, rick@goosley.local ou cliente@goosley.local. Senha: Portal123!
          </div>
        </section>
      </div>
    </main>
  );
}

function AccessTab({ active, label, icon, onClick }: { active: boolean; label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-11 items-center justify-center gap-2 px-2 text-xs font-bold uppercase tracking-widest transition sm:text-sm ${
        active ? "bg-white text-black" : "text-zinc-300 hover:bg-white/5"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function Input({ name, label, type = "text", required, defaultValue }: { name: string; label: string; type?: string; required?: boolean; defaultValue?: string }) {
  return (
    <label className="block text-sm font-medium text-zinc-300">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-2 w-full border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-orange-300"
      />
    </label>
  );
}

function buildPayload(mode: Mode, formData: FormData, resetToken: string, resetEmail: string) {
  if (mode === "forgot") {
    return { email: String(formData.get("email") || "") };
  }

  if (mode === "reset") {
    return {
      email: String(formData.get("email") || resetEmail),
      token: String(formData.get("token") || resetToken),
      password: String(formData.get("password") || ""),
    };
  }

  if (mode === "register") {
    return {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
    };
  }

  return {
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
  };
}

function buttonLabel(mode: Mode, pending: boolean) {
  if (pending) return "Processando";
  if (mode === "register") return "Criar nova conta";
  if (mode === "forgot") return "Enviar recuperacao";
  if (mode === "reset") return "Redefinir senha";
  return "Acessar portal";
}
