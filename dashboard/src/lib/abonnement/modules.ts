/**
 * Ce qui est payé, et ce qui ne l'est pas.
 *
 * Klarr se vend en deux modules, achetables séparément : la visibilité et
 * les réservations. Un établissement supplémentaire paie les siens — un
 * abonnement ne couvre jamais deux maisons, parce que ce sont deux
 * carnets, deux fiches Google et deux clientèles.
 *
 * Tout est ici, en fonctions pures : un verrou qui décide qui paie ne
 * doit pas dépendre d'un écran pour être vérifiable.
 */

export const MODULES = ["visibilite", "reservations"] as const;
export type Module = (typeof MODULES)[number];

export const LIBELLE_MODULE: Record<Module, string> = {
  visibilite: "Klarr — visibilité",
  reservations: "Réservations",
};

/**
 * Le prix affiché, hors taxes.
 *
 * Un restaurateur est assujetti : il raisonne en HT, il récupère la TVA,
 * et tous les logiciels du secteur affichent du HT. Annoncer « 45 € TTC »
 * à côté d'un concurrent à « 49 € HT » nous faisait passer pour plus cher
 * alors qu'on est 25 % en dessous.
 *
 * Le TTC reste affiché à côté : c'est le montant réellement prélevé, et
 * une surprise au débit coûte plus qu'une ligne de plus sur une page.
 */
export const PRIX_MODULE: Record<Module, string> = {
  visibilite: "37,50 € HT / mois",
  reservations: "29 € HT / mois",
};

/**
 * Le pack, qui ouvre les deux modules d'un seul abonnement.
 *
 * Ce n'est pas un troisième module : rien ne s'ouvre qui ne soit déjà
 * l'un des deux. C'est une façon de les acheter — une seule ligne sur le
 * relevé, une seule facture, et onze pour cent de moins que les deux pris
 * séparément. Le calcul d'accès n'en sait donc rien : le webhook écrit
 * simplement les deux lignes.
 */
export const PACK = "pack" as const;
export type Achat = Module | typeof PACK;

export const LIBELLE_PACK = "Klarr — les deux modules";
export const PRIX_PACK = "59 € HT / mois";
export const PRIX_PACK_TTC = "70,80 € TTC";
export const RESUME_PACK =
  "Tout ce qui précède, d'un seul abonnement : la visibilité et les réservations, à onze pour cent de moins que les deux pris séparément.";

/** Ce qui est prélevé, TVA comprise — ce que Stripe débite réellement. */
export const PRIX_MODULE_TTC: Record<Module, string> = {
  visibilite: "45 € TTC",
  reservations: "34,80 € TTC",
};

export const RESUME_MODULE: Record<Module, string> = {
  visibilite:
    "Ta fiche Google, tes avis, ta visibilité, ta carte, tes photos et ton site vitrine.",
  reservations:
    "Ta page de réservation, le carnet, l'écran de service, le plan de salle, les acomptes et les cautions.",
};

/**
 * La période d'essai, à compter de la création de l'établissement — et
 * elle n'est pas la même selon ce qu'on essaie.
 *
 * Trente jours sur les réservations : c'est la durée qu'annonce le
 * marché, et elle ne nous coûte rien. Un carnet ne s'emporte pas — on
 * cesse de payer, la page de réservation s'éteint, et le restaurateur
 * repart avec ce qu'il avait en arrivant.
 *
 * Quatorze sur la visibilité, parce qu'elle, elle s'emporte. En un mois
 * on fait remonter sa fiche Google, on publie sa carte, on structure ses
 * données — et on s'en va en gardant le bénéfice. L'essai gratuit y
 * coûte bien plus que le mois non facturé.
 *
 * La générosité passe donc par `acces_offert_jusqu_au`, accordé au cas
 * par cas : un geste choisi, pas un cadeau automatique à des inconnus.
 */
export const ESSAI_JOURS: Record<Module, number> = {
  reservations: 30,
  visibilite: 14,
};

export type EtatAbonnement = {
  module: Module;
  status: string;
};

/** Un abonnement Stripe qui donne réellement accès. */
export function abonnementOuvrant(status: string): boolean {
  // « past_due » reste ouvert : le prélèvement a échoué, Stripe relance,
  // et couper le service au premier incident de carte ferait perdre un
  // client pour un plafond de paiement. « unpaid » vient après les
  // relances : là, c'est fini.
  return status === "active" || status === "trialing" || status === "past_due";
}

/** Un essai en cours sur un module. */
export type Essai = {
  /** Dernier jour, « 2026-10-15 ». */
  jusquau: string;
  joursRestants: number;
};

export type Acces = {
  /** Module par module, ce à quoi l'établissement a droit. */
  ouvert: Record<Module, boolean>;
  /**
   * L'essai en cours, module par module — les deux ne finissent pas le
   * même jour. Null quand il est terminé, ou quand le module est payé.
   */
  essai: Record<Module, Essai | null>;
  /** Vrai quand l'accès vient de l'essai ou d'une faveur, pas d'un paiement. */
  enEssai: boolean;
};

/** L'essai qui dure encore le plus longtemps, pour un bandeau unique. */
export function essaiLePlusLong(acces: Acces): Essai | null {
  return MODULES.reduce<Essai | null>((retenu, cle) => {
    const essai = acces.essai[cle];
    if (!essai) return retenu;
    return !retenu || essai.joursRestants > retenu.joursRestants
      ? essai
      : retenu;
  }, null);
}

function jourLocal(instant: Date): string {
  return new Date(instant.getTime() - instant.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

function ajouterJours(iso: string, jours: number): string {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + jours);
  return jourLocal(date);
}

/**
 * Ce à quoi cet établissement a droit aujourd'hui.
 *
 * Trois portes, dans cet ordre : un abonnement payé, une faveur accordée
 * à la main, ou la période d'essai. La première qui s'ouvre suffit.
 */
export function calculerAcces({
  abonnements,
  creeLe,
  accesOffertJusquAu,
  maintenant,
}: {
  abonnements: EtatAbonnement[];
  /** Date de création de l'établissement, ISO. */
  creeLe: string;
  accesOffertJusquAu: string | null;
  maintenant: Date;
}): Acces {
  const aujourdhui = jourLocal(maintenant);
  const ouverture = creeLe.slice(0, 10);

  const paye = new Set(
    abonnements
      .filter((abonnement) => abonnementOuvrant(abonnement.status))
      .map((abonnement) => abonnement.module),
  );

  const ouvert = {} as Record<Module, boolean>;
  const essai = {} as Record<Module, Essai | null>;

  for (const cle of MODULES) {
    const finEssai = ajouterJours(ouverture, ESSAI_JOURS[cle]);
    // La faveur accordée à la main l'emporte quand elle va plus loin que
    // l'essai : c'est tout son intérêt. Elle vaut pour tous les modules —
    // on ne fait pas un geste à moitié.
    const fin =
      accesOffertJusquAu && accesOffertJusquAu > finEssai
        ? accesOffertJusquAu
        : finEssai;
    const gratuitOuvert = aujourdhui <= fin;

    ouvert[cle] = paye.has(cle) || gratuitOuvert;
    // Un module payé n'est plus en essai, même si la période court
    // encore : ce qui est facturé ne s'annonce pas comme gratuit.
    essai[cle] =
      gratuitOuvert && !paye.has(cle)
        ? {
            jusquau: fin,
            joursRestants: Math.max(
              0,
              Math.round(
                (new Date(`${fin}T12:00:00`).getTime() -
                  new Date(`${aujourdhui}T12:00:00`).getTime()) /
                  86400000,
              ),
            ),
          }
        : null;
  }

  // « En essai » ne se dit que si l'on n'a rien payé : un établissement
  // qui paie la visibilité et découvre les réservations pendant son essai
  // ne doit pas voir son module payé étiqueté comme un essai.
  const enEssai =
    paye.size === 0 && MODULES.some((cle) => essai[cle] !== null);

  return { ouvert, essai, enEssai };
}

/** Un accès complet, pour les écrans qui n'ont pas à vérifier. */
export const ACCES_COMPLET: Acces = {
  ouvert: { visibilite: true, reservations: true },
  essai: { visibilite: null, reservations: null },
  enEssai: false,
};

/**
 * Le module dont dépend une section du tableau de bord.
 *
 * Ce qui n'est listé nulle part reste toujours accessible : la fiche de
 * l'établissement, l'équipe, les connexions et l'abonnement lui-même. On
 * n'enferme jamais quelqu'un dehors de sa propre porte — il doit pouvoir
 * relire ses données et payer.
 */
export const MODULE_DE_LA_SECTION: Record<string, Module> = {
  vitrine: "visibilite",
  menu: "visibilite",
  photos: "visibilite",
  avis: "visibilite",
  retours: "visibilite",
  seo: "visibilite",
  faq: "visibilite",
  "visibilite-ia": "visibilite",
  google: "visibilite",
  posts: "visibilite",
  social: "visibilite",
  tiktok: "visibilite",
  reservations: "reservations",
  service: "reservations",
  // Le fichier client se remplit des réservations : sans le carnet, il
  // n'a rien à montrer.
  clients: "reservations",
  experiences: "reservations",
  paiements: "reservations",
};

export function moduleDeLaSection(section: string): Module | null {
  return MODULE_DE_LA_SECTION[section] ?? null;
}
