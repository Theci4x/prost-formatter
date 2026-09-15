import "server-only";

/**
 * L'envoi d'e-mails.
 *
 * Deux principes, et ils commandent tout ce fichier.
 *
 * **Un e-mail qui ne part pas ne doit jamais faire échouer une
 * réservation.** Le client a rempli son formulaire, la table est prise :
 * lui afficher une erreur parce que notre fournisseur est en panne serait
 * absurde. Toutes les fonctions d'ici renvoient un résultat, aucune ne
 * lève.
 *
 * **Et un e-mail qu'on croit envoyé est pire que pas d'e-mail du tout.**
 * D'où la trace en base : ce qui a échoué se voit, et se renvoie.
 */

export type Resultat = { envoye: boolean; erreur: string | null };

/**
 * L'adresse d'expédition. Le domaine doit être vérifié chez le
 * fournisseur, sans quoi tout part en indésirable — ou ne part pas.
 */
function expediteur(): string {
  return process.env.EMAIL_EXPEDITEUR ?? "Klarr <reservations@klarr.net>";
}

/**
 * L'adresse de l'API. Détournée en test vers un faux serveur, comme pour
 * Stripe et Google : sans ça, aucun test ne peut vérifier qu'un e-mail
 * part, et on ne le découvre qu'en production.
 */
function apiResend(): string {
  return process.env.RESEND_BASE_URL ?? "https://api.resend.com";
}

/**
 * Envoie un message. Sans clé configurée, on ne fait rien et on le dit :
 * en développement comme sur un déploiement pas encore relié, c'est le
 * comportement attendu — pas une erreur à corriger.
 */
export async function envoyerCourriel({
  destinataire,
  sujet,
  texte,
  html,
  repondreA,
}: {
  destinataire: string;
  sujet: string;
  texte: string;
  html: string;
  /** L'adresse du restaurant : le client répond à lui, pas à nous. */
  repondreA?: string;
}): Promise<Resultat> {
  const cle = process.env.RESEND_API_KEY;
  if (!cle) {
    console.warn(
      `[courriel] RESEND_API_KEY absente : « ${sujet} » non envoyé à ${destinataire}.`,
    );
    return { envoye: false, erreur: "Envoi non configuré." };
  }

  // Une adresse vide ou bricolée ne doit pas partir chez le fournisseur :
  // certaines réservations téléphoniques portent « — » en guise d'e-mail.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destinataire)) {
    return { envoye: false, erreur: "Adresse invalide." };
  }

  try {
    const reponse = await fetch(`${apiResend()}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cle}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: expediteur(),
        to: [destinataire],
        subject: sujet,
        text: texte,
        html,
        ...(repondreA ? { reply_to: repondreA } : {}),
      }),
      // Un fournisseur qui ne répond pas ne doit pas tenir la requête du
      // client ouverte pendant trente secondes.
      signal: AbortSignal.timeout(8000),
    });

    if (!reponse.ok) {
      const detail = await reponse.text().catch(() => "");
      const erreur = `${reponse.status} ${detail.slice(0, 200)}`;
      console.error("[courriel]", sujet, erreur);
      return { envoye: false, erreur };
    }

    return { envoye: true, erreur: null };
  } catch (cause) {
    const erreur = cause instanceof Error ? cause.message : String(cause);
    console.error("[courriel]", sujet, erreur);
    return { envoye: false, erreur };
  }
}
