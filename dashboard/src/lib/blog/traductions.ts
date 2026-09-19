import {
  cheminJournal,
  type Billet,
  type LangueJournal,
  type TraductionBillet,
} from "@/types/blog";
import { billetParSlug, tousLesBillets } from "@/lib/blog/billets";

import { traduction as ouvrirChecklistEn } from "@/contenu/blog/traductions/en/ouvrir-un-restaurant-checklist";
import { traduction as permisLicenceEn } from "@/contenu/blog/traductions/en/permis-exploitation-licence";
import { traduction as declarationSanitaireEn } from "@/contenu/blog/traductions/en/declaration-sanitaire-ddpp";
import { traduction as haccpEn } from "@/contenu/blog/traductions/en/haccp-pms";
import { traduction as erpEn } from "@/contenu/blog/traductions/en/erp-commission-securite";
import { traduction as avantTravauxEn } from "@/contenu/blog/traductions/en/avant-travaux-diagnostics";
import { traduction as terrasseEn } from "@/contenu/blog/traductions/en/terrasse";
import { traduction as sacemSpreEn } from "@/contenu/blog/traductions/en/sacem-spre";
import { traduction as impactSonoreEn } from "@/contenu/blog/traductions/en/etude-impact-sonore";
import { traduction as chantierEn } from "@/contenu/blog/traductions/en/chantier-obligations-employeur";
import { traduction as ouvrirChecklistZh } from "@/contenu/blog/traductions/zh/ouvrir-un-restaurant-checklist";
import { traduction as permisLicenceZh } from "@/contenu/blog/traductions/zh/permis-exploitation-licence";
import { traduction as declarationSanitaireZh } from "@/contenu/blog/traductions/zh/declaration-sanitaire-ddpp";
import { traduction as haccpZh } from "@/contenu/blog/traductions/zh/haccp-pms";
import { traduction as erpZh } from "@/contenu/blog/traductions/zh/erp-commission-securite";
import { traduction as avantTravauxZh } from "@/contenu/blog/traductions/zh/avant-travaux-diagnostics";
import { traduction as terrasseZh } from "@/contenu/blog/traductions/zh/terrasse";
import { traduction as sacemSpreZh } from "@/contenu/blog/traductions/zh/sacem-spre";
import { traduction as impactSonoreZh } from "@/contenu/blog/traductions/zh/etude-impact-sonore";
import { traduction as chantierZh } from "@/contenu/blog/traductions/zh/chantier-obligations-employeur";

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
    "permis-exploitation-licence-restaurant": permisLicenceEn,
    "declaration-sanitaire-restaurant-ddpp": declarationSanitaireEn,
    "haccp-plan-maitrise-sanitaire-restaurant": haccpEn,
    "erp-restaurant-categorie-commission-securite": erpEn,
    "diagnostics-avant-travaux-restaurant": avantTravauxEn,
    "terrasse-restaurant-autorisation-domaine-public": terrasseEn,
    "sacem-spre-restaurant-musique": sacemSpreEn,
    "etude-impact-nuisances-sonores-restaurant": impactSonoreEn,
    "ouvriers-sur-votre-chantier-obligations": chantierEn,
  },
  zh: {
    "ouvrir-un-restaurant-demarches": ouvrirChecklistZh,
    "permis-exploitation-licence-restaurant": permisLicenceZh,
    "declaration-sanitaire-restaurant-ddpp": declarationSanitaireZh,
    "haccp-plan-maitrise-sanitaire-restaurant": haccpZh,
    "erp-restaurant-categorie-commission-securite": erpZh,
    "diagnostics-avant-travaux-restaurant": avantTravauxZh,
    "terrasse-restaurant-autorisation-domaine-public": terrasseZh,
    "sacem-spre-restaurant-musique": sacemSpreZh,
    "etude-impact-nuisances-sonores-restaurant": impactSonoreZh,
    "ouvriers-sur-votre-chantier-obligations": chantierZh,
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
    return billetParSlug(slugFrancais) ? `/blog/${slugFrancais}` : null;
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
export function reecrireLiens(markdown: string, langue: LangueJournal): string {
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
