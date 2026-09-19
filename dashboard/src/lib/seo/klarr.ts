import { siteUrl } from "@/lib/site-url";
import {
  ESSAI_JOURS,
  PRIX_MODULE,
  PRIX_MODULE_TTC,
  PRIX_PACK,
  PRIX_PACK_TTC,
} from "@/lib/abonnement/modules";

/**
 * Ce que Klarr déclare de lui-même aux moteurs et aux assistants.
 *
 * Une seule source pour la FAQ visible et pour son balisage : Google
 * sanctionne le JSON-LD qui ne correspond pas à ce que la page montre, et
 * deux listes tenues à la main finissent toujours par diverger — celle
 * qu'on nous a proposée comptait déjà dix questions à l'écran contre six
 * dans le balisage, avec des réponses raccourcies.
 *
 * Les prix viennent de `modules.ts`, là où ils sont déjà écrits pour la
 * grille tarifaire : un tarif qui change ne doit pas rester faux ici.
 */

export type Question = { question: string; reponse: string };

const VISIBILITE = PRIX_MODULE.visibilite;
const RESERVATIONS = PRIX_MODULE.reservations;

/**
 * La date à laquelle les tarifs des concurrents ont été relevés.
 *
 * Une comparaison publique doit être objective et vérifiable : citer le
 * prix d'un confrère sans dire quand on l'a lu, c'est s'exposer le jour où
 * il le change. La mention coûte six mots et met l'affirmation à l'abri.
 */
export const RELEVE_CONCURRENTS = "septembre 2026";

export const QUESTIONS: Question[] = [
  {
    question: "Qu'est-ce que Klarr ?",
    reponse:
      "Klarr est une plateforme de gestion pour les restaurateurs indépendants et les petits groupes. Elle réunit la fiche Google, les avis clients, les réservations et la visibilité dans les réponses des IA, sans prendre de commission sur les couverts.",
  },
  {
    question: "Combien coûte Klarr ?",
    reponse: `Deux offres sans engagement : « Votre visibilité » à ${VISIBILITE} (${PRIX_MODULE_TTC.visibilite}, ${ESSAI_JOURS.visibilite} jours d'essai) et « Réservations » à ${RESERVATIONS} (${PRIX_MODULE_TTC.reservations}, ${ESSAI_JOURS.reservations} jours d'essai). Les deux ensemble coûtent ${PRIX_PACK} (${PRIX_PACK_TTC}), soit onze pour cent de moins que séparément. Aucune commission par couvert, quelle que soit la formule.`,
  },
  {
    question: "Klarr prend-il une commission sur les réservations ?",
    reponse: `Non. Klarr ne prélève aucune commission sur les couverts ni sur les privatisations. Les acomptes sont versés directement sur le compte Stripe du restaurateur. Le module Réservations est facturé ${RESERVATIONS}, et rien d'autre.`,
  },
  {
    question: "Quelle est la différence entre Klarr et TheFork ou Zenchef ?",
    reponse: `Ces plateformes se rémunèrent à la commission par couvert ou par un abonnement nettement plus élevé — au relevé de leurs tarifs publics en ${RELEVE_CONCURRENTS}, de un à deux euros par couvert pour TheFork, à partir de cent neuf euros par mois pour Zenchef. Klarr coûte ${RESERVATIONS}, sans commission, quel que soit le canal ou le volume de couverts, et les acomptes vont directement au restaurateur.`,
  },
  {
    question:
      "Comment Klarr améliore-t-il la visibilité Google d'un restaurant ?",
    reponse:
      "Klarr réunit la fiche Google Business Profile, les avis et les réseaux sociaux dans un seul tableau de bord. Il montre les mots-clés sur lesquels l'établissement sort vraiment, suit ce que répondent les assistants IA quand un client cherche où manger, et alerte dès qu'un avis tombe ou que la note bouge.",
  },
  {
    question: "Sur quels assistants Klarr suit-il la visibilité IA ?",
    reponse:
      "Klarr interroge ChatGPT, Gemini, Claude, Le Chat de Mistral et Perplexity, selon ceux qui sont activés. Il affiche la réponse exacte que l'assistant a donnée, avec sa date, plutôt qu'un score sans source — y compris quand le restaurant n'y figure pas.",
  },
  {
    question: "Klarr convient-il à un restaurant indépendant à Paris ?",
    reponse:
      "Oui. Klarr est conçu pour les restaurateurs indépendants et les petits groupes. La plateforme est éditée par EDIREF, société parisienne de création de sites et de référencement installée dans le 8e arrondissement depuis 2008.",
  },
  {
    question: "Peut-on gérer les privatisations avec Klarr ?",
    reponse:
      "Oui. Le module Réservations gère la table et la privatisation d'espaces. Le restaurateur fixe un minimum de couverts ou de consommation, pose des jauges par service pour qu'un curieux ne gèle pas une salle entière, et les conditions s'affichent avant la réservation.",
  },
  {
    question: "Klarr est-il sans engagement ?",
    reponse:
      "Oui. Les deux offres sont sans engagement et se résilient en un clic depuis le tableau de bord, sans écrire à personne.",
  },
  {
    question: "Quelles données Klarr montre-t-il vraiment ?",
    reponse:
      "La donnée brute : la fiche Google telle qu'elle est, les avis tels qu'ils sont écrits, et la réponse exacte d'un assistant IA quand un client cherche un restaurant. Chaque analyse est datée et conservée, y compris quand le résultat est mauvais.",
  },
];

const DESCRIPTION =
  "Plateforme de gestion pour restaurateurs indépendants et petits groupes : fiche Google, avis, réservations sans commission et visibilité dans les réponses des IA. Éditée par EDIREF, Paris 8e.";

/**
 * L'éditeur, tel que les mentions légales le disent — et pas autrement.
 *
 * On nous proposait de dater la fondation de Klarr à 2008 et d'en nommer
 * Thomas Bavoil fondateur : 2008 est l'année d'EDIREF, et il en est le
 * gérant. Un balisage qui contredit la page qu'il accompagne dessert le
 * référencement au lieu de le servir.
 */
const EDIREF = {
  "@type": "Organization",
  name: "EDIREF",
  foundingDate: "2008",
  description:
    "Société parisienne de création de sites web et de référencement. RCS Paris 503 428 369.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "10 rue de Penthièvre",
    addressLocality: "Paris",
    addressRegion: "Île-de-France",
    postalCode: "75008",
    addressCountry: "FR",
  },
};

function offre(nom: string, prix: string, description: string) {
  return {
    "@type": "Offer",
    name: nom,
    price: prix,
    priceCurrency: "EUR",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: prix,
      priceCurrency: "EUR",
      valueAddedTaxIncluded: false,
      billingDuration: 1,
      billingIncrement: 1,
      unitCode: "MON",
    },
    description,
  };
}

const OFFRES = [
  offre(
    "Klarr — Votre visibilité",
    "37.50",
    `Fiche Google, avis, réseaux et visibilité IA au même endroit. Alertes en temps réel. ${ESSAI_JOURS.visibilite} jours d'essai.`,
  ),
  offre(
    "Klarr — Réservations",
    "29.00",
    `Page de réservation à votre nom, sans commission sur les couverts. Privatisations, jauges par service, acompte versé directement au restaurateur. ${ESSAI_JOURS.reservations} jours d'essai.`,
  ),
  offre(
    "Klarr — Visibilité et Réservations",
    "59.00",
    "Les deux modules ensemble, soit onze pour cent de moins que séparément.",
  ),
];

/** Le balisage de l'accueil : l'éditeur, le logiciel, et la FAQ. */
export function balisageAccueil(): object[] {
  const url = siteUrl();
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Klarr",
      url,
      description: DESCRIPTION,
      parentOrganization: EDIREF,
      address: EDIREF.address,
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Klarr",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url,
      description: DESCRIPTION,
      publisher: EDIREF,
      offers: OFFRES,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: QUESTIONS.map(({ question, reponse }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: reponse },
      })),
    },
  ];
}
