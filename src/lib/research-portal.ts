import type { ComparisonExport } from './research-export';

export type Reviewer = 1 | 2 | 3 | 4 | 5;
export const REVIEWERS = [1,2,3,4,5] as const;
export type ReviewStatus = 'scored' | 'missing-lyrics' | 'doubt' | 'abstain' | 'identity-error';
export interface Recording { id:string; title:string; artist:string; documentId:string; lyricsHash:string; market:string; markets:string[]; years:number[]; genre:string|null; language:string|null; lyrics:string|null; lyricAvailable?:boolean; provenance:Record<string,unknown>; ai:Record<string,unknown> }
export interface Dimension { code:string; label:string; definition:string }
export interface PortalDataset { recordings:Recording[]; dimensions:Dimension[]; annual:unknown[]; context?:unknown[]; sources:unknown[]; methodology:Record<string,unknown> }
export interface PortalEvent { id:string; action:'save'|'close'|'reveal'|'reflect'|'preview'|'extend'; reviewer:Reviewer; evaluator:string; at:string; rubricVersion:string; campaignFingerprint?:string; assignmentFingerprint?:string; assignedCount?:number; ownerKeyHash?:string; viewerKeyHash?:string; recordingId?:string; documentId?:string; lyricsHash?:string; status?:ReviewStatus; scores?:Record<string,number|null>; justification?:string; recordedLanguage?:string|null; identityVerdict?:'confirmed'|'uncertain'|'mismatch'|null; aiExposed?:boolean; reviewId?:string; reflection?:string }
export interface EventStore { read():Promise<PortalEvent[]>; append(event:PortalEvent,expectedCount:number):Promise<void>; lyric?(documentId:string,hash:string):Promise<string|null> }
export class PortalError extends Error { status:number; constructor(message:string,status=400){super(message);this.status=status;} }
export const RUBRIC_VERSION='human-lyrics-review-v1';
const statuses:ReviewStatus[]=['scored','missing-lyrics','doubt','abstain','identity-error'];
function reviewerOf(value:unknown):Reviewer { const n=typeof value==='string'&&/^[1-5]$/.test(value)?Number(value):value;if(typeof n==='number'&&REVIEWERS.includes(n as Reviewer))return n as Reviewer;throw new PortalError('Selecione um avaliador de 1 a 5.'); }
function nonempty(value:unknown,label:string,max=6000):string {if(typeof value!=='string'||!value.trim()||value.length>max)throw new PortalError(`${label} é obrigatório (até ${max} caracteres).`);return value.trim();}
function blindRecording(r:Recording){return {id:r.id,title:r.title,artist:r.artist,documentId:r.documentId,lyricsHash:r.lyricsHash,market:r.market,markets:r.markets,years:r.years,genre:r.genre,language:r.language,lyrics:r.lyrics};}
function publicEvent(event:PortalEvent){const visible={...event};delete visible.ownerKeyHash;delete visible.viewerKeyHash;return visible;}
function latest(events:PortalEvent[],reviewer:Reviewer){const map=new Map<string,PortalEvent>();for(const e of events)if(e.action==='save'&&e.reviewer===reviewer&&e.recordingId)map.set(e.recordingId,e);return map;}

function hasAiExposure(events:PortalEvent[],reviewer:Reviewer,recordingId:string,ownerKeyHash?:string){return events.some(e=>e.reviewer===reviewer&&e.recordingId===recordingId&&(e.action==='reveal'||(e.action==='preview'&&!!ownerKeyHash&&e.viewerKeyHash===ownerKeyHash)));}
function reflectionFor(events:PortalEvent[],review:PortalEvent|undefined){if(!review)return null;const event=[...events].reverse().find(e=>e.action==='reflect'&&e.reviewer===review.reviewer&&e.recordingId===review.recordingId&&e.reviewId===review.id);return event?publicEvent(event):null;}

export interface PilotSelection {version:string; ranking:string; selection:string; reviewers?:number[]; initialBatchSize?:number; previousSelectionFingerprints?:string[]; recordings:{recordingId:string;market:string;rank:number;reviewer?:number;year?:number;annualChartRank?:number;streams?:number;chartDays?:number}[]}

/** Server-only service. Optional per-recording disclosure is recorded after a saved judgment. */
export class PortalService {
  dataset:PortalDataset; store:EventStore; pilot?:PilotSelection; secureWrites:boolean;
  constructor(dataset:PortalDataset,store:EventStore,pilot?:PilotSelection,secureWrites=false){this.dataset=dataset;this.store=store;this.pilot=pilot;this.secureWrites=secureWrites;
    if(pilot?.reviewers&&(pilot.reviewers.length!==5||new Set(pilot.reviewers).size!==5||pilot.reviewers.some(r=>!REVIEWERS.includes(r as Reviewer))||!Number.isInteger(pilot.initialBatchSize)||pilot.initialBatchSize!==20||pilot.recordings.some(r=>!pilot.reviewers!.includes(r.reviewer!))||pilot.reviewers.some(reviewer=>pilot.recordings.filter(r=>r.reviewer===reviewer).length<20)))throw new PortalError('Configuração dos cinco avaliadores inválida.',503);
    if(pilot&&(new Set(pilot.recordings.map(r=>r.recordingId)).size!==pilot.recordings.length||pilot.recordings.some(r=>!dataset.recordings.some(x=>x.id===r.recordingId&&x.markets.includes(r.market)))))throw new PortalError('Seleção piloto inválida.',503);
  }
  private reviewers():readonly Reviewer[]{return this.pilot?.reviewers as Reviewer[]??[1,2];}
  private reviewer(value:unknown){const reviewer=reviewerOf(value);if(!this.reviewers().includes(reviewer))throw new PortalError('Avaliador não disponível nesta seleção.');return reviewer;}
  private pool(reviewer?:Reviewer){return this.pilot?this.pilot.recordings.filter(item=>!this.pilot?.reviewers||!reviewer||item.reviewer===reviewer).map(item=>this.dataset.recordings.find(r=>r.id===item.recordingId)!):this.dataset.recordings;}
  private assigned(reviewer?:Reviewer,events:PortalEvent[]=[]):Recording[]{
    if(!this.pilot?.reviewers)return this.pool();
    if(!reviewer)return this.reviewers().flatMap(r=>this.assigned(r,events));
    const count=events.filter(e=>e.reviewer===reviewer&&e.action==='extend'&&!this.pilot?.previousSelectionFingerprints?.includes(e.assignmentFingerprint??'')).reduce((n,e)=>Math.max(n,e.assignedCount??0),this.pilot.initialBatchSize??20);
    return this.pool(reviewer).slice(0,count);
  }
  private completed(events:PortalEvent[],reviewer:Reviewer){const own=latest(events,reviewer);return this.assigned(reviewer,events).filter(r=>own.has(r.id)).length;}
  private comparison(recording:Recording,review?:PortalEvent){return {ai:recording.ai,provenance:recording.provenance,prompt:{template:this.dataset.methodology.promptTemplate??this.dataset.methodology.prompt??null,version:recording.provenance.prompt_version??this.dataset.methodology.promptVersion??null,note:'Template registrado no snapshot. A requisição histórica completa por música não está disponível; não se trata de uma nova classificação.'},metrics:this.dataset.dimensions.map(d=>{const human=review?.scores?.[d.code]??null;const raw=recording.ai[d.code];const ai=typeof raw==='number'?raw:null;return {dimension:d.code,human,ai,delta:human===null||ai===null?null:human-ai};})};}
  private async lyric(recording:Recording){return this.store.lyric?this.store.lyric(recording.documentId,recording.lyricsHash):recording.lyrics;}
  private rubricVersion(){return typeof this.dataset.methodology.rubricVersion==='string'?this.dataset.methodology.rubricVersion:RUBRIC_VERSION;}
  private async digest(value:string){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');}
  private async assignmentFingerprint(events:PortalEvent[]){const hash=await this.digest(JSON.stringify(this.pilot??null));if(events.some(e=>e.assignmentFingerprint&&e.assignmentFingerprint!==hash&&!this.pilot?.previousSelectionFingerprints?.includes(e.assignmentFingerprint)))throw new PortalError('A seleção piloto mudou desde o primeiro registro. Preserve a seleção congelada.',409);return hash;}
  private async fingerprint(events:PortalEvent[]){const content=JSON.stringify({rubric:this.rubricVersion(),dimensions:this.dataset.dimensions,methodology:this.dataset.methodology,assignments:this.dataset.recordings.map(r=>({id:r.id,documentId:r.documentId,lyricsHash:r.lyricsHash,ai:r.ai,provenance:r.provenance}))});const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(content));const hash=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');if(events.some(e=>e.campaignFingerprint!==hash))throw new PortalError('O corpus, a rubrica ou a referência da IA mudou desde o início da campanha. Preserve a versão congelada.',409);return hash;}
  private state(events:PortalEvent[],reviewer?:Reviewer){
    const closed=this.reviewers().filter(r=>events.some(e=>e.action==='close'&&e.reviewer===r&&(!this.pilot?.reviewers||(!!e.assignmentFingerprint&&!this.pilot.previousSelectionFingerprints?.includes(e.assignmentFingerprint)))));
    const assigned=this.assigned(reviewer,events).length;
    return {closedReviewers:closed,closed:closed.length===this.reviewers().length,reviewers:this.reviewers(),assigned,available:this.pool(reviewer).length,canLoadMore:!!reviewer&&!closed.includes(reviewer)&&assigned<this.pool(reviewer).length,pilot:this.pilot?.reviewers?{version:this.pilot.version,ranking:this.pilot.ranking,selection:this.pilot.selection}:this.pilot??null,rubricVersion:this.rubricVersion()};
  }
  async read(params:URLSearchParams):Promise<Record<string,unknown>> {
    const events=await this.store.read();const campaignFingerprint=await this.fingerprint(events);await this.assignmentFingerprint(events);const state=this.state(events,params.has('reviewer')?this.reviewer(params.get('reviewer')):undefined);const mode=params.get('mode')||'exploration';
    if(!['blind','exploration','compare','export','review-export','community','comparison-export'].includes(mode))throw new PortalError('Percurso inválido.');
    if(mode==='comparison-export'){
      const reviewer=params.has('reviewer')?this.reviewer(params.get('reviewer')):null;
      const reviewers=reviewer?[reviewer]:this.reviewers();
      const evaluations=reviewers.flatMap(reviewer=>[...latest(events,reviewer).values()].map(review=>{
        const recording=this.dataset.recordings.find(r=>r.id===review.recordingId)!;
        return {recording:{id:recording.id,title:recording.title,artist:recording.artist,market:this.pilot?.recordings.find(r=>r.recordingId===recording.id)?.market??recording.market,documentId:recording.documentId,lyricsHash:recording.lyricsHash},review:publicEvent(review),reflection:reflectionFor(events,review),comparison:this.comparison(recording,review)};
      }));
      return {exportVersion:'research-comparison-export-v1',exportedAt:new Date().toISOString(),campaignFingerprint,selectionVersion:this.pilot?.version??null,comparisonRule:'Último parecer salvo por avaliadora e música. Diferença = escore humano menos IA; ausência não é zero.',dimensions:this.dataset.dimensions,evaluations,history:events.filter(e=>(e.action==='save'||e.action==='reflect')&&(!reviewer||e.reviewer===reviewer)).map(publicEvent)} satisfies ComparisonExport;
    }
    if(mode==='community'){
      const id=params.get('id');
      const reviews=this.reviewers().flatMap(reviewer=>[...latest(events,reviewer).values()]).filter(e=>!id||e.recordingId===id).map(e=>({...e,ownerKeyHash:undefined,reflectionEvent:reflectionFor(events,e),aiExposed:!!e.aiExposed||events.some(x=>x.action==='reveal'&&x.reviewer===e.reviewer&&x.recordingId===e.recordingId&&x.at<=e.at)}));
      return {state,dimensions:this.dataset.dimensions,reviews,recordings:this.dataset.recordings.filter(r=>reviews.some(e=>e.recordingId===r.id)).map(r=>({...blindRecording(r),lyrics:undefined})),notice:'Pareceres compartilhados após salvar. Nomes declarados, justificativas e escores são visíveis a quem acessar esta página.'};
    }
    if(mode==='review-export'){
      const reviewer=this.reviewer(params.get('reviewer'));
      const ownerKeyHash=events.find(e=>e.reviewer===reviewer&&e.ownerKeyHash)?.ownerKeyHash;
      const ownEvents=events.filter(event=>event.reviewer===reviewer&&(event.action!=='preview'||(!!ownerKeyHash&&event.viewerKeyHash===ownerKeyHash))).map(publicEvent);
      const own=latest(events,reviewer);
      const payload={exportVersion:'research-review-export-v1',exportedAt:new Date().toISOString(),reviewer,rubricVersion:this.rubricVersion(),campaignFingerprint,selectionVersion:this.pilot?.version??null,assignedRecordingIds:this.assigned(reviewer,events).map(r=>r.id),assigned:this.assigned(reviewer,events).length,completed:this.completed(events,reviewer),closed:state.closedReviewers.includes(reviewer),dimensions:this.dataset.dimensions,recordings:this.dataset.recordings.filter(recording=>own.has(recording.id)).map(recording=>({...blindRecording(recording),lyrics:undefined})),events:ownEvents,latestReviews:[...own.values()].map(publicEvent),latestReflections:[...own.values()].flatMap(review=>{const reflection=reflectionFor(events,review);return reflection?[reflection]:[];})};
      const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(payload)));
      const sha256=Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
      return {payload,integrity:{algorithm:'SHA-256',canonicalization:'JSON.stringify(payload), UTF-8',sha256}};
    }
    if(mode==='compare'||mode==='export'){
      if(!state.closed)throw new PortalError('Comparação e divergências disponíveis somente após todos os percursos independentes encerrarem.',403);
      const reviews=events.filter(e=>e.action==='save').map(publicEvent);
      if(this.pilot?.reviewers)return {state,reviews,comparisons:this.reviewers().flatMap(reviewer=>[...latest(events,reviewer).values()].map(review=>({reviewer,recordingId:review.recordingId,...this.comparison(this.dataset.recordings.find(r=>r.id===review.recordingId)!,review)}))),comparisonStatus:'exclusive-recordings-no-inter-rater-agreement'};
      const a=latest(events,1),b=latest(events,2);
      const divergences=this.assigned().flatMap(r=>this.dataset.dimensions.flatMap(d=>{
        const first=a.get(r.id),second=b.get(r.id);const human1=first?.scores?.[d.code]??null,human2=second?.scores?.[d.code]??null;
        const raw=r.ai[d.code];const ai=typeof raw==='number'?raw:null;
        if(human1===human2&&(ai===null||human1===ai))return [];
        return [{recordingId:r.id,dimension:d.code,human1,human2,ai,status1:first?.status,status2:second?.status}];
      }));return {state,reviews,divergences,comparisonStatus:'independent-review-comparison-not-adjudicated-reference'};
    }
    const reviewer=mode==='blind'?this.reviewer(params.get('reviewer')):null;
    const own=reviewer?latest(events,reviewer):new Map<string,PortalEvent>();
    const annual=this.dataset.annual.filter(row=>!!row&&typeof row==='object'&&Number((row as Record<string,unknown>).classified_tracks)>=300);
    const common={state,dimensions:this.dataset.dimensions,methodology:this.dataset.methodology,...(reviewer?{reviewer,completed:this.completed(events,reviewer)}:{sources:this.dataset.sources,annual,context:this.dataset.context??[],predictionsEmbargoed:!state.closed})};
    const id=params.get('id');
    if(id){const r=this.dataset.recordings.find(item=>item.id===id);if(!r)throw new PortalError('Gravação não encontrada.',404);if(reviewer&&!this.assigned(reviewer,events).some(item=>item.id===id)&&!own.has(id))throw new PortalError('Gravação não atribuída.',404);
      const recording={...blindRecording(r),lyrics:await this.lyric(r)};
      return {...common,recording:mode==='blind'?recording:{...recording,provenance:r.provenance,...(state.closed?{ai:r.ai}:{})},...(reviewer?{review:own.has(id)?publicEvent(own.get(id)!):null,reflection:reflectionFor(events,own.get(id)),aiRevealed:hasAiExposure(events,reviewer,id,own.get(id)?.ownerKeyHash),...(own.has(id)&&hasAiExposure(events,reviewer,id,own.get(id)?.ownerKeyHash)?{comparison:this.comparison(r,own.get(id)!)}:{})}:{})};}
    let rows=this.assigned(reviewer??undefined,events);const search=(params.get('search')||'').toLocaleLowerCase();
    if(search)rows=rows.filter(r=>`${r.title} ${r.artist}`.toLocaleLowerCase().includes(search));
    for(const field of ['market','language','genre'] as const){const value=params.get(field);if(value)rows=rows.filter(r=>field==='market'?(this.pilot?this.pilot.recordings.some(item=>item.recordingId===r.id&&item.market===value):r.markets.includes(value)):r[field]===value);}
    if(params.get('year'))rows=rows.filter(r=>r.years.includes(Number(params.get('year'))));
    const theme=params.get('theme');if(theme){if(!state.closed||mode==='blind')throw new PortalError('Filtros por previsão temática não estão disponíveis durante a avaliação cega.',403);rows=rows.filter(r=>typeof r.ai[theme]==='number'&&Number(r.ai[theme])>=2);}
    const sort=params.get('sort')||'sample';
    if(!['sample','market','title'].includes(sort))throw new PortalError('Ordenação inválida.');
    const displayMarket=(r:Recording)=>params.get('market')||r.market;
    if(sort!=='sample')rows=[...rows].sort((a,b)=>(sort==='market'?displayMarket(a).localeCompare(displayMarket(b),'pt-BR'):0)||a.title.localeCompare(b.title,'pt-BR')||a.id.localeCompare(b.id));
    const size=Number(params.get('pageSize'));const pageSize=Number.isFinite(size)&&size>0?Math.min(100,Math.max(1,Math.floor(size))):20;
    const requested=Number(params.get('page'));const page=Math.min(Math.max(1,Math.ceil(rows.length/pageSize)),Number.isFinite(requested)&&requested>0?Math.floor(requested):1);
    return {...common,total:rows.length,page,pageSize,recordings:rows.slice((page-1)*pageSize,page*pageSize).map(r=>({...blindRecording(r),displayMarket:this.pilot?.recordings.find(item=>item.recordingId===r.id)?.market??displayMarket(r),selectionRank:this.pilot?.recordings.find(item=>item.recordingId===r.id)?.rank,...(this.pilot?.reviewers?{selectionEvidence:(()=>{const item=this.pilot!.recordings.find(item=>item.recordingId===r.id)!;return {year:item.year,annualChartRank:item.annualChartRank,streams:item.streams,chartDays:item.chartDays};})()}:{}),lyrics:undefined,...(reviewer?{reviewStatus:own.get(r.id)?.status??null}:{})})),filters:{markets:[...new Set(this.pilot?this.pilot.recordings.map(r=>r.market):this.dataset.recordings.flatMap(r=>r.markets))].sort(),years:[...new Set(this.assigned(reviewer??undefined,events).flatMap(r=>r.years))].sort(),languages:[...new Set(this.assigned(reviewer??undefined,events).map(r=>r.language).filter(Boolean))].sort(),genres:[...new Set(this.assigned(reviewer??undefined,events).map(r=>r.genre).filter(Boolean))].sort()}};
  }
  async write(input:unknown):Promise<Record<string,unknown>> {
    if(!input||typeof input!=='object'||Array.isArray(input))throw new PortalError('Requisição inválida.');
    const body=input as Record<string,unknown>;const reviewer=this.reviewer(body.reviewer);
    const events=await this.store.read();const campaignFingerprint=await this.fingerprint(events);await this.assignmentFingerprint(events);const state=this.state(events,reviewer);
    if(body.action==='preview'){
      const accessKey=nonempty(body.accessKey,'Identificador privado do navegador',256);if(accessKey.length<32)throw new PortalError('Identificador privado do navegador inválido.',403);
      const recordingId=nonempty(body.recordingId,'Gravação',200);const recording=this.assigned(reviewer,events).find(r=>r.id===recordingId);if(!recording)throw new PortalError('Gravação não atribuída.',404);
      const viewerKeyHash=await this.digest(accessKey);
      if(!events.some(e=>e.action==='preview'&&e.reviewer===reviewer&&e.recordingId===recordingId&&e.viewerKeyHash===viewerKeyHash)){
        const assignmentFingerprint=await this.assignmentFingerprint(events);
        await this.store.append({id:crypto.randomUUID(),action:'preview',reviewer,evaluator:'',at:new Date().toISOString(),rubricVersion:this.rubricVersion(),campaignFingerprint,assignmentFingerprint:this.pilot?assignmentFingerprint:undefined,recordingId,viewerKeyHash},events.length);
      }
      return {ok:true,aiRevealed:true,...this.comparison(recording,latest(events,reviewer).get(recordingId))};
    }
    const evaluator=nonempty(body.evaluator,'Identificação da avaliadora',160);
    if(!['reveal','reflect'].includes(String(body.action))&&state.closedReviewers.includes(reviewer))throw new PortalError('A avaliação desta avaliadora foi encerrada e está bloqueada.',409);
    const owner=events.find(e=>e.reviewer===reviewer&&e.action!=='preview')?.evaluator;if(owner&&owner!==evaluator)throw new PortalError('Este percurso pertence a outra identificação de avaliadora.',403);
    let ownerKeyHash:string|undefined;
    if(this.secureWrites){
      const accessKey=body.accessKey;
      if(typeof accessKey!=='string'||accessKey.length<32||accessKey.length>256)throw new PortalError('Informe a chave privada deste percurso (pelo menos 32 caracteres).',403);
      ownerKeyHash=await this.digest(accessKey);
      const owned=events.filter(e=>e.reviewer===reviewer&&e.action!=='preview');
      const bound=owned.find(e=>e.ownerKeyHash)?.ownerKeyHash;
      if(bound&&bound!==ownerKeyHash)throw new PortalError('Chave privada incorreta para este percurso.',403);
      if(owned.length&&!bound)throw new PortalError('Este percurso contém registros anteriores sem chave privada. A coordenação deve vincular uma chave antes de novas alterações; os pareceres permanecem preservados e disponíveis para leitura.',409);
    }
    const assignmentFingerprint=await this.assignmentFingerprint(events);
    const base={id:crypto.randomUUID(),reviewer,evaluator,at:new Date().toISOString(),rubricVersion:this.rubricVersion(),campaignFingerprint,assignmentFingerprint:this.pilot?assignmentFingerprint:undefined,...(ownerKeyHash?{ownerKeyHash}:{})};
    if(body.action==='extend'){
      if(!this.pilot?.reviewers)throw new PortalError('Esta seleção não oferece novos lotes.',409);
      const count=this.assigned(reviewer,events).length;
      if(body.assignedCount!==count)throw new PortalError('A lista mudou. Atualize antes de carregar mais músicas.',409);
      const assignedCount=Math.min(count+(this.pilot.initialBatchSize??20),this.pool(reviewer).length);
      if(assignedCount===count)throw new PortalError('Todas as músicas disponíveis já foram carregadas.',409);
      const event:PortalEvent={...base,action:'extend',assignedCount};
      await this.store.append(event,events.length);return {ok:true,state:this.state([...events,event],reviewer)};
    }
    if(body.action==='reveal'){
      const recordingId=nonempty(body.recordingId,'Gravação',200);const review=latest(events,reviewer).get(recordingId);
      if(!review)throw new PortalError('Salve seu parecer antes de consultar a classificação da IA.',409);
      const recording=this.dataset.recordings.find(r=>r.id===recordingId);if(!recording)throw new PortalError('Gravação não encontrada.',404);
      if(!events.some(e=>e.action==='reveal'&&e.reviewer===reviewer&&e.recordingId===recordingId))await this.store.append({...base,action:'reveal',recordingId},events.length);
      return {ok:true,aiRevealed:true,...this.comparison(recording,review)};
    }
    if(body.action==='reflect'){
      const recordingId=nonempty(body.recordingId,'Gravação',200);const review=latest(events,reviewer).get(recordingId);
      if(!review)throw new PortalError('Salve seu parecer antes de registrar uma ponderação.',409);
      if(!hasAiExposure(events,reviewer,recordingId,review.ownerKeyHash))throw new PortalError('Consulte a análise da IA antes de registrar sua ponderação.',409);
      if(body.reviewId!==review.id)throw new PortalError('Seu parecer mudou desde que esta comparação foi aberta. Reabra a música antes de ponderar.',409);
      const reflection=nonempty(body.reflection,'Ponderação');
      const event:PortalEvent={...base,action:'reflect',recordingId,reviewId:review.id,documentId:review.documentId,lyricsHash:review.lyricsHash,reflection,aiExposed:true};
      await this.store.append(event,events.length);return {ok:true,reflection:publicEvent(event)};
    }
    if(body.action==='close'){
      if(this.completed(events,reviewer)!==this.assigned(reviewer,events).length||!this.assigned(reviewer,events).length)throw new PortalError('Registre um parecer para cada gravação atribuída antes de encerrar.',409);
      await this.store.append({...base,action:'close'},events.length);return {ok:true,state:this.state([...events,{...base,action:'close'}],reviewer)};
    }
    if(body.action!=='save')throw new PortalError('Ação inválida.');
    const recordingId=nonempty(body.recordingId,'Gravação',200);const r=this.assigned(reviewer,events).find(x=>x.id===recordingId);if(!r)throw new PortalError('Gravação não atribuída.',404);
    const status=body.status as ReviewStatus;if(!statuses.includes(status))throw new PortalError('Situação de avaliação inválida.');
    const justification=nonempty(body.justification,'Justificativa');const scores:Record<string,number|null>={};
    const raw=body.scores;if(raw!==undefined&&(!raw||typeof raw!=='object'||Array.isArray(raw)))throw new PortalError('Escores inválidos.');
    const values=(raw??{}) as Record<string,unknown>;
    if(Object.keys(values).some(key=>!this.dataset.dimensions.some(d=>d.code===key)))throw new PortalError('Dimensão desconhecida.');
    if(status==='scored'&&!(await this.lyric(r)))throw new PortalError('Sem letra autorizada, registre ausência ou abstenção.');
    for(const d of this.dataset.dimensions){const value=values[d.code];if(status==='scored'){if(typeof value!=='number'||!Number.isInteger(value)||value<0||value>3)throw new PortalError('Informe todos os escores de 0 a 3.');scores[d.code]=value;}else{if(value!==undefined&&value!==null)throw new PortalError('Ausência, dúvida, abstenção e erro de identidade não recebem escores.');scores[d.code]=null;}}
    const recordedLanguage=body.recordedLanguage===undefined||body.recordedLanguage===null||body.recordedLanguage===''?null:nonempty(body.recordedLanguage,'Idioma observado',100);
    const identityVerdict=body.identityVerdict??null;if(identityVerdict!==null&&!['confirmed','uncertain','mismatch'].includes(String(identityVerdict)))throw new PortalError('Parecer de identidade inválido.');
    const event:PortalEvent={...base,action:'save',aiExposed:hasAiExposure(events,reviewer,recordingId,ownerKeyHash),recordingId,documentId:r.documentId,lyricsHash:r.lyricsHash,status,scores,justification,recordedLanguage,identityVerdict:identityVerdict as PortalEvent['identityVerdict']};await this.store.append(event,events.length);return {ok:true,review:publicEvent(event)};
  }
}
