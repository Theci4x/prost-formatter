"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { langueVisiteur } from "@/lib/i18n/langue";
import { ANNULER } from "@/lib/i18n/annuler";

export type DesabonnementState = { error: string | null; fait: boolean };

/**
 * Désinscrit une personne des envois d'un établissement.
 *
 * Écrit avec la clé de service, donc hors RLS : le client n'a pas de
 * compte, c'est le jeton qui l'autorise. Le connaître suffit à se
 * désinscrire, le perdre ne donne accès à rien d'autre — ni au nom, ni
 * aux venues, ni aux autres établissements.
 *
 * La fiche n'est pas supprimée, seulement marquée. La distinction n'est
 * pas cosmétique : effacer la ligne ferait réapparaître la personne au
 * premier passage du fichier, puisque ses réservations, elles, restent.
 * C'est la date de désinscription qui tient le refus, et c'est aussi elle
 * qui le prouve si on nous le demande.
 */
export async function seDesabonner(
  _prevState: DesabonnementState,
  formData: FormData,
): Promise<DesabonnementState> {
  const jeton = ((formData.get("jeton") as string | null) ?? "").trim();
  // L'action lit le témoin de langue, comme la page qui l'a affichée.
  const a = ANNULER[await langueVisiteur()];

  if (!jeton) return { error: a.lienInvalide, fait: false };

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("restaurant_contacts")
    .update({ desabonne_le: new Date().toISOString() })
    .eq("jeton", jeton)
    // Sans le `select`, on ne saurait pas si la ligne existait : une
    // mise à jour qui ne touche rien ne rend aucune erreur.
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[desabonnement]", error.message);
    return { error: a.desinscriptionEchouee, fait: false };
  }

  // Se désinscrire deux fois réussit deux fois : la date est simplement
  // réécrite, et personne ne doit tomber sur une erreur pour avoir
  // recliqué un vieux lien. Un jeton inconnu, lui, n'apprend rien de
  // plus que ce que la page disait déjà.
  if (!data) return { error: a.lienPlusValide, fait: false };
  return { error: null, fait: true };
}
