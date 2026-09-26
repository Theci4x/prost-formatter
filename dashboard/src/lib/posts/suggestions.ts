import type { Bouton } from "@/lib/posts/regles";

/**
 * De quoi partir, plutôt que de la page blanche.
 *
 * C'est ce qui sépare Klarr d'un outil de planification générique : ceux-
 * là ouvrent un champ vide et demandent de tout retaper — le nom du plat,
 * sa description, la photo. Klarr connaît déjà la carte, les espaces, les
 * photos. Une publication doit donc se composer en un clic à partir de ce
 * qui est déjà saisi.
 *
 * Rien n'est inventé ici, et c'est délibéré. Pas d'appel à une IA : le
 * texte reprend les mots du restaurateur, ceux de sa propre carte. Ils
 * sonnent juste parce qu'ils sont de lui, ils sont instantanés, et ils ne
 * coûtent rien. Le texte proposé reste un point de départ qu'on modifie.
 */

export type Suggestion = {
  cle: string;
  /** Ce qu'on lit sur la pastille : « Le tartare de bœuf ». */
  libelle: string;
  texte: string;
  bouton: Bouton | null;
};

export type PlatSuggerable = {
  id: string;
  nom: string;
  description: string | null;
  prix_centimes: number | null;
};

export type EspaceSuggerable = {
  id: string;
  nom: string;
  description: string | null;
  capacite: number;
  privatisation_minimum: number | null;
};

function euros(centimes: number): string {
  return centimes % 100 === 0
    ? `${centimes / 100} €`
    : `${(centimes / 100).toFixed(2).replace(".", ",")} €`;
}

/**
 * Une phrase, ponctuée comme on ponctue en français.
 *
 * Le point et la virgule se collent au mot ; le point d'interrogation,
 * celui d'exclamation, le point-virgule et les deux-points demandent une
 * espace avant. Une espace insécable, pour qu'un « ? » ne se retrouve pas
 * seul en début de ligne — un post s'affiche sur des écrans étroits.
 */
function phrase(...morceaux: (string | null | undefined)[]): string {
  return morceaux
    .map((m) => m?.trim())
    .filter((m): m is string => Boolean(m))
    .join(" ")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,])/g, "$1")
    .replace(/\s*([;:!?])/g, "\u202f$1")
    .trim();
}

function suggestionPlat(plat: PlatSuggerable): Suggestion {
  const prix =
    plat.prix_centimes !== null ? `${euros(plat.prix_centimes)}.` : "";
  return {
    cle: `plat:${plat.id}`,
    libelle: plat.nom,
    texte: phrase(
      `${plat.nom} —`,
      plat.description
        ? `${plat.description.replace(/\.?$/, ".")}`
        : "À la carte cette semaine.",
      prix,
      "On vous garde une table ?",
    ),
    bouton: "reserver",
  };
}

function suggestionEspace(espace: EspaceSuggerable): Suggestion {
  const combien =
    espace.privatisation_minimum !== null
      ? `à partir de ${espace.privatisation_minimum} personnes`
      : `jusqu'à ${espace.capacite} personnes`;
  return {
    cle: `espace:${espace.id}`,
    libelle: espace.nom,
    texte: phrase(
      `Vous cherchez un endroit pour un anniversaire, un départ, un déjeuner d'équipe ?`,
      `${espace.nom} se privatise, ${combien}.`,
      espace.description ? `${espace.description.replace(/\.?$/, ".")}` : "",
      "Écrivez-nous pour les disponibilités.",
    ),
    bouton: "en_savoir_plus",
  };
}

/**
 * Ce qu'on propose de publier, dans l'ordre où ça se pense.
 *
 * Les plats d'abord : c'est ce qui change le plus souvent, donc ce qu'on
 * publie toutes les semaines. Les espaces ensuite : on ne les annonce pas
 * chaque lundi, mais leur oubli coûte cher. Et seulement ceux qui se
 * privatisent — proposer d'annoncer une salle qui ne se loue pas
 * ferait perdre du temps.
 */
export function suggestions(
  plats: PlatSuggerable[],
  espaces: EspaceSuggerable[],
  combien = 6,
): Suggestion[] {
  // Dans l'ordre de la carte : c'est celui que le restaurateur a choisi,
  // et il place devant ce qu'il veut vendre. La photo du plat, elle, ne
  // peut pas servir ici — elle vit sur la fiche du plat, pas dans la
  // galerie où le post va chercher la sienne.
  const privatisables = espaces.filter(
    (espace) => espace.privatisation_minimum !== null,
  );

  return [
    ...plats.map(suggestionPlat),
    ...privatisables.map(suggestionEspace),
  ].slice(0, combien);
}
