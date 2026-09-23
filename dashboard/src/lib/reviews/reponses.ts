import type { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Ce qui identifie un avis d'un appel à l'autre : plateforme, auteur et
 * date de publication. Les API ne donnent pas d'identifiant commun, mais
 * ces trois-là reviennent à l'identique.
 */
export function cleAvis(avis: {
  platform: string;
  author: string;
  publishedAt: string | null;
}): string {
  return `${avis.platform}:${avis.author.trim()}:${avis.publishedAt ?? ""}`.slice(
    0,
    300,
  );
}

export type ReponseEnregistree = { reponse: string; reponduLe: string };

/**
 * Les réponses déjà données. Sans la migration 0081, la table manque :
 * on rend une carte vide et un drapeau, pour que l'écran le dise au lieu
 * d'échouer.
 */
export async function chargerReponses(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<{
  reponses: Map<string, ReponseEnregistree>;
  tableAbsente: boolean;
}> {
  const { data, error } = await supabase
    .from("restaurant_avis_reponses")
    .select("cle, reponse, repondu_le")
    .eq("restaurant_id", restaurantId);

  const reponses = new Map<string, ReponseEnregistree>();
  for (const ligne of (data ?? []) as {
    cle: string;
    reponse: string;
    repondu_le: string;
  }[]) {
    reponses.set(ligne.cle, {
      reponse: ligne.reponse,
      reponduLe: ligne.repondu_le,
    });
  }
  return {
    reponses,
    tableAbsente: ["42P01", "PGRST205"].includes(error?.code ?? ""),
  };
}
