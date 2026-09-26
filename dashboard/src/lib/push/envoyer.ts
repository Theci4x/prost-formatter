import "server-only";
import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Les notifications sur l'écran de veille.
 *
 * Deux principes, les mêmes que pour l'e-mail.
 *
 * **Une notification qui ne part pas ne doit jamais faire échouer une
 * réservation.** Le client a rempli son formulaire, la table est prise :
 * lui afficher une erreur parce qu'un service de notification est en
 * panne serait absurde. Rien d'ici ne lève.
 *
 * **Un abonnement mort doit disparaître.** Un téléphone remplacé, un
 * navigateur réinstallé, une permission retirée : le service répond 404
 * ou 410, définitivement. On supprime la ligne plutôt que de réessayer
 * chaque soir jusqu'à la fin des temps.
 */

export type Notification = {
  titre: string;
  corps: string;
  /** Où l'on atterrit en touchant la notification. Chemin absolu du site. */
  chemin: string;
  /**
   * Remplace une notification déjà affichée portant la même étiquette.
   * Trois demandes pendant le service font trois lignes ; trois relances
   * pour la même table n'en font qu'une.
   */
  etiquette?: string;
};

export type BilanPush = { envoyees: number; retirees: number };

type Abonnement = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

/**
 * Les clés VAPID identifient Klarr auprès des services de notification
 * (Google, Apple, Mozilla). Sans elles, on ne fait rien et on le dit :
 * en développement comme sur un déploiement pas encore configuré, c'est
 * le comportement attendu — pas une erreur à corriger.
 */
function clesConfigurees(): boolean {
  const publique = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privee = process.env.VAPID_PRIVATE_KEY;
  if (!publique || !privee) return false;

  webpush.setVapidDetails(
    `mailto:${process.env.EMAIL_CONTACT ?? "contact@klarr.net"}`,
    publique,
    privee,
  );
  return true;
}

/**
 * Prévient tous les appareils reliés à un établissement.
 *
 * Passe par la clé de service : la notification part souvent d'une action
 * publique — un client qui réserve — et ce client n'a aucun droit de
 * lecture sur les abonnements du restaurateur.
 */
export async function notifierEtablissement(
  supabase: SupabaseClient,
  restaurantId: string,
  notification: Notification,
): Promise<BilanPush> {
  if (!clesConfigurees()) {
    console.warn(
      `[push] clés VAPID absentes : « ${notification.titre} » non envoyée.`,
    );
    return { envoyees: 0, retirees: 0 };
  }

  const { data, error } = await supabase
    .from("push_abonnements")
    .select("id, endpoint, p256dh, auth")
    .eq("restaurant_id", restaurantId);

  if (error) {
    console.error("[push] abonnements illisibles", error.message);
    return { envoyees: 0, retirees: 0 };
  }

  const abonnements = (data ?? []) as Abonnement[];
  if (abonnements.length === 0) return { envoyees: 0, retirees: 0 };

  const charge = JSON.stringify({
    titre: notification.titre,
    corps: notification.corps,
    chemin: notification.chemin,
    etiquette: notification.etiquette ?? "klarr",
  });

  const morts: string[] = [];
  let envoyees = 0;

  await Promise.all(
    abonnements.map(async (abonnement) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: abonnement.endpoint,
            keys: { p256dh: abonnement.p256dh, auth: abonnement.auth },
          },
          charge,
          // Une demande de réservation ne vaut plus rien le lendemain :
          // inutile de la faire suivre pendant quatre semaines.
          { TTL: 6 * 3600, urgency: "high" },
        );
        envoyees += 1;
      } catch (cause) {
        const statut =
          typeof cause === "object" && cause !== null && "statusCode" in cause
            ? (cause as { statusCode?: number }).statusCode
            : undefined;

        // 404 et 410 : l'appareil ne répondra plus jamais. Tout le reste
        // est passager (panne, réseau) et l'abonnement reste.
        if (statut === 404 || statut === 410) {
          morts.push(abonnement.id);
        } else {
          console.error("[push]", statut ?? "", cause);
        }
      }
    }),
  );

  if (morts.length > 0) {
    const { error: erreurPurge } = await supabase
      .from("push_abonnements")
      .delete()
      .in("id", morts);
    if (erreurPurge) console.error("[push] purge", erreurPurge.message);
  }

  return { envoyees, retirees: morts.length };
}
