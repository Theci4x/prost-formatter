"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exiger } from "@/lib/equipe/roles";
import { valider, type Bouton } from "@/lib/posts/regles";
import { publicationsGoogleOuvertes } from "@/lib/google/business";

export type PostState = {
  error: string | null;
  enregistre: boolean;
  /**
   * Incrémenté à chaque publication enregistrée.
   *
   * Le geste réel est d'en programmer cinq d'affilée, le lundi matin, pour
   * la semaine. Sans ce compteur, le formulaire garderait le texte du
   * précédent — « enregistre » resterait vrai d'un envoi au suivant, et
   * rien ne dirait au champ de se vider.
   */
  version: number;
};

const BOUTONS: Bouton[] = ["reserver", "appeler", "en_savoir_plus"];

export async function programmerPost(
  prevState: PostState,
  formData: FormData,
): Promise<PostState> {
  const version = prevState.version;
  const echec = (error: string): PostState => ({
    error,
    enregistre: false,
    version,
  });

  // L'écran est masqué, mais une action serveur reste une adresse.
  if (!publicationsGoogleOuvertes()) {
    return echec("Les publications Google ne sont pas encore ouvertes.");
  }

  const restaurantId = String(formData.get("restaurant_id") ?? "");
  if (!restaurantId) return echec("Établissement inconnu.");

  const texte = String(formData.get("texte") ?? "");
  const quand = String(formData.get("publier_le") ?? "");
  const boutonBrut = String(formData.get("bouton") ?? "");
  const bouton = BOUTONS.includes(boutonBrut as Bouton)
    ? (boutonBrut as Bouton)
    : null;
  const boutonUrl = String(formData.get("bouton_url") ?? "").trim();
  const photoId = String(formData.get("photo_id") ?? "").trim();

  // Le champ « datetime-local » rend une heure sans fuseau : elle est
  // celle du restaurateur, et c'est bien ainsi qu'il faut la lire.
  const publierLe = quand ? new Date(quand) : null;

  const erreur = valider(
    { texte, publierLe, bouton, boutonUrl: boutonUrl || null },
    new Date(),
  );
  if (erreur) return echec(erreur);

  await exiger(restaurantId, "gerant");

  const supabase = await createClient();
  const { error } = await supabase.from("restaurant_posts").insert({
    restaurant_id: restaurantId,
    texte: texte.trim(),
    photo_id: photoId || null,
    bouton,
    bouton_url: bouton && bouton !== "appeler" ? boutonUrl : null,
    publier_le: publierLe!.toISOString(),
  });

  if (error) {
    console.error("[posts/programmer]", error.message);
    return echec("Enregistrement impossible. Réessaie.");
  }

  revalidatePath(`/dashboard/${restaurantId}/posts`);
  return { error: null, enregistre: true, version: version + 1 };
}

export async function annulerPost(formData: FormData): Promise<void> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const postId = String(formData.get("post_id") ?? "");
  if (!restaurantId || !postId) return;

  await exiger(restaurantId, "gerant");

  const supabase = await createClient();
  // Seules les publications non parties s'annulent : ce qui est chez
  // Google se retire chez Google.
  await supabase
    .from("restaurant_posts")
    .delete()
    .eq("id", postId)
    .eq("restaurant_id", restaurantId)
    .eq("statut", "programme");

  revalidatePath(`/dashboard/${restaurantId}/posts`);
}
