import { ConsultaForm } from "./ConsultaForm";

export default function SignatureConsultationPage() {
  return (
    <section aria-labelledby="consulta-titulo">
      <h1 id="consulta-titulo" className="text-2xl font-semibold tracking-tight sm:text-3xl">Consultar documento</h1>
      <p className="mt-3 max-w-lg text-base leading-relaxed text-neutral-600">Use a chave de consulta para localizar e visualizar a declaração correspondente.</p>
      <ConsultaForm />
    </section>
  );
}
