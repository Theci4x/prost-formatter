import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { notifierEtablissement } from "@/lib/push/envoyer";

/**
 * L'argent arrivé, annoncé au restaurateur.
 *
 * C'est l'événement qui compte le plus pour lui — davantage qu'une demande
 * ou qu'un devis envoyé. Un acompte réglé, une empreinte déposée : la
 * salle est vendue pour de bon, et il ne devrait pas avoir à ouvrir son
 * carnet pour l'apprendre.
 *
 * Ces messages vivent ici, et non dans le webhook, parce que deux chemins
 * mènent au même constat : la page de retour, quand le client revient
 * chez nous, et le webhook, quand il ferme l'onglet. Chacun écrit sous
 * condition de statut, donc un seul des deux gagne — et c'est celui-là
 * qui prévient. Le texte, lui, ne doit pas dépendre du chemin emprunté.
 */

type Reservation = {
  id: string;
  restaurant_id: string;
  client_nom: string | null;
};

function euros(centimes: number): string {
  return `${(centimes / 100).toLocaleString("fr-FR")} €`;
}

export async function prevenirAcompteRegle(
  supabase: SupabaseClient,
  resa: Reservation & { acompte_centimes: number | null },
): Promise<void> {
  await notifierEtablissement(supabase, resa.restaurant_id, {
    titre: `Acompte réglé — ${resa.client_nom ?? "un client"}`,
    corps: resa.acompte_centimes
      ? `${euros(resa.acompte_centimes)} encaissés. La table est confirmée.`
      : "La table est confirmée.",
    chemin: `/dashboard/${resa.restaurant_id}/reservations`,
    // L'étiquette porte la réservation : deux notifications pour le même
    // encaissement se remplacent au lieu de s'empiler.
    etiquette: `acompte-${resa.id}`,
  });
}

export async function prevenirCautionDeposee(
  supabase: SupabaseClient,
  resa: Reservation & { caution_centimes: number | null },
): Promise<void> {
  await notifierEtablissement(supabase, resa.restaurant_id, {
    titre: `Caution déposée — ${resa.client_nom ?? "un client"}`,
    corps: resa.caution_centimes
      ? `Empreinte de ${euros(resa.caution_centimes)} enregistrée. La table est confirmée.`
      : "Empreinte de carte enregistrée. La table est confirmée.",
    chemin: `/dashboard/${resa.restaurant_id}/reservations`,
    etiquette: `caution-${resa.id}`,
  });
}
