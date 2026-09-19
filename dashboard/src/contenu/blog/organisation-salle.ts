import type { Billet } from "@/types/blog";

export const billet: Billet = {
  slug: "organisation-service-salle-fonctions",
  titre: "Organisation en salle : une fonction n'est pas une personne",
  resume:
    "« Marc s'occupe de la cave » n'est pas une organisation, c'est un pari. Comment écrire les fonctions d'une petite maison, ce que ça rapporte en rotation, et la limite légale que les extras imposent.",
  categorie: "gerer",
  publieLe: "2026-09-15",
  misAJourLe: "2026-09-15",
  sources: [
    {
      intitule:
        "Code du travail, article L1242-2 (cas de recours au contrat à durée déterminée)",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037312980",
    },
    {
      intitule:
        "Code du travail, article D1242-1 (secteurs autorisés au CDD d'usage)",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000021336319",
    },
    {
      intitule:
        "Code du travail numérique — Convention collective Hôtels, cafés, restaurants (IDCC 1979)",
      url: "https://code.travail.gouv.fr/convention-collective/1979-hotels-cafes-restaurants",
    },
  ],
  essentiel: [
    "Une fonction est un ensemble de tâches, indépendant de qui les fait. Organiser autour des personnes marche jusqu'au premier samedi où l'une d'elles manque.",
    "La règle qui protège : une personne peut tenir plusieurs fonctions, mais une fonction entière ne doit jamais reposer sur une seule personne.",
    "Un dixième de rotation sur quarante couverts vaut environ 89 € par service — exactement ce que coûte un taux de no-show de 10 %.",
    "Les extras relèvent du CDD d'usage, mais au-delà de soixante jours par trimestre civil, la convention HCR ouvre la voie à une requalification.",
  ],
  image: {
    fichier: "/blog/organisation-salle.jpg",
    alt: "Une restauratrice met au propre son organisation de salle : d'un côté la liste des fonctions, de l'autre les prénoms de l'équipe, pendant que le service se prépare derrière elle.",
  },
  suite: [
    {
      slug: "no-show-restaurant-cout-empreinte-bancaire",
      pourquoi:
        "Une salle bien tenue ne rattrape pas une table qui ne vient pas.",
    },
    {
      slug: "erp-restaurant-categorie-commission-securite",
      pourquoi:
        "Ce que la loi vous autorise à accueillir, avant même de savoir qui sert.",
    },
  ],
  markdown: `
« Marc s'occupe de la cave. » « Julie sait faire la caisse. » « Pour les groupes, on demande à Sofiane. »

Dans une petite maison, l'organisation ne s'écrit pas : elle s'installe. Chacun prend ce qu'il sait faire, les habitudes se forment, et ça tourne. Ça tourne très bien, même — jusqu'au premier samedi où Marc est malade.

Ce jour-là, on découvre que personne ne sait ce qu'il y a en cave, ni à quelle température, ni ce qui a été commandé. Non pas parce que c'est compliqué, mais parce que ce n'était écrit nulle part.

## Une fonction n'est pas une personne

C'est la distinction qui change tout, et elle est simple.

**Une fonction, c'est un ensemble de tâches qui vont ensemble** : la laverie, l'accueil, la cave du jour, l'encaissement, la fermeture. Elle existe indépendamment de qui la tient. Elle ne part pas en vacances, elle ne démissionne pas.

**Une personne, c'est quelqu'un à qui l'on confie une ou plusieurs fonctions**, pour un service donné.

Organiser autour des fonctions plutôt qu'autour des gens ne rend pas la maison moins humaine. Ça la rend simplement capable de fonctionner un soir où quelqu'un manque — ce qui, dans ce métier, arrive tous les mois.

::: attention La règle qui protège, et qu'on applique rarement
**Une personne peut tenir plusieurs fonctions. Mais une fonction entière ne doit jamais reposer sur une seule personne.**

C'est la règle inverse de celle qu'on applique naturellement. Spontanément, on confie tout un domaine à celui qui s'y intéresse — et on se retrouve avec un point unique de défaillance dans chaque coin de la maison.

Il ne s'agit pas de tout faire faire à tout le monde. Il s'agit que **pour chaque fonction, au moins deux personnes sachent la tenir**. Une qui la fait, une qui peut la reprendre.
:::

## Écrire les fonctions : le test de la fiche utile

Vous n'avez pas besoin du classeur d'un grand hôtel. Une page par fonction suffit, et l'exercice se fait une fois.

Le test est simple :

::: exemple Ce qui distingue une fonction d'un vœu
**« Faire la mise en place »** n'est pas une fonction. C'est un souhait, et chacun l'interprétera à sa façon.

**« Napper les quatorze tables, deux verres et trois couverts par couvert, serviettes pliées à gauche, bougies remplies, terminé à 11 h 45 »** en est une.

La différence : quelqu'un qui arrive le matin peut l'exécuter **sans poser de question**, et vous pouvez vérifier qu'elle est faite **sans y avoir assisté**.
:::

Faites la liste de vos fonctions — ouverture, mise en place, accueil et réservations, prise de commande, boissons, envoi, suivi de salle, encaissement, cave et stocks, laverie, entretien, fermeture. Une douzaine, dans une maison de quarante couverts. Puis écrivez chacune sur une page.

C'est deux ou trois heures de travail. Elles se rentabilisent au premier remplacement.

## La seule question d'organigramme qui compte

Dans une petite maison, l'organigramme tient en trois cases et il n'intéresse personne. Une seule question mérite d'être tranchée par écrit :

> **Qui décide quoi quand vous n'êtes pas là ?**

Qui peut offrir un dessert, et jusqu'à quel montant. Qui peut refuser un client. Qui peut accepter un groupe de huit à 21 h. Qui décide d'arrêter un plat.

Si la réponse à l'une de ces questions est « ça dépend », le problème se manifestera un vendredi soir, au pire moment, et il coûtera soit un client soit un salarié.

## Ce que l'organisation rapporte, en euros

L'organisation en salle n'est pas un sujet de confort. Elle se mesure sur une seule ligne : **la rotation**.

Le temps entre le départ d'une table et la suivante est fait de débarrassage, de redressage, d'addition et d'encaissement. Chacun de ces quatre gestes se raccourcit avec une organisation claire — et personne ne mange plus vite pour autant.

::: chiffre Un dixième de rotation
Sur une salle de quarante couverts, gagner **un dixième de rotation** — de 1,5 à 1,6 service par table — ce sont quatre couverts de plus. À 22 € de marge par couvert, environ **89 € par service**.

C'est exactement ce que coûte un taux de no-show de 10 % sur la même salle. Autrement dit : bien organiser sa salle rapporte autant que supprimer tous ses no-shows — et ça ne dépend que de vous.
:::

La méthode pour établir votre marge par couvert est la même que pour un plat :
[Menu ou carte : ce que votre choix fait à vos marges](/blog/menu-ou-carte-restaurant-marges).

## Le briefing : cinq minutes, trois choses

Debout, avant le service, et court. Trois sujets, pas quatre :

1. **Ce qui manque.** Les plats terminés, les vins épuisés. Rien n'abîme plus un service qu'un plat annoncé puis refusé à table.
2. **Ce qu'on pousse.** Un plat, deux au maximum, avec la raison — un arrivage, une marge, un stock à écouler. Une équipe qui sait *pourquoi* le propose mieux.
3. **Ce qui est particulier ce soir.** Le groupe de douze à 20 h 30, l'anniversaire de la table 7, l'habitué qui revient après une mauvaise expérience.

::: attention Ce qui n'a pas sa place dans un briefing
Les reproches. Ce qui s'est mal passé hier se dit après le service, ou en tête-à-tête — jamais devant l'équipe cinq minutes avant l'ouverture.

Un briefing qui commence par un reproche produit un service entier de gens crispés. Le calcul est vite fait : vous avez raison sur le fond, et vous perdez la soirée.
:::

## Les extras : ce que le droit impose à votre organisation

L'hôtellerie-restauration figure parmi les secteurs autorisés à recourir au **contrat à durée déterminée d'usage**, pour des emplois par nature temporaires. C'est ce qui permet l'extra du samedi soir, et c'est parfaitement légal.

Mais l'usage a des bornes, et les deux principales sont souvent ignorées :

- **Le besoin doit être réellement temporaire.** Un extra présent tous les vendredis et samedis depuis deux ans ne répond pas à un besoin occasionnel : il occupe un poste permanent. La répétition des contrats est précisément ce que le juge regarde.
- **La convention collective HCR fixe un seuil** : au-delà d'environ soixante jours travaillés dans un même trimestre civil, l'extra peut demander la requalification de sa situation.

La requalification en contrat à durée indéterminée entraîne indemnité de requalification, indemnité de préavis, et le reste. Ce n'est pas une amende : c'est un salarié que vous aviez sans le savoir.

**Le lien avec l'organisation est direct.** Si vos extras tiennent des fonctions permanentes, ce n'est pas un problème de contrat, c'est un problème de dimensionnement : il vous manque un poste. Écrire les fonctions fait apparaître cette réalité en une page — et c'est souvent la vraie découverte de l'exercice.

## Ce qu'il faut vérifier vous-même

- **Vos fonctions à point unique.** Pour chacune, demandez-vous qui la tiendrait si son titulaire manquait demain. Celles pour lesquelles vous n'avez pas de réponse sont votre liste de travail.
- **Le texte à jour de la convention collective HCR**, et votre situation réelle avec votre expert-comptable ou un conseil : les seuils et les modalités évoluent, et cet article ne remplace pas un examen de vos contrats.
- **Votre rotation actuelle**, service par service. Sans cette mesure, toute discussion sur l'organisation reste une affaire d'opinions.
`,
};
