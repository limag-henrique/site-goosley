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
