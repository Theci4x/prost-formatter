import {
  ESSAI_JOURS,
  PRIX_MODULE,
  PRIX_MODULE_TTC,
  PRIX_PACK,
  PRIX_PACK_TTC,
} from "@/lib/abonnement/modules";
import type { Langue } from "@/lib/i18n/langues";
import { PRIX_EN, PRIX_ZH } from "@/lib/abonnement/prix-affiches";

const EN = PRIX_EN;
const ZH = PRIX_ZH;

/**
 * La page qui dit comment marchent les réservations directes chez Klarr.
 *
 * Sa règle est celle du comparatif : rien qui ne se vérifie dans le
 * produit. Chaque fonction citée ici a son écran dans le tableau de bord,
 * chaque capture vient du restaurant de démonstration — un faux
 * restaurant, mais le vrai logiciel. Pas de témoignage tant qu'aucun
 * restaurateur utilisateur ne l'a donné, pas de chiffre de résultat qu'on
 * n'a pas mesuré.
 *
 * Les prix viennent de `modules.ts` : une page qui recopie un tarif à la
 * main finit toujours par en afficher un ancien.
 */

export type Etape = {
  /** Le nom du fichier de la capture, sans extension ni dossier. */
  capture: string;
  titre: string;
  texte: string;
  alt: string;
};

export type ContenuSansCommission = {
  /** Le titre de l'onglet et des résultats de recherche. */
  titreSeo: string;
  descriptionSeo: string;
  fil: string;
  titre: string;
  chapo: string;
  essayer: string;
  demo: string;
  sujetDemo: string;
  sousBoutons: string;
  video: {
    titre: string;
    legende: string;
    /** Ce que lit un lecteur d'écran, et ce qui s'affiche sans vidéo. */
    description: string;
  };
  commentTitre: string;
  commentChapo: string;
  etapes: Etape[];
  fonctionsTitre: string;
  fonctions: { titre: string; lignes: string[] }[];
  limitesTitre: string;
  limites: { titre: string; texte: string }[];
  tarifsTitre: string;
  tarifs: { nom: string; prix: string; detail: string }[];
  fraisTitre: string;
  frais: string[];
  questionsTitre: string;
  questions: { question: string; reponse: string }[];
  finTitre: string;
  finTexte: string;
  pourAllerPlusLoin: string;
  liens: { href: string; texte: string }[];
  captureDemo: string;
};

const fr: ContenuSansCommission = {
  titreSeo: "Logiciel de réservation restaurant sans commission",
  descriptionSeo: `Une page de réservation à votre nom, un carnet et un écran de service, pour ${PRIX_MODULE.reservations}. Aucune commission par couvert. Voyez le parcours complet en vidéo.`,
  fil: "Réservations",
  titre:
    "Un logiciel de réservation sans commission, pour les restaurants indépendants",
  chapo:
    "Vos clients réservent sur une page à votre nom. La demande arrive dans Klarr, vous la confirmez ou Klarr le fait pour vous, et le jour venu elle est sur votre écran de service. Un abonnement fixe, et rien de prélevé sur les couverts.",
  essayer: `Essayer ${ESSAI_JOURS.reservations} jours gratuitement`,
  demo: "Demander une démo",
  sujetDemo: "Démo des réservations Klarr",
  sousBoutons: `Sans carte bancaire, sans engagement. Pour une démo, écrivez-nous : nous vous montrons le logiciel sur votre propre établissement.`,
  video: {
    titre: "Le parcours complet, en moins d'une minute",
    legende:
      "Enregistré sur le restaurant de démonstration de Klarr, La Table d'Anselme. Les écrans sont ceux que vous aurez.",
    description:
      "Un client réserve une table pour quatre sur la page de La Table d'Anselme, reçoit l'accusé de réception, puis le restaurant voit la demande arriver dans Klarr, l'accepte, et la retrouve sur l'écran de service du jour.",
  },
  commentTitre: "Comment ça marche",
  commentChapo:
    "Quatre écrans, de la demande du client au coup de feu. Les annotations en orange montrent où regarder.",
  etapes: [
    {
      capture: "1-reserver",
      titre: "1. Le client choisit sa table",
      texte:
        "Sur votre page de réservation, il choisit la date, le nombre de convives et l'heure. Seuls les créneaux réellement disponibles s'affichent, calculés d'après vos services, vos salles et leur jauge. Pas de compte à créer : un nom et un e-mail suffisent.",
      alt: "La page de réservation de La Table d'Anselme : date, nombre de convives, créneaux du dîner et formulaire de contact.",
    },
    {
      capture: "2-merci",
      titre: "2. Il reçoit tout de suite une réponse",
      texte:
        "Un e-mail part immédiatement : la confirmation si la table est acquise, l'accusé de réception sinon. Il y trouve un lien pour annuler lui-même, et un rappel lui est envoyé la veille.",
      alt: "L'écran qui suit l'envoi de la demande, côté client.",
    },
    {
      capture: "3-carnet",
      titre: "3. La demande arrive dans votre carnet",
      texte:
        "Vous êtes prévenu par e-mail et, si vous l'activez, par une notification sur votre téléphone. Vous acceptez ou refusez d'un clic, vous notez une allergie ou une habitude — la note ne sort jamais du carnet.",
      alt: "Le carnet de réservations de Klarr, avec les demandes à traiter et les boutons Accepter et Refuser.",
    },
    {
      capture: "4-service",
      titre: "4. Le jour venu, tout est sur l'écran de service",
      texte:
        "Les réservations du jour, service par service et salle par salle, avec le plan de vos tables. Vous placez chacun, vous ajoutez ceux qui appellent, et vous imprimez la feuille du jour en PDF si vous préférez le papier.",
      alt: "L'écran de service de Klarr : plan de la salle et de la terrasse, tables occupées et liste des réservations du dîner.",
    },
  ],
  fonctionsTitre: "Ce que fait le module Réservations",
  fonctions: [
    {
      titre: "Côté client",
      lignes: [
        "Une page de réservation à votre nom, à coller dans votre fiche Google, votre Instagram ou votre site.",
        "Un module à intégrer directement dans votre site, si vous en avez un.",
        "La réservation d'une table, ou la privatisation d'une salle à partir du nombre de couverts que vous fixez.",
        "Des e-mails de confirmation, de rappel la veille et d'annulation, en français, en anglais ou en chinois.",
      ],
    },
    {
      titre: "Côté restaurant",
      lignes: [
        "Un carnet où arrivent les demandes, avec une confirmation automatique que vous pouvez couper.",
        "Un écran de service, un plan de salle et la feuille du jour en PDF.",
        "Les réservations prises au téléphone, saisies au même endroit que les autres.",
        "Un calendrier et des statistiques : couverts par jour, par salle, et d'où viennent les réservations.",
        "L'import de votre carnet depuis un fichier exporté de TheFork ou de Zenchef.",
      ],
    },
    {
      titre: "L'argent et les clients",
      lignes: [
        "Des acomptes ou une empreinte bancaire pour les privatisations, versés sur votre propre compte Stripe.",
        "Des devis pour les groupes, acceptés en ligne.",
        "Un fichier client reconstitué à partir du carnet, et des e-mails à ceux qui ont accepté d'en recevoir.",
        "Des expériences à places payantes (ateliers, dégustations) et des bons cadeaux, payés sur votre compte Stripe.",
      ],
    },
  ],
  limitesTitre: "Ce que Klarr ne fait pas",
  limites: [
    {
      titre: "Il ne vous amène pas de nouveaux clients",
      texte:
        "Klarr n'est pas une place de marché comme TheFork. Il reçoit sans commission ceux qui vous cherchent déjà, ou qui vous trouvent par Google. Les deux peuvent cohabiter, mais les carnets restent séparés.",
    },
    {
      titre: "Pas de bouton « Réserver avec Google »",
      texte:
        "Klarr ne fait pas partie de ce programme. Vous collez votre lien de réservation dans votre fiche Google, et Google affiche un bouton qui renvoie vers votre page.",
    },
    {
      titre: "Pas de SMS",
      texte:
        "Les confirmations et les rappels partent par e-mail. Le numéro de téléphone du client est demandé, mais facultatif.",
    },
  ],
  tarifsTitre: "Tarifs et frais",
  tarifs: [
    {
      nom: "Réservations",
      prix: PRIX_MODULE.reservations,
      detail: `${PRIX_MODULE_TTC.reservations} · ${ESSAI_JOURS.reservations} jours d'essai`,
    },
    {
      nom: "Réservations + visibilité",
      prix: PRIX_PACK,
      detail: `${PRIX_PACK_TTC} · onze pour cent de moins que séparément`,
    },
  ],
  fraisTitre: "Ce que vous ne payez pas",
  frais: [
    "Aucune commission, ni sur les couverts, ni sur les privatisations.",
    "Aucun frais d'installation, aucun engagement : vous résiliez en un clic depuis le tableau de bord.",
    "Les seuls frais éventuels sont ceux de Stripe, sur les paiements en ligne (acomptes, expériences, bons cadeaux) : ils dépendent de votre contrat Stripe, et Klarr n'y ajoute rien.",
  ],
  questionsTitre: "Questions fréquentes",
  questions: [
    {
      question: "Klarr prend-il une commission sur les réservations ?",
      reponse: `Non. Le module Réservations coûte ${PRIX_MODULE.reservations} (${PRIX_MODULE_TTC.reservations}), quel que soit le nombre de couverts. Les paiements en ligne vont directement sur votre compte Stripe.`,
    },
    {
      question: "Dois-je confirmer chaque réservation à la main ?",
      reponse:
        "Non, sauf si vous le souhaitez. Par défaut, Klarr confirme seul les tables demandées à l'avance. Il vous laisse la main sur deux cas : les demandes de dernière minute (moins de 24 heures avant le service, délai réglable) et les privatisations. Vous pouvez aussi tout valider vous-même.",
    },
    {
      question: "Comment les clients trouvent-ils ma page de réservation ?",
      reponse:
        "Par le lien que vous partagez : dans votre fiche Google, sur Instagram, sur Facebook, sur votre site ou dans vos e-mails. Klarr ne vous inscrit sur aucune plateforme.",
    },
    {
      question: "Puis-je garder TheFork en même temps ?",
      reponse:
        "Oui. TheFork continue de vous amener des clients qui ne vous connaissent pas, avec sa commission ; votre page Klarr reçoit sans commission ceux qui vous cherchent déjà. Les deux carnets restent séparés.",
    },
    {
      question: "Que se passe-t-il si j'arrête ?",
      reponse:
        "Vous résiliez en un clic et votre page de réservation cesse d'accepter des demandes. Il n'y a ni préavis ni frais de sortie.",
    },
    {
      question: "La démo est-elle gratuite ?",
      reponse: `Oui. Écrivez-nous à contact@klarr.net : nous vous montrons le logiciel sur votre établissement, sans engagement. Vous pouvez aussi l'essayer seul pendant ${ESSAI_JOURS.reservations} jours, sans carte bancaire.`,
    },
  ],
  finTitre: "Votre page de réservation, prête aujourd'hui",
  finTexte: `Créez votre établissement, réglez vos services et vos salles, puis collez le lien dans votre fiche Google. ${ESSAI_JOURS.reservations} jours d'essai, sans carte bancaire.`,
  pourAllerPlusLoin: "Pour aller plus loin",
  liens: [
    {
      href: "/calculateur-commissions-restaurant",
      texte: "Calculer ce que vos commissions vous coûtent",
    },
    {
      href: "/comparatif-logiciels-reservation-restaurant",
      texte: "Comparer Klarr, TheFork, Zenchef et Guestonline",
    },
    {
      href: "/blog/reservations-sans-commission-guide-restaurants-independants",
      texte:
        "Réservations sans commission : ce que ça vous ferait gagner, vraiment",
    },
  ],
  captureDemo: "Capture du restaurant de démonstration",
};

const en: ContenuSansCommission = {
  titreSeo: "Commission-free restaurant booking software",
  descriptionSeo: `A booking page in your name, a reservation book and a service screen, for ${EN.reservations} excl. VAT a month. No commission per cover. Watch the whole journey on video.`,
  fil: "Bookings",
  titre: "Commission-free booking software for independent restaurants",
  chapo:
    "Your guests book on a page in your name. The request lands in Klarr, you confirm it or Klarr does it for you, and on the day it is on your service screen. A fixed subscription, and nothing taken on covers.",
  essayer: `Try it free for ${ESSAI_JOURS.reservations} days`,
  demo: "Ask for a demo",
  sujetDemo: "Klarr bookings demo",
  sousBoutons:
    "No card, no contract. For a demo, write to us: we will show you the software on your own restaurant.",
  video: {
    titre: "The whole journey, in under a minute",
    legende:
      "Recorded on Klarr's demo restaurant, La Table d'Anselme. These are the screens you will get.",
    description:
      "A guest books a table for four on La Table d'Anselme's page and receives the acknowledgement; the restaurant then sees the request arrive in Klarr, accepts it, and finds it on the day's service screen.",
  },
  commentTitre: "How it works",
  commentChapo:
    "Four screens, from the guest's request to the rush. The orange notes show where to look.",
  etapes: [
    {
      capture: "1-reserver",
      titre: "1. The guest picks a table",
      texte:
        "On your booking page, they choose the date, the party size and the time. Only slots that are really free are shown, worked out from your services, your rooms and their capacity. No account to create: a name and an e-mail are enough.",
      alt: "La Table d'Anselme's booking page: date, party size, dinner slots and contact form.",
    },
    {
      capture: "2-merci",
      titre: "2. They get an answer straight away",
      texte:
        "An e-mail goes out at once: the confirmation if the table is secured, an acknowledgement otherwise. It carries a link to cancel on their own, and a reminder is sent the day before.",
      alt: "The screen the guest sees after sending the request.",
    },
    {
      capture: "3-carnet",
      titre: "3. The request lands in your book",
      texte:
        "You are told by e-mail and, if you switch it on, by a notification on your phone. You accept or decline in one click, and note an allergy or a habit — the note never leaves the book.",
      alt: "Klarr's reservation book, with requests to handle and the Accept and Decline buttons.",
    },
    {
      capture: "4-service",
      titre: "4. On the day, everything is on the service screen",
      texte:
        "The day's bookings, service by service and room by room, with your table plan. You seat everyone, add those who phone in, and print the day sheet as a PDF if you prefer paper.",
      alt: "Klarr's service screen: plan of the dining room and terrace, occupied tables and the list of dinner bookings.",
    },
  ],
  fonctionsTitre: "What the Bookings module does",
  fonctions: [
    {
      titre: "For your guests",
      lignes: [
        "A booking page in your name, to paste into your Google listing, your Instagram or your website.",
        "A widget to embed directly in your website, if you have one.",
        "Booking a table, or hiring a whole room from the number of covers you set.",
        "Confirmation, next-day reminder and cancellation e-mails, in French, English or Chinese.",
      ],
    },
    {
      titre: "For the restaurant",
      lignes: [
        "A book where requests arrive, with automatic confirmation you can switch off.",
        "A service screen, a table plan and the day sheet as a PDF.",
        "Phone bookings, entered in the same place as the others.",
        "A calendar and statistics: covers per day, per room, and where the bookings come from.",
        "Importing your book from a file exported from TheFork or Zenchef.",
      ],
    },
    {
      titre: "Money and guests",
      lignes: [
        "Deposits or a card hold for private hire, paid into your own Stripe account.",
        "Quotes for groups, accepted online.",
        "A guest list rebuilt from the book, and e-mails to those who agreed to receive them.",
        "Paid-seat experiences (workshops, tastings) and gift vouchers, paid into your Stripe account.",
      ],
    },
  ],
  limitesTitre: "What Klarr does not do",
  limites: [
    {
      titre: "It does not bring you new guests",
      texte:
        "Klarr is not a marketplace like TheFork. It takes, with no commission, those who already look for you or find you through Google. The two can live side by side, but the books stay separate.",
    },
    {
      titre: "No “Reserve with Google” button",
      texte:
        "Klarr is not part of that programme. You paste your booking link into your Google listing, and Google shows a button that leads to your page.",
    },
    {
      titre: "No text messages",
      texte:
        "Confirmations and reminders go out by e-mail. The guest's phone number is asked for, but optional.",
    },
  ],
  tarifsTitre: "Pricing and fees",
  tarifs: [
    {
      nom: "Bookings",
      prix: `${EN.reservations} excl. VAT / month`,
      detail: `${EN.reservationsTTC} incl. VAT · ${ESSAI_JOURS.reservations}-day trial`,
    },
    {
      nom: "Bookings + visibility",
      prix: `${EN.pack} excl. VAT / month`,
      detail: `${EN.packTTC} incl. VAT · eleven per cent less than separately`,
    },
  ],
  fraisTitre: "What you do not pay",
  frais: [
    "No commission, on covers or on private hire.",
    "No set-up fee, no contract: you cancel in one click from the dashboard.",
    "The only possible fees are Stripe's, on online payments (deposits, experiences, gift vouchers): they depend on your Stripe contract, and Klarr adds nothing to them.",
  ],
  questionsTitre: "Frequently asked questions",
  questions: [
    {
      question: "Does Klarr take a commission on bookings?",
      reponse: `No. The Bookings module costs ${EN.reservations} excl. VAT a month (${EN.reservationsTTC} incl. VAT), whatever the number of covers. Online payments go straight into your Stripe account.`,
    },
    {
      question: "Do I have to confirm every booking by hand?",
      reponse:
        "No, unless you want to. By default, Klarr confirms tables booked in advance on its own. It leaves two cases to you: last-minute requests (less than 24 hours before the service, adjustable) and private hire. You can also confirm everything yourself.",
    },
    {
      question: "How do guests find my booking page?",
      reponse:
        "Through the link you share: in your Google listing, on Instagram, on Facebook, on your website or in your e-mails. Klarr does not list you on any platform.",
    },
    {
      question: "Can I keep TheFork at the same time?",
      reponse:
        "Yes. TheFork keeps bringing you guests who do not know you, with its commission; your Klarr page takes, with no commission, those who already look for you. The two books stay separate.",
    },
    {
      question: "What happens if I stop?",
      reponse:
        "You cancel in one click and your booking page stops taking requests. There is no notice period and no exit fee.",
    },
    {
      question: "Is the demo free?",
      reponse: `Yes. Write to us at contact@klarr.net: we will show you the software on your restaurant, with no commitment. You can also try it on your own for ${ESSAI_JOURS.reservations} days, with no card.`,
    },
  ],
  finTitre: "Your booking page, ready today",
  finTexte: `Create your restaurant, set your services and rooms, then paste the link into your Google listing. ${ESSAI_JOURS.reservations}-day trial, no card.`,
  pourAllerPlusLoin: "Further reading",
  liens: [
    {
      href: "/calculateur-commissions-restaurant",
      texte: "Work out what your commissions cost you",
    },
    {
      href: "/comparatif-logiciels-reservation-restaurant",
      texte: "Compare Klarr, TheFork, Zenchef and Guestonline",
    },
    {
      href: "/blog/en/reservations-sans-commission-guide-restaurants-independants",
      texte: "Commission-free bookings: what you would really gain",
    },
  ],
  captureDemo: "Screenshot of the demo restaurant",
};

const zh: ContenuSansCommission = {
  titreSeo: "不抽佣金的餐厅订位系统",
  descriptionSeo: `以您餐厅命名的订位页面、订位簿和营业屏幕，每月 ${ZH.reservations}（不含税）。不按每位客人抽成。观看完整流程视频。`,
  fil: "订位",
  titre: "为独立餐厅打造、不抽佣金的订位系统",
  chapo:
    "客人在以您餐厅命名的页面上订位。请求进入 Klarr，由您确认，或由 Klarr 自动确认；到了当天，它就出现在您的营业屏幕上。固定订阅费，不从任何一位客人身上抽成。",
  essayer: `免费试用 ${ESSAI_JOURS.reservations} 天`,
  demo: "预约演示",
  sujetDemo: "Klarr 订位演示",
  sousBoutons:
    "无需银行卡，无需签约。如需演示，请给我们写信：我们会在您自己的餐厅上为您演示。",
  video: {
    titre: "完整流程，不到一分钟看完",
    legende:
      "在 Klarr 的演示餐厅 La Table d'Anselme 上录制。画面就是您将使用的界面。",
    description:
      "一位客人在 La Table d'Anselme 的页面上为四个人订位并收到确认回执；随后餐厅在 Klarr 中看到请求、接受它，并在当天的营业屏幕上找到这桌客人。",
  },
  commentTitre: "如何运作",
  commentChapo: "四个画面，从客人的请求到用餐高峰。橙色标注指出该看的地方。",
  etapes: [
    {
      capture: "1-reserver",
      titre: "1. 客人选择餐桌",
      texte:
        "在您的订位页面上，客人选择日期、人数和时间。页面只显示真正有空的时段，根据您的餐段、厅区和容量计算。无需注册账户：姓名和电子邮箱就够了。",
      alt: "La Table d'Anselme 的订位页面：日期、人数、晚餐时段和联系表单。",
    },
    {
      capture: "2-merci",
      titre: "2. 客人立即收到回复",
      texte:
        "系统立即发出一封电子邮件：若餐桌已确定则为确认信，否则为收到请求的回执。邮件中附有自行取消的链接，并会在前一天发送提醒。",
      alt: "客人发送请求后看到的画面。",
    },
    {
      capture: "3-carnet",
      titre: "3. 请求进入您的订位簿",
      texte:
        "您会收到电子邮件通知；如果开启，手机上也会收到推送。一键接受或拒绝，还可以记下过敏或习惯——这条备注永远不会离开订位簿。",
      alt: "Klarr 的订位簿，显示待处理的请求以及接受和拒绝按钮。",
    },
    {
      capture: "4-service",
      titre: "4. 当天，一切都在营业屏幕上",
      texte:
        "当天的订位，按餐段、按厅区排列，并附有您的餐桌平面图。您为每位客人安排座位，添加电话订位；如果更习惯纸张，还可以把当天的清单打印成 PDF。",
      alt: "Klarr 的营业屏幕：大厅和露台的平面图、已占用的餐桌和晚餐订位列表。",
    },
  ],
  fonctionsTitre: "订位模块能做什么",
  fonctions: [
    {
      titre: "面向客人",
      lignes: [
        "以您餐厅命名的订位页面，可以贴到 Google 商家资料、Instagram 或您的网站上。",
        "如果您有网站，可以直接嵌入订位组件。",
        "预订一张餐桌，或在达到您设定的人数时包下整个厅区。",
        "确认、前一天提醒和取消邮件，支持法语、英语和中文。",
      ],
    },
    {
      titre: "面向餐厅",
      lignes: [
        "所有请求都进入订位簿，自动确认可以随时关闭。",
        "营业屏幕、餐桌平面图和 PDF 格式的当日清单。",
        "电话订位也在同一个地方录入。",
        "日历和统计：每天、每个厅区的人数，以及订位来自哪里。",
        "可从 TheFork 或 Zenchef 导出的文件导入您的订位簿。",
      ],
    },
    {
      titre: "收款与客户",
      lignes: [
        "包场可收取订金或银行卡预授权，款项直接进入您自己的 Stripe 账户。",
        "为团体客人出报价单，客人在线接受。",
        "根据订位簿自动整理的客户档案，并可向同意接收的客人发送邮件。",
        "收费体验活动（工作坊、品鉴会）和礼品券，通过您的 Stripe 账户收款。",
      ],
    },
  ],
  limitesTitre: "Klarr 不做什么",
  limites: [
    {
      titre: "它不会给您带来新客人",
      texte:
        "Klarr 不是像 TheFork 那样的平台市场。它不抽成地接待已经在找您、或通过 Google 找到您的客人。两者可以并用，但订位簿彼此独立。",
    },
    {
      titre: "没有「通过 Google 预订」按钮",
      texte:
        "Klarr 不在该计划之内。您把订位链接贴到 Google 商家资料中，Google 会显示一个跳转到您页面的按钮。",
    },
    {
      titre: "不发短信",
      texte: "确认和提醒都通过电子邮件发送。会询问客人的电话号码，但不是必填。",
    },
  ],
  tarifsTitre: "价格与费用",
  tarifs: [
    {
      nom: "订位",
      prix: `每月 ${ZH.reservations}（不含税）`,
      detail: `含税 ${ZH.reservationsTTC} · ${ESSAI_JOURS.reservations} 天试用`,
    },
    {
      nom: "订位 + 曝光度",
      prix: `每月 ${ZH.pack}（不含税）`,
      detail: `含税 ${ZH.packTTC} · 比分开购买便宜百分之十一`,
    },
  ],
  fraisTitre: "您不需要支付的",
  frais: [
    "不抽任何佣金，无论是散客还是包场。",
    "没有安装费，无需签约：在后台一键取消。",
    "唯一可能产生的费用是 Stripe 对在线付款（订金、体验活动、礼品券）收取的手续费：取决于您与 Stripe 的合同，Klarr 不额外加收。",
  ],
  questionsTitre: "常见问题",
  questions: [
    {
      question: "Klarr 会从订位中抽成吗？",
      reponse: `不会。订位模块每月 ${ZH.reservations}（不含税），含税 ${ZH.reservationsTTC}，无论客人多少。在线付款直接进入您的 Stripe 账户。`,
    },
    {
      question: "每个订位都要我手动确认吗？",
      reponse:
        "不需要，除非您愿意。默认情况下，Klarr 会自动确认提前预订的餐桌。有两种情况会留给您决定：临时请求（餐段开始前 24 小时内，可调整）和包场。您也可以全部自己确认。",
    },
    {
      question: "客人如何找到我的订位页面？",
      reponse:
        "通过您分享的链接：Google 商家资料、Instagram、Facebook、您的网站或您的邮件。Klarr 不会把您登记到任何平台。",
    },
    {
      question: "我可以同时保留 TheFork 吗？",
      reponse:
        "可以。TheFork 继续为您带来不认识您的客人，并收取佣金；您的 Klarr 页面则不抽成地接待已经在找您的客人。两个订位簿彼此独立。",
    },
    {
      question: "如果我停止使用会怎样？",
      reponse:
        "一键取消，您的订位页面将不再接受请求。没有提前通知期，也没有退出费用。",
    },
    {
      question: "演示是免费的吗？",
      reponse: `是的。请写信至 contact@klarr.net：我们会在您的餐厅上为您演示，没有任何义务。您也可以自己免费试用 ${ESSAI_JOURS.reservations} 天，无需银行卡。`,
    },
  ],
  finTitre: "您的订位页面，今天就能上线",
  finTexte: `创建您的餐厅，设置餐段和厅区，然后把链接贴到 Google 商家资料中。${ESSAI_JOURS.reservations} 天试用，无需银行卡。`,
  pourAllerPlusLoin: "延伸阅读",
  liens: [
    {
      href: "/calculateur-commissions-restaurant",
      texte: "计算佣金让您付出了多少",
    },
    {
      href: "/comparatif-logiciels-reservation-restaurant",
      texte: "比较 Klarr、TheFork、Zenchef 和 Guestonline",
    },
    {
      href: "/blog/zh/reservations-sans-commission-guide-restaurants-independants",
      texte: "不抽佣金的订位：到底能省下多少",
    },
  ],
  captureDemo: "演示餐厅截图",
};

export const SANS_COMMISSION: Record<Langue, ContenuSansCommission> = {
  fr,
  en,
  zh,
};
