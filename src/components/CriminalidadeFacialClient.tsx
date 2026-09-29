"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, LoaderCircle, RotateCcw, ShieldCheck, Upload } from "lucide-react";

import {
  getFacialApiOrigin,
  referenceImageUrl,
  scorePhoto,
  type PublicScoreResponse,
} from "@/lib/criminalidadefacial";

type Turnstile = {
  render(container: HTMLElement, options: { sitekey: string; action: string; callback(token: string): void; "expired-callback"(): void }): string;
  reset(widgetId?: string): void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const acceptedTypes = "image/jpeg,image/png,image/webp";

function percent(value: number | undefined | null, digits = 1) {
  return typeof value === "number" && Number.isFinite(value) ? `${value.toFixed(digits)}%` : "—";
}

export function CriminalidadeFacialClient() {
  const apiOrigin = getFacialApiOrigin();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const videoRef = useRef<HTMLVideoElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const streamRef = useRef<MediaStream | undefined>(undefined);
  const [photo, setPhoto] = useState<Blob>();
  const [previewUrl, setPreviewUrl] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [score, setScore] = useState<PublicScoreResponse>();

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = undefined;
    setCameraOpen(false);
  };

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    if (!siteKey || !widgetRef.current) return;
    const render = () => {
      if (!widgetRef.current || widgetIdRef.current || !window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(widgetRef.current, {
        sitekey: siteKey,
        action: "turnstile-spin-v1",
        callback: setToken,
        "expired-callback": () => setToken(""),
      });
    };
    const existing = document.querySelector<HTMLScriptElement>('script[src^="https://challenges.cloudflare.com/turnstile/"]');
    if (existing) {
      existing.addEventListener("load", render);
      render();
      return () => existing.removeEventListener("load", render);
    }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", render);
    document.head.appendChild(script);
    return () => script.removeEventListener("load", render);
  }, [siteKey]);

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

  async function analyze() {
    if (!photo) return setError("Capture ou selecione uma foto antes de analisar.");
    setIsLoading(true);
    setError("");
    try {
      setScore(await scorePhoto(photo, token));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível concluir a análise. Tente novamente.");
    } finally {
      setIsLoading(false);
      setToken("");
      window.turnstile?.reset(widgetIdRef.current);
    }
  }

  return (
    <main className="min-h-screen bg-black px-5 pb-20 pt-32 text-white sm:px-8 lg:px-12">
      <section className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-orange-400">demonstração acadêmica</p>
          <h1 className="text-4xl font-black tracking-tighter sm:text-6xl">criminalidade facial</h1>
          <p className="mt-6 text-base leading-7 text-zinc-300 sm:text-lg">
            Compare uma foto com a galeria de referência do projeto. Os percentuais são percentis empíricos de similaridade da galeria — não são identificação, probabilidade nem característica criminal.
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
            <p className="mt-3 text-sm leading-6 text-zinc-400">A foto é enviada somente quando você pressiona “Analisar foto”. Não há análise contínua da câmera.</p>
            {!apiOrigin && <p className="mt-5 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">A origem da API ainda não foi configurada neste ambiente.</p>}
            {!siteKey && <p className="mt-5 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">A chave pública do Turnstile ainda não foi configurada neste ambiente.</p>}
            <div ref={widgetRef} data-action="turnstile-spin-v1" className="mt-6 min-h-16" />
            {error && <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
            <button type="button" disabled={isLoading || !photo || !token || !apiOrigin} onClick={analyze} className="mt-5 flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40">
              {isLoading ? <><LoaderCircle className="animate-spin" size={19} /> Analisando…</> : <><ImagePlus size={19} /> Analisar foto</>}
            </button>
          </aside>
        </div>

        {score && <section className="mt-10 rounded-3xl border border-white/10 bg-zinc-950 p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">índice agregado</p><p className="mt-2 text-5xl font-black tracking-tighter">{percent(score.aggregate_relative_percent)}</p></div><p className="max-w-md text-sm leading-6 text-zinc-400">Posição do conjunto de candidatos mais próximos na distribuição empírica da galeria.</p></div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3"><Metric label="melhor cosseno" value={score.best_cosine.toFixed(4)} /><Metric label="percentil do melhor" value={percent(score.best_relative_percent)} /><Metric label="taxa estimada de falso match" value={percent(score.estimated_false_match_rate)} /></div>
          <div className="mt-8 flex items-center gap-2 text-sm text-zinc-300"><RotateCcw size={16} className="text-orange-400" /> Singularidade da consulta: {percent(score.distinctiveness_percent)} · força: {score.match_strength ?? "—"}</div>
          <h2 className="mt-10 text-xl font-bold">referências mais próximas</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{score.top_matches.slice(0, 5).map((match) => <article key={match.match_id} className="overflow-hidden rounded-2xl border border-white/10 bg-black"><img src={referenceImageUrl(match.image_url)} alt={`Referência ${match.match_id}`} className="aspect-square w-full object-cover" /><div className="p-3"><p className="font-mono text-xs text-zinc-400">ID {match.match_id}</p><p className="mt-1 text-sm font-bold">{percent(match.relative_percent)}</p><p className="text-xs text-zinc-500">cosseno {match.cosine.toFixed(4)}</p></div></article>)}</div>
        </section>}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black p-4"><p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-2 text-xl font-bold">{value}</p></div>;
}
