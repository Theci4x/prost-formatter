import {
  cheminJournal,
  type Billet,
  type LangueJournal,
  type TraductionBillet,
} from "@/types/blog";
import { billetParSlug, tousLesBillets } from "@/lib/blog/billets";

import { traduction as ouvrirChecklistEn } from "@/contenu/blog/traductions/en/ouvrir-un-restaurant-checklist";
import { traduction as ouvrirChecklistZh } from "@/contenu/blog/traductions/zh/ouvrir-un-restaurant-checklist";

/**
 * Le journal dans les autres langues.
 *
 * Une traduction n'est pas un affichage : c'est un article, à son adresse,
 * qui s'indexe pour lui-même. Quelqu'un qui ouvre un restaurant en France
 * sans lire le français cherche « opening a restaurant in France », pas
 * « ouvrir un restaurant » — et c'est pour lui que ces pages existent.
 *
 * Elles sont rangées par slug français, qui fait foi : c'est lui qui porte
 * la rubrique, les dates, les sources et les liens de suite. Un article
 * non traduit n'apparaît tout simplement pas dans sa langue, plutôt que de
 * s'y montrer en français — une page à moitié traduite dessert les deux
 * lecteurs et se fait déclasser comme contenu mince.
 *
 * L'import est explicite, comme pour les billets : une traduction qu'on
 * oublie de brancher se remarque ici, pas six mois plus tard.
 */
const TRADUCTIONS: Record<
  Exclude<LangueJournal, "fr">,
  Record<string, TraductionBillet>
> = {
  en: {
    "ouvrir-un-restaurant-demarches": ouvrirChecklistEn,
  },
  zh: {
    "ouvrir-un-restaurant-demarches": ouvrirChecklistZh,
  },
};

/** Un billet tel qu'il se lit dans une langue, ou rien s'il n'y existe pas. */
export function billetPour(
  slugFrancais: string,
  langue: LangueJournal,
): Billet | null {
  const billet = billetParSlug(slugFrancais);
  if (!billet) return null;
  if (langue === "fr") return billet;

  const traduite = TRADUCTIONS[langue][slugFrancais];
  if (!traduite) return null;

  return {
    ...billet,
    slug: traduite.slug,
    titre: traduite.titre,
    resume: traduite.resume,
    essentiel: traduite.essentiel ?? billet.essentiel,
    markdown: traduite.markdown,
    // Les intitulés de textes de loi restent en français : les traduire
    // empêcherait de les retrouver. Une traduction peut en ajouter.
    sources: [...billet.sources, ...(traduite.sources ?? [])],
  };
}

/** Tout ce qui existe dans une langue, du plus récent au plus ancien. */
export function billetsPour(langue: LangueJournal): Billet[] {
  if (langue === "fr") return tousLesBillets();
  return tousLesBillets()
    .map((billet) => billetPour(billet.slug, langue))
    .filter((billet): billet is Billet => billet !== null);
}

/** Le slug français derrière une adresse traduite. */
export function slugFrancaisDepuis(
  slugTraduit: string,
  langue: LangueJournal,
): string | null {
  if (langue === "fr") return slugTraduit;
  const trouve = Object.entries(TRADUCTIONS[langue]).find(
    ([, traduite]) => traduite.slug === slugTraduit,
  );
  return trouve?.[0] ?? null;
}

/** L'adresse d'un article dans une langue, ou rien s'il n'y est pas traduit. */
export function adressePour(
  slugFrancais: string,
  langue: LangueJournal,
): string | null {
  if (langue === "fr") {
    return billetParSlug(slugFrancais)
      ? `/blog/${slugFrancais}`
      : null;
  }
  const traduite = TRADUCTIONS[langue][slugFrancais];
  return traduite ? `${cheminJournal(langue)}/${traduite.slug}` : null;
}

/**
 * Les liens du texte, réécrits vers la bonne langue.
 *
 * Les traductions gardent les slugs français dans leurs liens internes,
 * volontairement : elles restent justes à mesure que d'autres articles se
 * traduisent, sans qu'on ait à les rouvrir. Ici, chaque lien part vers la
 * version traduite quand elle existe — et perd son lien, en gardant son
 * texte, quand elle n'existe pas encore. Renvoyer un lecteur anglophone
 * vers une page française serait une impasse annoncée comme une piste.
 */
export function reecrireLiens(
  markdown: string,
  langue: LangueJournal,
): string {
  if (langue === "fr") return markdown;
  return markdown.replace(
    /\[([^\]]+)\]\(\/blog\/([a-z0-9-]+)\)/g,
    (entier, texte: string, slug: string) => {
      const adresse = adressePour(slug, langue);
      return adresse ? `[${texte}](${adresse})` : texte;
    },
  );
}

/**
 * Les langues où cet article existe, pour le sélecteur et pour `hreflang`.
 * Le français y est toujours : c'est l'original.
 */
export function languesDe(slugFrancais: string): LangueJournal[] {
  const langues: LangueJournal[] = ["fr"];
  for (const langue of ["en", "zh"] as const) {
    if (TRADUCTIONS[langue][slugFrancais]) langues.push(langue);
  }
  return langues;
}

/**
 * Les adresses d'un même article dans toutes ses langues, telles que
 * `hreflang` les veut. Sans ce balisage, Google traite deux traductions
 * comme deux pages sans rapport, et n'en montre qu'une.
 */
export function alternatives(
  slugFrancais: string,
): Partial<Record<LangueJournal, string>> {
  const sortie: Partial<Record<LangueJournal, string>> = {};
  for (const langue of languesDe(slugFrancais)) {
    const adresse = adressePour(slugFrancais, langue);
    if (adresse) sortie[langue] = adresse;
  }
  return sortie;
}
