import type { Espace, Service } from "@/types/reservation";

export type ResumeEtablissement = {
  // Le plus grand groupe que l'établissement sait recevoir.
  capaciteMax: number;
  privatisation: "totale" | "partielle" | "aucune";
  // Heure de fin du service qui finit le plus tard, au format HH:MM:SS.
  finLaPlusTardive: string | null;
  espaces: number;
};

/**
 * Les quelques faits qu'un client cherche avant même de regarder les
 * créneaux : est-ce assez grand, peut-on privatiser, jusqu'à quelle heure.
 * Tout est déduit de la configuration du restaurateur — rien à ressaisir,
 * donc rien qui puisse devenir faux sans qu'il s'en aperçoive.
 */
export function resumeEtablissement(
  espaces: Espace[],
  services: Service[],
): ResumeEtablissement {
  const privatisables = espaces.filter(
    (espace) => espace.privatisation_minimum !== null,
  );

  return {
    capaciteMax: espaces.reduce(
      (record, espace) => Math.max(record, espace.capacite),
      0,
    ),
    privatisation:
      privatisables.length === 0
        ? "aucune"
        : // « Totale » veut dire que l'établissement entier se privatise,
          // donc que chacun de ses espaces le peut.
          privatisables.length === espaces.length
          ? "totale"
          : "partielle",
    // Un service qui finit après minuit finit plus tard que tous les autres,
    // même si « 02:00 » se compare mal à « 23:30 » : on le rattrape ici
    // plutôt que de laisser un tri alphabétique annoncer 23h30 à un bar qui
    // ferme à 2h.
    finLaPlusTardive:
      services.reduce<{ heure: string; rang: number } | null>(
        (record, service) => {
          const apresMinuit = service.heure_fin <= service.heure_debut;
          const rang = apresMinuit ? 1 : 0;
          if (
            record === null ||
            rang > record.rang ||
            (rang === record.rang && service.heure_fin > record.heure)
          ) {
            return { heure: service.heure_fin, rang };
          }
          return record;
        },
        null,
      )?.heure ?? null,
    espaces: espaces.length,
  };
}
