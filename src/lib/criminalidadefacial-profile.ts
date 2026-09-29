export type PersonIndexEntry = {
  id: string;
  fullName: string;
  hasBirthYear: boolean;
};

export type ProfileItem = {
  label: string;
  value: string;
};

export type ProfileSection = {
  id: string;
  title: string;
  items: ProfileItem[];
};

export type PersonProfileResult = {
  id: string;
  fullName: string;
  sections: ProfileSection[];
};

export type ParsedPersonSource = {
  fullName: string;
  raw: string;
};

type SectionDefinition = {
  id: string;
  title: string;
  matches: RegExp;
};

const SECTION_DEFINITIONS: SectionDefinition[] = [
  {
    id: "personal",
    title: "Dados pessoais",
    matches: /^(NOME|NASCIMENTO|DATA NASCIMENTO|IDADE|SEXO|ESTADO CIVIL|NATURALIDADE|NACIONALIDADE|CIDADE|UF|SITUAÇÃO RFB|SITUACAO RFB|DATA SITUAÇÃO|DATA SITUACAO|DESAPARECIDO|SERVIDOR PÚBLICO|SERVIDOR PUBLICO)$/iu,
  },
  {
    id: "documents",
    title: "Documentos e registros",
    matches: /(CPF|REGISTRO GERAL|^RG(?:\s|$)|ORGAO EMISSOR|ÓRGÃO EMISSOR|UF EMISSAO|UF EMISSÃO|DATA EMISSAO|DATA EMISSÃO|DATA IDENTIFICACAO|DATA IDENTIFICAÇÃO|DATA ULTIMA EMISSAO|DATA ÚLTIMA EMISSÃO|PIS|NIS|NIT|CTPS)/iu,
  },
  {
    id: "contact",
    title: "Contato e endereço",
    matches: /(TELEFONE|CELULAR|ENDEREÇO|ENDERECO|LOGRADOURO|AVENIDA|RUA|BAIRRO|CEP)/iu,
  },
  {
    id: "financial",
    title: "Dados financeiros",
    matches: /(RENDA|SALÁRIO|SALARIO|SCORE|PODER AQUISITIVO|FAIXA RENDA|POLÍTICA|POLITICA)/iu,
  },
  {
    id: "education",
    title: "Formação",
    matches: /(CURSO|IES|CAMPUS|CONCORRENCIA|CONCORRÊNCIA|NOTA|CLASSIFICACAO|CLASSIFICAÇÃO|APROVADO|MATRICULA|MATRÍCULA|ENEM|TURNO|PERIODO|PERÍODO|ETAPA|ANO)/iu,
  },
  {
    id: "assets",
    title: "Patrimônio",
    matches: /(IMOVEL|IMÓVEL|FAZENDA|SITIO|SÍTIO|INCRA|CIB|AREA|ÁREA|TITULAR|MUNICIPIO|MUNICÍPIO|NIRF|PARCELA|POSSE|FRACAO|FRAÇÃO|AQUISICAO|AQUISIÇÃO|MIGRACAO|MIGRAÇÃO|LOCALIZACAO|LOCALIZAÇÃO|DENOMINACAO|DENOMINAÇÃO|GLEBA)/iu,
  },
];

const NULL_LIKE = /^(?:null|undefined%?|não informado|nao informado|sem informação|sem informacao|nada consta)$/iu;
const DIRECT_FAMILY_FIELD = /^(?:MÃE|MAE|PAI|NOME MÃE|NOME MAE|NOME PAI)$/iu;
const HEALTH_FIELD = /(CNS|VACINA|DESCRICAO DOSE|DESCRIÇÃO DOSE|GRUPO ATENDIMENTO|ESTAB APLICACAO|ESTAB APLICAÇÃO|PROFISSIONAL APLIC|DATA APLICACAO|DATA APLICAÇÃO)/iu;
const HEALTH_CONTEXT_FIELD = /^(?:TIPO|DATA ATRIBUICAO|DATA ATRIBUIÇÃO|ORIGEM)$/iu;
const FAMILY_RELATION = /^(?:mãe|mae|pai|filho|filha|irmã|irma|irmão|irmao|tio|tia|tio_conjuge|avô|avó|avo|bisavô|bisavó|bisavo|trisavô|trisavó|trisavo|primo|prima|madrasta|padrasto|cônjuge|conjuge|cunhado|cunhada|sogro|sogra|sobrinho|sobrinha)(?:_|\s|$)/iu;
const IDENTIFIER_FIELD = /(CPF|REGISTRO GERAL|^RG(?:\s|$)|CNS|PIS|NIS|NIT|CTPS|TELEFONE|CELULAR|ENEM INSCRICAO|ENEM INSCRIÇÃO|TITULAR NI|PESSOA NI)/iu;

export function parsePersonSourceLine(line: string): ParsedPersonSource | undefined {
  const match = line.trim().match(/^(.+?)\s*\{(.*)\}\s*$/u);
  if (!match) return undefined;
  return { fullName: match[1].trim(), raw: match[2].trim() };
}

export function getBirthYear(raw: string): number | undefined {
  const match = raw.match(/(?:DATA\s+)?NASCIMENTO:\s*\d{2}\/\d{2}\/(\d{4})/iu);
  if (!match) return undefined;
  const value = Number(match[1]);
  return Number.isInteger(value) ? value : undefined;
}

export function maskLastTwoDigits(value: string): string {
  const chars = [...value];
  const digitIndexes = chars.flatMap((char, index) => (/\d/u.test(char) ? [index] : []));
  for (const index of digitIndexes.slice(-2)) chars[index] = "*";
  return chars.join("");
}

function cleanLabel(label: string): string {
  return label.replace(/^\[\d+\]\s*/u, "").trim();
}

function cleanValue(value: string): string {
  return value.replace(/\s+/gu, " ").trim();
}

function parseChunkItems(chunk: string): ProfileItem[] {
  const segments = chunk.split("•").map((segment) => segment.trim()).filter(Boolean);
  const items: ProfileItem[] = [];

  for (const segment of segments) {
    const colonIndex = segment.indexOf(":");
    if (colonIndex > 0) {
      const label = cleanLabel(segment.slice(0, colonIndex));
      const value = cleanValue(segment.slice(colonIndex + 1));
      if (label && value) items.push({ label, value });
      continue;
    }

    const withoutIndex = segment.replace(/^\[\d+\]\s*/u, "").trim();
    if (/^(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?\d[\d\s-]{7,}$/u.test(withoutIndex)) {
      items.push({ label: "TELEFONE", value: cleanValue(withoutIndex) });
    } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(withoutIndex)) {
      items.push({ label: "EMAIL", value: cleanValue(withoutIndex) });
    } else if (/^(?:AVENIDA|RUA|ALAMEDA|RODOVIA|ESTRADA)\b/iu.test(withoutIndex)) {
      items.push({ label: "ENDEREÇO", value: cleanValue(withoutIndex) });
    }
  }

  return items;
}

function familyStartIndex(items: ProfileItem[]): number {
  return items.findIndex((item) => {
    if (!/^(?:TIPO|LABEL)$/iu.test(item.label)) return false;
    return FAMILY_RELATION.test(item.value);
  });
}

function sectionFor(label: string): Pick<SectionDefinition, "id" | "title"> {
  return SECTION_DEFINITIONS.find((definition) => definition.matches.test(label))
    ?? { id: "other", title: "Outros dados" };
}

export function buildProfileSections(raw: string): ProfileSection[] {
  const grouped = new Map<string, ProfileSection>();
  const chunks = raw.split(/▸/u);

  chunks.forEach((rawChunk) => {
    const chunk = rawChunk.split(/「💉」|VACINAS\s*\(\d+\)/iu)[0];
    const parsedItems = parseChunkItems(chunk);
    const familyIndex = familyStartIndex(parsedItems);
    const items = familyIndex >= 0 ? parsedItems.slice(0, familyIndex) : parsedItems;
    const isVaccineChunk = items.some((item) => /VACINA/iu.test(item.label));
    if (isVaccineChunk) return;
    const hasHealthContext = items.some((item) => /CNS/iu.test(item.label))
      || /SISTEMA ÚNICO DE SAÚDE|SISTEMA UNICO DE SAUDE/iu.test(chunk);

    for (const item of items) {
      if (DIRECT_FAMILY_FIELD.test(item.label) || HEALTH_FIELD.test(item.label)) continue;
      if (hasHealthContext && HEALTH_CONTEXT_FIELD.test(item.label)) continue;
      if (!item.value || NULL_LIKE.test(item.value)) continue;

      const section = sectionFor(item.label);
      const existing = grouped.get(section.id) ?? { ...section, items: [] };
      existing.items.push({
        label: item.label,
        value: IDENTIFIER_FIELD.test(item.label) ? maskLastTwoDigits(item.value) : item.value,
      });
      grouped.set(section.id, existing);
    }
  });

  const order = [...SECTION_DEFINITIONS.map((definition) => definition.id), "other"];
  return order.flatMap((id) => {
    const section = grouped.get(id);
    return section && section.items.length > 0 ? [section] : [];
  });
}
