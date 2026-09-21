import type { Billet } from "@/types/blog";

export const billet: Billet = {
  slug: "extraction-restaurant-conduit-toiture",
  titre: "L'extraction : le seul point qu'on ne règle pas avec de l'argent",
  resume:
    "Les buées de cuisson sortent au-dessus du toit, pas en façade. S'il n'y a pas de conduit, il faut le créer — et c'est l'assemblée générale qui décide, pas vous.",
  categorie: "ouvrir",
  publieLe: "2026-09-20",
  misAJourLe: "2026-09-20",
  // BROUILLON — sources à ouvrir une par une avant publication.
  brouillon: true,
  sources: [
    {
      intitule:
        "Circulaire du 9 août 1978 modifiée — Règlement sanitaire départemental type",
      url: "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000006057151/",
    },
    {
      intitule:
        "Loi n° 65-557 du 10 juillet 1965, article 25 — travaux affectant les parties communes",
      url: "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000006068256/",
    },
  ],
  essentiel: [
    "Les buées et odeurs de cuisson doivent être évacuées au-dessus du toit. Une hotte qui rejette en façade ou dans la cour n'est pas une extraction : c'est un contentieux en attente.",
    "S'il n'existe pas de conduit, en créer un traverse des parties communes. Cela suppose un vote en assemblée générale, qui peut être refusé — et un refus ne s'achète pas.",
    "Un conduit existant ne vous appartient pas pour autant : il peut desservir un autre lot, être hors service, ou être sous-dimensionné pour votre cuisine.",
    "C'est la première question à poser, avant même le prix. Une condition suspensive coûte une ligne ; découvrir après la signature coûte le projet.",
  ],
  suite: [
    {
      slug: "diagnostics-avant-travaux-restaurant",
      pourquoi: "Ce qu'il faut faire constater avant d'ouvrir un mur.",
    },
    {
      slug: "erp-restaurant-categorie-commission-securite",
      pourquoi: "L'autre contrainte qui se lit dans les murs, pas sur le bail.",
    },
  ],
  markdown: `
Sur les cinq points qui empêchent d'ouvrir un restaurant, quatre se négocient. On trouve un arrangement, on paie, on attend, on plaide. L'extraction, non.

C'est le seul endroit du projet où une assemblée générale de copropriétaires peut dire non, et où ce non est définitif. Pas cher : impossible.

## Ce que la règle demande vraiment

Les buées, graisses et odeurs d'une cuisine professionnelle doivent être **évacuées au-dessus de la toiture**. C'est le règlement sanitaire départemental qui le dit — un texte départemental, calqué sur un modèle national, et que votre préfecture publie.

Le mot qui compte est *au-dessus*. Pas « vers l'extérieur », pas « en façade », pas « dans la cour ». Un conduit qui débouche à hauteur d'homme dans une cour d'immeuble envoie vos odeurs de friture dans les fenêtres du premier étage, et vous n'aurez aucun argument à opposer au voisin qui s'en plaindra.

::: attention La hotte n'est pas l'extraction
On confond les deux en permanence, et les annonces immobilières y aident.

Une **hotte** capte au-dessus des feux. Un **conduit d'extraction** transporte jusqu'en toiture. Un local peut très bien avoir une hotte magnifique raccordée à rien du tout — ou raccordée à une bouche qui donne sur la cour.

Quand une annonce dit « cuisine équipée », allez voir où ça sort. Depuis la rue, levez la tête : le conduit doit monter le long de la façade ou dans une gaine, et dépasser en toiture.
:::

## Pourquoi c'est l'assemblée générale qui décide

Un conduit d'extraction ne reste pas chez vous. Il traverse des planchers, des gaines, une façade, un toit — c'est-à-dire des **parties communes**. Or vous n'avez aucun droit d'y toucher seul.

Créer ou modifier ce conduit suppose donc une autorisation de l'assemblée générale des copropriétaires, votée à une majorité renforcée. Et une assemblée générale n'est pas un guichet : c'est une réunion de gens qui habitent au-dessus de votre future cuisine et qui n'ont, eux, rien à y gagner.

Les motifs de refus sont d'ailleurs rarement de mauvaise foi. Un conduit prend de la place dans une gaine déjà occupée, abîme une façade classée, fait du bruit, se nettoie mal. Un copropriétaire raisonnable peut voter non pour de bonnes raisons.

## Trois questions à poser avant de parler d'argent

**1. Existe-t-il un conduit, et dessert-il mon lot ?**

Ce sont deux questions, pas une. Un immeuble peut avoir un conduit qui appartient à un autre lot, ou qui a été affecté à un usage précis il y a trente ans. Le syndic le sait, ou peut le retrouver dans le règlement de copropriété et les plans.

**2. Est-il dimensionné pour ma cuisine ?**

Un conduit conçu pour une boulangerie n'est pas un conduit pour une rôtisserie. Le débit dépend de ce que vous cuisinez et de la puissance installée. C'est un bureau d'études fluides ou un cuisiniste qui répond, pas un agent immobilier — et la réponse tient en une visite.

**3. Est-il en état ?**

Un conduit à l'arrêt depuis cinq ans peut être encrassé, percé, ou non conforme aux règles actuelles. Remettre en service coûte moins cher que créer, mais ce n'est pas gratuit.

::: exemple Ce que ça change à la négociation
Un local sans conduit avec accord de principe de la copropriété, un local sans conduit sans accord, et un local avec conduit en service ne valent pas le même prix. Ce sont trois biens différents.

Le vendeur, lui, les présente comme un seul. À vous de faire la différence avant de faire une offre — pas après.
:::

## Ce qu'il faut écrire dans le compromis

La question de l'extraction se règle par une **condition suspensive**. C'est une ligne dans un acte, elle ne coûte rien, et elle vous rend votre argent si la réponse est non.

Formulée simplement : la vente ou la prise à bail ne devient définitive que si l'assemblée générale autorise les travaux d'extraction, ou si un diagnostic confirme que le conduit existant convient à l'activité projetée.

Un vendeur de bonne foi l'acceptera. Un vendeur qui la refuse vous apprend quelque chose, et c'est déjà utile.

## Le calendrier, qui est le vrai piège

Une assemblée générale ordinaire se tient une fois par an. Une assemblée extraordinaire se convoque, mais elle se paie et elle prend du temps.

Autrement dit : si votre projet suppose un vote, votre date d'ouverture ne dépend plus de vous. Elle dépend de la date à laquelle le syndic convoquera les copropriétaires, et de ce qu'ils décideront ce jour-là.

C'est la raison pour laquelle cette question passe avant toutes les autres. Pas parce qu'elle est la plus compliquée — parce qu'elle est la seule dont la réponse peut être définitivement non.
`,
};
