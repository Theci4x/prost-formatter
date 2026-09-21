import type { Langue } from "@/lib/i18n/langue";

/**
 * Les jours de la semaine et les créneaux horaires, dans la langue du
 * lecteur.
 *
 * Les noms ne sont écrits nulle part : `Intl` les connaît dans les trois
 * langues, et une table recopiée à la main aurait fini par dire « mardi »
 * au milieu d'une phrase chinoise. Le 1er janvier 2024 était un lundi —
 * c'est le seul fait que ce fichier retient, et il sert d'origine pour
 * numéroter les jours comme le fait la base (ISO : 1 = lundi, 7 =
 * dimanche).
 *
 * Les heures non plus ne suivent pas la convention française partout :
 * « 19h30 » ne se lit qu'ici, l'anglais et le chinois écrivent « 19:30 ».
 */

const LOCALE: Record<Langue, string> = {
  fr: "fr-FR",
  en: "en-GB",
  zh: "zh-CN",
};

function locale(langue: Langue): string {
  return LOCALE[langue] ?? "fr-FR";
}

/** Le lundi de référence, pour donner une date à un numéro de jour ISO. */
function dateDuJourIso(iso: number): Date {
  return new Date(Date.UTC(2024, 0, iso, 12));
}

/** « mardi », « Tuesday », « 星期二 ». */
export function nomJour(iso: number, langue: Langue): string {
  return dateDuJourIso(iso).toLocaleDateString(locale(langue), {
    weekday: "long",
    timeZone: "UTC",
  });
}

/** « M », « T », « 二 » — pour les cases à cocher serrées. */
export function initialeJour(iso: number, langue: Langue): string {
  return dateDuJourIso(iso).toLocaleDateString(locale(langue), {
    weekday: "narrow",
    timeZone: "UTC",
  });
}

/** Les sept jours dans l'ordre de la semaine, avec leur numéro ISO. */
export function joursSemaine(
  langue: Langue,
): { valeur: number; long: string; court: string }[] {
  return [1, 2, 3, 4, 5, 6, 7].map((valeur) => ({
    valeur,
    long: nomJour(valeur, langue),
    court: initialeJour(valeur, langue),
  }));
}

const TOUS: Record<Langue, string> = {
  fr: "tous les jours",
  en: "every day",
  zh: "每天",
};

/** Le chinois énumère avec 、, pas avec une virgule suivie d'une espace. */
const LIAISON: Record<Langue, string> = { fr: ", ", en: ", ", zh: "、" };

export function listeJours(jours: number[], langue: Langue): string {
  if (jours.length === 7) return TOUS[langue] ?? TOUS.fr;
  return [1, 2, 3, 4, 5, 6, 7]
    .filter((iso) => jours.includes(iso))
    .map((iso) => nomJour(iso, langue))
    .join(LIAISON[langue] ?? ", ");
}

/** « 19:00:00 » venant de PostgreSQL → « 19h » en français, « 19:00 » ailleurs. */
export function heure(valeur: string, langue: Langue): string {
  const [h, m] = valeur.split(":");
  if (langue === "fr")
    return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
  return `${h.padStart(2, "0")}:${m}`;
}

const LENDEMAIN: Record<Langue, string> = {
  fr: "le lendemain",
  en: "the next day",
  zh: "次日",
};

/**
 * Un service peut finir après minuit. Il reste rattaché au jour où il
 * commence, mais l'affichage doit le dire : « 17h30 – 2h » se lit sinon
 * comme une faute de frappe.
 */
export function creneau(debut: string, fin: string, langue: Langue): string {
  const plage = `${heure(debut, langue)} – ${heure(fin, langue)}`;
  if (fin >= debut) return plage;
  const suite = LENDEMAIN[langue] ?? LENDEMAIN.fr;
  return langue === "zh" ? `${plage}（${suite}）` : `${plage} ${suite}`;
}
