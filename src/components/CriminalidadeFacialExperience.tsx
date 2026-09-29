"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  FileImage,
  LoaderCircle,
  RotateCcw,
  Search,
  ShieldCheck,
  Upload,
  UserRoundCheck,
} from "lucide-react";

import type { PersonIndexEntry, PersonProfileResult } from "@/lib/criminalidadefacial-profile";
import {
  getFacialApiOrigin,
  referenceImageUrl,
  requestBirthYearChallenge,
  scorePhoto,
  validatePhoto,
  verifyPersonBirthYear,
  type PublicScoreResponse,
} from "@/lib/criminalidadefacial";
import { useImmersiveMode } from "@/components/useImmersiveMode";

type Step = "identity" | "birth-year" | "photo" | "loading" | "result";

const loadingMessages = [
  "Analisando similaridade facial com criminosos",
  "Baixando os seus dados do Governo Brasileiro",
] as const;

const disclaimer =
  "Ao utilizar esse sistema, você concorda em participar da brincadeira e não irá me processar. Todos os dados aqui disponíveis e sua foto não serão enviados para o servidor e não guardaremos seu rosto. Os dados aqui presentes estavam presentes em bases públicas.";

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/gu, "").toLocaleLowerCase("pt-BR").trim();
}

function percent(value: number | null | undefined, digits = 1) {
  return typeof value === "number" && Number.isFinite(value) ? `${value.toFixed(digits)}%` : "—";
}

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
}

async function normalizeMobilePhoto(file: File): Promise<Blob> {
  if (["image/jpeg", "image/png", "image/webp"].includes(file.type.toLowerCase())) return file;
  if (!file.type.toLowerCase().startsWith("image/")) return file;

  const source = URL.createObjectURL(file);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Este formato de imagem não pôde ser aberto neste navegador."));
      image.src = source;
    });
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 2048 / Math.max(image.naturalWidth, image.naturalHeight));
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Não foi possível preparar esta imagem."))),
        "image/jpeg",
        0.9,
      );
    });
  } finally {
    URL.revokeObjectURL(source);
  }
}

function Screen({ children, scroll = false }: { children: React.ReactNode; scroll?: boolean }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className={`fixed inset-0 z-40 bg-black text-white ${scroll ? "overflow-y-auto" : "overflow-hidden"}`}
    >
      <div className="min-h-[100dvh] pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
        {children}
      </div>
    </motion.main>
  );
}

export function CriminalidadeFacialExperience({ people }: { people: PersonIndexEntry[] }) {
  useImmersiveMode();

  const galleryInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("identity");
  const [query, setQuery] = useState("");
  const [person, setPerson] = useState<PersonIndexEntry>();
  const [years, setYears] = useState<number[]>([]);
  const [profile, setProfile] = useState<PersonProfileResult>();
  const [photo, setPhoto] = useState<Blob>();
  const [preview, setPreview] = useState("");
  const [score, setScore] = useState<PublicScoreResponse>();
  const [busy, setBusy] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState("");

  const suggestions = useMemo(() => {
    const terms = normalize(query).split(/\s+/u).filter(Boolean);
    if (terms.length === 0) return [];
    return people
      .filter((entry) => {
        const name = normalize(entry.fullName);
        return terms.every((term) => name.includes(term));
      })
      .slice(0, 8);
  }, [people, query]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  async function selectPerson(nextPerson: PersonIndexEntry) {
    setPerson(nextPerson);
    setQuery(nextPerson.fullName);
    setError("");
    setBusy(true);
    try {
      const challengeYears = await requestBirthYearChallenge(nextPerson.id);
      setYears(challengeYears);
      setStep("birth-year");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível abrir este perfil.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmYear(year: number) {
    if (!person) return;
    setBusy(true);
    setError("");
    try {
      const verifiedProfile = await verifyPersonBirthYear(person.id, year);
      setProfile(verifiedProfile);
      setStep("photo");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Ano incorreto. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  async function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      const normalized = await normalizeMobilePhoto(selected);
      const validationError = validatePhoto(normalized);
      if (validationError) throw new Error(validationError);
      setPhoto(normalized);
      setScore(undefined);
      setPreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return URL.createObjectURL(normalized);
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível abrir esta foto.");
    } finally {
      setBusy(false);
    }
  }

  async function analyze() {
    if (!photo) {
      setError("Adicione uma foto antes de iniciar a análise.");
      return;
    }
    setError("");
    setLoadingStage(0);
    setStep("loading");

    try {
      // Executa a chamada de score em paralelo
      const scorePromise = scorePhoto(photo);

      // Etapa 1: Tempo confortável para ler "Analisando similaridade facial com criminosos"
      await wait(3500);

      // Etapa 2: Tempo confortável para ler "Baixando os seus dados do Governo Brasileiro"
      setLoadingStage(1);
      await wait(3500);

      // Etapa de conclusão: exibe ambos concluídos brevemente
      setLoadingStage(2);
      await wait(1200);

      const result = await scorePromise;
      setScore(result);
      setStep("result");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível concluir a análise.");
      setStep("photo");
    }
  }

  function reset() {
    setStep("identity");
    setQuery("");
    setPerson(undefined);
    setYears([]);
    setProfile(undefined);
    setPhoto(undefined);
    setScore(undefined);
    setError("");
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return "";
    });
  }

  return (
    <AnimatePresence mode="wait">
      {step === "identity" && (
        <Screen key="identity">
          <div className="relative flex min-h-[100dvh] flex-col justify-between overflow-hidden px-5 py-8 sm:px-10">
            <Ambient />
            <header className="relative flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
              <ShieldCheck size={18} /> demonstração acadêmica
            </header>
            <section className="relative mx-auto w-full max-w-2xl py-10">
              <p className="text-sm font-semibold text-zinc-500">1 de 3 · identificação</p>
              <h1 className="mt-4 text-4xl font-black tracking-tighter sm:text-6xl">
                encontre o seu <span className="text-orange-500">perfil</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">
                Digite seu nome e sobrenome. A consulta só avança após você selecionar um perfil da lista.
              </p>
              <div className="relative mt-9">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPerson(undefined);
                    setError("");
                  }}
                  placeholder="Nome e sobrenome"
                  className="h-16 w-full rounded-2xl border border-white/15 bg-white/[0.06] pl-14 pr-5 text-base outline-none transition focus:border-orange-500/70 focus:bg-white/[0.09]"
                />
                {query.trim() && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-[38dvh] overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur-xl">
                    {suggestions.length > 0 ? suggestions.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        disabled={busy || !entry.hasBirthYear}
                        onClick={() => selectPerson(entry)}
                        className="flex min-h-16 w-full items-center gap-3 border-b border-white/5 px-4 text-left transition last:border-0 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500/15 font-black text-orange-400">
                          {entry.fullName.charAt(0)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{entry.fullName}</span>
                          {!entry.hasBirthYear && <span className="text-xs text-zinc-500">ano de nascimento indisponível</span>}
                        </span>
                        {busy && person?.id === entry.id ? <LoaderCircle className="animate-spin" size={17} /> : <ChevronRight size={17} className="text-zinc-600" />}
                      </button>
                    )) : (
                      <p className="px-5 py-6 text-center text-sm text-zinc-500">Nenhum perfil pré-identificado encontrado.</p>
                    )}
                  </div>
                )}
              </div>
              <ErrorMessage message={error} />
            </section>
            <p className="relative mx-auto max-w-2xl text-center text-[11px] leading-5 text-zinc-600">{disclaimer}</p>
          </div>
        </Screen>
      )}

      {step === "birth-year" && person && (
        <Screen key="birth-year">
          <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 py-12">
            <Ambient />
            <section className="relative w-full max-w-xl text-center">
              <UserRoundCheck className="mx-auto text-orange-400" size={36} />
              <p className="mt-6 text-sm font-semibold text-zinc-500">2 de 3 · confirmação</p>
              <h1 className="mt-4 text-4xl font-black tracking-tighter sm:text-5xl">confirme seu ano de nascimento</h1>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Perfil selecionado: <span className="font-semibold text-white">{person.fullName}</span>
              </p>
              <div className="mt-9 grid grid-cols-3 gap-3">
                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    disabled={busy}
                    onClick={() => confirmYear(year)}
                    className="min-h-20 rounded-2xl border border-white/15 bg-white/[0.06] text-xl font-black transition hover:border-orange-500 hover:bg-orange-500 hover:text-black disabled:opacity-50"
                  >
                    {year}
                  </button>
                ))}
              </div>
              {busy && <LoaderCircle className="mx-auto mt-6 animate-spin text-orange-400" />}
              <ErrorMessage message={error} />
              <button type="button" onClick={() => setStep("identity")} className="mt-8 text-sm font-semibold text-zinc-500 hover:text-white">Escolher outro perfil</button>
            </section>
          </div>
        </Screen>
      )}

      {step === "photo" && profile && (
        <Screen key="photo" scroll>
          <div className="relative mx-auto flex min-h-[100dvh] max-w-6xl flex-col px-5 py-8 sm:px-10">
            <Ambient />
            <button type="button" onClick={() => setStep("birth-year")} className="relative flex w-fit items-center gap-2 text-sm text-zinc-500 hover:text-white">
              <RotateCcw size={15} /> voltar
            </button>
            <section className="relative my-auto grid gap-8 py-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold text-zinc-500">3 de 3 · foto</p>
                <h1 className="mt-4 text-4xl font-black tracking-tighter sm:text-6xl">adicione sua foto</h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">Use a câmera ou escolha uma imagem da galeria. JPEG, PNG e WebP de até 5 MB.</p>
                <div className="mt-7 overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="Prévia da foto escolhida" className="aspect-[4/3] w-full object-cover" />
                  ) : (
                    <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 text-zinc-600">
                      <FileImage size={40} />
                      <span className="text-sm">nenhuma foto selecionada</span>
                    </div>
                  )}
                </div>
              </div>
              <aside className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">{profile.fullName}</p>
                <h2 className="mt-3 text-2xl font-black">como deseja adicionar?</h2>
                <button type="button" disabled={busy} onClick={() => galleryInput.current?.click()} className="mt-7 flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-orange-500 px-4 font-black text-black transition hover:bg-orange-400 disabled:opacity-50">
                  <Upload size={20} /> Escolher da galeria
                </button>
                <button type="button" disabled={busy} onClick={() => cameraInput.current?.click()} className="mt-3 flex min-h-14 w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[0.06] px-4 font-bold transition hover:bg-white/[0.1] disabled:opacity-50">
                  <Camera size={20} /> Tirar uma foto
                </button>
                <input ref={galleryInput} className="sr-only" type="file" accept="image/*" onChange={choosePhoto} />
                <input ref={cameraInput} className="sr-only" type="file" accept="image/*" capture="user" onChange={choosePhoto} />
                {busy && <LoaderCircle className="mx-auto mt-5 animate-spin text-orange-400" />}
                <ErrorMessage message={error} />
                <button type="button" disabled={!photo || busy} onClick={analyze} className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-35">
                  <Search size={19} /> Analisar foto
                </button>
              </aside>
            </section>
            <p className="relative mx-auto max-w-2xl text-center text-[11px] leading-5 text-zinc-600">{disclaimer}</p>
          </div>
        </Screen>
      )}

      {step === "loading" && (
        <Screen key="loading">
          <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5">
            <Ambient />
            <div className="relative flex h-28 w-28 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-white/10" />
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-orange-500" />
              <LoaderCircle className="animate-spin text-orange-300" size={34} />
            </div>
            <div className="relative mt-10 w-full max-w-xl space-y-4">
              {loadingMessages.map((message, index) => (
                <div key={message} className={`flex items-center gap-4 rounded-2xl border px-4 py-4 transition ${index === loadingStage ? "border-orange-500/40 bg-orange-500/10 text-white" : index < loadingStage ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300" : "border-white/5 text-zinc-600"}`}>
                  {index < loadingStage ? <Check size={20} /> : <LoaderCircle size={20} className={index === loadingStage ? "animate-spin text-orange-400" : ""} />}
                  <span className="text-sm font-semibold sm:text-base">{message}</span>
                </div>
              ))}
            </div>
            {profile && (
              <p className="relative mt-6 text-center text-sm text-zinc-400">
                Consultando dados de <span className="font-semibold text-zinc-200">{profile.fullName}</span>
              </p>
            )}
            <p className="relative mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">simulação fictícia</p>
          </div>
        </Screen>
      )}

      {step === "result" && score && profile && (
        <Screen key="result" scroll>
          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-10">
            <button type="button" onClick={reset} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-white/10">
              <RotateCcw size={15} /> Nova análise
            </button>
            <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-5 sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-400">resultado do ArcFace</p>
                  <p className="mt-2 text-6xl font-black tracking-tighter">{percent(score.aggregate_relative_percent)}</p>
                </div>
                <p className="max-w-md text-sm leading-6 text-zinc-400">Comparação facial por embeddings contra a galeria de referência, sem pontuação aleatória de contingência.</p>
              </div>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <Metric label="melhor cosseno" value={score.best_cosine.toFixed(4)} />
                <Metric label="percentil do melhor" value={percent(score.best_relative_percent)} />
                <Metric label="falso match estimado" value={percent(score.estimated_false_match_rate)} />
              </div>
              <div className="mt-5 text-sm text-zinc-400">Singularidade: {percent(score.distinctiveness_percent)} · força: {score.match_strength ?? "—"}</div>
              {score.warnings?.map((warning) => <p key={warning} className="mt-3 text-xs text-amber-300">{warning}</p>)}
              <h2 className="mt-10 text-xl font-black">referências mais próximas</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {score.top_matches.slice(0, 5).map((match) => (
                  <article key={match.match_id} className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={referenceImageUrl(match.image_url, getFacialApiOrigin())} alt={`Referência ${match.match_id}`} className="aspect-square w-full object-cover" />
                    <div className="p-3 text-xs text-zinc-500"><p className="font-mono">ID {match.match_id}</p><p className="mt-1 text-base font-black text-white">{percent(match.relative_percent)}</p><p>cosseno {match.cosine.toFixed(4)}</p></div>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-950 to-black p-5 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-400">dados do perfil fictício</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">{profile.fullName}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-500">Identificadores têm os dois últimos dígitos mascarados. Saúde, vacinação e dados identificáveis de familiares foram removidos.</p>
              <div className="mt-7 space-y-3">
                {profile.sections.map((section, index) => (
                  <details key={section.id} open={index === 0} className="group rounded-2xl border border-white/10 bg-white/[0.035]">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-bold">
                      <span>{section.title} <span className="ml-2 text-xs font-normal text-zinc-600">{section.items.length}</span></span>
                      <ChevronDown className="text-orange-400 transition group-open:rotate-180" size={19} />
                    </summary>
                    <div className="border-t border-white/5 px-5 py-2">
                      {section.items.map((item, itemIndex) => (
                        <div key={`${item.label}-${itemIndex}`} className="grid gap-1 border-b border-white/5 py-3 last:border-0 sm:grid-cols-[minmax(0,190px)_1fr] sm:gap-5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{item.label}</span>
                          <span className="break-words text-sm leading-6 text-zinc-200">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </section>
            <p className="mx-auto mt-8 max-w-2xl text-center text-[11px] leading-5 text-zinc-600">{disclaimer}</p>
          </div>
        </Screen>
      )}
    </AnimatePresence>
  );
}

function Ambient() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-orange-600/15 blur-[110px]" />
      <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-indigo-700/15 blur-[130px]" />
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return message ? <p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{message}</p> : null;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black p-4"><p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-2 text-xl font-black">{value}</p></div>;
}
