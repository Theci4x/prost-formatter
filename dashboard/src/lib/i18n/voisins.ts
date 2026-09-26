import type { Langue } from "@/lib/i18n/langues";

/** La page « Tes voisins » du tableau de bord, dans les trois langues. */
export type ClesVoisins = {
  titre: (nom: string) => string;
  chapo: string;
  googleMuet: string;
  rang: (n: number) => string;
  constatDevant: (nous: string, moyenne: string) => string;
  constatDerriere: (nous: string, moyenne: string) => string;
  constatEgal: (nous: string) => string;
  constatAttente: string;
  avis: string;
  suivreSelection: string;
  places: (reste: number, max: number) => string;
  chercherNom: string;
  exempleNom: string;
  chercher: string;
  revenir: string;
  resultats: (q: string) => string;
  propositions: string;
  aucunTrouve: string;
  maximum: (max: number) => string;
  migration: string;
  sansFiche: string;
  ouvrirFiche: string;
  choisir: string;
  aLaNote: (n: number) => string;
  lienLendemain: string;
  taNote: string;
  voisins: string;
  avis30: string;
  plusActif: (nom: string) => string;
  classement: string;
  toi: string;
  a: (distance: string) => string;
  nePlusSuivre: string;
  nePlusSuivreNom: (nom: string) => string;
  legende: string;
  partiel: string;
  sansNote: string;
  ajouter: string;
  retirer: string;
};

const fr: ClesVoisins = {
  titre: (nom) => `Tes voisins — ${nom}`,
  chapo:
    "Jusqu'à cinq restaurants autour de toi, relevés chaque lundi sur Google. Une note bouge peu ; le rythme des avis, beaucoup — c'est lui qui dit qui avance.",
  googleMuet:
    "Google ne répond pas pour le moment. Réessaie dans quelques minutes.",
  rang: (n) => `${n}${n === 1 ? "re" : "e"}`,
  constatDevant: (nous, moy) =>
    `Tu gagnes des avis plus vite que tes voisins : ${nous} en 30 jours, contre +${moy} en moyenne.`,
  constatDerriere: (nous, moy) =>
    `Tes voisins gagnent des avis plus vite que toi : +${moy} en moyenne en 30 jours, contre ${nous} pour toi.`,
  constatEgal: (nous) =>
    `Tu gagnes des avis au même rythme que tes voisins : ${nous} en 30 jours.`,
  constatAttente:
    "Le rythme des avis s'affichera après deux relevés, le lundi matin.",
  avis: "avis",
  suivreSelection: "Suivre la sélection",
  places: (reste, max) =>
    `${reste} place${reste > 1 ? "s" : ""} sur ${max} : au-delà, les suivants sont ignorés.`,
  chercherNom: "Chercher par son nom",
  exempleNom: "Le Bistrot d'à côté",
  chercher: "Chercher",
  revenir: "← Revenir aux propositions",
  resultats: (q) => `Résultats pour « ${q} », du plus proche au plus loin.`,
  propositions:
    "Les restaurants les plus proches qui te ressemblent. Coche ceux qui te prennent vraiment des clients.",
  aucunTrouve: "Aucun restaurant trouvé. Essaie avec un autre nom.",
  maximum: (max) =>
    `Tu suis ${max} voisins, le maximum. Retire-en un avec la croix pour en suivre un autre.`,
  migration:
    "Migration à passer : supabase/migrations/0086_voisins.sql n'est pas encore en place.",
  sansFiche:
    "Klarr doit d'abord connaître ta fiche Google pour savoir où tu es.",
  ouvrirFiche: "Ouvrir la page Fiche Google",
  choisir: "Choisis tes voisins",
  aLaNote: (n) => `à la note, sur ${n} dans ton quartier`,
  lienLendemain: "La demande d'avis du lendemain est faite pour ça →",
  taNote: "Ta note",
  voisins: "voisins :",
  avis30: "Avis en 30 jours",
  plusActif: (nom) => `le plus actif : ${nom}`,
  classement: "Le classement",
  toi: "toi",
  a: (d) => `à ${d} · `,
  nePlusSuivre: "Ne plus suivre",
  nePlusSuivreNom: (nom) => `Ne plus suivre ${nom}`,
  legende:
    "La barre montre les avis gagnés en 30 jours. Relevé chaque lundi matin sur Google.",
  partiel:
    " * Suivi depuis moins de 30 jours : le chiffre part du premier relevé.",
  sansNote:
    " Ta propre note arrive avec le relevé hebdomadaire de ta fiche Google.",
  ajouter: "Ajouter un voisin",
  retirer: "Retirer",
};

const en: ClesVoisins = {
  titre: (nom) => `Your neighbours — ${nom}`,
  chapo:
    "Up to five restaurants around you, checked on Google every Monday. A rating barely moves; the pace of reviews moves a lot — that's what shows who's getting ahead.",
  googleMuet: "Google isn't responding right now. Try again in a few minutes.",
  rang: (n) => {
    const d = n % 10;
    const c = n % 100;
    const suffixe =
      d === 1 && c !== 11
        ? "st"
        : d === 2 && c !== 12
          ? "nd"
          : d === 3 && c !== 13
            ? "rd"
            : "th";
    return `${n}${suffixe}`;
  },
  constatDevant: (nous, moy) =>
    `You're gaining reviews faster than your neighbours: ${nous} in 30 days, against +${moy} on average.`,
  constatDerriere: (nous, moy) =>
    `Your neighbours are gaining reviews faster than you: +${moy} on average in 30 days, against ${nous} for you.`,
  constatEgal: (nous) =>
    `You're gaining reviews at the same pace as your neighbours: ${nous} in 30 days.`,
  constatAttente:
    "The pace of reviews will show after two readings, on Monday mornings.",
  avis: "reviews",
  suivreSelection: "Follow selected",
  places: (reste, max) =>
    `${reste} slot${reste === 1 ? "" : "s"} out of ${max}: any beyond that are ignored.`,
  chercherNom: "Search by name",
  exempleNom: "The bistro next door",
  chercher: "Search",
  revenir: "← Back to suggestions",
  resultats: (q) => `Results for “${q}”, nearest first.`,
  propositions:
    "The nearest restaurants that look like yours. Tick the ones that really take customers from you.",
  aucunTrouve: "No restaurant found. Try another name.",
  maximum: (max) =>
    `You follow ${max} neighbours, the maximum. Remove one with the cross to follow another.`,
  migration:
    "Migration to run: supabase/migrations/0086_voisins.sql is not in place yet.",
  sansFiche: "Klarr first needs your Google listing to know where you are.",
  ouvrirFiche: "Open the Google listing page",
  choisir: "Choose your neighbours",
  aLaNote: (n) => `by rating, out of ${n} in your area`,
  lienLendemain: "The next-day review request is made for this →",
  taNote: "Your rating",
  voisins: "neighbours:",
  avis30: "Reviews in 30 days",
  plusActif: (nom) => `most active: ${nom}`,
  classement: "The ranking",
  toi: "you",
  a: (d) => `${d} away · `,
  nePlusSuivre: "Stop following",
  nePlusSuivreNom: (nom) => `Stop following ${nom}`,
  legende:
    "The bar shows reviews gained in 30 days. Checked on Google every Monday morning.",
  partiel:
    " * Followed for less than 30 days: the figure starts from the first reading.",
  sansNote:
    " Your own rating arrives with the weekly reading of your Google listing.",
  ajouter: "Add a neighbour",
  retirer: "Remove",
};

const zh: ClesVoisins = {
  titre: (nom) => `周边同行 — ${nom}`,
  chapo:
    "最多五家您周边的餐厅，每周一从 Google 更新。评分变化不大，评价增长的速度才真正拉开差距——它说明谁在往前走。",
  googleMuet: "Google 暂时没有响应，请几分钟后再试。",
  rang: (n) => `第 ${n} 名`,
  constatDevant: (nous, moy) =>
    `您的评价增长比周边同行快：30 天内 ${nous}，同行平均 +${moy}。`,
  constatDerriere: (nous, moy) =>
    `周边同行的评价增长比您快：30 天内平均 +${moy}，您是 ${nous}。`,
  constatEgal: (nous) => `您的评价增长和周边同行一样快：30 天内 ${nous}。`,
  constatAttente: "评价增长速度要等两次更新（每周一早上）之后才会显示。",
  avis: "条评价",
  suivreSelection: "关注所选餐厅",
  places: (reste, max) =>
    `还剩 ${reste} 个名额（共 ${max} 个）：超出的不会被关注。`,
  chercherNom: "按名称搜索",
  exempleNom: "隔壁的小馆",
  chercher: "搜索",
  revenir: "← 返回推荐",
  resultats: (q) => `「${q}」的搜索结果，按距离由近到远排列。`,
  propositions: "离您最近、和您相似的餐厅。勾选真正在和您抢客人的那几家。",
  aucunTrouve: "没有找到餐厅，请换个名称试试。",
  maximum: (max) =>
    `您已关注 ${max} 家，已达上限。点叉号移除一家，才能关注新的。`,
  migration: "需要执行迁移：supabase/migrations/0086_voisins.sql 尚未执行。",
  sansFiche: "Klarr 需要先知道您的 Google 商家资料，才能知道您在哪里。",
  ouvrirFiche: "打开「Google 商家资料」页面",
  choisir: "选择周边同行",
  aLaNote: (n) => `按评分排名，您所在区域共 ${n} 家`,
  lienLendemain: "次日邀评邮件正是为此而设 →",
  taNote: "您的评分",
  voisins: "同行：",
  avis30: "30 天新增评价",
  plusActif: (nom) => `最活跃：${nom}`,
  classement: "排名",
  toi: "您",
  a: (d) => `距离 ${d} · `,
  nePlusSuivre: "取消关注",
  nePlusSuivreNom: (nom) => `取消关注 ${nom}`,
  legende: "横条表示 30 天内新增的评价。每周一早上从 Google 更新。",
  partiel: " * 关注不到 30 天：数字从第一次更新开始计算。",
  sansNote: " 您自己的评分会在每周更新 Google 商家资料时出现。",
  ajouter: "添加同行",
  retirer: "移除",
};

export const VOISINS: Record<Langue, ClesVoisins> = { fr, en, zh };
