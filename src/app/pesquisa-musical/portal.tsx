'use client';

import { useEffect, useState } from 'react';
import type { Dimension, PortalEvent, ReviewStatus } from '@/lib/research-portal';
import { AiComparison, SharedReviews, reviewStatuses, type Comparison, type SharedReview } from './review-results';
import './portal.css';

type Track = { id:string; title:string; artist:string; displayMarket?:string; market:string; lyrics?:string|null; reviewStatus?:string };
type Reply = {
  state:{ closedReviewers:number[]; assigned:number };
  dimensions:Dimension[]; completed?:number; recordings?:Track[]; recording?:Track;
  review?:PortalEvent|null; reflection?:PortalEvent|null; comparison?:Comparison; reviews?:SharedReview[];
};
type Mode = 'blind'|'community';
type Action = 'save'|'close'|'reveal'|'reflect'|'export';
const api = '/api/pesquisa-musical';
const marketNames:Record<string,string> = { DO:'República Dominicana', PA:'Panamá', CL:'Chile', BR:'Brasil', ID:'Indonésia', JP:'Japão', TW:'Taiwan' };

async function request(params:URLSearchParams, signal?:AbortSignal):Promise<Reply> {
  const response = await fetch(`${api}?${params}`, { cache:'no-store', signal });
  const value = await response.json();
  if (!response.ok) throw new Error(value.error || 'Não foi possível carregar os pareceres.');
  return value;
}
function download(value:unknown, filename:string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value,null,2)], {type:'application/json'}));
  const anchor = document.createElement('a'); anchor.href=url; anchor.download=filename; anchor.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export default function ResearchPortal() {
  const [mode,setMode] = useState<Mode>('blind');
  const [reviewer,setReviewer] = useState<1|2>(1);
  const [evaluator,setEvaluator] = useState('');
  const [credential,setCredential] = useState({reviewer:1,key:''});
  const accessKey = credential.reviewer===reviewer ? credential.key : '';
  const [data,setData] = useState<Reply|null>(null);
  const [detail,setDetail] = useState<Reply|null>(null);
  const [selected,setSelected] = useState('');
  const [error,setError] = useState('');
  const [message,setMessage] = useState('');
  const [loading,setLoading] = useState(true);
  const [busy,setBusy] = useState<Action|null>(null);
  const [revision,setRevision] = useState(0);
  const [status,setStatus] = useState<ReviewStatus>('scored');
  const [scores,setScores] = useState<Record<string,string>>({});
  const [justification,setJustification] = useState('');
  const [recordedLanguage,setRecordedLanguage] = useState('');
  const [identityVerdict,setIdentityVerdict] = useState('');
  const [reviewDirty,setReviewDirty] = useState(false);
  const [reflection,setReflection] = useState('');
  const [reflectionDirty,setReflectionDirty] = useState(false);
  const [confirmClose,setConfirmClose] = useState(false);
  const dirty = reviewDirty || reflectionDirty;
  const closed = data?.state.closedReviewers.includes(reviewer) ?? false;
  const dimensions = data?.dimensions ?? [];
  const track = detail?.recording;
  const review = detail?.review;

  function leave() { return !busy && (!dirty || window.confirm('Há alterações não salvas. Deseja sair desta música?')); }
  function clearSelection() {
    setSelected(''); setDetail(null); setReviewDirty(false); setReflectionDirty(false);
    setError(''); setMessage(''); setConfirmClose(false);
  }
  function changeMode(next:Mode) { if(next===mode)return; if(leave()) { clearSelection(); setData(null); setMode(next); } }
  function identify(value:string) { setEvaluator(value); try { localStorage.setItem('research-evaluator',value); } catch {} }
  function updateKey(value:string) { setCredential({reviewer,key:value}); try { localStorage.setItem(`research-access-key-${reviewer}`,value); } catch {} }

  useEffect(()=>{
    try {
      setEvaluator(localStorage.getItem('research-evaluator') ?? '');
      const stored=localStorage.getItem('research-reviewer');
      if(stored==='1'||stored==='2') setReviewer(Number(stored) as 1|2);
    } catch {}
  },[]);
  useEffect(()=>{
    let key='';
    try { key=localStorage.getItem(`research-access-key-${reviewer}`) ?? ''; } catch {}
    if(!key) {
      key=crypto.randomUUID()+crypto.randomUUID();
      try { localStorage.setItem(`research-access-key-${reviewer}`,key); } catch {
        setError('Este navegador não guardou sua chave de edição. Baixe uma cópia em Acesso e cópia dos pareceres.');
      }
    }
    setCredential({reviewer,key});
  },[reviewer]);
  useEffect(()=>{
    const controller=new AbortController(); setLoading(true); setError('');
    request(new URLSearchParams({mode,reviewer:String(reviewer),pageSize:'100'}),controller.signal)
      .then(setData).catch(e=>{if(e.name!=='AbortError')setError(e.message);})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return ()=>controller.abort();
  },[mode,reviewer,revision]);
  useEffect(()=>{
    if(!selected)return;
    const controller=new AbortController(); setDetail(null); setError('');
    request(new URLSearchParams({mode:'blind',reviewer:String(reviewer),id:selected}),controller.signal)
      .then(value=>{
        setDetail(value); const saved=value.review;
        setStatus(saved?.status??'scored');
        setScores(Object.fromEntries(Object.entries(saved?.scores??{}).map(([key,value])=>[key,value===null?'':String(value)])));
        setJustification(saved?.justification??''); setRecordedLanguage(saved?.recordedLanguage??'');
        setIdentityVerdict(saved?.identityVerdict??''); setReflection(value.reflection?.reflection??'');
        setReviewDirty(false); setReflectionDirty(false);
      }).catch(e=>{if(e.name!=='AbortError')setError(e.message);});
    return ()=>controller.abort();
  },[selected,reviewer,revision]);
  useEffect(()=>{
    function unload(event:BeforeUnloadEvent) { if(dirty)event.preventDefault(); }
    window.addEventListener('beforeunload',unload); return ()=>window.removeEventListener('beforeunload',unload);
  },[dirty]);
  useEffect(()=>{
    if(mode!=='community')return;
    const timer=setInterval(()=>{if(document.visibilityState==='visible')setRevision(v=>v+1);},15000);
    return ()=>clearInterval(timer);
  },[mode]);

  async function act(action:Exclude<Action,'export'>) {
    if(busy)return;
    if((action==='reveal'&&dirty)||(action==='reflect'&&reviewDirty)||(action==='save'&&reflectionDirty))return;
    setBusy(action); setError(''); setMessage('');
    try {
      const body:Record<string,unknown>={action,reviewer,evaluator,accessKey,recordingId:selected};
      if(action==='save') Object.assign(body,{status,scores:status==='scored'?Object.fromEntries(Object.entries(scores).map(([key,value])=>[key,value===''?null:Number(value)])):{},justification,recordedLanguage,identityVerdict:identityVerdict||null});
      if(action==='reflect') Object.assign(body,{reviewId:review?.id,reflection});
      const response=await fetch(api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'Não foi possível salvar. Seu texto continua no formulário.');
      if(action==='reveal')setDetail(current=>current?{...current,comparison:result}:current);
      if(action==='reflect') {
        setDetail(current=>current?{...current,reflection:result.reflection}:current);
        setReflectionDirty(false); setMessage('Ponderação salva e disponível em Pareceres salvos.');
      }
      if(action==='save'||action==='close') {
        setReviewDirty(false); setConfirmClose(false); setRevision(v=>v+1);
        setMessage(action==='save'?'Parecer salvo. Se desejar, consulte agora a análise da IA.':'Etapa de avaliação encerrada. Você ainda pode registrar ponderações sobre a IA.');
      }
    } catch(e) { setError(e instanceof Error?e.message:'Falha ao salvar. Seu texto continua no formulário.'); }
    finally { setBusy(null); }
  }
  async function exportReviews() {
    if(busy||dirty)return; setBusy('export'); setError('');
    try {
      const response=await fetch(`${api}?mode=review-export&reviewer=${reviewer}`,{cache:'no-store'});
      const result=await response.json(); if(!response.ok)throw new Error(result.error||'Não foi possível baixar os pareceres.');
      download(result,`pareceres-avaliadora-${reviewer}.json`);
    } catch(e) { setError(e instanceof Error?e.message:'Falha ao baixar os pareceres.'); }
    finally {setBusy(null);}
  }

  return <main className="research">
    <header><div><p className="eyebrow">Goosley · Pesquisa musical</p><h1>Avalie as músicas.</h1><p className="muted">Registre seu fundamento, consulte a IA e pondere sobre as diferenças.</p></div></header>
    <nav aria-label="Avaliação musical">{([['blind','Avaliar músicas'],['community','Pareceres salvos']] as const).map(([id,label])=><button key={id} disabled={!!busy} aria-current={mode===id?'page':undefined} onClick={()=>changeMode(id)}>{label}</button>)}</nav>
    {error&&<div className="notice error" role="alert">{error} <button disabled={dirty||!!busy} onClick={()=>setRevision(v=>v+1)}>Tentar novamente</button></div>}
    {message&&<p className="notice" role="status">{message}</p>}
    {loading&&<p role="status">Carregando músicas e pareceres…</p>}

    {mode==='blind'&&<>
      <section className="panel" aria-label="Sua identificação">
        <div className="row"><h2>Sua avaliação</h2><span className="badge">{data?.completed??0} de {data?.state.assigned??'…'} músicas avaliadas</span></div>
        <div className="identity-fields">
          <label>Seu nome<input value={evaluator} disabled={!!busy} maxLength={160} onChange={e=>identify(e.target.value)} placeholder="Nome completo" autoComplete="name"/></label>
          <label>Avaliadora<select value={reviewer} disabled={!!busy} onChange={e=>{if(leave()){clearSelection();setData(null);setReviewer(Number(e.target.value) as 1|2);try{localStorage.setItem('research-reviewer',e.target.value);}catch{}}}}><option value={1}>Avaliadora 1</option><option value={2}>Avaliadora 2</option></select></label>
        </div>
        <p className="muted">Use sempre o mesmo nome e número. Seu parecer e sua ponderação ficam visíveis em Pareceres salvos.</p>
        <details><summary>Acesso e cópia dos pareceres</summary>
          <p>A chave privada de edição fica neste navegador. Baixe uma cópia para continuar em outro dispositivo e guarde-a só com você. Perder a chave não apaga os pareceres salvos.</p>
          <label>Chave privada da avaliadora<input type="password" value={accessKey} disabled={!!busy} autoComplete="off" onChange={e=>updateKey(e.target.value)}/></label>
          <div className="actions"><button disabled={!!busy||accessKey.length<32} onClick={()=>download({reviewer,accessKey},`chave-privada-avaliadora-${reviewer}.json`)}>Baixar chave privada</button><button disabled={!!busy||dirty} onClick={exportReviews}>Baixar pareceres e ponderações</button></div>
          <details><summary>Encerrar minha etapa de avaliação</summary><p>Encerre após avaliar todas as músicas. Os escores e fundamentos ficam bloqueados; ponderações sobre a IA continuam disponíveis.</p><label className="confirmation"><input type="checkbox" checked={confirmClose} disabled={!!busy} onChange={e=>setConfirmClose(e.target.checked)}/> Concluí minha avaliação de todas as músicas.</label><button disabled={!confirmClose||!!busy||closed||dirty||!evaluator.trim()||accessKey.length<32||data?.completed!==data?.state.assigned} onClick={()=>act('close')}>Encerrar avaliação</button></details>
        </details>
      </section>
      <div className="split">
        <section className="panel"><h2>Músicas para avaliar</h2>
          {data?.recordings?.map(item=><button className="track" key={item.id} disabled={loading||!!busy} aria-pressed={selected===item.id} onClick={()=>{if(selected===item.id)return;if(leave()){clearSelection();setSelected(item.id);}}}><strong>{item.title}</strong><small>{item.artist}</small><small>{marketNames[item.displayMarket??item.market]??item.market}{item.reviewStatus?' · Parecer salvo':''}</small></button>)}
          {!loading&&!error&&!data?.recordings?.length&&<p>Nenhuma música disponível para avaliação.</p>}
        </section>
        <section className="panel" aria-label="Música e avaliação">
          {!track?<><h2>{selected?'Carregando música…':'Escolha uma música'}</h2><p className="muted">Leia a letra e registre seu parecer. Depois de salvar, você pode consultar a IA e comentar as diferenças.</p></>:<>
            <h2>{track.title}</h2><p className="muted">{track.artist}</p>
            {track.lyrics?<details open><summary>Letra da música</summary><div className="lyrics" tabIndex={0} aria-label="Letra da música">{track.lyrics}</div></details>:<p className="notice">A letra autorizada está indisponível. Registre ausência de letra ou abstenção; não atribua zero para representar essa ausência.</p>}
            {review&&<section className="saved-basis"><h3>Seu fundamento salvo</h3><p className="review-text">{review.justification}</p><small>{closed?'Avaliação encerrada. Os escores e este fundamento estão preservados.':'Seu fundamento original fica preservado ao registrar a ponderação sobre a IA.'}</small></section>}
            <details key={review?.id??selected} open={!review} className="review-editor"><summary>{review?'Ver escores e revisar seu parecer':'Seu parecer'}</summary>
              <form onSubmit={e=>{e.preventDefault();act('save');}}>
                <p className="muted">Escala: 0 ausente · 1 incidental · 2 substancial · 3 central. Considere o contexto da letra e diferencie representação de endosso.</p>
                <label>Situação<select value={status} disabled={closed||!!busy||reflectionDirty} onChange={e=>{setStatus(e.target.value as ReviewStatus);setReviewDirty(true);}}>{Object.entries(reviewStatuses).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
                {status==='scored'&&<div className="rubric">{dimensions.map(d=><label key={d.code}>{d.label}<small>{d.definition}</small><select required value={scores[d.code]??''} disabled={closed||!!busy||reflectionDirty} onChange={e=>{setScores(v=>({...v,[d.code]:e.target.value}));setReviewDirty(true);}}><option value="">Selecionar intensidade</option>{['Ausente','Incidental','Substancial','Central'].map((label,i)=><option key={i} value={i}>{i} · {label}</option>)}</select></label>)}</div>}
                <label>Seu fundamento<textarea required maxLength={6000} disabled={closed||!!busy||reflectionDirty} value={justification} onChange={e=>{setJustification(e.target.value);setReviewDirty(true);}} placeholder="Explique sua interpretação e as evidências da letra que sustentam os escores."/></label>
                <details><summary>Idioma e identificação da letra (opcional)</summary><div className="identity-fields"><label>Idioma observado<input value={recordedLanguage} disabled={closed||!!busy||reflectionDirty} onChange={e=>{setRecordedLanguage(e.target.value);setReviewDirty(true);}}/></label><label>Correspondência da letra<select value={identityVerdict} disabled={closed||!!busy||reflectionDirty} onChange={e=>{setIdentityVerdict(e.target.value);setReviewDirty(true);}}><option value="">Não confirmada</option><option value="confirmed">Corresponde à música</option><option value="uncertain">Há dúvida</option><option value="mismatch">Não corresponde à música</option></select></label></div></details>
                <div className="actions"><button className="primary" disabled={!!busy||closed||reflectionDirty||accessKey.length<32||!evaluator.trim()||!justification.trim()} type="submit">{busy==='save'?'Salvando…':closed?'Avaliação encerrada':'Salvar meu parecer'}</button><small>{reviewDirty?'Há alterações não salvas.':review?'Parecer salvo no servidor.':'Salve antes de consultar a IA.'}</small></div>
              </form>
            </details>
            {review&&!detail?.comparison&&<section className="ai-invitation"><h3>Análise da IA</h3><p>Gostaria de ver a classificação feita por IA e compará-la com seu parecer?</p><button disabled={!!busy||dirty||!evaluator.trim()||accessKey.length<32} onClick={()=>act('reveal')}>{busy==='reveal'?'Consultando…':'Ver análise da IA'}</button>{reviewDirty&&<p>Salve as alterações do seu parecer antes de comparar.</p>}</section>}
            {reviewDirty&&detail?.comparison&&<p className="notice">Salve as alterações do seu parecer para atualizar a comparação com a IA.</p>}
            {detail?.comparison&&!reviewDirty&&<>
              <AiComparison comparison={detail.comparison} dimensions={dimensions}/>
              <form className="reflection-form" onSubmit={e=>{e.preventDefault();act('reflect');}}>
                <h3>Sua ponderação sobre as diferenças</h3>
                <label>Como seu fundamento se compara à análise da IA?<textarea required maxLength={6000} value={reflection} disabled={!!busy} onChange={e=>{setReflection(e.target.value);setReflectionDirty(true);}} placeholder="Explique onde concorda ou discorda, o contexto que sustenta sua leitura e o que pode explicar as diferenças de escores."/></label>
                <p className="muted">A ponderação é salva separadamente do seu parecer e também fica visível em Pareceres salvos.</p>
                <div className="actions"><button className="primary" disabled={!!busy||!reflection.trim()||!evaluator.trim()||accessKey.length<32} type="submit">{busy==='reflect'?'Salvando…':'Salvar ponderação'}</button><small>{reflectionDirty?'Ponderação ainda não salva.':detail.reflection?'Ponderação salva no servidor.':'Você pode ponderar mesmo quando os escores coincidem.'}</small></div>
              </form>
            </>}
          </>}
        </section>
      </div>
    </>}
    {mode==='community'&&data&&<SharedReviews reviews={data.reviews??[]} recordings={data.recordings??[]} dimensions={dimensions}/>}
    <footer>Pesquisa musical · O país de cada música indica circulação nas paradas, não a nacionalidade do artista. Pareceres e ponderações salvos ficam no servidor; a edição exige sua chave privada.</footer>
  </main>;
}
