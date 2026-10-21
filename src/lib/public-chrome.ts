export function isImmersiveRoute(pathname: string): boolean {
  return pathname === "/pesquisa-musical" || pathname.startsWith("/pesquisa-musical/") || pathname === "/criminalidadefacial" || pathname.startsWith("/criminalidadefacial/");
}
