/**
 * Le calcul d'un devis.
 *
 * Tout en centimes, et tout en fonctions pures : ce qui décide d'une somme
 * qu'un client va payer doit pouvoir se vérifier sans base ni écran. Les
 * arrondis aussi — un total faux d'un centime sur un devis de privatisation
 * est un appel du restaurateur le lendemain.
 */

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

/** Validité par défaut : un mois, le temps qu'un client décide sans presser. */
export const VALIDITE_JOURS = 30;

export type Ligne = {
  libelle: string;
  /** Décimale : « 2,5 heures » existe autant que « 30 couverts ». */
  quantite: number;
  prixUnitaireCentimes: number;
};

export type Totaux = {
  htCentimes: number;
  tvaCentimes: number;
  ttcCentimes: number;
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

export function calculer(lignes: Ligne[], tauxTva: number): Totaux {
  const htCentimes = lignes.reduce((somme, ligne) => somme + totalLigne(ligne), 0);
  const tvaCentimes = Math.round((htCentimes * tauxTva) / 100);
  return { htCentimes, tvaCentimes, ttcCentimes: htCentimes + tvaCentimes };
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
): { possible: true } | { possible: false; motif: string } {
  if (devis.statut === "accepte") {
    return { possible: false, motif: "Ce devis a déjà été accepté." };
  }
  if (devis.statut === "refuse") {
    return { possible: false, motif: "Ce devis a été refusé." };
  }
  if (devis.statut === "brouillon") {
    return { possible: false, motif: "Ce devis n'a pas encore été envoyé." };
  }
  if (estExpire(devis.valide_jusquau, maintenant)) {
    return {
      possible: false,
      motif:
        "La validité de ce devis est dépassée. Contactez l'établissement pour en obtenir un nouveau.",
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
