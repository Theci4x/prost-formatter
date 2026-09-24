import { createServiceClient } from "@/lib/supabase/service";

/**
 * Une session perdue, notée pour de bon.
 *
 * Les journaux Vercel s'effacent en une heure ; une déconnexion se
 * découvre le lendemain matin. Cette ligne, elle, reste. Rien de secret :
 * les noms des cookies, jamais leur valeur.
 *
 * Ne lève jamais et n'attend pas plus d'une seconde et demie : noter une
 * panne ne doit pas en créer une.
 */
export type PerteDeSession = {
  chemin: string;
  genre: string;
  motif: string | null;
  code: string | null;
  cookies: string[];
  cookiesEffaces: boolean;
  redirige: boolean;
  navigateur: string;
};

export async function noterPerteDeSession(perte: PerteDeSession) {
  try {
    const insertion = createServiceClient()
      .from("journal_sessions")
      .insert({
        chemin: perte.chemin.slice(0, 300),
        genre: perte.genre,
        motif: perte.motif?.slice(0, 300) ?? null,
        code: perte.code?.slice(0, 80) ?? null,
        cookies: perte.cookies.slice(0, 20),
        cookies_effaces: perte.cookiesEffaces,
        redirige: perte.redirige,
        navigateur: perte.navigateur.slice(0, 160),
      })
      .then(({ error }) => {
        if (error) console.warn("[session/journal]", error.message);
      });
    await Promise.race([insertion, new Promise((r) => setTimeout(r, 1500))]);
  } catch (cause) {
    console.warn("[session/journal]", cause);
  }
}

/** Le cookie qui porte la session, découpé ou non : « sb-…-auth-token(.N) ». */
export const COOKIE_SESSION = /^sb-[^-]+-auth-token(\.\d+)?$/;

/** Le genre d'une requête, pour savoir laquelle a perdu la session. */
export function genreDeRequete(entetes: Headers): string {
  if (entetes.get("next-action")) return "action";
  if (
    entetes.get("next-router-prefetch") ||
    entetes.get("sec-purpose")?.includes("prefetch") ||
    entetes.get("purpose") === "prefetch"
  ) {
    return "prechargement";
  }
  if (entetes.get("rsc")) return "navigation";
  return entetes.get("sec-fetch-dest") ?? "inconnu";
}
