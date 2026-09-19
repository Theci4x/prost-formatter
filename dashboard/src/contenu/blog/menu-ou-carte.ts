import type { Billet } from "@/types/blog";

export const billet: Billet = {
  slug: "menu-ou-carte-restaurant-marges",
  titre: "Menu ou carte : ce que votre choix fait à vos marges",
  resume:
    "Chaque ligne ajoutée à la carte coûte en stock, en perte et en formation. Les cinq formules possibles, ce qu'elles font à votre cuisine, et la méthode pour savoir lesquels de vos plats vous rapportent vraiment.",
  categorie: "remplir",
  publieLe: "2026-09-14",
  misAJourLe: "2026-09-14",
  sources: [
    {
      intitule:
        "Arrêté du 27 mars 1987 relatif à l'affichage des prix dans les établissements servant des repas",
      url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000338985",
    },
    {
      intitule:
        "DGCCRF — Restaurants : droits et obligations des professionnels",
      url: "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/restaurants-droits-et-obligations-des-professionnels",
    },
    {
      intitule:
        "Décret n° 2022-65 du 26 janvier 2022 (affichage de l'origine des viandes en restauration)",
      url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000045076376",
    },
    {
      intitule:
        "Règlement (UE) n° 1169/2011 dit INCO (information du consommateur, allergènes)",
      url: "https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32011R1169",
    },
    {
      intitule:
        "Cornell Hospitality Report — « $ or Dollars: Effects of Menu-price Formats on Restaurant Checks » (2009)",
      url: "https://ecommons.cornell.edu/items/87c48754-8c82-49c1-911c-f74da225c6e5",
    },
  ],
  essentiel: [
    "Le choix menu ou carte n'est pas une question de présentation : il décide du nombre de références que votre cuisine doit tenir, donc de vos stocks, de vos pertes et de votre marge.",
    "On optimise presque toujours le mauvais chiffre. Ce qui paie le loyer, c'est la marge en euros par assiette vendue, pas le pourcentage de coût matière.",
    "Quatre familles de plats, deux questions : marge et popularité. Chacune appelle une action différente, et retirer un plat en est une.",
    "La loi en met plus que vous ne croyez sur votre carte : origine des viandes, allergènes, et cinq vins avec leur contenance.",
  ],
  image: {
    fichier: "/blog/menu-carte.jpg",
    alt: "Un restaurateur compare deux documents sur sa table : une page de menus et formules, et une carte, avec une calculatrice et des relevés de coût matière.",
  },
  suite: [
    {
      slug: "tva-restaurant-menu-avec-vin-ventilation",
      pourquoi: "Le piège fiscal que le menu ajoute, et que la carte n'a pas.",
    },
    {
      slug: "livraison-uber-eats-deliveroo-calcul-marge",
      pourquoi: "Vos marges, vues depuis l'autre canal de vente.",
    },
  ],
  markdown: `
« On met une carte, comme ça les gens choisissent. »

C'est la décision la plus lourde de conséquences de toute l'ouverture, et elle se prend souvent en une phrase, un soir, en pensant que c'est une question de présentation.

Ce n'en est pas une. Le choix entre menu et carte ne décide pas de ce que le client lit : il décide de **combien de références votre cuisine doit tenir en même temps**. Et ce nombre-là commande vos stocks, vos pertes, votre temps de mise en place, et ce que vous devez apprendre à chaque nouveau commis.

::: chiffre Une ligne de plus
Une ligne de plus sur la carte, c'est un produit de plus à commander, un stock de plus à tourner, une perte de plus à absorber quand le service est calme, une mise en place de plus le matin, et une chose de plus à transmettre à chaque arrivée en cuisine.

La question n'est donc jamais « est-ce que ce plat se vend ? ». C'est : **est-ce qu'il se vend assez pour payer tout ça ?**
:::

## Les cinq formules, et ce qu'elles font à votre cuisine

**Le menu tout compris.** Un prix, un repas complet, un choix restreint — deux entrées, deux plats, deux desserts. Le client sait ce qu'il va payer avant d'entrer, ce qui reste l'argument le plus puissant qui soit. Votre cuisine tient six références. Vos approvisionnements sont simples, vos pertes faibles. En face : une marge souvent plus serrée, parce que ce prix affiché doit rester compétitif, et un choix qui peut faire fuir un groupe de quatre dont l'un ne mange pas de poisson.

**Le menu modulable.** Un prix par catégorie : les entrées à tel prix, les poissons à tel autre. Le client garde la sécurité du prix connu et gagne du choix. Vous, vous multipliez les références à l'intérieur de chaque gamme — et c'est là que ça dérape, parce que six entrées au même prix n'ont pas le même coût matière.

**Le menu « plat principal ».** C'est le plat qui fixe le prix du repas ; l'entrée et le dessert suivent. Excellent quand vous avez un produit à forte identité que les gens viennent chercher. Le revers est psychologique : le client a l'impression de payer cher un seul plat, parce qu'il ne voit pas ce que coûtent l'entrée et le dessert.

**La formule du jour.** L'arme des maisons qui ont une clientèle quotidienne. Elle évite la lassitude, elle absorbe le marché, elle vide les stocks. Elle exige en revanche de connaître très bien les goûts de vos habitués, sans quoi elle produit des invendus au lieu d'en éviter.

**La carte seule.** Le choix maximal, la marge unitaire souvent meilleure — et le maximum de références à tenir. C'est la formule la plus coûteuse en organisation, et celle qui pardonne le moins une erreur de prévision.

Dans la pratique, presque toutes les maisons qui tiennent font un mélange : **un socle court et permanent, plus une ardoise qui bouge.** Le socle amortit le matériel et la formation ; l'ardoise fait revenir les habitués et absorbe le marché.

## Le chiffre qu'on optimise, et celui qu'il faudrait

Demandez à un restaurateur le coût matière de son plat phare : il vous donnera un pourcentage. C'est le réflexe du métier, et c'est le mauvais chiffre.

Prenons deux plats, à 10 % de [TVA](/blog/tva-restaurant-menu-avec-vin-ventilation) :

| | Prix TTC | Prix HT | Coût matière | Ratio | **Marge** |
|---|---|---|---|---|---|
| Plat A | 14,00 € | 12,73 € | 3,80 € | 29,9 % | **8,93 €** |
| Plat B | 26,00 € | 23,64 € | 8,30 € | 35,1 % | **15,34 €** |

Le plat B a le « mauvais » ratio. Il rapporte **6,41 € de plus à chaque assiette**.

::: attention Le ratio ne paie pas le loyer
Le pourcentage de coût matière sert à comparer des plats **entre eux, dans la même catégorie**, et à repérer une dérive d'un mois sur l'autre. Il ne dit rien de ce que vous encaissez.

Ce qui paie le loyer, les salaires et vous, c'est la marge en euros multipliée par le nombre d'assiettes vendues. Un plat à 25 % qui part trois fois par service vous rapporte moins qu'un plat à 35 % qui part quinze fois.
:::

## Les quatre familles de plats

La méthode date de 1982 — Michael Kasavana et Donald Smith, à l'école hôtelière de Michigan State — et elle n'a pas pris une ride, parce qu'elle ne pose que deux questions à chaque plat : **est-ce qu'il rapporte ?** et **est-ce qu'il se vend ?**

Quatre cas, et quatre actions différentes :

- **Les étoiles** — forte marge, forte vente. Ne touchez à rien. Pas à la recette, pas à la portion, pas au fournisseur. Donnez-leur la meilleure place sur la carte et parlez-en [en salle](/blog/organisation-service-salle-fonctions).
- **Les chevaux de labour** — faible marge, forte vente. Les gens viennent pour ça : ne les supprimez pas. Travaillez le coût, la portion, l'accompagnement, ou montez le prix par petits pas. C'est le plat qui remplit la salle, pas celui qui la rentabilise.
- **Les énigmes** — forte marge, faible vente. Le plat est bon et rapporte, mais personne ne le prend. C'est presque toujours un problème de description, de place sur la carte, ou de suggestion en salle. Avant de le retirer, essayez de le déplacer et de le faire annoncer.
- **Les poids morts** — faible marge, faible vente. À retirer. C'est la décision la plus rentable de la liste, et la plus difficile : il y a toujours quelqu'un, en cuisine ou en salle, pour défendre le plat qui ne se vend pas.

::: exemple Comment le faire, un soir, avec les extractions de la caisse
Prenez un mois de ventes. Traitez **chaque catégorie séparément** — les entrées avec les entrées, les plats avec les plats : comparer une entrée à 9 € et un plat à 26 € ne veut rien dire.

Pour chaque plat, deux colonnes : le nombre vendu, et la marge en euros. Calculez la moyenne des deux colonnes. Chaque plat tombe alors dans un des quatre cas — au-dessus ou en dessous de la moyenne, sur chaque axe.

Ça prend une soirée. Ça se refait à chaque changement de carte, et on est presque toujours surpris par au moins un plat.
:::

## Ce que la loi met sur votre carte

Une carte n'est pas qu'un document commercial. Plusieurs mentions y sont obligatoires, et ce sont celles qu'on découvre au premier contrôle :

- **L'affichage extérieur.** Les prix des prestations les plus couramment servies doivent être lisibles depuis l'extérieur, et la liste des menus ou le plat du jour affichée pendant tout le service — au moins à partir de 11 h 30 pour le déjeuner et de 18 h pour le dîner.
- **Cinq vins.** La carte doit indiquer le prix de cinq vins — ou de cinq boissons couramment servies si vous n'en servez pas — **avec la quantité servie**. C'est la mention que presque personne ne connaît.
- **Les prix sont TTC**, et l'affichage doit préciser si le service est compris.
- **Les allergènes.** Les quatorze allergènes à déclaration obligatoire doivent être portés à la connaissance du client : sur la carte à côté de chaque plat, dans un document tenu à disposition, ou sur un tableau affiché en salle. Au choix, mais pas nulle part.
- **L'origine des viandes.** Depuis mars 2022, les viandes bovine, porcine, ovine et de volaille achetées crues imposent d'indiquer le pays d'élevage et le pays d'abattage, de façon lisible et visible — sur la carte ou sur un autre support.
- **Le « fait maison »** est une mention encadrée, avec une définition précise. Elle ne se met pas au hasard, et une carte qui l'emploie à tort est une carte qui ment à son client.

## Un détail de format qui se mesure

Une étude de l'école hôtelière de Cornell, en 2009, a comparé trois façons d'écrire les prix sur la même carte : avec le symbole monétaire, en chiffres seuls, et en toutes lettres. Les clients qui recevaient la carte **en chiffres seuls** ont dépensé en moyenne **8,15 % de plus** que les deux autres groupes.

Je le donne pour ce qu'il vaut : un seul restaurant, un seul service, aux États-Unis, il y a plus de quinze ans. Mais la direction est la bonne, et elle rejoint l'expérience de salle : **tout ce qui fait ressembler un prix à un prix pousse à lire la carte comme une liste de prix.**

Le corollaire pratique est plus utile que l'étude : évitez la colonne de prix alignée à droite, avec les petits points de conduite. Elle invite à descendre la colonne des prix au lieu de lire les plats — et le client choisit alors le moins cher, pas celui qui lui fait envie.

## Ce qu'il faut vérifier vous-même

- **Vos chiffres, pas ceux d'un article.** Tout ce qui précède est une méthode ; les moyennes qui comptent sont les vôtres, et elles sortent de votre caisse.
- **Le coût matière réel, pertes comprises.** La fiche technique dit ce que coûte l'assiette parfaite. Votre marge, elle, paie aussi les parures, les ratés et ce qui part à la poubelle le dimanche soir.
- **Les conditions exactes du « fait maison »** avant de l'apposer.
- **Le règlement local** pour l'affichage extérieur et la terrasse, qui peut ajouter ses propres contraintes.

---

Si vous n'avez pas encore ouvert, l'ordre des opérations est ailleurs :
[Ouvrir un restaurant en France : tout ce qu'on découvre trop tard](/blog/ouvrir-un-restaurant-demarches).
`,
};
