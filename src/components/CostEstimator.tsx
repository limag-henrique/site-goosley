"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, Pencil, RotateCcw } from "lucide-react";
import { pricingData } from "@/data/pricingData";
import { cn } from "@/lib/utils";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const formatRange = (min: number, max: number) => min === max ? currency.format(min) : `${currency.format(min)} – ${currency.format(max)}`;
const formatTime = (min: number, max: number) => min === max ? `${min} dias úteis` : `${min} a ${max} dias úteis`;
const solutionLabels: Record<string, string> = {
  "automacoes": "Automação",
  "analytics-dashboards-bi": "Analytics e BI",
  "sistemas-web": "Sistemas web",
  "agentes-corporativos": "Agentes de IA",
};

function EstimatorInner() {
  const searchParams = useSearchParams();
  const category = pricingData.find(item => item.id === searchParams.get("categoria")) || pricingData[0];
  const [showCategories, setShowCategories] = useState(!pricingData.some(item => item.id === searchParams.get("categoria")));
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({});
  const [steps, setSteps] = useState<Record<string, number>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const reducedMotion = useReducedMotion();
  const selections = answers[category.id] || {};
  const step = Math.min(steps[category.id] || 0, category.variables.length);
  const reviewing = step === category.variables.length;
  const variable = category.variables[step];
  const chosen = category.variables.map(item => ({ variable: item, option: item.options.find(option => option.id === selections[item.id]) }));
  const completed = chosen.filter(item => item.option).length;
  const isComplete = completed === category.variables.length;
  const totals = chosen.reduce((total, { option }) => {
    if (!option) return total;
    return {
      min: total.min + option.setupMin, max: total.max + option.setupMax,
      monthlyMin: total.monthlyMin + option.recurringMin, monthlyMax: total.monthlyMax + option.recurringMax,
      timeMin: total.timeMin + (option.timeMin || 0), timeMax: total.timeMax + (option.timeMax || 0),
    };
  }, { min: 0, max: 0, monthlyMin: 0, monthlyMax: 0, timeMin: 0, timeMax: 0 });
  const recurringNotes = chosen.flatMap(({ variable, option }) => option?.recurringText ? [`${variable.name}: ${option.recurringText}`] : []);
  const setupNotes = chosen.flatMap(({ variable, option }) => option?.setupText && option.setupMin === 0 && option.setupMax === 0 && option.setupText !== "Incluso" ? [`${variable.name}: ${option.setupText}`] : []);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (!showCategories) {
      headingRef.current?.focus({ preventScroll: true });
      if (panelRef.current && panelRef.current.getBoundingClientRect().top < 90) {
        panelRef.current.scrollIntoView({ block: "start", behavior: reducedMotion ? "instant" : "smooth" });
      }
    }
  }, [step, category.id, showCategories, reducedMotion]);

  const goToStep = (index: number) => setSteps(previous => ({ ...previous, [category.id]: index }));
  const selectCategory = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("categoria", id);
    window.history.replaceState(null, "", `?${params.toString()}`);
    setShowCategories(false);
  };
  const sendProposal = () => {
    if (!isComplete) return;
    const lines = [
      `Olá! Gostaria de solicitar uma proposta para *${category.title}*.`, "", "Minhas escolhas:",
      ...chosen.map(({ variable, option }) => `- ${variable.name}: ${option?.label}`), "",
      `*Desenvolvimento:* ${formatRange(totals.min, totals.max)}`,
      ...setupNotes,
      ...(totals.monthlyMax > 0 ? [`*Custo recorrente:* ${formatRange(totals.monthlyMin, totals.monthlyMax)} / mês`] : []),
      ...recurringNotes,
      ...(totals.timeMax > 0 ? [`*Prazo estimado:* ${formatTime(totals.timeMin, totals.timeMax)}`] : []),
      "", "Entendo que os valores são uma estimativa inicial, sujeita à definição do escopo.",
      "Aguardo retorno para detalharmos o projeto!",
    ];
    window.open(`https://wa.me/5531994217926?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener,noreferrer");
  };

  if (showCategories) return (
    <section aria-labelledby="solution-heading" className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-8">
      <div className="mb-7 flex items-center justify-between gap-4">
        <div><p className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-400">Primeiro, a solução</p><h2 id="solution-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">O que vamos construir?</h2></div>
        {completed > 0 && <button type="button" onClick={() => setShowCategories(false)} className="min-h-11 rounded-full border border-white/15 px-4 text-sm text-white/75">Continuar projeto</button>}
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {pricingData.map((item) => <button type="button" key={item.id} onClick={() => selectCategory(item.id)} className="group relative min-h-24 min-w-0 rounded-2xl border border-white/10 bg-white/[0.025] p-3 text-left transition-colors hover:border-orange-400/50 hover:bg-orange-500/5 active:bg-orange-500/10 sm:p-5">
          <div className="min-w-0 pr-4"><span className="block break-words text-sm font-semibold leading-snug sm:text-base">{solutionLabels[item.id] || item.title}</span></div>
          <ArrowUpRight size={16} className="absolute right-3 top-3 text-white/40 group-hover:text-orange-400 sm:right-5 sm:top-5" />
        </button>)}
      </div>
    </section>
  );

  const estimate = (
    <>
      <div className="mb-5 text-xs font-semibold uppercase tracking-widest text-white/50">{isComplete ? "Sua estimativa" : "Estimativa parcial"}</div>
      <div className="space-y-5">
        <div><p className="mb-2 text-sm text-white/55">Desenvolvimento</p><p className="text-2xl font-semibold tracking-tight tabular-nums xl:text-3xl">{completed ? formatRange(totals.min, totals.max) : "A definir"}</p>{setupNotes.map(note => <p key={note} className="mt-2 text-xs leading-relaxed text-white/60">{note}</p>)}</div>
        {(totals.monthlyMax > 0 || recurringNotes.length > 0) && <div className="border-t border-white/10 pt-4"><p className="mb-1 text-sm text-white/55">Infraestrutura e licenças</p><p className="text-lg font-medium tabular-nums">{totals.monthlyMax > 0 ? `${formatRange(totals.monthlyMin, totals.monthlyMax)} / mês` : "Conforme consumo"}</p>{recurringNotes.map(note => <p key={note} className="mt-2 text-xs leading-relaxed text-white/60">{note}</p>)}</div>}
        {totals.timeMax > 0 && <div className="border-t border-white/10 pt-4"><p className="mb-1 text-sm text-white/55">Prazo estimado</p><p className="text-lg font-medium text-emerald-400">{formatTime(totals.timeMin, totals.timeMax)}</p></div>}
      </div>
      <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/50">Estimativa inicial, sujeita à complexidade e à definição do escopo. Custos de terceiros e consumo podem variar.{!isComplete && " O total considera apenas as escolhas feitas até agora."}</p>
      {isComplete && reviewing && <button type="button" onClick={sendProposal} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-5 text-sm font-semibold text-black transition-colors hover:bg-orange-400 active:bg-orange-600">Solicitar proposta <ArrowUpRight size={17} /></button>}
    </>
  );

  return (
    <div ref={panelRef} className="scroll-mt-24">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="mb-1 text-xs uppercase tracking-widest text-white/40">Seu projeto</p><h2 className="text-lg font-semibold tracking-tight">{category.title}</h2></div><button type="button" onClick={() => setShowCategories(true)} className="flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-white/70 transition-colors hover:border-white/35 hover:text-white"><Pencil size={14} /> Trocar solução</button></div>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
        <div className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.025]">
          <div className="border-b border-white/10 p-5 sm:p-7">
            <div className="mb-4 text-xs text-white/50">{reviewing ? "Confira suas escolhas" : "Configure os detalhes do seu projeto"}</div>
            <div className="flex flex-wrap gap-1.5" aria-label="Etapas do projeto">
              {category.variables.map((item, index) => <button type="button" key={item.id} aria-label={`${item.name}${selections[item.id] ? ", concluída" : ""}`} aria-current={step === index ? "step" : undefined} onClick={() => goToStep(index)} title={item.name} className={cn("flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors", step === index ? "border-orange-400/60 bg-orange-500/10 text-orange-300" : "border-white/10 text-white/55 hover:bg-white/5")}>
                {selections[item.id] && <Check size={14} className="shrink-0" aria-hidden="true" />}
                <span className="min-w-0 text-left text-[11px] leading-tight">{item.name}</span>
              </button>)}
              <button type="button" aria-label="Revisar projeto" aria-current={reviewing ? "step" : undefined} disabled={!isComplete} onClick={() => goToStep(category.variables.length)} className={cn("flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-2 text-xs transition-colors disabled:opacity-30", reviewing ? "border-orange-400/60 bg-orange-500/10 text-orange-300" : "border-white/10 text-white/55 hover:bg-white/5")}>Resumo<ArrowRight size={14} /></button>
            </div>
          </div>
          <motion.div key={`${category.id}-${step}`} initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", bounce: 0, duration: 0.25 }} className="p-5 sm:p-7">
            <details className="mb-5 text-xs text-white/50"><summary className="cursor-pointer">Sobre esta solução</summary><p className="mt-2 leading-relaxed">{category.description}</p></details>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-400">{reviewing ? "Tudo pronto para conversar" : "Uma escolha de cada vez"}</p>
            <h3 ref={headingRef} tabIndex={-1} className="mb-3 text-2xl font-semibold leading-tight tracking-tight outline-none sm:text-3xl">{reviewing ? "Revise seu projeto." : variable.name}</h3>
            {reviewing ? <>
              <p className="mb-6 text-sm leading-relaxed text-white/55">Confira suas escolhas. Você pode editar qualquer etapa antes de solicitar uma proposta.</p>
              <div className="space-y-2">{chosen.map(({ variable: item, option }, index) => <button type="button" key={item.id} onClick={() => goToStep(index)} className="flex min-h-20 w-full items-center justify-between gap-4 rounded-2xl border border-white/10 p-4 text-left transition-colors hover:bg-white/5"><div><span className="mb-1 block text-xs text-white/45">{item.name}</span><span className="text-sm font-medium">{option?.label || "Não selecionado"}</span></div><Pencil size={15} className="shrink-0 text-white/50" /><span className="sr-only">Editar {item.name}</span></button>)}</div>
            </> : <>
              <p className="mb-6 text-sm leading-relaxed text-white/55">Selecione a opção que melhor combina com o que você precisa.</p>
              <fieldset className="space-y-3"><legend className="sr-only">{variable.name}</legend>{variable.options.map(option => {
                const selected = selections[variable.id] === option.id;
                return <label key={option.id} className={cn("relative block cursor-pointer rounded-2xl border p-4 transition-colors sm:p-5", selected ? "border-orange-400/65 bg-orange-500/[0.07]" : "border-white/12 bg-white/[0.015] hover:border-white/30 hover:bg-white/[0.04]")}>
                  <input type="radio" name={`${category.id}-${variable.id}`} value={option.id} checked={selected} onChange={() => setAnswers(previous => ({ ...previous, [category.id]: { ...previous[category.id], [variable.id]: option.id } }))} className="peer sr-only" />
                  <div className="pointer-events-none absolute inset-0 rounded-2xl peer-focus-visible:ring-2 peer-focus-visible:ring-orange-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-black" />
                  <div className="flex items-start justify-between gap-4"><span className="text-base font-medium leading-snug">{option.label}</span><span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border", selected ? "border-orange-400 bg-orange-400 text-black" : "border-white/30")}>{selected && <Check size={13} aria-hidden="true" />}</span></div>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs leading-relaxed text-white/60"><span>Desenvolvimento: <span className="font-medium text-white/85">{option.setupMin === 0 && option.setupMax === 0 ? (option.setupText || "Incluso") : formatRange(option.setupMin, option.setupMax)}</span></span>{(option.timeMax || 0) > 0 && <span>Prazo adicional: <span className="text-emerald-400">{formatTime(option.timeMin || 0, option.timeMax || 0)}</span></span>}</div>
                  {(option.recurringMax > 0 || option.recurringText) && <p className="mt-2 text-xs leading-relaxed text-white/60">Mensal: {option.recurringMax > 0 ? formatRange(option.recurringMin, option.recurringMax) : "Conforme consumo"}{option.recurringText && <span className="block mt-1 text-white/45">{option.recurringText}</span>}</p>}
                </label>;
              })}</fieldset>
            </>}
          </motion.div>
          <div className="flex items-center justify-between gap-3 border-t border-white/10 p-5 sm:px-7">
            <button type="button" onClick={() => step === 0 ? setShowCategories(true) : goToStep(step - 1)} className="flex min-h-11 items-center gap-2 rounded-full px-3 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"><ArrowLeft size={16} /> Voltar</button>
            {reviewing ? <button type="button" onClick={() => goToStep(0)} className="flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-white/75"><RotateCcw size={14} /> Revisar escolhas</button> : <button type="button" disabled={!selections[variable.id]} onClick={() => {
              if (step === category.variables.length - 1 && !isComplete) goToStep(chosen.findIndex(item => !item.option));
              else goToStep(step + 1);
            }} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-orange-200 active:bg-orange-300 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30">{step === category.variables.length - 1 ? "Ver resumo" : "Continuar"}<ArrowRight size={16} /></button>}
          </div>
        </div>
        <aside aria-label="Resumo do investimento" className="hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 lg:sticky lg:top-28 lg:block">{estimate}</aside>
        <details open={reviewing} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 lg:hidden"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium"><span>{isComplete ? "Sua estimativa" : "Estimativa parcial"}<span className="mt-1 block text-xs text-white/50">{completed ? formatRange(totals.min, totals.max) : "Faça sua primeira escolha"}</span></span><ChevronDown size={18} className="shrink-0 text-orange-400" /></summary><div className="pt-5">{estimate}</div></details>
      </div>
    </div>
  );
}

export function CostEstimator() {
  return <Suspense fallback={<div className="min-h-80 rounded-3xl border border-white/10 bg-white/[0.025] p-8 text-sm text-white/50">Carregando simulador…</div>}><EstimatorInner /></Suspense>;
}
