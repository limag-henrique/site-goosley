"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Lock,
  Maximize,
  Minimize,
  Share,
  ShieldAlert,
  Smartphone,
  X,
} from "lucide-react";

import {
  attemptWipeClipboard,
  isScreenshotKey,
} from "@/lib/anti-screenshot";

export function AntiScreenshotShield({
  isFullscreen,
  isSupported,
  onToggleFullscreen,
}: {
  isFullscreen: boolean;
  isSupported: boolean;
  onToggleFullscreen: () => void;
}) {
  const [isObscured, setIsObscured] = useState(false);
  const [showAttemptAlert, setShowAttemptAlert] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const restoreTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const triggerObscure = () => {
      if (restoreTimerRef.current) {
        window.clearTimeout(restoreTimerRef.current);
        restoreTimerRef.current = null;
      }
      setIsObscured(true);
    };

    const triggerRestore = (delay = 400) => {
      if (restoreTimerRef.current) {
        window.clearTimeout(restoreTimerRef.current);
      }
      restoreTimerRef.current = window.setTimeout(() => {
        setIsObscured(false);
      }, delay);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerObscure();
      } else {
        triggerRestore(350);
      }
    };

    const handleBlur = () => {
      triggerObscure();
    };

    const handleFocus = () => {
      triggerRestore(350);
    };

    const handleBeforePrint = () => {
      triggerObscure();
      setShowAttemptAlert(true);
    };

    const handleAfterPrint = () => {
      triggerRestore(500);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isScreenshotKey(event)) {
        event.preventDefault();
        event.stopPropagation();
        triggerObscure();
        void attemptWipeClipboard(navigator.clipboard);
        setShowAttemptAlert(true);
        triggerRestore(1200);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (isScreenshotKey(event)) {
        event.preventDefault();
        event.stopPropagation();
        triggerObscure();
        void attemptWipeClipboard(navigator.clipboard);
        setShowAttemptAlert(true);
        triggerRestore(1200);
      }
    };

    const handleCopy = (event: ClipboardEvent) => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;

      if (!isInput) {
        event.preventDefault();
        event.stopPropagation();
        if (event.clipboardData) {
          event.clipboardData.setData(
            "text/plain",
            "Captura e cópia de dados proibidas por segurança."
          );
        }
        setShowAttemptAlert(true);
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const isInput = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if (!isInput) {
        event.preventDefault();
      }
    };

    const handleDragStart = (event: DragEvent) => {
      event.preventDefault();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    document.addEventListener("copy", handleCopy, true);
    document.addEventListener("cut", handleCopy, true);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      if (restoreTimerRef.current) {
        window.clearTimeout(restoreTimerRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      document.removeEventListener("copy", handleCopy, true);
      document.removeEventListener("cut", handleCopy, true);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, []);

  const handleFullscreenClick = () => {
    if (isSupported) {
      onToggleFullscreen();
    } else {
      setShowIosGuide(true);
    }
  };

  return (
    <>
      {/* Camada permanente de marca d'água de segurança */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-30 select-none opacity-[0.035] mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='140' viewBox='0 0 320 140'%3E%3Ctext x='20' y='70' fill='%23ffffff' font-family='monospace' font-size='10' font-weight='bold' letter-spacing='2.5' transform='rotate(-20 160 70)'%3ECAPTURA PROIBIDA%3C/text%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Barra de Ações Superior (Badge de Segurança e Controle de Tela Cheia) */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-2 border-b border-white/10 bg-black/80 px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur-md sm:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-400 animate-pulse" />
          <span className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 sm:text-[11px] sm:tracking-[0.25em]">
            goosley digital · demonstração acadêmica
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Badge Proibido Screenshot */}
          <button
            type="button"
            onClick={() => setShowSecurityInfo(true)}
            title="Captura de tela proibida neste ambiente"
            className="flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-[11px] font-bold text-red-400 transition hover:bg-red-500/20 active:scale-95"
          >
            <Lock size={12} className="shrink-0" />
            <span className="hidden xs:inline sm:inline">Captura</span> Proibida
          </button>

          {/* Botão Tela Cheia */}
          <button
            type="button"
            onClick={handleFullscreenClick}
            title={isFullscreen ? "Sair do modo tela cheia" : "Entrar em modo tela cheia"}
            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-white/20 active:scale-95"
          >
            {isFullscreen ? (
              <Minimize size={13} className="shrink-0 text-orange-400" />
            ) : (
              <Maximize size={13} className="shrink-0 text-orange-400" />
            )}
            <span className="hidden sm:inline">
              {isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
            </span>
          </button>
        </div>
      </header>

      {/* Escudo Negro Anti-Screenshot / Blur / Perda de Foco */}
      <AnimatePresence>
        {isObscured && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black p-6 text-center text-white select-none"
          >
            <div className="rounded-full bg-red-500/15 p-5 ring-1 ring-red-500/30">
              <ShieldAlert className="text-red-500" size={56} />
            </div>
            <h2 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">
              Captura de tela bloqueada
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">
              Por motivos de segurança e proteção de dados, esta tela é ocultada automaticamente
              durante capturas, troca de aplicativos ou perda de foco.
            </p>
            <div className="mt-6 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-red-400">
              🔒 Ambiente Seguro · Captura Proibida
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal/Toast de Tentativa de Captura Detectada */}
      <AnimatePresence>
        {showAttemptAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed inset-x-4 top-16 z-[99998] mx-auto max-w-md rounded-2xl border border-red-500/50 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:top-20"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-red-500/20 p-2 text-red-400">
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-400">
                  Captura de tela proibida
                </h3>
                <p className="mt-1 text-xs leading-5 text-zinc-300">
                  Por diretrizes de segurança e confidencialidade de dados, a captura, gravação ou
                  cópia desta tela é estritamente proibida.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAttemptAlert(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Informativo de Segurança */}
      <AnimatePresence>
        {showSecurityInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99997] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl border border-white/15 bg-zinc-950 p-6 shadow-2xl sm:p-8"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-red-400">
                  <Lock size={20} />
                  <h3 className="text-lg font-black">Política de Segurança da Tela</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSecurityInfo(false)}
                  className="rounded-full p-1 text-zinc-500 hover:bg-white/10 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-5 space-y-4 text-sm leading-6 text-zinc-300">
                <p>
                  Esta aplicação opera em modo restrito de segurança:
                </p>
                <ul className="list-inside list-disc space-y-2 text-zinc-400">
                  <li>
                    <strong className="text-white">Capturas de tela e gravação:</strong>{" "}
                    São estritamente proibidas e bloqueadas pelo sistema.
                  </li>
                  <li>
                    <strong className="text-white">Proteção de visualização:</strong> O conteúdo
                    é ocultado em tempo real se a janela perder foco ou em utilitários de captura.
                  </li>
                  <li>
                    <strong className="text-white">Privacidade biométrica:</strong> Nenhuma imagem
                    de câmera ou foto é armazenada ou vinculada a terceiros.
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setShowSecurityInfo(false)}
                className="mt-6 flex w-full justify-center rounded-xl bg-white py-3 text-sm font-black text-black transition hover:bg-zinc-200"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Instruções para iPhone / iOS Safari Fullscreen */}
      <AnimatePresence>
        {showIosGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99997] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl border border-white/15 bg-zinc-950 p-6 shadow-2xl sm:p-8"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-orange-400">
                  <Smartphone size={22} />
                  <h3 className="text-lg font-black">Tela Cheia no iPhone / Safari</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIosGuide(false)}
                  className="rounded-full p-1 text-zinc-500 hover:bg-white/10 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-5 space-y-4 text-sm leading-6 text-zinc-300">
                <p>
                  No Safari do iOS (iPhone), a Apple restringe a API nativa de tela cheia dentro do
                  navegador.
                </p>
                <p className="font-semibold text-white">
                  Para visualizar em tela cheia total sem nenhuma barra do navegador:
                </p>
                <ol className="list-inside list-decimal space-y-2 text-zinc-400">
                  <li>
                    Toque no botão <strong className="text-white">Compartilhar</strong> (ícone com
                    quadrado e seta <Share size={14} className="inline text-orange-400" />) na barra
                    inferior do Safari.
                  </li>
                  <li>
                    Role para baixo e selecione{" "}
                    <strong className="text-white">&quot;Adicionar à Tela de Início&quot;</strong>.
                  </li>
                  <li>
                    Toque em <strong className="text-white">Adicionar</strong> no canto superior.
                  </li>
                  <li>
                    Abra o ícone criado na sua tela inicial para desfrutar da tela cheia completa!
                  </li>
                </ol>
              </div>

              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="mt-6 flex w-full justify-center rounded-xl bg-orange-500 py-3 text-sm font-black text-black transition hover:bg-orange-400"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
