import { carteOrganisee, carteVisible } from "@/lib/menu/carte";
import type { MenuItem } from "@/types/menu";
import type { Espace, Service } from "@/types/reservation";

/**
 * Les données structurées (schema.org) des pages publiques.
 *
 * C'est ce qui permet à Google d'afficher autre chose qu'un lien bleu : la
 * note, la fourchette de prix, les horaires, un bouton de réservation. Pour
 * un restaurant, c'est le gain le plus fort de l'optimisation interne, et il
 * ne coûte qu'un bloc JSON dans la page.
 *
 * Règle qui porte tout le fichier : on ne déclare que ce qu'on sait. Un
 * horaire inventé ou une note fabriquée sont une faute, pas une
 * optimisation — Google sanctionne le balisage qui ne correspond pas à ce
 * que la page montre, et le client se déplace pour rien.
 */

export type Etablissement = {
  nom: string;
  adresse: string | null;
  description: string | null;
  telephone?: string | null;
  logoUrl?: string | null;
  /** « Allemande, brasserie » — tel que le restaurateur l'a écrit. */
  typeCuisine?: string | null;
};

/**
 * Les cuisines, telles que schema.org les attend.
 *
 * Le champ est saisi en texte libre — « Allemande, brasserie » — parce
 * qu'aucune liste fermée ne rend justice à la réalité d'une carte. La
 * virgule y sépare naturellement deux mentions ; on la respecte plutôt
 * que de livrer une chaîne unique qu'aucun moteur ne saura découper.
 */
function cuisinesSchema(brut: string | null | undefined): string[] {
  if (!brut) return [];
  return brut
    .split(/[,;/]/)
    .map((mot) => mot.trim())
    .filter((mot) => mot.length > 0);
}

/** Convention schema.org : « Monday », « Tuesday »… depuis l'ISO 1–7. */
const JOURS_SCHEMA = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function jourSchema(iso: number): string | null {
  return JOURS_SCHEMA[iso - 1] ?? null;
}

/** « 19:00:00 » → « 19:00 ». schema.org veut des heures sans secondes. */
export function heureSchema(heure: string): string {
  return heure.slice(0, 5);
}

/**
 * Les horaires d'ouverture, un par service. Deux services le même jour
 * donnent deux plages : c'est ce que schema.org attend, et ça évite de
 * prétendre qu'on sert en continu de midi à minuit.
 */
export function horairesSchema(services: Service[]) {
  return services
    .filter((service) => service.jours.length > 0)
    .map((service) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: service.jours
        .map(jourSchema)
        .filter((jour): jour is string => jour !== null),
      opens: heureSchema(service.heure_debut),
      closes: heureSchema(service.heure_fin),
    }))
    .filter((horaire) => horaire.dayOfWeek.length > 0);
}

/**
 * La fourchette de prix, déduite de la carte réelle. Renvoie null quand la
 * carte n'affiche aucun prix : mieux vaut ne rien déclarer qu'annoncer
 * « € » au hasard.
 */
export function fourchettePrix(items: MenuItem[]): string | null {
  const prix = carteVisible(items)
    .map((plat) => plat.prix_centimes)
    .filter((p): p is number => p !== null && p > 0);
  if (prix.length === 0) return null;

  // L'échelle de Google est en symboles, pas en euros : on la déduit du
  // prix médian d'un plat, qui représente mieux la carte que la moyenne.
  const tries = [...prix].sort((a, b) => a - b);
  const median = tries[Math.floor(tries.length / 2)];
  if (median < 1500) return "€";
  if (median < 3000) return "€€";
  if (median < 6000) return "€€€";
  return "€€€€";
}

export function restaurantSchema({
  etablissement,
  services,
  espaces,
  carte,
  url,
  urlCarte,
  note,
  nombreAvis,
  reseaux = [],
  accepteReservations = false,
}: {
  etablissement: Etablissement;
  services: Service[];
  espaces: Espace[];
  carte: MenuItem[];
  url: string;
  urlCarte?: string | null;
  note?: number | null;
  nombreAvis?: number | null;
  /** Site, page Facebook, comptes Instagram et TikTok du restaurant. */
  reseaux?: string[];
  /** Vrai quand la page de réservation est ouverte au public. */
  accepteReservations?: boolean;
}): Record<string, unknown> {
  const horaires = horairesSchema(services);
  const prix = fourchettePrix(carte);
  const capacite = espaces.reduce(
    (total, espace) => total + espace.capacite,
    0,
  );

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: etablissement.nom,
    url,
    // L'action que Google peut proposer directement dans ses résultats.
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: url,
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
      result: { "@type": "FoodEstablishmentReservation", name: "Réservation" },
    },
  };

  if (etablissement.description) schema.description = etablissement.description;
  if (etablissement.logoUrl) schema.image = etablissement.logoUrl;
  if (etablissement.telephone) schema.telephone = etablissement.telephone;
  if (etablissement.adresse) {
    // On ne découpe pas l'adresse en rue / ville / code postal : elle est
    // saisie en un seul champ, et la découper au petit bonheur produirait un
    // balisage faux.
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: etablissement.adresse,
      addressCountry: "FR",
    };
  }
  if (horaires.length > 0) schema.openingHoursSpecification = horaires;
  if (prix) schema.priceRange = prix;
  // Ce que sert la maison, et si l'on peut y retenir une table : les deux
  // critères sur lesquels se trie une recommandation.
  const cuisines = cuisinesSchema(etablissement.typeCuisine);
  if (cuisines.length > 0) {
    schema.servesCuisine = cuisines.length === 1 ? cuisines[0] : cuisines;
  }
  schema.acceptsReservations = accepteReservations;
  if (capacite > 0) schema.maximumAttendeeCapacity = capacite;
  // Une note ne se déclare que si elle repose sur des avis réellement relevés.
  if (note && nombreAvis && nombreAvis > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: note,
      reviewCount: nombreAvis,
      bestRating: 5,
      worstRating: 1,
    };
  }
  if (urlCarte && carteVisible(carte).length > 0) schema.hasMenu = urlCarte;
  // « sameAs » relie cette page aux comptes du restaurant : sans lui, Google
  // et les moteurs de réponse traitent la page de réservation, la page
  // Facebook et le compte Instagram comme trois établissements distincts, et
  // la réputation accumulée d'un côté ne profite pas à l'autre.
  if (reseaux.length > 0) schema.sameAs = reseaux;

  return schema;
}

/** La carte, en Menu schema.org : sections, plats, descriptions, prix. */
export function menuSchema({
  nom,
  url,
  carte,
}: {
  nom: string;
  url: string;
  carte: MenuItem[];
}): Record<string, unknown> | null {
  const blocs = carteOrganisee(carteVisible(carte));
  if (blocs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: `Carte — ${nom}`,
    url,
    hasMenuSection: blocs.map((bloc) => ({
      "@type": "MenuSection",
      name: bloc.categorie,
      hasMenuItem: bloc.plats.map((plat) => {
        const item: Record<string, unknown> = {
          "@type": "MenuItem",
          name: plat.nom,
        };
        if (plat.description) item.description = plat.description;
        if (plat.photo_url) item.image = plat.photo_url;
        if (plat.prix_centimes !== null) {
          item.offers = {
            "@type": "Offer",
            price: (plat.prix_centimes / 100).toFixed(2),
            priceCurrency: "EUR",
          };
        }
        return item;
      }),
    })),
  };
}

/** Le fil d'Ariane, pour que Google affiche le chemin plutôt que l'adresse nue. */
export function filAriane(
  etapes: { nom: string; url: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: etapes.map((etape, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: etape.nom,
      item: etape.url,
    })),
  };
}
