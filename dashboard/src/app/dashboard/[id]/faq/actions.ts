"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exiger } from "@/lib/equipe/roles";
import { SUGGESTIONS } from "@/lib/seo/questions-suggerees";

export type FaqState = { error: string | null; ajoutee: boolean };

export async function ajouterQuestion(
  _prevState: FaqState,
  formData: FormData,
): Promise<FaqState> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const question = String(formData.get("question") ?? "").trim();
  const reponse = String(formData.get("reponse") ?? "").trim();

  if (!restaurantId) return { error: "Établissement inconnu.", ajoutee: false };
  if (!question) return { error: "Écris la question.", ajoutee: false };
  if (!reponse) {
    // Une paire incomplète ferait rejeter par Google la FAQPage entière,
    // donc toutes les autres réponses avec elle.
    return {
      error: "Une question sans réponse ne sert à rien.",
      ajoutee: false,
    };
  }

  await exiger(restaurantId, "gerant");

  const supabase = await createClient();
  const { error } = await supabase.from("restaurant_faq").insert({
    restaurant_id: restaurantId,
    question,
    reponse,
  });

  if (error) {
    console.error("[faq/ajouter]", error.message);
    return { error: "Enregistrement impossible. Réessaie.", ajoutee: false };
  }

  revalidatePath(`/dashboard/${restaurantId}/faq`);
  revalidatePath(`/dashboard/${restaurantId}/reservations/configuration`);
  return { error: null, ajoutee: true };
}

/**
 * La réponse choisie d'un doigt, parmi celles qu'on propose.
 *
 * Une action nue plutôt qu'un `useActionState` : le formulaire n'a que
 * deux champs cachés et aucun état à rendre, donc il fonctionne sans
 * JavaScript — ce qui compte sur le téléphone d'un restaurateur en
 * salle, avec une barre de réseau.
 *
 * La question ne vient pas du client : on ne garde que celle qui figure
 * dans nos suggestions, avec l'une de ses réponses. Sans ce contrôle,
 * n'importe qui pourrait écrire ce qu'il veut sur une page publique en
 * postant le formulaire à la main.
 */
export async function repondreVite(formData: FormData): Promise<void> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const question = String(formData.get("question") ?? "").trim();
  const reponse = String(formData.get("reponse") ?? "").trim();
  if (!restaurantId || !question || !reponse) return;

  const suggestion = SUGGESTIONS.find(
    (s) => s.question.toLowerCase() === question.toLowerCase(),
  );
  if (!suggestion || !suggestion.reponses.includes(reponse)) return;

  await exiger(restaurantId, "gerant");

  const supabase = await createClient();
  const { error } = await supabase.from("restaurant_faq").insert({
    restaurant_id: restaurantId,
    question: suggestion.question,
    reponse,
  });
  if (error) console.error("[faq/repondreVite]", error.message);

  revalidatePath(`/dashboard/${restaurantId}/faq`);
  revalidatePath(`/dashboard/${restaurantId}/reservations/configuration`);
}

export async function supprimerQuestion(formData: FormData): Promise<void> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const questionId = String(formData.get("question_id") ?? "");
  if (!restaurantId || !questionId) return;

  await exiger(restaurantId, "gerant");

  const supabase = await createClient();
  await supabase
    .from("restaurant_faq")
    .delete()
    .eq("id", questionId)
    .eq("restaurant_id", restaurantId);

  revalidatePath(`/dashboard/${restaurantId}/faq`);
  revalidatePath(`/dashboard/${restaurantId}/reservations/configuration`);
}
