import "server-only";

/**
 * Ce que Google compte sur la fiche : combien de fois elle est apparue,
 * et ce que les gens en ont fait — appeler, venir, visiter le site,
 * réserver, ouvrir la carte.
 *
 * API « Business Profile Performance » : elle doit être activée dans le
 * projet Google Cloud de Klarr, comme les autres API Business Profile, et
 * se contente du droit `business.manage` que la connexion a déjà. Google
 * publie ces chiffres avec deux à trois jours de retard.
 */
const PERFORMANCE_BASE_URL =
  "https://businessprofileperformance.googleapis.com/v1";

export const METRIQUES = [
  "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
  "BUSINESS_IMPRESSIONS_MOBILE_MAPS",
  "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
  "BUSINESS_IMPRESSIONS_MOBILE_SEARCH",
  "WEBSITE_CLICKS",
  "CALL_CLICKS",
  "BUSINESS_DIRECTION_REQUESTS",
  "BUSINESS_BOOKINGS",
  "BUSINESS_FOOD_MENU_CLICKS",
] as const;
export type Metrique = (typeof METRIQUES)[number];

/** Les actions, dans l'ordre fixe de leurs couleurs. */
export const ACTIONS = [
  "site",
  "appel",
  "itineraire",
  "reservation",
  "menu",
] as const;
export type Action = (typeof ACTIONS)[number];

const METRIQUE_ACTION: Record<Action, Metrique> = {
  site: "WEBSITE_CLICKS",
  appel: "CALL_CLICKS",
  itineraire: "BUSINESS_DIRECTION_REQUESTS",
  reservation: "BUSINESS_BOOKINGS",
  menu: "BUSINESS_FOOD_MENU_CLICKS",
};

/** Un jour : ses apparitions (Maps, Recherche) et ses actions. */
export type Jour = {
  jour: string; // AAAA-MM-JJ
  maps: number;
  recherche: number;
  actions: Record<Action, number>;
};

type Reponse = {
  multiDailyMetricTimeSeries?: {
    dailyMetricTimeSeries?: {
      dailyMetric?: string;
      timeSeries?: {
        datedValues?: {
          date?: { year: number; month: number; day: number };
          value?: string;
        }[];
      };
    }[];
  }[];
};

const iso = (d: { year: number; month: number; day: number }) =>
  `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;

function jourVide(jour: string): Jour {
  return {
    jour,
    maps: 0,
    recherche: 0,
    actions: { site: 0, appel: 0, itineraire: 0, reservation: 0, menu: 0 },
  };
}

/** Les jours de `debut` à `fin` inclus, au format AAAA-MM-JJ. */
export function joursEntre(debut: string, fin: string): string[] {
  const jours: string[] = [];
  const d = new Date(`${debut}T12:00:00Z`);
  const f = new Date(`${fin}T12:00:00Z`);
  while (d <= f) {
    jours.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return jours;
}

/**
 * Les chiffres jour par jour entre deux dates, zéros compris : Google
 * omet les jours sans valeur, et une courbe qui saute un jour ment.
 */
export async function lirePerformance(
  accessToken: string,
  locationName: string,
  debut: string,
  fin: string,
): Promise<Jour[]> {
  // La fiche est rangée « locations/123 », parfois précédée du compte.
  const fiche = locationName.slice(locationName.indexOf("locations/"));
  const url = new URL(
    `${PERFORMANCE_BASE_URL}/${fiche}:fetchMultiDailyMetricsTimeSeries`,
  );
  for (const m of METRIQUES) url.searchParams.append("dailyMetrics", m);
  const [ad, md, jd] = debut.split("-").map(Number);
  const [af, mf, jf] = fin.split("-").map(Number);
  url.searchParams.set("dailyRange.startDate.year", String(ad));
  url.searchParams.set("dailyRange.startDate.month", String(md));
  url.searchParams.set("dailyRange.startDate.day", String(jd));
  url.searchParams.set("dailyRange.endDate.year", String(af));
  url.searchParams.set("dailyRange.endDate.month", String(mf));
  url.searchParams.set("dailyRange.endDate.day", String(jf));

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Performance ${res.status}: ${await res.text()}`);
  }
  const donnees = (await res.json()) as Reponse;

  const parJour = new Map(joursEntre(debut, fin).map((j) => [j, jourVide(j)]));
  for (const bloc of donnees.multiDailyMetricTimeSeries ?? []) {
    for (const serie of bloc.dailyMetricTimeSeries ?? []) {
      const metrique = serie.dailyMetric as Metrique | undefined;
      for (const v of serie.timeSeries?.datedValues ?? []) {
        if (!v.date) continue;
        const jour = parJour.get(iso(v.date));
        if (!jour) continue;
        const n = Number(v.value ?? 0) || 0;
        if (metrique?.endsWith("_MAPS")) jour.maps += n;
        else if (metrique?.endsWith("_SEARCH")) jour.recherche += n;
        else {
          const action = ACTIONS.find((a) => METRIQUE_ACTION[a] === metrique);
          if (action) jour.actions[action] += n;
        }
      }
    }
  }
  return [...parJour.values()];
}

export type Pas = "jour" | "semaine" | "mois";

/** Un point du graphique : une journée, une semaine ou un mois cumulés. */
export type Point = Jour & { debut: string };

/** Regroupe les jours par semaine (lundi) ou par mois. */
export function regrouper(jours: Jour[], pas: Pas): Point[] {
  if (pas === "jour") return jours.map((j) => ({ ...j, debut: j.jour }));
  const groupes = new Map<string, Point>();
  for (const j of jours) {
    const d = new Date(`${j.jour}T12:00:00Z`);
    let cle: string;
    if (pas === "mois") {
      cle = `${j.jour.slice(0, 7)}-01`;
    } else {
      const decalage = (d.getUTCDay() + 6) % 7; // lundi = 0
      d.setUTCDate(d.getUTCDate() - decalage);
      cle = d.toISOString().slice(0, 10);
    }
    const g = groupes.get(cle) ?? { ...jourVide(cle), debut: cle };
    g.maps += j.maps;
    g.recherche += j.recherche;
    for (const a of ACTIONS) g.actions[a] += j.actions[a];
    groupes.set(cle, g);
  }
  return [...groupes.values()];
}

export type Totaux = {
  apparitions: number;
  maps: number;
  recherche: number;
  actions: number;
  parAction: Record<Action, number>;
};

export function totaux(jours: Jour[]): Totaux {
  const t: Totaux = {
    apparitions: 0,
    maps: 0,
    recherche: 0,
    actions: 0,
    parAction: { site: 0, appel: 0, itineraire: 0, reservation: 0, menu: 0 },
  };
  for (const j of jours) {
    t.maps += j.maps;
    t.recherche += j.recherche;
    for (const a of ACTIONS) t.parAction[a] += j.actions[a];
  }
  t.apparitions = t.maps + t.recherche;
  t.actions = ACTIONS.reduce((s, a) => s + t.parAction[a], 0);
  return t;
}

/** L'évolution en pourcentage, ou null quand la période d'avant est vide. */
export function evolution(maintenant: number, avant: number): number | null {
  if (avant <= 0) return null;
  return Math.round(((maintenant - avant) / avant) * 1000) / 10;
}

/**
 * La période d'avant, découpée comme celle d'aujourd'hui : le n-ième jour
 * d'avant tombe dans le même point que le n-ième jour d'aujourd'hui. Les
 * deux courbes se superposent alors point pour point, même quand les
 * semaines ou les mois ne commencent pas le même jour.
 */
export function regrouperComme(
  avant: Jour[],
  actuels: Jour[],
  points: Point[],
  pas: Pas,
): Point[] {
  const indexDuJour = new Map<string, number>();
  const cles = points.map((p) => p.debut);
  for (const j of actuels) {
    const [point] = regrouper([j], pas);
    indexDuJour.set(j.jour, cles.indexOf(point.debut));
  }
  const groupes: Point[] = points.map((p) => ({
    ...jourVide(p.debut),
    debut: p.debut,
  }));
  avant.forEach((j, i) => {
    const jourActuel = actuels[i];
    if (!jourActuel) return;
    const g = groupes[indexDuJour.get(jourActuel.jour) ?? -1];
    if (!g) return;
    g.maps += j.maps;
    g.recherche += j.recherche;
    for (const a of ACTIONS) g.actions[a] += j.actions[a];
  });
  return groupes;
}
