"use client";

import { useState } from "react";

type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "number" | "date" | "url" | "textarea" | "select";
  value?: string | number;
  options?: { label: string; value: string }[];
  required?: boolean;
};

export function ActionForm({
  endpoint,
  method = "POST",
  fields,
  submitLabel,
  successLabel = "Salvo com sucesso.",
}: {
  endpoint: string;
  method?: "POST" | "PATCH";
  fields: Field[];
  submitLabel: string;
  successLabel?: string;
}) {
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setStatus("");
    const formData = new FormData(event.currentTarget);
    const numericFields = new Set(fields.filter((field) => field.type === "number").map((field) => field.name));
    const payload = Object.fromEntries(
      Array.from(formData.entries()).map(([key, value]) => {
        const raw = String(value);
        return [key, raw !== "" && numericFields.has(key) ? Number(raw) : raw];
      })
    );

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
    setPending(false);
    setStatus(response.ok ? successLabel : data.error?.message || "Nao foi possivel salvar.");
    if (response.ok) event.currentTarget.reset();
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      {fields.map((field) => (
        <label key={field.name} className="grid gap-1 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {field.label}
          {field.type === "textarea" ? (
            <textarea name={field.name} required={field.required} defaultValue={field.value} className={inputClassName} rows={3} />
          ) : field.type === "select" ? (
            <select name={field.name} required={field.required} defaultValue={field.value} className={inputClassName}>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input name={field.name} required={field.required} defaultValue={field.value} type={field.type || "text"} className={inputClassName} />
          )}
        </label>
      ))}
      <button disabled={pending} className="min-h-11 bg-orange-400 px-4 font-black uppercase tracking-widest text-black transition hover:bg-orange-300 disabled:opacity-60">
        {pending ? "Salvando" : submitLabel}
      </button>
      {status ? <p className="text-sm text-zinc-600 dark:text-zinc-300">{status}</p> : null}
    </form>
  );
}

export function EstimateCalculator() {
  const [result, setResult] = useState<{ estimatedValueCents: number; estimatedDays: number; scopeScore: number } | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/client/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        features: Number(formData.get("features")),
        complexity: Number(formData.get("complexity")),
        integrations: Number(formData.get("integrations")),
      }),
    });
    if (response.ok) setResult(await response.json());
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberInput name="features" label="Features" value={6} />
        <NumberInput name="complexity" label="Complexity" value={3} />
        <NumberInput name="integrations" label="Integrations" value={2} />
      </div>
      <button className="min-h-11 bg-orange-400 px-4 font-black uppercase tracking-widest text-black">Calcular</button>
      {result ? (
        <div className="grid gap-2 border border-black/10 bg-white p-4 text-sm dark:border-white/10 dark:bg-white/5">
          <strong>{money(result.estimatedValueCents)}</strong>
          <span>{result.estimatedDays} dias estimados</span>
          <span>Escopo: {result.scopeScore}</span>
        </div>
      ) : null}
    </form>
  );
}

function NumberInput({ name, label, value }: { name: string; label: string; value: number }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
      {label}
      <input name={name} type="number" min={0} defaultValue={value} className={inputClassName} />
    </label>
  );
}

const inputClassName = "min-h-11 border border-black/10 bg-white px-3 text-zinc-950 outline-none transition focus:border-orange-400 dark:border-white/10 dark:bg-black dark:text-white";

function money(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
