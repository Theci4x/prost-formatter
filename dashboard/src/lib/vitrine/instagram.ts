import type { SupabaseClient } from "@supabase/supabase-js";
import { getInstagramMedia, type MediaInstagram } from "@/lib/facebook/oauth";

/**
 * Le flux Instagram d'un établissement, pour sa vitrine publique.
 *
 * L'Instagram d'un restaurant *est* sa vitrine : les assiettes, la salle,
 * l'ambiance, tenus à jour sans y penser. Une page Klarr sans photos reste
 * vide jusqu'à ce que le restaurateur en charge — et il n'en charge
 * jamais. Reprendre son flux rend sa page vivante en permanence sans rien
 * lui demander.
 *
 * Ne lève jamais, comme `reseauxPublics` : une panne chez Meta, un jeton
 * révoqué ou une table absente ne doivent pas faire tomber une page
 * publique pour une bande d'images. C'est un bonus, pas du contenu.
 */
export async function fluxInstagram(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<{ pseudo: string; medias: MediaInstagram[] } | null> {
  try {
    const { data } = await supabase
      .from("social_connections")
      .select(
        "instagram_business_account_id, instagram_username, facebook_page_access_token",
      )
      .eq("restaurant_id", restaurantId)
      .maybeSingle();

    const connexion = data as {
      instagram_business_account_id: string | null;
      instagram_username: string | null;
      facebook_page_access_token: string | null;
    } | null;

    if (
      !connexion?.instagram_business_account_id ||
      !connexion.facebook_page_access_token
    ) {
      return null;
    }

    const medias = await getInstagramMedia(
      connexion.instagram_business_account_id,
      connexion.facebook_page_access_token,
    );
    if (medias.length === 0) return null;

    return {
      pseudo: connexion.instagram_username ?? "",
      medias,
    };
  } catch (erreur) {
    console.error("[vitrine/instagram]", erreur);
    return null;
  }
}
