import type { Langue } from "@/lib/i18n/langue";

/**
 * Les dates du tableau de bord, dans la langue du lecteur.
 *
 * Un seul endroit, et c'est le point. Chaque écran avait sa petite
 * fonction `formatDate` figée en « fr-FR », recopiée de page en page :
 * traduire l'interface en laissant « mardi 1 juin » au milieu d'une
 * phrase chinoise ne trompe personne, et corriger quinze copies en
 * corrige toujours quatorze.
 *
 * Le chinois n'écrit pas les dates comme nous — « 6月1日星期二 », le mois
 * avant le jour et le jour de la semaine à la fin. C'est `Intl` qui le
 * sait, pas nous : on lui donne la locale et on le laisse faire.
 */

const LOCALE: Record<Langue, string> = {
  fr: "fr-FR",
  en: "en-GB",
  zh: "zh-CN",
};

function locale(langue: Langue): string {
  return LOCALE[langue] ?? "fr-FR";
}

/** « mardi 1 juin » — la date d'un service, sans l'année. */
export function dateJour(jour: string, langue: Langue): string {
  return new Date(`${jour}T12:00:00`).toLocaleDateString(locale(langue), {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** « 18 septembre à 14h05 » : assez précis pour ne pas relancer deux fois. */
export function dateHeure(iso: string, langue: Langue): string {
  return new Date(iso).toLocaleString(locale(langue), {
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** « 1 juin » — pour une liste, où l'année encombre. */
export function dateBreve(iso: string, langue: Langue): string {
  return new Date(iso).toLocaleDateString(locale(langue), {
    day: "numeric",
    month: "short",
  });
}

/** « 14 juillet 2026 » — une fermeture se lit avec son année. */
export function dateComplete(jour: string, langue: Langue): string {
  return new Date(`${jour}T12:00:00`).toLocaleDateString(locale(langue), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * « mardi 1 juin 2026 » — la date d'un paiement ou d'une confirmation.
 *
 * Le jour de la semaine *et* l'année : quelqu'un qui reçoit un reçu par
 * courriel le relit parfois des mois plus tard, et « mardi 1 juin » ne
 * dit alors plus de quelle année on parle.
 */
export function dateLongue(jour: string, langue: Langue): string {
  return new Date(`${jour}T12:00:00`).toLocaleDateString(locale(langue), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * « 23/09/2026 18:42 » — le moment où une feuille a été éditée.
 *
 * Heure de Paris, explicitement : le serveur tourne en UTC, et une
 * feuille imprimée à 18h qui dit 16h fait douter de tout le reste.
 */
export function horodatage(quand: Date, langue: Langue): string {
  return quand.toLocaleString(locale(langue), {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  });
}
