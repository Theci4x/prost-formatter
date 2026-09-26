import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { publicationsGoogleOuvertes } from "@/lib/google/business";
import { notifierEtablissement } from "@/lib/push/envoyer";

/**
 * La publication assistée : tant que Google n'a pas ouvert son API de
 * publication à Klarr, c'est le restaurateur qui publie — Klarr le
 * prévient le jour venu, et tout est prêt à coller.
 *
 * Un seul rappel par publication. Le compteur `tentatives` le retient :
 * en mode assisté, aucune tentative d'envoi n'a lieu, et le passage de 0
 * à 1 dit « prévenu ». Le jour où l'accès arrive, l'envoi automatique
 * reprend la file sans tenir compte de ce compteur.
 */

export type BilanRappels = { prevenus: number; publications: number };

export async function rappelerLesPosts({
  supabase,
  maintenant,
}: {
  supabase: SupabaseClient;
  maintenant: Date;
}): Promise<BilanRappels> {
  if (publicationsGoogleOuvertes()) return { prevenus: 0, publications: 0 };

  const { data, error } = await supabase
    .from("restaurant_posts")
    .select("id, restaurant_id")
    .eq("statut", "programme")
    .eq("tentatives", 0)
    .lte("publier_le", maintenant.toISOString())
    .limit(200);
  if (error) {
    console.error("[posts/rappels] lecture impossible", error.message);
    return { prevenus: 0, publications: 0 };
  }

  const parMaison = new Map<string, string[]>();
  for (const ligne of (data ?? []) as { id: string; restaurant_id: string }[]) {
    parMaison.set(ligne.restaurant_id, [
      ...(parMaison.get(ligne.restaurant_id) ?? []),
      ligne.id,
    ]);
  }

  let prevenus = 0;
  let publications = 0;
  for (const [restaurantId, ids] of parMaison) {
    await notifierEtablissement(supabase, restaurantId, {
      titre:
        ids.length > 1
          ? `${ids.length} publications Google à publier`
          : "Ta publication Google est prête",
      corps:
        "Le texte est prêt : copie-le, colle-le sur ta fiche Google, c'est fait en 30 secondes.",
      chemin: `/dashboard/${restaurantId}/posts`,
      etiquette: `posts-${restaurantId}`,
    });
    await supabase
      .from("restaurant_posts")
      .update({ tentatives: 1 })
      .in("id", ids);
    prevenus += 1;
    publications += ids.length;
  }
  return { prevenus, publications };
}
