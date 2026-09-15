import type { Billet } from "@/types/blog";

export const billet: Billet = {
  slug: "declaration-sanitaire-restaurant-ddpp",
  titre: "Immatriculer sa société ne déclare pas son restaurant",
  resume:
    "Deux administrations, deux registres, et personne pour vous dire que le second existe. La déclaration à la DDPP, le cas de l'agrément, et ce que le contrôle regarde vraiment.",
  categorie: "ouvrir",
  publieLe: "2026-09-14",
  misAJourLe: "2026-09-14",
  sources: [
    {
      intitule:
        "Règlement (CE) n° 852/2004, article 6 (enregistrement des établissements du secteur alimentaire)",
      url: "https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32004R0852",
    },
    {
      intitule:
        "Cerfa n° 13984 — déclaration de manipulation de denrées alimentaires d'origine animale",
      url: "https://www.formulaires.service-public.gouv.fr/gf/cerfa_13984.do",
    },
    {
      intitule:
        "Arrêté du 8 juin 2006 relatif à l'agrément sanitaire des établissements mettant sur le marché des produits d'origine animale",
      url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000819750",
    },
    {
      intitule:
        "Décret n° 2011-731 du 24 juin 2011 relatif à l'obligation de formation en matière d'hygiène alimentaire",
      url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000024266465",
    },
    {
      intitule:
        "Arrêté du 28 février 2017 (modalités de publication des résultats des contrôles officiels — Alim'confiance)",
      url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000034112196",
    },
  ],
  essentiel: [
    "Immatriculer sa société ne déclare pas son activité alimentaire : la déclaration à la DDPP est une démarche distincte, à faire avant l'ouverture, avec le Cerfa n° 13984.",
    "Ce n'est pas une autorisation mais un enregistrement — rien ne vous bloque si vous l'oubliez, et c'est précisément pour ça qu'on l'oublie.",
    "Dès que vous cédez vos préparations à un autre établissement, vous sortez de la déclaration et vous entrez dans l'agrément sanitaire.",
    "Le contrôle porte sur trois choses : plan de maîtrise sanitaire, formation hygiène, traçabilité.",
  ],
  image: {
    fichier: "/blog/declaration-classeurs.jpg",
    alt: "Une pile de classeurs — déclaration DDPP, licence IV, commission de sécurité, déclaration d'ouverture en mairie — surmontée d'un post-it « et le restaurant ?! », à côté d'un restaurateur qui lit son Kbis.",
  },
  markdown: `
Quand on crée une société, on a le sentiment d'avoir tout déclaré. Le greffe a enregistré, l'INSEE a attribué un SIRET, le comptable a sa liasse. On se dit, raisonnablement, que l'administration sait qu'on ouvre un restaurant.

Elle ne le sait pas.

L'immatriculation dit qu'une société existe et quel est son objet. Elle ne dit à personne qu'à telle adresse, à partir de telle date, quelqu'un va manipuler de la viande, du poisson et des produits laitiers. Ça, c'est une autre déclaration, à une autre administration, et personne ne la déclenche à votre place.

## La déclaration d'activité

**À qui :** la direction départementale de la protection des populations (DDPP) de votre département — dans certains départements le service s'appelle DDETSPP, c'est le même interlocuteur.

**Avec quoi :** le formulaire Cerfa n° 13984, « déclaration de manipulation de denrées alimentaires d'origine animale ».

**Quand :** avant l'ouverture. Les services départementaux demandent en général de compter au moins quinze jours ; prenez un mois, vous ne le regretterez pas.

**Qui est concerné :** tout établissement qui prépare, traite, transforme, manipule ou entrepose des denrées d'origine animale. Un restaurant, évidemment. Un bar qui sert des planches de charcuterie aussi.

Le principe vient de l'article 6 du règlement européen n° 852/2004 : chaque établissement du secteur alimentaire doit être enregistré auprès de l'autorité compétente. La France l'applique par cette déclaration.

**Ce que ce n'est pas.** Ce n'est pas une autorisation. Personne n'instruit votre dossier, personne ne vient visiter avant de vous dire oui. Vous déclarez, on vous renvoie un récépissé, vous êtes enregistré.

::: attention Pourquoi on l'oublie
**Rien ne vous bloque si vous ne la faites pas.** Vous ouvrez, ça marche, les clients viennent — jusqu'au jour où un contrôleur se présente et constate que l'établissement n'existe pas dans ses fichiers. Ce jour-là, la conversation ne commence pas bien.
:::

## Le cas qui change tout : l'agrément

La déclaration suffit tant que vous vendez **au consommateur final**. C'est la situation d'un restaurant : vos clients mangent ce que vous préparez.

Elle ne suffit plus dès que vous cédez vos préparations à **un autre établissement** : vous fournissez l'épicerie d'en face en terrines, vous livrez des plats à un bar sans cuisine, vous faites du traiteur pour un confrère. Là, il faut un **agrément sanitaire** — un vrai dossier, instruit, avec visite.

Entre les deux existe une **dérogation à l'agrément**, prévue par l'arrêté du 8 juin 2006, qui couvre la petite quantité. Deux conditions, cumulatives :

- la quantité cédée reste, par catégorie de produits, sous **30 % de votre production** de cette catégorie — sauf si elle reste sous le plafond fixé en annexe de l'arrêté, auquel cas la limite des 30 % ne s'applique pas ;
- les établissements livrés sont dans un rayon de **80 km**. Le préfet peut porter cette distance jusqu'à 200 km dans les zones soumises à des contraintes géographiques particulières.

::: exemple Le cas typique
Vous faites des terrines, l'épicerie d'en face en veut quelques-unes, vous dites oui en pensant rendre service. C'est une **cession à un autre établissement** : vous venez de sortir du régime de la déclaration. Ça se règle très bien — mais ça se règle avant, pas quand la DDPP le découvre.
:::

## Ce que le contrôle regarde vraiment

La déclaration vous met sur la liste. Ce qui se passe ensuite, c'est le contrôle — et il ne porte pas sur la déclaration. Il porte sur trois choses.

**Le plan de maîtrise sanitaire.** C'est le document central, celui qu'on vous demandera en premier. Il décrit vos bonnes pratiques d'hygiène, votre démarche fondée sur les principes HACCP et votre système de traçabilité. Ce n'est pas un classeur qu'on achète : c'est le vôtre, il décrit votre cuisine, vos circuits, vos fournisseurs. Un plan acheté tout fait se repère en trois questions.

**La formation.** Depuis le décret n° 2011-731 du 24 juin 2011, tout établissement de restauration commerciale doit compter dans son effectif **au moins une personne** justifiant d'une formation en hygiène alimentaire — quatorze heures au minimum. Deux dispenses existent : un diplôme figurant sur la liste fixée par l'arrêté du 25 novembre 2011, ou trois ans d'expérience au moins comme gestionnaire ou exploitant dans une entreprise du secteur alimentaire.

**La traçabilité.** Savoir d'où vient ce qu'il y a dans vos frigos, et pouvoir le montrer. C'est là que les contrôles se passent mal le plus souvent — beaucoup plus que sur la propreté, qu'on voit venir.

## Un mot sur la note d'hygiène

Depuis 2017, les résultats des contrôles officiels sont publiés sur le site Alim'confiance, en quatre niveaux, et n'importe qui peut consulter le vôtre.

Une confusion circule là-dessus, alors autant être net : **la publication en ligne est automatique ; l'affichage sur votre vitrine, lui, ne l'est pas.** La DDPP vous transmet un autocollant, et vous êtes libre de l'apposer ou non.

Beaucoup de restaurateurs croient l'affichage obligatoire et s'en inquiètent, sans avoir vu que le résultat est de toute façon public en ligne. C'est l'inverse qu'il faut retenir : la note se voit, autocollant ou pas. Autant qu'elle soit bonne.

## Ce qu'il faut vérifier vous-même

- **Le règlement sanitaire départemental** peut être plus exigeant que le texte national.
- **Le service compétent** n'a pas le même nom partout (DDPP, DDETSPP), et les modalités de dépôt — papier, courriel, téléservice — varient d'un département à l'autre.
- **Vos activités annexes** — vente à emporter, livraison, marché, cave à fromages, conserves — peuvent déplacer votre régime. La question se pose à la DDPP avant de s'y mettre, pas après.

Un appel à la DDPP de votre département coûte dix minutes. C'est le meilleur rapport temps-tranquillité de toute votre ouverture.

---

Cet article fait partie d'une série sur l'ouverture d'un restaurant :

- [Ouvrir un restaurant en France : tout ce qu'on découvre trop tard](/blog/ouvrir-un-restaurant-demarches)
- [Les diagnostics à faire avant de toucher aux murs](/blog/diagnostics-avant-travaux-restaurant)
- [Des ouvriers travaillent chez vous : ce que vous risquez](/blog/ouvriers-sur-votre-chantier-obligations)
`,
};
