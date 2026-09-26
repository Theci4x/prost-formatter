/**
 * Le calcul d'un devis.
 *
 * Tout en centimes, et tout en fonctions pures : ce qui décide d'une somme
 * qu'un client va payer doit pouvoir se vérifier sans base ni écran. Les
 * arrondis aussi — un total faux d'un centime sur un devis de privatisation
 * est un appel du restaurateur le lendemain.
 */

import type { Langue } from "@/lib/i18n/langues";
import { DEVIS } from "@/lib/i18n/devis";

export const STATUTS = ["brouillon", "envoye", "accepte", "refuse"] as const;
export type StatutDevis = (typeof STATUTS)[number];

export const LIBELLE_STATUT: Record<StatutDevis, string> = {
  brouillon: "Brouillon",
  envoye: "Envoyé",
  accepte: "Accepté",
  refuse: "Refusé",
};

/**
 * Les taux qu'un restaurateur rencontre. 10 % sur la nourriture consommée
 * sur place, 20 % sur les alcools — d'où le choix, plutôt qu'une constante.
 */
export const TAUX_TVA = [10, 20, 5.5, 0] as const;

/** Le taux qu'on propose quand rien ne dit le contraire : la restauration. */
export const TAUX_PAR_DEFAUT = 10;

/** Validité par défaut : un mois, le temps qu'un client décide sans presser. */
export const VALIDITE_JOURS = 30;

export type Ligne = {
  libelle: string;
  /** Décimale : « 2,5 heures » existe autant que « 30 couverts ». */
  quantite: number;
  prixUnitaireCentimes: number;
  /**
   * Le taux de cette ligne-là. Un menu est à 10 %, le forfait boissons
   * qui l'accompagne à 20 % : sur une privatisation, les deux cohabitent
   * dans le même devis.
   */
  tauxTva: number;
};

/** Une assiette de TVA : tout ce qui, dans ce devis, porte ce taux. */
export type Ventilation = {
  taux: number;
  htCentimes: number;
  tvaCentimes: number;
};

export type Totaux = {
  htCentimes: number;
  tvaCentimes: number;
  ttcCentimes: number;
  /**
   * Le détail par taux, du plus employé au moins. C'est ce que le
   * document doit montrer dès qu'il y a deux taux, et ce que le
   * comptable ventile.
   */
  ventilation: Ventilation[];
};

/**
 * Le total d'une ligne, arrondi au centime.
 *
 * L'arrondi se fait ici, ligne par ligne, et non sur la somme : c'est ce
 * que montre le document, et un total qui ne serait pas la somme des
 * lignes affichées passerait pour une erreur.
 */
export function totalLigne(ligne: Ligne): number {
  return Math.round(ligne.quantite * ligne.prixUnitaireCentimes);
}

/**
 * Les totaux du devis, et le détail par taux.
 *
 * La TVA se calcule par assiette et non ligne à ligne : on somme d'abord
 * tout ce qui porte le même taux, puis on applique le taux une fois. Deux
 * arrondis successifs sur vingt lignes à 10 % feraient dériver le total
 * de quelques centimes par rapport au décompte du comptable, et c'est
 * l'écart qu'on découvre à la facture.
 */
export function calculer(lignes: Ligne[]): Totaux {
  const assiettes = new Map<number, number>();
  for (const ligne of lignes) {
    assiettes.set(
      ligne.tauxTva,
      (assiettes.get(ligne.tauxTva) ?? 0) + totalLigne(ligne),
    );
  }

  const ventilation: Ventilation[] = [...assiettes.entries()]
    .map(([taux, htCentimes]) => ({
      taux,
      htCentimes,
      tvaCentimes: Math.round((htCentimes * taux) / 100),
    }))
    // Du plus gros au plus petit : le taux principal du devis se lit en
    // premier, les 20 % d'un forfait boissons viennent après.
    .sort((a, b) => b.htCentimes - a.htCentimes || a.taux - b.taux);

  const htCentimes = ventilation.reduce((somme, a) => somme + a.htCentimes, 0);
  const tvaCentimes = ventilation.reduce((somme, a) => somme + a.tvaCentimes, 0);
  return {
    htCentimes,
    tvaCentimes,
    ttcCentimes: htCentimes + tvaCentimes,
    ventilation,
  };
}

/** « 5,5 % » et non « 5.5 % » : le document est français. */
export function formatTaux(taux: number): string {
  return `${taux.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %`;
}

/** « 1 350,00 € ». L'espace insécable évite qu'un montant se coupe en fin de ligne. */
export function formatEuros(centimes: number): string {
  return (centimes / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

/** « 30 » ou « 2,5 » — jamais « 30,00 » pour une quantité entière. */
export function formatQuantite(quantite: number): string {
  return Number.isInteger(quantite)
    ? String(quantite)
    : quantite.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
}

/**
 * Un devis passé sa date de validité ne s'accepte plus. On compare des
 * jours, pas des instants : un devis valable « jusqu'au 25 » l'est encore
 * le 25 au soir.
 */
export function estExpire(valideJusquau: string, maintenant: Date): boolean {
  const jour = new Date(
    maintenant.getTime() - maintenant.getTimezoneOffset() * 60000,
  )
    .toISOString()
    .slice(0, 10);
  return jour > valideJusquau;
}

/** La date de validité par défaut, à la création. */
export function validiteParDefaut(maintenant: Date): string {
  const date = new Date(maintenant.getTime() + VALIDITE_JOURS * 86400000);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

export type Devis = {
  statut: StatutDevis;
  valide_jusquau: string;
};

/**
 * Ce que le client peut faire de ce devis, à cet instant.
 *
 * Un seul endroit décide : la page publique, l'action d'acceptation et
 * l'écran du restaurateur posent tous la même question, et une réponse qui
 * divergerait entre l'affichage et l'action laisserait un bouton qui
 * échoue.
 */
export function decidable(
  devis: Devis,
  maintenant: Date,
  /** La langue du client. Par défaut le français, comme la feuille. */
  langue: Langue = "fr",
): { possible: true } | { possible: false; motif: string } {
  const d = DEVIS[langue] ?? DEVIS.fr;
  if (devis.statut === "accepte") {
    return { possible: false, motif: d.dejaAccepte };
  }
  if (devis.statut === "refuse") {
    return { possible: false, motif: d.dejaRefuse };
  }
  if (devis.statut === "brouillon") {
    return { possible: false, motif: d.pasEncoreEnvoye };
  }
  if (estExpire(devis.valide_jusquau, maintenant)) {
    return {
      possible: false,
      motif: d.validiteDepassee,
    };
  }
  return { possible: true };
}

/**
 * Le numéro du prochain devis. « DEV-2026-0007 » : l'année pour s'y
 * retrouver d'un exercice à l'autre, quatre chiffres parce qu'aucun
 * restaurant ne fera dix mille privatisations dans l'année.
 */
export function numeroSuivant(numeros: string[], maintenant: Date): string {
  const annee = maintenant.getFullYear();
  const prefixe = `DEV-${annee}-`;
  const dernier = numeros
    .filter((numero) => numero.startsWith(prefixe))
    .map((numero) => Number(numero.slice(prefixe.length)))
    .filter((rang) => Number.isFinite(rang))
    .reduce((max, rang) => Math.max(max, rang), 0);
  return `${prefixe}${String(dernier + 1).padStart(4, "0")}`;
}

/**
 * Un montant saisi par un restaurateur, en centimes. « 45 », « 45,50 »,
 * « 45.5 » : les trois s'écrivent, et les trois doivent donner 4550.
 * `undefined` quand la saisie ne veut rien dire — le champ est refusé
 * plutôt que compris de travers.
 */
export function enCentimes(brut: string): number | undefined {
  const propre = brut.trim().replace(/\s/g, "").replace(",", ".");
  if (!propre) return undefined;
  if (!/^\d+(\.\d{1,2})?$/.test(propre)) return undefined;
  return Math.round(Number(propre) * 100);
}

/** Une quantité saisie : « 30 », « 2,5 ». */
export function enQuantite(brut: string): number | undefined {
  const propre = brut.trim().replace(/\s/g, "").replace(",", ".");
  if (!propre) return undefined;
  if (!/^\d+(\.\d{1,2})?$/.test(propre)) return undefined;
  const valeur = Number(propre);
  return valeur > 0 ? valeur : undefined;
}
