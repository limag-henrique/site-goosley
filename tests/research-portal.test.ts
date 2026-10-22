import assert from 'node:assert/strict';
import test from 'node:test';
import { PortalService, type PortalDataset, type PortalEvent } from '../src/lib/research-portal';

const dataset: PortalDataset = {
  recordings: [{id:'song',title:'Song',artist:'Artist',documentId:'doc',lyricsHash:'hash',market:'BR',markets:['BR'],years:[2021],genre:null,language:null,lyrics:null,provenance:{secret:'not public'},ai:{sexuality:3}}],
  dimensions:[{code:'sexuality',label:'Sexualidade',definition:'Rubrica'}],annual:[],sources:[],methodology:{prompt:'prompt registrado'},
};
test('blind reading never contains predictions or private provenance', async () => {
  const events: PortalEvent[] = [];
  const portal = new PortalService(dataset, {read:async()=>events,append:async e=>{events.push(e);}});
  const result = await portal.read(new URLSearchParams('mode=blind&reviewer=1&id=song'));
  assert.equal(JSON.stringify(result).includes('sexuality":3'),false);
  assert.equal(JSON.stringify(result).includes('not public'),false);
  assert.equal('ai' in (result.recording as object),false);
});
function setup(withLyrics=false){const events:PortalEvent[]=[];const local=structuredClone(dataset);if(withLyrics)local.recordings[0].lyrics='Authorized text';return {events,portal:new PortalService(local,{read:async()=>[...events],append:async(e,count)=>{assert.equal(events.length,count);events.push(e);}})};}
test('embargo covers exploration, theme filters and exports until both complete passes close',async()=>{
  const {portal}=setup();
  const detail=await portal.read(new URLSearchParams('id=song'));
  assert.equal('ai' in (detail.recording as object),false);
  await assert.rejects(()=>portal.read(new URLSearchParams('theme=sexuality')),/Filtros/);
  await assert.rejects(()=>portal.read(new URLSearchParams('mode=export')),/somente/);
  await assert.rejects(()=>portal.write({action:'close',reviewer:1,evaluator:'Ana'}),/cada gravação/);
  for(const [reviewer,evaluator] of [[1,'Ana'],[2,'Bea']] as const){await portal.write({action:'save',reviewer,evaluator,recordingId:'song',status:'missing-lyrics',justification:'Texto indisponível'});await portal.write({action:'close',reviewer,evaluator});if(reviewer===1)await assert.rejects(()=>portal.read(new URLSearchParams('mode=compare')),/somente/);}
  const released=await portal.read(new URLSearchParams('id=song'));
  assert.deepEqual((released.recording as {ai:unknown}).ai,{sexuality:3});
  await assert.rejects(()=>portal.write({action:'save',reviewer:1,evaluator:'Ana'}),/bloqueada/);
});
test('independent reviews retain revisions, preserve zero, and hide the other reviewer',async()=>{
  const {portal,events}=setup(true);
  await portal.write({action:'save',reviewer:1,evaluator:'Ana',recordingId:'song',status:'scored',scores:{sexuality:0},justification:'Ausência do tema'});
  await portal.write({action:'save',reviewer:1,evaluator:'Ana',recordingId:'song',status:'doubt',justification:'Expressão ambígua'});
  assert.equal(events.length,2);assert.equal(events[0].scores?.sexuality,0);assert.equal(events[1].scores?.sexuality,null);
  const second=await portal.read(new URLSearchParams('mode=blind&reviewer=2&id=song'));
  assert.equal(second.review,null);assert.equal(JSON.stringify(second).includes('Expressão ambígua'),false);
  await assert.rejects(()=>portal.write({action:'save',reviewer:1,evaluator:'Outra',recordingId:'song',status:'abstain',justification:'Não conheço o idioma'}),/outra identificação/);
  await assert.rejects(()=>portal.write({action:'save',reviewer:2,evaluator:'Bea',recordingId:'song',status:'abstain',scores:{sexuality:0},justification:'Não conheço o idioma'}),/não recebem escores/);
});
test('a changed frozen corpus cannot reuse completed reviews',async()=>{
  const {portal,events}=setup();await portal.write({action:'save',reviewer:1,evaluator:'Ana',recordingId:'song',status:'missing-lyrics',justification:'Sem texto'});
  const changed=structuredClone(dataset);changed.recordings[0].lyricsHash='changed';
  const other=new PortalService(changed,{read:async()=>events,append:async()=>{throw new Error('Must not append');}});
  await assert.rejects(()=>other.read(new URLSearchParams('mode=blind&reviewer=1')),/mudou desde o início/);
});
test('frozen AI predictions cannot change after the first independent review',async()=>{
  const {portal,events}=setup();await portal.write({action:'save',reviewer:1,evaluator:'Ana',recordingId:'song',status:'missing-lyrics',justification:'Sem texto'});
  const changed=structuredClone(dataset);changed.recordings[0].ai.sexuality=0;
  const other=new PortalService(changed,{read:async()=>events,append:async()=>{throw new Error('Must not append');}});
  await assert.rejects(()=>other.read(new URLSearchParams('mode=blind&reviewer=2')),/mudou desde o início/);
});
test('fixed article aggregates require sufficient coverage and never enter blind responses',async()=>{
  const local=structuredClone(dataset);local.annual=[{market_code:'BR',classified_tracks:'300',value:0.25},{market_code:'BR',classified_tracks:'299',value:0.5},{market_code:'BR',value:0.9}];local.context=[{year:2021,income:100}];
  const portal=new PortalService(local,{read:async()=>[],append:async()=>{}});
  const explore=await portal.read(new URLSearchParams());assert.deepEqual(explore.annual,[{market_code:'BR',classified_tracks:'300',value:0.25}]);assert.equal((explore.context as unknown[]).length,1);
  const blind=await portal.read(new URLSearchParams('mode=blind&reviewer=1'));assert.equal('annual' in blind,false);assert.equal('context' in blind,false);
});
test('blind detail retrieves only the selected authorized document and scored save needs real text',async()=>{
  const events:PortalEvent[]=[];const local=structuredClone(dataset);local.recordings[0].lyricAvailable=true;const calls:string[]=[];
  const portal=new PortalService(local,{read:async()=>events,append:async e=>{events.push(e);},lyric:async(documentId:string,hash:string)=>{calls.push(`${documentId}:${hash}`);return documentId==='doc'&&hash==='hash'?'Authorized stored text':null;}});
  await portal.read(new URLSearchParams('mode=blind&reviewer=1'));assert.equal(calls.length,0);
  const detail=await portal.read(new URLSearchParams('mode=blind&reviewer=1&id=song'));
  assert.equal((detail.recording as {lyrics:string}).lyrics,'Authorized stored text');assert.deepEqual(calls,['doc:hash']);assert.equal('ai' in (detail.recording as object),false);
  await portal.write({action:'save',reviewer:1,evaluator:'Ana',recordingId:'song',status:'scored',scores:{sexuality:0},justification:'Ausência observada no texto'});
  assert.equal(events[0].status,'scored');
  const missing=new PortalService(local,{read:async()=>[],append:async()=>{throw new Error('Must not append');},lyric:async()=>null});
  await assert.rejects(()=>missing.write({action:'save',reviewer:1,evaluator:'Ana',recordingId:'song',status:'scored',scores:{sexuality:0},justification:'Tentativa sem letra'}),/Sem letra autorizada/);
});


test('partial reviewer export preserves original revisions and does not close or reveal other judgments',async()=>{
  const {portal,events}=setup(true);
  const justification='Observação com acento, "aspas" e\r\nsegunda linha.';
  await portal.write({action:'save',reviewer:1,evaluator:'Ana',recordingId:'song',status:'scored',scores:{sexuality:0},justification,recordedLanguage:'pt',identityVerdict:'confirmed'});
  await portal.write({action:'save',reviewer:1,evaluator:'Ana',recordingId:'song',status:'doubt',justification:'Revisão com dúvida'});
  await portal.write({action:'save',reviewer:2,evaluator:'Bea',recordingId:'song',status:'scored',scores:{sexuality:3},justification:'PARECER DA OUTRA AVALIADORA'});
  const before=JSON.stringify(events);
  const result=await portal.read(new URLSearchParams('mode=review-export&reviewer=1')) as {payload:{events:PortalEvent[];latestReviews:PortalEvent[];completed:number;closed:boolean};integrity:{algorithm:string;sha256:string}};
  assert.equal(JSON.stringify(events),before);
  assert.equal(result.payload.events.length,2);
  assert.equal(result.payload.completed,1);
  assert.equal(result.payload.closed,false);
  assert.equal(result.payload.events[0].justification,justification);
  assert.equal(result.payload.events[0].scores?.sexuality,0);
  assert.equal(result.payload.latestReviews[0].scores?.sexuality,null);
  assert.equal(result.payload.latestReviews[0].status,'doubt');
  assert.equal(JSON.stringify(result).includes('PARECER DA OUTRA AVALIADORA'),false);
  assert.equal('ai' in result.payload,false);
  assert.equal('divergences' in result.payload,false);
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(result.payload)));
  const expected=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  assert.equal(result.integrity.algorithm,'SHA-256');assert.equal(result.integrity.sha256,expected);
  await assert.rejects(()=>portal.read(new URLSearchParams('mode=export')),/somente/);
  await assert.rejects(()=>portal.read(new URLSearchParams('mode=review-export')),/Selecione/);
});

 test('country filtering presents the matching circulation territory and composes with other filters',async()=>{
 const local=structuredClone(dataset);local.recordings=[{...local.recordings[0],id:'z',title:'Zulu',market:'PA',markets:['PA','BR'],language:'pt',genre:'pop',years:[2021]}, {...local.recordings[0],id:'a',title:'Alfa',market:'BR',markets:['BR'],language:'en',genre:'rock',years:[2020]}];
 const portal=new PortalService(local,{read:async()=>[],append:async()=>{throw Error('Read only');}});
 const result=await portal.read(new URLSearchParams('mode=blind&reviewer=1&market=BR&language=pt&genre=pop&year=2021'));
 const rows=result.recordings as Array<Record<string,unknown>>;assert.equal(result.total,1);assert.equal(rows[0].id,'z');assert.equal(rows[0].displayMarket,'BR');assert.equal(rows[0].market,'PA');assert.equal('ai' in rows[0],false);
 const sorted=await portal.read(new URLSearchParams('mode=blind&reviewer=1&sort=title&pageSize=1&page=999'));assert.equal(sorted.page,2);assert.deepEqual((sorted.recordings as Array<{id:string}>).map(r=>r.id),['z']);
 });

test('list sorting is stable across pages, preserves the corpus and never writes reviews',async()=>{
 const local=structuredClone(dataset);local.recordings=[{...local.recordings[0],id:'c',market:'US',markets:['US'],title:'Beta'}, {...local.recordings[0],id:'b',market:'BR',markets:['BR'],title:'Alfa'}, {...local.recordings[0],id:'a',market:'BR',markets:['BR'],title:'Alfa'}];
 const before=JSON.stringify(local);const portal=new PortalService(local,{read:async()=>[],append:async()=>{throw Error('Must not write');}});
 const ids=[];for(let page=1;page<=3;page++){const result=await portal.read(new URLSearchParams('mode=blind&reviewer=2&sort=market&pageSize=1&page='+page));ids.push(...(result.recordings as Array<{id:string}>).map(r=>r.id));}assert.deepEqual(ids,['a','b','c']);assert.equal(JSON.stringify(local),before);
 for(const query of ['market=XX','language=xx','genre=unknown','year=1900','search=missing']){const result=await portal.read(new URLSearchParams('mode=blind&reviewer=1&'+query));assert.equal(result.total,0);assert.deepEqual(result.recordings,[]);assert.equal(result.page,1);}
 const result=await portal.read(new URLSearchParams('mode=blind&reviewer=1&search=Alfa&market=BR'));assert.equal(result.total,2);await assert.rejects(()=>portal.read(new URLSearchParams('sort=bad')),/Ordenação/);
});


test('saved judgments are shared before closure and optional AI reveal survives a new service',async()=>{
 const {portal,events}=setup(true);
 await assert.rejects(()=>portal.write({action:'reveal',reviewer:1,evaluator:'Ana',recordingId:'song'}),/Salve/);
 await portal.write({action:'save',reviewer:1,evaluator:'Ana',recordingId:'song',status:'scored',scores:{sexuality:0},justification:'Parecer compartilhado'});
 const publicView=await portal.read(new URLSearchParams('mode=community&id=song'));
 assert.equal((publicView.reviews as PortalEvent[])[0].justification,'Parecer compartilhado');
 assert.equal('ai' in publicView,false);
 const revealed=await portal.write({action:'reveal',reviewer:1,evaluator:'Ana',recordingId:'song'});
 assert.deepEqual(revealed.ai,{sexuality:3});
 assert.deepEqual(revealed.metrics,[{dimension:'sexuality',human:0,ai:3,delta:-3}]);
 const restored=new PortalService(portal.dataset,portal.store);
 const detail=await restored.read(new URLSearchParams('mode=blind&reviewer=1&id=song'));
 assert.equal((detail.review as PortalEvent).justification,'Parecer compartilhado');
 assert.equal(detail.aiRevealed,true);
 assert.equal(events.filter(e=>e.action==='reveal').length,1);
 await restored.write({action:'reveal',reviewer:1,evaluator:'Ana',recordingId:'song'});
 assert.equal(events.filter(e=>e.action==='reveal').length,1);
});


test('pilot assignment preserves historical events and counts only the selected songs',async()=>{
 const {portal,events}=setup(true);
 await portal.write({action:'save',reviewer:1,evaluator:'Ana',recordingId:'song',status:'scored',scores:{sexuality:0},justification:'Registro original'});
 const original=structuredClone(events);
 const pilot={version:'test-pilot',ranking:'Artigo',selection:'Seleção fixa',recordings:[{recordingId:'song',market:'BR',rank:22}]};
 const service=new PortalService(portal.dataset,portal.store,pilot);
 const list=await service.read(new URLSearchParams('mode=blind&reviewer=1'));
 assert.equal((list.state as {assigned:number}).assigned,1);
 assert.equal(list.completed,1);assert.deepEqual(events,original);
 const absent=await service.read(new URLSearchParams('market=JP'));
 assert.equal(absent.total,0);
 await service.write({action:'reveal',reviewer:1,evaluator:'Ana',recordingId:'song'});
 await service.write({action:'save',reviewer:1,evaluator:'Ana',recordingId:'song',status:'scored',scores:{sexuality:1},justification:'Revisão informada'});
 assert.equal(events.at(-1)?.aiExposed,true);
 await service.write({action:'close',reviewer:1,evaluator:'Ana'});
 assert.equal(events[0].scores?.sexuality,0);
});

test('the published pilot has 12 unique authorized recordings with the agreed ranking allocation',async()=>{
 const {readFile}=await import('node:fs/promises');
 const pilot=JSON.parse(await readFile(new URL('../src/data/research-pilot.json',import.meta.url),'utf8'));
 const corpus=JSON.parse(await readFile(new URL('../src/data/research-portal.json',import.meta.url),'utf8'));
 assert.equal(new Set(pilot.recordings.map((r:{recordingId:string})=>r.recordingId)).size,12);
 const counts:Record<string,number>={};
 for(const item of pilot.recordings){counts[item.market]=(counts[item.market]??0)+1;const track=corpus.recordings.find((r:{id:string})=>r.id===item.recordingId);assert.ok(track?.lyricAvailable);assert.equal(track.market,item.market);}
 assert.deepEqual(counts,{DO:3,PA:2,CL:2,BR:2,ID:1,JP:1,TW:1});
});


test('a saved judgment survives reopening the real file store and stale writes cannot erase it',async()=>{
 const {mkdtemp,rm}=await import('node:fs/promises');const {tmpdir}=await import('node:os');const {join}=await import('node:path');
 const {localStore}=await import('../src/server/research-local-store');
 const folder=await mkdtemp(join(tmpdir(),'research-persistence-'));
 try{
  const first=await localStore(folder);const corpus=structuredClone(dataset);corpus.recordings[0].lyrics='Authorized text';
  await new PortalService(corpus,first).write({action:'save',reviewer:1,evaluator:'Ana',recordingId:'song',status:'scored',scores:{sexuality:0},justification:'Persistência após reinício'});
  const reopened=await localStore(folder);const restored=new PortalService(corpus,reopened);
  const detail=await restored.read(new URLSearchParams('mode=blind&reviewer=1&id=song'));
  assert.equal((detail.review as PortalEvent).justification,'Persistência após reinício');
  await assert.rejects(()=>reopened.append({...((detail.review) as PortalEvent),id:crypto.randomUUID()},0),/simultaneamente/);
  assert.equal((await reopened.read()).length,1);
  await restored.write({action:'save',reviewer:1,evaluator:'Ana',recordingId:'song',status:'doubt',justification:'Segunda revisão'});
  const current=await restored.read(new URLSearchParams('mode=blind&reviewer=1&id=song'));
  await restored.write({action:'reveal',reviewer:1,evaluator:'Ana',recordingId:'song'});
  await restored.write({action:'reflect',reviewer:1,evaluator:'Ana',recordingId:'song',reviewId:(current.review as PortalEvent).id,reflection:'A IA atribuiu intensidade central; meu fundamento considera a ambiguidade.'});
  const shared=await new PortalService(corpus,await localStore(folder)).read(new URLSearchParams('mode=community'));
  assert.equal((shared.reviews as PortalEvent[])[0].justification,'Segunda revisão');
  assert.equal((shared.reviews as (PortalEvent&{reflectionEvent:PortalEvent})[])[0].reflectionEvent.reflection,'A IA atribuiu intensidade central; meu fundamento considera a ambiguidade.');
  assert.equal((await reopened.read()).length,4);
 }finally{await rm(folder,{recursive:true,force:true});}
});


test('public names cannot authorize edits or reveals when private keys are required',async()=>{
 const {portal,events}=setup(true);const secure=new PortalService(portal.dataset,portal.store,undefined,true);
 const accessKey='a-private-random-key-with-at-least-32-characters';
 const body={action:'save',reviewer:1,evaluator:'Ana',recordingId:'song',status:'scored',scores:{sexuality:0},justification:'Parecer protegido'};
 await assert.rejects(()=>secure.write(body),/chave privada/);
 await secure.write({...body,accessKey});
 const shared=await secure.read(new URLSearchParams('mode=community'));
 assert.equal(JSON.stringify(shared).includes(accessKey),false);
 assert.equal(JSON.stringify(shared).includes(events[0].ownerKeyHash!),false);
 for(const action of ['save','reveal','reflect','close'])await assert.rejects(()=>secure.write({...body,action,accessKey:'another-private-random-key-with-more-than-32-characters'}),/Chave privada incorreta/);
 assert.equal(events.length,1);
 await secure.write({action:'reveal',reviewer:1,evaluator:'Ana',recordingId:'song',accessKey});
 assert.equal(events.length,2);
 const reopened=new PortalService(portal.dataset,portal.store,undefined,true);
 await reopened.write({...body,accessKey,justification:'Revisão autorizada'});
 assert.equal(events.length,3);
});

test('a changed pilot cannot reuse prior pilot records or silently reopen completed assignments',async()=>{
 const {portal}=setup(true);const pilot={version:'pilot-v1',ranking:'Artigo',selection:'Fixa',recordings:[{recordingId:'song',market:'BR',rank:22}]};
 const first=new PortalService(portal.dataset,portal.store,pilot);
 await first.write({action:'save',reviewer:1,evaluator:'Ana',recordingId:'song',status:'scored',scores:{sexuality:0},justification:'Original'});
 await first.write({action:'close',reviewer:1,evaluator:'Ana'});
 const changed=new PortalService(portal.dataset,portal.store,{...pilot,version:'pilot-v2'});
 await assert.rejects(()=>changed.read(new URLSearchParams('mode=community')),/seleção piloto mudou/);
});


test('a ponderation after reading AI is saved separately and survives reopening and closure',async()=>{
 const {portal,events}=setup(true);
 const secure=new PortalService(portal.dataset,portal.store,undefined,true);
 const accessKey='a-private-random-key-with-at-least-32-characters';
 const identity={reviewer:1,evaluator:'Ana',accessKey,recordingId:'song'};
 const saved=await secure.write({...identity,action:'save',status:'scored',scores:{sexuality:0},justification:'Meu fundamento independente'});
 const review=saved.review as PortalEvent;
 await assert.rejects(()=>secure.write({...identity,action:'reflect',reviewId:review.id,reflection:'Ainda não consultei a IA'}),/Consulte/);
 await secure.write({...identity,action:'reveal'});
 await secure.write({...identity,action:'close'});
 await assert.rejects(()=>secure.write({...identity,action:'reflect',reviewId:review.id,reflection:'  '}),/Ponderação/);
 await assert.rejects(()=>secure.write({...identity,action:'reflect',reviewId:'outdated',reflection:'Parecer desatualizado'}),/parecer mudou/);
 await secure.write({...identity,action:'reflect',reviewId:review.id,reflection:'Discordo do escore 3 da IA: a referência é incidental no contexto narrativo.'});
 const reopened=new PortalService(portal.dataset,portal.store,undefined,true);
 const detail=await reopened.read(new URLSearchParams('mode=blind&reviewer=1&id=song'));
 assert.equal((detail.reflection as PortalEvent).reflection,'Discordo do escore 3 da IA: a referência é incidental no contexto narrativo.');
 assert.equal((detail.review as PortalEvent).id,review.id);
 assert.equal((detail.review as PortalEvent).scores?.sexuality,0);
 assert.equal((detail.review as PortalEvent).justification,'Meu fundamento independente');
 const shared=await reopened.read(new URLSearchParams('mode=community'));
 assert.equal((shared.reviews as (PortalEvent&{reflectionEvent:PortalEvent})[])[0].reflectionEvent.reflection,(detail.reflection as PortalEvent).reflection);
 const exported=await reopened.read(new URLSearchParams('mode=review-export&reviewer=1'));
 assert.equal(JSON.stringify(exported).includes('Discordo do escore 3'),true);
 assert.equal(events.filter(e=>e.action==='save').length,1);
});


test('AI can be previewed before any evaluation fields without claiming the evaluator slot',async()=>{
 const {portal,events}=setup(true);const secure=new PortalService(portal.dataset,portal.store,undefined,true);
 const accessKey='preview-browser-private-key-with-more-than-32-characters';
 const preview=await secure.write({action:'preview',reviewer:1,accessKey,recordingId:'song'});
 assert.deepEqual(preview.ai,{sexuality:3});
 assert.deepEqual(preview.metrics,[{dimension:'sexuality',human:null,ai:3,delta:null}]);
 assert.equal(events.filter(e=>e.action==='save').length,0);
 const untouched=await secure.read(new URLSearchParams('mode=blind&reviewer=1&id=song'));
 assert.equal(untouched.review,null);assert.equal(untouched.completed,0);
 // A different visitor reading the model must not reserve the named evaluator's slot.
 await secure.write({action:'preview',reviewer:1,accessKey:'another-browser-private-key-with-at-least-32-characters',recordingId:'song'});
 await secure.write({action:'save',reviewer:1,evaluator:'Ana',accessKey,recordingId:'song',status:'scored',scores:{sexuality:0},justification:'A IA erra ao considerar o tema central.'});
 const restored=await new PortalService(portal.dataset,portal.store,undefined,true).read(new URLSearchParams('mode=blind&reviewer=1&id=song'));
 assert.equal((restored.review as PortalEvent).aiExposed,true);
 assert.deepEqual((restored.comparison as {metrics:unknown}).metrics,[{dimension:'sexuality',human:0,ai:3,delta:-3}]);
 await secure.write({action:'reflect',reviewer:1,evaluator:'Ana',accessKey,recordingId:'song',reviewId:(restored.review as PortalEvent).id,reflection:'A IA acerta a presença, mas erra a intensidade no contexto.'});
 const shared=await secure.read(new URLSearchParams('mode=community'));
 assert.equal(JSON.stringify(shared).includes('A IA acerta a presença'),true);
 const exported=await secure.read(new URLSearchParams('mode=review-export&reviewer=1'));
 const payload=(exported as {payload:{events:PortalEvent[]}}).payload;
 assert.equal(payload.events.filter(e=>e.action==='preview').length,1);
 assert.equal(JSON.stringify(exported).includes('viewerKeyHash'),false);
});


test('another visitor preview does not mark an unexposed evaluator and repeated previews are idempotent',async()=>{
 const {portal,events}=setup(true);const secure=new PortalService(portal.dataset,portal.store,undefined,true);
 const visitorKey='visitor-browser-key-of-at-least-32-characters';const ownerKey='owner-browser-key-of-at-least-32-characters';
 for(let i=0;i<2;i++)await secure.write({action:'preview',reviewer:1,accessKey:visitorKey,recordingId:'song'});
 assert.equal(events.length,1);
 await assert.rejects(()=>secure.write({action:'preview',reviewer:1,accessKey:visitorKey,recordingId:'unknown'}),/não atribuída/);
 await secure.write({action:'save',reviewer:1,evaluator:'Ana',accessKey:ownerKey,recordingId:'song',status:'scored',scores:{sexuality:0},justification:'Parecer sem consultar o modelo'});
 const blind=await secure.read(new URLSearchParams('mode=blind&reviewer=1&id=song'));
 assert.equal((blind.review as PortalEvent).aiExposed,false);assert.equal(blind.comparison,undefined);
 await secure.write({action:'preview',reviewer:1,accessKey:ownerKey,recordingId:'song'});
 const comparison=await secure.read(new URLSearchParams('mode=blind&reviewer=1&id=song'));
 assert.deepEqual((comparison.comparison as {metrics:unknown}).metrics,[{dimension:'sexuality',human:0,ai:3,delta:-3}]);
 const shared=await secure.read(new URLSearchParams('mode=community'));
 assert.equal((shared.reviews as PortalEvent[])[0].aiExposed,false);
});
