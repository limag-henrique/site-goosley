import type { Dimension, PortalEvent } from './research-portal';

export interface ComparisonExport {
  exportVersion:'research-comparison-export-v1'; exportedAt:string; campaignFingerprint:string;
  selectionVersion:string|null; comparisonRule:string; dimensions:Dimension[]; history:PortalEvent[];
  evaluations:{
    recording:{id:string;title:string;artist:string;market:string;documentId:string;lyricsHash:string};
    review:PortalEvent; reflection:PortalEvent|null;
    comparison:{ai:Record<string,unknown>;provenance:Record<string,unknown>;prompt:{version:unknown;template:unknown;note:string};metrics:{dimension:string;human:number|null;ai:number|null;delta:number|null}[]};
  }[];
}
const statusLabels:Record<string,string>={scored:'Avaliação com escores','missing-lyrics':'Ausência de letra',doubt:'Dúvida de interpretação',abstain:'Abstenção','identity-error':'Erro de identidade'};
function csvCell(value:unknown):string {
  let text=value===null||value===undefined?'':String(value);
  // Neutralize user-provided spreadsheet formulas while preserving numeric deltas.
  if(typeof value==='string'&&(/^[\t\r\n]/.test(text)||/^\s*[=+@-]/.test(text)))text="'"+text;
  return '"'+text.replaceAll('"','""')+'"';
}
export function comparisonCsv(value:ComparisonExport):string {
  const header=['Música','Artista','Avaliadora','Nome','Dimensão','Escore humano','Escore IA','Diferença (humano - IA)','Resultado','Fundamento da avaliadora','Ponderação sobre a IA','Situação','IA consultada antes do parecer','Parecer salvo em','Ponderação salva em','Mercado de circulação','ID da música','ID do parecer','Documento da letra','SHA-256 da letra','Rubrica humana','Modelo de IA','Versão do prompt','Exportado em'];
  const lines=[header.map(csvCell).join(';')];
  for(const {recording,review,reflection,comparison} of value.evaluations) {
    for(const metric of comparison.metrics) {
      const row=[recording.title,recording.artist,review.reviewer,review.evaluator,value.dimensions.find(d=>d.code===metric.dimension)?.label??metric.dimension,metric.human,metric.ai,metric.delta,metric.delta===null?'Sem comparação':metric.delta===0?'Concordância':'Divergência',review.justification,reflection?.reflection,statusLabels[review.status??'']??'Não informada',review.aiExposed?'Sim':'Não',review.at,reflection?.at,recording.market,recording.id,review.id,recording.documentId,recording.lyricsHash,review.rubricVersion,comparison.provenance.model_id,comparison.prompt.version,value.exportedAt];
      lines.push(row.map(csvCell).join(';'));
    }
  }
  return '\ufeff'+lines.join('\r\n')+'\r\n';
}
