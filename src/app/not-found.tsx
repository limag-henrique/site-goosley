import type { Metadata } from "next";
import { ErrorState } from "@/components/ErrorState";

export const metadata: Metadata = {
  title: "P\u00e1gina n\u00e3o encontrada | Goosley Digital",
  description: "A p\u00e1gina solicitada n\u00e3o foi encontrada.",
};

export default function NotFound() {
  return (
    <ErrorState
      code="404"
      eyebrow={<>rota n&atilde;o encontrada</>}
      title={
        <>
          Esta p&aacute;gina saiu do mapa.
        </>
      }
      description={
        <>
          O endere&ccedil;o pode ter mudado ou n&atilde;o existir mais. Volte
          para a Home e continue explorando as solu&ccedil;&otilde;es da
          Goosley.
        </>
      }
    />
  );
}
