"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exiger } from "@/lib/equipe/roles";

/**
 * La note que le restaurateur prend sur un client.
 *
 * Écrite avec la clé du visiteur, et non celle de service : les
 * politiques de la table veulent déjà `peut_gerer`, et laisser la base
 * trancher vaut mieux que de recopier la règle ici. `exiger` reste devant
 * pour que l'écran de refus soit le bon.
 *
 * Le contenu n'est pas relu ni bridé au-delà de sa longueur : c'est un
 * pense-bête privé — « allergique aux fruits de mer », « table 12 » —, et
 * en faire un champ structuré le ferait abandonner dès le deuxième
 * service.
 */
const LONGUEUR_MAX = 500;

export async function noterContact(formData: FormData): Promise<void> {
  const restaurantId = ((formData.get("restaurant_id") as string) ?? "").trim();
  const contactId = ((formData.get("contact_id") as string) ?? "").trim();
  if (!restaurantId || !contactId) return;

  await exiger(restaurantId, "gerant");

  const brut = ((formData.get("note") as string) ?? "").trim();
  const note = brut ? brut.slice(0, LONGUEUR_MAX) : null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_contacts")
    .update({ note_interne: note, updated_at: new Date().toISOString() })
    .eq("id", contactId)
    .eq("restaurant_id", restaurantId);

  if (error) {
    console.error("[noterContact]", error.message);
    return;
  }
  revalidatePath(`/dashboard/${restaurantId}/clients`);
}
