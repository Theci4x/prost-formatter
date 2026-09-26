/**
 * Les cibles d'une campagne : leurs noms, leurs seuils, leurs libellés.
 *
 * Séparées des requêtes parce que le formulaire de rédaction est un
 * composant client, et qu'il a besoin des libellés. `segments.ts`, lui,
 * porte « server-only » — il lit la base, et rien de ce qui lit la base
 * ne doit pouvoir partir dans un navigateur.
 */

export const SEGMENTS = ["tous", "recents", "perdus", "fideles"] as const;
export type Segment = (typeof SEGMENTS)[number];

export function estSegment(valeur: unknown): valeur is Segment {
  return (SEGMENTS as readonly unknown[]).includes(valeur);
}

/** Le seuil de « récent », et donc de « perdu » : les deux sont complémentaires. */
export const MOIS_DE_FRAICHEUR = 6;

/** Le nombre de venues à partir duquel on parle d'un habitué. */
export const VENUES_FIDELE = 3;

export const LIBELLE_SEGMENT: Record<Segment, string> = {
  tous: "Tout le fichier",
  recents: `Venus depuis moins de ${MOIS_DE_FRAICHEUR} mois`,
  perdus: `Pas revus depuis plus de ${MOIS_DE_FRAICHEUR} mois`,
  fideles: `Habitués (${VENUES_FIDELE} venues ou plus)`,
};

export const EXPLICATION_SEGMENT: Record<Segment, string> = {
  tous: "Tous ceux qui ont accepté vos e-mails.",
  recents: "Ils ont votre maison en tête. Une nouveauté, un événement.",
  perdus:
    "Ils sont venus, puis plus rien. C'est le segment qui rapporte le plus — et celui qu'on oublie.",
  fideles:
    "Ceux qui reviennent. À traiter comme tels : une avant-première, pas une promotion.",
};

/** La date pivot, au format que la base attend. */
export function pivot(maintenant: Date): string {
  const d = new Date(maintenant);
  d.setMonth(d.getMonth() - MOIS_DE_FRAICHEUR);
  return d.toISOString().slice(0, 10);
}
