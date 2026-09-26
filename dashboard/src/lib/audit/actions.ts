import type { PlaceSignals, WebsiteSignals } from "@/lib/audit/scoring";

/**
 * Les actions prioritaires d'un audit de visibilité.
 *
 * Un score sans quoi faire ensuite n'est qu'un reproche. Ce module traduit
 * les signaux relevés en gestes concrets, chacun accompagné du chiffre qui
 * le déclenche : « 8 photos sur la fiche » se discute, « votre visibilité
 * est perfectible » ne se discute pas — on ne peut qu'acquiescer et
 * oublier.
 *
 * Le module ne produit que des clés et des nombres : les phrases vivent
 * dans les traductions, la page d'audit étant servie en trois langues.
 */

export type Impact = "fort" | "moyen" | "faible";
export type Pilier = "local" | "reputation" | "geo";

/** Les clés d'action, dans l'ordre où elles se déclenchent. */
export type CleAction =
  | "siteAbsent"
  | "siteInjoignable"
  | "balisageAbsent"
  | "balisageNonRestaurant"
  | "reseauxAbsents"
  | "horairesAbsents"
  | "photosPeuNombreuses"
  | "avisPeuNombreux"
  | "avisAnciens";

export type ActionPrioritaire = {
  cle: CleAction;
  pilier: Pilier;
  impact: Impact;
  /** Les nombres à insérer dans la phrase : {n}, {total}, {hote}. */
  valeurs: Record<string, string | number>;
};

/** Combien d'actions on montre. Au-delà, une liste devient un inventaire. */
export const ACTIONS_MONTREES = 5;

/**
 * Le seuil de photos au-delà duquel on ne dit plus rien. Quinze n'a rien
 * d'une vérité de Google : c'est le nombre à partir duquel une fiche cesse
 * de paraître vide, et c'est déjà celui que retient le calcul du score.
 */
const PHOTOS_SUFFISANTES = 15;

/** En dessous, une fiche paraît neuve même si le restaurant a dix ans. */
const AVIS_SUFFISANTS = 20;

/** Un avis de moins de six mois parle du restaurant d'aujourd'hui. */
const FRAICHEUR_MS = 1000 * 60 * 60 * 24 * 182;

const POIDS_IMPACT: Record<Impact, number> = { fort: 0, moyen: 1, faible: 2 };

/** L'hôte d'une URL, pour le citer sans étaler une adresse de trois lignes. */
function hote(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function actionsPrioritaires(
  place: PlaceSignals,
  site: WebsiteSignals,
  maintenant: Date = new Date(),
): ActionPrioritaire[] {
  const actions: ActionPrioritaire[] = [];

  // — Le site et son balisage —
  // Tant que la page n'a pas été lue, rien n'est dit de son contenu : un
  // site déclaré absent ou injoignable n'a pas « un balisage manquant », il
  // n'a rien du tout, et enchaîner les reproches sur une page qu'on n'a pas
  // vue ferait un rapport faux.
  if (!place.websiteUri) {
    actions.push({ cle: "siteAbsent", pilier: "geo", impact: "fort", valeurs: {} });
  } else if (site.checked && !site.reachable) {
    actions.push({
      cle: "siteInjoignable",
      pilier: "geo",
      impact: "fort",
      valeurs: { hote: hote(place.websiteUri) },
    });
  } else if (site.reachable) {
    if (!site.hasJsonLd) {
      actions.push({
        cle: "balisageAbsent",
        pilier: "geo",
        impact: "fort",
        valeurs: {},
      });
    } else if (!site.hasRestaurantSchema) {
      actions.push({
        cle: "balisageNonRestaurant",
        pilier: "geo",
        impact: "moyen",
        valeurs: {},
      });
    }
    if (!site.hasSameAs) {
      actions.push({
        cle: "reseauxAbsents",
        pilier: "geo",
        impact: "moyen",
        valeurs: {},
      });
    }
  }

  // — La fiche Google —
  if (!place.hasOpeningHours) {
    actions.push({
      cle: "horairesAbsents",
      pilier: "local",
      impact: "fort",
      valeurs: {},
    });
  }
  if (place.photoCount < PHOTOS_SUFFISANTES) {
    actions.push({
      cle: "photosPeuNombreuses",
      pilier: "local",
      // Sans photo du tout, la fiche est un panneau blanc ; avec dix, elle
      // est simplement perfectible.
      impact: place.photoCount === 0 ? "moyen" : "faible",
      valeurs: { n: place.photoCount },
    });
  }

  // — Les avis —
  const nombreAvis = place.userRatingCount ?? 0;
  if (nombreAvis < AVIS_SUFFISANTS) {
    actions.push({
      cle: "avisPeuNombreux",
      pilier: "reputation",
      impact: "moyen",
      valeurs: { n: nombreAvis },
    });
  }
  // La fraîcheur se juge sur les avis réellement récupérés, jamais sur le
  // total : l'API n'en rend qu'une poignée. Le rapport doit dire sur quoi
  // il se prononce, sinon il donne l'illusion d'avoir tout lu.
  if (place.reviews.length > 0) {
    const recents = place.reviews.filter(
      (avis) =>
        maintenant.getTime() - new Date(avis.publishTime).getTime() <
        FRAICHEUR_MS,
    ).length;
    if (recents * 2 < place.reviews.length) {
      actions.push({
        cle: "avisAnciens",
        pilier: "reputation",
        impact: "moyen",
        valeurs: { n: recents, total: place.reviews.length },
      });
    }
  }

  // Le plus lourd d'abord ; à impact égal, l'ordre de déclenchement, qui va
  // du site aux avis — on répare ce qu'on possède avant ce qu'on subit.
  return actions
    .sort((a, b) => POIDS_IMPACT[a.impact] - POIDS_IMPACT[b.impact])
    .slice(0, ACTIONS_MONTREES);
}

/** Remplace {n}, {total}, {hote} dans une phrase traduite. */
export function formater(
  modele: string,
  valeurs: Record<string, string | number>,
): string {
  return modele.replace(/\{(\w+)\}/g, (entier, cle: string) =>
    cle in valeurs ? String(valeurs[cle]) : entier,
  );
}
