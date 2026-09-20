/**
 * Le calendrier d'ouverture, remonté depuis la date visée.
 *
 * **On ne calcule que les délais qui sont les mêmes partout.** C'est la
 * règle du fichier, et elle vient d'un constat simple : un outil qui
 * annonce « déposez votre demande de terrasse deux mois avant » se trompe
 * dans la moitié des communes, et celui qui s'en aperçoit est celui qui
 * ouvre en retard. Un délai faux est pire qu'un délai absent, parce qu'on
 * s'organise dessus.
 *
 * Deux natures de jalons, donc, et l'écran les distingue à l'œil nu.
 *
 * **National** : le texte fixe le délai, il vaut de Brest à Menton, on
 * calcule la date. La déclaration de licence quinze jours avant
 * l'ouverture en est le cas type.
 *
 * **Local** : la mairie, la préfecture ou la copropriété décident, et le
 * délai va de trois semaines à huit mois selon l'endroit et le moment.
 * On ne calcule rien. On dit à quel moment de la chaîne ça se place, et
 * à qui téléphoner pour connaître le délai réel.
 *
 * Ce qui reste utile dans les deux cas, et qui est la vraie valeur de la
 * page : **l'ordre**. Ce qui doit précéder quoi ne dépend d'aucune
 * commune. Le permis d'exploitation avant la déclaration de licence,
 * l'autorisation de travaux avant le chantier, le chantier avant la
 * commission de sécurité. Un restaurateur qui découvre l'ordre trois
 * semaines trop tard n'a pas perdu trois semaines : il a perdu le temps
 * de tout reprendre dans le bon sens.
 */

export type Nature = "national" | "local";

export type PhaseId =
  | "avant-signature"
  | "societe"
  | "autorisations"
  | "travaux"
  | "avant-ouverture"
  | "ouverture";

export type Phase = { id: PhaseId; titre: string; chapo: string };

export const PHASES: Phase[] = [
  {
    id: "avant-signature",
    titre: "Avant de signer",
    chapo:
      "Rien de ce qui suit ne sert si le local ne peut pas accueillir un restaurant.",
  },
  {
    id: "societe",
    titre: "La société",
    chapo: "Elle doit exister avant de signer un bail et d'ouvrir un compte.",
  },
  {
    id: "autorisations",
    titre: "Les autorisations",
    chapo:
      "C'est ici que les délais varient le plus, et qu'un coup de téléphone en mairie vaut mieux qu'un tableau.",
  },
  {
    id: "travaux",
    titre: "Les travaux",
    chapo: "Ils ne commencent qu'une fois les autorisations obtenues.",
  },
  {
    id: "avant-ouverture",
    titre: "Juste avant d'ouvrir",
    chapo: "Les formalités qui ont une date limite écrite dans un texte.",
  },
  {
    id: "ouverture",
    titre: "Le jour J et après",
    chapo: "Ce qui doit être en place quand le premier client entre.",
  },
];

export type Jalon = {
  id: string;
  phase: PhaseId;
  titre: string;
  quoi: string;
  nature: Nature;
  /**
   * Nombre de jours avant l'ouverture, pour les seuls jalons nationaux.
   * Absent sur un jalon local : on n'invente pas une date.
   */
  joursAvant?: number;
  /** Ce qui doit être fait d'abord. C'est l'information stable. */
  apres?: string;
  /** Qui détient le délai, quand nous ne le détenons pas. */
  aQuiDemander?: string;
  article?: string;
};

export const JALONS: Jalon[] = [
  {
    id: "diagnostic",
    phase: "avant-signature",
    titre: "Vérifier les cinq points bloquants",
    quoi: "Extraction, destination du bail, copropriété, ERP, terrasse. Ce sont les seuls qui peuvent rendre le projet impossible plutôt que coûteux.",
    nature: "local",
    aQuiDemander: "Le syndic, le bailleur, la mairie.",
  },
  {
    id: "societe",
    phase: "societe",
    titre: "Immatriculer la société",
    quoi: "Par le guichet unique des formalités des entreprises. Le numéro qui en sort vous sera demandé partout ensuite.",
    nature: "local",
    aQuiDemander:
      "Le guichet unique. Comptez large : c'est un passage obligé pour presque tout le reste.",
  },
  {
    id: "bail",
    phase: "societe",
    titre: "Signer le bail",
    quoi: "Une fois, et seulement une fois, les cinq points levés et la société créée.",
    nature: "local",
    apres: "diagnostic",
  },
  {
    id: "travaux-autorisation",
    phase: "autorisations",
    titre: "Déposer l'autorisation de travaux",
    quoi: "Tout aménagement d'un établissement recevant du public passe par une autorisation, qui traite en même temps la sécurité incendie et l'accessibilité.",
    nature: "local",
    apres: "bail",
    aQuiDemander:
      "La mairie, service urbanisme ou ERP. Le délai d'instruction dépend de la commune et de la saison — demandez-le, ne le devinez pas.",
    article: "erp-restaurant-categorie-commission-securite",
  },
  {
    id: "destination-urbanisme",
    phase: "autorisations",
    titre: "Changer la destination, s'il y a lieu",
    quoi: "Si le local n'est pas déjà un commerce de restauration au sens de l'urbanisme.",
    nature: "local",
    apres: "bail",
    aQuiDemander: "La mairie, service urbanisme.",
  },
  {
    id: "copro-ag",
    phase: "autorisations",
    titre: "Faire voter l'assemblée générale",
    quoi: "Conduit d'extraction, enseigne, climatisation, tout ce qui touche aux parties communes.",
    nature: "local",
    apres: "bail",
    aQuiDemander:
      "Le syndic. C'est le délai le plus imprévisible du parcours : une AG ordinaire se tient une fois par an, et une extraordinaire se convoque.",
  },
  {
    id: "terrasse",
    phase: "autorisations",
    titre: "Demander la terrasse",
    quoi: "L'autorisation du prédécesseur ne se transmet pas : la vôtre est une demande nouvelle.",
    nature: "local",
    apres: "bail",
    aQuiDemander: "La mairie, service du domaine public.",
    article: "terrasse-restaurant-autorisation-domaine-public",
  },
  {
    id: "chantier",
    phase: "travaux",
    titre: "Lancer le chantier",
    quoi: "Après les autorisations, jamais avant. Des travaux commencés sans autorisation peuvent être arrêtés, et l'ouverture avec.",
    nature: "local",
    apres: "travaux-autorisation",
    article: "diagnostics-avant-travaux-restaurant",
  },
  {
    id: "commission",
    phase: "travaux",
    titre: "Passer la commission de sécurité",
    quoi: "Selon la catégorie de l'établissement. Elle intervient une fois les travaux terminés, et elle peut demander des reprises.",
    nature: "local",
    apres: "chantier",
    aQuiDemander: "La mairie. Gardez de la marge : une reprise se refait.",
  },
  {
    id: "permis-exploitation",
    phase: "avant-ouverture",
    titre: "Passer le permis d'exploitation",
    quoi: "Une formation obligatoire pour servir de l'alcool. Elle dure trois jours, réduits si vous justifiez d'une longue expérience du métier. Sans elle, pas de licence.",
    nature: "national",
    // Ni une date limite légale ni un délai de traitement : un jalon posé
    // assez tôt pour que la licence, qui en dépend, reste déposable dans
    // son propre délai. On le dit sur l'écran plutôt que de le déguiser
    // en obligation.
    joursAvant: 45,
    aQuiDemander: "Un organisme agréé.",
    article: "permis-exploitation-licence-restaurant",
  },
  {
    id: "licence",
    phase: "avant-ouverture",
    titre: "Déclarer la licence de débit de boissons",
    quoi: "Une déclaration à déposer en mairie — à la préfecture de police à Paris. Le délai est fixé par la loi et il est le même partout.",
    nature: "national",
    joursAvant: 15,
    apres: "permis-exploitation",
    article: "permis-exploitation-licence-restaurant",
  },
  {
    id: "declaration-sanitaire",
    phase: "avant-ouverture",
    titre: "Déclarer l'activité aux services vétérinaires",
    quoi: "Manipuler des denrées animales impose une déclaration. Immatriculer sa société ne déclare pas son restaurant : ce sont deux démarches sans rapport.",
    nature: "national",
    joursAvant: 1,
    article: "declaration-sanitaire-restaurant-ddpp",
  },
  {
    id: "haccp",
    phase: "avant-ouverture",
    titre: "Former quelqu'un à l'hygiène alimentaire",
    quoi: "Au moins une personne de l'établissement, et ce n'est pas un classeur qu'on achète.",
    nature: "national",
    joursAvant: 30,
    article: "haccp-plan-maitrise-sanitaire-restaurant",
  },
  {
    id: "sacem",
    phase: "avant-ouverture",
    titre: "Déclarer la musique",
    quoi: "Avant la première diffusion, pas après la première facture.",
    nature: "national",
    joursAvant: 15,
    article: "sacem-spre-restaurant-musique",
  },
  {
    id: "fiche-google",
    phase: "ouverture",
    titre: "Créer et vérifier la fiche Google",
    quoi: "La vérification passe souvent par un courrier postal : commencez avant d'ouvrir, pas le jour de l'ouverture.",
    nature: "national",
    joursAvant: 30,
    article: "fiche-google-restaurant-ce-qui-compte-vraiment",
  },
  {
    id: "reservation",
    phase: "ouverture",
    titre: "Ouvrir les réservations",
    quoi: "Une page à votre nom, et son adresse dans le champ « réservations » de la fiche Google. C'est le geste qui rapporte le plus de couverts, et il ne dépend de personne.",
    nature: "national",
    joursAvant: 21,
    apres: "fiche-google",
  },
  {
    id: "affichage",
    phase: "ouverture",
    titre: "Afficher les prix et les allergènes",
    quoi: "Prix nets taxes et service compris, et l'information sur les allergènes accessible sans que le client ait à la demander.",
    nature: "national",
    joursAvant: 0,
  },
];

export type JalonDate = Jalon & {
  /** Nulle sur un jalon local : on n'a pas de date à donner. */
  date: Date | null;
  /** Le jalon qui doit précéder, résolu. */
  precedent: Jalon | null;
};

/** Lit une date de formulaire. Null si absente ou illisible. */
export function lireDate(brut: string | string[] | undefined): Date | null {
  const texte = Array.isArray(brut) ? brut[0] : brut;
  if (!texte || !/^\d{4}-\d{2}-\d{2}$/.test(texte)) return null;
  const date = new Date(`${texte}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function calendrier(ouverture: Date | null): JalonDate[] {
  return JALONS.map((jalon) => ({
    ...jalon,
    date:
      ouverture && jalon.joursAvant !== undefined
        ? new Date(ouverture.getTime() - jalon.joursAvant * 86400000)
        : null,
    precedent: jalon.apres
      ? (JALONS.find((autre) => autre.id === jalon.apres) ?? null)
      : null,
  }));
}

export function jalonsDe(calendrier: JalonDate[], phase: PhaseId): JalonDate[] {
  return calendrier.filter((jalon) => jalon.phase === phase);
}

export function dateLisible(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Une date d'ouverture par défaut : dans six mois, ni hier ni dans dix ans. */
export function ouvertureParDefaut(aujourdhui = new Date()): string {
  const dans = new Date(aujourdhui.getTime() + 182 * 86400000);
  return dans.toISOString().slice(0, 10);
}
