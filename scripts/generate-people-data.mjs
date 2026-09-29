import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(root, "pessoas.txt");
const targetPath = resolve(root, "src/server/criminalidadefacial/pessoas.generated.ts");

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseLine(line, index) {
  const match = line.trim().match(/^(.+?)\s*\{(.*)\}\s*$/u);
  if (!match) throw new Error(`Linha ${index + 1} de pessoas.txt é inválida.`);
  return {
    id: `${slugify(match[1])}-${index + 1}`,
    fullName: match[1].trim(),
    raw: match[2].trim(),
  };
}

const source = await readFile(sourcePath, "utf8");
const records = source.split(/\r?\n/u).filter((line) => line.trim()).map(parseLine);
const output = `/* Arquivo gerado por scripts/generate-people-data.mjs. Não edite manualmente. */\n` +
  `export const GENERATED_PEOPLE = ${JSON.stringify(records, null, 2)} as const;\n`;

await writeFile(targetPath, output, "utf8");
console.log(`Gerados ${records.length} perfis fictícios em ${targetPath}.`);
