import type { Espace, Fermeture, Service } from "@/types/reservation";
import { heureLisible } from "@/lib/site/horaires";

export type Reservation = {
  id: string;
  espace_id: string;
  service_id: string | null;
  date_reservation: string;
  /**
   * L'heure d'arrivée, « HH:MM » ou « HH:MM:SS ». Nulle pour les
   * réservations antérieures à la mise en place des créneaux, et pour
   * celles dont le service a été supprimé : faute de repère, elles pèsent
   * sur le service entier.
   */
  heure_arrivee: string | null;
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
  // Fermé ce jour-là par le restaurateur : les couverts restants sont un
  // décor, rien ne s'y vend.
  ferme: boolean;
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
/**
 * Le motif d'une fermeture, dans la langue qu'on lui donne.
 *
 * Le dictionnaire est facultatif, et le repli est le français. Les
 * appels internes de ce fichier alimentent la `raison` d'un créneau, qui
 * ressort aussi sur la page de réservation publique : y faire passer un
 * dictionnaire de tableau de bord mélangerait deux écrans qui n'ont ni
 * le même lecteur ni la même langue. L'écran de service, lui, passe le
 * sien.
 */
export function motifFermeture(
  fermeture: Fermeture,
  sv: { ferme: string; fermePour(motif: string): string } = {
    ferme: "Fermé ce jour-là.",
    fermePour: (motif) => `Fermé — ${motif}`,
  },
): string {
  return fermeture.motif ? sv.fermePour(fermeture.motif) : sv.ferme;
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
 * Le pas entre deux heures d'arrivée proposées.
 *
 * Une demi-heure. Un pas plus fin multiplie les boutons sans rien changer
 * au service — personne n'arbitre entre 19h45 et 19h50 —, et un pas plus
 * large laisse des trous que le restaurateur ne peut pas vendre.
 */
export const PAS_CRENEAU_MINUTES = 30;

/** « 19:30 » ou « 19:30:00 » → 1170. */
export function minutesDeLHeure(heure: string): number {
  const [h, m] = heure.split(":");
  return Number(h) * 60 + Number(m);
}

/** 1170 → « 19:30 ». Ramené dans la journée pour les services de nuit. */
export function heureDesMinutes(minutes: number): string {
  const dansLaJournee = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(dansLaJournee / 60);
  const m = dansLaJournee % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * La durée d'un service en minutes, minuit franchi compris.
 *
 * Un dîner de 17h30 à 2h dure huit heures et demie, pas moins quinze
 * heures et demie. Tout le calcul de chevauchement se fait ensuite en
 * décalage depuis l'ouverture, ce qui évite d'avoir à raisonner sur des
 * heures qui repassent par zéro.
 */
export function dureeDuService(service: Service): number {
  const debut = minutesDeLHeure(service.heure_debut);
  const fin = minutesDeLHeure(service.heure_fin);
  return (fin - debut + 1440) % 1440 || 1440;
}

/** Le décalage d'une heure depuis l'ouverture du service, en minutes. */
export function decalageDepuisLOuverture(
  service: Service,
  heure: string,
): number {
  return (
    (minutesDeLHeure(heure) - minutesDeLHeure(service.heure_debut) + 1440) %
    1440
  );
}

/**
 * Les heures d'arrivée proposables sur un service.
 *
 * On s'arrête quand la table ne tiendrait plus dans le service — sauf pour
 * la première, toujours proposée : un restaurateur qui règle deux heures de
 * table sur un service d'une heure et demie veut quand même prendre des
 * réservations, pas voir sa page vide.
 */
export function heuresDArrivee(service: Service): string[] {
  const longueur = dureeDuService(service);
  const debut = minutesDeLHeure(service.heure_debut);
  const heures: string[] = [];

  for (let offset = 0; offset < longueur; offset += PAS_CRENEAU_MINUTES) {
    if (offset > 0 && offset + service.duree_minutes > longueur) break;
    heures.push(heureDesMinutes(debut + offset));
  }

  return heures.length > 0 ? heures : [heureDesMinutes(debut)];
}

/**
 * Deux tables se gênent-elles ?
 *
 * Elles partagent la durée de leur service, donc il suffit que leurs heures
 * d'arrivée soient plus proches que cette durée. Une réservation sans heure
 * gêne tout le monde : on préfère bloquer à tort que promettre deux fois.
 */
export function seChevauchent(
  service: Service,
  heureDemandee: string,
  heureReservation: string | null,
): boolean {
  if (!heureReservation) return true;
  const a = decalageDepuisLOuverture(service, heureDemandee);
  const b = decalageDepuisLOuverture(service, heureReservation);
  return Math.abs(a - b) < service.duree_minutes;
}

/**
 * Ce qui reste vendable sur un espace, pour une date et une heure d'arrivée.
 * `couverts` est le nombre de convives demandé : il ne change pas le calcul
 * de la jauge, seulement les motifs de refus renvoyés.
 *
 * La jauge est celle du créneau, pas du service : ne comptent que les
 * réservations dont la table est encore assise quand celle-ci arriverait.
 * C'est ce qui permet de vendre la même place deux ou trois fois dans une
 * soirée, exactement comme la salle le fait en vrai.
 */
export function disponibiliteEspace({
  espace,
  service,
  date,
  heure,
  couverts,
  reservations,
  fermetures = [],
  maintenant,
}: {
  espace: Espace;
  service: Service;
  date: string;
  /** Heure d'arrivée visée. Par défaut, l'ouverture du service. */
  heure?: string;
  couverts: number;
  reservations: Reservation[];
  fermetures?: Fermeture[];
  maintenant: Date;
}): Disponibilite {
  const heureVisee = heure ?? service.heure_debut;

  const duService = reservations.filter(
    (reservation) =>
      reservation.espace_id === espace.id &&
      reservation.date_reservation === date &&
      reservation.service_id === service.id &&
      occupeLaJauge(reservation, maintenant),
  );

  const actives = duService.filter((reservation) =>
    seChevauchent(service, heureVisee, reservation.heure_arrivee),
  );

  // Une privatisation vaut pour le service entier : personne ne loue une
  // salle de 20h à 22h en laissant d'autres s'y asseoir à 22h30. Elle se
  // cherche donc sur tout le service, pas sur le seul créneau.
  const privatise = duService.some(
    (reservation) => reservation.type === "privatisation",
  );
  const occupes = privatise
    ? espace.capacite
    : actives.reduce((total, reservation) => total + reservation.couverts, 0);
  const restants = Math.max(0, espace.capacite - occupes);

  const base = { espace, occupes, restants, privatise, ferme: false };

  // La fermeture prime sur la jauge : même à moitié vide, un espace fermé ne
  // se vend pas. Les couverts déjà attendus restent comptés — le restaurateur
  // qui ferme après coup doit voir qui il lui reste à prévenir.
  const fermeture = fermetureApplicable(date, espace.id, fermetures);
  if (fermeture) {
    return {
      ...base,
      ferme: true,
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
    duService.length === 0 &&
    couverts >= espace.privatisation_minimum &&
    couverts <= espace.capacite;

  let raison: string | null = null;
  if (!peutRecevoirTable && !peutEtrePrivatise) {
    if (couverts > espace.capacite) {
      raison = `Cet espace accueille au maximum ${espace.capacite} couverts.`;
    } else if (restants < couverts) {
      raison = `Il ne reste que ${restants} couverts à ${heureLisible(heureVisee)}.`;
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
  /**
   * L'heure d'arrivée proposée. Un service produit autant de créneaux qu'il
   * a d'heures vendables — la forme du créneau ne change pas pour autant,
   * ce qui laisse intact tout ce qui le consomme.
   */
  heure: string;
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
        heure: service.heure_debut,
        espaces: [],
        ouvert: false,
        raison: motifFermeture(fermeture),
      }));
  }

  return services
    .filter((service) => serviceOuvertCeJour(date, service))
    .flatMap((service) => {
      if (servicePasseOuTropTard(date, service, maintenant)) {
        return [
          {
            service,
            heure: service.heure_debut,
            espaces: [],
            ouvert: false,
            raison:
              service.delai_heures > 0
                ? `Les demandes ferment ${service.delai_heures} h avant le service.`
                : "Ce service est passé.",
          },
        ];
      }

      return heuresDArrivee(service).map((heure) => {
        const disponibilites = espaces.map((espace) =>
          disponibiliteEspace({
            espace,
            service,
            date,
            heure,
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
          heure,
          espaces: disponibilites,
          ouvert: auMoinsUn,
          raison: auMoinsUn ? null : "Complet pour ce nombre de convives.",
        };
      });
    });
}

/**
 * Les créneaux d'un même service, regroupés pour l'affichage.
 *
 * Le moteur raisonne par heure d'arrivée ; une page, elle, montre un bloc
 * par service avec ses heures en dessous. Dix-sept cartes pour une soirée
 * seraient illisibles.
 */
export function parService(
  creneaux: Creneau[],
): { service: Service; heures: Creneau[] }[] {
  const groupes: { service: Service; heures: Creneau[] }[] = [];
  for (const creneau of creneaux) {
    const existant = groupes.find(
      (groupe) => groupe.service.id === creneau.service.id,
    );
    if (existant) existant.heures.push(creneau);
    else groupes.push({ service: creneau.service, heures: [creneau] });
  }
  return groupes;
}
