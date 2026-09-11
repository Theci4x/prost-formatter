import type { Espace, Fermeture, Service } from "@/types/reservation";

export type Reservation = {
  id: string;
  espace_id: string;
  service_id: string | null;
  date_reservation: string;
  couverts: number;
  type: "table" | "privatisation";
  statut: "demande" | "confirmee" | "refusee" | "annulee" | "expiree";
  option_expire_le: string | null;
};

export type Disponibilite = {
  espace: Espace;
  // Couverts déjà pris, options non expirées comprises.
  occupes: number;
  restants: number;
  // Un seul groupe occupe l'espace : plus rien n'est vendable dessus.
  privatise: boolean;
  peutRecevoirTable: boolean;
  peutEtrePrivatise: boolean;
  // Motif du refus, à afficher tel quel au client.
  raison: string | null;
};

/**
 * Une réservation pèse sur la jauge tant qu'elle est confirmée, ou tant que
 * l'option posée par une demande n'a pas expiré. Une demande sans date
 * d'expiration compte : mieux vaut bloquer à tort que promettre deux fois.
 */
export function occupeLaJauge(
  reservation: Pick<Reservation, "statut" | "option_expire_le">,
  maintenant: Date,
): boolean {
  if (reservation.statut === "confirmee") return true;
  if (reservation.statut !== "demande") return false;
  if (!reservation.option_expire_le) return true;
  return new Date(reservation.option_expire_le) > maintenant;
}

/**
 * La fermeture qui couvre une date, pour l'espace visé. Une fermeture de
 * l'établissement (espace_id null) l'emporte sur tout ; elle est donc
 * cherchée en premier, pour que son motif soit celui qu'on affiche.
 */
export function fermetureApplicable(
  date: string,
  espaceId: string | null,
  fermetures: Fermeture[],
): Fermeture | null {
  const couvre = (fermeture: Fermeture) =>
    fermeture.date_debut <= date && date <= fermeture.date_fin;

  const etablissement = fermetures.find(
    (fermeture) => fermeture.espace_id === null && couvre(fermeture),
  );
  if (etablissement) return etablissement;
  if (espaceId === null) return null;

  return (
    fermetures.find(
      (fermeture) => fermeture.espace_id === espaceId && couvre(fermeture),
    ) ?? null
  );
}

/** Le motif tel qu'on le montre au client : jamais une case vide. */
export function motifFermeture(fermeture: Fermeture): string {
  return fermeture.motif ? `Fermé — ${fermeture.motif}` : "Fermé ce jour-là.";
}

/**
 * Instant où commence un service un jour donné, dans le fuseau du serveur.
 * Sert à comparer au délai de prévenance.
 */
export function debutDuService(date: string, service: Service): Date {
  return new Date(`${date}T${service.heure_debut}`);
}

export function servicePasseOuTropTard(
  date: string,
  service: Service,
  maintenant: Date,
): boolean {
  const debut = debutDuService(date, service);
  const limite = new Date(
    debut.getTime() - service.delai_heures * 60 * 60 * 1000,
  );
  return maintenant >= limite;
}

export function serviceOuvertCeJour(date: string, service: Service): boolean {
  // getDay() renvoie 0 pour dimanche ; la base suit la convention ISO où
  // dimanche vaut 7.
  const jour = new Date(`${date}T12:00:00`).getDay();
  return service.jours.includes(jour === 0 ? 7 : jour);
}

/**
 * Ce qui reste vendable sur un espace, pour une date et un service donnés.
 * `couverts` est le nombre de convives demandé : il ne change pas le calcul
 * de la jauge, seulement les motifs de refus renvoyés.
 */
export function disponibiliteEspace({
  espace,
  service,
  date,
  couverts,
  reservations,
  fermetures = [],
  maintenant,
}: {
  espace: Espace;
  service: Service;
  date: string;
  couverts: number;
  reservations: Reservation[];
  fermetures?: Fermeture[];
  maintenant: Date;
}): Disponibilite {
  const actives = reservations.filter(
    (reservation) =>
      reservation.espace_id === espace.id &&
      reservation.date_reservation === date &&
      reservation.service_id === service.id &&
      occupeLaJauge(reservation, maintenant),
  );

  const privatise = actives.some(
    (reservation) => reservation.type === "privatisation",
  );
  const occupes = privatise
    ? espace.capacite
    : actives.reduce((total, reservation) => total + reservation.couverts, 0);
  const restants = Math.max(0, espace.capacite - occupes);

  const base = { espace, occupes, restants, privatise };

  // La fermeture prime sur la jauge : même à moitié vide, un espace fermé ne
  // se vend pas. Les couverts déjà attendus restent comptés — le restaurateur
  // qui ferme après coup doit voir qui il lui reste à prévenir.
  const fermeture = fermetureApplicable(date, espace.id, fermetures);
  if (fermeture) {
    return {
      ...base,
      peutRecevoirTable: false,
      peutEtrePrivatise: false,
      raison: motifFermeture(fermeture),
    };
  }

  if (privatise) {
    return {
      ...base,
      peutRecevoirTable: false,
      peutEtrePrivatise: false,
      raison: "Cet espace est déjà privatisé sur ce créneau.",
    };
  }

  const peutRecevoirTable = espace.accepte_table && couverts <= restants;
  // Privatiser suppose l'espace entièrement libre : on ne déplace pas des
  // clients déjà attendus pour faire de la place à un groupe.
  const peutEtrePrivatise =
    espace.privatisation_minimum !== null &&
    occupes === 0 &&
    couverts >= espace.privatisation_minimum &&
    couverts <= espace.capacite;

  let raison: string | null = null;
  if (!peutRecevoirTable && !peutEtrePrivatise) {
    if (couverts > espace.capacite) {
      raison = `Cet espace accueille au maximum ${espace.capacite} couverts.`;
    } else if (restants < couverts) {
      raison = `Il ne reste que ${restants} couverts sur ce créneau.`;
    } else if (
      espace.privatisation_minimum !== null &&
      couverts < espace.privatisation_minimum
    ) {
      raison = `La privatisation démarre à ${espace.privatisation_minimum} couverts.`;
    } else {
      raison = "Cet espace n'est pas disponible pour cette demande.";
    }
  }

  return { ...base, peutRecevoirTable, peutEtrePrivatise, raison };
}

export type Creneau = {
  service: Service;
  espaces: Disponibilite[];
  // Faux quand le service ne tourne pas ce jour-là ou que le délai de
  // prévenance est dépassé : aucun espace n'est proposé.
  ouvert: boolean;
  raison: string | null;
};

export function creneauxDuJour({
  date,
  couverts,
  espaces,
  services,
  reservations,
  fermetures = [],
  maintenant,
}: {
  date: string;
  couverts: number;
  espaces: Espace[];
  services: Service[];
  reservations: Reservation[];
  fermetures?: Fermeture[];
  maintenant: Date;
}): Creneau[] {
  // Établissement fermé : on ne détaille pas espace par espace. Lister les
  // services d'un jour de vacances, chacun barré de son motif, donne
  // l'impression qu'on pourrait insister quelque part.
  const fermeture = fermetureApplicable(date, null, fermetures);
  if (fermeture) {
    return services
      .filter((service) => serviceOuvertCeJour(date, service))
      .map((service) => ({
        service,
        espaces: [],
        ouvert: false,
        raison: motifFermeture(fermeture),
      }));
  }

  return services
    .filter((service) => serviceOuvertCeJour(date, service))
    .map((service) => {
      if (servicePasseOuTropTard(date, service, maintenant)) {
        return {
          service,
          espaces: [],
          ouvert: false,
          raison:
            service.delai_heures > 0
              ? `Les demandes ferment ${service.delai_heures} h avant le service.`
              : "Ce service est passé.",
        };
      }

      const disponibilites = espaces.map((espace) =>
        disponibiliteEspace({
          espace,
          service,
          date,
          couverts,
          reservations,
          fermetures,
          maintenant,
        }),
      );

      const auMoinsUn = disponibilites.some(
        (dispo) => dispo.peutRecevoirTable || dispo.peutEtrePrivatise,
      );

      return {
        service,
        espaces: disponibilites,
        ouvert: auMoinsUn,
        raison: auMoinsUn ? null : "Complet pour ce nombre de convives.",
      };
    });
}
