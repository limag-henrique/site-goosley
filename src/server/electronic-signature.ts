const declaration = {
  key: "a8f9c2d1-e4b7-4a3d-9c1f-8e2b5d6a7c9f",
  issuedAt: "22/10/2026 10:36:33",
  expiresAt: "22/10/2027 00:00:00",
  patient: {
    name: "Miguel Eduardo Silveira Ofeman Verri",
    birthDate: "23/12/2004",
    cpf: "461.109.268-25",
  },
  physician: {
    name: "Dr. Guilherme Marques",
    specialty: "Neurologista",
    registration: "CRM-MG 56888",
  },
} as const;

export function findDeclaration(key: string) {
  return key === declaration.key ? declaration : undefined;
}
