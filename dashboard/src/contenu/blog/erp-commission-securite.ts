import type { Billet } from "@/types/blog";

export const billet: Billet = {
  slug: "erp-restaurant-categorie-commission-securite",
  titre: "ERP : votre capacité ne dépend pas du nombre de chaises",
  resume:
    "L'effectif se calcule à la surface, pas au plan de salle. Et c'est lui qui commande vos travaux, votre délai d'instruction et votre date d'ouverture — bien avant que vous ayez choisi vos tables.",
  categorie: "ouvrir",
  publieLe: "2026-09-14",
  misAJourLe: "2026-09-14",
  sources: [
    {
      intitule:
        "Règlement de sécurité ERP, article N 2 (effectif du public, restaurants et débits de boissons)",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000024751045/2002-02-08",
    },
    {
      intitule:
        "Règlement de sécurité ERP, chapitre III — établissements de type N (articles N 1 à N 20)",
      url: "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000020334913/",
    },
    {
      intitule:
        "Règlement de sécurité ERP, installations de cuisson (articles PE 15 à PE 19)",
      url: "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000024751253/",
    },
    {
      intitule:
        "Décret n° 2017-431 du 28 mars 2017 relatif au registre public d'accessibilité",
      url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000034307896",
    },
    {
      intitule:
        "handicap.gouv.fr — Registre d'accessibilité obligatoire : un guide pour les ERP",
      url: "https://handicap.gouv.fr/registre-daccessibilite-obligatoire-un-guide-pour-les-erp",
    },
  ],
  essentiel: [
    "Un restaurant est un ERP de type N, et son effectif se calcule à la surface accessible au public : 1 personne par m² en salle assise, 2 en zone debout, 3 dans les files d'attente. Votre plan de salle n'entre pas dans le calcul.",
    "Le seuil est à 200 personnes — 100 en sous-sol. En dessous, 5e catégorie et obligations allégées. Au-dessus, vous changez de monde, et l'instruction passe de trois à cinq mois.",
    "L'autorisation de travaux conditionne l'ouverture, et elle valide les plans. Commencer les travaux avant de l'avoir, c'est risquer de les refaire.",
    "Deux registres sont obligatoires, dont l'un pour toutes les catégories sans exception : le registre public d'accessibilité, qui manque presque partout.",
  ],
  image: {
    fichier: "/blog/erp-commission.jpg",
    alt: "Un technicien explique un plan de sécurité ERP à un restaurateur, mètre ruban sur la table, dans une salle fermée sous un panneau de sortie de secours.",
  },
  suite: [
    {
      slug: "terrasse-restaurant-autorisation-domaine-public",
      pourquoi:
        "Les mètres carrés du dehors ne se comptent pas comme ceux du dedans.",
    },
    {
      slug: "organisation-service-salle-fonctions",
      pourquoi: "Une capacité autorisée n'est pas une capacité servable.",
    },
  ],
  markdown: `
« On fera 60 couverts, on est un petit restaurant. »

C'est la phrase qui précède la mauvaise nouvelle. Parce que votre catégorie d'établissement recevant du public ne se déduit pas du nombre de chaises que vous comptez mettre. Elle se calcule, et elle se calcule autrement.

Et ce calcul commande tout le reste : le nombre et la largeur de vos issues, le désenfumage, l'alarme, l'éclairage de sécurité, le délai d'instruction de votre dossier, et la date à laquelle vous pourrez ouvrir.

## Le calcul, et la surprise

Un restaurant est un ERP de **type N** — restaurants et débits de boissons. L'article N 2 du règlement de sécurité fixe les densités :

| Zone | Effectif retenu |
|---|---|
| Restauration **assise** | **1 personne par m²** |
| Restauration **debout** (comptoir, bar) | **2 personnes par m²** |
| **Files d'attente** | **3 personnes par m²** |

::: attention Ce n'est pas vous qui décidez
Vous prévoyez 60 couverts dans 120 m² de salle ? Le règlement, lui, compte **120 personnes**.

L'effectif ne se déduit pas de votre plan de salle, ni de votre projet commercial, ni du nombre de tables que vous achetez. Il se calcule sur la **surface accessible au public**. Espacer les tables ne change rien au chiffre — ça change seulement votre chiffre d'affaires.
:::

::: chiffre 200 personnes
Le seuil qui sépare la 5e catégorie des autres pour un restaurant — et **100 personnes** seulement si la salle est en sous-sol.

En dessous : obligations allégées, instruction plus courte, visite de réception souvent dispensée. Au-dessus : vous changez de monde.
:::

**Un exemple qui se joue à quinze mètres carrés.** Une salle assise de 150 m² et un bar debout de 20 m² : 150 + 40 = **190 personnes**. Cinquième catégorie. Ajoutez quinze mètres carrés de salle et vous passez à 205 : quatrième catégorie, avec tout ce qui va avec.

C'est pour cette raison que la question se pose **avant de signer le bail**, et pas au moment de dessiner les travaux.

## Le dossier, et le calendrier qui fait reculer les ouvertures

Quand les travaux ne nécessitent pas de permis de construire — aménagement intérieur, reprise d'un local existant —, le dossier passe par le formulaire **Cerfa n° 13824**. Il fait vérifier, *avant* travaux, que l'établissement respectera les règles de sécurité incendie et d'accessibilité.

Deux avis distincts sortent de ce dossier unique : celui de la **commission de sécurité** et celui de la **commission d'accessibilité**.

Les délais d'instruction annoncés sont de **cinq mois** au maximum pour les établissements de 1re à 4e catégorie, et de **trois mois** pour la 5e.

::: exemple Pourquoi ça fait reculer les ouvertures
Bail signé en janvier, travaux prévus en mars, ouverture visée en mai. Le dossier part en février.

En quatrième catégorie, l'instruction peut courir jusqu'en juillet. Or c'est cette autorisation qui **valide les plans** : commencer les travaux avant de l'avoir, c'est accepter de les refaire si un avis demande une issue supplémentaire ou un désenfumage.

Soit on attend, soit on construit à ses risques. Les deux coûtent — mais pas le même prix.
:::

## L'ouverture ne se décide pas toute seule

Pour les établissements de 1re à 4e catégorie, une **visite de réception** par la commission de sécurité a lieu avant l'ouverture. En 5e catégorie sans hébergement, cette visite est souvent dispensée.

Puis c'est **le maire qui autorise l'ouverture**, par arrêté, après avis de la commission. Ce n'est pas une formalité que l'on obtient en la demandant : c'est une décision, et elle peut être négative.

Ouvrir malgré un avis défavorable vous expose à une fermeture administrative — et engage très lourdement votre responsabilité si quelque chose arrive.

## Ce qui commande réellement vos travaux

L'effectif calculé plus haut détermine :

- **les dégagements** : nombre d'issues et largeur des passages ;
- **le désenfumage** ;
- **l'alarme incendie et l'éclairage de sécurité** ;
- **les distances à parcourir** pour atteindre une sortie.

S'y ajoute un seuil qui ne dépend pas du public mais de votre cuisine : au-delà de **20 kW de puissance utile totale** d'appareils de cuisson et de remise en température, vous êtes en « grande cuisine », avec ses propres obligations — isolement, ventilation, coupure d'urgence.

Vingt kilowatts, sur un piano professionnel, c'est vite atteint. C'est un point à poser au bureau de contrôle **avant** de commander le matériel, pas après.

## Les deux registres, dont un qui manque partout

**Le registre de sécurité.** Il retrace les vérifications, les travaux, les formations du personnel, les exercices. C'est le premier document qu'on vous demandera lors d'une visite, et un registre vide en dit long.

**Le registre public d'accessibilité.** Il indique les dispositions prises pour que chacun puisse accéder à vos prestations, et il se tient **à disposition du public**, à l'accueil.

::: attention Celui-là manque presque partout
Le registre public d'accessibilité est obligatoire depuis le 30 septembre 2017 pour **toutes les catégories d'ERP, de la 1re à la 5e** — y compris le petit restaurant de quarante couverts qui se croit hors du champ.

Il ne coûte rien à constituer. Son absence, elle, se constate en trente secondes.
:::

## Ce qu'il faut vérifier vous-même

- **Votre effectif calculé sur plans**, par un homme de l'art, **avant de signer le bail** si c'est encore possible. C'est le chiffre dont tout le reste découle.
- **Le règlement départemental** et les prescriptions locales, qui peuvent s'ajouter au texte national.
- **La puissance de vos appareils de cuisson**, avant la commande.
- **Le calendrier réel de la commission de votre commune**, qui n'est pas le délai maximal annoncé — il peut être plus court, et parfois plus long en pratique.

Et surtout : cet article donne le cadre. **La détermination de votre catégorie se fait sur vos plans, par quelqu'un qui les a sous les yeux.** Aucun article ne peut la faire à votre place, et un article qui prétendrait le contraire vous ferait prendre un risque réel.

---

L'ordre complet des démarches, et les trois autres qu'on découvre trop tard :
[Ouvrir un restaurant en France : tout ce qu'on découvre trop tard](/blog/ouvrir-un-restaurant-demarches).
`,
};
