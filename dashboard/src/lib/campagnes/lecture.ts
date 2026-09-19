import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { compterSegment } from "@/lib/campagnes/segments";
import { SEGMENTS, type Segment } from "@/lib/campagnes/cibles";

/** Ce que les écrans lisent d'une campagne. */
export type Campagne = {
  id: string;
  objet: string;
  texte: string;
  bouton_libelle: string | null;
  bouton_url: string | null;
  segment: Segment;
  statut: "brouillon" | "programmee" | "en_cours" | "envoyee" | "echec";
  envoyer_le: string | null;
  envoyee_le: string | null;
  destinataires: number | null;
  derniere_erreur: string | null;
  created_at: string;
};

export const LIBELLE_STATUT: Record<Campagne["statut"], string> = {
  brouillon: "Brouillon",
  programmee: "Programmée",
  en_cours: "Envoi en cours",
  envoyee: "Envoyée",
  echec: "Échec",
};

/**
 * Combien de personnes recevraient, segment par segment.
 *
 * Quatre comptages en parallèle plutôt qu'une requête qui les ramène
 * tous : ce sont quatre conditions différentes sur la même vue, et
 * quatre `count` en tête ne coûtent rien à côté d'une lecture complète du
 * fichier.
 */
export async function compterLesSegments(
  supabase: SupabaseClient,
  restaurantId: string,
  maintenant: Date = new Date(),
): Promise<Record<Segment, number>> {
  const valeurs = await Promise.all(
    SEGMENTS.map((segment) =>
      compterSegment({ supabase, restaurantId, segment, maintenant }),
    ),
  );
  return Object.fromEntries(
    SEGMENTS.map((segment, rang) => [segment, valeurs[rang]]),
  ) as Record<Segment, number>;
}

/** Ce qui est réellement parti, pour une campagne donnée. */
export async function compterLesEnvois(
  supabase: SupabaseClient,
  campagneId: string,
): Promise<{ envoyes: number; echoues: number; restants: number }> {
  const compter = async (statut: string) => {
    const { count, error } = await supabase
      .from("restaurant_campagne_envois")
      .select("id", { count: "exact", head: true })
      .eq("campagne_id", campagneId)
      .eq("statut", statut);
    if (error) console.error("[campagnes] journal", error.message);
    return count ?? 0;
  };
  const [envoyes, echoues, restants] = await Promise.all([
    compter("envoye"),
    compter("echec"),
    compter("a_envoyer"),
  ]);
  return { envoyes, echoues, restants };
}
