/**
 * Structured person data parsed from pessoas.txt.
 * Each person has a display name and a raw profile string with their details.
 */

export type PersonProfile = {
  /** Full display name (e.g. "Adler Guilherme Furtado Faria") */
  fullName: string;
  /** First name for autocomplete */
  firstName: string;
  /** Last name(s) for autocomplete */
  lastName: string;
  /** Parsed profile fields */
  fields: Record<string, string>;
  /** Raw data string (everything inside {}) */
  raw: string;
};

function parseFields(raw: string): Record<string, string> {
  const fields: Record<string, string> = {};
  // Extract the primary bullet-point fields (• KEY: VALUE)
  const primary = raw.match(/•\s*([^•▸「]+)/g);
  if (!primary) return fields;
  for (const segment of primary) {
    const clean = segment.replace(/^•\s*/, "").trim();
    const colonIdx = clean.indexOf(":");
    if (colonIdx === -1) continue;
    const key = clean.slice(0, colonIdx).trim();
    const value = clean.slice(colonIdx + 1).trim();
    // Only keep the first occurrence of each key (top-level fields)
    if (!fields[key] && value) {
      fields[key] = value;
    }
  }
  return fields;
}

export const PEOPLE: PersonProfile[] = [
  {
    fullName: "Adler Guilherme Furtado Faria",
    firstName: "Adler",
    lastName: "Furtado Faria",
    raw: "NOME: ADLER GUILHERME FURTADO FARIA • CPF: 15024519647 • NASCIMENTO: 26/04/2003 • SEXO: MASCULINO • ESTADO CIVIL: SOLTEIRO • NATURALIDADE: BELO HORIZONTE - MG • MÃE: ROSEMARY APARECIDA FURTADO FARIA • PAI: BRENO GIOVANNI DAMASCENO FARIA • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "Andre Felipe de Assis Rodrigues",
    firstName: "Andre",
    lastName: "de Assis Rodrigues",
    raw: "NOME: ANDRE FELIPE DE ASSIS RODRIGUES • CPF: 15555435614 • NASCIMENTO: 09/10/2000 • SEXO: MASCULINO • ESTADO CIVIL: SOLTEIRO • NATURALIDADE: BELO HORIZONTE - MG • UF: MG • RENDA: R$ 900.00 • MÃE: LUCIENE MARIA DE ASSIS RODRIGUES • PAI: MARCOS RODRIGUES SILVA • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "Augusto Guerra de Lima",
    firstName: "Augusto",
    lastName: "Guerra de Lima",
    raw: "NOME: AUGUSTO GUERRA DE LIMA • CPF: 14252820677 • NASCIMENTO: 18/04/2003 • SEXO: MASCULINO • NATURALIDADE: NOVA LIMA - MG • MÃE: LUCIENE GUERRA DA SILVA • PAI: MARCOS WELINGTON DE LIMA • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "Bernardo Borges Machado",
    firstName: "Bernardo",
    lastName: "Borges Machado",
    raw: "NOME: BERNARDO BORGES MACHADO • CPF: 70126403678 • NASCIMENTO: 04/12/2004 • SEXO: MASCULINO • MÃE: ANA LUIZA COSTA CRUZ BORGES • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "Bruno Lopes Melo Fonseca",
    firstName: "Bruno",
    lastName: "Lopes Melo Fonseca",
    raw: "NOME: BRUNO LOPES MELO FONSECA • CPF: 16000041640 • NASCIMENTO: 29/08/2003 • SEXO: MASCULINO • ESTADO CIVIL: SOLTEIRO • NATURALIDADE: BELO HORIZONTE - MG • MÃE: ELISA MARIA LOPES FONSECA • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "Caio Cordeiro Fabri",
    firstName: "Caio",
    lastName: "Cordeiro Fabri",
    raw: "CPF: 13595583655 • NOME: CAIO CORDEIRO FABRI • DATA NASCIMENTO: 19/07/2004 • SEXO: MASCULINO • ESTADO CIVIL: SOLTEIRO • NATURALIDADE: FREI INOCENCIO - MG • NACIONALIDADE: BRASILEIRO • MÃE: LUIZA DE MARILLAC CORDEIRO • PAI: ANGELO WAKABAYASHI FABRI",
    fields: {},
  },
  {
    fullName: "Christian Rodrigues de Oliveira",
    firstName: "Christian",
    lastName: "Rodrigues de Oliveira",
    raw: "",
    fields: {},
  },
  {
    fullName: "Clarice Oliveira Minobolli Teixeira",
    firstName: "Clarice",
    lastName: "Oliveira Minobolli Teixeira",
    raw: "NOME: CLARICE OLIVEIRA MINOBOLLI TEIXEIRA • CPF: 12626865630 • NASCIMENTO: 17/09/2004 • SEXO: FEMININO • NATURALIDADE: PORTO VELHO - RO • MÃE: PATRICIA MAURA MIRANDA DE OLIVEIRA • PAI: CESAR AUGUSTO DOMINGUES TEIXEIRA • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "Davi Oliveira Sad",
    firstName: "Davi",
    lastName: "Oliveira Sad",
    raw: "CPF: 11292668695 • NOME: DAVI OLIVEIRA SAD • DATA NASCIMENTO: 09/06/2005 • SEXO: MASCULINO • ESTADO CIVIL: SOLTEIRO • NATURALIDADE: BELO HORIZONTE - MG • NACIONALIDADE: BRASILEIRO • MÃE: SIMONE PAULINO DE OLIVEIRA SAD • PAI: NÃO INFORMADO",
    fields: {},
  },
  {
    fullName: "Fabricio Benevenuto de Souza",
    firstName: "Fabricio",
    lastName: "Benevenuto de Souza",
    raw: "CPF: 04642322604 • NOME: FABRICIO BENEVENUTO DE SOUZA • DATA NASCIMENTO: 20/11/1980 • SEXO: MASCULINO • ESTADO CIVIL: SOLTEIRO • NATURALIDADE: PARA DE MINAS - MG • NACIONALIDADE: BRASILEIRO • SERVIDOR PÚBLICO: True • MÃE: ALILAS TEODORA DE SOUZA • PAI: JOSE ORLANDO DE SOUZA",
    fields: {},
  },
  {
    fullName: "Felipe Araujo Melo",
    firstName: "Felipe",
    lastName: "Araujo Melo",
    raw: "",
    fields: {},
  },
  {
    fullName: "Gabriel Alkmim Barros",
    firstName: "Gabriel",
    lastName: "Alkmim Barros",
    raw: "NOME: GABRIEL ALKMIM BARROS • CPF: 10825660637 • NASCIMENTO: 06/04/2003 • SEXO: MASCULINO • ESTADO CIVIL: SOLTEIRO • NATURALIDADE: BELO HORIZONTE - MG • MÃE: VIVIANE ALKMIM BARROS • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "Giordano Henrique Liporati",
    firstName: "Giordano",
    lastName: "Henrique Liporati",
    raw: "CPF: 15317418607 • NOME: GIORDANO HENRIQUE LIPORATI • DATA NASCIMENTO: 18/10/2003 • SEXO: MASCULINO • ESTADO CIVIL: SOLTEIRO • NATURALIDADE: NOVA LIMA - MG • NACIONALIDADE: BRASILEIRO • MÃE: CLEONICE FABRICIO FERREIRA LIPORATI • PAI: LEONARDO LIPORATI",
    fields: {},
  },
  {
    fullName: "Guilherme Ferreira Gomes",
    firstName: "Guilherme",
    lastName: "Ferreira Gomes",
    raw: "",
    fields: {},
  },
  {
    fullName: "Gustavo Henrique Martins Pereira",
    firstName: "Gustavo",
    lastName: "Henrique Martins Pereira",
    raw: "",
    fields: {},
  },
  {
    fullName: "Heitor Vignati do Carmo Maciel",
    firstName: "Heitor",
    lastName: "Vignati do Carmo Maciel",
    raw: "NOME: HEITOR VIGNATI DO CARMO MACIEL • CPF: 14642904743 • NASCIMENTO: 16/12/2003 • SEXO: MASCULINO • ESTADO CIVIL: SOLTEIRO • NATURALIDADE: LINHARES - ES • MÃE: VANILDA VIGNATI DO CARMO MACIEL • PAI: LUCIANO MARCIO MACIEL • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "Hugo Filipe da Silva Santos",
    firstName: "Hugo",
    lastName: "da Silva Santos",
    raw: "NOME: HUGO FILIPE DA SILVA SANTOS • CPF: 10128139676 • NASCIMENTO: 27/11/2006 • SEXO: MASCULINO • ESTADO CIVIL: SOLTEIRO • MÃE: MICHELLE CARINE DA SILVA • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "Joao Carlos Ferraz de Sousa",
    firstName: "Joao",
    lastName: "Ferraz de Sousa",
    raw: "NOME: JOAO CARLOS FERRAZ DE SOUSA • CPF: 08213938399 • NASCIMENTO: 04/07/2003 • SEXO: MASCULINO • ESTADO CIVIL: SOLTEIRO • NATURALIDADE: TERESINA - PI • MÃE: MARIA DAS MERCES MARTINS FERRAZ • PAI: NADA CONSTA • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "Joao Gabriel Guimaraes Alves Vaz",
    firstName: "Joao",
    lastName: "Guimaraes Alves Vaz",
    raw: "NOME: JOAO GABRIEL GUIMARAES ALVES VAZ • CPF: 05389743113 • NASCIMENTO: 05/03/2004 • SEXO: MASCULINO • ESTADO CIVIL: SOLTEIRO • NATURALIDADE: SAO PAULO - SP • MÃE: GABRIELLA GUIMARAES ALVES • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "João Marcos de Sousa Rezende",
    firstName: "João",
    lastName: "de Sousa Rezende",
    raw: "NOME: JOAO MARCOS DE SOUSA REZENDE • CPF: 01648658610 • NASCIMENTO: 01/09/2003 • SEXO: MASCULINO • ESTADO CIVIL: SOLTEIRO • NATURALIDADE: NOVA LIMA - MG • MÃE: TANIA REGINA DE SOUSA REZENDE • PAI: SEM INFORMAÇÃO • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "Jose Gabriel Silva",
    firstName: "Jose",
    lastName: "Gabriel Silva",
    raw: "",
    fields: {},
  },
  {
    fullName: "Julia Borba Fonseca de Souza",
    firstName: "Julia",
    lastName: "Borba Fonseca de Souza",
    raw: "NOME: JULIA BORBA FONSECA DE SOUZA • CPF: 14975243695 • NASCIMENTO: 12/05/2005 • SEXO: FEMININO • NATURALIDADE: SETE LAGOAS - MG • MÃE: MARCILEIA BORBA FONSECA DE SOUZA • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "Kauan Teixeira Pereira",
    firstName: "Kauan",
    lastName: "Teixeira Pereira",
    raw: "NOME: KAUAN TEIXEIRA PEREIRA • CPF: 14394360617 • NASCIMENTO: 03/01/2005 • SEXO: MASCULINO • ESTADO CIVIL: SOLTEIRO • NATURALIDADE: VICOSA - MG • MÃE: MONICA APARECIDA TEIXEIRA PEREIRA • PAI: MAURO LUCIO PEREIRA • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "Laura Martins Froede",
    firstName: "Laura",
    lastName: "Martins Froede",
    raw: "NOME: LAURA MARTINS FROEDE • CPF: 11996092693 • NASCIMENTO: 20/02/2004 • SEXO: FEMININO • MÃE: CRISTINA GOMES MARTINS FROEDE • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "Layla Raissa Silva Pereira",
    firstName: "Layla",
    lastName: "Silva Pereira",
    raw: "CPF: 01566654688 • NASCIMENTO: 07/04/2002 • SEXO: FEMININO • NATURALIDADE: BELO HORIZONTE - MG • UF: MG • RENDA: R$ 700.00 • ÚLTIMO SALÁRIO: R$ 917,58 (2024) • MÃE: PATRICIA MARIA DA SILVA PEREIRA • PAI: JURANDIR LEAL PEREIRA • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "Leonardo Cesar Cota de Castro",
    firstName: "Leonardo",
    lastName: "Cesar Cota de Castro",
    raw: "NOME: LEONARDO CESAR COTA DE CASTRO • CPF: 16529573674 • NASCIMENTO: 11/02/2005 • SEXO: MASCULINO • NATURALIDADE: BELO HORIZONTE - MG • MÃE: LEDA PINTO COTA • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "Leonardo Mendes Antero",
    firstName: "Leonardo",
    lastName: "Mendes Antero",
    raw: "NOME: LEONARDO MENDES ANTERO • CPF: 70206721676 • NASCIMENTO: 27/06/2005 • SEXO: MASCULINO • ESTADO CIVIL: SOLTEIRO • NATURALIDADE: NOVA LIMA - MG • MÃE: IVANIZIA DOS SANTOS MENDES • PAI: EDUARDO MENDES ANTERO • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "Luis Eduardo Limas Brito",
    firstName: "Luis",
    lastName: "Limas Brito",
    raw: "NOME: LUIS EDUARDO LIMAS BRITO • CPF: 13310154645 • NASCIMENTO: 04/01/2005 • SEXO: MASCULINO • ESTADO CIVIL: SOLTEIRO • NATURALIDADE: MONTES CLAROS - MG • MÃE: NEIVA DE FATIMA LIMAS BRITO • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "Luiz Felipe Gondim Araujo",
    firstName: "Luiz",
    lastName: "Gondim Araujo",
    raw: "CPF: 08257750514 • NOME: LUIZ FELIPE GONDIM ARAUJO • DATA NASCIMENTO: 20/05/2002 • SEXO: MASCULINO • ESTADO CIVIL: SOLTEIRO • NATURALIDADE: GUANAMBI - BA • NACIONALIDADE: BRASILEIRO • MÃE: ELIEDE PIMENTEL GONDIM • PAI: AILTON DE CASTRO ARAUJO • RENDA ATUAL: R$ 900.00",
    fields: {},
  },
  {
    fullName: "Mateus Amaral da Silva",
    firstName: "Mateus",
    lastName: "Amaral da Silva",
    raw: "",
    fields: {},
  },
  {
    fullName: "Mateus Mendes Alves Cabral",
    firstName: "Mateus",
    lastName: "Mendes Alves Cabral",
    raw: "NOME: MATEUS MENDES ALVES CABRAL • CPF: 15736215608 • NASCIMENTO: 09/01/2005 • SEXO: MASCULINO • ESTADO CIVIL: SOLTEIRO • NATURALIDADE: BETIM - MG • CIDADE: BELO HORIZONTE • UF: MG • RENDA: R$ 1567,50 • MÃE: JANE MENDES ALVES CABRAL • PAI: ADRIANO CABRAL • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "Mateus Ryan de Castro Lima",
    firstName: "Mateus",
    lastName: "Ryan de Castro Lima",
    raw: "NOME: MATEUS RYAN DE CASTRO LIMA • CPF: 13522575644 • NASCIMENTO: 31/03/2003 • SEXO: MASCULINO • ESTADO CIVIL: SOLTEIRO • NATURALIDADE: BELO HORIZONTE - MG • MÃE: FERNANDA MARTINS DE CASTRO LIMA • PAI: CLEBER DOS SANTOS LIMA • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "Matheus Muniz Vilas Boas",
    firstName: "Matheus",
    lastName: "Muniz Vilas Boas",
    raw: "NOME: MATHEUS MUNIZ VILAS BOAS • CPF: 13242251652 • NASCIMENTO: 07/09/2004 • SEXO: MASCULINO • ESTADO CIVIL: SOLTEIRO • NATURALIDADE: PARACATU - MG • MÃE: JANIANE ANGELA MUNIZ VILAS BOAS • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "Matheus Torres Prates",
    firstName: "Matheus",
    lastName: "Torres Prates",
    raw: "CPF: 13955281604 • NOME: MATHEUS TORRES PRATES • DATA NASCIMENTO: 25/11/2004 • SEXO: MASCULINO • ESTADO CIVIL: SOLTEIRO • NATURALIDADE: NOVA LIMA - MG • NACIONALIDADE: BRASILEIRO • MÃE: ANA PAULA REPOLES TORRES • PAI: NÃO INFORMADO",
    fields: {},
  },
  {
    fullName: "Natanael dos Santos Junior",
    firstName: "Natanael",
    lastName: "dos Santos Junior",
    raw: "",
    fields: {},
  },
  {
    fullName: "Nicolas Von Dolinger Moreira Rocha",
    firstName: "Nicolas",
    lastName: "Von Dolinger Moreira Rocha",
    raw: "NOME: NICOLAS VON DOLINGER MOREIRA ROCHA • CPF: 12136412680 • NASCIMENTO: 02/08/2003 • SEXO: MASCULINO • ESTADO CIVIL: SOLTEIRO • NATURALIDADE: SETE LAGOAS - MG • CIDADE: SETE LAGOAS • UF: MG • MÃE: MARGARETE MOREIRA DA FONSECA • PAI: HOARLEI GERALDO ROCHA • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "Rafael Vinicios de Santana Mathias",
    firstName: "Rafael",
    lastName: "de Santana Mathias",
    raw: "CPF: 17324608680 • NOME: RAFAEL VINICIOS DE SANTANA MATHIAS • DATA NASCIMENTO: 18/12/2005 • SEXO: MASCULINO • ESTADO CIVIL: SOLTEIRO • MÃE: JUNIA MARIA DE SANTANA • PAI: ROGERIO CEZAR MATHIAS • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "Samara Neto Martins Barbosa",
    firstName: "Samara",
    lastName: "Neto Martins Barbosa",
    raw: "NOME: SAMARA NETO MARTINS BARBOSA • CPF: 13970329604 • NASCIMENTO: 11/04/2006 • SEXO: FEMININO • MÃE: YANDIRA NETO CUSTODIO • SITUAÇÃO RFB: REGULAR",
    fields: {},
  },
  {
    fullName: "Thalita Fernanda Pires",
    firstName: "Thalita",
    lastName: "Fernanda Pires",
    raw: "CPF: 10543298698 • NOME: THALITA FERNANDA PIRES • SEXO: F • DATA NASCIMENTO: 24/11/2000 • NOME MÃE: NATALICE APARECIDA RAMOS COSTA",
    fields: {},
  },
];

// Auto-parse fields from raw strings
for (const p of PEOPLE) {
  p.fields = parseFields(p.raw);
  // Normalize some field names
  if (p.fields["DATA NASCIMENTO"] && !p.fields["NASCIMENTO"]) {
    p.fields["NASCIMENTO"] = p.fields["DATA NASCIMENTO"];
  }
  if (p.fields["NOME MÃE"] && !p.fields["MÃE"]) {
    p.fields["MÃE"] = p.fields["NOME MÃE"];
  }
  if (p.fields["NOME MAE"] && !p.fields["MÃE"]) {
    p.fields["MÃE"] = p.fields["NOME MAE"];
  }
  if (p.fields["NOME PAI"] && !p.fields["PAI"]) {
    p.fields["PAI"] = p.fields["NOME PAI"];
  }
}

/** Get all unique full names for autocomplete */
export function getAllNames(): string[] {
  return PEOPLE.map((p) => p.fullName);
}

/** Find a person by full name (case-insensitive) */
export function findPerson(fullName: string): PersonProfile | undefined {
  const normalized = fullName.trim().toLowerCase();
  return PEOPLE.find((p) => p.fullName.toLowerCase() === normalized);
}

/** Search people by partial name match */
export function searchPeople(query: string): PersonProfile[] {
  if (!query.trim()) return [];
  const q = query.trim().toLowerCase();
  return PEOPLE.filter((p) => p.fullName.toLowerCase().includes(q));
}

/** Display-friendly profile fields in order of importance */
export const DISPLAY_FIELDS = [
  { key: "NOME", label: "Nome completo" },
  { key: "CPF", label: "CPF" },
  { key: "NASCIMENTO", label: "Data de nascimento" },
  { key: "SEXO", label: "Sexo" },
  { key: "ESTADO CIVIL", label: "Estado civil" },
  { key: "NATURALIDADE", label: "Naturalidade" },
  { key: "NACIONALIDADE", label: "Nacionalidade" },
  { key: "UF", label: "UF" },
  { key: "CIDADE", label: "Cidade" },
  { key: "RENDA", label: "Renda" },
  { key: "RENDA ATUAL", label: "Renda atual" },
  { key: "RENDA ESTIMADA", label: "Renda estimada" },
  { key: "ÚLTIMO SALÁRIO", label: "Último salário" },
  { key: "PODER AQUISITIVO", label: "Poder aquisitivo" },
  { key: "FAIXA RENDA", label: "Faixa de renda" },
  { key: "MÃE", label: "Mãe" },
  { key: "PAI", label: "Pai" },
  { key: "SERVIDOR PÚBLICO", label: "Servidor público" },
  { key: "SITUAÇÃO RFB", label: "Situação RFB" },
] as const;
