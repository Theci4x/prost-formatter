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
