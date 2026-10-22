import { PortalError, type EventStore, type PortalEvent } from '../lib/research-portal';

/** Local development only. Never silently replace a failed remote database. */
export async function localStore(directory?:string):Promise<EventStore>{
  const fs=await import('node:fs/promises');const path=await import('node:path');
  const folder=directory??path.join(process.cwd(),'.research-portal-local');const filename=path.join(folder,'events.jsonl');
  async function read(){try{return (await fs.readFile(filename,'utf8')).split('\n').filter(Boolean).map(line=>JSON.parse(line) as PortalEvent);}catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')return [];throw error;}}
  return {read,async append(event,expectedCount){await fs.mkdir(folder,{recursive:true});let lock;try{lock=await fs.open(path.join(folder,'write.lock'),'wx');}catch{throw new PortalError('Outro salvamento está em andamento. Tente novamente.',409);}try{if((await read()).length!==expectedCount)throw new PortalError('Dados alterados simultaneamente. Atualize e tente novamente.',409);const handle=await fs.open(filename,'a');try{await handle.writeFile(`${JSON.stringify(event)}\n`);await handle.sync();}finally{await handle.close();}}finally{await lock.close();await fs.unlink(path.join(folder,'write.lock'));}}};
}

