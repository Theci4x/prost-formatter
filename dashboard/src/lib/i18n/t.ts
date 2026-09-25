import type { Langue } from "@/lib/i18n/langues";

/**
 * La traduction des pages du tableau de bord, par la phrase française.
 *
 * Le français reste dans le code, là où il se lit ; une table à côté
 * donne l'anglais et le chinois pour chaque phrase. Une phrase absente
 * de la table s'affiche en français : un oubli se voit, il ne casse rien.
 *
 * Les variables s'écrivent entre accolades — `t("{n} avis", { n })` — et
 * valent dans les trois langues. Les pluriels se choisissent dans le code,
 * une clé par forme : le français et l'anglais n'accordent pas pareil, et
 * le chinois n'accorde pas du tout.
 */
export type Traductions = Record<string, { en: string; zh: string }>;

export type T = (fr: string, vars?: Record<string, string | number>) => string;

export function traducteur(langue: Langue, ...tables: Traductions[]): T {
  return (fr, vars) => {
    let texte = fr;
    if (langue !== "fr") {
      for (const table of tables) {
        const trouve = table[fr];
        if (trouve) {
          texte = trouve[langue];
          break;
        }
      }
    }
    if (vars) {
      texte = texte.replace(/\{(\w+)\}/g, (tout, cle: string) =>
        cle in vars ? String(vars[cle]) : tout,
      );
    }
    return texte;
  };
}

/** Les mots qui reviennent sur toutes les pages. */
export const COMMUN: Traductions = {
  Enregistrer: { en: "Save", zh: "保存" },
  "Enregistrement…": { en: "Saving…", zh: "正在保存…" },
  "Enregistré.": { en: "Saved.", zh: "已保存。" },
  Annuler: { en: "Cancel", zh: "取消" },
  Supprimer: { en: "Delete", zh: "删除" },
  Modifier: { en: "Edit", zh: "修改" },
  Ajouter: { en: "Add", zh: "添加" },
  Retirer: { en: "Remove", zh: "移除" },
  Voir: { en: "View", zh: "查看" },
  Gérer: { en: "Manage", zh: "管理" },
  Copier: { en: "Copy", zh: "复制" },
  "Copié ✓": { en: "Copied ✓", zh: "已复制 ✓" },
  "Copier l'adresse": { en: "Copy the address", zh: "复制网址" },
  "Adresse copiée ✓": { en: "Address copied ✓", zh: "网址已复制 ✓" },
  Connecté: { en: "Connected", zh: "已连接" },
  "Non connecté": { en: "Not connected", zh: "未连接" },
  Actif: { en: "Active", zh: "已启用" },
  Inactif: { en: "Inactive", zh: "未启用" },
  Oui: { en: "Yes", zh: "是" },
  Non: { en: "No", zh: "否" },
  "Un instant…": { en: "One moment…", zh: "请稍候…" },
  "Réessaie dans un instant.": {
    en: "Please try again in a moment.",
    zh: "请稍后再试。",
  },
  "Établissement inconnu.": { en: "Unknown restaurant.", zh: "未知的餐厅。" },
};
