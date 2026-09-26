import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { publicationsGoogleOuvertes } from "@/lib/google/business";
import { cheminFiche, ouvrirFicheGoogle } from "@/lib/google/fiche";
import { AccesGoogleFerme, listerAvisGoogle } from "@/lib/google/avis";
import type { PlatformReviews } from "@/lib/reviews/aggregate";

/**
 * Les avis Google lus sur la fiche du restaurateur, quand c'est possible.
 *
 * « ferme » : Google n'a pas encore ouvert l'accès, l'écran garde les avis
 * publics (Places) sans rien dire. Les autres états disent au
 * restaurateur l'étape qui lui manque pour répondre depuis Klarr.
 */
export type AvisGoogleDirect =
  | { etat: "ok"; donnees: PlatformReviews }
  | { etat: "ferme" | "non-connecte" | "sans-fiche" | "erreur" };

export async function chargerAvisGoogleDirect(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<AvisGoogleDirect> {
  if (!publicationsGoogleOuvertes()) return { etat: "ferme" };

  try {
    const fiche = await ouvrirFicheGoogle(supabase, restaurantId);
    if (fiche.etat !== "prete") return { etat: fiche.etat };

    const { avis, note, total } = await listerAvisGoogle(
      fiche.accessToken,
      cheminFiche(fiche.accountName, fiche.locationName),
    );
    return {
      etat: "ok",
      donnees: {
        platform: "google",
        configured: true,
        found: true,
        rating: note,
        reviewCount: total,
        reviews: avis.map((a) => ({
          author: a.auteur,
          rating: a.note,
          text: a.texte,
          publishedAt: a.publieLe || null,
          url: null,
          googleName: a.name,
          reponsePubliee: a.reponse,
        })),
      },
    };
  } catch (erreur) {
    if (erreur instanceof AccesGoogleFerme) return { etat: "ferme" };
    console.error("[avis/googleDirect]", erreur);
    return { etat: "erreur" };
  }
}
