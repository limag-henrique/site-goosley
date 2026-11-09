"""Add Elaine's independent queue, sharing Grazi's frozen song assignments.
Only writes the active local manifest; never changes the corpus or stored events.
"""
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'src/data/research-selection-seven.json'
OUT = ROOT / 'src/data/research-selection.json'


def main():
    old = json.loads(SOURCE.read_text(encoding='utf8'))
    assert old['reviewers'] == [2, 3, 1, 4, 5, 6, 7]
    shared = [dict(row, reviewer=8) for row in old['recordings'] if row['reviewer'] == 1]
    assert len(shared) >= old['initialBatchSize'] == 20
    fingerprint = hashlib.sha256(json.dumps(old, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
    manifest = {
        **old,
        'version': 'research-shared-8-v1',
        'reviewers': [*old['reviewers'], 8],
        'previousSelectionFingerprints': [*old['previousSelectionFingerprints'], fingerprint],
        'preservedSelectionFingerprints': [*old['preservedSelectionFingerprints'], fingerprint],
        'preservedReviewerIds': {fingerprint: old['reviewers']},
        'selection': 'Oito percursos com escores históricos. Os sete percursos anteriores são preservados integralmente. Elaine Vilela compartilha as músicas do percurso da Grazi, com pareceres e progresso independentes. Amostra intencional, não probabilística.',
        'recordings': [*old['recordings'], *shared],
    }
    OUT.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    print(f"Eight reviewers; Elaine: {len(shared)} songs, {old['initialBatchSize']} initially.")


if __name__ == '__main__':
    main()
