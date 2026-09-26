import type { Langue } from "@/lib/i18n/langues";
import type { LibellesKpis } from "@/components/seo/Kpis";
import type { LibellesGraphique } from "@/components/seo/GraphiqueRequetes";

/**
 * La page SEO du tableau de bord, dans les trois langues.
 *
 * Les tuiles et le graphique des requêtes prennent déjà leurs libellés en
 * paramètre (la page d'accueil les montre en anglais et en chinois) : on
 * leur passe ceux-ci. Le reste de la page les lit ici.
 */
export type ClesSeo = {
  titre: (nom: string) => string;
  chapo: string;
  sommaire: { constat: string; analyse: string; motsCles: string };

  compteurMotsCles: (n: number) => string;
  derniereAnalyse: string;
  aucuneAnalyse: string;
  relie: string;
  searchConsole: string;
  searchConsoleARelier: string;

  constatTitre: string;
  source: (site: string) => string;
  changerDeSite: string;
  pasRelie: string;
  aucunSite: string;
  quelSite: string;

  videTitre: string;
  videTexte: string;
  videSite: (site: string) => string;

  tableauTitre: string;
  colRequete: string;
  colVu: string;
  colClics: string;
  colTaux: string;
  colPosition: string;

  kpis: LibellesKpis;
  graphique: LibellesGraphique;
  infobulleRequete: (
    vus: string,
    clics: string,
    n: number,
    ctr: number,
    position: number,
  ) => string;
  positionsTitre: string;
  positions: { premiere: string; deuxieme: string; loin: string };
  infobullePosition: (position: number, page: string) => string;

  motsClesTitre: string;
  motsClesChapo: string;
  motsClesExemple: string;
  ajouter: string;
  aucunMotCle: string;
  supprimer: (mot: string) => string;

  analyseTitre: string;
  analyseLe: (quand: string) => string;
  analyseChapo: string;
  analyseEnCours: string;
  relancer: string;
  lancer: string;
  analyseVide: string;
  bouge: (ajoutes: number, retires: number) => string;
  etapes: readonly string[];
  enCoursSr: string;
  duree: string;
  precedenteRevient: string;

  /** La langue dans laquelle le modèle doit rédiger. */
  langueAnalyse: string;
  erreurIntrouvable: string;
  erreurAnalyse: string;
};

const fr: ClesSeo = {
  titre: (nom) => `SEO — ${nom}`,
  chapo:
    "Ce qui te fait sortir sur Google quand quelqu'un cherche où manger. En haut, ce que Search Console a vraiment mesuré ; en dessous, l'analyse de Klarr Tool et les mots-clés sur lesquels tu veux sortir.",
  sommaire: {
    constat: "Ce que les gens tapent",
    analyse: "Analyse Klarr Tool",
    motsCles: "Mots-clés ciblés",
  },

  compteurMotsCles: (n) => {
    const s = n > 1 ? "s" : "";
    return `mot${s}-clé${s} ciblé${s}`;
  },
  derniereAnalyse: "dernière analyse",
  aucuneAnalyse: "aucune analyse",
  relie: "Relié",
  searchConsole: "Search Console",
  searchConsoleARelier: "Search Console à relier",

  constatTitre: "Ce que les gens tapent vraiment",
  source: (site) => `${site} · 28 derniers jours · pages de ton établissement`,
  changerDeSite: "Changer de site",
  pasRelie:
    "Relie ton compte Google depuis « Connexions » pour voir les requêtes réellement tapées par ceux qui te trouvent. C'est la seule mesure qui ne soit pas une supposition.",
  aucunSite:
    "Aucun site vérifié sur ce compte Google. Search Console suppose que tu possèdes un site et que tu l'y as fait vérifier.",
  quelSite: "Quel site suivre ?",

  videTitre: "Pas encore de requête mesurée sur tes pages",
  videTexte:
    "Google n'a rien enregistré ces quatre dernières semaines pour les pages de ton établissement. C'est le cas d'une page récente, ou d'une maison fermée. Les chiffres arriveront ici d'eux-mêmes, avec trois jours de retard — c'est le rythme de Search Console.",
  videSite: (site) => `Site suivi : ${site}`,

  tableauTitre: "Toutes les requêtes",
  colRequete: "Requête",
  colVu: "Vu",
  colClics: "Clics",
  colTaux: "Taux",
  colPosition: "Position",

  kpis: {
    vus: "fois vu dans Google",
    clics: "clics vers tes pages",
    taux: "des vues ont cliqué",
    premierePage: (n) => `requête${n > 1 ? "s" : ""} en première page`,
    aPortee: (n) => `${n} à portée, en deuxième page`,
    sur: (n) => `sur ${n}`,
  },
  graphique: {
    titre: "Les requêtes les plus vues",
    vu: "vu",
    clique: "cliqué",
  },
  infobulleRequete: (vus, clics, n, ctr, position) =>
    `${vus} fois vu · ${clics} clic${n > 1 ? "s" : ""} · ${ctr} % · position ${position}`,
  positionsTitre: "À quelle place tu sors",
  positions: {
    premiere: "en première page",
    deuxieme: "en deuxième page",
    loin: "plus loin",
  },
  infobullePosition: (position, page) =>
    `position moyenne ${position} — ${page}`,

  motsClesTitre: "Mots-clés ciblés",
  motsClesChapo: "Ce sur quoi tu veux sortir. L'analyse les commente.",
  motsClesExemple: "ex : restaurant italien Lyon",
  ajouter: "Ajouter",
  aucunMotCle: "Aucun mot-clé pour le moment.",
  supprimer: (mot) => `Supprimer ${mot}`,

  analyseTitre: "Analyse SEO par Klarr Tool",
  analyseLe: (quand) => `Analysée le ${quand}`,
  analyseChapo: "Un audit local complet, écrit pour ton établissement.",
  analyseEnCours: "Analyse en cours…",
  relancer: "Relancer l'analyse",
  lancer: "Lancer l'analyse",
  analyseVide:
    "Aucune analyse pour le moment. Elle s'appuie sur ton nom, ton adresse, tes mots-clés ciblés et — quand Search Console est relié — sur ce que les gens tapent vraiment. Ajoute tes mots-clés d'abord : l'analyse en sera meilleure.",
  bouge: (ajoutes, retires) => {
    // « mots-clés » : les deux éléments du mot composé s'accordent.
    const s = (n: number) => (n > 1 ? "s" : "");
    const bouts: string[] = [];
    if (ajoutes) {
      bouts.push(
        `${ajoutes} mot${s(ajoutes)}-clé${s(ajoutes)} ajouté${s(ajoutes)}`,
      );
    }
    if (retires) bouts.push(`${retires} retiré${s(retires)}`);
    return `${bouts.join(", ")} depuis cette analyse.`;
  },
  etapes: [
    "Lecture de la fiche et des requêtes mesurées",
    "Repérage du quartier, des concurrents, des intentions",
    "Croisement avec les mots-clés ciblés",
    "Rédaction des recommandations",
  ],
  enCoursSr: " (en cours)",
  duree: "Une analyse prend une vingtaine de secondes.",
  precedenteRevient: " La précédente revient si celle-ci échoue.",

  langueAnalyse: "en français",
  erreurIntrouvable: "Restaurant introuvable.",
  erreurAnalyse: "L'analyse a échoué. Réessaie dans un instant.",
};

const en: ClesSeo = {
  titre: (nom) => `SEO — ${nom}`,
  chapo:
    "What brings you up on Google when someone looks for a place to eat. At the top, what Search Console actually measured; below, the Klarr Tool analysis and the keywords you want to rank for.",
  sommaire: {
    constat: "What people type",
    analyse: "Klarr Tool analysis",
    motsCles: "Target keywords",
  },

  compteurMotsCles: (n) => `target keyword${n === 1 ? "" : "s"}`,
  derniereAnalyse: "last analysis",
  aucuneAnalyse: "no analysis yet",
  relie: "Connected",
  searchConsole: "Search Console",
  searchConsoleARelier: "Search Console to connect",

  constatTitre: "What people actually type",
  source: (site) => `${site} · last 28 days · your restaurant's pages`,
  changerDeSite: "Change site",
  pasRelie:
    "Connect your Google account from “Connections” to see the searches actually typed by the people who find you. It's the only measure that isn't a guess.",
  aucunSite:
    "No verified site on this Google account. Search Console needs a website that you own and have verified there.",
  quelSite: "Which site should we track?",

  videTitre: "No searches measured on your pages yet",
  videTexte:
    "Google recorded nothing for your restaurant's pages over the last four weeks. That happens with a new page, or a closed restaurant. The figures will show up here on their own, three days behind — that's Search Console's pace.",
  videSite: (site) => `Tracked site: ${site}`,

  tableauTitre: "All searches",
  colRequete: "Search",
  colVu: "Seen",
  colClics: "Clicks",
  colTaux: "Rate",
  colPosition: "Position",

  kpis: {
    vus: "times seen on Google",
    clics: "clicks to your pages",
    taux: "of views clicked",
    premierePage: (n) => `search${n === 1 ? "" : "es"} on page one`,
    aPortee: (n) => `${n} within reach, on page two`,
    sur: (n) => `out of ${n}`,
  },
  graphique: {
    titre: "Most-seen searches",
    vu: "seen",
    clique: "clicked",
  },
  infobulleRequete: (vus, clics, n, ctr, position) =>
    `seen ${vus} times · ${clics} click${n === 1 ? "" : "s"} · ${ctr}% · position ${position}`,
  positionsTitre: "Where you rank",
  positions: {
    premiere: "on page one",
    deuxieme: "on page two",
    loin: "further down",
  },
  infobullePosition: (position, page) =>
    `average position ${position} — ${page}`,

  motsClesTitre: "Target keywords",
  motsClesChapo: "What you want to rank for. The analysis comments on them.",
  motsClesExemple: "e.g. italian restaurant Lyon",
  ajouter: "Add",
  aucunMotCle: "No keywords yet.",
  supprimer: (mot) => `Remove ${mot}`,

  analyseTitre: "SEO analysis by Klarr Tool",
  analyseLe: (quand) => `Analysed on ${quand}`,
  analyseChapo: "A full local audit, written for your restaurant.",
  analyseEnCours: "Analysing…",
  relancer: "Run the analysis again",
  lancer: "Run the analysis",
  analyseVide:
    "No analysis yet. It draws on your name, your address, your target keywords and — once Search Console is connected — on what people actually type. Add your keywords first: the analysis will be better for it.",
  bouge: (ajoutes, retires) => {
    const bouts: string[] = [];
    if (ajoutes) {
      bouts.push(`${ajoutes} keyword${ajoutes === 1 ? "" : "s"} added`);
    }
    if (retires) bouts.push(`${retires} removed`);
    return `${bouts.join(", ")} since this analysis.`;
  },
  etapes: [
    "Reading your listing and the measured searches",
    "Mapping the area, competitors and intents",
    "Cross-checking with your target keywords",
    "Writing the recommendations",
  ],
  enCoursSr: " (in progress)",
  duree: "An analysis takes about twenty seconds.",
  precedenteRevient: " The previous one comes back if this one fails.",

  langueAnalyse: "en anglais",
  erreurIntrouvable: "Restaurant not found.",
  erreurAnalyse: "The analysis failed. Please try again in a moment.",
};

const zh: ClesSeo = {
  titre: (nom) => `搜索排名 — ${nom}`,
  chapo:
    "有人搜索去哪儿吃饭时，是什么让您出现在 Google 上。上方是 Search Console 真实测到的数据；下方是 Klarr Tool 的分析，以及您想要排上的关键词。",
  sommaire: {
    constat: "大家在搜什么",
    analyse: "Klarr Tool 分析",
    motsCles: "目标关键词",
  },

  compteurMotsCles: () => "个目标关键词",
  derniereAnalyse: "上次分析",
  aucuneAnalyse: "暂无分析",
  relie: "已连接",
  searchConsole: "Search Console",
  searchConsoleARelier: "Search Console 待连接",

  constatTitre: "大家真正在搜什么",
  source: (site) => `${site} · 最近 28 天 · 您餐厅的页面`,
  changerDeSite: "更换网站",
  pasRelie:
    "请在「账号连接」里连接您的 Google 账号，就能看到找到您的人真正搜索的词。这是唯一不靠猜测的数据。",
  aucunSite:
    "这个 Google 账号下没有已验证的网站。Search Console 需要您拥有一个网站，并在其中完成验证。",
  quelSite: "要跟踪哪个网站？",

  videTitre: "您的页面还没有测到搜索词",
  videTexte:
    "过去四周，Google 没有记录到您餐厅页面的任何数据。新页面或已停业的餐厅都会这样。数据之后会自动出现在这里，延迟三天——这是 Search Console 的节奏。",
  videSite: (site) => `跟踪的网站：${site}`,

  tableauTitre: "全部搜索词",
  colRequete: "搜索词",
  colVu: "展示",
  colClics: "点击",
  colTaux: "点击率",
  colPosition: "排名",

  kpis: {
    vus: "次在 Google 上被看到",
    clics: "次点击进入您的页面",
    taux: "的展示带来了点击",
    premierePage: () => "个搜索词排在第一页",
    aPortee: (n) => `${n} 个接近，在第二页`,
    sur: (n) => `共 ${n} 个`,
  },
  graphique: {
    titre: "展示最多的搜索词",
    vu: "展示",
    clique: "点击",
  },
  infobulleRequete: (vus, clics, _n, ctr, position) =>
    `展示 ${vus} 次 · 点击 ${clics} 次 · ${ctr}% · 排名 ${position}`,
  positionsTitre: "您排在第几位",
  positions: {
    premiere: "第一页",
    deuxieme: "第二页",
    loin: "更靠后",
  },
  infobullePosition: (position, page) => `平均排名 ${position} — ${page}`,

  motsClesTitre: "目标关键词",
  motsClesChapo: "您想要排上的词。分析会逐一点评。",
  motsClesExemple: "例：巴黎 川菜 餐厅",
  ajouter: "添加",
  aucunMotCle: "暂无关键词。",
  supprimer: (mot) => `删除 ${mot}`,

  analyseTitre: "Klarr Tool 搜索排名分析",
  analyseLe: (quand) => `分析于 ${quand}`,
  analyseChapo: "一份完整的本地搜索诊断，专为您的餐厅撰写。",
  analyseEnCours: "正在分析…",
  relancer: "重新分析",
  lancer: "开始分析",
  analyseVide:
    "暂无分析。分析会参考您的店名、地址、目标关键词，以及（连接 Search Console 后）大家真正搜索的词。请先添加关键词，分析会更准确。",
  bouge: (ajoutes, retires) => {
    const bouts: string[] = [];
    if (ajoutes) bouts.push(`新增 ${ajoutes} 个关键词`);
    if (retires) bouts.push(`删除 ${retires} 个`);
    return `自这次分析以来${bouts.join("，")}。`;
  },
  etapes: [
    "读取商家资料和测到的搜索词",
    "了解周边、竞争对手和搜索意图",
    "与目标关键词交叉比对",
    "撰写建议",
  ],
  enCoursSr: "（进行中）",
  duree: "一次分析大约需要二十秒。",
  precedenteRevient: "如果这次失败，会恢复上一次的分析。",

  langueAnalyse: "en chinois simplifié",
  erreurIntrouvable: "找不到该餐厅。",
  erreurAnalyse: "分析失败，请稍后再试。",
};

export const SEO: Record<Langue, ClesSeo> = { fr, en, zh };

/** La locale des dates et des nombres, selon la langue. */
export function localeDe(langue: Langue): string {
  return langue === "zh" ? "zh-CN" : langue === "en" ? "en-GB" : "fr-FR";
}
