import assert from "node:assert/strict";
import test from "node:test";

import { buildProfileSections, maskLastTwoDigits, parsePersonSourceLine } from "../src/lib/criminalidadefacial-profile";
import { getBirthYearChallenge, getPeopleIndex, verifyBirthYear } from "../src/server/criminalidadefacial/people";

test("perfil fictício cria desafio com ano anterior, correto e seguinte", () => {
  const person = getPeopleIndex().find((entry) => entry.hasBirthYear);
  assert.ok(person);
  const challenge = getBirthYearChallenge(person.id);
  assert.equal(challenge.status, "ready");
  if (challenge.status !== "ready") return;
  assert.deepEqual([...challenge.years].sort((a, b) => a - b), [challenge.birthYear - 1, challenge.birthYear, challenge.birthYear + 1]);
});

test("perfil fictício sem nascimento permanece bloqueado", () => {
  const person = getPeopleIndex().find((entry) => !entry.hasBirthYear);
  assert.ok(person);
  assert.deepEqual(getBirthYearChallenge(person.id), { status: "missing-birth-year" });
});

test("perfil fictício só retorna dados para o ano correto", () => {
  const person = getPeopleIndex().find((entry) => entry.hasBirthYear);
  assert.ok(person);
  const challenge = getBirthYearChallenge(person.id);
  assert.equal(challenge.status, "ready");
  if (challenge.status !== "ready") return;
  assert.deepEqual(verifyBirthYear(person.id, challenge.birthYear + 1), { status: "wrong-year" });
  const result = verifyBirthYear(person.id, challenge.birthYear);
  assert.equal(result.status, "verified");
  if (result.status === "verified") assert.ok(result.profile.sections.length > 0);
});

test("perfil fictício mascara dois dígitos e exclui saúde, vacinação e familiares", () => {
  assert.equal(maskLastTwoDigits("123.456.789-10"), "123.456.789-**");
  assert.equal(maskLastTwoDigits("(31) 99999-1234"), "(31) 99999-12**");
  const parsed = parsePersonSourceLine(
    "Pessoa Teste {• NOME: PESSOA TESTE • CPF: 12345678910 • NASCIMENTO: 01/02/2000 • MÃE: MARIA TESTE " +
      "▸ CNS [1]: 123456789012345 (DEFINITIVO) • ORIGEM: Sistema Único de Saúde " +
      "▸ [1] • VACINA NOME: TESTE • LOTE: ABC ▸ [2] • TIPO: pai • NOME: PAI TESTE • CPF: 00000000000 " +
      "▸ [3] (31) 99999-1234 • TELEFONE: (31) 99999-1234 " +
      "▸ [4] • CURSO NOME: CIÊNCIA DA COMPUTAÇÃO • ANO: 2023 • ANO: 2024}",
  );
  assert.ok(parsed);
  const visible = JSON.stringify(buildProfileSections(parsed.raw));
  assert.match(visible, /123456789\*\*/);
  assert.match(visible, /\(31\) 99999-12\*\*/);
  assert.match(visible, /CIÊNCIA DA COMPUTAÇÃO/);
  assert.match(visible, /2023/);
  assert.match(visible, /2024/);
  assert.doesNotMatch(visible, /MARIA TESTE|PAI TESTE|CNS|VACINA|Sistema Único de Saúde/iu);
});

test("filtro preserva dados do titular antes de família ou vacinação no mesmo bloco", () => {
  const visible = JSON.stringify(buildProfileSections(
    "• NOME: PESSOA TESTE • NASCIMENTO: 01/02/2000 " +
      "▸ [1] • CURSO NOME: CIÊNCIA DA COMPUTAÇÃO • ANO: 2023 • EMAIL: titular@example.com " +
      "• TIPO: mae • LABEL: Mae • CPF: 00000000000 • NOME: FAMILIAR TESTE " +
      "▸ [2] • EMAIL: social@example.com • CRIADO EM: 2020 「💉」 VACINAS (2) " +
      "▸ [1] • VACINA NOME: TESTE • LOTE: ABC",
  ));

  assert.match(visible, /CIÊNCIA DA COMPUTAÇÃO|2023|titular@example.com/);
  assert.match(visible, /social@example.com|2020/);
  assert.doesNotMatch(visible, /FAMILIAR TESTE|00000000000|VACINA|LOTE/iu);
});
