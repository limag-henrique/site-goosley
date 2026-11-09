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
 for(const reviewer of [2,3,1,4,5,6,7]){
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
 assert.equal(ids.size,140);
});


test('named transition preserves authors, keys, expanded queues, closure, exposure and immutable history',async()=>{
 const {portal:old,events,dataset,selection,store}=setup();
 const key='h'.repeat(40),miguelKey='m'.repeat(40);
 for(let n=0;n<20;n++)await old.write({action:'save',reviewer:2,evaluator:'Henrique Lima Gusmão',accessKey:key,recordingId:`song-${40+n}`,status:'scored',scores:{theme:0},justification:'Parecer histórico',identityVerdict:'uncertain',recordedLanguage:'pt'});
 await old.write({action:'close',reviewer:2,evaluator:'Henrique Lima Gusmão',accessKey:key});
 await old.write({action:'save',reviewer:3,evaluator:'Mesov',accessKey:miguelKey,recordingId:'song-80',status:'scored',scores:{theme:3},justification:'Original'});
 await old.write({action:'reveal',reviewer:3,evaluator:'Mesov',accessKey:miguelKey,recordingId:'song-80'});
 const disclosure=events.at(-1)!;disclosure.action='preview';disclosure.evaluator='';disclosure.viewerKeyHash=disclosure.ownerKeyHash;delete disclosure.ownerKeyHash;
 const review=events.find(e=>e.reviewer===3&&e.action==='save')!;
 await old.write({action:'reflect',reviewer:3,evaluator:'Mesov',accessKey:miguelKey,recordingId:'song-80',reviewId:review.id,reflection:'Ponderação preservada'});
 await old.write({action:'extend',reviewer:3,evaluator:'Mesov',accessKey:miguelKey,assignedCount:20});
 for(let i=200;i<280;i++)dataset.recordings.push({...dataset.recordings[0],id:`song-${i}`,documentId:`doc-${i}`,lyricsHash:`hash-${i}`});
 // Use the same expanded corpus for old campaign fingerprints (the real corpus stays frozen).
 const {createHash}=await import('node:crypto');
 const campaign=createHash('sha256').update(JSON.stringify({rubric:'human-lyrics-review-v1',dimensions:dataset.dimensions,methodology:dataset.methodology,assignments:dataset.recordings.map(r=>({id:r.id,documentId:r.documentId,lyricsHash:r.lyricsHash,ai:r.ai,provenance:r.provenance}))})).digest('hex');
 for(const event of events)event.campaignFingerprint=campaign;
 const fingerprint=createHash('sha256').update(JSON.stringify(selection)).digest('hex');
 const named={...selection,version:'seven-v1',namedReviewers:true,reviewers:[2,3,1,4,5,6,7],previousSelectionFingerprints:[fingerprint],preservedSelectionFingerprints:[fingerprint],recordings:[...selection.recordings,...dataset.recordings.slice(200).map((r,i)=>({recordingId:r.id,market:'BR',rank:22,reviewer:i<40?6:7}))]};
 const original=structuredClone(events);const portal=new PortalService(dataset,store,named,true);
 const shared=await portal.read(new URLSearchParams('mode=community'));
 const ranking=shared.ranking as {reviewer:number;count:number;position:number;name:string}[];
 assert.equal(ranking.length,7);assert.deepEqual(ranking.slice(0,2).map(r=>[r.name,r.count,r.position]),[['Henrique Lima',20,1],['Miguel Offerman (Mosov)',1,2]]);
 assert.ok(ranking.slice(2).every(r=>r.position===3&&r.count===0));
 assert.deepEqual((shared.state as {closedReviewers:number[]}).closedReviewers,[2]);
 const own=await portal.read(new URLSearchParams('mode=blind&reviewer=3&id=song-80'));
 assert.equal((own.state as {assigned:number}).assigned,40);assert.ok(own.comparison);
 assert.equal((own.reflection as PortalEvent).reflection,'Ponderação preservada');
 assert.equal((own.review as PortalEvent).evaluator,'Miguel Offerman (Mosov)');
 assert.deepEqual(events,original);
 const exported=await portal.read(new URLSearchParams('mode=comparison-export'));
 assert.ok(JSON.stringify(exported).includes('Henrique Lima Gusmão'));assert.ok(JSON.stringify(exported).includes('Henrique Lima'));
 await assert.rejects(()=>portal.write({action:'save',reviewer:3,evaluator:'Miguel Offerman (Mosov)',accessKey:'x'.repeat(40),recordingId:'song-80',status:'scored',scores:{theme:1},justification:'Revisão'}),/Chave privada/);
 await portal.write({action:'save',reviewer:3,evaluator:'Miguel Offerman (Mosov)',accessKey:miguelKey,recordingId:'song-80',status:'scored',scores:{theme:1},justification:'Revisão'});
 assert.equal(events.at(-1)?.aiExposed,true);
 let updated=await portal.read(new URLSearchParams('mode=community'));
 assert.equal((updated.ranking as typeof ranking).find(r=>r.reviewer===3)?.count,1);
 await portal.write({action:'save',reviewer:3,evaluator:'Miguel Offerman (Mosov)',accessKey:miguelKey,recordingId:'song-80',status:'abstain',justification:'Revisão sem escores'});
 updated=await portal.read(new URLSearchParams('mode=community'));
 assert.equal((updated.ranking as typeof ranking).find(r=>r.reviewer===3)?.count,0);
 for(const [reviewer,evaluator,start,name] of [[1,'Grazi',0,'Grazi'],[4,'Caio',120,'Gabriela'],[5,'Amanda',160,'Geovana'],[6,'Samuel',200,'Pedro Inácio'],[7,'José',240,'Rafael Medeiros']] as const){
  await portal.write({action:'save',reviewer,evaluator,accessKey:String(reviewer).repeat(40),recordingId:`song-${start}`,status:'scored',scores:{theme:0},justification:'Parecer completo'});
  // Simulate a stored judgment made before the display names changed.
  const historical=events.at(-1)!;historical.evaluator=evaluator;
  const original=structuredClone(historical);
  const detail=await portal.read(new URLSearchParams(`mode=blind&reviewer=${reviewer}&id=song-${start}`));
  assert.equal((detail.review as PortalEvent).evaluator,name);
  if(name!==evaluator)assert.equal((detail.review as PortalEvent).originalEvaluator,evaluator);
  assert.deepEqual(historical,original);
  await portal.write({action:'extend',reviewer,evaluator:name,accessKey:String(reviewer).repeat(40),assignedCount:20});
  const list=await portal.read(new URLSearchParams(`mode=blind&reviewer=${reviewer}&pageSize=100`));assert.equal((list.recordings as unknown[]).length,40);
 }
 updated=await portal.read(new URLSearchParams('mode=community'));
 assert.deepEqual((updated.ranking as typeof ranking).filter(r=>r.count===1).map(r=>[r.name,r.position]),[['Gabriela',2],['Geovana',2],['Grazi',2],['Pedro Inácio',2],['Rafael Medeiros',2]]);
 events[0].lyricsHash='wrong';await assert.rejects(()=>portal.read(new URLSearchParams('mode=community')),/vínculo/);
});

test('named transition blocks unexpected historical authors rather than attributing their work to newcomers',async()=>{
 const {portal:old,dataset,selection,store}=setup();
 await old.write({action:'save',reviewer:1,evaluator:'Outra pessoa',accessKey:'a'.repeat(40),recordingId:'song-0',status:'scored',scores:{theme:1},justification:'Histórico'});
 const {createHash}=await import('node:crypto');
 const named={...selection,namedReviewers:true,previousSelectionFingerprints:[createHash('sha256').update(JSON.stringify(selection)).digest('hex')]};
 await assert.rejects(()=>new PortalService(dataset,store,named,true).read(new URLSearchParams('mode=community')),/autoria inesperada/);
});


test('seven-participant manifest preserves both historical queues and authorizes only the exact frozen transition',async()=>{
 const {readFile}=await import('node:fs/promises');const {createHash}=await import('node:crypto');
 const before=JSON.parse(await readFile(new URL('../src/data/research-selection-five.json',import.meta.url),'utf8'));
 const after=JSON.parse(await readFile(new URL('../src/data/research-selection-seven.json',import.meta.url),'utf8'));
 for(const reviewer of [2,3])assert.deepEqual(after.recordings.filter((r:{reviewer:number})=>r.reviewer===reviewer),before.recordings.filter((r:{reviewer:number})=>r.reviewer===reviewer));
 const hash=createHash('sha256').update(JSON.stringify(before)).digest('hex');
 assert.deepEqual(after.preservedSelectionFingerprints,[hash]);assert.deepEqual(after.previousSelectionFingerprints,[...before.previousSelectionFingerprints,hash]);
});

test('Elaine shares songs with Grazi while preserving all seven authors, keys, queues and independent judgments',async()=>{
 const {dataset,selection,store,events}=setup();
 for(let i=200;i<280;i++)dataset.recordings.push({...dataset.recordings[0],id:`song-${i}`,documentId:`doc-${i}`,lyricsHash:`hash-${i}`});
 const seven={...selection,version:'seven-v1',namedReviewers:true,reviewers:[2,3,1,4,5,6,7],recordings:[...selection.recordings,...dataset.recordings.slice(200).map((r,i)=>({recordingId:r.id,market:'BR',rank:22,reviewer:i<40?6:7}))]};
 const old=new PortalService(dataset,store,seven,true);
 for(const [reviewer,evaluator,start] of [[1,'Grazi',0],[2,'Henrique Lima',40],[3,'Miguel Offerman (Mosov)',80],[4,'Gabriela',120],[5,'Geovana',160],[6,'Pedro Inácio',200],[7,'Rafael Medeiros',240]] as const){
  for(let n=0;n<(reviewer===1?20:1);n++)await old.write({action:'save',reviewer,evaluator,accessKey:String(reviewer).repeat(40),recordingId:`song-${start+n}`,status:'scored',scores:{theme:0},justification:'Parecer anterior'});
 }
 await old.write({action:'close',reviewer:1,evaluator:'Grazi',accessKey:'1'.repeat(40)});
 await old.write({action:'extend',reviewer:4,evaluator:'Gabriela',accessKey:'4'.repeat(40),assignedCount:20});
 const original=structuredClone(events);
 const {createHash}=await import('node:crypto');
 const hash=createHash('sha256').update(JSON.stringify(seven)).digest('hex');
 const eight={...seven,version:'eight-v1',reviewers:[...seven.reviewers,8],previousSelectionFingerprints:[hash],preservedSelectionFingerprints:[hash],preservedReviewerIds:{[hash]:seven.reviewers},recordings:[...seven.recordings,...seven.recordings.filter(r=>r.reviewer===1).map(r=>({...r,reviewer:8}))]};
 const portal=new PortalService(dataset,store,eight,true);
 const shared=await portal.read(new URLSearchParams('mode=community'));
 assert.ok((shared.ranking as {reviewer:number;name:string;count:number}[]).some(r=>r.reviewer===8&&r.name==='Elaine Vilela'&&r.count===0));
 assert.deepEqual((shared.state as {closedReviewers:number[]}).closedReviewers,[1]);
 assert.equal(((await portal.read(new URLSearchParams('mode=blind&reviewer=4'))).state as {assigned:number}).assigned,40);
 const elaine=await portal.read(new URLSearchParams('mode=blind&reviewer=8'));
 assert.equal(elaine.completed,0);assert.equal((elaine.recordings as unknown[]).length,20);
 assert.deepEqual((elaine.recordings as {id:string}[]).map(r=>r.id),Array.from({length:20},(_,i)=>`song-${i}`));
 assert.deepEqual(events,original);
 await assert.rejects(()=>portal.write({action:'save',reviewer:8,evaluator:'Elaine Vilela',accessKey:'8'.repeat(40),recordingId:'song-40',status:'scored',scores:{theme:3},justification:'Outra fila'}),/não atribuída/);
 await portal.write({action:'save',reviewer:8,evaluator:'Elaine Vilela',accessKey:'8'.repeat(40),recordingId:'song-0',status:'scored',scores:{theme:3},justification:'Parecer independente'});
 await assert.rejects(()=>portal.write({action:'extend',reviewer:8,evaluator:'Elaine Vilela',accessKey:'1'.repeat(40),assignedCount:20}),/Chave privada incorreta/);
 await portal.write({action:'extend',reviewer:8,evaluator:'Elaine Vilela',accessKey:'8'.repeat(40),assignedCount:20});
 assert.equal(((await portal.read(new URLSearchParams('mode=blind&reviewer=8'))).state as {assigned:number}).assigned,40);
 const grazi=await portal.read(new URLSearchParams('mode=blind&reviewer=1&id=song-0'));
 assert.equal((grazi.review as PortalEvent).scores?.theme,0);
 assert.equal((grazi.state as {assigned:number}).assigned,20);
 const exported=await portal.read(new URLSearchParams('mode=comparison-export'));
 assert.deepEqual((exported.evaluations as {recording:{id:string};review:PortalEvent}[]).filter(r=>r.recording.id==='song-0').map(r=>[r.review.reviewer,r.review.scores?.theme]),[[1,0],[8,3]]);
 const catalog=await portal.read(new URLSearchParams('pageSize=100'));
 assert.equal(catalog.total,180);
 assert.equal(new Set((catalog.recordings as {id:string}[]).map(r=>r.id)).size,100);
 const changed={...eight,selection:'Alteração não autorizada'};
 await assert.rejects(()=>new PortalService(dataset,store,changed,true).read(new URLSearchParams('mode=community')),/seleção piloto mudou/);
 assert.throws(()=>new PortalService(dataset,store,{...eight,recordings:[...eight.recordings,eight.recordings[0]]},true),/Seleção piloto inválida/);
});

test('published eight-reviewer selection appends Elaine without changing any previous assignment',async()=>{
 const {readFile}=await import('node:fs/promises');const {createHash}=await import('node:crypto');
 const before=JSON.parse(await readFile(new URL('../src/data/research-selection-seven.json',import.meta.url),'utf8'));
 const after=JSON.parse(await readFile(new URL('../src/data/research-selection.json',import.meta.url),'utf8'));
 assert.deepEqual(after.reviewers,[2,3,1,4,5,6,7,8]);
 assert.deepEqual(after.recordings.filter((r:{reviewer:number})=>r.reviewer!==8),before.recordings);
 assert.deepEqual(after.recordings.filter((r:{reviewer:number})=>r.reviewer===8).map((r:{reviewer:number})=>({...r,reviewer:1})),before.recordings.filter((r:{reviewer:number})=>r.reviewer===1));
 const hash=createHash('sha256').update(JSON.stringify(before)).digest('hex');
 assert.deepEqual(after.previousSelectionFingerprints,[...before.previousSelectionFingerprints,hash]);
 assert.deepEqual(after.preservedSelectionFingerprints,[...before.preservedSelectionFingerprints,hash]);
 assert.deepEqual(after.preservedReviewerIds,{[hash]:before.reviewers});
 const corpus=JSON.parse(await readFile(new URL('../src/data/research-portal.json',import.meta.url),'utf8'));
 const portal=new PortalService(corpus,{read:async()=>[],append:async()=>{}},after,true);
 const result=await portal.read(new URLSearchParams('mode=blind&reviewer=8'));
 assert.equal((result.recordings as unknown[]).length,20);
 assert.equal((result.state as {available:number}).available,156);
 assert.equal(JSON.stringify(result).includes('"ai":'),false);
});
