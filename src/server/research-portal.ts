import 'server-only';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import data from '@/data/research-portal.json';
import pilot from '@/data/research-pilot.json';
import { localStore } from './research-local-store';
import { PortalError, PortalService, type EventStore, type PortalDataset, type PortalEvent } from '@/lib/research-portal';

interface D1Statement { bind(...values:unknown[]):D1Statement; all<T>():Promise<{results:T[]}>; run():Promise<{meta:{changes:number}}> }
interface D1Database { prepare(sql:string):D1Statement }

function databaseStore(db:D1Database):EventStore {return {
  async read(){const rows=await db.prepare('SELECT payload FROM research_portal_events ORDER BY sequence').all<{payload:string}>();return rows.results.map(row=>JSON.parse(row.payload) as PortalEvent);},
  async lyric(documentId,hash){const rows=await db.prepare("SELECT text FROM research_portal_lyrics WHERE document_id = ? AND lyrics_hash = ? AND rights_status = 'RESEARCH_AUTHORIZED' LIMIT 1").bind(documentId,hash).all<{text:string}>();const value=rows.results[0]?.text;if(value===undefined)return null;const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));const actual=Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');return actual===hash?value:null;},
  async append(event,expectedCount){const result=await db.prepare('INSERT INTO research_portal_events (id, payload) SELECT ?, ? WHERE (SELECT COUNT(*) FROM research_portal_events) = ?').bind(event.id,JSON.stringify(event),expectedCount).run();if(result.meta.changes!==1)throw new PortalError('Outro parecer foi salvo simultaneamente. Atualize e tente novamente.',409);},
};}

export async function researchPortal():Promise<PortalService>{
  if(process.env.NODE_ENV!=='production'&&process.env.ENABLE_OPENNEXT_DEV_PROXY!=='1')return new PortalService(data as unknown as PortalDataset,await localStore(process.env.RESEARCH_LOCAL_STORE_DIR),pilot,true);
  let binding:unknown;
  try{const {env}=await getCloudflareContext({async:true});binding='RESEARCH_DB' in env?env.RESEARCH_DB:undefined;}catch{if(process.env.NODE_ENV==='production')throw new PortalError('Contexto Cloudflare indisponível; nenhum parecer foi salvo.',503);}
  const db=binding&&typeof binding==='object'&&'prepare' in binding&&typeof binding.prepare==='function'?binding as D1Database:undefined;
  if(db)return new PortalService(data as unknown as PortalDataset,databaseStore(db),pilot,true);
  if(process.env.NODE_ENV==='production')throw new PortalError('Configure o binding RESEARCH_DB antes de iniciar avaliações.',503);
  return new PortalService(data as unknown as PortalDataset,await localStore(),pilot,true);
}
