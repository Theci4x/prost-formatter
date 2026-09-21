import "server-only";
import { envoyerCourriel } from "@/lib/courriel/envoyer";
import {
  crochetDu,
  veutCourriel,
  type Canal,
  type ChoixCourriel,
} from "@/lib/notifications/canaux";

/**
 * Ce que Klarr se dit à soi-même.
 *
 * Un prospect qui remplit le formulaire à onze heures et qu'on rappelle le
 * soir est perdu ; rappelé dans les dix minutes, il est impressionné. Ces
 * notifications n'existent que pour ce délai-là — elles ne servent jamais
 * à archiver quoi que ce soit, la base le fait déjà.
 *
 * Deux canaux, le second facultatif : l'e-mail part toujours vers les
 * adresses de `ADMIN_EMAILS` (la même liste qui ouvre /admin — une seule
 * liste à tenir à jour), et Slack ne reçoit que si le crochet de son
 * canal est renseigné. Tant qu'il ne l'est pas, aucune donnée ne sort
 * chez un prestataire de plus.
 *
 * Et deux canaux Slack, parce qu'une panne et un prospect ne s'annoncent
 * pas au même monde. Une erreur serveur qui tombe dans le canal de
 * l'équipe réveille tout le monde pour rien ; elle a le sien,
 * `#bug-report`. Un canal sans crochet ne reçoit rien — on ne se rabat
 * **jamais** sur le canal général, ce serait annoncer à tous exactement
 * ce qu'on cherchait à ne pas annoncer.
 *
 * Rien d'ici ne lève ni ne bloque : une inscription ne doit pas échouer
 * parce qu'on n'a pas su se prévenir.
 */

export type { Canal, ChoixCourriel };

export type Notification = {
  /** Une ligne, lisible sur l'écran de veille d'un téléphone. */
  titre: string;
  /** Les faits, un par ligne. Pas de phrases. */
  lignes: string[];
  /** Où aller pour agir, quand il y a quelque chose à faire. */
  lien?: { libelle: string; url: string };
  /**
   * L'adresse de celui qui attend une réponse. Répondre depuis sa boîte
   * suffit alors à lui écrire : sans ça, on recopie une adresse à la main,
   * et on se trompe.
   */
  repondreA?: string;
  /** Le canal Slack. L'e-mail, lui, part toujours au même endroit. */
  canal?: Canal;
  /**
   * L'e-mail. Vrai par défaut ; « secours » ne l'envoie que si Slack n'a
   * rien reçu.
   */
  courriel?: ChoixCourriel;
};

export type BilanNotification = {
  courriels: number;
  slack: boolean;
};

/** Les adresses internes. Vide = personne, et on le dit dans les logs. */
export function destinatairesInternes(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((adresse) => adresse.trim())
    .filter(Boolean);
}

function versTexte({ titre, lignes, lien }: Notification): string {
  const corps = [titre, "", ...lignes];
  if (lien) corps.push("", `${lien.libelle} : ${lien.url}`);
  return corps.join("\n");
}

function versHtml({ titre, lignes, lien }: Notification): string {
  const items = lignes
    .map(
      (ligne) =>
        `<p style="margin:0 0 6px;font-size:15px;color:#3f3f46;">${ligne}</p>`,
    )
    .join("");
  const bouton = lien
    ? `<p style="margin:18px 0 0;"><a href="${lien.url}" style="font-size:15px;color:#E8763A;">${lien.libelle}</a></p>`
    : "";
  return (
    `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;` +
    `max-width:520px;padding:24px;">` +
    `<p style="margin:0 0 14px;font-size:17px;font-weight:600;color:#1B2A41;">${titre}</p>` +
    `${items}${bouton}</div>`
  );
}

/**
 * Slack, quand il est branché. Le corps reste volontairement pauvre :
 * un titre en gras, les faits, le lien. Une notification qu'on lit d'un
 * coup d'œil sur un quai de gare vaut mieux qu'une belle carte.
 */
async function posterSurSlack(notification: Notification): Promise<boolean> {
  const webhook = crochetDu(notification.canal ?? "equipe");
  // Pas de crochet pour ce canal : on se tait. Se rabattre sur le canal
  // général reviendrait à publier la panne devant toute l'équipe.
  if (!webhook) return false;

  const lignes = [`*${notification.titre}*`, ...notification.lignes];
  if (notification.lien) {
    lignes.push(`<${notification.lien.url}|${notification.lien.libelle}>`);
  }

  try {
    const reponse = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: lignes.join("\n") }),
      signal: AbortSignal.timeout(5000),
    });
    if (!reponse.ok) {
      console.error("[notification] slack", reponse.status);
      return false;
    }
    return true;
  } catch (cause) {
    console.error("[notification] slack", cause);
    return false;
  }
}

/**
 * Prévient l'équipe. Ne lève jamais : l'appelant a autre chose à faire
 * réussir que cet envoi.
 */
export async function notifierInterne(
  notification: Notification,
): Promise<BilanNotification> {
  const sujet = `Klarr — ${notification.titre}`;
  const texte = versTexte(notification);
  const html = versHtml(notification);

  const partirent = async (): Promise<number> => {
    const adresses = destinatairesInternes();
    if (adresses.length === 0) {
      console.warn(
        `[notification] ADMIN_EMAILS absente : « ${notification.titre} » sans destinataire.`,
      );
      return 0;
    }
    const envois = await Promise.all(
      adresses.map((destinataire) =>
        envoyerCourriel({
          destinataire,
          sujet,
          texte,
          html,
          repondreA: notification.repondreA,
        }),
      ),
    );
    return envois.filter((envoi) => envoi.envoye).length;
  };

  // Une notification de secours doit savoir si Slack a reçu avant de
  // décider : elle attend donc son tour. Toutes les autres partent des
  // deux côtés à la fois, comme avant.
  if (notification.courriel === "secours") {
    const slack = await posterSurSlack(notification);
    return {
      courriels: veutCourriel(notification.courriel, slack)
        ? await partirent()
        : 0,
      slack,
    };
  }

  const [courriels, slack] = await Promise.all([
    veutCourriel(notification.courriel, false) ? partirent() : 0,
    posterSurSlack(notification),
  ]);

  return { courriels, slack };
}
