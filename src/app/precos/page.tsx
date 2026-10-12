import type { Metadata } from "next";
import { CostEstimator } from "@/components/CostEstimator";

export const metadata: Metadata = { title: "Simule seu projeto | Goosley Digital", description: "Monte seu projeto em etapas e veja uma estimativa de investimento, prazo e custos recorrentes." };

export default function Precos() {
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-5 pb-20 pt-28 sm:px-8 sm:pt-32">
      <div className="mb-8 max-w-2xl sm:mb-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">Simule seu projeto</p>
        <h1 className="mb-4 text-4xl font-semibold leading-[1.1] tracking-[-0.045em] sm:text-5xl">Uma ideia. Um passo de cada vez.</h1>
        <p className="max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">Escolha a solução e configure os detalhes em etapas. Veja o investimento, o prazo e os custos recorrentes antes de conversar com a gente.</p>
      </div>
      <CostEstimator />
    </div>
  );
}
