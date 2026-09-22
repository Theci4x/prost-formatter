import { siteUrl } from "@/lib/site-url";
import { ACCUEIL_PUBLIC } from "@/lib/i18n/accueilPublic";
import type { Langue } from "@/lib/i18n/langue";

/**
 * Ce que Klarr déclare de lui-même aux moteurs et aux assistants.
 *
 * Une seule source pour la FAQ visible et pour son balisage : Google
 * sanctionne le JSON-LD qui ne correspond pas à ce que la page montre, et
 * deux listes tenues à la main finissent toujours par diverger — celle
 * qu'on nous a proposée comptait déjà dix questions à l'écran contre six
 * dans le balisage, avec des réponses raccourcies.
 *
 * Depuis la traduction, cette source est le dictionnaire de la page
 * d'accueil : les questions y sont écrites une fois par langue, la
 * section les affiche et le balisage les reprend. Un visiteur qui a
 * choisi l'anglais voit donc une page anglaise et un balisage anglais —
 * jamais l'un dans l'autre.
 */

export type Question = { question: string; reponse: string };

/** Les questions affichées par la section FAQ, dans la langue lue. */
export function questions(langue: Langue): Question[] {
  return ACCUEIL_PUBLIC[langue].faq.questions;
}

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
  url: "https://www.ediref.com",
  foundingDate: "2008",
  /**
   * Le numéro d'immatriculation, tel qu'il figure aux mentions légales.
   *
   * C'est le seul point de cette fiche qu'aucune autre société au monde
   * ne peut revendiquer. Le reste — un nom, un secteur — se ressemble
   * d'une entreprise à l'autre ; un SIREN, non.
   */
  identifier: {
    "@type": "PropertyValue",
    propertyID: "SIREN",
    value: "503428369",
  },
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

/**
 * Le balisage de l'accueil : l'éditeur, le logiciel, et la FAQ.
 *
 * Il suit la langue affichée, sans exception. Le montant, lui, ne la
 * suit pas : `price` est un nombre lisible par une machine, que
 * schema.org veut en notation anglo-saxonne quelle que soit la langue du
 * texte.
 */
export function balisageAccueil(langue: Langue): object[] {
  const url = siteUrl();
  const t = ACCUEIL_PUBLIC[langue];
  const description = t.meta.description;

  // Les trois offres, décrites dans la langue de la page. Le nom du
  // module et son résumé sont déjà écrits pour la grille tarifaire :
  // les redoubler ici les ferait diverger.
  const offres = [
    offre(
      `Klarr — ${t.tarifs.offres[0].nom}`,
      "37.50",
      `${t.tarifs.offres[0].resume} ${t.tarifs.offres[0].lignes.join(" · ")}`,
    ),
    offre(
      `Klarr — ${t.tarifs.offres[1].nom}`,
      "29.00",
      `${t.tarifs.offres[1].resume} ${t.tarifs.offres[1].lignes.join(" · ")}`,
    ),
    offre(
      `Klarr — ${t.tarifs.offres[0].nom} + ${t.tarifs.offres[1].nom}`,
      "59.00",
      // La description reprend ce que la page affiche, dans le même
      // ordre. Un balisage qui annoncerait autre chose que le bandeau
      // visible serait une raison documentée de perdre l'affichage
      // enrichi — et ici il n'y a plus de `**` à retirer, la mise en
      // forme ayant quitté le texte pour le gabarit.
      `${t.tarifs.pack.resume} ${t.tarifs.pack.economie}`,
    ),
  ];

  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Klarr",
      url,
      description,
      parentOrganization: EDIREF,
      address: EDIREF.address,
      /**
       * Le secteur et le pays, écrits noir sur blanc.
       *
       * Un audit de visibilité a montré que Google AI Overviews répondait
       * à des questions sur Klarr en citant « Klar », une application
       * mexicaine sans rapport. Ce n'est pas un problème d'autorité mais
       * d'identité : rien dans le balisage ne disait de quoi on parle ni
       * où. Un modèle qui hésite entre deux marques au nom voisin tranche
       * sur ce qu'il trouve d'écrit.
       *
       * Il manque encore le plus efficace — `sameAs`, les adresses des
       * profils officiels (LinkedIn, Crunchbase, réseaux). Elles ne sont
       * pas inventables : un `sameAs` qui pointe vers une page qui n'est
       * pas la nôtre dit exactement le contraire de ce qu'on veut dire.
       */
      areaServed: { "@type": "Country", name: "France" },
      knowsAbout: [
        "Réservation en ligne pour restaurants",
        "Visibilité des restaurants sur Google",
        "Gestion de salle et plan de table",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Klarr",
      applicationCategory: "BusinessApplication",
      // Plus précis que « application professionnelle », qui décrit aussi
      // bien un logiciel de paie qu'une banque en ligne.
      applicationSubCategory: "Logiciel de réservation pour restaurants",
      operatingSystem: "Web",
      inLanguage: langue,
      url,
      description,
      publisher: EDIREF,
      offers: offres,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: langue,
      mainEntity: questions(langue).map(({ question, reponse }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: reponse },
      })),
    },
  ];
}
