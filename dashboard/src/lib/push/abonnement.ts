import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { notifierEtablissement } from "@/lib/push/envoyer";

/**
 * L'argent qui n'arrive pas, annoncé avant qu'il soit trop tard.
 *
 * Un prélèvement refusé ne se voit nulle part : l'abonnement reste
 * « actif » pendant les relances, le module tourne, et le restaurateur
 * découvre la coupure quelques jours plus tard, souvent un soir de
 * service. Le courriel de Stripe, lui, se perd entre deux confirmations
 * de commande.
 *
 * On le prévient donc là où il regarde — sur son téléphone — et on
 * l'envoie vers l'écran d'abonnement, où le bandeau porte le bouton qui
 * règle la chose en un clic.
 */

function euros(centimes: number): string {
  return `${(centimes / 100).toLocaleString("fr-FR")} €`;
}

export async function prevenirFactureEnAttente(
  supabase: SupabaseClient,
  restaurantId: string,
  montantCentimes: number,
  authentification: boolean,
): Promise<void> {
  const montant = euros(montantCentimes);

  await notifierEtablissement(supabase, restaurantId, {
    titre: authentification
      ? "Ta banque attend ta confirmation"
      : "Paiement de ton abonnement refusé",
    // On ne dramatise pas un incident de carte, et on ne le minimise pas
    // non plus : ce qui compte, c'est que le geste à faire soit clair.
    corps: authentification
      ? `${montant} : ta carte est bonne, il manque la validation de sécurité. Sans elle, ton abonnement se fermera.`
      : `${montant} n'ont pas pu être prélevés. Ton abonnement reste ouvert le temps des relances.`,
    chemin: `/dashboard/${restaurantId}/abonnement`,
    // Une seule notification par facture : les relances de Stripe se
    // comptent en jours, et trois alertes pour le même impayé feraient
    // désactiver les notifications.
    etiquette: `facture-${restaurantId}`,
  });
}
