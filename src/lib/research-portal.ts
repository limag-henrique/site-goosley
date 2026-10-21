export type Reviewer = 1 | 2;
export type ReviewStatus = 'scored' | 'missing-lyrics' | 'doubt' | 'abstain' | 'identity-error';
export interface Recording { id:string; title:string; artist:string; documentId:string; lyricsHash:string; market:string; markets:string[]; years:number[]; genre:string|null; language:string|null; lyrics:string|null; lyricAvailable?:boolean; provenance:Record<string,unknown>; ai:Record<string,unknown> }
export interface Dimension { code:string; label:string; definition:string }
export interface PortalDataset { recordings:Recording[]; dimensions:Dimension[]; annual:unknown[]; context?:unknown[]; sources:unknown[]; methodology:Record<string,unknown> }
export interface PortalEvent { id:string; action:'save'|'close'; reviewer:Reviewer; evaluator:string; at:string; rubricVersion:string; campaignFingerprint?:string; recordingId?:string; documentId?:string; lyricsHash?:string; status?:ReviewStatus; scores?:Record<string,number|null>; justification?:string; recordedLanguage?:string|null; identityVerdict?:'confirmed'|'uncertain'|'mismatch'|null }
export interface EventStore { read():Promise<PortalEvent[]>; append(event:PortalEvent,expectedCount:number):Promise<void>; lyric?(documentId:string,hash:string):Promise<string|null> }
export class PortalError extends Error { status:number; constructor(message:string,status=400){super(message);this.status=status;} }
export const RUBRIC_VERSION='human-lyrics-review-v1';
const statuses:ReviewStatus[]=['scored','missing-lyrics','doubt','abstain','identity-error'];
function reviewerOf(value:unknown):Reviewer { if(value===1||value==='1')return 1;if(value===2||value==='2')return 2;throw new PortalError('Selecione a avaliadora 1 ou 2.'); }
function nonempty(value:unknown,label:string,max=6000):string {if(typeof value!=='string'||!value.trim()||value.length>max)throw new PortalError(`${label} é obrigatório (até ${max} caracteres).`);return value.trim();}
function blindRecording(r:Recording){return {id:r.id,title:r.title,artist:r.artist,documentId:r.documentId,lyricsHash:r.lyricsHash,market:r.market,markets:r.markets,years:r.years,genre:r.genre,language:r.language,lyrics:r.lyrics};}
function latest(events:PortalEvent[],reviewer:Reviewer){const map=new Map<string,PortalEvent>();for(const e of events)if(e.action==='save'&&e.reviewer===reviewer&&e.recordingId)map.set(e.recordingId,e);return map;}

/** Server-only service. AI is embargoed globally, including exploration, until both passes close. */
export class PortalService {
  dataset:PortalDataset; store:EventStore;
  constructor(dataset:PortalDataset,store:EventStore){this.dataset=dataset;this.store=store;}
  private async lyric(recording:Recording){return this.store.lyric?this.store.lyric(recording.documentId,recording.lyricsHash):recording.lyrics;}
  private rubricVersion(){return typeof this.dataset.methodology.rubricVersion==='string'?this.dataset.methodology.rubricVersion:RUBRIC_VERSION;}
  private async fingerprint(events:PortalEvent[]){const content=JSON.stringify({rubric:this.rubricVersion(),dimensions:this.dataset.dimensions,methodology:this.dataset.methodology,assignments:this.dataset.recordings.map(r=>({id:r.id,documentId:r.documentId,lyricsHash:r.lyricsHash,ai:r.ai,provenance:r.provenance}))});const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(content));const hash=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');if(events.some(e=>e.campaignFingerprint!==hash))throw new PortalError('O corpus, a rubrica ou a referência da IA mudou desde o início da campanha. Preserve a versão congelada.',409);return hash;}
  private state(events:PortalEvent[]){const closed=([1,2] as const).filter(r=>events.some(e=>e.action==='close'&&e.reviewer===r));return {closedReviewers:closed,closed:closed.length===2,assigned:this.dataset.recordings.length,rubricVersion:this.rubricVersion()};}
  async read(params:URLSearchParams):Promise<Record<string,unknown>> {
    const events=await this.store.read();await this.fingerprint(events);const state=this.state(events);const mode=params.get('mode')||'exploration';
    if(!['blind','exploration','compare','export'].includes(mode))throw new PortalError('Percurso inválido.');
    if(mode==='compare'||mode==='export'){
      if(!state.closed)throw new PortalError('Comparação e divergências disponíveis somente após os dois percursos independentes encerrarem.',403);
      const reviews=events.filter(e=>e.action==='save');const a=latest(events,1),b=latest(events,2);
      const divergences=this.dataset.recordings.flatMap(r=>this.dataset.dimensions.flatMap(d=>{
        const first=a.get(r.id),second=b.get(r.id);const human1=first?.scores?.[d.code]??null,human2=second?.scores?.[d.code]??null;
        const raw=r.ai[d.code];const ai=typeof raw==='number'?raw:null;
        if(human1===human2&&(ai===null||human1===ai))return [];
        return [{recordingId:r.id,dimension:d.code,human1,human2,ai,status1:first?.status,status2:second?.status}];
      }));return {state,reviews,divergences,comparisonStatus:'independent-review-comparison-not-adjudicated-reference'};
    }
    const reviewer=mode==='blind'?reviewerOf(params.get('reviewer')):null;
    const own=reviewer?latest(events,reviewer):new Map<string,PortalEvent>();
    const annual=this.dataset.annual.filter(row=>!!row&&typeof row==='object'&&Number((row as Record<string,unknown>).classified_tracks)>=300);
    const common={state,dimensions:this.dataset.dimensions,methodology:this.dataset.methodology,...(reviewer?{reviewer,completed:own.size}:{sources:this.dataset.sources,annual,context:this.dataset.context??[],predictionsEmbargoed:!state.closed})};
    const id=params.get('id');
    if(id){const r=this.dataset.recordings.find(item=>item.id===id);if(!r)throw new PortalError('Gravação não encontrada.',404);
      const recording={...blindRecording(r),lyrics:await this.lyric(r)};
      return {...common,recording:mode==='blind'?recording:{...recording,provenance:r.provenance,...(state.closed?{ai:r.ai}:{})},...(reviewer?{review:own.get(id)??null}:{})};}
    let rows=this.dataset.recordings;const search=(params.get('search')||'').toLocaleLowerCase();
    if(search)rows=rows.filter(r=>`${r.title} ${r.artist}`.toLocaleLowerCase().includes(search));
    for(const field of ['market','language','genre'] as const){const value=params.get(field);if(value)rows=rows.filter(r=>field==='market'?r.markets.includes(value):r[field]===value);}
    if(params.get('year'))rows=rows.filter(r=>r.years.includes(Number(params.get('year'))));
    const theme=params.get('theme');if(theme){if(!state.closed||mode==='blind')throw new PortalError('Filtros por previsão temática não estão disponíveis durante a avaliação cega.',403);rows=rows.filter(r=>typeof r.ai[theme]==='number'&&Number(r.ai[theme])>=2);}
    const page=Math.max(1,Math.floor(Number(params.get('page'))||1));const pageSize=Math.min(100,Math.max(1,Math.floor(Number(params.get('pageSize'))||30)));
    return {...common,total:rows.length,page,pageSize,recordings:rows.slice((page-1)*pageSize,page*pageSize).map(r=>({...blindRecording(r),lyrics:undefined,...(reviewer?{reviewStatus:own.get(r.id)?.status??null}:{})})),filters:{markets:[...new Set(this.dataset.recordings.flatMap(r=>r.markets))].sort(),years:[...new Set(this.dataset.recordings.flatMap(r=>r.years))].sort(),languages:[...new Set(this.dataset.recordings.map(r=>r.language).filter(Boolean))].sort(),genres:[...new Set(this.dataset.recordings.map(r=>r.genre).filter(Boolean))].sort()}};
  }
  async write(input:unknown):Promise<Record<string,unknown>> {
    if(!input||typeof input!=='object'||Array.isArray(input))throw new PortalError('Requisição inválida.');
    const body=input as Record<string,unknown>;const reviewer=reviewerOf(body.reviewer);const evaluator=nonempty(body.evaluator,'Identificação da avaliadora',160);
    const events=await this.store.read();const campaignFingerprint=await this.fingerprint(events);const state=this.state(events);
    if(state.closedReviewers.includes(reviewer))throw new PortalError('A avaliação desta avaliadora foi encerrada e está bloqueada.',409);
    const owner=events.find(e=>e.reviewer===reviewer)?.evaluator;if(owner&&owner!==evaluator)throw new PortalError('Este percurso pertence a outra identificação de avaliadora.',403);
    const base={id:crypto.randomUUID(),reviewer,evaluator,at:new Date().toISOString(),rubricVersion:this.rubricVersion(),campaignFingerprint};
    if(body.action==='close'){
      if(latest(events,reviewer).size!==this.dataset.recordings.length||!this.dataset.recordings.length)throw new PortalError('Registre um parecer para cada gravação atribuída antes de encerrar.',409);
      await this.store.append({...base,action:'close'},events.length);return {ok:true,state:this.state([...events,{...base,action:'close'}])};
    }
    if(body.action!=='save')throw new PortalError('Ação inválida.');
    const recordingId=nonempty(body.recordingId,'Gravação',200);const r=this.dataset.recordings.find(x=>x.id===recordingId);if(!r)throw new PortalError('Gravação não atribuída.',404);
    const status=body.status as ReviewStatus;if(!statuses.includes(status))throw new PortalError('Situação de avaliação inválida.');
    const justification=nonempty(body.justification,'Justificativa');const scores:Record<string,number|null>={};
    const raw=body.scores;if(raw!==undefined&&(!raw||typeof raw!=='object'||Array.isArray(raw)))throw new PortalError('Escores inválidos.');
    const values=(raw??{}) as Record<string,unknown>;
    if(Object.keys(values).some(key=>!this.dataset.dimensions.some(d=>d.code===key)))throw new PortalError('Dimensão desconhecida.');
    if(status==='scored'&&!(await this.lyric(r)))throw new PortalError('Sem letra autorizada, registre ausência ou abstenção.');
    for(const d of this.dataset.dimensions){const value=values[d.code];if(status==='scored'){if(typeof value!=='number'||!Number.isInteger(value)||value<0||value>3)throw new PortalError('Informe todos os escores de 0 a 3.');scores[d.code]=value;}else{if(value!==undefined&&value!==null)throw new PortalError('Ausência, dúvida, abstenção e erro de identidade não recebem escores.');scores[d.code]=null;}}
    const recordedLanguage=body.recordedLanguage===undefined||body.recordedLanguage===null||body.recordedLanguage===''?null:nonempty(body.recordedLanguage,'Idioma observado',100);
    const identityVerdict=body.identityVerdict??null;if(identityVerdict!==null&&!['confirmed','uncertain','mismatch'].includes(String(identityVerdict)))throw new PortalError('Parecer de identidade inválido.');
    const event:PortalEvent={...base,action:'save',recordingId,documentId:r.documentId,lyricsHash:r.lyricsHash,status,scores,justification,recordedLanguage,identityVerdict:identityVerdict as PortalEvent['identityVerdict']};await this.store.append(event,events.length);return {ok:true,review:event};
  }
}
