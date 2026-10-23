import assert from 'node:assert/strict';
import test from 'node:test';
import { comparisonCsv, type ComparisonExport } from '../src/lib/research-export';

const value:ComparisonExport={exportVersion:'research-comparison-export-v1',exportedAt:'2026-10-23T12:00:00Z',campaignFingerprint:'corpus',selectionVersion:null,comparisonRule:'Último parecer salvo',dimensions:[{code:'theme',label:'Tema',definition:'Definição'}],history:[],evaluations:[{recording:{id:'song',title:'=HYPERLINK("https://example.org")',artist:'Artista; "Convidado"',market:'BR',documentId:'doc',lyricsHash:'hash'},review:{id:'review',action:'save',reviewer:1,evaluator:'Ana',at:'2026-10-23T10:00:00Z',rubricVersion:'human-v1',status:'scored',justification:'Primeira linha\nSegunda; com "aspas"',aiExposed:true},reflection:null,comparison:{ai:{theme:3},provenance:{model_id:'model'},prompt:{version:'prompt-v1',template:'template',note:'Snapshot'},metrics:[{dimension:'theme',human:0,ai:3,delta:-3}]}}]};

test('CSV comparison preserves zero, signed differences, Unicode and quoted multiline text safely for spreadsheets',()=>{
 const csv=comparisonCsv(value);
 assert.ok(csv.startsWith('\ufeff"Música";"Artista";'));
 assert.ok(csv.includes('"Escore humano";"Escore IA";"Diferença (humano - IA)"'));
 assert.ok(csv.includes('"0";"3";"-3";"Divergência"'));
 assert.ok(csv.includes(`"'=HYPERLINK(""https://example.org"")"`));
 assert.ok(csv.includes('"Artista; ""Convidado"""'));
 assert.ok(csv.includes('"Primeira linha\nSegunda; com ""aspas"""'));
 const missing=structuredClone(value);missing.evaluations[0].comparison.metrics[0]={dimension:'theme',human:null,ai:3,delta:null};
 assert.ok(comparisonCsv(missing).includes('"";"3";"";"Sem comparação"'));
});

test('empty exports still have a useful header and no fabricated evaluation rows',()=>{
 const empty={...value,evaluations:[]};const csv=comparisonCsv(empty);
 assert.equal(csv.split('\r\n').length,2);
 assert.ok(csv.includes('"Ponderação sobre a IA"'));
});
