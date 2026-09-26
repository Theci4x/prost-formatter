/**
 * Le vocabulaire du suivi commercial.
 *
 * À part du fichier d'actions : un module « use server » ne peut exporter
 * que des fonctions asynchrones, et une constante y ferait échouer la
 * compilation.
 */

/** Les états d'un contact, du plus vif au plus froid. */
export const STATUTS = [
  "a_rappeler",
  "rappele",
  "sans_reponse",
  "gagne",
  "perdu",
] as const;

export type Statut = (typeof STATUTS)[number];

export const LIBELLE_STATUT: Record<Statut, string> = {
  a_rappeler: "À rappeler",
  rappele: "Rappelé",
  sans_reponse: "Sans réponse",
  gagne: "Gagné",
  perdu: "Perdu",
};

/** La couleur d'une pastille. Le froid en gris, le gagné en vert. */
export const TEINTE_STATUT: Record<Statut, string> = {
  a_rappeler: "bg-orange-50 text-orange-700",
  rappele: "bg-blue-50 text-blue-700",
  sans_reponse: "bg-zinc-100 text-zinc-500",
  gagne: "bg-green-50 text-green-700",
  perdu: "bg-zinc-100 text-zinc-500",
};

export type Suivi = {
  cible_type: "prospect" | "restaurant" | "audit";
  cible_id: string;
  statut: Statut;
  note: string | null;
  auteur: string;
  created_at: string;
};

/**
 * Le dernier mot sur chaque contact, et son journal complet.
 *
 * Les lignes arrivent triées de la plus récente à la plus ancienne : la
 * première rencontrée pour une cible est donc son état courant.
 */
export function parCible(suivis: Suivi[]): Map<string, Suivi[]> {
  const journal = new Map<string, Suivi[]>();
  for (const suivi of suivis) {
    const cle = `${suivi.cible_type}:${suivi.cible_id}`;
    const lignes = journal.get(cle);
    if (lignes) lignes.push(suivi);
    else journal.set(cle, [suivi]);
  }
  return journal;
}
