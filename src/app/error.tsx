"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { ErrorState } from "@/components/ErrorState";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      code="500"
      eyebrow={<>algo interrompeu a experi&ecirc;ncia</>}
      title={
        <>
          Ops, encontramos um obst&aacute;culo t&eacute;cnico.
        </>
      }
      description={
        <>
          Tente carregar novamente ou volte para a Home enquanto colocamos tudo
          no lugar.
        </>
      }
      actions={
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="group inline-flex items-center justify-center gap-3 rounded-full border border-foreground/20 bg-foreground/10 px-7 py-4 text-sm font-bold uppercase tracking-widest text-foreground backdrop-blur-xl transition-all duration-300 hover:border-foreground/40 hover:bg-foreground/15"
        >
          <RefreshCw className="h-5 w-5 transition-transform duration-500 group-hover:rotate-180" />
          Tentar novamente
        </button>
      }
    />
  );
}
