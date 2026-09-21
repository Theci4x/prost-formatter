/**
 * À quel canal Slack s'adresse une notification.
 *
 * Séparé de `interne.ts`, qui est `server-only` et ne s'importe donc pas
 * hors de Next : ce qui décide quelque chose doit pouvoir se vérifier.
 *
 * Une panne et un prospect ne s'annoncent pas au même monde. Une erreur
 * serveur qui tombe dans le canal de l'équipe réveille tout le monde pour
 * rien ; elle a le sien.
 *
 * La règle qui compte est le **non-repli** : un canal sans crochet ne
 * reçoit rien. Se rabattre sur le canal général reviendrait à annoncer à
 * tous exactement ce qu'on cherchait à ne pas annoncer.
 */

export type Canal = "equipe" | "bugs";

const VARIABLE: Record<Canal, string> = {
  equipe: "SLACK_WEBHOOK_URL",
  bugs: "SLACK_WEBHOOK_BUGS",
};

export function crochetDu(
  canal: Canal,
  env: Record<string, string | undefined> = process.env,
): string | undefined {
  return env[VARIABLE[canal]];
}

/**
 * Faut-il doubler l'alerte d'un e-mail ?
 *
 * « secours » est le cas des pannes : on les lit dans Slack, et un
 * courriel de plus pour la même chose finit par ne plus se lire du tout.
 * Mais si Slack n'a rien reçu — crochet absent, canal supprimé, Slack en
 * panne —, le courriel repart. Une erreur qu'on perd est une erreur qu'on
 * découvre par un client mécontent.
 */
export type ChoixCourriel = boolean | "secours";

export function veutCourriel(
  choix: ChoixCourriel | undefined,
  slackEnvoye: boolean,
): boolean {
  if (choix === undefined) return true;
  if (choix === "secours") return !slackEnvoye;
  return choix;
}
