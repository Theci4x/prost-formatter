"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { exiger } from "@/lib/equipe/roles";
import { notifierEtablissement } from "@/lib/push/envoyer";

/**
 * Les actions de l'écran des notifications.
 *
 * Un abonnement appartient à un appareil *et* à une personne : c'est le
 * client normal qui écrit, pas la clé de service, pour que la RLS vérifie
 * d'elle-même que celui qui s'abonne a bien des droits sur la maison.
 */

export type AbonnementState = { erreur: string | null; fait: boolean };

export async function enregistrerAbonnement(
  _prevState: AbonnementState,
  formData: FormData,
): Promise<AbonnementState> {
  const restaurantId = (formData.get("restaurant_id") as string)?.trim();
  const endpoint = (formData.get("endpoint") as string)?.trim();
  const p256dh = (formData.get("p256dh") as string)?.trim();
  const auth = (formData.get("auth") as string)?.trim();
  const appareil = (formData.get("appareil") as string)?.trim();

  if (!restaurantId || !endpoint || !p256dh || !auth) {
    return { erreur: "Abonnement incomplet.", fait: false };
  }

  await exiger(restaurantId, "gerant");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erreur: "Session expirée.", fait: false };

  // Le même appareil peut se réabonner après avoir été purgé, ou changer
  // d'établissement : l'endpoint est unique, on écrase plutôt que de
  // refuser.
  const { error } = await supabase.from("push_abonnements").upsert(
    {
      restaurant_id: restaurantId,
      utilisateur_id: user.id,
      endpoint,
      p256dh,
      auth,
      appareil: appareil || null,
    },
    { onConflict: "endpoint" },
  );

  if (error) {
    console.error("[enregistrerAbonnement]", error);
    return { erreur: "L'activation a échoué.", fait: false };
  }

  return { erreur: null, fait: true };
}

export async function retirerAbonnement(
  _prevState: AbonnementState,
  formData: FormData,
): Promise<AbonnementState> {
  const endpoint = (formData.get("endpoint") as string)?.trim();
  if (!endpoint) return { erreur: null, fait: true };

  const supabase = await createClient();
  const { error } = await supabase
    .from("push_abonnements")
    .delete()
    .eq("endpoint", endpoint);

  if (error) {
    console.error("[retirerAbonnement]", error);
    return { erreur: "La désactivation a échoué.", fait: false };
  }
  return { erreur: null, fait: true };
}

/**
 * Une notification d'essai, pour vérifier que la chaîne complète
 * fonctionne — permission, abonnement, clés, service worker. Sans elle,
 * on ne le découvrirait qu'au premier vrai client, un vendredi soir.
 */
export async function envoyerTest(
  _prevState: AbonnementState,
  formData: FormData,
): Promise<AbonnementState> {
  const restaurantId = (formData.get("restaurant_id") as string)?.trim();
  if (!restaurantId) return { erreur: "Établissement inconnu.", fait: false };

  await exiger(restaurantId, "gerant");

  const bilan = await notifierEtablissement(
    createServiceClient(),
    restaurantId,
    {
      titre: "Klarr fonctionne",
      corps: "C'est exactement comme ça qu'arrivera votre prochaine réservation.",
      chemin: `/dashboard/${restaurantId}/notifications`,
      etiquette: "test",
    },
  );

  if (bilan.envoyees === 0) {
    return {
      erreur:
        "Aucun appareil n'a reçu la notification. Réactive-la sur cet appareil.",
      fait: false,
    };
  }
  return { erreur: null, fait: true };
}
