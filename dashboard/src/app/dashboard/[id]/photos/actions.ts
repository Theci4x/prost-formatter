"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "restaurant-photos";
// Au-delà, l'hébergeur refuse le corps de la requête avant que ce code ne
// s'exécute : la photo ne partirait nulle part et l'écran n'aurait rien à
// dire. Voir aussi serverActions.bodySizeLimit dans next.config.ts.
const TAILLE_MAX = 4 * 1024 * 1024;
// Une légende se lit sous une vignette : au-delà, elle déborde de la photo
// qu'elle décrit. « Salle speakeasy, au sous-sol » en fait vingt-six.
const LEGENDE_MAX = 80;

/** La légende telle qu'on l'enregistre : vide vaut absente, jamais "". */
function legendeSaine(brut: FormDataEntryValue | null): string | null {
  const texte = typeof brut === "string" ? brut.trim() : "";
  return texte ? texte.slice(0, LEGENDE_MAX) : null;
}

export async function uploadPhoto(formData: FormData): Promise<{
  error: string | null;
}> {
  const restaurantId = formData.get("restaurant_id") as string;
  // Rempli quand la photo illustre un espace réservable ; absent pour la
  // galerie générale de l'établissement.
  const espaceId = (formData.get("espace_id") as string | null) || null;
  const file = formData.get("photo") as File | null;

  if (!file || file.size === 0) return { error: "Choisis une photo." };
  if (!file.type.startsWith("image/")) {
    return { error: "Ce fichier n'est pas une image." };
  }
  if (file.size > TAILLE_MAX) {
    return {
      error: "Photo trop lourde (4 Mo maximum). Réduis-la avant de l'envoyer.",
    };
  }

  const supabase = await createClient();

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${restaurantId}/${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    console.error("[uploadPhoto]", uploadError);
    return { error: "L'envoi a échoué. Réessaie." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { error } = await supabase.from("restaurant_photos").insert({
    restaurant_id: restaurantId,
    espace_id: espaceId,
    storage_path: path,
    url: publicUrl,
    legende: legendeSaine(formData.get("legende")),
  });

  if (error) {
    console.error("[uploadPhoto]", error);
    // Le fichier est déjà envoyé : sans ce ménage, il resterait dans le
    // stockage sans qu'aucune ligne ne le désigne.
    await supabase.storage.from(BUCKET).remove([path]);
    return { error: "La photo n'a pas été enregistrée." };
  }

  revalidatePath(`/dashboard/${restaurantId}/photos`);
  revalidatePath(`/dashboard/${restaurantId}/reservations/configuration`);
  return { error: null };
}

export async function removePhoto(formData: FormData) {
  const id = formData.get("id") as string;
  const restaurantId = formData.get("restaurant_id") as string;
  const storagePath = formData.get("storage_path") as string;

  const supabase = await createClient();
  await supabase.storage.from(BUCKET).remove([storagePath]);
  const { error } = await supabase
    .from("restaurant_photos")
    .delete()
    .eq("id", id);

  if (error) console.error("[removePhoto]", error);
  revalidatePath(`/dashboard/${restaurantId}/photos`);
  revalidatePath(`/dashboard/${restaurantId}/reservations/configuration`);
}

/**
 * La légende d'une photo déjà en ligne. Elle s'écrit après coup : on met
 * ses photos d'abord, on les nomme ensuite — et celles envoyées avant
 * l'existence des légendes ne sont pas à renvoyer pour autant.
 */
export async function legenderPhoto(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  const restaurantId = formData.get("restaurant_id") as string;

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_photos")
    .update({ legende: legendeSaine(formData.get("legende")) })
    .eq("id", id);

  if (error) console.error("[legenderPhoto]", error);

  // Sans ces deux lignes, la légende est bien en base mais l'écran affiche
  // encore l'ancienne : le restaurateur croit que le bouton n'a rien fait.
  revalidatePath(`/dashboard/${restaurantId}/photos`);
  revalidatePath(`/dashboard/${restaurantId}/reservations/configuration`);
}

/**
 * Désigne la photo qui ouvre la vitrine.
 *
 * Écrit sur le restaurant plutôt qu'un drapeau sur la photo : une seule
 * peut être la couverture, et une référence unique le garantit sans
 * qu'on ait à en décocher une autre — donc sans qu'un double clic laisse
 * deux couvertures ou zéro.
 *
 * Passe par la session, pas par la clé de service : c'est la RLS qui
 * vérifie que ce restaurant est bien le sien.
 */
export async function definirCouverture(formData: FormData): Promise<void> {
  const restaurantId = formData.get("restaurant_id") as string;
  const photoId = (formData.get("photo_id") as string | null) || null;

  const supabase = await createClient();

  // La photo doit appartenir à ce restaurant. Sans cette vérification, un
  // identifiant emprunté afficherait la salle d'un confrère en couverture.
  if (photoId) {
    const { data } = await supabase
      .from("restaurant_photos")
      .select("id")
      .eq("id", photoId)
      .eq("restaurant_id", restaurantId)
      .maybeSingle();
    if (!data) return;
  }

  const { error } = await supabase
    .from("restaurants")
    .update({ photo_couverture_id: photoId })
    .eq("id", restaurantId);

  if (error) console.error("[definirCouverture]", error);

  revalidatePath(`/dashboard/${restaurantId}/photos`);
  revalidatePath(`/dashboard/${restaurantId}/vitrine`);
}
