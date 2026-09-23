"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exiger } from "@/lib/equipe/roles";
import { envoyerCourriel } from "@/lib/courriel/envoyer";
import {
  calculerRapport,
  periodeDuRapport,
  rendreRapport,
} from "@/lib/rapport/mensuel";

/** Recevoir le bilan chaque mois, ou plus. */
export async function basculerRapport(formData: FormData): Promise<void> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  if (!restaurantId) return;
  await exiger(restaurantId, "gerant");

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurants")
    .update({ rapport_mensuel: formData.get("actif") === "1" })
    .eq("id", restaurantId);
  if (error) console.error("[rapport/basculer]", error.message);

  revalidatePath(`/dashboard/${restaurantId}/rapport`);
}

export type EssaiState = { message: string | null; erreur: string | null };

/**
 * Le bilan du mois dernier, envoyé tout de suite à la personne connectée.
 * Pour voir à quoi il ressemble dans sa boîte, sans attendre le 1er.
 */
export async function envoyerRapportEssai(
  _prev: EssaiState,
  formData: FormData,
): Promise<EssaiState> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  if (!restaurantId) return { message: null, erreur: "Établissement inconnu." };
  await exiger(restaurantId, "gerant");

  const supabase = await createClient();
  const [{ data: utilisateur }, { data: restaurant }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("restaurants")
      .select("*")
      .eq("id", restaurantId)
      .maybeSingle(),
  ]);
  const email = utilisateur.user?.email;
  if (!email || !restaurant) {
    return { message: null, erreur: "Impossible de trouver ton adresse." };
  }

  const rapport = await calculerRapport(
    supabase,
    restaurant as { id: string; nom: string },
    periodeDuRapport(new Date()),
  );
  const message = rendreRapport(rapport);
  const resultat = await envoyerCourriel({
    destinataire: email,
    sujet: `[Essai] ${message.sujet}`,
    texte: message.texte,
    html: message.html,
  });

  return resultat.envoye
    ? { message: `Envoyé à ${email}.`, erreur: null }
    : {
        message: null,
        erreur: `L'envoi a échoué : ${resultat.erreur ?? "raison inconnue"}.`,
      };
}
