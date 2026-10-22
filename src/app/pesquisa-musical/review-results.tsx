import type { Dimension, PortalEvent, ReviewStatus } from '@/lib/research-portal';

export const reviewStatuses:Record<ReviewStatus,string> = {
  scored:'Avaliação com escores', 'missing-lyrics':'Ausência de letra', doubt:'Dúvida de interpretação', abstain:'Abstenção', 'identity-error':'Erro de identidade',
};
export type Comparison = {
  ai:Record<string,unknown>; provenance:Record<string,unknown>;
  prompt:{template:unknown;version:unknown;note:string};
  metrics:{dimension:string;human:number|null;ai:number|null;delta:number|null}[];
};
export type SharedReview = PortalEvent & { reflectionEvent?:PortalEvent|null };
const intensity = ['ausente','incidental','substancial','central'];
function scoreLabel(value:number|null) { return value===null?'Sem escore':`${value} · ${intensity[value]??'intensidade registrada'}`; }

export function AiComparison({comparison,dimensions,hasReview=true}:{comparison:Comparison;dimensions:Dimension[];hasReview?:boolean}) {
  const comparable=comparison.metrics.filter(row=>row.delta!==null);
  const divergent=comparable.filter(row=>row.delta!==0);
  return <section className="ai-comparison" aria-label="Análise da IA e diferenças">
    <h3>Análise da IA e diferenças</h3>
    <p>{!hasReview?'Você está consultando a IA antes de salvar seu parecer. Seus escores e as diferenças aparecerão após o salvamento.':comparable.length?`${divergent.length} de ${comparable.length} dimensões comparáveis têm escores diferentes.`:'Seu parecer não contém escores numéricos. Você pode ler a classificação da IA e ponderar sobre ela.'}</p>
    <p className="muted">Diferença = seu escore menos o da IA. Zero indica concordância; valor positivo indica intensidade maior na sua avaliação. A resposta histórica contém escores, sem uma justificativa textual da IA registrada.</p>
    <div className="table-wrap"><table><thead><tr><th scope="col">Dimensão</th><th scope="col">Seu escore salvo</th><th scope="col">IA</th><th scope="col">Diferença</th></tr></thead><tbody>{comparison.metrics.map(row=>{
      const dimension=dimensions.find(d=>d.code===row.dimension);
      return <tr key={row.dimension}><th scope="row">{dimension?.label??row.dimension}<small className="dimension-definition">{dimension?.definition}</small></th><td>{scoreLabel(row.human)}</td><td>{scoreLabel(row.ai)}</td><td>{row.delta===null?'Não comparável':row.delta>0?`+${row.delta}`:row.delta}</td></tr>;
    })}</tbody></table></div>
    <details><summary>Prompt utilizado pela IA</summary><p>{comparison.prompt.note}</p><p className="muted">Modelo: {String(comparison.provenance.model_id??'Não registrado')} · Versão do prompt: {String(comparison.prompt.version??'Não registrada')}</p><pre>{typeof comparison.prompt.template==='string'?comparison.prompt.template:JSON.stringify(comparison.prompt.template,null,2)}</pre></details>
  </section>;
}

export function SharedReviews({reviews,recordings,dimensions}:{reviews:SharedReview[];recordings:{id:string;title:string;artist:string}[];dimensions:Dimension[]}) {
  return <section className="panel"><h2>Pareceres e ponderações salvos</h2>
    <p className="muted">Visíveis a todos que acessam esta página. Atualizados automaticamente a cada 15 segundos. A leitura pode influenciar sua própria avaliação.</p>
    {!reviews.length&&<p>Ainda não há pareceres salvos. Eles aparecerão aqui após o primeiro salvamento.</p>}
    {reviews.map(review=>{
      const track=recordings.find(r=>r.id===review.recordingId);
      return <article key={review.id} className="shared-review"><h3>{track?.title??review.recordingId}</h3>
        <p className="muted">{track?.artist} · {review.evaluator} · Avaliadora {review.reviewer} · <time dateTime={review.at}>{new Date(review.at).toLocaleString('pt-BR')}</time></p>
        <p className="muted">{review.aiExposed?'Parecer elaborado após consultar a IA.':'Parecer salvo antes da consulta à IA neste portal.'} Situação: {review.status?reviewStatuses[review.status]:'Não informada'}.</p>
        <h4>Fundamento da avaliadora</h4><p className="review-text">{review.justification}</p>
        {review.reflectionEvent&&<><h4>Ponderação sobre as diferenças com a IA</h4><p className="review-text">{review.reflectionEvent.reflection}</p><small>Salva em <time dateTime={review.reflectionEvent.at}>{new Date(review.reflectionEvent.at).toLocaleString('pt-BR')}</time>.</small></>}
        <details><summary>Escores da avaliadora</summary><div className="table-wrap"><table><thead><tr><th>Dimensão</th><th>Escore</th></tr></thead><tbody>{dimensions.map(d=><tr key={d.code}><th scope="row">{d.label}</th><td>{scoreLabel(review.scores?.[d.code]??null)}</td></tr>)}</tbody></table></div></details>
      </article>;
    })}
  </section>;
}
