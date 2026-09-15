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

export const PRIX_MODULE: Record<Module, string> = {
  visibilite: "45 € TTC / mois",
  reservations: "35 € TTC / mois",
};

export const RESUME_MODULE: Record<Module, string> = {
  visibilite:
    "Ta fiche Google, tes avis, ta visibilité, ta carte, tes photos et ton site vitrine.",
  reservations:
    "Ta page de réservation, le carnet, l'écran de service, le plan de salle, les acomptes et les cautions.",
};

/**
 * La période d'essai, à compter de la création de l'établissement.
 *
 * Un restaurateur ne juge pas Klarr en trois jours : il lui faut voir
 * passer deux week-ends, et une fiche Google ne bouge pas plus vite. Un
 * essai trop court ferait partir ceux qui auraient payé.
 */
export const ESSAI_JOURS = 30;

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

export type Acces = {
  /** Module par module, ce à quoi l'établissement a droit. */
  ouvert: Record<Module, boolean>;
  /** Vrai quand l'accès vient de l'essai ou d'une faveur, pas d'un paiement. */
  enEssai: boolean;
  /** Dernier jour de l'essai ou de la faveur, « 2026-10-15 ». Null sinon. */
  essaiJusquau: string | null;
  joursRestants: number | null;
};

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

  const finEssai = ajouterJours(creeLe.slice(0, 10), ESSAI_JOURS);
  // La faveur accordée à la main l'emporte quand elle va plus loin que
  // l'essai : c'est tout son intérêt.
  const finFaveur =
    accesOffertJusquAu && accesOffertJusquAu > finEssai
      ? accesOffertJusquAu
      : finEssai;
  const gratuitOuvert = aujourdhui <= finFaveur;

  const paye = new Set(
    abonnements
      .filter((abonnement) => abonnementOuvrant(abonnement.status))
      .map((abonnement) => abonnement.module),
  );

  const ouvert = {
    visibilite: paye.has("visibilite") || gratuitOuvert,
    reservations: paye.has("reservations") || gratuitOuvert,
  };

  // « En essai » ne se dit que si l'on n'a rien payé : un établissement
  // qui paie la visibilité et découvre les réservations pendant son essai
  // ne doit pas voir son module payé étiqueté comme un essai.
  const enEssai = gratuitOuvert && paye.size === 0;

  const joursRestants = gratuitOuvert
    ? Math.max(
        0,
        Math.round(
          (new Date(`${finFaveur}T12:00:00`).getTime() -
            new Date(`${aujourdhui}T12:00:00`).getTime()) /
            86400000,
        ),
      )
    : null;

  return {
    ouvert,
    enEssai,
    essaiJusquau: gratuitOuvert ? finFaveur : null,
    joursRestants,
  };
}

/** Un accès complet, pour les écrans qui n'ont pas à vérifier. */
export const ACCES_COMPLET: Acces = {
  ouvert: { visibilite: true, reservations: true },
  enEssai: false,
  essaiJusquau: null,
  joursRestants: null,
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
  seo: "visibilite",
  "visibilite-ia": "visibilite",
  google: "visibilite",
  social: "visibilite",
  tiktok: "visibilite",
  reservations: "reservations",
  service: "reservations",
  experiences: "reservations",
  paiements: "reservations",
};

export function moduleDeLaSection(section: string): Module | null {
  return MODULE_DE_LA_SECTION[section] ?? null;
}
