import type { AuditResult } from "@/app/test-presence-google/actions";
import { formater } from "@/lib/audit/actions";
import { translations, type Lang } from "@/lib/i18n/testPresence";

/**
 * Les audits qu'on prépare pour aller voir un restaurateur.
 *
 * Même mesure que le test public, mais c'est nous qui la lançons : pas de
 * coordonnées à inventer, pas de rapport envoyé à la mauvaise adresse. On
 * repart avec une page à lui envoyer et un message déjà écrit.
 */

export type LigneAudit = {
  id: string;
  restaurant_name: string;
  ville: string;
  global_score: number | null;
  raw_signals: { resultat?: AuditResult } | null;
  jeton: string | null;
  langue: Lang;
  created_at: string;
};

export const COLONNES_AUDIT =
  "id, restaurant_name, ville, global_score, raw_signals, jeton, langue, created_at";

/** Le rapport tel qu'il a été montré, gardé avec les signaux. */
export function resultatDe(ligne: LigneAudit): AuditResult | null {
  return ligne.raw_signals?.resultat ?? null;
}

/** L'adresse publique du rapport, dans la langue voulue. */
export function lienRapport(base: string, jeton: string, langue: Lang): string {
  return `${base}/audit/${jeton}?lang=${langue}`;
}

/** Le geste qui compte le plus, dit en une ligne. */
function premiereAction(audit: AuditResult, langue: Lang): string | null {
  const action = audit.actions[0];
  if (!action) return null;
  const texte = translations[langue].audit.actions[action.cle];
  if (!texte) return null;
  const titre = formater(texte.titre, action.valeurs);
  // Un titre de liste, repris en milieu de phrase : sans majuscule.
  return langue === "zh"
    ? titre
    : titre.charAt(0).toLowerCase() + titre.slice(1);
}

/**
 * Le premier message, prêt à envoyer par WhatsApp, WeChat ou e-mail.
 *
 * Court, avec le chiffre et le geste le plus utile : c'est ce qui donne
 * envie d'ouvrir le lien. Il se retouche avant l'envoi — c'est un départ,
 * pas un texte figé.
 */
export function messageProspection(
  audit: AuditResult,
  lien: string,
  langue: Lang,
): string {
  const nom = audit.fiche?.nom ?? "";
  const action = premiereAction(audit, langue);

  if (langue === "zh") {
    return [
      "您好！我是 Klarr 的创始人，Klarr 是一款专为独立餐厅设计的工具。",
      `我为「${nom}」做了一份网络曝光度检测，得分 ${audit.score}/100。`,
      action ? `最值得先改进的一点：${action}。` : null,
      `完整报告在这里：${lien}`,
      "如果您愿意，我可以上门花 15 分钟，给您演示怎么改进。",
    ]
      .filter(Boolean)
      .join("\n");
  }
  if (langue === "en") {
    return [
      "Hello! I'm the founder of Klarr, a tool built for independent restaurants.",
      `I ran an online visibility check for your restaurant, ${nom}: ${audit.score}/100.`,
      action ? `The most useful thing to fix first: ${action}.` : null,
      `Here is the full report: ${lien}`,
      "If you like, I can drop by for 15 minutes and show you how to improve it.",
    ]
      .filter(Boolean)
      .join("\n");
  }
  return [
    "Bonjour ! Je suis le fondateur de Klarr, un outil pensé pour les restaurants indépendants.",
    `J'ai analysé la présence en ligne de votre restaurant, « ${nom} » : ${audit.score}/100.`,
    action ? `Le point le plus utile à corriger en premier : ${action}.` : null,
    `Le rapport complet est ici : ${lien}`,
    "Si vous voulez, je passe 15 minutes vous montrer comment l'améliorer.",
  ]
    .filter(Boolean)
    .join("\n");
}
