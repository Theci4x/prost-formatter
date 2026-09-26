import type { Langue } from "@/lib/i18n/langues";
import type {
  GroupePresence,
  Plateforme,
  StatutPresence,
} from "@/lib/presence/plateformes";

/**
 * La présence en ligne — la page, le mode guidé, la fiche à copier et le
 * pas-à-pas de chaque plateforme —, dans les trois langues.
 *
 * Le pas-à-pas français vit avec les plateformes (`plateformes.ts`) ;
 * l'anglais et le chinois s'y superposent ici, plateforme par plateforme.
 * Ce qu'on recopie sur les plateformes (nom, adresse, horaires) ne se
 * traduit pas : c'est la fiche du restaurant, en France.
 */
export type TextesPlateforme = {
  nom?: string;
  pourquoi: string;
  conseil?: string;
  etapes?: string[];
};

export type ClesPresence = {
  titre: (nom: string) => string;
  chapo: string;
  migration: string;
  ficheModifiee: (jour: string, n: number) => string;
  ficheModifieeSuite: (noms: string) => string;
  majGuidee: string;
  enOrdre: string;
  essentielles: string;
  aTraiter: string;
  pasVerifiees: (n: number) => string;
  ficheChamps: string;
  toutEnOrdre: string;
  uneALaFois: string;
  toutEnOrdreTexte: string;
  resteTexte: (n: number, minutes: number) => string;
  commencer: string;
  continuer: string;
  filtres: {
    toutes: string;
    "a-traiter": string;
    "a-verifier": string;
    "en-ordre": string;
  };
  enOrdreGroupe: (n: number, total: number) => string;
  annuairesNote: string;
  aucuneFiltre: string;
  ficheACopier: string;
  toutCopier: string;
  copiee: string;
  memesMots: string;
  pied: string;
  groupes: Record<GroupePresence, string>;
  statuts: Record<StatutPresence, string>;
  etatRelie: string;
  etatARevoir: string;
  etatPasVerifiee: string;
  ficheAChange: (jour: string) => string;
  verifier: string;
  modifier: string;
  creer: string;
  gerer: string;
  relier: string;
  pasAPas: (n: number) => string;
  verifieLe: (jour: string) => string;
  apresVerif: string;
  cestAJour: string;
  effacer: string;
  champs: Record<string, string>;
  relies: Record<string, string>;
  pasRenseigne: string;
  copier: string;
  copie: string;
  completer: string;
  miseAJour: string[];

  // Le mode guidé
  guideTitre: (nom: string) => string;
  reglees: (n: number, total: number) => string;
  encore: (n: number, minutes: number) => string;
  finTout: string;
  finAujourdhui: string;
  finToutTexte: string;
  finPassees: (n: number) => string;
  revenir: string;
  reprendre: string;
  essentielle: string;
  plusLoin: string;
  environ: (minutes: number) => string;
  aMettreAJour: string;
  ficheACopierBas: string;
  ficheAChangeGuide: (jour: string, plateforme: string) => string;
  pasAPasSeul: string;
  cestFait: string;
  plusTard: string;
  passer: string;
  plusTardAide: string;

  plateformes?: Record<string, TextesPlateforme>;
};

const fr: ClesPresence = {
  titre: (nom) => `Présence en ligne — ${nom}`,
  chapo:
    "Les plateformes où tes clients — et les assistants IA qui répondent à leur place — vont chercher où manger. Recopie partout la même fiche, au caractère près : un nom ou un téléphone qui diffère d'un site à l'autre fait douter Google comme les IA.",
  migration:
    "Migration à passer : la table de cet écran n'existe pas encore (supabase/migrations/0079_presence.sql). Tu peux déjà vérifier tes fiches et copier la tienne ; les statuts s'enregistreront une fois la migration passée.",
  ficheModifiee: (jour, n) =>
    `Tu as modifié ta fiche le ${jour} : ${n} plateforme${n > 1 ? "s" : ""} à mettre à jour.`,
  ficheModifieeSuite: (noms) =>
    `${noms}. Klarr ne peut pas encore les modifier à ta place : reporte-y les changements, puis coche « C'est à jour ».`,
  majGuidee: "Mettre à jour en mode guidé",
  enOrdre: "plateformes en ordre",
  essentielles: "essentielles",
  aTraiter: "à traiter",
  pasVerifiees: (n) => `pas vérifiée${n > 1 ? "s" : ""}`,
  ficheChamps: "champs",
  toutEnOrdre: "Tout est en ordre",
  uneALaFois: "Une plateforme à la fois",
  toutEnOrdreTexte:
    "Reviens ici quand tu modifies ta fiche : Klarr te dira quoi reprendre.",
  resteTexte: (n, m) =>
    `De la plus utile à la moins utile, ta fiche sous les yeux. Il en reste ${n}, environ ${m} min.`,
  commencer: "Commencer le mode guidé",
  continuer: "Continuer le mode guidé",
  filtres: {
    toutes: "Toutes",
    "a-traiter": "À traiter",
    "a-verifier": "Pas vérifiées",
    "en-ordre": "En ordre",
  },
  enOrdreGroupe: (n, total) => `${n}/${total} en ordre`,
  annuairesNote:
    "Moins consultés directement, mais GPS, assistants vocaux et applications puisent dans leurs données. Fais d'abord les essentielles.",
  aucuneFiltre: "Aucune plateforme dans ce filtre.",
  ficheACopier: "Ta fiche à copier",
  toutCopier: "Tout copier",
  copiee: "Copiée ✓",
  memesMots: "Les mêmes mots partout, au caractère près.",
  pied: "Klarr ne lit pas lui-même ces plateformes : Apple, Bing ou PagesJaunes n'ouvrent leurs données qu'aux logiciels qui ont obtenu un accès. Les statuts disent donc ce que tu as constaté en vérifiant, à la date indiquée. Google, Facebook, Instagram, TripAdvisor et ta vitrine apparaissent reliés d'eux-mêmes quand ils le sont dans Klarr ; seule la vitrine suit tes modifications toute seule.",
  groupes: {
    cartes: "Cartes et assistants",
    avis: "Avis et guides",
    reseaux: "Réseaux et site",
    annuaires: "Pour aller plus loin : annuaires et GPS",
  },
  statuts: {
    a_jour: "À jour",
    a_corriger: "À corriger",
    absente: "Pas de fiche",
  },
  etatRelie: "Reliée à Klarr",
  etatARevoir: "À revoir",
  etatPasVerifiee: "Pas vérifiée",
  ficheAChange: (jour) =>
    `Ta fiche a changé le ${jour} dans Klarr : reporte les changements ici.`,
  verifier: "Vérifier ma fiche ↗",
  modifier: "Modifier ma fiche ↗",
  creer: "Créer ou revendiquer ↗",
  gerer: "Gérer dans Klarr →",
  relier: "Relier dans Klarr →",
  pasAPas: (n) => `Pas à pas · ${n} étapes`,
  verifieLe: (jour) => `Vérifié le ${jour} — ce que tu as trouvé :`,
  apresVerif: "Après vérification, ce que tu as trouvé :",
  cestAJour: "C'est à jour",
  effacer: "Effacer",
  champs: {},
  relies: {},
  pasRenseigne: "Pas renseigné",
  copier: "Copier",
  copie: "Copié ✓",
  completer: "Compléter →",
  miseAJour: [
    "Ouvre ta fiche sur la plateforme et connecte-toi au compte qui la gère.",
    "Compare chaque champ avec « Ta fiche à copier » : nom, adresse, téléphone, site, horaires.",
    "Corrige ce qui a changé, enregistre, puis confirme ici que c'est à jour.",
  ],

  guideTitre: (nom) => `Mode guidé — ${nom}`,
  reglees: (n, total) =>
    `${n} plateforme${n > 1 ? "s" : ""} réglée${n > 1 ? "s" : ""} sur ${total}`,
  encore: (n, m) => `encore ${n} · environ ${m} min`,
  finTout: "Tout est en ordre",
  finAujourdhui: "Fin du parcours pour aujourd'hui",
  finToutTexte:
    "Chaque plateforme est reliée ou vérifiée. Si tu modifies ton nom, ton adresse, ton téléphone ou tes horaires dans Klarr, Klarr te dira lesquelles reprendre.",
  finPassees: (n) =>
    `Tu as passé ${n} plateforme${n > 1 ? "s" : ""}. Elles t'attendent pour la prochaine fois.`,
  revenir: "Revenir à la présence en ligne",
  reprendre: "Reprendre les plateformes passées",
  essentielle: "Essentielle",
  plusLoin: "Pour aller plus loin",
  environ: (m) => ` · environ ${m} min`,
  aMettreAJour: "À mettre à jour",
  ficheACopierBas: "Ta fiche à copier ↓",
  ficheAChangeGuide: (jour, p) =>
    `Ta fiche a changé le ${jour} dans Klarr : ouvre ta fiche ${p} et reporte-y les changements.`,
  pasAPasSeul: "Pas à pas",
  cestFait: "C'est fait : ma fiche est à jour",
  plusTard: "À terminer plus tard",
  passer: "Passer pour l'instant",
  plusTardAide:
    "« À terminer plus tard » garde une trace : la plateforme reviendra au prochain passage du guide.",
};

/* ── Anglais ─────────────────────────────────────────────────────────── */

const COLLER_EN =
  "Fill in the listing by pasting the fields from “Your listing to copy”: same name, phone and opening hours, character for character.";
const ANNUAIRE_EN = [
  "Click “Check my listing”: many directories have already created your listing from other sources.",
  "If it exists, look on the listing for the link meant for businesses (“claim”, “edit”, “report an error”).",
  "If not, look on the site for the free sign-up for businesses. Ignore the paid offers: they aren't needed.",
];

const en: ClesPresence = {
  titre: (nom) => `Online presence — ${nom}`,
  chapo:
    "The platforms where your guests — and the AI assistants answering for them — look for a place to eat. Copy the same listing everywhere, character for character: a name or phone number that differs from one site to another makes Google and AI doubt all of them.",
  migration:
    "Migration to run: this screen's table doesn't exist yet (supabase/migrations/0079_presence.sql). You can already check your listings and copy yours; statuses will be saved once the migration has run.",
  ficheModifiee: (jour, n) =>
    `You changed your listing on ${jour}: ${n} platform${n === 1 ? "" : "s"} to update.`,
  ficheModifieeSuite: (noms) =>
    `${noms}. Klarr can't edit them for you yet: carry the changes over, then tick “It's up to date”.`,
  majGuidee: "Update in guided mode",
  enOrdre: "platforms in order",
  essentielles: "essential",
  aTraiter: "to handle",
  pasVerifiees: () => "not checked",
  ficheChamps: "fields",
  toutEnOrdre: "Everything is in order",
  uneALaFois: "One platform at a time",
  toutEnOrdreTexte:
    "Come back when you change your listing: Klarr will tell you what to update.",
  resteTexte: (n, m) =>
    `From most to least useful, with your listing in view. ${n} left, about ${m} min.`,
  commencer: "Start guided mode",
  continuer: "Continue guided mode",
  filtres: {
    toutes: "All",
    "a-traiter": "To handle",
    "a-verifier": "Not checked",
    "en-ordre": "In order",
  },
  enOrdreGroupe: (n, total) => `${n}/${total} in order`,
  annuairesNote:
    "Less visited directly, but GPS, voice assistants and apps draw on their data. Do the essential ones first.",
  aucuneFiltre: "No platform in this filter.",
  ficheACopier: "Your listing to copy",
  toutCopier: "Copy all",
  copiee: "Copied ✓",
  memesMots: "The same words everywhere, character for character.",
  pied: "Klarr doesn't read these platforms itself: Apple, Bing or PagesJaunes only open their data to software that has been granted access. Statuses therefore reflect what you found when checking, on the date shown. Google, Facebook, Instagram, TripAdvisor and your website show as connected on their own when they are in Klarr; only your website follows your changes by itself.",
  groupes: {
    cartes: "Maps and assistants",
    avis: "Reviews and guides",
    reseaux: "Social and website",
    annuaires: "Going further: directories and GPS",
  },
  statuts: {
    a_jour: "Up to date",
    a_corriger: "Needs fixing",
    absente: "No listing",
  },
  etatRelie: "Connected to Klarr",
  etatARevoir: "To review",
  etatPasVerifiee: "Not checked",
  ficheAChange: (jour) =>
    `Your listing changed on ${jour} in Klarr: carry the changes over here.`,
  verifier: "Check my listing ↗",
  modifier: "Edit my listing ↗",
  creer: "Create or claim ↗",
  gerer: "Manage in Klarr →",
  relier: "Connect in Klarr →",
  pasAPas: (n) => `Step by step · ${n} steps`,
  verifieLe: (jour) => `Checked on ${jour} — what you found:`,
  apresVerif: "After checking, what you found:",
  cestAJour: "It's up to date",
  effacer: "Clear",
  champs: {
    Nom: "Name",
    Adresse: "Address",
    Téléphone: "Phone",
    "Site web": "Website",
    Réservation: "Booking",
    Cuisine: "Cuisine",
    Horaires: "Opening hours",
    Description: "Description",
  },
  relies: {
    "Fiche reliée": "Listing connected",
    "Fiche épinglée dans Avis": "Listing pinned in Reviews",
  },
  pasRenseigne: "Not filled in",
  copier: "Copy",
  copie: "Copied ✓",
  completer: "Complete →",
  miseAJour: [
    "Open your listing on the platform and sign in to the account that manages it.",
    "Compare each field with “Your listing to copy”: name, address, phone, website, opening hours.",
    "Fix what changed, save, then confirm here that it's up to date.",
  ],

  guideTitre: (nom) => `Guided mode — ${nom}`,
  reglees: (n, total) => `${n} of ${total} platforms done`,
  encore: (n, m) => `${n} to go · about ${m} min`,
  finTout: "Everything is in order",
  finAujourdhui: "That's it for today",
  finToutTexte:
    "Every platform is connected or checked. If you change your name, address, phone or opening hours in Klarr, Klarr will tell you which ones to update.",
  finPassees: (n) =>
    `You skipped ${n} platform${n === 1 ? "" : "s"}. They'll be waiting for you next time.`,
  revenir: "Back to online presence",
  reprendre: "Go back to skipped platforms",
  essentielle: "Essential",
  plusLoin: "Going further",
  environ: (m) => ` · about ${m} min`,
  aMettreAJour: "To update",
  ficheACopierBas: "Your listing to copy ↓",
  ficheAChangeGuide: (jour, p) =>
    `Your listing changed on ${jour} in Klarr: open your ${p} listing and carry the changes over.`,
  pasAPasSeul: "Step by step",
  cestFait: "Done: my listing is up to date",
  plusTard: "Finish later",
  passer: "Skip for now",
  plusTardAide:
    "“Finish later” keeps track: the platform will come back next time you run the guide.",

  plateformes: {
    google: {
      nom: "Google Search and Maps",
      pourquoi: "Most “restaurant near me” searches go through here.",
      etapes: [
        "Open “Create or claim” and sign in with a Google account — ideally one created with the restaurant's email address, not a personal account.",
        "Search for your restaurant: if it's already on Maps, claim it; otherwise, add it.",
        "Google checks that you manage it. Depending on the case: a short video of the storefront, a call, a text, an email or a letter. Follow the method it offers.",
        COLLER_EN,
        "Come back to Klarr, “Google listing” screen, and connect your account: your rating and reviews will come in on their own.",
      ],
    },
    apple: {
      nom: "Apple Maps and Siri",
      pourquoi: "What an iPhone user sees when asking Siri or opening Maps.",
      conseil:
        "Free with an Apple ID. Apple verifies the business, sometimes by phone.",
      etapes: [
        "Open “Create or claim” and sign in with an Apple ID. No iPhone needed: best to create one with the restaurant's email address.",
        "Search for your restaurant: if it's already in Maps, claim it; otherwise, create the business.",
        "Apple checks that you manage it, often with a call to the listing's number or a proof document. Allow a few days.",
        COLLER_EN,
        "Add a few photos and your booking link, then come back here and click “Up to date”.",
      ],
    },
    bing: {
      nom: "Bing and Copilot",
      pourquoi:
        "Some AI assistants search the web through Bing: a listing missing here is missing for them.",
      conseil: "Bing Places can import your Google listing: that's fastest.",
      etapes: [
        "Open “Create or claim” and sign in with a Microsoft, Google or Facebook account.",
        "Choose to import from your Google listing: Bing copies name, address, hours and photos in one go. Without a Google listing, add the business by hand.",
        "Bing then verifies the business; follow the method offered.",
        "Reread the imported listing and fix whatever differs from “Your listing to copy”, then come back here and click “Up to date”.",
      ],
    },
    tripadvisor: {
      pourquoi: "Tourists, and the reviews assistants often quote.",
      etapes: [
        "Click “Check my listing”: most restaurants already have one, created by guests.",
        "Open “Create or claim”, find your restaurant and claim it with a TripAdvisor account.",
        "TripAdvisor checks that you manage it; follow the method offered.",
        COLLER_EN,
        "In Klarr, “Reviews” screen, pin your TripAdvisor listing: your rating will show with the others.",
      ],
    },
    pagesjaunes: {
      pourquoi: "Still widely used in France, and copied by many directories.",
      conseil:
        "If your listing exists, claim it from the listing itself; the basic sign-up is free.",
      etapes: [
        "Click “Check my listing” to find your page on PagesJaunes.",
        "On your listing, follow the link for businesses to claim it, and create your business account.",
        "Without a listing, register your business from the business area: the basic sign-up is free.",
        COLLER_EN,
        "Paid offers will be suggested: they aren't needed for an accurate listing.",
      ],
    },
    petitfute: {
      pourquoi: "The guide visitors read when planning a stay.",
      conseil:
        "Look for your listing: if it exists, a link for businesses lets you correct it.",
      etapes: [
        "Click “Check my listing” to see whether the guide already mentions you.",
        "If so, follow the link for businesses on the listing and request corrections.",
        "If not, Petit Futé is a guide: it chooses its places. You can suggest yours from its business area, with no guarantee of being listed.",
        "Come back here and click what you found.",
      ],
    },
    yelp: {
      pourquoi: "Less read in France, but its data feeds other services.",
      etapes: [
        "Open “Create or claim” and search for your restaurant.",
        "Claim the listing or create it, with a Yelp for Business account.",
        "Yelp checks that you manage it, usually by phone or email.",
        COLLER_EN,
        "Yelp will offer you advertising: you don't have to buy any to have an accurate listing.",
      ],
    },
    facebook: {
      pourquoi: "Hours, photos and reviews: many guests check here.",
      etapes: [
        "Open “Create or claim” while signed in to your personal Facebook account: it administers the page, and nothing from your private life appears on it.",
        "Choose the “Restaurant” category and give the page the restaurant's exact name.",
        COLLER_EN,
        "In Klarr, “Social media” screen, connect the page: followers and latest posts will come in on their own.",
      ],
    },
    instagram: {
      pourquoi: "Where people choose from photos, especially under 35.",
      conseil:
        "Switch your account to professional, then link it to your Facebook page.",
      etapes: [
        "In the Instagram app, open the account settings and switch it to a professional account, “Restaurant” category.",
        "Still in settings, link this account to the restaurant's Facebook page.",
        "Put your website address or booking link in the bio.",
        "In Klarr, “Social media” screen, reconnect Facebook: Instagram will follow with the page.",
      ],
    },
    vitrine: {
      nom: "Your Klarr website",
      pourquoi:
        "The source every other listing can point to: menu, hours, booking.",
      etapes: [
        "In Klarr, “Website” screen, fill in what's missing: photos, menu, hours, description.",
        "Publish it: it gets its address, which you'll find in “Your listing to copy”.",
        "Paste that address as the website on Google, Apple, Bing, Facebook and in your Instagram bio: all your listings will point to the same source.",
      ],
    },
    waze: {
      pourquoi:
        "Many drivers' GPS: your restaurant must be there at the right address.",
      etapes: [
        "In the Waze app, search for your restaurant.",
        "If it's missing or misplaced, report it from the app: Waze has places validated by its community of editors.",
        COLLER_EN,
      ],
    },
    tomtom: {
      pourquoi: "Its maps power many car GPS units and navigation services.",
      conseil:
        "TomTom doesn't create listings on request: you report the place, and it reviews it before adding it.",
      etapes: [
        "Open “Create or claim”: it's TomTom's reporting tool.",
        "Find your address on the map, then report the missing place or wrong information.",
        COLLER_EN,
        "TomTom reviews the report: it may take several weeks to appear.",
      ],
    },
    mappy: {
      pourquoi: "The maps and directions site widely used in France.",
      etapes: [...ANNUAIRE_EN, COLLER_EN],
    },
    foursquare: {
      pourquoi: "Its place data is reused by many apps, without you seeing it.",
      etapes: [...ANNUAIRE_EN, COLLER_EN],
    },
    "118000": {
      pourquoi: "A French directory still used to find a phone number.",
      etapes: [...ANNUAIRE_EN, COLLER_EN],
    },
    leshoraires: {
      pourquoi:
        "Ranks well on Google for “opening hours + restaurant name”: wrong hours show there.",
      etapes: [...ANNUAIRE_EN, COLLER_EN],
    },
    horaires24: {
      pourquoi: "Same role: the hours shown when people search Google.",
      etapes: [...ANNUAIRE_EN, COLLER_EN],
    },
    infobel: {
      pourquoi: "A European directory whose data is resold to other services.",
      etapes: [...ANNUAIRE_EN, COLLER_EN],
    },
    cylex: {
      pourquoi: "A business directory used by several local search engines.",
      etapes: [...ANNUAIRE_EN, COLLER_EN],
    },
    hotfrog: {
      pourquoi:
        "One more free directory, which strengthens your listing's consistency across the web.",
      etapes: [...ANNUAIRE_EN, COLLER_EN],
    },
  },
};

/* ── Chinois ─────────────────────────────────────────────────────────── */

const COLLER_ZH =
  "填写资料时，从「要复制的商家资料」里粘贴各项内容：店名、电话、营业时间要完全一致，一个字都不差。";
const ANNUAIRE_ZH = [
  "点「查看我的资料」：很多目录网站已经根据其他来源为您建好了资料。",
  "如果已经有了，在资料页上找给商家用的链接（「认领」「修改」「报告错误」）。",
  "如果没有，在网站上找商家免费注册的入口。付费套餐可以忽略，不是必需的。",
];

const zh: ClesPresence = {
  titre: (nom) => `网络曝光 — ${nom}`,
  chapo:
    "客人（以及替客人回答问题的 AI 助手）找地方吃饭时会去看的平台。每个平台上都要填写完全相同的资料：店名或电话在不同网站上不一致，Google 和 AI 就会对所有信息都产生怀疑。",
  migration:
    "需要执行迁移：此页面的数据表还不存在（supabase/migrations/0079_presence.sql）。您已经可以检查各平台资料并复制自己的资料；执行迁移后状态才会保存。",
  ficheModifiee: (jour, n) =>
    `您在 ${jour} 修改了资料：有 ${n} 个平台需要更新。`,
  ficheModifieeSuite: (noms) =>
    `${noms}。Klarr 还不能替您修改这些平台：请把修改同步过去，然后点「已更新」。`,
  majGuidee: "用引导模式更新",
  enOrdre: "个平台已就绪",
  essentielles: "个重要平台",
  aTraiter: "个待处理",
  pasVerifiees: () => "个未检查",
  ficheChamps: "项资料",
  toutEnOrdre: "一切就绪",
  uneALaFois: "一次处理一个平台",
  toutEnOrdreTexte: "以后修改资料时再回来：Klarr 会告诉您哪些平台需要更新。",
  resteTexte: (n, m) =>
    `按重要程度从高到低，资料就在旁边。还剩 ${n} 个，大约 ${m} 分钟。`,
  commencer: "开始引导模式",
  continuer: "继续引导模式",
  filtres: {
    toutes: "全部",
    "a-traiter": "待处理",
    "a-verifier": "未检查",
    "en-ordre": "已就绪",
  },
  enOrdreGroupe: (n, total) => `${n}/${total} 已就绪`,
  annuairesNote:
    "直接访问的人较少，但导航、语音助手和各类应用都会用到它们的数据。请先完成重要平台。",
  aucuneFiltre: "该筛选下没有平台。",
  ficheACopier: "要复制的商家资料",
  toutCopier: "全部复制",
  copiee: "已复制 ✓",
  memesMots: "每个平台都用完全相同的文字。",
  pied: "Klarr 不会自己读取这些平台：Apple、Bing、PagesJaunes 只向获得授权的软件开放数据。因此状态代表的是您在所示日期检查时看到的情况。Google、Facebook、Instagram、TripAdvisor 和您的官网在 Klarr 里连接后会自动显示为已连接；只有官网会自动同步您的修改。",
  groupes: {
    cartes: "地图与语音助手",
    avis: "点评与指南",
    reseaux: "社交网络与官网",
    annuaires: "进阶：目录与导航",
  },
  statuts: {
    a_jour: "已更新",
    a_corriger: "需修改",
    absente: "没有资料",
  },
  etatRelie: "已连接 Klarr",
  etatARevoir: "需重新检查",
  etatPasVerifiee: "未检查",
  ficheAChange: (jour) =>
    `您的资料在 ${jour} 于 Klarr 中有修改：请把修改同步到这里。`,
  verifier: "查看我的资料 ↗",
  modifier: "修改我的资料 ↗",
  creer: "创建或认领 ↗",
  gerer: "在 Klarr 中管理 →",
  relier: "在 Klarr 中连接 →",
  pasAPas: (n) => `分步操作 · 共 ${n} 步`,
  verifieLe: (jour) => `${jour} 已检查——您看到的情况：`,
  apresVerif: "检查之后，您看到的情况：",
  cestAJour: "已更新",
  effacer: "清除",
  champs: {
    Nom: "店名",
    Adresse: "地址",
    Téléphone: "电话",
    "Site web": "网站",
    Réservation: "订位",
    Cuisine: "菜系",
    Horaires: "营业时间",
    Description: "简介",
  },
  relies: {
    "Fiche reliée": "资料已连接",
    "Fiche épinglée dans Avis": "已在「评价」中固定",
  },
  pasRenseigne: "未填写",
  copier: "复制",
  copie: "已复制 ✓",
  completer: "去填写 →",
  miseAJour: [
    "打开您在该平台上的资料，登录管理它的账号。",
    "逐项对照「要复制的商家资料」：店名、地址、电话、网站、营业时间。",
    "修改有变化的地方并保存，然后回到这里确认已更新。",
  ],

  guideTitre: (nom) => `引导模式 — ${nom}`,
  reglees: (n, total) => `已完成 ${n} / ${total} 个平台`,
  encore: (n, m) => `还剩 ${n} 个 · 大约 ${m} 分钟`,
  finTout: "一切就绪",
  finAujourdhui: "今天就到这里",
  finToutTexte:
    "每个平台都已连接或检查过。以后在 Klarr 里修改店名、地址、电话或营业时间时，Klarr 会告诉您哪些平台需要更新。",
  finPassees: (n) => `您跳过了 ${n} 个平台，下次再继续。`,
  revenir: "返回网络曝光",
  reprendre: "继续处理跳过的平台",
  essentielle: "重要",
  plusLoin: "进阶",
  environ: (m) => ` · 大约 ${m} 分钟`,
  aMettreAJour: "需要更新",
  ficheACopierBas: "要复制的商家资料 ↓",
  ficheAChangeGuide: (jour, p) =>
    `您的资料在 ${jour} 于 Klarr 中有修改：请打开您在 ${p} 上的资料，把修改同步过去。`,
  pasAPasSeul: "分步操作",
  cestFait: "完成了：资料已更新",
  plusTard: "稍后再完成",
  passer: "暂时跳过",
  plusTardAide:
    "「稍后再完成」会留下记录：下次打开引导模式时这个平台会再次出现。",

  plateformes: {
    google: {
      nom: "Google 搜索和地图",
      pourquoi: "大部分「附近的餐厅」搜索都经过这里。",
      etapes: [
        "打开「创建或认领」，用 Google 账号登录——最好用餐厅的邮箱新建一个账号，而不是个人账号。",
        "搜索您的餐厅：如果已经在地图上，就认领；如果没有，就新增。",
        "Google 会验证您是店主。根据情况，可能是拍一段门面的短视频、电话、短信、邮件或寄信。按它提供的方式操作即可。",
        COLLER_ZH,
        "回到 Klarr 的「Google 商家资料」页面，连接您的账号：评分和评价会自动同步过来。",
      ],
    },
    apple: {
      nom: "Apple 地图和 Siri",
      pourquoi: "iPhone 用户问 Siri 或打开地图时看到的信息。",
      conseil: "用 Apple ID 即可免费使用。Apple 会验证商家，有时通过电话。",
      etapes: [
        "打开「创建或认领」，用 Apple ID 登录。不需要 iPhone：最好用餐厅的邮箱新建一个。",
        "搜索您的餐厅：如果地图上已经有，就认领；如果没有，就创建商家。",
        "Apple 会验证您是店主，通常是拨打资料上的电话或要求提供证明文件。需要几天时间。",
        COLLER_ZH,
        "添加几张照片和您的订位链接，然后回到这里点「已更新」。",
      ],
    },
    bing: {
      nom: "Bing 和 Copilot",
      pourquoi:
        "一部分 AI 助手通过 Bing 在网上搜索：这里没有资料，它们就找不到您。",
      conseil: "Bing Places 可以直接导入您的 Google 资料：这是最快的方法。",
      etapes: [
        "打开「创建或认领」，用 Microsoft、Google 或 Facebook 账号登录。",
        "选择从 Google 资料导入：Bing 会一次性复制店名、地址、营业时间和照片。没有 Google 资料的话，就手动添加商家。",
        "之后 Bing 会验证商家；按它提供的方式操作即可。",
        "检查导入的资料，把和「要复制的商家资料」不一致的地方改过来，然后回到这里点「已更新」。",
      ],
    },
    tripadvisor: {
      pourquoi: "游客会看，AI 助手也经常引用上面的评价。",
      etapes: [
        "点「查看我的资料」：大多数餐厅已经有客人创建的资料。",
        "打开「创建或认领」，找到您的餐厅，用 TripAdvisor 账号认领。",
        "TripAdvisor 会验证您是店主；按它提供的方式操作即可。",
        COLLER_ZH,
        "在 Klarr 的「评价」页面固定您的 TripAdvisor 资料：评分会和其他平台一起显示。",
      ],
    },
    pagesjaunes: {
      pourquoi: "在法国仍然有很多人使用，而且很多目录网站都会转载它的数据。",
      conseil: "如果已经有资料，直接在资料页上认领；基础注册是免费的。",
      etapes: [
        "点「查看我的资料」，在 PagesJaunes 上找到您的页面。",
        "在资料页上点给商家用的链接进行认领，并创建商家账号。",
        "如果没有资料，就在商家专区注册：基础注册是免费的。",
        COLLER_ZH,
        "网站会推荐付费套餐：要让资料准确，并不需要购买。",
      ],
    },
    petitfute: {
      pourquoi: "游客计划行程时会查阅的旅行指南。",
      conseil: "先找找有没有您的资料：如果有，可以通过商家链接修改。",
      etapes: [
        "点「查看我的资料」，看看指南里有没有提到您。",
        "如果有，在资料页上点商家链接，申请修改不正确的地方。",
        "如果没有：Petit Futé 是指南，由编辑挑选餐厅。您可以在商家专区推荐自己，但不保证会被收录。",
        "回到这里，点选您看到的情况。",
      ],
    },
    yelp: {
      pourquoi: "在法国看的人不多，但它的数据会被其他服务使用。",
      etapes: [
        "打开「创建或认领」，搜索您的餐厅。",
        "用 Yelp 商家账号认领或创建资料。",
        "Yelp 会验证您是店主，一般通过电话或邮件。",
        COLLER_ZH,
        "Yelp 会向您推荐广告：不买广告也可以拥有准确的资料。",
      ],
    },
    facebook: {
      pourquoi: "营业时间、照片、评价：很多客人会来这里看。",
      etapes: [
        "登录您的个人 Facebook 账号后打开「创建或认领」：主页由它来管理，您的个人信息不会显示在主页上。",
        "选择「餐厅」类别，主页名称要和餐厅名称完全一致。",
        COLLER_ZH,
        "在 Klarr 的「社交网络」页面连接这个主页：粉丝数和最新帖子会自动同步。",
      ],
    },
    instagram: {
      pourquoi: "大家看照片挑餐厅的地方，35 岁以下的客人尤其如此。",
      conseil: "把账号切换为专业账号，再关联到您的 Facebook 主页。",
      etapes: [
        "在 Instagram 应用里打开账号设置，切换为专业账号，类别选「餐厅」。",
        "同样在设置里，把这个账号关联到餐厅的 Facebook 主页。",
        "在简介里放上您的官网地址或订位链接。",
        "在 Klarr 的「社交网络」页面重新连接 Facebook：Instagram 会随主页一起连上。",
      ],
    },
    vitrine: {
      nom: "您的 Klarr 官网",
      pourquoi: "其他所有平台都可以引用的来源：菜单、营业时间、订位。",
      etapes: [
        "在 Klarr 的「官网」页面补齐缺少的内容：照片、菜单、营业时间、简介。",
        "发布后，官网会有自己的网址，您可以在「要复制的商家资料」里找到。",
        "把这个网址作为网站填到 Google、Apple、Bing、Facebook 和 Instagram 简介里：所有资料都指向同一个来源。",
      ],
    },
    waze: {
      pourquoi: "很多司机用的导航：您的餐厅必须出现在正确的地址上。",
      etapes: [
        "在 Waze 应用里搜索您的餐厅。",
        "如果没有或位置不对，就在应用里报告：Waze 的地点由编辑社区审核。",
        COLLER_ZH,
      ],
    },
    tomtom: {
      pourquoi: "很多车载导航和导航服务都使用它的地图。",
      conseil: "TomTom 不会按要求创建资料：您报告地点后，它会审核再添加。",
      etapes: [
        "打开「创建或认领」：这是 TomTom 的报告工具。",
        "在地图上找到您的地址，报告缺失的地点或错误信息。",
        COLLER_ZH,
        "TomTom 会审核报告：可能要几周后才会显示。",
      ],
    },
    mappy: {
      pourquoi: "法国常用的地图和路线网站。",
      etapes: [...ANNUAIRE_ZH, COLLER_ZH],
    },
    foursquare: {
      pourquoi: "它的地点数据被很多应用使用，只是您看不到。",
      etapes: [...ANNUAIRE_ZH, COLLER_ZH],
    },
    "118000": {
      pourquoi: "法国的电话查询目录，仍有人用来查电话号码。",
      etapes: [...ANNUAIRE_ZH, COLLER_ZH],
    },
    leshoraires: {
      pourquoi:
        "在 Google 上搜「营业时间 + 店名」时排名很靠前：营业时间错了，一眼就能看到。",
      etapes: [...ANNUAIRE_ZH, COLLER_ZH],
    },
    horaires24: {
      pourquoi: "作用相同：在 Google 上搜营业时间时显示的内容。",
      etapes: [...ANNUAIRE_ZH, COLLER_ZH],
    },
    infobel: {
      pourquoi: "一个欧洲目录，它的数据会转卖给其他服务。",
      etapes: [...ANNUAIRE_ZH, COLLER_ZH],
    },
    cylex: {
      pourquoi: "多个本地搜索引擎都会引用的企业目录。",
      etapes: [...ANNUAIRE_ZH, COLLER_ZH],
    },
    hotfrog: {
      pourquoi: "又一个免费目录，能让您的资料在网上更一致。",
      etapes: [...ANNUAIRE_ZH, COLLER_ZH],
    },
  },
};

export const PRESENCE: Record<Langue, ClesPresence> = { fr, en, zh };

/** Une plateforme dans la langue de l'écran ; le français est la source. */
export function plateformeEn(p: Plateforme, langue: Langue): Plateforme {
  const textes = PRESENCE[langue].plateformes?.[p.cle];
  if (!textes) return p;
  return {
    ...p,
    nom: textes.nom ?? p.nom,
    pourquoi: textes.pourquoi,
    conseil: textes.conseil,
    etapes: textes.etapes ?? p.etapes,
  };
}
