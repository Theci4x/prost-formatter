import type { SupabaseClient } from "@supabase/supabase-js";
import type { Position } from "@/lib/google/places";

/**
 * La maison face à ses voisins : note, nombre d'avis, et combien chacun
 * en a gagné sur une période.
 *
 * Le gain se lit entre deux relevés : le dernier avant la fin de la
 * période, et le dernier avant son début. Sans relevé assez ancien (un
 * voisin ajouté la semaine dernière), on part du premier qu'on a, et la
 * ligne le dit — un « +3 » sur huit jours ne se compare pas à un « +3 »
 * sur un mois.
 */

export const VOISINS_MAX = 5;

export type Voisin = {
  id: string;
  place_id: string;
  nom: string;
  adresse: string | null;
  distance_m: number | null;
};

export type Ligne = {
  cle: string;
  nom: string;
  nous: boolean;
  distance: number | null;
  note: number | null;
  avis: number | null;
  /** Avis gagnés sur la période ; null sans deux relevés. */
  gain: number | null;
  /** Le gain part d'un relevé plus récent que le début de la période. */
  gainPartiel: boolean;
};

export type Comparaison = {
  lignes: Ligne[];
  /** Le rang de la maison à la note, 1 = la mieux notée. */
  rang: number | null;
  moyenneNote: number | null;
  moyenneGain: number | null;
};

type Releve = { date: string; note: number | null; avis: number | null };

/** Le dernier relevé au plus tard à `jour`, et celui qui sert de départ. */
function mesure(
  releves: Releve[],
  depuis: string,
  jusqua: string,
): Pick<Ligne, "note" | "avis" | "gain" | "gainPartiel"> {
  const tries = releves
    .filter((r) => r.date <= jusqua)
    .sort((a, b) => a.date.localeCompare(b.date));
  const dernier = tries.at(-1);
  if (!dernier)
    return { note: null, avis: null, gain: null, gainPartiel: false };
  const avantDebut = tries.filter((r) => r.date <= depuis).at(-1);
  const depart = avantDebut ?? tries[0];
  const gain =
    depart !== dernier && depart.avis != null && dernier.avis != null
      ? dernier.avis - depart.avis
      : null;
  return {
    note: dernier.note,
    avis: dernier.avis,
    gain,
    gainPartiel: gain != null && !avantDebut,
  };
}

export async function comparer(
  supabase: SupabaseClient,
  restaurant: { id: string; nom: string },
  depuis: string,
  jusqua: string,
): Promise<Comparaison | null> {
  const { data: voisinsData, error } = await supabase
    .from("restaurant_voisins")
    .select("id, place_id, nom, adresse, distance_m")
    .eq("restaurant_id", restaurant.id)
    .order("ajoute_le");
  if (error) return null;
  const voisins = (voisinsData ?? []) as Voisin[];
  if (voisins.length === 0)
    return { lignes: [], rang: null, moyenneNote: null, moyenneGain: null };

  // Cent vingt jours suffisent : on compare au plus sur un mois, avec de
  // la marge pour un relevé manqué.
  const plancher = new Date(`${depuis}T12:00:00Z`);
  plancher.setUTCDate(plancher.getUTCDate() - 90);
  const bas = plancher.toISOString().slice(0, 10);

  const [{ data: relevesData }, { data: nousData }] = await Promise.all([
    supabase
      .from("restaurant_voisins_releves")
      .select("place_id, releve_le, note, nombre_avis")
      .eq("restaurant_id", restaurant.id)
      .gte("releve_le", bas)
      .lte("releve_le", jusqua),
    supabase
      .from("restaurant_reputation_snapshots")
      .select("releve_le, note, nombre_avis")
      .eq("restaurant_id", restaurant.id)
      .eq("plateforme", "google")
      .gte("releve_le", `${bas}T00:00:00Z`)
      .lte("releve_le", `${jusqua}T23:59:59Z`),
  ]);

  const parLieu = new Map<string, Releve[]>();
  for (const r of (relevesData ?? []) as {
    place_id: string;
    releve_le: string;
    note: number | string | null;
    nombre_avis: number | null;
  }[]) {
    const liste = parLieu.get(r.place_id) ?? [];
    liste.push({
      date: r.releve_le,
      note: r.note != null ? Number(r.note) : null,
      avis: r.nombre_avis,
    });
    parLieu.set(r.place_id, liste);
  }
  const nous = (
    (nousData ?? []) as {
      releve_le: string;
      note: number | string | null;
      nombre_avis: number | null;
    }[]
  ).map((r) => ({
    date: r.releve_le.slice(0, 10),
    note: r.note != null ? Number(r.note) : null,
    avis: r.nombre_avis,
  }));

  const lignes: Ligne[] = [
    {
      cle: "nous",
      nom: restaurant.nom,
      nous: true,
      distance: null,
      ...mesure(nous, depuis, jusqua),
    },
    ...voisins.map((v) => ({
      cle: v.place_id,
      nom: v.nom,
      nous: false,
      distance: v.distance_m,
      ...mesure(parLieu.get(v.place_id) ?? [], depuis, jusqua),
    })),
  ];

  // À la note d'abord, au nombre d'avis ensuite : un 4,6 sur 900 avis
  // passe devant un 4,6 sur 40.
  lignes.sort(
    (a, b) =>
      (b.note ?? -1) - (a.note ?? -1) || (b.avis ?? -1) - (a.avis ?? -1),
  );
  const notees = lignes.filter((l) => l.note != null);
  const nousLigne = lignes.find((l) => l.nous);
  const rang =
    nousLigne?.note != null ? notees.findIndex((l) => l.nous) + 1 : null;

  const autres = lignes.filter((l) => !l.nous);
  const notesAutres = autres.flatMap((l) => (l.note != null ? [l.note] : []));
  const gainsAutres = autres.flatMap((l) => (l.gain != null ? [l.gain] : []));
  const moyenne = (xs: number[]) =>
    xs.length ? xs.reduce((t, x) => t + x, 0) / xs.length : null;

  return {
    lignes,
    rang,
    moyenneNote: moyenne(notesAutres),
    moyenneGain: moyenne(gainsAutres),
  };
}

/** La distance à vol d'oiseau, en mètres. */
export function distanceMetres(a: Position, b: Position): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * 6371000 * Math.asin(Math.sqrt(h)));
}

/** « 350 m », « 1,2 km ». */
export function distanceLisible(metres: number | null): string | null {
  if (metres == null) return null;
  return metres < 1000
    ? `${Math.round(metres / 10) * 10} m`
    : `${(metres / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} km`;
}
