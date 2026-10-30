"""Build disjoint review queues from frozen labels and actual regional chart streams.

Usage: python scripts/select-research-recordings.py --research-root D:/PromiscuidadeMusical
Requires polars from the research environment. Reads sources only; never queries or writes a DB.
"""
from pathlib import Path
from datetime import date
import argparse, csv, hashlib, json, unicodedata
import polars as pl

SITE=Path(__file__).resolve().parents[1]
MARKETS=['BR','DO','PA','CL','ID','JP','TW']
# Seven territories in each initial 20-track lot, with four Brazilian examples.
SCHEDULE=['BR','DO','PA','CL','ID','JP','TW','BR','DO','PA','CL','ID','JP','TW','BR','DO','PA','CL','ID','BR']
PROFILES=['zero','multi-central','high','popular']

def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def identity(r):return unicodedata.normalize('NFKC',r['title']+'|'+r['artist']).casefold().strip()

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--research-root',type=Path,required=True);args=parser.parse_args()
 source=args.research_root/'data/normalized/mgd_observations.parquet'
 atlas=args.research_root/'research/article/international-atlas.csv'
 corpus=SITE/'src/data/research-portal.json';legacy=SITE/'src/data/research-pilot.json'
 data=json.loads(corpus.read_text(encoding='utf8'));old=json.loads(legacy.read_text(encoding='utf8'))
 dimensions=[d['code'] for d in data['dimensions']]
 excluded={r['recordingId'] for r in old['recordings']}
 by_id={r['id']:r for r in data['recordings'] if r.get('lyricAvailable') and r['provenance'].get('rights_status')=='RESEARCH_AUTHORIZED' and all(type(r['ai'].get(c)) is int and 0<=r['ai'][c]<=3 for c in dimensions) and r['id'] not in excluded}
 ranks={r['market_code']:int(r['explicitness_rank']) for r in csv.DictReader(atlas.open(encoding='utf8'))}
 raw=pl.scan_parquet(source).filter(pl.col('country_code').is_in(MARKETS)&(pl.col('chart_name')=='Top 200')&pl.col('period_start').is_between(date(2017,1,1),date(2022,3,13))).select('country_code','period_start','native_id','rank','metric_value','metric_type').collect()
 assert raw.filter((pl.col('metric_type')!='STREAMS')|pl.col('metric_value').is_null()|(pl.col('metric_value')<0)).height==0
 daily=raw.unique()
 assert daily.group_by('country_code','period_start','native_id').len().filter(pl.col('len')>1).height==0,'Conflicting recording/day values'
 daily=daily.with_columns(pl.col('period_start').dt.year().alias('year'))
 coverage=daily.group_by('country_code','year').agg(pl.col('period_start').n_unique().alias('observedDays'),pl.col('period_start').min().alias('firstDate'),pl.col('period_start').max().alias('lastDate')).sort('country_code','year').to_dicts()
 annual=daily.group_by('country_code','year','native_id').agg(pl.col('metric_value').sum().alias('streams'),pl.col('period_start').n_unique().alias('chartDays'),pl.col('rank').min().alias('peakRank'))
 annual=annual.sort(['country_code','year','streams','native_id'],descending=[False,False,True,False]).with_columns(pl.col('streams').rank('ordinal',descending=True).over('country_code','year').alias('annualChartRank'))
 eligible=annual.filter(pl.col('native_id').is_in(list(by_id))).to_dicts()
 candidates=[]
 for row in eligible:
  r=by_id[row['native_id']]
  if row['country_code'] not in r['markets']:continue
  values=[r['ai'][c] for c in dimensions]
  candidates.append(dict(recordingId=r['id'],market=row['country_code'],rank=ranks[row['country_code']],year=row['year'],streams=row['streams'],chartDays=row['chartDays'],peakRank=row['peakRank'],annualChartRank=row['annualChartRank'],allZero=all(v==0 for v in values),centralDimensions=sum(v==3 for v in values),maxIntensity=max(values),title=r['title'],artist=r['artist']))
 candidates.sort(key=lambda r:(r['annualChartRank'],-r['streams'],r['year'],r['recordingId'],r['market']))
 used=set();used_identity=set();queues={i:[] for i in range(1,6)}
 def choose(market,profile,strict):
  for row in candidates:
   if row['recordingId'] in used or identity(by_id[row['recordingId']]) in used_identity:continue
   if strict and row['market']!=market:continue
   if profile=='zero' and not row['allZero']:continue
   if profile=='multi-central' and row['centralDimensions']<3:continue
   if profile=='high' and (row['maxIntensity']<2 or row['centralDimensions']>=3):continue
   return row
  return None
 # Allocate round-robin so the first reviewer cannot exhaust the strongest examples.
 batch=0
 while True:
  added=0
  for position,market in enumerate(SCHEDULE):
   for reviewer in range(1,6):
    profile=PROFILES[(position+reviewer-1+batch)%4]
    row=choose(market,profile,True)
    fallback=False
    if row is None and batch>0:row=choose(market,profile,False);fallback=True
    if row is None and batch>0:row=choose(market,'popular',True) or choose(market,'popular',False);fallback=True
    if row is None:
     assert batch>0,f'Insufficient initial {market}/{profile}'
     continue
    used.add(row['recordingId']);used_identity.add(identity(by_id[row['recordingId']]))
    queues[reviewer].append({**row,'reviewer':reviewer,'batch':batch+1,'requestedProfile':profile,'supplement':fallback or row['annualChartRank']>200})
    added+=1
  if not added:break
  batch+=1
 for reviewer,rows in queues.items():assert len(rows)>=20
 old_hash=hashlib.sha256(json.dumps(old,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
 # Fingerprint matches JSON.stringify on the existing JSON (all numeric fields are integers).
 manifest=dict(version='research-disjoint-5-v1',ranking='Atlas de explicitude sexual, 2017–13/03/2022; posição temática por país, não nota de qualidade',selection='Filas exclusivas: streams anuais observados no Top 200 regional, cruzados com letras autorizadas e escores históricos. Quatro perfis intercalados; sete países por lote inicial. Amostra intencional, não probabilística.',reviewers=[1,2,3,4,5],initialBatchSize=20,previousSelectionFingerprints=[old_hash],period={'from':'2017-01-01','through':'2022-03-13','partialYear':2022},sources=[{'path':'data/normalized/mgd_observations.parquet','sha256':digest(source),'provider':'MGD','chart':'Spotify regional Top 200','metric':'streams observados nos dias de presença no chart, não streams de todas as plataformas','url':'https://sol.sbc.org.br/index.php/dsw/article/download/25503/25323/'},{'path':'research/article/international-atlas.csv','sha256':digest(atlas)},{'path':'src/data/research-portal.json','sha256':digest(corpus)},{'path':'src/data/research-pilot.json','sha256':digest(legacy)}],coverage=coverage,excludedLegacyRecordingIds=sorted(excluded),recordings=[row for rows in queues.values() for row in rows])
 (SITE/'src/data/research-selection.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2,default=str)+'\n',encoding='utf8')
 lines=['# Seleção musical por popularidade — 30/10/2026','','Amostra intencional do corpus histórico autorizado. Nenhuma nota foi gerada ou alterada. Posição anual calculada sobre todas as gravações observadas no Top 200 regional da fonte MGD, antes de intersectar com o corpus. Soma de streams dos dias observados; não equivale a ouvintes únicos ou consumo de todas as plataformas. 2022 é parcial até 13/03. Ausência de letra ou escore não é zero.','','Algoritmo: prioridade por posição anual crescente, streams decrescentes, ano e ID. Rodízio entre avaliadores, países e quatro perfis: 26 zeros, pelo menos três notas 3, máximo >=2 sem o estrato anterior e popularidade livre. Cada primeiro lote possui cinco itens de cada perfil e os sete países. Suplementos raros fora do top 200 anual ou fora da célula solicitada ficam identificados no manifesto. Os 12 IDs do piloto anterior são excluídos; deduplicação adicional por título/artista normalizados. Reservas futuras permanecem exclusivas.','','| Avaliador | Reserva | 26 zeros nos primeiros 20 | >=3 notas máximas nos primeiros 20 |','|---|---:|---:|---:|']
 for reviewer,rows in queues.items():lines.append(f"| {reviewer} | {len(rows)} | {sum(r['allZero'] for r in rows[:20])} | {sum(r['centralDimensions']>=3 for r in rows[:20])} |")
 lines+=['','## Primeiro lote de cada avaliador','','| Avaliador | Música | Artista | País | Ano | Posição anual | Streams observados | Perfil |','|---|---|---|---|---:|---:|---:|---|']
 for reviewer,rows in queues.items():
  for r in rows[:20]:lines.append(f"| {reviewer} | {r['title'].replace('|','/')} | {r['artist'].replace('|','/')} | {r['market']} | {r['year']} | {r['annualChartRank']} | {r['streams']} | {r['requestedProfile']} |")
 lines+=['','## Fontes e verificação externa','','- Dados históricos locais: `data/normalized/mgd_observations.parquet` (hash e cobertura por país/ano no manifesto).','- [MGD+ — artigo e descrição do dataset](https://sol.sbc.org.br/index.php/dsw/article/download/25503/25323/).','- [Spotify — metodologia dos charts](https://support.spotify.com/mr-en/artists/article/understanding-spotify-charts/).','- [Spotify — retrospectiva de 2021](https://newsroom.spotify.com/2021-12-01/what-the-world-streamed-most-in-2021/).','- [Spotify — histórico brasileiro](https://newsroom.spotify.com/decade-in-brazil-portuguese/).','- [Apple Music — músicas mais tocadas na Indonésia em 2021](https://music.apple.com/us/playlist/top-songs-of-2021-indonesia/pl.ec358eecc0ae467b8818b84834565053), referência contextual de outra plataforma; não entra na soma Spotify.','','Listas editoriais consultadas contextualizam a pesquisa; a seleção é calculada sobre os dados locais rastreáveis, não por notícias ou popularidade atual. Selecionar extremos da IA é enriquecimento intencional e não produz estimativas populacionais. Músicas exclusivas não permitem calcular concordância entre avaliadores.']
 (SITE/'docs/research-selection-evidence.md').write_text('\n'.join(lines)+'\n',encoding='utf8')
 print(json.dumps({'reserved':len(used),'perReviewer':{i:len(rows) for i,rows in queues.items()},'initialZero':{i:sum(r['allZero'] for r in rows[:20]) for i,rows in queues.items()},'initialMultiCentral':{i:sum(r['centralDimensions']>=3 for r in rows[:20]) for i,rows in queues.items()},'initialWorstAnnualRank':max(r['annualChartRank'] for rows in queues.values() for r in rows[:20]),'duplicatesRemoved':raw.height-daily.height,'oldSelectionFingerprint':old_hash},ensure_ascii=False))

if __name__=='__main__':main()

