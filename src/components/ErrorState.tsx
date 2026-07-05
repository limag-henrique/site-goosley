import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type ErrorStateProps = {
  code: string;
  eyebrow: ReactNode;
  title: ReactNode;
  description: ReactNode;
  actions?: ReactNode;
};

export function ErrorState({
  code,
  eyebrow,
  title,
  description,
  actions,
}: ErrorStateProps) {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-background px-6 py-28 text-foreground md:px-12">
      <div className="absolute inset-0 -z-20 bg-black" />
      <div className="absolute left-[-18%] top-[-20%] -z-10 h-[70%] w-[78%] rounded-[40%_60%_70%_30%] bg-orange-600/50 blur-[120px] animate-fluid-1" />
      <div className="absolute bottom-[-28%] right-[-22%] -z-10 h-[90%] w-[90%] rounded-[60%_40%_30%_70%] bg-indigo-950/70 blur-[120px] animate-fluid-2" />
      <div className="absolute right-[8%] top-[16%] -z-10 h-[60%] w-[60%] rounded-[50%_50%_60%_40%] bg-slate-900/90 blur-[130px] animate-fluid-3" />
      <div className="grain-overlay" />

      <div className="container relative z-10 mx-auto grid items-end gap-16 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="max-w-4xl">
          <span className="mb-5 inline-flex border border-foreground px-4 py-1 text-sm font-bold uppercase tracking-widest">
            {eyebrow}
          </span>

          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-foreground/50">
            erro {code}
          </p>

          <h1 className="max-w-4xl text-4xl font-black leading-none md:text-5xl lg:text-6xl">
            {title}
          </h1>

          <p className="mt-5 max-w-2xl text-lg font-medium leading-relaxed text-foreground/75 md:text-xl">
            {description}
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-foreground px-7 py-4 text-sm font-bold uppercase tracking-widest text-background transition-transform duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
              Voltar para Home
            </Link>

            {actions}
          </div>
        </div>

        <div
          aria-hidden="true"
          className="hidden select-none text-[12rem] font-black leading-none text-foreground/10 lg:block xl:text-[16rem]"
        >
          {code}
        </div>
      </div>
    </section>
  );
}
