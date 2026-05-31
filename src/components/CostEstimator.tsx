"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { pricingData, PricingCategory } from "@/data/pricingData";
import { Check } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Inner component to safely use useSearchParams
function EstimatorInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get("categoria");

  // Determine initial category
  const initialCategory = pricingData.find((c) => c.id === categoryParam) || pricingData[0];
  const [activeCategory, setActiveCategory] = useState<PricingCategory>(initialCategory);

  // State to hold selected options: Record<variableId, optionId>
  const [selections, setSelections] = useState<Record<string, string>>({});

  const handleSelect = (variableId: string, optionId: string) => {
    setSelections((prev) => ({ ...prev, [variableId]: optionId }));
  };

  // Calculate Totals
  let setupMinTotal = 0;
  let setupMaxTotal = 0;
  let recurringMinTotal = 0;
  let recurringMaxTotal = 0;
  let timeMinTotal = 0;
  let timeMaxTotal = 0;
  const variableCosts: string[] = [];
  const recurringCosts: string[] = [];

  activeCategory.variables.forEach((variable) => {
    const selectedOptionId = selections[variable.id];
    const option = variable.options.find((o) => o.id === selectedOptionId);

    if (option) {
      setupMinTotal += option.setupMin;
      setupMaxTotal += option.setupMax;
      recurringMinTotal += option.recurringMin;
      recurringMaxTotal += option.recurringMax;
      timeMinTotal += option.timeMin || 0;
      timeMaxTotal += option.timeMax || 0;

      if (option.setupText && option.setupMin === 0 && option.setupMax === 0 && option.setupText !== "Incluso") {
        variableCosts.push(`${variable.name}: ${option.setupText}`);
      }
      if (option.recurringText) {
        recurringCosts.push(`${variable.name}: ${option.recurringText}`);
      }
    }
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(val);
  };

  const formatRange = (min: number, max: number) => {
    if (min === max) return formatCurrency(min);
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  };

  const missingSelections = activeCategory.variables.filter(v => !selections[v.id]);
  const isComplete = missingSelections.length === 0;

  return (
    <div className="flex flex-col lg:flex-row gap-12 w-full max-w-7xl mx-auto">
      {/* Main Form Content */}
      <div className="w-full lg:w-2/3 flex flex-col gap-12">
        
        {/* Category Tabs */}
        <div className="flex flex-col gap-3">
          {pricingData.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category);
                setSelections({});

                const params = new URLSearchParams(searchParams.toString());
                params.set("categoria", category.id);
                router.replace(`?${params.toString()}`, { scroll: false });
              }}
              className={cn(
                "w-full text-left px-6 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all",
                activeCategory.id === category.id
                  ? "bg-foreground text-background"
                  : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
              )}
            >
              {category.title}
            </button>
          ))}
        </div>

        {/* Variables List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-12"
          >
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">{activeCategory.title}</h2>
              <p className="text-foreground/60 mb-8">{activeCategory.description}</p>
            </div>

            <div className="flex flex-col gap-10">
              {activeCategory.variables.map((variable) => (
                <div key={variable.id} className="flex flex-col gap-4">
                  <h3 className="text-xl font-bold">{variable.name}</h3>
                  <div className="flex flex-col gap-4">
                    {variable.options.map((option) => {
                      const isSelected = selections[variable.id] === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleSelect(variable.id, option.id)}
                          className={cn(
                            "relative flex flex-col items-start text-left p-6 rounded-2xl border transition-all duration-200 group",
                            isSelected
                              ? "border-foreground bg-foreground/5"
                              : "border-foreground/10 hover:border-foreground/30 bg-transparent"
                          )}
                        >
                          <div className="flex items-center justify-between w-full mb-4">
                            <span className="font-semibold text-lg">{option.label}</span>
                            <div className={cn(
                              "w-6 h-6 rounded-full border flex items-center justify-center transition-colors shrink-0",
                              isSelected ? "border-foreground bg-foreground text-background" : "border-foreground/30 group-hover:border-foreground/50"
                            )}>
                              {isSelected && <Check className="w-4 h-4" />}
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-1 mt-auto">
                            <div className="text-sm">
                              <span className="text-foreground/60">Setup: </span>
                              <span className="font-medium">
                                {option.setupText ? option.setupText : formatRange(option.setupMin, option.setupMax)}
                              </span>
                            </div>
                            {(option.recurringMax > 0 || option.recurringText) && (
                              <div className="text-sm">
                                <span className="text-foreground/60">Mensal: </span>
                                <span className="font-medium">
                                  {option.recurringText ? option.recurringText : formatRange(option.recurringMin, option.recurringMax)}
                                </span>
                              </div>
                            )}
                            {(option.timeMax ?? 0) > 0 && (
                              <div className="text-sm mt-1">
                                <span className="text-foreground/60">Prazo Adicional: </span>
                                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                  {option.timeMin === option.timeMax ? `+${option.timeMin} dias` : `+${option.timeMin} a ${option.timeMax} dias`}
                                </span>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky Summary Bar */}
      <div className="w-full lg:w-1/3 relative">
        {isComplete && (
          <div className="sticky top-32 glass-panel p-8 rounded-3xl flex flex-col gap-8 shadow-2xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2 block">
                Resumo da Estimativa
              </span>
              <h3 className="text-2xl font-black tracking-tight leading-tight mb-6">
                Investimento Projetado
              </h3>
              
              <div className="flex flex-col gap-4 border-b border-foreground/10 pb-6 mb-6">
                <div className="flex flex-col">
                  <span className="text-sm text-foreground/60 mb-1">Custo de Desenvolvimento (Setup)</span>
                  <span className="text-3xl font-black">
                    {setupMaxTotal > 0 ? formatRange(setupMinTotal, setupMaxTotal) : "Sob Consulta"}
                  </span>
                  {variableCosts.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1">
                      {variableCosts.map((vc, i) => (
                        <span key={i} className="text-xs text-foreground/60">• {vc}</span>
                      ))}
                    </div>
                  )}
                </div>

                {(recurringMaxTotal > 0 || recurringCosts.length > 0) && (
                  <div className="flex flex-col mt-4">
                    <span className="text-sm text-foreground/60 mb-1">Custo Recorrente (Infra/Licenças)</span>
                    <span className="text-2xl font-bold">
                      {recurringMaxTotal > 0 ? formatRange(recurringMinTotal, recurringMaxTotal) + " / mês" : "Variável"}
                    </span>
                    {recurringCosts.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1">
                        {recurringCosts.map((rc, i) => (
                          <span key={i} className="text-xs text-foreground/60">• {rc}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {timeMaxTotal > 0 && (
                  <div className="flex flex-col mt-4 border-t border-foreground/10 pt-4">
                    <span className="text-sm text-foreground/60 mb-1">Prazo de Entrega Estimado</span>
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {timeMinTotal === timeMaxTotal 
                        ? `${timeMinTotal} dias úteis` 
                        : `${timeMinTotal} a ${timeMaxTotal} dias úteis`}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl text-sm">
                <span className="font-bold block mb-1">Atenção:</span>
                Estes valores são apenas uma estimativa inicial. Os projetos dependem inteiramente do grau de complexidade, podendo ter escopo maior ou menor do que o simulado aqui.
              </div>
            </div>
            
            <button 
              className="w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all bg-foreground text-background hover:scale-[1.02]"
            >
              Solicitar Proposta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function CostEstimator() {
  return (
    <Suspense fallback={<div className="w-full h-96 animate-pulse bg-foreground/5 rounded-3xl" />}>
      <EstimatorInner />
    </Suspense>
  );
}
