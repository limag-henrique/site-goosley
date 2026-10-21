"""Run from the research repository; export only the frozen review sample."""
import ast
import csv
import hashlib
import json
from pathlib import Path

import polars as pl
from sqlalchemy import create_engine, text, bindparam
from chart_observatory.config import Settings
from chart_observatory.lyrics.classification import LyricsClassification

ROOT = Path.cwd()
import argparse
parser = argparse.ArgumentParser()
parser.add_argument('--output',type=Path,default=ROOT/'.portal-staging/src/data/research-portal.json')
OUT = parser.parse_args().output.resolve()
base = ROOT / 'research/article'
sample = list(csv.DictReader((base / 'revision-analysis/human-reviewer-1-blind.csv').open(encoding='utf-8')))
labels = ['Explicitude sexual','Desejo sexual','Insinuação sexual','Ato sexual explícito','Anatomia sexual explícita','Afeto romântico','Desilusão amorosa','Infidelidade','Sexo transacional','Sexo casual','Ciúme e posse','Reciprocidade','Objetificação','Misoginia','Agência sexual','Simbolização de status','Mercantilização','Referência a dinheiro','Materialismo','Consumo ostentatório','Riqueza como status','Drogas e álcool','Crime','Violência','Armas','Identidade territorial']
definitions = ['Descrição sexual explícita no texto.','Expressão de desejo ou atração sexual.','Duplo sentido ou sugestão sexual indireta.','Descrição explícita de atos sexuais.','Referência sexual explícita a partes do corpo.','Expressão de carinho, vínculo ou amor romântico.','Dor ou perda associada a uma relação amorosa.','Relações ou desejo fora de um compromisso de exclusividade.','Troca de sexo por dinheiro, bens ou vantagens.','Sexo sem compromisso afetivo duradouro.','Ciúme, controle ou posse em relações.','Mutualidade de afeto, cuidado ou desejo.','Redução de uma pessoa a objeto ou utilidade.','Desprezo, hostilidade ou depreciação dirigida a mulheres.','Capacidade de expressar e decidir sobre o próprio desejo.','Uso de bens ou sinais para expressar posição social.','Tratamento de pessoas ou relações como mercadorias.','Menção a dinheiro, pagamento ou valores monetários.','Ênfase em bens e riqueza como valores ou objetivos.','Exibição de consumo, luxo ou bens.','Associação explícita entre riqueza e prestígio.','Referência a drogas ou bebidas alcoólicas.','Referência a atividades criminosas.','Representação de força física, ameaça ou agressão.','Referência a armamento.','Vínculo ou identificação com lugares e territórios.']
codes = list(sample[0])[9:]
dimensions = [dict(code=c,label=l,definition=d) for c,l,d in zip(codes,labels,definitions,strict=True)]
annotations = {r['chart_track_id']:r for r in csv.DictReader((base/'analysis-final/native-id-annotations.csv').open(encoding='utf-8'))}
master = {r['canonical_track_id']:r for r in pl.read_parquet(ROOT/'data/derived/track_master.parquet').to_dicts()}
allowed_cells = pl.read_csv(base/'analysis-final/annual-country-metrics.csv').select('market_code','year')
membership_source = ROOT/'data/derived/research_quality/country-all-history-20261011-022524/unique-chart-track-market-year-source.parquet'
exposure = pl.scan_parquet(membership_source).select('chart_track_id','market_code','year').filter(pl.col('chart_track_id').is_in([r['chart_track_id'] for r in sample])).collect().join(allowed_cells,on=['market_code','year'],how='semi')
membership = {r['chart_track_id']:r for r in exposure.group_by('chart_track_id').agg(pl.col('market_code').unique().sort().alias('markets'),pl.col('year').unique().sort().alias('years')).to_dicts()}
engine = create_engine(Settings.load(ROOT).database_url)
query = text('''SELECT d.id::text AS document_id,d.source,d.source_version,d.rights_status,d.content_sha256,d.text,d.language_code,d.retrieved_at,t.title,(SELECT string_agg(a.name, ', ' ORDER BY a.name) FROM track_artists ta JOIN artists a ON a.id=ta.artist_id WHERE ta.track_id=t.id) AS artist,s.id::text AS snapshot_id,s.model_id,s.provider_model_version,s.prompt_version,s.taxonomy_version,s.classified_at,s.execution_mode,b.thinking_level,b.source_sha256 FROM lyric_documents d JOIN canonical_tracks t ON t.id=d.canonical_track_id LEFT JOIN lyric_classification_snapshots s ON s.lyric_document_id=d.id LEFT JOIN lyric_classification_batch_runs b ON b.id=s.batch_run_id WHERE d.id::text IN :ids''').bindparams(bindparam('ids',expanding=True))
by_doc = {}
with engine.connect() as conn:
 for offset in range(0,len(sample),300):
  for row in conn.execute(query,{'ids':[r['document_id'] for r in sample[offset:offset+300]]}).mappings():
   by_doc.setdefault(row['document_id'],[]).append(dict(row))
recordings=[]
for item in sample:
 ann=annotations.get(item['chart_track_id'],{})
 candidates=by_doc.get(item['document_id'],[])
 doc=next((r for r in candidates if r['snapshot_id']==ann.get('snapshot_id')),candidates[0] if candidates else {})
 track=master.get(ann.get('lyric_track_id'),{})
 content=doc.get('text')
 valid=bool(content and doc.get('rights_status')=='RESEARCH_AUTHORIZED' and hashlib.sha256(content.encode()).hexdigest()==item['lyrics_hash'])
 recordings.append(dict(id=item['chart_track_id'],title=doc.get('title') or track.get('title') or item['chart_track_id'],artist=doc.get('artist') or track.get('artist_names') or 'Artista não informado',documentId=item['document_id'],lyricsHash=item['lyrics_hash'],market=item['market_code'],markets=membership.get(item['chart_track_id'],{}).get('markets',[item['market_code']]),years=membership.get(item['chart_track_id'],{}).get('years',[]),genre=item['genre_group'],language=doc.get('language_code') or 'Não informado',lyrics=content if valid else None,ai={code:int(ann[code]) for code in codes if ann.get(code)},provenance={key:(str(doc[key]) if doc.get(key) is not None else None) for key in ['source','source_version','rights_status','retrieved_at','snapshot_id','model_id','provider_model_version','prompt_version','taxonomy_version','classified_at','execution_mode','thinking_level','source_sha256']}))
tree=ast.parse((ROOT/'src/chart_observatory/lyrics/gemini_pipeline.py').read_text(encoding='utf-8'))
prompt=next(ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='_CLASSIFICATION_INSTRUCTIONS' for t in n.targets))
def rows(path):
 return list(csv.DictReader(path.open(encoding='utf-8')))
dataset=dict(recordings=recordings,dimensions=dimensions,annual=rows(base/'analysis-final/annual-country-metrics.csv'),sources=rows(base/'analysis-final/source-coverage.csv'),context=rows(base/'analysis-final/context-associations.csv'),methodology=dict(freeze='2026-10-11',sampleStatus='Amostra provisória; idioma e elegibilidade precisam ser confirmados antes da referência final.',prompt=prompt,promptTemplate=prompt+'\n[Lyric language: idioma, quando registrado]\n<lyrics>\n[letra identificada pelo hash]\n</lyrics>',responseSchema=LyricsClassification.model_json_schema(),promptVersion='lyrics-classification-prompt-v2',rubricVersion='lyrics-classification-v1',parameterNote='Valores históricos por gravação. Campos ausentes permanecem não registrados; não são substituídos pelos padrões atuais.',protocol=(base/'revision-analysis/validation-protocol.txt').read_text(encoding='utf-8')))
OUT.parent.mkdir(parents=True,exist_ok=True)
OUT.write_text(json.dumps(dataset,ensure_ascii=False,separators=(',',':'),default=str),encoding='utf-8')
import runpy
runpy.run_path(str(Path(__file__).with_name('split-portal-lyrics.py')))['split_dataset'](OUT)
print(json.dumps({'recordings':len(recordings),'authorizedMatchingLyrics':sum(r['lyrics'] is not None for r in recordings),'annualCells':len(dataset['annual'])}))
