import type { createClient } from "@/lib/supabase/server";

export type ReputationSnapshot = {
  restaurant_id: string;
  plateforme: "google" | "yelp" | "tripadvisor";
  note: number | null;
  nombre_avis: number | null;
  releve_le: string;
};

export type Alert = {
  restaurantId: string;
  plateforme: ReputationSnapshot["plateforme"];
  ton: "positif" | "negatif" | "neutre";
  message: string;
};

export const PLATFORM_LABELS: Record<ReputationSnapshot["plateforme"], string> =
  {
    google: "Google",
    yelp: "Yelp",
    tripadvisor: "Tripadvisor",
  };

// Une note bouge par arrondi : Google affiche 4,3 puis 4,2 sans qu'il se
// soit rien passé de notable. On ne signale qu'à partir d'un dixième plein
// pour ne pas crier au loup chaque matin.
const SEUIL_NOTE = 0.1;

export const FENETRE_JOURS = 7;

function formatNote(note: number) {
  return note.toFixed(1).replace(".", ",");
}

/**
 * Compare le relevé le plus récent au plus ancien de la fenêtre, pour
 * chaque couple (restaurant, plateforme). Les relevés doivent être triés
 * du plus récent au plus ancien.
 */
export function computeAlerts(snapshots: ReputationSnapshot[]): Alert[] {
  const parPlateforme = new Map<string, ReputationSnapshot[]>();
  for (const snapshot of snapshots) {
    const cle = `${snapshot.restaurant_id}|${snapshot.plateforme}`;
    const liste = parPlateforme.get(cle);
    if (liste) liste.push(snapshot);
    else parPlateforme.set(cle, [snapshot]);
  }

  const alerts: Alert[] = [];

  for (const releves of parPlateforme.values()) {
    // Un seul relevé : la surveillance vient de commencer, il n'y a rien à
    // comparer.
    if (releves.length < 2) continue;

    const recent = releves[0];
    const ancien = releves[releves.length - 1];
    const plateforme = recent.plateforme;
    const nom = PLATFORM_LABELS[plateforme];

    if (recent.nombre_avis != null && ancien.nombre_avis != null) {
      const nouveaux = recent.nombre_avis - ancien.nombre_avis;
      if (nouveaux > 0) {
        alerts.push({
          restaurantId: recent.restaurant_id,
          plateforme,
          ton: "positif",
          message:
            nouveaux === 1
              ? `1 nouvel avis sur ${nom}`
              : `${nouveaux} nouveaux avis sur ${nom}`,
        });
      }
    }

    if (recent.note != null && ancien.note != null) {
      const ecart = recent.note - ancien.note;
      if (ecart <= -SEUIL_NOTE) {
        alerts.push({
          restaurantId: recent.restaurant_id,
          plateforme,
          ton: "negatif",
          message: `Note ${nom} en baisse : ${formatNote(ancien.note)} → ${formatNote(recent.note)}`,
        });
      } else if (ecart >= SEUIL_NOTE) {
        alerts.push({
          restaurantId: recent.restaurant_id,
          plateforme,
          ton: "positif",
          message: `Note ${nom} en hausse : ${formatNote(ancien.note)} → ${formatNote(recent.note)}`,
        });
      }
    }
  }

  // Les baisses d'abord : c'est ce sur quoi le restaurateur doit agir.
  const ordre = { negatif: 0, neutre: 1, positif: 2 };
  return alerts.sort((a, b) => ordre[a.ton] - ordre[b.ton]);
}

/**
 * Charge les relevés de la fenêtre courante et en déduit les alertes. Vit
 * ici et non dans la page : la borne de temps dépend de l'heure qu'il est,
 * ce qui n'a rien à faire dans le rendu d'un composant.
 */
export async function fetchAlerts(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<{ alerts: Alert[]; surveillanceActive: boolean }> {
  const depuis = new Date(
    Date.now() - FENETRE_JOURS * 24 * 60 * 60 * 1000,
  ).toISOString();

  // La RLS limite déjà les relevés aux établissements de l'utilisateur.
  const { data, error } = await supabase
    .from("restaurant_reputation_snapshots")
    .select("restaurant_id, plateforme, note, nombre_avis, releve_le")
    .gte("releve_le", depuis)
    .order("releve_le", { ascending: false });

  if (error) {
    console.error("[fetchAlerts]", error);
    return { alerts: [], surveillanceActive: false };
  }

  const snapshots = (data ?? []) as ReputationSnapshot[];
  return {
    alerts: computeAlerts(snapshots),
    surveillanceActive: snapshots.length > 0,
  };
}
