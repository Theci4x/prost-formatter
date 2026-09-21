import type { Format, MenuItem } from "@/types/menu";

/**
 * La carte : la mettre dans l'ordre, et la montrer.
 *
 * Une règle unique porte tout le fichier : les catégories s'affichent dans
 * l'ordre de leur premier plat. Pas de table de catégories à maintenir à
 * part, pas de tri alphabétique qui sortirait « Desserts, Entrées, Plats ».
 * Le restaurateur déplace un plat ou un bloc entier, et l'ordre suit.
 */

export type Sens = "haut" | "bas";

export type Bloc = {
  categorie: string;
  plats: MenuItem[];
};

function parOrdre(a: MenuItem, b: MenuItem): number {
  if (a.ordre !== b.ordre) return a.ordre - b.ordre;
  // Deux plats à la même position : l'ancienneté départage, sans quoi la
  // carte se réorganiserait toute seule d'un affichage à l'autre.
  return a.created_at.localeCompare(b.created_at);
}

/** La carte en blocs, prête à afficher. */
export function carteOrganisee(items: MenuItem[]): Bloc[] {
  const tries = [...items].sort(parOrdre);
  const blocs: Bloc[] = [];
  for (const plat of tries) {
    const dernier = blocs.find((bloc) => bloc.categorie === plat.categorie);
    if (dernier) dernier.plats.push(plat);
    else blocs.push({ categorie: plat.categorie, plats: [plat] });
  }
  return blocs;
}

/** Ce que le client voit : les plats décrochés n'y sont pas. */
export function carteVisible(items: MenuItem[]): MenuItem[] {
  return items.filter((item) => item.actif);
}

/** La position à donner au prochain plat ajouté. */
export function prochainOrdre(items: MenuItem[]): number {
  return items.reduce((max, item) => Math.max(max, item.ordre), 0) + 1;
}

/** « 12,50 € », ou rien quand le prix ne s'affiche pas. */
export function formatPrix(centimes: number | null): string {
  if (centimes === null) return "";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(centimes / 100);
}

/**
 * Un prix en euros tapé à la main, rendu en centimes. Accepte la virgule
 * comme le point et les espaces des milliers : on écrit « 12,50 », pas
 * « 1250 ». Renvoie undefined quand la saisie n'est pas un prix — à
 * distinguer de null, qui est un prix volontairement absent.
 */
export function enCentimes(brut: string): number | null | undefined {
  const propre = brut.replace(/[\s  €]/g, "").replace(",", ".");
  if (!propre) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(propre)) return undefined;
  return Math.round(Number(propre) * 100);
}

/**
 * Les formats d'un plat, ou rien.
 *
 * On ne renvoie un tableau que s'il est réellement rempli : une colonne
 * à `[]` — que la base refuse, mais qu'une lecture peut produire — doit
 * se comporter comme une absence, pas comme un plat sans aucun prix.
 */
export function formatsDe(item: { formats: Format[] | null }): Format[] | null {
  const formats = item.formats;
  if (!Array.isArray(formats) || formats.length === 0) return null;
  return formats;
}

/**
 * Les formats mis bout à bout : « 6 pièces 9,50 € · 12 pièces 17,00 € ».
 *
 * Les libellés peuvent venir d'une traduction ; on les prend alors dans
 * l'ordre des formats, et on retombe sur le français dès qu'il en manque
 * un. Une carte anglaise où seul le deuxième format serait traduit se
 * lirait plus mal qu'une carte entièrement française.
 */
export function formatsLisibles(
  formats: Format[],
  libelles?: string[],
): string {
  const traduits =
    libelles && libelles.length === formats.length && libelles.every(Boolean)
      ? libelles
      : null;
  return formats
    .map(
      (format, rang) =>
        `${traduits ? traduits[rang] : format.libelle} ${formatPrix(format.prix_centimes)}`,
    )
    .join(" · ");
}

export type Repositionnement = { id: string; ordre: number };

/**
 * Renumérote la carte de 1 à n dans l'ordre donné, et ne renvoie que ce qui
 * a bougé : une carte de quarante plats ne doit pas produire quarante
 * écritures parce qu'on a monté une entrée d'un cran.
 */
function renumeroter(plats: MenuItem[]): Repositionnement[] {
  return plats
    .map((plat, index) => ({ id: plat.id, ordre: index + 1 }))
    .filter((pos, index) => plats[index].ordre !== pos.ordre);
}

function aplatir(blocs: Bloc[]): MenuItem[] {
  return blocs.flatMap((bloc) => bloc.plats);
}

/**
 * Monter ou descendre un plat, à l'intérieur de sa catégorie. Un plat ne
 * change pas de catégorie en se déplaçant : « Tarte Tatin » qui glisserait
 * dans les entrées serait une surprise, pas un service rendu.
 */
export function deplacerPlat(
  items: MenuItem[],
  id: string,
  sens: Sens,
): Repositionnement[] {
  const blocs = carteOrganisee(items);
  const bloc = blocs.find((b) => b.plats.some((plat) => plat.id === id));
  if (!bloc) return [];

  const index = bloc.plats.findIndex((plat) => plat.id === id);
  const voisin = sens === "haut" ? index - 1 : index + 1;
  if (voisin < 0 || voisin >= bloc.plats.length) return [];

  const suite = [...bloc.plats];
  [suite[index], suite[voisin]] = [suite[voisin], suite[index]];
  bloc.plats = suite;

  return renumeroter(aplatir(blocs));
}

/** Monter ou descendre une catégorie entière, plats compris. */
export function deplacerCategorie(
  items: MenuItem[],
  categorie: string,
  sens: Sens,
): Repositionnement[] {
  const blocs = carteOrganisee(items);
  const index = blocs.findIndex((bloc) => bloc.categorie === categorie);
  if (index === -1) return [];

  const voisin = sens === "haut" ? index - 1 : index + 1;
  if (voisin < 0 || voisin >= blocs.length) return [];

  [blocs[index], blocs[voisin]] = [blocs[voisin], blocs[index]];
  return renumeroter(aplatir(blocs));
}
