import 'server-only';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import data from '@/data/research-portal.json';
import { PortalError, PortalService, type EventStore, type PortalDataset, type PortalEvent } from '@/lib/research-portal';

interface D1Statement { bind(...values:unknown[]):D1Statement; all<T>():Promise<{results:T[]}>; run():Promise<{meta:{changes:number}}> }
interface D1Database { prepare(sql:string):D1Statement }

function databaseStore(db:D1Database):EventStore {return {
  async read(){const rows=await db.prepare('SELECT payload FROM research_portal_events ORDER BY sequence').all<{payload:string}>();return rows.results.map(row=>JSON.parse(row.payload) as PortalEvent);},
  async lyric(documentId,hash){const rows=await db.prepare("SELECT text FROM research_portal_lyrics WHERE document_id = ? AND lyrics_hash = ? AND rights_status = 'RESEARCH_AUTHORIZED' LIMIT 1").bind(documentId,hash).all<{text:string}>();return rows.results[0]?.text??null;},
  async append(event,expectedCount){const result=await db.prepare('INSERT INTO research_portal_events (id, payload) SELECT ?, ? WHERE (SELECT COUNT(*) FROM research_portal_events) = ?').bind(event.id,JSON.stringify(event),expectedCount).run();if(result.meta.changes!==1)throw new PortalError('Outro parecer foi salvo simultaneamente. Atualize e tente novamente.',409);},
};}

/** Local development only. Never silently replace a failed remote database. */
async function localStore():Promise<EventStore>{
  const fs=await import('node:fs/promises');const path=await import('node:path');
  const folder=path.join(process.cwd(),'.research-portal-local');const filename=path.join(folder,'events.jsonl');
  async function read(){try{return (await fs.readFile(filename,'utf8')).split('\n').filter(Boolean).map(line=>JSON.parse(line) as PortalEvent);}catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')return [];throw error;}}
  return {read,async append(event,expectedCount){await fs.mkdir(folder,{recursive:true});let lock;try{lock=await fs.open(path.join(folder,'write.lock'),'wx');}catch{throw new PortalError('Outro salvamento está em andamento. Tente novamente.',409);}try{if((await read()).length!==expectedCount)throw new PortalError('Dados alterados simultaneamente. Atualize e tente novamente.',409);const handle=await fs.open(filename,'a');try{await handle.writeFile(`${JSON.stringify(event)}\n`);await handle.sync();}finally{await handle.close();}}finally{await lock.close();await fs.unlink(path.join(folder,'write.lock'));}}};
}

export async function researchPortal():Promise<PortalService>{
  let binding:unknown;
  try{const {env}=await getCloudflareContext({async:true});binding='RESEARCH_DB' in env?env.RESEARCH_DB:undefined;}catch{if(process.env.NODE_ENV==='production')throw new PortalError('Contexto Cloudflare indisponível; nenhum parecer foi salvo.',503);}
  const db=binding&&typeof binding==='object'&&'prepare' in binding&&typeof binding.prepare==='function'?binding as D1Database:undefined;
  if(db)return new PortalService(data as unknown as PortalDataset,databaseStore(db));
  if(process.env.NODE_ENV==='production')throw new PortalError('Configure o binding RESEARCH_DB antes de iniciar avaliações.',503);
  return new PortalService(data as unknown as PortalDataset,await localStore());
}
