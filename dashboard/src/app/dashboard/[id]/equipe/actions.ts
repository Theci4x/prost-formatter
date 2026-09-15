"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { estProprietaire, roleSur, type Role } from "@/lib/equipe/roles";

export type MembreState = { error: string | null; rendu: number };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Ajoute un membre par son adresse e-mail. Il n'est pas prévenu par Klarr,
 * qui ne sait pas encore envoyer d'e-mail : c'est le restaurateur qui lui dit
 * de créer son compte avec cette adresse. Rien ne l'attend, rien ne se perd.
 */
export async function inviterMembre(
  prevState: MembreState,
  formData: FormData,
): Promise<MembreState> {
  const restaurantId = formData.get("restaurant_id") as string;
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const roleDemande = (formData.get("role") as string) ?? "";
  const rendu = prevState.rendu + 1;
  const echec = (error: string): MembreState => ({ error, rendu });

  // Le contrôle est aussi en base ; on le refait ici pour dire pourquoi
  // plutôt que de laisser l'écriture échouer sans explication.
  if (!estProprietaire(await roleSur(restaurantId))) {
    return echec("Seul le propriétaire peut composer l'équipe.");
  }
  if (!EMAIL.test(email)) return echec("Indique une adresse e-mail valide.");
  const role: Role = roleDemande === "gerant" ? "gerant" : "service";

  const supabase = await createClient();
  const { error } = await supabase.from("restaurant_membres").insert({
    restaurant_id: restaurantId,
    email,
    role,
  });

  if (error) {
    console.error("[inviterMembre]", error);
    // Le seul cas courant : l'adresse est déjà dans l'équipe.
    return echec(
      error.code === "23505"
        ? "Cette adresse fait déjà partie de l'équipe."
        : "L'ajout a échoué. Réessaie dans un instant.",
    );
  }

  revalidatePath(`/dashboard/${restaurantId}/equipe`);
  return { error: null, rendu };
}

export async function retirerMembre(formData: FormData) {
  const restaurantId = formData.get("restaurant_id") as string;
  const membreId = formData.get("membre_id") as string;
  if (!estProprietaire(await roleSur(restaurantId))) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_membres")
    .delete()
    .eq("id", membreId)
    .eq("restaurant_id", restaurantId);
  if (error) console.error("[retirerMembre]", error);

  revalidatePath(`/dashboard/${restaurantId}/equipe`);
}
