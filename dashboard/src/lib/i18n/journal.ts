import type { LangueJournal } from "@/types/blog";

/**
 * L'habillage du journal, dans les trois langues.
 *
 * Peu de mots : un article se lit dans sa langue, et tout ce qui
 * l'entoure — « Sources », « À lire ensuite » — tient en une dizaine de
 * chaînes. C'est le texte des articles qui coûte, pas leur cadre.
 */

export type ClesJournal = {
  journal: string;
  accueil: string;
  aide: string;
  mentions: string;
  essentiel: string;
  sommaire: string;
  sources: string;
  suite: string;
  misAJour: string;
  lecture: string;
  /** Le rappel sous les sources, « … » remplacé par la date. */
  avertissement: string;
  /** L'index d'une langue traduite. */
  index: { titre: string; chapo: string; vide: string };
  rubriques: Record<"ouvrir" | "remplir" | "gerer", string>;
};

const fr: ClesJournal = {
  journal: "Le journal",
  accueil: "Accueil",
  aide: "Aide",
  mentions: "Mentions légales",
  essentiel: "L'essentiel",
  sommaire: "Au sommaire",
  sources: "Sources",
  suite: "À lire ensuite",
  misAJour: "Mis à jour le",
  lecture: "min de lecture",
  avertissement: "Ces règles changent. Cet article est à jour au",
  index: {
    titre: "Le journal",
    chapo:
      "Ce qu'on aurait aimé lire avant d'ouvrir un restaurant, et ce qu'on a appris depuis.",
    vide: "Rien pour l'instant.",
  },
  rubriques: {
    ouvrir: "Ouvrir un restaurant",
    remplir: "Remplir sa salle",
    gerer: "Tenir la maison",
  },
};

const en: ClesJournal = {
  journal: "Journal",
  accueil: "Home",
  aide: "Help",
  mentions: "Legal notice",
  essentiel: "In short",
  sommaire: "Contents",
  sources: "Sources",
  suite: "Read next",
  misAJour: "Updated",
  lecture: "min read",
  avertissement: "These rules change. This article is current as of",
  index: {
    titre: "Opening and running a restaurant in France",
    chapo:
      "The paperwork, the inspections and the permits — then what comes after opening: margins, reviews, bookings, delivery. Written for people who run a restaurant in France without French as a first language. Each article cites what it relies on, and carries its date.",
    vide: "Nothing translated yet.",
  },
  rubriques: {
    ouvrir: "Opening a restaurant",
    remplir: "Filling your dining room",
    gerer: "Running the place",
  },
};

const zh: ClesJournal = {
  journal: "专栏",
  accueil: "首页",
  aide: "帮助",
  mentions: "法律声明",
  essentiel: "要点",
  sommaire: "目录",
  sources: "来源",
  suite: "接着读",
  misAJour: "更新于",
  lecture: "分钟阅读",
  avertissement: "相关规定会变动。本文内容截至",
  index: {
    titre: "在法国开餐厅、经营餐厅",
    chapo:
      "手续、检查和许可，以及开业之后的事：毛利、评价、订位、外卖。写给在法国经营餐厅、而法语并非母语的人。每篇文章都注明所依据的材料，并标有日期。",
    vide: "暂无译文。",
  },
  rubriques: {
    ouvrir: "开一家餐厅",
    remplir: "让餐厅坐满",
    gerer: "日常经营",
  },
};

export const JOURNAL: Record<LangueJournal, ClesJournal> = { fr, en, zh };
