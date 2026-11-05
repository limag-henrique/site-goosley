"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function ConsultaForm() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = key.trim().toLowerCase();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value)) {
      setError(value ? "Confira a chave: ela deve conter 36 caracteres, incluindo os hífens." : "Informe a chave de consulta do documento.");
      return;
    }
    setError("");
    startTransition(() => router.push(`/assinatura-eletronica/${value}`));
  }

  return (
    <form onSubmit={submit} noValidate className="mt-8" aria-busy={pending}>
      <label htmlFor="consulta-chave" className="mb-2 block text-sm font-semibold">Chave de consulta</label>
      <p id="consulta-ajuda" className="mb-3 text-sm leading-relaxed text-neutral-600">Digite ou cole a chave que consta no documento.</p>
      <input
        id="consulta-chave"
        name="chave"
        type="text"
        value={key}
        onChange={(event) => { setKey(event.target.value); setError(""); }}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        required
        maxLength={80}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "consulta-ajuda consulta-erro" : "consulta-ajuda"}
        className="min-h-12 w-full rounded-sm border border-neutral-400 bg-white px-3 py-3 font-mono text-base text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 aria-invalid:border-red-700"
      />
      {error && <p id="consulta-erro" role="alert" className="mt-3 text-sm leading-relaxed text-red-700">{error}</p>}
      <button type="submit" disabled={pending} className="mt-5 min-h-12 w-full rounded-sm bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-700 active:bg-neutral-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900 disabled:cursor-wait disabled:opacity-70 sm:w-auto">
        {pending ? "Consultando…" : "Consultar documento"}
      </button>
      <p role="status" className="sr-only">{pending ? "Buscando o documento pela chave informada." : ""}</p>
    </form>
  );
}
