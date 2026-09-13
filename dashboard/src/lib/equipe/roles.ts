import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { peutGerer, type Role } from "@/types/equipe";

export {
  DESCRIPTIONS_ROLE,
  LIBELLES_ROLE,
  estProprietaire,
  peutGerer,
  type Role,
} from "@/types/equipe";


/**
 * Le rôle d'un utilisateur sur un établissement.
 *
 * La base reste l'autorité : les politiques RLS refusent d'elles-mêmes ce
 * qu'un rôle n'a pas le droit de lire ou d'écrire. Ce qui suit sert à ne pas
 * proposer des portes fermées — un serveur qui voit « Connexions » dans son
 * menu et tombe sur une page vide se croit en panne.
 */
export async function roleSur(restaurantId: string): Promise<Role | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [restaurantResult, membreResult] = await Promise.all([
    supabase
      .from("restaurants")
      .select("proprietaire_id")
      .eq("id", restaurantId)
      .maybeSingle(),
    // Filtré sur lui-même : un membre voit toute l'équipe, une requête sans
    // condition ramènerait le rôle d'un collègue.
    supabase
      .from("restaurant_membres")
      .select("role")
      .eq("restaurant_id", restaurantId)
      .or(
        `user_id.eq.${user.id},email.eq.${(user.email ?? "").toLowerCase()}`,
      )
      .maybeSingle(),
  ]);

  const restaurant = restaurantResult.data as {
    proprietaire_id: string;
  } | null;
  // RLS ne renvoie rien si l'utilisateur n'a aucun lien avec l'établissement.
  if (!restaurant) return null;
  if (restaurant.proprietaire_id === user.id) return "proprietaire";

  const membre = membreResult.data as { role: Role } | null;
  return membre?.role ?? null;
}

/**
 * Referme une page qu'un rôle n'a pas à ouvrir. La base refuserait déjà les
 * données, mais l'écran s'afficherait vide en invitant à agir : autant
 * renvoyer là où la personne a effectivement du travail.
 *
 * Renvoie le rôle, pour que l'appelant s'en serve sans le relire.
 */
export async function exiger(
  restaurantId: string,
  minimum: "gerant" | "proprietaire",
): Promise<Role> {
  const role = await roleSur(restaurantId);
  if (role === null) notFound();

  const autorise =
    minimum === "proprietaire" ? role === "proprietaire" : peutGerer(role);
  if (!autorise) redirect(`/dashboard/${restaurantId}/service`);

  return role;
}
