import type { Langue, MenuItem, TraductionPlat } from "@/types/menu";

/**
 * La carte dans la langue du client.
 *
 * Règle unique : on n'affiche une traduction que si elle correspond au
 * texte français actuel. Un plat corrigé en français et pas en anglais
 * repasse en français plutôt que d'afficher l'ancienne version — mieux vaut
 * une carte bilingue en apparence qu'une carte qui ment sur ce qu'il y a
 * dans l'assiette.
 */

export function traductionDe(
  item: MenuItem,
  langue: Langue,
): TraductionPlat | null {
  if (langue === "fr") return null;
  return item.traductions?.[langue] ?? null;
}

/** La traduction existe-t-elle, et colle-t-elle encore au français ? */
export function traductionAJour(item: MenuItem, langue: Langue): boolean {
  const traduction = traductionDe(item, langue);
  if (!traduction) return false;
  return (
    traduction.source.nom === item.nom &&
    (traduction.source.description ?? null) === (item.description ?? null) &&
    traduction.source.categorie === item.categorie
  );
}

/** Traduite autrefois, mais le français a changé depuis. */
export function traductionCaduque(item: MenuItem, langue: Langue): boolean {
  return traductionDe(item, langue) !== null && !traductionAJour(item, langue);
}

export type PlatAffiche = {
  nom: string;
  description: string | null;
  categorie: string;
};

/** Le plat tel qu'il s'affiche, avec repli sur le français. */
export function platAffiche(item: MenuItem, langue: Langue): PlatAffiche {
  if (traductionAJour(item, langue)) {
    const traduction = traductionDe(item, langue)!;
    return {
      nom: traduction.nom,
      description: traduction.description,
      categorie: traduction.categorie,
    };
  }
  return {
    nom: item.nom,
    description: item.description,
    categorie: item.categorie,
  };
}

/**
 * Faut-il proposer l'anglais au client ? Seulement si la carte est
 * réellement traduite — un sélecteur de langue qui renvoie du français est
 * une déception, pas une fonctionnalité. Un plat ou deux non traduits sur
 * vingt ne justifient pas de cacher le bouton, la majorité suffit.
 */
export function langueDisponible(items: MenuItem[], langue: Langue): boolean {
  if (langue === "fr") return true;
  const visibles = items.filter((item) => item.actif);
  if (visibles.length === 0) return false;
  const traduits = visibles.filter((item) => traductionAJour(item, langue));
  return traduits.length * 2 >= visibles.length;
}

/** Ce qu'il reste à traduire : jamais traduit, ou traduit puis modifié. */
export function aTraduire(items: MenuItem[], langue: Langue): MenuItem[] {
  return items.filter((item) => !traductionAJour(item, langue));
}

export function lireLangue(brut: string | undefined): Langue {
  return brut === "en" ? "en" : "fr";
}
