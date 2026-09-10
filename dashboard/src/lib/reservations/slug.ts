// Adresse publique lisible : « Prost — Bastille ! » devient « prost-bastille ».
export function slugifier(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Ajoute un suffixe tant que le slug est pris. Deux « Le Bistrot » peuvent
 * exister dans deux villes : le second devient « le-bistrot-2 ».
 */
export function slugDisponible(
  base: string,
  estPris: (candidat: string) => boolean,
): string {
  const racine = base || "restaurant";
  if (!estPris(racine)) return racine;
  for (let suffixe = 2; suffixe < 100; suffixe += 1) {
    const candidat = `${racine}-${suffixe}`;
    if (!estPris(candidat)) return candidat;
  }
  // Cent homonymes : on bascule sur un suffixe aléatoire plutôt que
  // d'échouer.
  return `${racine}-${Math.random().toString(36).slice(2, 7)}`;
}
