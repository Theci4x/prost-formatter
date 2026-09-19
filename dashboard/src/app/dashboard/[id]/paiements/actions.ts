"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { deconnecterCompte } from "@/lib/stripe/connect";

/**
 * Retire la connexion. On prévient Stripe d'abord : si l'appel échoue, la
 * ligne reste en base plutôt que de laisser un compte relié chez eux et
 * invisible ici — le restaurateur pourrait ne jamais comprendre pourquoi
 * Klarr figure encore dans ses applications autorisées.
 */
export async function deconnecterStripe(formData: FormData) {
  const restaurantId = formData.get("restaurant_id") as string;
  const supabase = await createClient();

  // La lecture passe par RLS : rien ne revient si le restaurant n'est pas
  // celui de l'utilisateur connecté.
  const { data } = await supabase
    .from("restaurant_stripe_connexions")
    .select("stripe_account_id")
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  const connexion = data as { stripe_account_id: string } | null;
  if (!connexion) return;

  try {
    await deconnecterCompte(connexion.stripe_account_id);
  } catch (erreur) {
    // Compte déjà révoqué côté Stripe : la ligne n'a plus de raison d'être,
    // on la retire quand même pour ne pas bloquer le restaurateur.
    console.error("[deconnecterStripe]", erreur);
  }

  const { error } = await supabase
    .from("restaurant_stripe_connexions")
    .delete()
    .eq("restaurant_id", restaurantId);
  if (error) console.error("[deconnecterStripe] suppression", error);

  revalidatePath(`/dashboard/${restaurantId}/paiements`);
  revalidatePath(`/dashboard/${restaurantId}/connexions`);
}
