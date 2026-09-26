"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { exiger } from "@/lib/equipe/roles";
import { VOISINS_MAX } from "@/lib/voisins/comparaison";

type Candidat = {
  id: string;
  nom: string;
  adresse: string;
  distance: number | null;
  note: number | null;
  avis: number | null;
};

function lireCandidat(valeur: FormDataEntryValue): Candidat | null {
  try {
    const c = JSON.parse(String(valeur)) as Partial<Candidat>;
    if (typeof c.id !== "string" || !c.id || typeof c.nom !== "string") {
      return null;
    }
    const nombreOuNul = (x: unknown) =>
      typeof x === "number" && Number.isFinite(x) ? x : null;
    return {
      id: c.id.slice(0, 300),
      nom: c.nom.slice(0, 200),
      adresse: String(c.adresse ?? "").slice(0, 300),
      distance: nombreOuNul(c.distance),
      note: nombreOuNul(c.note),
      avis: nombreOuNul(c.avis),
    };
  } catch {
    return null;
  }
}

/**
 * Suivre les voisins cochés. Le premier relevé part avec eux — la note
 * et le nombre d'avis que la recherche vient de rendre — pour que la page
 * ait quelque chose à montrer tout de suite, sans attendre lundi.
 */
export async function suivreVoisins(formData: FormData): Promise<void> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  if (!restaurantId) return;
  await exiger(restaurantId, "gerant");

  const supabase = await createClient();
  const { count } = await supabase
    .from("restaurant_voisins")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId);
  const place = Math.max(0, VOISINS_MAX - (count ?? 0));

  const candidats = formData
    .getAll("candidat")
    .map(lireCandidat)
    .filter((c): c is Candidat => c !== null)
    .slice(0, place);

  if (candidats.length > 0) {
    const { error } = await supabase.from("restaurant_voisins").upsert(
      candidats.map((c) => ({
        restaurant_id: restaurantId,
        place_id: c.id,
        nom: c.nom,
        adresse: c.adresse || null,
        distance_m: c.distance != null ? Math.round(c.distance) : null,
      })),
      { onConflict: "restaurant_id,place_id", ignoreDuplicates: true },
    );
    if (error) console.error("[voisins/suivre]", error.message);

    const { error: erreurReleve } = await supabase
      .from("restaurant_voisins_releves")
      .upsert(
        candidats.map((c) => ({
          restaurant_id: restaurantId,
          place_id: c.id,
          note: c.note,
          nombre_avis: c.avis != null ? Math.round(c.avis) : null,
        })),
        { onConflict: "restaurant_id,place_id,releve_le" },
      );
    if (erreurReleve) console.error("[voisins/releve]", erreurReleve.message);
  }

  revalidatePath(`/dashboard/${restaurantId}/voisins`);
  redirect(`/dashboard/${restaurantId}/voisins`);
}

export async function retirerVoisin(formData: FormData): Promise<void> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const placeId = String(formData.get("place_id") ?? "");
  if (!restaurantId || !placeId) return;
  await exiger(restaurantId, "gerant");

  const supabase = await createClient();
  await supabase
    .from("restaurant_voisins")
    .delete()
    .eq("restaurant_id", restaurantId)
    .eq("place_id", placeId);
  revalidatePath(`/dashboard/${restaurantId}/voisins`);
}
