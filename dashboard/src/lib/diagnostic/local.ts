import type { Langue } from "@/lib/i18n/langues";
import type { Trad } from "@/lib/i18n/outils";

/**
 * « Ce local peut-il accueillir mon restaurant ? »
 *
 * **Ce questionnaire ne rend jamais de verdict.** C'est la contrainte qui
 * tient tout le fichier, et elle n'est pas une précaution d'avocat.
 *
 * Un outil qui répondrait « ce local convient » serait lu comme une
 * autorisation. Quelqu'un signerait dessus. Et le jour où le syndic
 * refuse le passage du conduit en parties communes, ce ne sera pas une
 * déception : ce seront trente mille euros de travaux impossibles et un
 * bail de neuf ans sur les bras. Klarr n'a vu ni le local, ni le
 * règlement de copropriété, ni le bail. Klarr ne peut donc rien conclure.
 *
 * Ce qu'il fait à la place : transformer « je ne sais pas » en **une
 * question précise adressée à quelqu'un de précis**. Le syndic pour le
 * règlement, la mairie pour l'urbanisme et le domaine public, le bailleur
 * pour la destination, un bureau d'études pour l'extraction. C'est moins
 * spectaculaire qu'un feu vert, et infiniment plus utile : un
 * restaurateur qui arrive chez le syndic en sachant quoi demander
 * n'achète pas le même local que celui qui découvre après.
 *
 * Les cinq points sont ceux qui empêchent d'ouvrir, pas ceux qui coûtent
 * du temps. On ne parle ici ni de licence, ni de HACCP, ni de SACEM : ça
 * se règle après la signature. L'extraction, la destination, la
 * copropriété, l'ERP et la terrasse se règlent avant — ou ne se règlent
 * pas.
 *
 * **Les textes sont trilingues, et c'est ici que ça compte le plus.**
 * Celui qui ne connaît pas le droit français est celui à qui ces
 * questions servent, et c'est aussi celui qui ne les aurait pas
 * trouvées. Les termes administratifs restent en français dans les
 * traductions — « syndic », « assemblée générale », « déspécialisation »
 * — parce qu'il faudra les prononcer au téléphone.
 */

export type Reponse = "oui" | "non" | "inconnu";
export const REPONSES: Reponse[] = ["oui", "non", "inconnu"];

/**
 * Trois niveaux, et aucun ne dit « c'est bon ».
 *
 * « leve » signifie seulement que ce point-ci ne réclame plus de
 * vérification — pas que le local convient. Aucun cumul de « leve » ne
 * produit jamais un feu vert, et l'écran le répète.
 */
export type Niveau = "bloquant" | "verifier" | "leve";

export type PointId =
  | "extraction"
  | "destination"
  | "copropriete"
  | "erp"
  | "terrasse";

export type Point = {
  id: PointId;
  titre: Trad;
  /** À qui poser la question. C'est la vraie valeur de l'outil. */
  aQuiDemander: Trad;
  /** L'article du journal qui développe, quand il existe. */
  article?: { slug: string; titre: Trad };
};

export const POINTS: Point[] = [
  {
    id: "extraction",
    titre: {
      fr: "L'extraction",
      en: "Kitchen extraction",
      zh: "厨房排烟",
    },
    aQuiDemander: {
      fr: "Le syndic, pour savoir si un conduit existe et s'il dessert votre lot. Un bureau d'études fluides ou un cuisiniste, pour vérifier qu'il est dimensionné pour votre cuisine. Et le règlement de copropriété, avant tout le reste.",
      en: "The syndic (the building's managing agent), to find out whether a flue exists and whether it serves your unit. A ventilation engineer or kitchen fitter, to confirm it is sized for your kitchen. And the règlement de copropriété — the building's co-ownership rules — before anything else.",
      zh: "找 syndic（大楼管理方），确认是否已有排烟管道、以及该管道是否供您这个单元使用。再找通风工程师或厨房设备商，确认管径够不够您的厨房。而在这一切之前，先看 règlement de copropriété（共有产权规约）。",
    },
    article: {
      slug: "extraction-restaurant-conduit-toiture",
      titre: {
        fr: "L'extraction : le seul point qu'on ne règle pas avec de l'argent",
        en: "Extraction: the one point money cannot fix",
        zh: "排烟：唯一花钱也解决不了的一关",
      },
    },
  },
  {
    id: "destination",
    titre: {
      fr: "La destination",
      en: "Permitted use",
      zh: "用途许可",
    },
    aQuiDemander: {
      fr: "Le bail lui-même, sa clause de destination, mot à mot — pas le résumé de l'agent. Le bailleur, par écrit. Et le service urbanisme de la mairie pour la partie changement de destination.",
      en: "The lease itself — its clause de destination, word for word, not the agent's summary. The landlord, in writing. And the town hall's planning department (service urbanisme) for the change-of-use side.",
      zh: "先看租约本身的 clause de destination（用途条款），逐字看，别信中介的转述。再让房东书面确认。用途变更那一块，找市政厅的 service urbanisme（城市规划科）。",
    },
    article: {
      slug: "destination-bail-commercial-restauration",
      titre: {
        fr: "« Tous commerces » ne veut pas dire restaurant",
        en: "“Any retail use” does not mean restaurant",
        zh: "「可经营任何商业」不等于可以开餐厅",
      },
    },
  },
  {
    id: "copropriete",
    titre: {
      fr: "La copropriété",
      en: "The co-ownership",
      zh: "共有产权",
    },
    aQuiDemander: {
      fr: "Le syndic : le règlement de copropriété en entier, et les procès-verbaux des dernières assemblées générales. Les PV disent ce que la copropriété a déjà refusé à d'autres.",
      en: "The syndic: the full règlement de copropriété, and the minutes of the last few assemblées générales (the owners' meetings). Those minutes tell you what the building has already refused other people.",
      zh: "找 syndic 要两份东西：完整的 règlement de copropriété，以及最近几次 assemblée générale（业主大会）的会议记录。记录会告诉您，这栋楼以前拒绝过别人什么。",
    },
    article: {
      slug: "reglement-copropriete-restaurant",
      titre: {
        fr: "Le règlement de copropriété passe avant votre bail",
        en: "The co-ownership rules outrank your lease",
        zh: "共有产权规约的效力高于您的租约",
      },
    },
  },
  {
    id: "erp",
    titre: {
      fr: "L'ERP",
      en: "Public-venue rules (ERP)",
      zh: "公共场所规范（ERP）",
    },
    aQuiDemander: {
      fr: "La mairie, service des ERP ou de l'autorisation de travaux. Un architecte ou un bureau de contrôle si vous touchez à la distribution des locaux.",
      en: "The town hall — the ERP or building-works permit desk. An architect or an approved inspection body if you are changing the layout.",
      zh: "找市政厅负责 ERP 或施工许可的部门。如果要改动室内格局，还需要建筑师或检验机构。",
    },
    article: {
      slug: "erp-restaurant-categorie-commission-securite",
      titre: {
        fr: "ERP : votre capacité ne dépend pas du nombre de chaises",
        en: "ERP: your capacity is not the number of chairs",
        zh: "ERP：容纳人数不是按椅子数算的",
      },
    },
  },
  {
    id: "terrasse",
    titre: {
      fr: "La terrasse",
      en: "The pavement terrace",
      zh: "露天座位",
    },
    aQuiDemander: {
      fr: "La mairie, service de l'occupation du domaine public. Demandez ce qui est autorisé aujourd'hui, et ce qui serait autorisé à un nouvel exploitant — ce sont deux réponses différentes.",
      en: "The town hall's public-space occupancy desk. Ask what is permitted today, and what would be permitted to a new operator — those are two different answers.",
      zh: "找市政厅负责公共空间占用的部门。要问两件事：现在允许什么，以及换成新经营者还会不会批——这是两个不同的答案。",
    },
    article: {
      slug: "terrasse-restaurant-autorisation-domaine-public",
      titre: {
        fr: "La terrasse ne se vend pas avec le fonds de commerce",
        en: "The terrace is not sold with the business",
        zh: "露天座位不随店铺转让",
      },
    },
  },
];

export type Constat = { niveau: Niveau; texte: Trad };

export type Question = {
  id: string;
  point: PointId;
  texte: Trad;
  aide?: Trad;
  /** Ce que chaque réponse déclenche. Aucune ne produit « c'est bon ». */
  suites: Record<Reponse, Constat>;
};

const A_VERIFIER: Constat = {
  niveau: "verifier",
  texte: {
    fr: "À vérifier avant de signer.",
    en: "To check before you sign.",
    zh: "签约前需核实。",
  },
};

export const QUESTIONS: Question[] = [
  {
    id: "conduit",
    point: "extraction",
    texte: {
      fr: "Le local dispose-t-il déjà d'un conduit d'extraction qui monte au-dessus du toit ?",
      en: "Does the unit already have an extraction flue that rises above the roof?",
      zh: "这个铺面是否已经有一条通到屋顶以上的排烟管道？",
    },
    aide: {
      fr: "Une hotte qui rejette en façade ou dans la cour n'est pas un conduit d'extraction.",
      en: "A hood venting onto the street front or into the courtyard is not an extraction flue.",
      zh: "把油烟排到临街墙面或内院的抽油烟机，不算排烟管道。",
    },
    suites: {
      oui: {
        niveau: "verifier",
        texte: {
          fr: "Un conduit existe : c'est la bonne nouvelle. Reste à faire confirmer qu'il dessert bien votre lot, qu'il est dimensionné pour votre cuisine et qu'il est en état — un conduit ancien peut être hors service ou revendiqué par un autre lot.",
          en: "A flue exists — that is the good news. It still needs confirming that it serves your unit, that it is sized for your kitchen and that it works: an old flue may be out of service, or claimed by another unit.",
          zh: "有管道，这是好消息。但还要确认三件事：它确实供您这个单元使用、管径够您的厨房、而且仍然能用——老管道可能早已停用，或被另一个单元占着。",
        },
      },
      non: {
        niveau: "bloquant",
        texte: {
          fr: "Sans conduit, il faut en créer un, et il traversera des parties communes. Cela suppose un vote en assemblée générale qui peut être refusé, et un coût qui se compte en dizaines de milliers d'euros. C'est le point à régler avant de discuter du prix, pas après.",
          en: "With no flue, one must be built — and it will pass through the building's common parts. That requires a vote at the assemblée générale, which can be refused, and a cost running into tens of thousands of euros. Settle this before discussing price, not after.",
          zh: "没有管道就得新建，而管道要穿过大楼的共有部分。这需要 assemblée générale（业主大会）投票通过，而大会是可能否决的；造价往往是几万欧元起。这件事要在谈价格之前解决，不是之后。",
        },
      },
      inconnu: {
        niveau: "bloquant",
        texte: {
          fr: "Ne signez pas sans le savoir. C'est la question la plus chère de la liste, et la seule dont la réponse peut rendre le projet impossible plutôt que coûteux.",
          en: "Do not sign without knowing. This is the most expensive question on the list, and the only one whose answer can make the project impossible rather than merely costly.",
          zh: "没查清楚就别签。这是整份清单里最贵的一个问题，也是唯一一个答案可能让项目彻底做不成、而不只是变贵的问题。",
        },
      },
    },
  },
  {
    id: "restaurant-avant",
    point: "extraction",
    texte: {
      fr: "Un restaurant était-il déjà exploité dans ce local ?",
      en: "Was a restaurant already trading in this unit?",
      zh: "这个铺面此前是否已经在做餐饮？",
    },
    aide: {
      fr: "Un prédécesseur rend l'extraction plausible — il ne la garantit pas.",
      en: "A predecessor makes extraction plausible — it does not guarantee it.",
      zh: "前一家做过餐饮，说明排烟「可能」没问题，但不等于有保证。",
    },
    suites: {
      oui: {
        niveau: "verifier",
        texte: {
          fr: "Un restaurant précédent est un bon signe, jamais une preuve. Demandez depuis quand il a fermé : une installation à l'arrêt depuis des années peut ne plus être conforme, et une activité tolérée par le passé ne crée pas de droit.",
          en: "A previous restaurant is a good sign, never proof. Ask how long ago it closed: an installation idle for years may no longer comply, and an activity tolerated in the past creates no right.",
          zh: "前一家是餐厅是个好兆头，但从来不是证据。问清楚它关了多久：停用多年的设备可能已经不合规，而过去被默许的经营方式并不产生任何权利。",
        },
      },
      non: {
        niveau: "verifier",
        texte: {
          fr: "Aucun prédécesseur en restauration : extraction, destination et copropriété sont à vérifier une par une, sans rien présumer.",
          en: "No restaurant predecessor: extraction, permitted use and co-ownership must each be checked, assuming nothing.",
          zh: "此前没有餐饮经营：排烟、用途许可、共有产权规约都要逐项核实，不能想当然。",
        },
      },
      inconnu: A_VERIFIER,
    },
  },
  {
    id: "bail-restauration",
    point: "destination",
    texte: {
      fr: "Le bail autorise-t-il explicitement l'activité de restauration, en toutes lettres ?",
      en: "Does the lease expressly allow restaurant use, in so many words?",
      zh: "租约是否白纸黑字写明允许餐饮经营？",
    },
    aide: {
      fr: "« Tous commerces » n'est pas « restauration ». Lisez la clause, pas le résumé.",
      en: "“Any retail use” is not “restaurant use”. Read the clause, not the summary.",
      zh: "「可经营任何商业」不等于「可以做餐饮」。要读条款原文，不是摘要。",
    },
    suites: {
      oui: {
        niveau: "leve",
        texte: {
          fr: "La clause vous couvre. Gardez-en une copie et vérifiez qu'elle vise bien la restauration sur place si c'est votre projet, et pas seulement la vente à emporter.",
          en: "The clause covers you. Keep a copy, and check it really covers eating in if that is your plan, not takeaway only.",
          zh: "条款能保护您。留一份复印件，并确认它涵盖的是堂食（如果您做的是堂食），而不仅仅是外带。",
        },
      },
      non: {
        niveau: "bloquant",
        texte: {
          fr: "Exercer une activité que le bail ne prévoit pas suppose une déspécialisation : une procédure, des délais, et l'accord ou l'arbitrage du bailleur. Faites-la trancher avant de signer, jamais après.",
          en: "Carrying on an activity the lease does not provide for requires a déspécialisation — a formal change-of-use procedure, with delays and either the landlord's agreement or a court's. Settle it before signing, never after.",
          zh: "要做租约没写的经营内容，就得办 déspécialisation（变更经营范围的法定程序）：有流程、有时间成本，还要房东同意或由法院裁定。这件事要在签约前解决，绝不能拖到签完之后。",
        },
      },
      inconnu: {
        niveau: "bloquant",
        texte: {
          fr: "La clause de destination se lit en deux minutes et engage neuf ans. Demandez le projet de bail et faites-la relire.",
          en: "The permitted-use clause takes two minutes to read and commits you for nine years. Ask for the draft lease and have it reviewed.",
          zh: "用途条款两分钟就能读完，却绑住您九年。把租约草稿要来，请人过目。",
        },
      },
    },
  },
  {
    id: "changement-destination",
    point: "destination",
    texte: {
      fr: "Le local est-il déjà un commerce de restauration au regard de l'urbanisme ?",
      en: "Is the unit already classed as restaurant use under planning rules?",
      zh: "在城市规划的分类上，这个铺面本来就是餐饮用途吗？",
    },
    aide: {
      fr: "Un ancien bureau, une boutique ou un logement ne le sont pas.",
      en: "A former office, shop or home is not.",
      zh: "原本是办公室、商店或住宅的，都不是。",
    },
    suites: {
      oui: {
        niveau: "leve",
        texte: {
          fr: "Rien à demander de ce côté-là.",
          en: "Nothing to ask on that front.",
          zh: "这一项无需另外申请。",
        },
      },
      non: {
        niveau: "verifier",
        texte: {
          fr: "Un changement de destination peut être exigé, avec une autorisation d'urbanisme à obtenir avant travaux. Le délai n'est pas le même partout — c'est une question à poser à votre mairie, pas à un tableau générique.",
          en: "A change of use may be required, with a planning consent to obtain before works start. The timescale differs from place to place — ask your town hall, not a generic table.",
          zh: "可能需要办理用途变更，并在动工前取得规划许可。各地所需时间不同——这个问题要问您当地的市政厅，而不是查一张通用的表。",
        },
      },
      inconnu: A_VERIFIER,
    },
  },
  {
    id: "reglement-copro",
    point: "copropriete",
    texte: {
      fr: "Avez-vous lu le règlement de copropriété, et autorise-t-il une activité de restauration ?",
      en: "Have you read the co-ownership rules, and do they allow restaurant use?",
      zh: "您读过 règlement de copropriété（共有产权规约）了吗？它允许做餐饮吗？",
    },
    suites: {
      oui: {
        niveau: "leve",
        texte: {
          fr: "Vous l'avez lu, c'est déjà plus que la plupart. Vérifiez au passage ce qu'il dit des horaires, des livraisons et des nuisances : ces clauses-là se réveillent à la première plainte.",
          en: "You have read it, which is already more than most. While you are there, check what it says about opening hours, deliveries and nuisance: those clauses wake up at the first complaint.",
          zh: "您读过了，这已经胜过大多数人。顺便看看关于营业时间、送货和噪音扰民的条款：这些条款平时沉睡，一有投诉就会被搬出来。",
        },
      },
      non: {
        niveau: "bloquant",
        texte: {
          fr: "Une clause d'habitation bourgeoise stricte interdit toute activité commerciale, et elle s'impose au bail. Ce document se demande au syndic et se lit avant de signer.",
          en: "A strict “residential use only” clause bars all commercial activity, and it overrides the lease. Ask the syndic for the document and read it before signing.",
          zh: "有一种叫 habitation bourgeoise stricte 的条款，禁止一切商业经营，而且效力高于租约。这份文件向 syndic 索取，并且要在签约前读完。",
        },
      },
      inconnu: {
        niveau: "bloquant",
        texte: {
          fr: "Le règlement de copropriété prime sur ce que le bailleur vous dit. Réclamez-le, ainsi que les PV des dernières assemblées générales.",
          en: "The co-ownership rules outrank whatever the landlord tells you. Ask for them, along with the minutes of the recent owners' meetings.",
          zh: "共有产权规约的效力高于房东口头说的任何话。把它要来，连同最近几次业主大会的会议记录。",
        },
      },
    },
  },
  {
    id: "logements-dessus",
    point: "copropriete",
    texte: {
      fr: "Y a-t-il des logements habités au-dessus du local ?",
      en: "Are there occupied homes above the unit?",
      zh: "铺面楼上有人居住吗？",
    },
    suites: {
      oui: {
        niveau: "verifier",
        texte: {
          fr: "Des voisins au-dessus, c'est le bruit de la hotte, les livraisons du matin et les départs de terrasse le soir. Rien de rédhibitoire, mais un sujet à traiter dès le chantier — l'isolation se décide avant, jamais après la première plainte.",
          en: "Neighbours above means extractor noise, morning deliveries and the terrace emptying at night. Not a deal-breaker, but something to handle during the works: soundproofing is decided beforehand, never after the first complaint.",
          zh: "楼上有住户，就意味着抽油烟机的噪音、清晨送货、以及深夜露天座散场的声音。这不致命，但要在装修阶段就处理——隔音是事先决定的事，绝不是等第一次投诉之后再说。",
        },
      },
      non: {
        niveau: "leve",
        texte: {
          fr: "Un sujet de moins.",
          en: "One less thing.",
          zh: "少一件要操心的事。",
        },
      },
      inconnu: A_VERIFIER,
    },
  },
  {
    id: "capacite",
    point: "erp",
    texte: {
      fr: "Visez-vous plus de 200 personnes au total, ou du public en étage ou en sous-sol ?",
      en: "Are you aiming for more than 200 people in total, or seating the public upstairs or in a basement?",
      zh: "您预计总人数会超过 200 人，或者要在楼上、地下室接待客人吗？",
    },
    aide: {
      fr: "Le total compte le public et le personnel.",
      en: "The total counts customers and staff.",
      zh: "总人数把客人和员工一起算。",
    },
    suites: {
      oui: {
        niveau: "verifier",
        texte: {
          fr: "Vous sortez probablement de la cinquième catégorie, celle des petits établissements. Les exigences changent — dégagements, sécurité incendie, passage en commission. À chiffrer avant de signer, parce que ça se traduit en travaux.",
          en: "You are probably leaving the fifth ERP category, the one for small venues. The requirements change — escape routes, fire safety, a safety-commission inspection. Cost it before signing, because it turns into building work.",
          zh: "您大概会超出 ERP 第五类（小型场所）的范围。要求会随之改变：疏散通道、消防、还要过安全委员会的审查。这些最终都变成装修费，所以要在签约前算清楚。",
        },
      },
      non: {
        niveau: "verifier",
        texte: {
          fr: "Vous restez sans doute dans la catégorie la plus simple, ce qui ne veut pas dire sans obligations : l'autorisation de travaux et l'accessibilité restent dues.",
          en: "You are probably in the simplest category, which does not mean no obligations: the works permit and accessibility rules still apply.",
          zh: "您大概属于要求最简单的那一类，但这不等于没有义务：施工许可和无障碍规范照样要办。",
        },
      },
      inconnu: A_VERIFIER,
    },
  },
  {
    id: "accessibilite",
    point: "erp",
    texte: {
      fr: "L'entrée est-elle accessible de plain-pied depuis la rue ?",
      en: "Is the entrance step-free from the street?",
      zh: "从街面进门是否完全没有台阶？",
    },
    aide: {
      fr: "Une marche compte. C'est souvent elle qui déclenche la demande de dérogation.",
      en: "One step counts. It is usually the step that triggers the exemption request.",
      zh: "哪怕只有一级台阶也算。往往就是这一级，逼您去申请豁免。",
    },
    suites: {
      oui: {
        niveau: "leve",
        texte: {
          fr: "Le plus gros de l'accessibilité est acquis. Restent les sanitaires et la circulation intérieure.",
          en: "The hardest part of accessibility is settled. The toilets and internal circulation remain.",
          zh: "无障碍最难的一关已经过了。剩下卫生间和室内通行。",
        },
      },
      non: {
        niveau: "verifier",
        texte: {
          fr: "Il faudra un aménagement, ou une dérogation motivée. Une dérogation se demande et s'obtient parfois — elle ne se présume jamais, et le refus arrive après la signature.",
          en: "You will need an adaptation, or a reasoned exemption. An exemption is applied for and sometimes granted — never assumed, and the refusal lands after you have signed.",
          zh: "要么改造，要么申请有理由的豁免。豁免是申请来的，有时批、有时不批——绝不能预先假定能拿到，而拒批的通知往往在签约之后才到。",
        },
      },
      inconnu: A_VERIFIER,
    },
  },
  {
    id: "terrasse-annoncee",
    point: "terrasse",
    texte: {
      fr: "Une terrasse vous est-elle annoncée avec le local ?",
      en: "Is a terrace being presented as part of the deal?",
      zh: "对方是否把露天座位当作这个铺面的一部分来介绍？",
    },
    suites: {
      oui: {
        niveau: "bloquant",
        texte: {
          fr: "L'autorisation d'occuper le domaine public est personnelle et révocable : elle ne se transmet pas avec le fonds. Si votre calcul de chiffre d'affaires compte sur la terrasse, allez demander en mairie ce qui serait accordé à un nouvel exploitant — avant de signer, et par écrit.",
          en: "A permit to occupy public space is personal and revocable: it does not transfer with the business. If your revenue plan relies on the terrace, ask the town hall what a new operator would be granted — before signing, and in writing.",
          zh: "占用公共空间的许可是发给「人」的，而且可以撤销：它不会随店铺转让给您。如果您的营业额预算指望这片露天座，请在签约前、以书面形式向市政厅问清楚：换成新经营者，还批不批。",
        },
      },
      non: {
        niveau: "leve",
        texte: {
          fr: "Pas de terrasse annoncée, donc pas de recette à sécuriser de ce côté.",
          en: "No terrace on offer, so no revenue to secure on that front.",
          zh: "没有露天座，这一块也就没有需要落实的收入。",
        },
      },
      inconnu: A_VERIFIER,
    },
  },
];

export type Bilan = {
  point: Point;
  niveau: Niveau;
  constats: Constat[];
};

const RANG: Record<Niveau, number> = { leve: 0, verifier: 1, bloquant: 2 };

/** Ce que le client a répondu, lu depuis l'adresse. */
export function lireReponses(
  query: Record<string, string | string[] | undefined>,
): Map<string, Reponse> {
  const reponses = new Map<string, Reponse>();
  for (const question of QUESTIONS) {
    const brut = query[question.id];
    const valeur = Array.isArray(brut) ? brut[0] : brut;
    if (valeur === "oui" || valeur === "non" || valeur === "inconnu") {
      reponses.set(question.id, valeur);
    }
  }
  return reponses;
}

/**
 * Le bilan, point par point.
 *
 * Une question laissée sans réponse est traitée comme « je ne sais pas ».
 * Sauter une question ne fait donc jamais disparaître le sujet : c'est
 * exactement l'inverse de ce qu'on veut d'un outil de cette nature.
 */
export function etablirBilan(reponses: Map<string, Reponse>): Bilan[] {
  return POINTS.map((point) => {
    const constats = QUESTIONS.filter((q) => q.point === point.id).map(
      (question) => question.suites[reponses.get(question.id) ?? "inconnu"],
    );
    const niveau = constats.reduce<Niveau>(
      (pire, constat) =>
        RANG[constat.niveau] > RANG[pire] ? constat.niveau : pire,
      "leve",
    );
    return { point, niveau, constats };
  });
}

export function compter(bilans: Bilan[]): Record<Niveau, number> {
  return {
    bloquant: bilans.filter((b) => b.niveau === "bloquant").length,
    verifier: bilans.filter((b) => b.niveau === "verifier").length,
    leve: bilans.filter((b) => b.niveau === "leve").length,
  };
}

/** Les libellés de l'écran, qui ne dépendent d'aucune réponse. */
export const ECRAN = {
  surtitre: { fr: "Avant de signer", en: "Before you sign", zh: "签约之前" },
  titre: {
    fr: "Ce local peut-il accueillir votre restaurant ?",
    en: "Can this site take your restaurant?",
    zh: "这个铺面能开您的餐厅吗？",
  },
  chapo: {
    fr: "Cinq points empêchent d'ouvrir : l'extraction, la destination du bail, la copropriété, l'ERP et la terrasse. Ce ne sont pas les plus longs à régler, ce sont ceux qui se règlent avant la signature — ou ne se règlent pas.",
    en: "Five points stop a restaurant opening: extraction, the lease's permitted use, the co-ownership rules, the public-venue rules and the terrace. They are not the slowest to sort out — they are the ones that get sorted before signing, or not at all.",
    zh: "有五点会让餐厅根本开不成：排烟、租约用途、共有产权规约、ERP 公共场所规范、露天座位。它们不是最耗时的，而是必须在签约前解决的——过了这个点就没机会了。",
  },
  avertissementTitre: {
    fr: "Ce questionnaire ne vous dira jamais que le local convient.",
    en: "This questionnaire will never tell you the site is fine.",
    zh: "这份问卷永远不会告诉您「这个铺面没问题」。",
  },
  avertissementTexte: {
    fr: "Nous n'avons vu ni les lieux, ni le bail, ni le règlement de copropriété : nous ne pouvons rien conclure, et personne ne le pourrait à notre place. Ce qu'il fait, c'est transformer vos « je ne sais pas » en questions précises, adressées à des gens précis. Il ne remplace ni un architecte, ni un avocat, ni un bureau de contrôle — il vous dit lesquels appeler.",
    en: "We have seen neither the premises, nor the lease, nor the co-ownership rules: we cannot conclude anything, and nobody could in our place. What this does is turn your “I don't know” into precise questions, addressed to precise people. It replaces no architect, no lawyer and no inspection body — it tells you which ones to call.",
    zh: "我们既没看过现场，也没看过租约和共有产权规约：我们无法下任何结论，换了谁也一样。这份问卷做的，是把您的「不知道」变成具体的问题，并指明该去问谁。它不能替代建筑师、律师或检验机构——它只告诉您该找哪一个。",
  },
  bouton: {
    fr: "Voir ce qu'il me reste à vérifier",
    en: "See what I still need to check",
    zh: "看看我还要核实什么",
  },
  resultatTitre: {
    fr: "Ce qu'il vous reste à vérifier",
    en: "What you still need to check",
    zh: "您还需要核实的事",
  },
  niveaux: {
    bloquant: {
      fr: "À régler avant de signer",
      en: "Settle before signing",
      zh: "签约前必须解决",
    },
    verifier: { fr: "À vérifier", en: "To check", zh: "需要核实" },
    leve: {
      fr: "Rien à demander ici",
      en: "Nothing to ask here",
      zh: "这一项无需追问",
    },
  },
  aQuiDemander: {
    fr: "À qui demander",
    en: "Who to ask",
    zh: "该问谁",
  },
  reponses: {
    oui: { fr: "oui", en: "yes", zh: "是" },
    non: { fr: "non", en: "no", zh: "否" },
    inconnu: { fr: "Je ne sais pas", en: "I don't know", zh: "不清楚" },
  },
  partage: {
    fr: "Cette page vit dans son adresse : copiez-la pour la retrouver, ou envoyez-la à votre associé, à votre courtier ou à votre avocat.",
    en: "This page lives in its address: copy it to come back to it, or send it to your partner, your broker or your lawyer.",
    zh: "这个页面的内容就在网址里：复制下来随时回看，或者直接发给您的合伙人、中介或律师。",
  },
  apresTitre: {
    fr: "Et après la signature ?",
    en: "And after signing?",
    zh: "签完之后呢？",
  },
  apresTexte: {
    fr: "Licence, déclaration sanitaire, HACCP, SACEM, diagnostics avant travaux : tout cela se règle ensuite, et se rattrape. Les cinq points ci-dessus, non.",
    en: "Alcohol licence, food-safety registration, HACCP, music royalties, pre-works surveys: all of that comes later, and can be caught up. The five points above cannot.",
    zh: "酒类执照、食品卫生申报、HACCP、音乐版权、动工前的各项检测：这些都在之后办，而且事后能补。上面那五点不能。",
  },
  apresLien: {
    fr: "Ouvrir un restaurant : tout ce qu'on découvre trop tard →",
    en: "Opening a restaurant: everything you find out too late →",
    zh: "开一家餐厅：那些知道得太晚的事 →",
  },
} satisfies Record<string, unknown>;

/**
 * La phrase de résumé, construite par langue plutôt qu'interpolée.
 *
 * Le pluriel ne se gabarite pas : le français accorde « point » et
 * « points », l'anglais aussi mais pas au même endroit, et le chinois
 * n'accorde rien du tout. Une chaîne à trous aurait donné « 1 points »
 * dans une langue ou l'autre, et c'est le genre de détail qui fait
 * douter du reste de la page.
 */
export function resumeBilan(
  totaux: Record<Niveau, number>,
  langue: Langue,
): string {
  const { bloquant, verifier } = totaux;
  if (bloquant > 0) {
    if (langue === "en") {
      return `${bloquant} point${bloquant > 1 ? "s" : ""} to settle before signing, ${verifier} to check.`;
    }
    if (langue === "zh") {
      return `有 ${bloquant} 项必须在签约前解决，另有 ${verifier} 项需要核实。`;
    }
    return `${bloquant} point${bloquant > 1 ? "s" : ""} à régler avant de signer, ${verifier} à vérifier.`;
  }
  if (verifier > 0) {
    if (langue === "en") {
      return `Nothing blocking, going by your answers — but ${verifier} still to check.`;
    }
    if (langue === "zh") {
      return `按您的回答，没有致命问题，但仍有 ${verifier} 项需要核实。`;
    }
    return `Aucun point bloquant d'après vos réponses, ${verifier} à vérifier quand même.`;
  }
  if (langue === "en") {
    return "Your answers leave no open question on these five points — which does not mean the site is suitable, only that these five are dealt with.";
  }
  if (langue === "zh") {
    return "按您的回答，这五点都没有遗留问题——但这不代表这个铺面就合适，只代表这五点已经处理完了。";
  }
  return "Vos réponses ne laissent aucune question ouverte sur ces cinq points — ce qui ne veut pas dire que le local convient, seulement que ces cinq-là sont traités.";
}

/** Un raccourci : la plupart des textes de ce module sont des `Trad`. */
export function texte(trad: Trad, langue: Langue): string {
  return trad[langue] ?? trad.fr;
}
