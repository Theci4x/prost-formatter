import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Les adresses publiques de l'établissement ailleurs sur le web.
 *
 * C'est le `sameAs` du balisage schema.org : il dit à Google et aux moteurs
 * de réponse que la page de réservation, la page Facebook, le compte
 * Instagram et le site du restaurant désignent un seul et même
 * établissement. Sans lui, chacun est une entité isolée, et la réputation
 * accumulée d'un côté ne profite pas à l'autre.
 */

/** Un identifiant de page ou de compte tel qu'on peut le mettre dans une URL. */
function identifiantSain(valeur: unknown): string | null {
  if (typeof valeur !== "string") return null;
  // L'arobase se saisit ou non selon les gens ; l'URL, elle, n'en veut
  // qu'une. Et un identifiant contenant une barre oblique ou un espace
  // fabriquerait une adresse fausse : mieux vaut ne rien déclarer.
  const propre = valeur.trim().replace(/^@+/, "");
  if (!propre || /[\s/?#]/.test(propre)) return null;
  return propre;
}

/** Une URL saisie par le restaurateur, ramenée à une adresse absolue. */
export function siteSain(valeur: unknown): string | null {
  if (typeof valeur !== "string") return null;
  const brut = valeur.trim();
  if (!brut) return null;
  // « monresto.fr » est ce que tape un restaurateur ; sans protocole, ce
  // n'est pas une URL et le balisage serait invalide.
  const avecProtocole = /^https?:\/\//i.test(brut) ? brut : `https://${brut}`;
  try {
    const url = new URL(avecProtocole);
    return url.hostname.includes(".") ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Les réseaux connectés, lus sans jamais toucher aux jetons d'accès rangés
 * dans les mêmes tables : on ne sélectionne que les identifiants publics.
 *
 * Ne lève jamais. Une table absente ou une migration en retard ne doit pas
 * faire tomber la page publique pour une ligne de balisage — c'est du
 * bonus, pas du contenu.
 */
export async function reseauxPublics(
  supabase: SupabaseClient,
  restaurantId: string,
  siteWeb?: string | null,
): Promise<string[]> {
  const adresses: string[] = [];

  const site = siteSain(siteWeb);
  if (site) adresses.push(site);

  try {
    const [social, tiktok] = await Promise.all([
      supabase
        .from("social_connections")
        .select("facebook_page_id, instagram_username")
        .eq("restaurant_id", restaurantId)
        .maybeSingle(),
      supabase
        .from("tiktok_connections")
        .select("tiktok_username")
        .eq("restaurant_id", restaurantId)
        .maybeSingle(),
    ]);

    const facebook = identifiantSain(
      (social.data as { facebook_page_id?: string } | null)?.facebook_page_id,
    );
    if (facebook) adresses.push(`https://www.facebook.com/${facebook}`);

    const instagram = identifiantSain(
      (social.data as { instagram_username?: string } | null)
        ?.instagram_username,
    );
    if (instagram) adresses.push(`https://www.instagram.com/${instagram}`);

    const tt = identifiantSain(
      (tiktok.data as { tiktok_username?: string } | null)?.tiktok_username,
    );
    if (tt) adresses.push(`https://www.tiktok.com/@${tt}`);
  } catch (erreur) {
    console.error("[reseauxPublics]", erreur);
  }

  // Un même compte déclaré deux fois vaut une déclaration douteuse.
  return [...new Set(adresses)];
}
