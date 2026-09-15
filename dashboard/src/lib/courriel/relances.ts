import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { envoyerCourriel } from "@/lib/courriel/envoyer";
import { lienDePaiement, type Contexte } from "@/lib/courriel/messages";
import type { Genre } from "@/lib/courriel/reservation";
import { siteUrl } from "@/lib/site-url";

/**
 * La relance de celui qui n'a pas réglé.
 *
 * Une privatisation acceptée tient la salle par une option de quelques
 * jours. Passé ce délai elle repart à la réservation — ce qui est juste,
 * mais brutal pour un client qui avait simplement laissé l'e-mail au fond
 * de sa boîte. Un rappel avant l'échéance, et la salle se vend au lieu de
 * se libérer.
 *
 * Une seule relance : la contrainte d'unicité sur le genre s'en porte
 * garante. Deux rappels pour la même somme, c'est du harcèlement.
 */

/** On relance quand l'option expire dans moins de ça. */
export const AVANT_ECHEANCE_HEURES = 36;

export type BilanRelances = {
  concernees: number;
  envoyees: number;
  ignorees: number;
};

type Ligne = {
  id: string;
  restaurant_id: string;
  service_id: string | null;
  date_reservation: string;
  heure_arrivee: string | null;
  couverts: number;
  type: "table" | "privatisation";
  statut: string;
  client_nom: string | null;
  client_email: string | null;
  paiement_token: string | null;
  option_expire_le: string | null;
  acompte_centimes: number | null;
  acompte_statut: string | null;
  caution_centimes: number | null;
  caution_statut: string | null;
  minimum_consommation_centimes: number | null;
  minimum_consommation_ht: boolean | null;
  derniere_relance_le: string | null;
};

function echeanceLisible(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  });
}

export async function relancerLesPaiements({
  supabase,
  maintenant,
  plafond = 100,
}: {
  supabase: SupabaseClient;
  maintenant: Date;
  plafond?: number;
}): Promise<BilanRelances> {
  const limite = new Date(
    maintenant.getTime() + AVANT_ECHEANCE_HEURES * 3600 * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from("restaurant_reservations")
    .select("*")
    .eq("statut", "demande")
    .not("paiement_token", "is", null)
    .not("option_expire_le", "is", null)
    .lt("option_expire_le", limite)
    .gt("option_expire_le", maintenant.toISOString())
    .limit(plafond);

  if (error) {
    console.error("[relances] lecture impossible", error.message);
    return { concernees: 0, envoyees: 0, ignorees: 0 };
  }

  const lignes = (data ?? []) as Ligne[];
  if (lignes.length === 0) {
    return { concernees: 0, envoyees: 0, ignorees: 0 };
  }

  const { data: restaurantsData } = await supabase
    .from("restaurants")
    .select("id, nom, adresse, email_contact")
    .in("id", [...new Set(lignes.map((l) => l.restaurant_id))]);

  const restaurants = new Map(
    (
      (restaurantsData ?? []) as {
        id: string;
        nom: string;
        adresse: string | null;
        email_contact: string | null;
      }[]
    ).map((r) => [r.id, r]),
  );

  const bilan: BilanRelances = {
    concernees: lignes.length,
    envoyees: 0,
    ignorees: 0,
  };
  const genre: Genre = "relance_paiement";

  for (const ligne of lignes) {
    const attend =
      ligne.acompte_statut === "attendu" || ligne.caution_statut === "attendue";
    const centimes = ligne.acompte_centimes || ligne.caution_centimes;
    const destinataire = (ligne.client_email ?? "").trim();
    const restaurant = restaurants.get(ligne.restaurant_id);

    if (
      !attend ||
      !centimes ||
      !ligne.paiement_token ||
      !restaurant ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destinataire)
    ) {
      bilan.ignorees += 1;
      continue;
    }

    // Le restaurateur vient peut-être de relancer lui-même : doubler son
    // message le lendemain matin ferait deux rappels pour une somme.
    if (
      ligne.derniere_relance_le &&
      maintenant.getTime() - new Date(ligne.derniere_relance_le).getTime() <
        24 * 3600 * 1000
    ) {
      bilan.ignorees += 1;
      continue;
    }

    // La trace avant l'envoi : c'est la contrainte d'unicité, et non une
    // vérification en JavaScript, qui garantit la relance unique.
    const { error: erreurTrace } = await supabase
      .from("reservation_courriels")
      .insert({ reservation_id: ligne.id, genre, destinataire });
    if (erreurTrace) {
      if (erreurTrace.code !== "23505") {
        console.error("[relances/trace]", erreurTrace.message);
      }
      bilan.ignorees += 1;
      continue;
    }

    const contexte: Contexte = {
      restaurantNom: restaurant.nom,
      restaurantAdresse: restaurant.adresse,
      clientNom: ligne.client_nom ?? "",
      date: ligne.date_reservation,
      heure: ligne.heure_arrivee?.slice(0, 5) ?? null,
      couverts: ligne.couverts,
      serviceNom: null,
      type: ligne.type,
      minimumConsommation: ligne.minimum_consommation_centimes
        ? `${(ligne.minimum_consommation_centimes / 100).toLocaleString("fr-FR")} € ${ligne.minimum_consommation_ht === false ? "TTC" : "HT"}`
        : null,
    };

    const resultat = await envoyerCourriel({
      destinataire,
      repondreA: restaurant.email_contact ?? undefined,
      ...lienDePaiement(
        contexte,
        `${siteUrl()}/paiement/${ligne.paiement_token}`,
        {
          montant: `${(centimes / 100).toLocaleString("fr-FR")} €`,
          caution: !ligne.acompte_centimes,
          echeance: echeanceLisible(ligne.option_expire_le),
        },
      ),
    });

    if (resultat.envoye) {
      bilan.envoyees += 1;
      await supabase
        .from("restaurant_reservations")
        .update({ derniere_relance_le: maintenant.toISOString() })
        .eq("id", ligne.id);
    } else {
      bilan.ignorees += 1;
      await supabase
        .from("reservation_courriels")
        .update({ erreur: resultat.erreur ?? "inconnue" })
        .eq("reservation_id", ligne.id)
        .eq("genre", genre);
    }
  }

  return bilan;
}
