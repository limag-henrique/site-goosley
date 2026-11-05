import { ConsultaForm } from "./ConsultaForm";

export default function DeclarationNotFound() {
  return (
    <section aria-labelledby="documento-nao-encontrado">
      <h1 id="documento-nao-encontrado" className="text-2xl font-semibold tracking-tight sm:text-3xl">Documento não encontrado</h1>
      <p className="mt-3 text-base leading-relaxed text-neutral-600">Nenhuma declaração foi localizada com essa chave. Confira o código do documento e tente novamente.</p>
      <ConsultaForm />
    </section>
  );
}
