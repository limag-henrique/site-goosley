import assert from 'node:assert/strict';
import test from 'node:test';
import { PortalService, type PortalDataset, type PortalEvent } from '../src/lib/research-portal';

function setup(){
 const events:PortalEvent[]=[];
 const recordings=Array.from({length:200},(_,i)=>({id:`song-${i}`,title:`Música ${i}`,artist:'Artista',documentId:`doc-${i}`,lyricsHash:`hash-${i}`,market:'BR',markets:['BR'],years:[2021],genre:null,language:'pt',lyrics:'Texto autorizado',provenance:{},ai:{theme:0}}));
 const dataset:PortalDataset={recordings,dimensions:[{code:'theme',label:'Tema',definition:'Intensidade'}],annual:[],sources:[],methodology:{}};
 const selection={version:'five-v1',ranking:'Atlas',selection:'Exclusiva',reviewers:[1,2,3,4,5],initialBatchSize:20,recordings:recordings.map((r,i)=>({recordingId:r.id,market:'BR',rank:22,reviewer:Math.floor(i/40)+1}))};
 const store={read:async()=>structuredClone(events),append:async(e:PortalEvent,count:number)=>{assert.equal(events.length,count);events.push(e);}};
 return {events,dataset,selection,store,portal:new PortalService(dataset,store,selection,true)};
}

test('five reviewers receive twenty exclusive songs and cannot read or save another assignment',async()=>{
 const {portal}=setup(); const ids=new Set<string>();
 for(const reviewer of [1,2,3,4,5]){
  const result=await portal.read(new URLSearchParams(`mode=blind&reviewer=${reviewer}`));
  const rows=result.recordings as {id:string}[];
  assert.equal(rows.length,20);assert.equal((result.state as {assigned:number}).assigned,20);
  for(const row of rows){assert.equal(ids.has(row.id),false);ids.add(row.id);}
 }
 assert.equal(ids.size,100);
 await assert.rejects(()=>portal.read(new URLSearchParams('mode=blind&reviewer=1&id=song-40')),/não atribuída/);
 await assert.rejects(()=>portal.write({action:'save',reviewer:1,evaluator:'Ana',accessKey:'a'.repeat(40),recordingId:'song-40',status:'scored',scores:{theme:0},justification:'Sem tema'}),/não atribuída/);
});

test('additional lots persist after reopening, reject stale requests and keep other queues unchanged',async()=>{
 const {portal,dataset,selection,store}=setup();
 const body={action:'extend',reviewer:3,evaluator:'Caio',accessKey:'c'.repeat(40),assignedCount:20};
 await portal.write(body);
 const reopened=new PortalService(dataset,store,selection,true);
 const result=await reopened.read(new URLSearchParams('mode=blind&reviewer=3&pageSize=100'));
 assert.equal((result.recordings as unknown[]).length,40);assert.equal((result.state as {canLoadMore:boolean}).canLoadMore,false);
 const other=await reopened.read(new URLSearchParams('mode=blind&reviewer=4'));
 assert.equal((other.state as {assigned:number}).assigned,20);
 await assert.rejects(()=>reopened.write(body),/lista mudou/);
 await assert.rejects(()=>reopened.write({...body,assignedCount:40,accessKey:'wrong'.repeat(10)}),/Chave privada incorreta/);
 await assert.rejects(()=>reopened.write({...body,assignedCount:40}),/já foram carregadas/);
 await assert.rejects(()=>reopened.write({action:'close',reviewer:3,evaluator:'Caio',accessKey:body.accessKey}),/cada gravação/);
});

test('an explicitly versioned transition preserves old judgments, editing keys and exports without inheriting closure',async()=>{
 const {dataset,selection,store,events}=setup();
 const legacy={version:'legacy',ranking:'Atlas',selection:'Piloto',recordings:[{recordingId:'song-199',market:'BR',rank:22}]};
 const old=new PortalService(dataset,store,legacy,true);const key='a'.repeat(40);
 await old.write({action:'save',reviewer:1,evaluator:'Ana',accessKey:key,recordingId:'song-199',status:'scored',scores:{theme:0},justification:'Parecer histórico'});
 await old.write({action:'close',reviewer:1,evaluator:'Ana',accessKey:key});
 const {createHash}=await import('node:crypto');
 const migrated={...selection,previousSelectionFingerprints:[createHash('sha256').update(JSON.stringify(legacy)).digest('hex')]};
 const original=structuredClone(events);
 const portal=new PortalService(dataset,store,migrated,true);
 const list=await portal.read(new URLSearchParams('mode=blind&reviewer=1'));
 assert.deepEqual((list.state as {closedReviewers:number[]}).closedReviewers,[]);assert.deepEqual(events,original);
 await assert.rejects(()=>portal.write({action:'save',reviewer:1,evaluator:'Ana',accessKey:'b'.repeat(40),recordingId:'song-0',status:'scored',scores:{theme:1},justification:'Novo parecer'}),/Chave privada incorreta/);
 await portal.write({action:'save',reviewer:1,evaluator:'Ana',accessKey:key,recordingId:'song-0',status:'scored',scores:{theme:1},justification:'Novo parecer'});
 for(const reviewer of [3,4,5])await portal.write({action:'save',reviewer,evaluator:`Pessoa ${reviewer}`,accessKey:String(reviewer).repeat(40),recordingId:`song-${(reviewer-1)*40}`,status:'scored',scores:{theme:3},justification:'Parecer novo'});
 const shared=await portal.read(new URLSearchParams('mode=community'));
 assert.equal((shared.reviews as PortalEvent[]).length,5);
 const exported=await portal.read(new URLSearchParams('mode=comparison-export'));
 assert.equal((exported.evaluations as unknown[]).length,5);
 assert.equal(JSON.stringify(exported).includes('Parecer histórico'),true);
 assert.equal(JSON.stringify(shared).includes(key),false);
 const ownExport=await portal.read(new URLSearchParams('mode=review-export&reviewer=1'));
 const {writeFile,unlink}=await import('node:fs/promises');const {tmpdir}=await import('node:os');const {join}=await import('node:path');const {fileURLToPath}=await import('node:url');const {execFile}=await import('node:child_process');const {promisify}=await import('node:util');
 const exportPath=join(tmpdir(),`goosley-export-${crypto.randomUUID()}.json`);
 try{await writeFile(exportPath,JSON.stringify(ownExport));const verified=await promisify(execFile)(process.execPath,[fileURLToPath(new URL('../scripts/verify-research-review-export.mjs',import.meta.url)),exportPath]);assert.equal(JSON.parse(verified.stdout).integrity,'valid');}finally{await unlink(exportPath);}

 const changed=new PortalService(dataset,store,{...migrated,version:'changed'},true);
 await assert.rejects(()=>changed.read(new URLSearchParams('mode=community')),/seleção piloto mudou/);
});

test('each reviewer can close twenty loaded songs without consuming their optional reserve',async()=>{
 const {portal}=setup();
 for(const reviewer of [1,2,3,4,5]){
  for(let n=0;n<20;n++)await portal.write({action:'save',reviewer,evaluator:`Pessoa ${reviewer}`,accessKey:String(reviewer).repeat(40),recordingId:`song-${(reviewer-1)*40+n}`,status:'scored',scores:{theme:0},justification:'Ausência observada'});
  await portal.write({action:'close',reviewer,evaluator:`Pessoa ${reviewer}`,accessKey:String(reviewer).repeat(40)});
  if(reviewer<5)await assert.rejects(()=>portal.read(new URLSearchParams('mode=compare')),/somente/);
 }
 const compared=await portal.read(new URLSearchParams('mode=compare'));
 assert.equal((compared.comparisons as unknown[]).length,100);
 assert.equal(compared.comparisonStatus,'exclusive-recordings-no-inter-rater-agreement');
 await assert.rejects(()=>portal.write({action:'extend',reviewer:5,evaluator:'Pessoa 5',accessKey:'5'.repeat(40),assignedCount:20}),/bloqueada/);
});

test('published selection gives each reviewer seven countries and both genuine score extremes without blind leakage',async()=>{
 const {readFile}=await import('node:fs/promises');
 const corpus=JSON.parse(await readFile(new URL('../src/data/research-portal.json',import.meta.url),'utf8')) as PortalDataset;
 const selection=JSON.parse(await readFile(new URL('../src/data/research-selection.json',import.meta.url),'utf8'));
 const portal=new PortalService(corpus,{read:async()=>[],append:async()=>{throw Error('Read only');}},selection,true);
 const ids=new Set<string>();
 for(const reviewer of [1,2,3,4,5]){
  const result=await portal.read(new URLSearchParams(`mode=blind&reviewer=${reviewer}`));
  const rows=result.recordings as {id:string;displayMarket:string;selectionEvidence:{year:number;annualChartRank:number;streams:number}}[];
  assert.equal(rows.length,20);
  assert.deepEqual([...new Set(rows.map(r=>r.displayMarket))].sort(),['BR','CL','DO','ID','JP','PA','TW']);
  const originals=rows.map(r=>corpus.recordings.find(x=>x.id===r.id)!);
  assert.ok(originals.filter(r=>corpus.dimensions.every(d=>r.ai[d.code]===0)).length>=5);
  assert.ok(originals.filter(r=>corpus.dimensions.filter(d=>r.ai[d.code]===3).length>=3).length>=5);
  for(const row of rows){assert.equal(ids.has(row.id),false);ids.add(row.id);assert.ok(row.selectionEvidence.streams>0);assert.ok(row.selectionEvidence.year>=2017&&row.selectionEvidence.year<=2022);}
  const blind=JSON.stringify(result);
  assert.equal(blind.includes('"ai":'),false);assert.equal(blind.includes('allZero'),false);assert.equal(blind.includes('centralDimensions'),false);
 }
 assert.equal(ids.size,100);
});

