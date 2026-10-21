"""Keep authorized frozen lyrics in private D1, out of the Worker bundle."""
import json
from pathlib import Path

def literal(value):
    return "'" + value.replace("'", "''") + "'"

def split_dataset(path):
    path = Path(path)
    dataset = json.loads(path.read_text(encoding='utf-8'))
    sql = []
    for recording in dataset['recordings']:
        content = recording['lyrics']
        if recording.get('lyricAvailable') and content is None:
            raise ValueError('Este dataset já foi separado; reexporte as letras da fonte autorizada.')
        recording['lyricAvailable'] = bool(content)
        if content:
            assert recording['provenance']['rights_status'] == 'RESEARCH_AUTHORIZED'
            values = [recording['documentId'], recording['lyricsHash'], content, 'RESEARCH_AUTHORIZED']
            sql.append('INSERT OR IGNORE INTO research_portal_lyrics(document_id,lyrics_hash,text,rights_status) VALUES (' + ','.join(literal(v) for v in values) + ');')
        recording['lyrics'] = None
    out = path.parents[2] / '.wrangler/research-portal-lyrics.sql'
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text('\n'.join(sql),encoding='utf-8')
    path.write_text(json.dumps(dataset,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    print(json.dumps({'lyrics':len(sql),'metadataBytes':path.stat().st_size,'privateSqlBytes':out.stat().st_size}))

if __name__ == '__main__':
    split_dataset(Path(__file__).resolve().parents[1] / 'src/data/research-portal.json')
