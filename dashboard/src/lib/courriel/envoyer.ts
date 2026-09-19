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
  expediteur: de,
}: {
  destinataire: string;
  sujet: string;
  texte: string;
  html: string;
  /** L'adresse du restaurant : le client répond à lui, pas à nous. */
  repondreA?: string;
  /**
   * L'expéditeur, quand il ne doit pas être celui du transactionnel.
   * Un essai de campagne part du domaine des campagnes, sans quoi il ne
   * prouve rien : c'est précisément l'expéditeur qu'on veut voir arriver.
   */
  expediteur?: string;
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
        from: de ?? expediteur(),
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

/**
 * Un message d'un lot, tel qu'il part chez le fournisseur.
 *
 * `expediteur` est ici explicite, alors que l'envoi à l'unité le déduit
 * de l'environnement : une campagne part au nom du restaurant et depuis
 * le domaine réservé au marketing, jamais depuis celui qui porte les
 * confirmations de réservation. Mélanger les deux, c'est risquer qu'une
 * confirmation tombe en indésirable parce qu'une newsletter a déplu.
 */
export type Message = {
  expediteur: string;
  destinataire: string;
  sujet: string;
  texte: string;
  html: string;
  repondreA?: string;
  /**
   * Les en-têtes bruts, dont `List-Unsubscribe`.
   *
   * La documentation du lot ne dit pas s'il les accepte message par
   * message — elle mentionne l'absence de pièces jointes et de
   * programmation, et se tait sur le reste. On les envoie donc en
   * comptant qu'ils passent, sans en dépendre : ce qui tient la
   * conformité, c'est le lien de désinscription dans le corps du
   * message. L'en-tête n'ajoute que le bouton natif de Gmail.
   */
  entetes?: Record<string, string>;
};

export type ResultatLot =
  | { ok: true; identifiants: (string | null)[] }
  | { ok: false; erreur: string };

/** Ce que le fournisseur accepte en une fois. */
export const LOT_MAX = 100;

/**
 * Envoie jusqu'à cent messages en un appel.
 *
 * Cent appels séparés pour cent destinataires, à deux requêtes par
 * seconde, dépassent la minute que Vercel accorde à une tâche planifiée —
 * l'envoi serait coupé au même endroit chaque nuit, sans que rien ne le
 * dise. Le lot ramène une campagne de mille personnes à dix appels.
 *
 * Ne lève jamais, comme le reste de ce fichier : c'est l'appelant qui
 * décide ce qu'on réessaie, à partir du journal d'envoi.
 */
export async function envoyerLot(messages: Message[]): Promise<ResultatLot> {
  if (messages.length === 0) return { ok: true, identifiants: [] };
  if (messages.length > LOT_MAX) {
    return { ok: false, erreur: `Lot de ${messages.length} > ${LOT_MAX}.` };
  }

  const cle = process.env.RESEND_API_KEY;
  if (!cle) {
    console.warn(
      `[courriel] RESEND_API_KEY absente : lot de ${messages.length} non envoyé.`,
    );
    return { ok: false, erreur: "Envoi non configuré." };
  }

  try {
    const reponse = await fetch(`${apiResend()}/emails/batch`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cle}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        messages.map((m) => ({
          from: m.expediteur,
          to: [m.destinataire],
          subject: m.sujet,
          text: m.texte,
          html: m.html,
          ...(m.repondreA ? { reply_to: m.repondreA } : {}),
          ...(m.entetes ? { headers: m.entetes } : {}),
        })),
      ),
      // Plus long que l'envoi à l'unité : cent messages d'un coup, c'est
      // cent fois le travail chez le fournisseur.
      signal: AbortSignal.timeout(20000),
    });

    if (!reponse.ok) {
      const detail = await reponse.text().catch(() => "");
      const erreur = `${reponse.status} ${detail.slice(0, 300)}`;
      console.error("[courriel] lot", erreur);
      return { ok: false, erreur };
    }

    // La réponse rend les identifiants dans l'ordre du lot. S'ils
    // manquent, l'envoi a tout de même eu lieu : on ne fait pas échouer
    // une campagne partie parce qu'on n'a pas su la référencer.
    const corps = (await reponse.json().catch(() => null)) as {
      data?: { id?: string }[];
    } | null;
    const identifiants = messages.map(
      (_, rang) => corps?.data?.[rang]?.id ?? null,
    );
    return { ok: true, identifiants };
  } catch (cause) {
    const erreur = cause instanceof Error ? cause.message : String(cause);
    console.error("[courriel] lot", erreur);
    return { ok: false, erreur };
  }
}
