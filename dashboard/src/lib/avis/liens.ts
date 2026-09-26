/**
 * Les deux chemins du totem.
 *
 * Aucun tri : la page les présente côte à côte, sans demander de note
 * avant de décider où envoyer les gens. C'est ce qui sépare une invitation
 * d'un filtre — les plateformes d'avis interdisent le second, et le
 * premier obtient sensiblement le même résultat, puisqu'un client
 * mécontent préfère spontanément le canal où il sera lu.
 */

/**
 * L'adresse du formulaire d'avis Google pour cet établissement.
 *
 * Null sans identifiant de fiche : mieux vaut n'afficher qu'un seul
 * chemin qu'un bouton qui mène à une page d'erreur.
 */
export function lienAvisGoogle(
  placeId: string | null | undefined,
): string | null {
  const id = (placeId ?? "").trim();
  if (!id) return null;
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(id)}`;
}
