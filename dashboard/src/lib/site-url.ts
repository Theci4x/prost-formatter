/**
 * L'adresse publique du site, sans barre oblique finale.
 *
 * Tout le monde compose ensuite `${siteUrl()}/quelque-chose`. Sans ce
 * nettoyage, une valeur saisie « https://klarr.net/ » — ce qu'on copie
 * naturellement depuis un navigateur — produit « https://klarr.net//auth/
 * callback ». Google, TikTok et Stripe comparent les URL de redirection
 * caractère par caractère : une barre en trop et la connexion est refusée,
 * avec un message qui n'explique rien.
 */
export function siteUrl(): string {
  const brut = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!brut) return "https://localhost:3000";
  return brut.replace(/\/+$/, "");
}
