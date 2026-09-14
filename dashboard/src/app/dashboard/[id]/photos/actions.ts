"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "restaurant-photos";
// Au-delà, l'hébergeur refuse le corps de la requête avant que ce code ne
// s'exécute : la photo ne partirait nulle part et l'écran n'aurait rien à
// dire. Voir aussi serverActions.bodySizeLimit dans next.config.ts.
const TAILLE_MAX = 4 * 1024 * 1024;

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
