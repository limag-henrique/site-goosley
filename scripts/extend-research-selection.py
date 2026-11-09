"""Extend frozen queues to seven named participants without changing historical labels.
Read-only inputs; writes the new manifest and selection evidence in the site repo.
"""
from pathlib import Path
import json, hashlib
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'src/data/research-selection-five.json'
OUT=ROOT/'src/data/research-selection-seven.json'
NAMES={2:'Henrique Lima',3:'Miguel Offerman (Mosov)',1:'Grazi',4:'Gabriela',5:'Geovana',6:'Pedro Inácio',7:'Rafael Medeiros'}
MARKETS=['BR','DO','PA','CL','ID','JP','TW']
def main():
 old=json.loads(SOURCE.read_text(encoding='utf8'))
 corpus=json.loads((ROOT/'src/data/research-portal.json').read_text(encoding='utf8'))
 by_id={r['id']:r for r in corpus['recordings']}
 rows=[r for r in old['recordings'] if r['reviewer'] not in [2,3]]
 rows.sort(key=lambda r:(r['annualChartRank'],-r['streams'],r['year'],r['recordingId']))
 queues={i:[dict(r) for r in old['recordings'] if r['reviewer']==i] if i in [2,3] else [] for i in NAMES}
 newcomers=[1,4,5,6,7];used=set()
 def choose(reviewer,market,profile,strict=True):
  candidates=[r for r in rows if r['recordingId'] not in used and (not strict or r['market']==market) and (r['allZero'] if profile=='zero' else r['centralDimensions']>=3 if profile=='multi-central' else r['maxIntensity']>=2 if profile=='high' else True)]
  if not candidates:return False
  row=dict(candidates[0]);used.add(row['recordingId']);row.update(reviewer=reviewer,batch=len(queues[reviewer])//20+1,requestedProfile=profile)
  row['supplement']=row.get('supplement',False) or row['market']!=market
  queues[reviewer].append(row);return True
 # Seven zero-intensity tracks cover the seven territories. Seven multi-central
 # tracks per new reviewer use the scarce frozen high-extreme supply fairly.
 for position in range(20):
  profile='zero' if position<7 else 'multi-central' if position<14 else 'high'
  for offset,reviewer in enumerate(newcomers):
   market=MARKETS[(position+offset)%7]
   assert choose(reviewer,market,profile) or choose(reviewer,market,profile,False)
 while len(used)<len(rows):
  for reviewer in newcomers:
   if len(used)==len(rows):break
   assert choose(reviewer,'BR','popular',False)
 for reviewer,queue in queues.items():
  assert len(queue)>=20
  for row in queue:
   recording=by_id[row['recordingId']]
   assert recording['lyricAvailable'] and recording['provenance']['rights_status']=='RESEARCH_AUTHORIZED'
   values=[recording['ai'][d['code']] for d in corpus['dimensions']]
   assert all(type(v) is int and 0<=v<=3 for v in values)
   assert row['allZero']==all(v==0 for v in values)
   assert row['centralDimensions']==sum(v==3 for v in values)
 fingerprint=hashlib.sha256(json.dumps(old,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
 manifest={**old,'version':'research-disjoint-7-v1','namedReviewers':True,'reviewers':list(NAMES),'previousSelectionFingerprints':[*old['previousSelectionFingerprints'],fingerprint],'preservedSelectionFingerprints':[fingerprint],'selection':'Sete percursos exclusivos com escores históricos. Filas de Henrique e Miguel preservadas integralmente; novos percursos priorizam extremos 0 e 3. Amostra intencional, não probabilística.','recordings':[r for queue in queues.values() for r in queue]}
 assert len({r['recordingId'] for r in manifest['recordings']})==len(manifest['recordings'])
 OUT.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 lines=['# Seleção musical — sete participantes','','IDs internos estáveis: Henrique=2, Miguel=3, Grazi=1, Gabriela=4, Geovana=5, Pedro Inácio=6, Rafael Medeiros=7. A ordem de apresentação independe desses IDs. Filas completas de Henrique e Miguel preservadas; eventos e corpus não são reescritos.','','Fonte reproduzível: `research-selection-five.json`, com evidências e hashes das fontes históricas. Gerador: `scripts/extend-research-selection.py`. Nenhuma nota nova. Sete países em cada lote inicial; novos participantes recebem sete músicas com 26 zeros, sete com pelo menos três notas 3 e seis com intensidade máxima >=2. País de circulação não identifica idioma.','','| Participante | Reserva | Zeros no lote inicial | >=3 notas 3 no lote inicial |','|---|---:|---:|---:|']
 for reviewer,queue in queues.items():lines.append(f"| {NAMES[reviewer]} | {len(queue)} | {sum(r['allZero'] for r in queue[:20])} | {sum(r['centralDimensions']>=3 for r in queue[:20])} |")
 lines+=['','A reserva tem apenas 36 músicas com pelo menos três notas máximas fora das filas preservadas; 35 são distribuídas nos novos lotes iniciais. Lotes posteriores usam a reserva restante, sem promessa de igual proporção dos extremos. Músicas diferentes não permitem estimar concordância entre avaliadores.','','Fingerprint aceito da seleção anterior: `'+fingerprint+'`. Expansões e encerramentos dessa seleção são preservados porque as filas ativas de Henrique e Miguel permanecem idênticas. Autores históricos desconhecidos bloqueiam a transição até conferência.']
 (ROOT/'docs/research-seven-reviewers.md').write_text('\n'.join(lines)+'\n',encoding='utf8')
 print(json.dumps({i:len(q) for i,q in queues.items()}))
if __name__=='__main__':main()
