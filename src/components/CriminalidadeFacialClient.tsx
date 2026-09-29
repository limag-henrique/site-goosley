"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, ChevronRight, LoaderCircle, RotateCcw, Search, ShieldCheck, Upload, User } from "lucide-react";

import {
  getFacialApiOrigin,
  referenceImageUrl,
  scorePhoto,
  type PublicScoreResponse,
} from "@/lib/criminalidadefacial";

import { DISPLAY_FIELDS, findPerson, searchPeople, type PersonProfile } from "@/data/pessoasData";

const acceptedTypes = "image/jpeg,image/png,image/webp";

function percent(value: number | undefined | null, digits = 1) {
  return typeof value === "number" && Number.isFinite(value) ? `${value.toFixed(digits)}%` : "—";
}

const LOADING_STAGES = [
  "Encontrando o seu perfil",
  "Analisando similaridade",
  "Baixando os seus dados",
] as const;

type AppStep = "name" | "photo" | "loading" | "result";

export function CriminalidadeFacialClient() {
  const apiOrigin = getFacialApiOrigin();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  // Step management
  const [step, setStep] = useState<AppStep>("name");

  // Name input
  const [nameQuery, setNameQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<PersonProfile | undefined>();
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Photo capture
  const [photo, setPhoto] = useState<Blob>();
  const [previewUrl, setPreviewUrl] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);

  // Loading
  const [loadingStage, setLoadingStage] = useState(0);

  // Results
  const [error, setError] = useState("");
  const [score, setScore] = useState<PublicScoreResponse>();

  // Autocomplete suggestions
  const suggestions = useMemo(() => searchPeople(nameQuery), [nameQuery]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = undefined;
    setCameraOpen(false);
  }, []);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  // ── Name step handlers ──

  function handleSelectPerson(person: PersonProfile) {
    setSelectedPerson(person);
    setNameQuery(person.fullName);
    setShowSuggestions(false);
    setStep("photo");
  }

  function handleNameInputChange(value: string) {
    setNameQuery(value);
    setSelectedPerson(undefined);
    setShowSuggestions(value.length > 0);
  }

  function handleNameSubmit() {
    if (!nameQuery.trim()) return;
    const found = findPerson(nameQuery);
    if (found) {
      handleSelectPerson(found);
    } else {
      // Even if not in the list, allow proceeding
      setSelectedPerson(undefined);
      setStep("photo");
    }
  }

  // ── Photo step handlers ──

  function usePhoto(next: Blob) {
    if (!acceptedTypes.split(",").includes(next.type.toLowerCase())) {
      setError("Escolha uma imagem JPEG, PNG ou WebP válida.");
      return;
    }
    if (next.size > 5 * 1024 * 1024) {
      setError("A imagem excede o limite de 5 MB. Escolha uma versão menor.");
      return;
    }
    setError("");
    setScore(undefined);
    setPhoto(next);
    setPreviewUrl(URL.createObjectURL(next));
  }

  async function openCamera() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "user" } }, audio: false });
      streamRef.current = stream;
      setCameraOpen(true);
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      setError("Não foi possível acessar a câmera. Verifique a permissão ou envie uma foto.");
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return setError("A câmera ainda não está pronta. Tente novamente.");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return setError("Não foi possível capturar a foto. Tente novamente.");
      usePhoto(blob);
      stopCamera();
    }, "image/jpeg", 0.9);
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (selected) usePhoto(selected);
    event.target.value = "";
  }

  // ── Analyze ──

  async function analyze() {
    if (!photo) return setError("Capture ou selecione uma foto antes de analisar.");
    setStep("loading");
    setLoadingStage(0);
    setError("");

    // Animate through loading stages
    const stageTimers: ReturnType<typeof setTimeout>[] = [];
    stageTimers.push(setTimeout(() => setLoadingStage(1), 2000));
    stageTimers.push(setTimeout(() => setLoadingStage(2), 4500));

    try {
      const result = await scorePhoto(photo);
      stageTimers.forEach(clearTimeout);
      setScore(result);
      setStep("result");
    } catch (reason) {
      stageTimers.forEach(clearTimeout);
      setError(reason instanceof Error ? reason.message : "Não foi possível concluir a análise. Tente novamente.");
      setStep("photo");
    }
  }

  function reset() {
    setStep("name");
    setNameQuery("");
    setSelectedPerson(undefined);
    setPhoto(undefined);
    setPreviewUrl("");
    setScore(undefined);
    setError("");
    stopCamera();
  }

  // ══════════════════════════════════════════
  // STEP 1: Full-screen name entry
  // ══════════════════════════════════════════
  if (step === "name") {
    return (
      <main className="fixed inset-0 z-50 flex flex-col bg-black text-white">
        {/* Ambient gradient */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-1/3 -top-1/3 h-[80vh] w-[80vh] rounded-full bg-orange-600/8 blur-[120px]" />
          <div className="absolute -bottom-1/4 -right-1/4 h-[60vh] w-[60vh] rounded-full bg-indigo-600/6 blur-[100px]" />
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center px-5 sm:px-8">
          {/* Icon */}
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
            <User size={36} className="text-orange-400" />
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-orange-400">identificação</p>
          <h1 className="mb-3 text-center text-3xl font-black tracking-tighter sm:text-5xl">
            qual é o seu nome?
          </h1>
          <p className="mb-10 max-w-md text-center text-sm leading-6 text-zinc-400">
            Digite seu nome e sobrenome para localizar o seu perfil na base de dados.
          </p>

          {/* Search input */}
          <div className="relative w-full max-w-md">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                ref={inputRef}
                type="text"
                value={nameQuery}
                onChange={(e) => handleNameInputChange(e.target.value)}
                onFocus={() => nameQuery.length > 0 && setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (suggestions.length === 1) {
                      handleSelectPerson(suggestions[0]);
                    } else {
                      handleNameSubmit();
                    }
                  }
                  if (e.key === "Escape") setShowSuggestions(false);
                }}
                placeholder="Nome e sobrenome..."
                autoFocus
                autoComplete="off"
                className="h-14 w-full rounded-2xl border border-white/15 bg-white/5 pl-11 pr-4 text-base text-white placeholder:text-zinc-600 outline-none transition-all focus:border-orange-500/50 focus:bg-white/8 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-10 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900/95 shadow-2xl shadow-black/60 backdrop-blur-xl">
                {suggestions.map((person) => (
                  <button
                    key={person.fullName}
                    type="button"
                    onClick={() => handleSelectPerson(person)}
                    className="flex w-full items-center gap-3 border-b border-white/5 px-4 py-3.5 text-left transition-colors last:border-b-0 hover:bg-white/8"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-sm font-bold text-orange-400">
                      {person.firstName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{person.fullName}</p>
                      {person.fields["NATURALIDADE"] && (
                        <p className="truncate text-xs text-zinc-500">{person.fields["NATURALIDADE"]}</p>
                      )}
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-zinc-600" />
                  </button>
                ))}
              </div>
            )}

            {/* No results message */}
            {showSuggestions && nameQuery.length > 2 && suggestions.length === 0 && (
              <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-2xl border border-white/10 bg-zinc-900/95 px-4 py-6 text-center shadow-2xl backdrop-blur-xl">
                <p className="text-sm text-zinc-400">Nenhum perfil encontrado para &ldquo;{nameQuery}&rdquo;</p>
                <button type="button" onClick={handleNameSubmit} className="mt-3 text-sm font-semibold text-orange-400 transition hover:text-orange-300">
                  Continuar mesmo assim →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom hint */}
        <div className="relative px-5 pb-8 text-center">
          <p className="text-xs text-zinc-600">
            Os nomes são sugeridos com base na lista de perfis cadastrados.
          </p>
        </div>
      </main>
    );
  }

  // ══════════════════════════════════════════
  // STEP 2: Photo capture (existing flow, adapted)
  // ══════════════════════════════════════════
  if (step === "photo") {
    return (
      <main className="min-h-screen bg-black px-5 pb-20 pt-32 text-white sm:px-8 lg:px-12">
        <section className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <button type="button" onClick={reset} className="mb-6 flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-300">
              <RotateCcw size={14} /> Voltar à identificação
            </button>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-orange-400">demonstração acadêmica</p>
            <h1 className="text-4xl font-black tracking-tighter sm:text-6xl">criminalidade facial</h1>
            {selectedPerson && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-orange-500/20 bg-orange-500/5 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20 font-bold text-orange-400">
                  {selectedPerson.firstName[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{selectedPerson.fullName}</p>
                  <p className="text-xs text-zinc-400">Perfil selecionado</p>
                </div>
              </div>
            )}
            <p className="mt-6 text-base leading-7 text-zinc-300 sm:text-lg">
              Envie ou capture uma foto para comparar com a galeria de referência.
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_0.85fr]">
            <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5 shadow-2xl shadow-orange-950/20 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold">foto de consulta</h2>
                <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs text-orange-300">máx. 5 MB</span>
              </div>
              {cameraOpen ? (
                <div className="mt-5 overflow-hidden rounded-2xl bg-black">
                  <video ref={videoRef} autoPlay playsInline muted className="aspect-square w-full object-cover" />
                </div>
              ) : previewUrl ? (
                <img src={previewUrl} alt="Prévia local da foto selecionada" className="mt-5 aspect-square w-full rounded-2xl object-cover" />
              ) : (
                <div className="mt-5 flex aspect-square items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.03] text-center text-sm text-zinc-400">
                  A prévia permanece neste dispositivo durante a análise.
                </div>
              )}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {cameraOpen ? (
                  <button type="button" onClick={capturePhoto} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 font-bold text-black transition hover:bg-orange-400"><Camera size={18} /> Capturar foto</button>
                ) : (
                  <button type="button" onClick={openCamera} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 font-bold text-black transition hover:bg-orange-400"><Camera size={18} /> Usar câmera</button>
                )}
                {cameraOpen ? (
                  <button type="button" onClick={stopCamera} className="min-h-12 rounded-xl border border-white/15 px-4 font-semibold text-zinc-200 transition hover:bg-white/10">Cancelar câmera</button>
                ) : (
                  <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 px-4 font-semibold text-zinc-200 transition hover:bg-white/10"><Upload size={18} /> Enviar foto<input className="sr-only" type="file" accept={acceptedTypes} capture="user" onChange={chooseFile} /></label>
                )}
              </div>
            </section>

            <aside className="rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-950 to-zinc-900 p-5 sm:p-7">
              <ShieldCheck className="text-orange-400" size={28} />
              <h2 className="mt-5 text-xl font-bold">analisar com contexto</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">A foto é enviada somente quando você pressiona &quot;Analisar foto&quot;. Não há análise contínua da câmera.</p>
              {!apiOrigin && <p className="mt-5 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">A origem da API ainda não foi configurada neste ambiente.</p>}
              {error && <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
              <button type="button" disabled={!photo || !apiOrigin} onClick={analyze} className="mt-5 flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40">
                <Search size={19} /> Analisar foto
              </button>
            </aside>
          </div>
        </section>
      </main>
    );
  }

  // ══════════════════════════════════════════
  // STEP 3: Loading with staged descriptions
  // ══════════════════════════════════════════
  if (step === "loading") {
    return (
      <main className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white">
        {/* Ambient gradient */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[50vh] w-[50vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-600/10 blur-[100px] animate-pulse" />
        </div>

        <div className="relative flex flex-col items-center gap-8 px-5">
          {/* Spinner */}
          <div className="relative flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-white/5" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-orange-500" style={{ animationDuration: "1.2s" }} />
            <LoaderCircle className="animate-spin text-orange-400" size={32} style={{ animationDuration: "2s" }} />
          </div>

          {/* Stage text */}
          <div className="flex flex-col items-center gap-4">
            {LOADING_STAGES.map((label, i) => (
              <div
                key={label}
                className={`flex items-center gap-3 transition-all duration-500 ${
                  i < loadingStage
                    ? "text-emerald-400 opacity-60"
                    : i === loadingStage
                      ? "text-white scale-105"
                      : "text-zinc-600 opacity-40"
                }`}
              >
                {i < loadingStage ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
                    </svg>
                  </div>
                ) : i === loadingStage ? (
                  <LoaderCircle className="h-6 w-6 animate-spin text-orange-400" style={{ animationDuration: "1.5s" }} />
                ) : (
                  <div className="h-6 w-6 rounded-full border border-zinc-700" />
                )}
                <span className="text-sm font-semibold sm:text-base">{label}</span>
              </div>
            ))}
          </div>

          {selectedPerson && (
            <p className="mt-4 text-sm text-zinc-500">
              Buscando dados de <span className="font-semibold text-zinc-300">{selectedPerson.fullName}</span>
            </p>
          )}
        </div>
      </main>
    );
  }

  // ══════════════════════════════════════════
  // STEP 4: Results
  // ══════════════════════════════════════════
  return (
    <main className="min-h-screen bg-black px-5 pb-20 pt-32 text-white sm:px-8 lg:px-12">
      <section className="mx-auto max-w-6xl">
        <button type="button" onClick={reset} className="mb-8 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/10">
          <RotateCcw size={14} /> Nova consulta
        </button>

        {/* ── Algorithm results ── */}
        {score && (
          <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5 sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">índice agregado</p>
                <p className="mt-2 text-5xl font-black tracking-tighter">{percent(score.aggregate_relative_percent)}</p>
              </div>
              <p className="max-w-md text-sm leading-6 text-zinc-400">
                Posição do conjunto de candidatos mais próximos na distribuição empírica da galeria.
              </p>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <Metric label="melhor cosseno" value={score.best_cosine.toFixed(4)} />
              <Metric label="percentil do melhor" value={percent(score.best_relative_percent)} />
              <Metric label="taxa estimada de falso match" value={percent(score.estimated_false_match_rate)} />
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm text-zinc-300">
              <RotateCcw size={16} className="text-orange-400" />
              Singularidade da consulta: {percent(score.distinctiveness_percent)} · força: {score.match_strength ?? "—"}
            </div>

            <h2 className="mt-10 text-xl font-bold">referências mais próximas</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {score.top_matches.slice(0, 5).map((match) => (
                <article key={match.match_id} className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                  <img src={referenceImageUrl(match.image_url)} alt={`Referência ${match.match_id}`} className="aspect-square w-full object-cover" />
                  <div className="p-3">
                    <p className="font-mono text-xs text-zinc-400">ID {match.match_id}</p>
                    <p className="mt-1 text-sm font-bold">{percent(match.relative_percent)}</p>
                    <p className="text-xs text-zinc-500">cosseno {match.cosine.toFixed(4)}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ── Person profile ── */}
        {selectedPerson && (
          <section className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-950 to-zinc-900 p-5 sm:p-7">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/15 text-xl font-black text-orange-400">
                {selectedPerson.firstName[0]}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">perfil identificado</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">{selectedPerson.fullName}</h2>
              </div>
            </div>

            {Object.keys(selectedPerson.fields).length > 0 ? (
              <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                {DISPLAY_FIELDS.filter((f) => selectedPerson.fields[f.key]).map((f) => (
                  <div key={f.key} className="flex flex-col gap-1 border-b border-white/5 bg-black/40 px-5 py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:gap-4">
                    <span className="min-w-[160px] shrink-0 text-xs font-bold uppercase tracking-wider text-zinc-500">{f.label}</span>
                    <span className="text-sm text-zinc-200">{selectedPerson.fields[f.key]}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
                Os dados detalhados deste perfil ainda não estão disponíveis na base cadastrada.
              </p>
            )}
          </section>
        )}

        {/* If no person was selected from the list */}
        {!selectedPerson && nameQuery && (
          <section className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-950 to-zinc-900 p-5 sm:p-7">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 text-xl font-black text-zinc-400">
                <User size={24} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">consulta livre</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">{nameQuery}</h2>
              </div>
            </div>
            <p className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
              Este nome não foi encontrado na base de perfis pré-cadastrados. Apenas a comparação facial está disponível.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-4">
      <p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 text-xl font-bold">{value}</p>
    </div>
  );
}
