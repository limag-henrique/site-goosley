"""Verify frozen portal links against local source annotations and private SQL lyrics.
Never changes source datasets or a database. Writes only the aggregate report requested.
"""
import argparse,csv,hashlib,json,re,sys
import polars as pl
from pathlib import Path

def main():
 p=argparse.ArgumentParser();p.add_argument('--research-root',type=Path,required=True);p.add_argument('--report',type=Path,required=True);args=p.parse_args()
 root=Path(__file__).resolve().parents[1]
 corpus=json.loads((root/'src/data/research-portal.json').read_text(encoding='utf8'))
 selection=json.loads((root/'src/data/research-selection.json').read_text(encoding='utf8'))
 annotations={r['chart_track_id']:r for r in csv.DictReader((args.research_root/'research/article/analysis-final/native-id-annotations.csv').open(encoding='utf8'))}
 private=root/'.wrangler/research-portal-lyrics.sql'
 lyrics={}
 if private.exists():
  pattern=re.compile(r"VALUES \('([^']+)'\s*,\s*'([^']+)'\s*,\s*CAST\(X'([0-9a-fA-F]+)' AS TEXT\)\s*,\s*'RESEARCH_AUTHORIZED'\)")
  for document,digest,encoded in pattern.findall(private.read_text(encoding='utf8')):
   lyrics[(document,digest)]=hashlib.sha256(bytes.fromhex(encoded)).hexdigest()==digest
 master={r['canonical_track_id']:r for r in pl.read_parquet(args.research_root/'data/derived/track_master.parquet').to_dicts()}
 by_id={r['id']:r for r in corpus['recordings']};issues=[]
 for item in selection['recordings']:
  r=by_id[item['recordingId']];a=annotations.get(r['id'])
  if not a or a['document_id']!=r['documentId'] or a['lyrics_hash']!=r['lyricsHash'] or a['snapshot_id']!=r['provenance']['snapshot_id']:issues.append({'recordingId':r['id'],'issue':'annotation-link'})
  if a and any(str(r['ai'].get(d['code']))!=a.get(d['code']) for d in corpus['dimensions']):issues.append({'recordingId':r['id'],'issue':'historical-score'})
  if not lyrics.get((r['documentId'],r['lyricsHash'])):issues.append({'recordingId':r['id'],'issue':'private-lyrics-hash'})
  if master.get(r['id'],{}).get('title')!=r['title']:issues.append({'recordingId':r['id'],'issue':'native-title'})
  if master.get(r['id'],{}).get('artist_names','').casefold()!=r['artist'].casefold():issues.append({'recordingId':r['id'],'issue':'native-artist'})
  if not r['title'] or not r['artist'] or r['provenance']['rights_status']!='RESEARCH_AUTHORIZED':issues.append({'recordingId':r['id'],'issue':'metadata'})
 report={'selectionVersion':selection['version'],'recordingsChecked':len(selection['recordings']),'annotationSource':'research/article/analysis-final/native-id-annotations.csv','annotationSourceSha256':hashlib.sha256((args.research_root/'research/article/analysis-final/native-id-annotations.csv').read_bytes()).hexdigest(),'titlesAndArtistsCheckedByNativeId':len(selection['recordings']),'artistComparison':'casefold; quatro diferenças apenas de capitalização, sem alterar metadados','privateLyricsVerified':sum(lyrics.get((by_id[r['recordingId']]['documentId'],by_id[r['recordingId']]['lyricsHash']),False) for r in selection['recordings']),'issues':issues,'limits':['Conferência do snapshot e SQL privado locais; PostgreSQL indisponível na sessão.','O D1 de produção não foi consultado: credencial Cloudflare indisponível.','Títulos e artistas conferidos por ID nativo em track_master; capitalização dos artistas preservada. Sem validação semântica humana da transcrição.']}
 args.report.parent.mkdir(parents=True,exist_ok=True);args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 print(json.dumps({'checked':report['recordingsChecked'],'lyricsVerified':report['privateLyricsVerified'],'issues':len(issues)}))
 if issues:sys.exit(1)
if __name__=='__main__':main()
