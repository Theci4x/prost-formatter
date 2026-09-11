export type LigneStat = {
  espace_id: string;
  date_reservation: string;
  couverts: number;
  type: "table" | "privatisation";
  statut: "demande" | "confirmee" | "refusee" | "annulee" | "expiree";
  origine: "client" | "restaurateur";
};

export type Statistiques = {
  couvertsConfirmes: number;
  reservationsConfirmees: number;
  couvertsMoyens: number | null;
  // Demandes arrivées par la page publique, quel que soit leur sort.
  demandesEnLigne: number;
  // Part des réservations fermes venues de la page plutôt que du téléphone :
  // c'est ce que Klarr apporte réellement au restaurateur.
  partEnLigne: number | null;
  // Confirmées parmi les demandes tranchées. Les options expirées n'ont
  // jamais été décidées : les compter en refus accuserait le restaurateur
  // d'avoir dit non.
  tauxAcceptation: number | null;
  parJour: { jour: number; reservations: number; couverts: number }[];
  parEspace: { espaceId: string; reservations: number; couverts: number }[];
  parType: { table: number; privatisation: number };
  parOrigine: { client: number; restaurateur: number };
};

function jourIso(date: string): number {
  const jour = new Date(`${date}T12:00:00`).getDay();
  return jour === 0 ? 7 : jour;
}

/**
 * Statistiques d'une période. Ne compte comme réalisé que le confirmé : une
 * demande en attente n'est pas un couvert, et l'afficher comme tel donnerait
 * au restaurateur une image flatteuse et fausse de son carnet.
 */
export function computeStatistiques(
  lignes: LigneStat[],
  depuis: string,
  jusqua: string,
): Statistiques {
  const periode = lignes.filter(
    (ligne) =>
      ligne.date_reservation >= depuis && ligne.date_reservation <= jusqua,
  );
  const confirmees = periode.filter((ligne) => ligne.statut === "confirmee");

  const couvertsConfirmes = confirmees.reduce(
    (total, ligne) => total + ligne.couverts,
    0,
  );

  const parJourMap = new Map<number, { reservations: number; couverts: number }>();
  const parEspaceMap = new Map<
    string,
    { reservations: number; couverts: number }
  >();
  const parType = { table: 0, privatisation: 0 };
  const parOrigine = { client: 0, restaurateur: 0 };

  for (const ligne of confirmees) {
    const jour = jourIso(ligne.date_reservation);
    const courantJour = parJourMap.get(jour) ?? { reservations: 0, couverts: 0 };
    courantJour.reservations += 1;
    courantJour.couverts += ligne.couverts;
    parJourMap.set(jour, courantJour);

    const courantEspace = parEspaceMap.get(ligne.espace_id) ?? {
      reservations: 0,
      couverts: 0,
    };
    courantEspace.reservations += 1;
    courantEspace.couverts += ligne.couverts;
    parEspaceMap.set(ligne.espace_id, courantEspace);

    parType[ligne.type] += 1;
    parOrigine[ligne.origine] += 1;
  }

  const demandesEnLigne = periode.filter(
    (ligne) => ligne.origine === "client",
  ).length;

  const decidees = periode.filter(
    (ligne) =>
      ligne.origine === "client" &&
      (ligne.statut === "confirmee" || ligne.statut === "refusee"),
  );
  const acceptees = decidees.filter((ligne) => ligne.statut === "confirmee");

  return {
    couvertsConfirmes,
    reservationsConfirmees: confirmees.length,
    couvertsMoyens: confirmees.length
      ? couvertsConfirmes / confirmees.length
      : null,
    demandesEnLigne,
    partEnLigne: confirmees.length
      ? parOrigine.client / confirmees.length
      : null,
    tauxAcceptation: decidees.length
      ? acceptees.length / decidees.length
      : null,
    // Les sept jours sont toujours présents : une semaine à trou se lit mal,
    // et un lundi vide est une information.
    parJour: [1, 2, 3, 4, 5, 6, 7].map((jour) => ({
      jour,
      ...(parJourMap.get(jour) ?? { reservations: 0, couverts: 0 }),
    })),
    parEspace: [...parEspaceMap.entries()]
      .map(([espaceId, valeurs]) => ({ espaceId, ...valeurs }))
      .sort((a, b) => b.couverts - a.couverts),
    parType,
    parOrigine,
  };
}

/** Bornes d'une période exprimée en jours glissants, dates incluses. */
export function periode(jours: number): { depuis: string; jusqua: string } {
  const fin = new Date();
  const debut = new Date(fin.getTime() - (jours - 1) * 24 * 60 * 60 * 1000);
  return {
    depuis: debut.toISOString().slice(0, 10),
    jusqua: fin.toISOString().slice(0, 10),
  };
}
