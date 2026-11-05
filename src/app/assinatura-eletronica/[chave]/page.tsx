import { notFound } from "next/navigation";
import { findDeclaration } from "@/server/electronic-signature";

export default async function DeclarationPage({ params }: { params: Promise<{ chave: string }> }) {
  const { chave } = await params;
  const declaration = findDeclaration(chave);
  if (!declaration) notFound();

  return (
    <article aria-labelledby="declaracao-titulo">
      <h1 id="declaracao-titulo" className="text-2xl font-semibold tracking-tight sm:text-3xl">Declaração</h1>
      <div className="mt-8 space-y-6 text-base leading-8 sm:text-lg sm:leading-9">
        <p>
          Declaro, para os devidos fins, que <strong>{declaration.patient.name}</strong>, nascido em {declaration.patient.birthDate}, CPF {declaration.patient.cpf}, apresenta diagnóstico de <strong>Síndrome de Tourette</strong>, de intensidade clínica moderada, e de <strong>Transtorno do Déficit de Atenção com Hiperatividade (TDAH)</strong>, para fins de comprovação diagnóstica.
        </p>
        <p><strong>CID: </strong>F95.2 - Síndrome de Gilles de la Tourette e F90.0 - Distúrbios da atividade e da atenção (TDAH)</p>
      </div>
      <footer className="mt-10 border-t border-neutral-200 pt-7">
        <p className="text-sm leading-7 text-neutral-700">Assinado eletronicamente por: <strong className="font-semibold text-neutral-900">{declaration.physician.name} - {declaration.physician.specialty}</strong><br />{declaration.physician.registration}</p>
        <dl className="mt-7 grid gap-5 text-sm leading-6 sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-neutral-900">Emissão:</dt>
            <dd className="text-neutral-700">{declaration.issuedAt}</dd>
          </div>
          <div>
            <dt className="font-semibold text-neutral-900">Data Expiração:</dt>
            <dd className="text-neutral-700">{declaration.expiresAt}</dd>
          </div>
        </dl>
        <p className="mt-7 text-sm font-medium text-neutral-600">Chave de consulta:</p>
        <code className="mt-2 block break-all rounded-sm bg-neutral-100 px-3 py-3 text-sm leading-6 text-neutral-800">{declaration.key}</code>
      </footer>
    </article>
  );
}
