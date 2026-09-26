import type { Intention } from "./intentions";
import { INTENTIONS } from "./intentions";

/**
 * Le score de visibilité IA : un chiffre sur cent, et ce qu'il y a dedans.
 *
 * Un taux de citation brut met sur le même plan « les meilleurs bars de
 * Paris » et « où réserver pour un anniversaire dans le 11e ». Le score
 * pondère donc par intention : être cité quand le client veut réserver
 * pèse la moitié, quand il compare presque le tiers, quand il explore le
 * reste. Les poids sont écrits ici, affichés à l'écran, et renormalisés
 * quand une intention n'a pas encore d'analyse — un « — » vaut mieux qu'un
 * zéro qui punirait de n'avoir pas encore posé la question.
 *
 * Pure : pas d'accès à la base, pour rester vérifiable à la main.
 */

export const POIDS: Record<Intention, number> = {
  reservation: 0.5,
  comparaison: 0.3,
  decouverte: 0.2,
};

/** Une réponse d'assistant, réduite à ce que le score en retient. */
export type Mesure = {
  questionId: string;
  intention: Intention;
  fournisseur: string;
  estCite: boolean;
  rang: number | null;
};

export type Taux = { citees: number; analysees: number; part: number | null };

function taux(mesures: Mesure[]): Taux {
  const citees = mesures.filter((m) => m.estCite).length;
  return {
    citees,
    analysees: mesures.length,
    part: mesures.length > 0 ? citees / mesures.length : null,
  };
}

export function tauxParIntention(mesures: Mesure[]): Record<Intention, Taux> {
  return Object.fromEntries(
    INTENTIONS.map((i) => [i, taux(mesures.filter((m) => m.intention === i))]),
  ) as Record<Intention, Taux>;
}

/** Sur cent, ou null tant que rien n'a été analysé. */
export function scoreGlobal(mesures: Mesure[]): number | null {
  const parIntention = tauxParIntention(mesures);
  let somme = 0;
  let poidsTotal = 0;
  for (const intention of INTENTIONS) {
    const t = parIntention[intention];
    if (t.part === null) continue;
    somme += t.part * POIDS[intention];
    poidsTotal += POIDS[intention];
  }
  if (poidsTotal === 0) return null;
  return Math.round((somme / poidsTotal) * 100);
}

export function tauxParAssistant(
  mesures: Mesure[],
): { fournisseur: string; taux: Taux }[] {
  const groupes = new Map<string, Mesure[]>();
  for (const m of mesures) {
    groupes.set(m.fournisseur, [...(groupes.get(m.fournisseur) ?? []), m]);
  }
  return [...groupes.entries()]
    .map(([fournisseur, liste]) => ({ fournisseur, taux: taux(liste) }))
    .sort((a, b) => (b.taux.part ?? -1) - (a.taux.part ?? -1));
}

/** La position moyenne quand on est cité, ou null. */
export function positionMoyenne(mesures: Mesure[]): number | null {
  const rangs = mesures.flatMap((m) => (m.rang ? [m.rang] : []));
  if (rangs.length === 0) return null;
  return (
    Math.round((rangs.reduce((s, r) => s + r, 0) / rangs.length) * 10) / 10
  );
}

export type LigneClassement = {
  nom: string;
  fois: number;
  toi: boolean;
  /** Le rang sur la liste entière, pas sur la portion affichée. */
  rang: number;
};

/**
 * Le classement des noms cités, l'établissement inclus.
 *
 * Se compter parmi les autres est ce qui transforme une liste de
 * concurrents en rang : « 5e sur 9 » se retient, « La Fine Mousse : 4 » non.
 */
export function classement(
  restaurantNom: string,
  reponses: { estCite: boolean; concurrents: string[] }[],
  limite = 8,
): {
  lignes: LigneClassement[];
  rang: number | null;
  total: number;
  /** Combien de noms sautés entre la tête affichée et l'établissement. */
  omis: number;
} {
  const occurrences = new Map<string, number>();
  let citations = 0;
  for (const r of reponses) {
    if (r.estCite) citations += 1;
    for (const brut of r.concurrents) {
      const nom = brut.trim();
      if (!nom) continue;
      occurrences.set(nom, (occurrences.get(nom) ?? 0) + 1);
    }
  }

  const triees = [
    ...[...occurrences.entries()].map(([nom, fois]) => ({
      nom,
      fois,
      toi: false,
    })),
    { nom: restaurantNom, fois: citations, toi: true },
  ].sort((a, b) => b.fois - a.fois || a.nom.localeCompare(b.nom));

  // Rang de compétition : les ex æquo partagent le meilleur rang du groupe,
  // et le suivant reprend à la position réelle. Calculé une fois sur la
  // liste entière — le déduire de la portion affichée donnait « #8 » à qui
  // était vingt-deuxième.
  const lignes: LigneClassement[] = triees.map((ligne, index) => ({
    ...ligne,
    rang:
      triees.findIndex((autre) => autre.fois === ligne.fois) + 1 || index + 1,
  }));

  const total = lignes.length;
  const indexToi = lignes.findIndex((l) => l.toi);
  const rang = total > 1 && indexToi !== -1 ? lignes[indexToi].rang : null;

  // On garde toujours l'établissement visible, même hors des premiers.
  const tete = lignes.slice(0, limite);
  const dansLaTete = tete.some((l) => l.toi);
  const visibles = dansLaTete
    ? tete
    : [...lignes.slice(0, limite - 1), lignes[indexToi]!];
  const omis = dansLaTete ? 0 : Math.max(0, indexToi - (limite - 1));

  return { lignes: visibles, rang, total, omis };
}

/* ——— Évolution dans le temps —————————————————————————————————— */

/** Une analyse, réduite à ce que la courbe en retient. */
export type Releve = {
  /** Le jour, en AAAA-MM-JJ. */
  jour: string;
  estCite: boolean;
  concurrents: string[];
};

export type Point = { jour: string; part: number };

export type Serie = {
  nom: string;
  toi: boolean;
  points: Point[];
  /** La part au dernier relevé, pour l'étiquette de fin de ligne. */
  derniere: number;
};

function jours(releves: Releve[]): string[] {
  return [...new Set(releves.map((r) => r.jour))].sort();
}

/**
 * La part des réponses où chaque nom apparaît, jour par jour.
 *
 * Un taux du moment ne dit pas si le travail a payé : c'est la courbe qui
 * le dit, et c'est elle qu'un restaurateur montre à son associé pour
 * justifier l'abonnement. On la trace pour lui et pour les deux
 * concurrents qu'on voit le plus souvent : au-delà, les gris ne se
 * distinguent plus les uns des autres et on lit un plat de spaghettis au
 * lieu de reconnaître ses voisins.
 */
export function evolution(
  releves: Releve[],
  restaurantNom: string,
  maxConcurrents = 2,
): Serie[] {
  const dates = jours(releves);
  if (dates.length === 0) return [];

  const totalParJour = new Map<string, number>();
  for (const releve of releves) {
    totalParJour.set(releve.jour, (totalParJour.get(releve.jour) ?? 0) + 1);
  }

  // Combien de fois chaque nom est cité, par jour et en tout.
  const citations = new Map<string, Map<string, number>>();
  const cumul = new Map<string, number>();
  const compter = (nom: string, jour: string) => {
    const parJour = citations.get(nom) ?? new Map<string, number>();
    parJour.set(jour, (parJour.get(jour) ?? 0) + 1);
    citations.set(nom, parJour);
    cumul.set(nom, (cumul.get(nom) ?? 0) + 1);
  };

  for (const releve of releves) {
    if (releve.estCite) compter(restaurantNom, releve.jour);
    for (const brut of releve.concurrents) {
      const nom = brut.trim();
      if (nom && nom !== restaurantNom) compter(nom, releve.jour);
    }
  }

  const retenus = [...cumul.entries()]
    .filter(([nom]) => nom !== restaurantNom)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, maxConcurrents)
    .map(([nom]) => nom);

  const serie = (nom: string, toi: boolean): Serie => {
    const parJour = citations.get(nom) ?? new Map<string, number>();
    const points = dates.map((jour) => ({
      jour,
      // Un jour sans citation vaut zéro, pas un trou : une ligne
      // interrompue se lit comme une absence de mesure, alors que c'est
      // une absence de citation — l'inverse de ce qu'on veut montrer.
      part: (parJour.get(jour) ?? 0) / (totalParJour.get(jour) || 1),
    }));
    return { nom, toi, points, derniere: points.at(-1)?.part ?? 0 };
  };

  return [serie(restaurantNom, true), ...retenus.map((n) => serie(n, false))];
}

/**
 * La part de voix : sur tous les noms cités, quelle part est la sienne.
 *
 * Le taux de citation dit si l'on figure dans la réponse ; la part de voix
 * dit quelle place on y prend. Être nommé dans neuf réponses sur dix mais
 * toujours en dernier sur six maisons, ce n'est pas la même chose qu'être
 * seul cité une fois sur deux.
 *
 * Null quand rien n'a été cité : zéro sur zéro n'est pas zéro.
 */
export function partDeVoix(
  releves: Releve[],
  restaurantNom: string,
): number | null {
  let miennes = 0;
  let total = 0;
  for (const releve of releves) {
    if (releve.estCite) {
      miennes += 1;
      total += 1;
    }
    for (const brut of releve.concurrents) {
      const nom = brut.trim();
      if (nom && nom !== restaurantNom) total += 1;
    }
  }
  return total === 0 ? null : miennes / total;
}
