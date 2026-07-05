"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { pricingData } from "@/data/pricingData";

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
        <NumberInput name="features" label="Funcionalidades" value={6} />
        <NumberInput name="complexity" label="Complexidade" value={3} />
        <NumberInput name="integrations" label="Integracoes" value={2} />
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

type PortalTask = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate?: string;
};

export function TaskCommentForm({ task, endpoint }: { task: PortalTask; endpoint: string }) {
  return (
    <ActionForm
      endpoint={endpoint}
      fields={[{ name: "body", label: `Comentario sobre: ${task.title}`, type: "textarea", required: true }]}
      submitLabel="Adicionar comentario"
      successLabel="Comentario enviado para a conversa do projeto."
    />
  );
}

export function PortalProjectEstimator() {
  const [categoryId, setCategoryId] = useState(pricingData[0]?.id || "");
  const activeCategory = pricingData.find((category) => category.id === categoryId) || pricingData[0];
  const [selections, setSelections] = useState<Record<string, string>>(() => defaultSelectionsFor(activeCategory));
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  const totals = activeCategory.variables.reduce(
    (sum, variable) => {
      const option = variable.options.find((item) => item.id === selections[variable.id]);
      if (!option) return sum;
      return {
        setupMin: sum.setupMin + option.setupMin,
        setupMax: sum.setupMax + option.setupMax,
        recurringMin: sum.recurringMin + option.recurringMin,
        recurringMax: sum.recurringMax + option.recurringMax,
        timeMin: sum.timeMin + (option.timeMin || 0),
        timeMax: sum.timeMax + (option.timeMax || 0),
      };
    },
    { setupMin: 0, setupMax: 0, recurringMin: 0, recurringMax: 0, timeMin: 0, timeMax: 0 }
  );

  async function submitBudget() {
    setPending(true);
    setStatus("");
    const selectedDetails = activeCategory.variables
      .map((variable) => {
        const option = variable.options.find((item) => item.id === selections[variable.id]);
        return option ? `${variable.name}: ${option.label}` : "";
      })
      .filter(Boolean);
    const response = await fetch("/client/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `Novo projeto - ${activeCategory.title}`,
        description: `${activeCategory.description}\n\nEscolhas:\n${selectedDetails.join("\n")}`,
        estimatedValueCents: Math.max(0, totals.setupMax) * 100,
      }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
    setPending(false);
    setStatus(response.ok ? "Estimativa importada e enviada para analise no portal." : data.error?.message || "Nao foi possivel enviar a estimativa.");
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {pricingData.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => {
              setCategoryId(category.id);
              setSelections(defaultSelectionsFor(category));
            }}
            className={`border p-4 text-left transition ${
              activeCategory.id === category.id
                ? "border-orange-400 bg-orange-400 text-black"
                : "border-black/10 bg-white hover:border-orange-400 dark:border-white/10 dark:bg-white/[0.04]"
            }`}
          >
            <strong className="block">{category.title}</strong>
            <span className="mt-2 block text-sm opacity-75">{category.description}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4">
          {activeCategory.variables.map((variable) => (
            <div key={variable.id} className="border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <h3 className="mb-3 font-black">{variable.name}</h3>
              <div className="grid gap-2">
                {variable.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelections((current) => ({ ...current, [variable.id]: option.id }))}
                    className={`flex items-start justify-between gap-3 border px-3 py-3 text-left text-sm transition ${
                      selections[variable.id] === option.id
                        ? "border-orange-400 bg-orange-50 dark:bg-orange-400/10"
                        : "border-black/10 dark:border-white/10"
                    }`}
                  >
                    <span>
                      <strong className="block">{option.label}</strong>
                      <span className="text-zinc-600 dark:text-zinc-400">Setup: {range(option.setupMin, option.setupMax)}</span>
                    </span>
                    {selections[variable.id] === option.id ? <CheckCircle2 className="text-orange-500" size={18} /> : null}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <aside className="h-fit border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
          <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Resumo importado da calculadora</p>
          <h3 className="mt-2 text-2xl font-black">{activeCategory.title}</h3>
          <div className="mt-5 grid gap-3 text-sm">
            <SummaryLine label="Setup estimado" value={range(totals.setupMin, totals.setupMax)} />
            <SummaryLine label="Recorrente mensal" value={totals.recurringMax > 0 ? `${range(totals.recurringMin, totals.recurringMax)} / mes` : "Sem recorrencia estimada"} />
            <SummaryLine label="Prazo estimado" value={totals.timeMax > 0 ? `${totals.timeMin} a ${totals.timeMax} dias uteis` : "A definir"} />
          </div>
          <button onClick={submitBudget} disabled={pending} className="mt-5 w-full bg-orange-400 px-4 py-3 font-black uppercase tracking-widest text-black disabled:opacity-60">
            {pending ? "Enviando" : "Enviar estimativa"}
          </button>
          {status ? <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{status}</p> : null}
        </aside>
      </div>
    </div>
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

function range(min: number, max: number) {
  if (min === max) return money(min * 100);
  return `${money(min * 100)} - ${money(max * 100)}`;
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-2 dark:border-white/10">
      <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
      <strong className="text-right">{value}</strong>
    </div>
  );
}

function defaultSelectionsFor(category: (typeof pricingData)[number]) {
  return Object.fromEntries(
    category.variables.map((variable) => [variable.id, variable.options.find((option) => option.isDefault)?.id || variable.options[0]?.id || ""])
  );
}
