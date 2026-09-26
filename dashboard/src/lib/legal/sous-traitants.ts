/**
 * Qui traite les données pour nous, et où.
 *
 * Deux documents en parlent — la politique de confidentialité et l'accord
 * de sous-traitance — et ils ne disent pas la même chose du même
 * prestataire : Vercel mesure l'audience du site, ce qui regarde EDIREF
 * responsable de traitement, et héberge l'application, ce qui regarde
 * EDIREF sous-traitant. Les finalités restent donc propres à chaque page.
 *
 * L'identité, elle, ne peut pas diverger. Deux textes contractuels qui
 * nomment des sous-traitants différents, c'est pire que pas de texte du
 * tout : le restaurateur ne sait plus qui touche le fichier de ses
 * convives, et l'un des deux documents est faux.
 *
 * D'où cette liste, et d'où le type qui va avec : une finalité s'écrit
 * par nom, dans un `Record` complet. Ajouter un prestataire ici casse la
 * construction des deux pages tant qu'aucune ne l'a décrit — ce qui est
 * précisément le rappel qu'on veut, au moment où on veut l'avoir.
 */

export type SousTraitant = {
  nom: NomSousTraitant;
  /** Le pays d'établissement, qui commande la section « transferts ». */
  localisation: "Union européenne" | "États-Unis";
};

export type NomSousTraitant =
  | "Supabase"
  | "Vercel"
  | "Stripe"
  | "Resend"
  | "Anthropic";

export const SOUS_TRAITANTS: SousTraitant[] = [
  { nom: "Supabase", localisation: "Union européenne" },
  { nom: "Vercel", localisation: "États-Unis" },
  { nom: "Stripe", localisation: "États-Unis" },
  { nom: "Resend", localisation: "États-Unis" },
  { nom: "Anthropic", localisation: "États-Unis" },
];

/** Ceux qui sont hors de l'Union, nommés dans l'ordre de la liste. */
export function horsUnion(): NomSousTraitant[] {
  return SOUS_TRAITANTS.filter((s) => s.localisation === "États-Unis").map(
    (s) => s.nom,
  );
}

/**
 * « Vercel, Stripe, Resend et Anthropic » — la même énumération dans les
 * deux documents, et qui se corrige toute seule le jour où l'un d'eux
 * change de continent.
 */
export function enumererHorsUnion(): string {
  const noms = horsUnion();
  if (noms.length <= 1) return noms.join("");
  return `${noms.slice(0, -1).join(", ")} et ${noms[noms.length - 1]}`;
}
