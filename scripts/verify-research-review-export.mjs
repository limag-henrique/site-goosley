import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

try {
  assert.ok(process.argv[2], 'Uso: node scripts/verify-research-review-export.mjs arquivo.json');
  const envelope = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  const { payload, integrity } = envelope;
  assert.equal(payload.exportVersion, 'research-review-export-v1');
  assert.equal(integrity.algorithm, 'SHA-256');
  const actual = createHash('sha256').update(JSON.stringify(payload), 'utf8').digest('hex');
  assert.equal(actual, integrity.sha256, 'O conteúdo diverge do checksum. Preserve a cópia original e baixe novamente.');
  assert.ok(payload.events.every(event => event.reviewer === payload.reviewer));
  assert.equal(payload.completed, payload.latestReviews.length);
  assert.ok(!('ai' in payload) && !('divergences' in payload));
  console.log(JSON.stringify({ integrity: 'valid', reviewer: payload.reviewer, completed: payload.completed, revisions: payload.events.filter(event => event.action === 'save').length, closed: payload.closed }));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
