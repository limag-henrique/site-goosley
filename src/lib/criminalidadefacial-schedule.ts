// 16h55 de 29/09/2026 no horário de Brasília (UTC−03:00).
export const CRIMINALIDADE_FACIAL_DEACTIVATION_AT = Date.parse("2026-09-29T16:55:00-03:00");

export function isCriminalidadeFacialDeactivated(now = Date.now()): boolean {
  return now >= CRIMINALIDADE_FACIAL_DEACTIVATION_AT;
}
