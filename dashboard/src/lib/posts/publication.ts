import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getValidAccessToken } from "@/lib/google/connection";
import { listAccounts, publierPostLocal } from "@/lib/google/business";
import { aPublier, actionGoogle, type Bouton } from "@/lib/posts/regles";

/**
 * La file d'attente des publications.
 *
 * Elle se vide chaque nuit, en même temps que les autres balayages.
 * L'imprécision est assumée et dite au restaurateur : le plan Vercel
 * n'autorise que deux tâches quotidiennes, déjà prises. Une publication
 * programmée pour mardi part donc au premier passage qui suit — pas à
 * l'heure choisie. Pour un post Google qui vit une semaine, le jour
 * compte et l'heure non.
 *
 * Un échec ne brûle pas la publication : elle reste programmée, son
 * compteur monte, et elle repart la nuit suivante. C'est ce qui permet à
 * la file de se vider toute seule le jour où Google accorde l'accès à son
 * API de publication — sans qu'on retouche une ligne.
 */

export type BilanPosts = {
  echus: number;
  publies: number;
  reportes: number;
};

type Ligne = {
  id: string;
  restaurant_id: string;
  texte: string;
  photo_id: string | null;
  bouton: Bouton | null;
  bouton_url: string | null;
  publier_le: string;
  statut: string;
  tentatives: number;
};

export async function publierLesPosts({
  supabase,
  maintenant,
  plafond = 50,
}: {
  supabase: SupabaseClient;
  maintenant: Date;
  plafond?: number;
}): Promise<BilanPosts> {
  const { data, error } = await supabase
    .from("restaurant_posts")
    .select("*")
    .eq("statut", "programme")
    .lte("publier_le", maintenant.toISOString())
    .order("publier_le")
    .limit(plafond);

  if (error) {
    console.error("[posts] lecture impossible", error.message);
    return { echus: 0, publies: 0, reportes: 0 };
  }

  const lignes = ((data ?? []) as Ligne[]).filter((ligne) =>
    aPublier(ligne, maintenant),
  );
  const bilan: BilanPosts = { echus: lignes.length, publies: 0, reportes: 0 };
  if (lignes.length === 0) return bilan;

  // Les photos d'un coup : une requête par publication ferait autant
  // d'allers-retours que de posts pour la même poignée d'adresses.
  const photoIds = [
    ...new Set(
      lignes.map((l) => l.photo_id).filter((id): id is string => !!id),
    ),
  ];
  const photos = new Map<string, string>();
  if (photoIds.length > 0) {
    const { data: photosData } = await supabase
      .from("restaurant_photos")
      .select("id, url")
      .in("id", photoIds);
    for (const photo of (photosData ?? []) as { id: string; url: string }[]) {
      photos.set(photo.id, photo.url);
    }
  }

  for (const ligne of lignes) {
    try {
      const { data: connexionData } = await supabase
        .from("google_business_connections")
        .select(
          "restaurant_id, access_token, refresh_token, token_expires_at, account_name, location_name",
        )
        .eq("restaurant_id", ligne.restaurant_id)
        .maybeSingle();

      const connexion = connexionData as {
        restaurant_id: string;
        access_token: string;
        refresh_token: string;
        token_expires_at: string;
        account_name: string | null;
        location_name: string | null;
      } | null;

      if (!connexion?.location_name) {
        throw new Error("Aucune fiche Google reliée à cet établissement.");
      }

      const accessToken = await getValidAccessToken(supabase, connexion);

      // Les connexions établies avant que le compte soit retenu n'en ont
      // pas : on le retrouve une fois, et on le range pour la suite.
      let accountName = connexion.account_name;
      if (!accountName) {
        const comptes = await listAccounts(accessToken);
        accountName = comptes[0]?.name ?? null;
        if (accountName) {
          await supabase
            .from("google_business_connections")
            .update({ account_name: accountName })
            .eq("restaurant_id", ligne.restaurant_id);
        }
      }
      if (!accountName) throw new Error("Compte Google introuvable.");

      const nom = await publierPostLocal(
        accessToken,
        accountName,
        connexion.location_name,
        {
          texte: ligne.texte,
          photoUrl: ligne.photo_id
            ? (photos.get(ligne.photo_id) ?? null)
            : null,
          bouton: ligne.bouton
            ? { action: actionGoogle(ligne.bouton), url: ligne.bouton_url }
            : null,
        },
      );

      await supabase
        .from("restaurant_posts")
        .update({
          statut: "publie",
          publie_le: maintenant.toISOString(),
          google_post_name: nom,
          tentatives: ligne.tentatives + 1,
          derniere_erreur: null,
        })
        .eq("id", ligne.id);
      bilan.publies += 1;
    } catch (erreur) {
      const message =
        erreur instanceof Error ? erreur.message : "Publication impossible.";
      console.error("[posts]", ligne.id, message);
      await supabase
        .from("restaurant_posts")
        .update({
          tentatives: ligne.tentatives + 1,
          derniere_erreur: message.slice(0, 500),
        })
        .eq("id", ligne.id);
      bilan.reportes += 1;
    }
  }

  return bilan;
}
