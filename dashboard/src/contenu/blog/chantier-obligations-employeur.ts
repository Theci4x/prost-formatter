import type { Billet } from "@/types/blog";

export const billet: Billet = {
  slug: "ouvriers-sur-votre-chantier-obligations",
  titre:
    "Des ouvriers travaillent chez vous : ce que vous risquez sans le savoir",
  resume:
    "Ce ne sont pas vos salariés, mais c'est votre chantier. L'obligation de vigilance, l'attestation à réclamer tous les six mois, et ce que coûte l'oubli.",
  categorie: "ouvrir",
  publieLe: "2026-09-14",
  misAJourLe: "2026-09-14",
  sources: [
    {
      intitule: "Urssaf — Obtenir et vérifier une attestation de vigilance",
      url: "https://www.urssaf.fr/accueil/attestation-vigilance.html",
    },
    {
      intitule:
        "Code du travail, article L8222-1 (obligation de vigilance du donneur d'ordre)",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006904828",
    },
    {
      intitule: "Code du travail, article L8222-2 (solidarité financière)",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006904830",
    },
  ],
  essentiel: [
    "Au-delà de 5 000 € HT par contrat, vous êtes donneur d'ordre : vous devez réclamer l'attestation de vigilance Urssaf de votre prestataire, en vérifier l'authenticité, et la redemander tous les six mois.",
    "Sans ces vérifications, vous êtes solidairement redevable des cotisations que votre prestataire n'a pas versées, au prorata de votre chantier.",
    "Trois minutes par prestataire, deux fois par an. Une entreprise qui traîne à fournir la sienne vient de vous dire quelque chose d'utile.",
  ],
  image: {
    fichier: "/blog/chantier-contrats.jpg",
    alt: "Au fond, des ouvriers travaillent sur un chantier ; au premier plan, un homme inquiet devant des contrats de travaux et des courriers Urssaf.",
  },
  suite: [
    {
      slug: "erp-restaurant-categorie-commission-securite",
      pourquoi: "L'autre contrôle qui vous attend à la fin du chantier.",
    },
    {
      slug: "reservations-sans-commission-guide-restaurants-independants",
      pourquoi:
        "Et une fois ouvert : ce que coûtent les plateformes qui vous amèneront vos premiers clients.",
    },
  ],
  markdown: `
Vous avez signé un devis avec une entreprise. Elle envoie ses ouvriers. Vous vous dites, raisonnablement, que la manière dont elle emploie ses gens la regarde.

C'est faux, et c'est la mauvaise surprise la plus chère de l'ouverture, parce qu'elle n'arrive pas au moment des travaux : elle arrive des mois plus tard, par courrier.

## L'obligation de vigilance

::: chiffre 5 000 € HT
Le seuil à partir duquel vous devenez donneur d'ordre. Il s'apprécie **par contrat**, pas par facture : cinq devis de 1 500 € avec le même prestataire peuvent n'en former qu'un seul.
:::

À ce titre, vous devez :

- réclamer à votre prestataire son **attestation de vigilance** délivrée par l'Urssaf, **à la signature du contrat** ;
- la **redemander tous les six mois** jusqu'à la fin des travaux ;
- **vérifier son authenticité**, en saisissant le code de sécurité qui y figure dans l'outil de vérification de l'Urssaf.

Ces trois gestes, dans cet ordre. Une attestation qu'on vous tend et que vous rangez sans la vérifier ne vous protège pas : c'est précisément le document que falsifie une entreprise qui a quelque chose à cacher.

## Pourquoi c'est vous qui payez

Si votre prestataire a eu recours au travail dissimulé et que vous n'avez pas fait ces vérifications, vous êtes **solidairement responsable**. Concrètement : l'Urssaf peut vous réclamer les cotisations, impôts et taxes que votre prestataire n'a pas versés, au prorata du chantier qu'il a réalisé pour vous.

::: attention La solidarité financière n'est pas une amende
C'est une dette que vous payez **à la place de quelqu'un d'autre**, calculée sur ce qu'il n'a pas versé. Les sanctions civiles encourues atteignent par ailleurs 45 000 € pour une personne physique et 250 000 € pour une société.
:::

Un contrôle de l'inspection du travail sur votre chantier, c'est donc un contrôle qui vous concerne. Les ouvriers ne sont pas vos salariés, mais le chantier est le vôtre.

## Ce que ça prend, en vrai

Trois minutes par prestataire, deux fois par an.

1. À la signature : « Envoyez-moi votre attestation de vigilance Urssaf, s'il vous plaît. » Une entreprise en règle l'a sous la main, elle la télécharge en ligne.
2. Vous entrez le code de sécurité sur le site de l'Urssaf. L'outil vous dit si elle est authentique.
3. Vous la classez avec le devis. Six mois plus tard, vous redemandez.

Une entreprise qui traîne à vous la fournir, ou qui vous explique qu'elle n'en a pas besoin, vient de vous dire quelque chose d'utile.

## Les autres pièges du même chantier

- **La déclaration préalable à l'embauche** concerne vos propres salariés, pas ceux de vos prestataires. Mais si vous embauchez votre équipe avant l'ouverture — et vous le ferez, pour la formation —, elle doit être faite dans les huit jours qui précèdent l'embauche, pas après.
- **Le registre unique du personnel** doit exister dès le premier salarié.
- **L'affichage obligatoire** dans les locaux : il se prépare avant l'ouverture, pas le jour du contrôle.

## Ce qu'il faut vérifier vous-même

Le seuil de 5 000 € s'apprécie par contrat, pas par facture : cinq devis de 1 500 € avec le même prestataire peuvent constituer un seul contrat. En cas de doute sur un montage — sous-traitance en cascade, prestataire étranger, auto-entrepreneur —, la question se pose à votre expert-comptable ou à l'Urssaf directement, et elle se pose **avant** de signer.
`,
};
