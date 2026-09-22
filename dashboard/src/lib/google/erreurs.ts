/**
 * Traduire un échec de Google en une phrase qui dise quoi faire.
 *
 * Nos appels recopient la réponse de Google dans le message de l'erreur
 * qu'ils lèvent : le code HTTP et le corps JSON s'y trouvent en entier.
 * Il suffit de les lire, au lieu d'afficher partout la même phrase.
 *
 * Un message unique pour toutes les causes n'est pas un message : il est
 * vrai une fois sur trois, et les deux autres fois il envoie quelqu'un
 * chercher au mauvais endroit sans qu'il puisse s'en douter. Pire encore
 * quand il devine à voix haute — « c'est peut-être en cours
 * d'activation » fait attendre une chose qui n'arrivera jamais seule.
 *
 * Deux familles d'API, deux jeux de remèdes, mais la même lecture : d'où
 * les prédicats ici, et une fonction par écran.
 */

const texteDe = (erreur: unknown): string =>
  erreur instanceof Error ? erreur.message : String(erreur);

/** Le projet Google Cloud n'a pas activé cette API-là. */
const apiEteinte = (t: string) =>
  /accessNotConfigured|has not been used in project|SERVICE_DISABLED/i.test(t);

/**
 * Le quota est à zéro.
 *
 * Signature de l'API Business Profile tant que le dossier d'accès n'est
 * pas accordé : l'API s'active, et chaque appel se heurte à un quota nul.
 * Rien ne se débloque avec le temps.
 */
const quotaNul = (t: string) =>
  /RESOURCE_EXHAUSTED|Quota exceeded|rateLimitExceeded|\b429\b/i.test(t);

/** Le jeton ne porte pas l'autorisation qu'il faudrait. */
const jetonCourt = (t: string) =>
  /insufficient|invalid_grant|ACCESS_TOKEN_SCOPE|unauthorized|\b401\b/i.test(t);

const interdit = (t: string) => /\b403\b|forbidden|permission/i.test(t);
const introuvable = (t: string) => /\b404\b|notFound/i.test(t);

const RECONNECTER =
  "Ouvrez Connexions, déconnectez Google puis reconnectez-le : " +
  "l'autorisation sera demandée cette fois-ci.";

/** Ce qu'on écrit quand le tort est de notre côté, et pas du sien. */
const CHEZ_NOUS =
  "Ce n'est pas un réglage de votre côté : prévenez-nous à contact@klarr.net.";

/** Search Console — les requêtes réellement tapées. */
export function expliquerSearchConsole(erreur: unknown): string {
  const t = texteDe(erreur);

  if (apiEteinte(t)) {
    return `L'API Search Console n'est pas activée dans le projet Google Cloud de Klarr. ${CHEZ_NOUS}`;
  }
  if (jetonCourt(t)) {
    return `Le compte Google a été relié avant que Klarr demande l'accès à Search Console. ${RECONNECTER}`;
  }
  if (introuvable(t)) {
    return (
      "Cette propriété n'existe plus dans Search Console. " +
      "Choisissez-en une autre, ou laissez le champ vide."
    );
  }
  if (interdit(t)) {
    return (
      "Le compte Google relié n'a pas accès à cette propriété Search " +
      "Console. Vérifiez qu'il y figure comme propriétaire ou utilisateur " +
      "dans les paramètres de la propriété."
    );
  }
  return "Search Console n'a pas répondu. Si cela dure, écrivez-nous à contact@klarr.net.";
}

/** Business Profile — les fiches d'établissement. */
export function expliquerBusinessProfile(erreur: unknown): string {
  const t = texteDe(erreur);

  // Le quota d'abord : Google le rend en 429, mais aussi parfois en 403
  // accompagné de « RESOURCE_EXHAUSTED ». Tester l'interdiction avant
  // masquerait le seul cas qui ne se règle pas tout seul.
  if (quotaNul(t)) {
    return (
      "L'accès à l'API Google Business Profile n'a pas encore été accordé " +
      `à Klarr par Google. La demande est déposée et attend leur réponse. ${CHEZ_NOUS}`
    );
  }
  if (apiEteinte(t)) {
    return `L'API Google Business Profile n'est pas activée dans le projet Google Cloud de Klarr. ${CHEZ_NOUS}`;
  }
  if (jetonCourt(t)) {
    return `Le compte Google a été relié avant que Klarr demande l'accès aux fiches. ${RECONNECTER}`;
  }
  if (interdit(t)) {
    return (
      "Ce compte Google n'a le droit de gérer aucune fiche d'établissement. " +
      "Vérifiez qu'il figure bien comme propriétaire ou gestionnaire sur " +
      "business.google.com."
    );
  }
  if (introuvable(t)) {
    return "Aucune fiche d'établissement n'est rattachée à ce compte Google.";
  }
  return "Google n'a pas répondu. Si cela dure, écrivez-nous à contact@klarr.net.";
}
