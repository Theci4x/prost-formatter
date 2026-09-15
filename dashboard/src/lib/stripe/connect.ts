import { getStripe } from "./client";

/**
 * Connexion du compte Stripe du restaurateur (Connect, comptes Standard).
 *
 * Klarr n'encaisse rien pour le compte de personne : il crée des paiements
 * sur le compte du restaurateur, qui reste seul responsable de ses virements,
 * de ses litiges et de ses remboursements. Aucun jeton n'est conservé — pour
 * un compte Standard, l'en-tête `Stripe-Account` suffit avec notre propre
 * clé, et le jeton renvoyé par l'OAuth vaut clé secrète du restaurateur.
 */

export type EtatConnexion = {
  accountId: string;
  nomAffiche: string | null;
  paiementsActifs: boolean;
  dossierComplet: boolean;
};

/** Ce qui manque pour encaisser, dit au restaurateur plutôt qu'en anglais. */
export function diagnostic(etat: {
  paiementsActifs: boolean;
  dossierComplet: boolean;
}): string | null {
  if (etat.paiementsActifs) return null;
  return etat.dossierComplet
    ? "Stripe vérifie encore ton dossier. Tant que c'est en cours, aucun paiement ne peut être encaissé."
    : "Ton dossier Stripe est incomplet : ouvre ton tableau de bord Stripe et termine l'inscription pour encaisser.";
}

/**
 * L'état anti-CSRF. Il porte l'identifiant du restaurant pour savoir, au
 * retour, lequel connecter — mais il n'est jamais cru sur parole : le cookie
 * doit correspondre, et la propriété du restaurant est revérifiée en base.
 */
export function construireEtat(restaurantId: string, alea: string): string {
  return `${alea}.${restaurantId}`;
}

export function lireEtat(
  etat: string | null,
  cookie: string | undefined,
): string | null {
  if (!etat || !cookie || etat !== cookie) return null;
  const [alea, restaurantId, ...reste] = etat.split(".");
  // Un identifiant contenant un point donnerait deux morceaux : on refuse
  // plutôt que de recoller au hasard.
  if (!alea || !restaurantId || reste.length > 0) return null;
  return restaurantId;
}

function clientId(): string {
  const id = process.env.STRIPE_CONNECT_CLIENT_ID;
  if (!id) throw new Error("STRIPE_CONNECT_CLIENT_ID manquante");
  return id;
}

export function urlDeConnexion(etat: string, redirectUri: string): string {
  return getStripe().oauth.authorizeUrl({
    client_id: clientId(),
    response_type: "code",
    // Écrire, parce qu'il faudra créer des paiements sur ce compte.
    scope: "read_write",
    redirect_uri: redirectUri,
    state: etat,
  });
}

/** Échange le code contre l'identifiant du compte, puis lit son état réel. */
export async function connecterCompte(code: string): Promise<EtatConnexion> {
  const stripe = getStripe();
  const jeton = await stripe.oauth.token({
    grant_type: "authorization_code",
    code,
  });

  const accountId = jeton.stripe_user_id;
  if (!accountId) throw new Error("Stripe n'a pas renvoyé de compte");

  const compte = await stripe.accounts.retrieve(accountId);
  return {
    accountId,
    nomAffiche:
      compte.business_profile?.name ?? compte.settings?.dashboard?.display_name ?? null,
    paiementsActifs: compte.charges_enabled === true,
    dossierComplet: compte.details_submitted === true,
  };
}

export async function deconnecterCompte(accountId: string): Promise<void> {
  await getStripe().oauth.deauthorize({
    client_id: clientId(),
    stripe_user_id: accountId,
  });
}

/** Relit l'état d'un compte déjà relié, pour ne pas afficher un état périmé. */
export async function relireCompte(
  accountId: string,
): Promise<Pick<EtatConnexion, "paiementsActifs" | "dossierComplet"> | null> {
  try {
    const compte = await getStripe().accounts.retrieve(accountId);
    return {
      paiementsActifs: compte.charges_enabled === true,
      dossierComplet: compte.details_submitted === true,
    };
  } catch (erreur) {
    // Compte révoqué chez Stripe : on ne fait pas tomber la page pour ça.
    console.error("[stripe/relireCompte]", erreur);
    return null;
  }
}
