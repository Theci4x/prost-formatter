import type { SupabaseClient } from "@supabase/supabase-js";
import type { MenuItem } from "@/types/menu";

/**
 * La carte publiée d'un établissement — ou rien du tout.
 *
 * Ne lève jamais et ne propage jamais d'erreur, volontairement. La page de
 * réservation est le produit : elle ne doit pas tomber parce qu'une colonne
 * de la carte manque encore en base. Une migration pas encore passée, une
 * table absente, un droit refusé — dans tous les cas la page s'affiche sans
 * carte plutôt que de renvoyer une 404 à un client qui voulait réserver.
 *
 * C'est exactement ce qui est arrivé : ajouter « carte_publique » à la
 * requête principale de la page publique la faisait échouer entièrement
 * tant que la migration n'était pas passée, et l'adresse publique du
 * restaurateur renvoyait 404.
 */

export type CartePubliee = { publiee: boolean; items: MenuItem[] };

const RIEN: CartePubliee = { publiee: false, items: [] };

export async function cartePubliee(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<CartePubliee> {
  try {
    const { data: drapeau, error: erreurDrapeau } = await supabase
      .from("restaurants")
      .select("carte_publique")
      .eq("id", restaurantId)
      .maybeSingle();

    if (erreurDrapeau) {
      console.error("[cartePubliee] drapeau", erreurDrapeau);
      return RIEN;
    }
    const publiee =
      (drapeau as { carte_publique: boolean | null } | null)?.carte_publique ===
      true;
    if (!publiee) return RIEN;

    const { data, error } = await supabase
      .from("restaurant_menu_items")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("actif", true);

    if (error) {
      console.error("[cartePubliee] plats", error);
      return RIEN;
    }
    return { publiee: true, items: (data ?? []) as MenuItem[] };
  } catch (erreur) {
    console.error("[cartePubliee]", erreur);
    return RIEN;
  }
}
