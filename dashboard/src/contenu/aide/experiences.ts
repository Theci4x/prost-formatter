import type { Article } from "@/types/aide";

export const article: Article = {
  slug: "experiences",
  titre: "Créer une expérience",
  resume:
    "Cours de cocktails, atelier pâtes : des séances à places limitées, payées d'avance.",
  categorie: "reservations",
  ordre: 5,
  questions: [
    "Comment vendre un cours de cuisine ?",
    "Comment créer un atelier ?",
    "Comment faire payer d'avance une séance ?",
  ],
  markdown: `
**Expériences**, depuis la page Réservations.

Une expérience n'est pas une réservation de table : c'est une **séance à places limitées**, à un prix affiché, qui revient selon un rythme. Un cours de cocktails tous les jeudis à 18h, un atelier pâtes le samedi midi.

## Ce que tu règles

Tout, et c'est voulu — deux restaurants ne font pas la même chose :

- le **nom** et la **description** ;
- le **prix** par personne ;
- le **nombre de places** par séance ;
- la **durée**, si tu veux l'afficher ;
- les **jours** et l'**heure** ;
- une **période** facultative — un atelier de Noël ne tourne pas toute l'année ;
- un **délai de prévenance**, comme pour un service ;
- **prépaiement ou paiement sur place**. Un atelier d'initiation gratuit ne se prépaie pas.

## Les places

Les places d'une séance sont **indépendantes de la jauge de tes salles**. Douze places au bar à cocktails ne sont pas douze couverts au dîner.

Une place réservée mais non encore payée **tient la place** : sans ça, deux clients paieraient pour le même tabouret.

## Une limite à connaître

Dans cette version, **une séance n'occupe pas la salle** au sens du moteur de disponibilité.

Si ton cours de cocktails et une privatisation tombent au même moment dans la même pièce, rien ne te le signalera. C'est à toi de ne pas le faire — ou de poser une fermeture sur la salle concernée.

C'est la limite la plus importante de cette fonctionnalité, autant la connaître avant d'en dépendre.

## Ce que voit le client

Tes expériences apparaissent sur ta page de réservation, sous les créneaux, avec les prochaines séances et les places restantes. S'il y a prépaiement, le client paie par carte via ton compte Stripe — même montage que les acomptes, sans commission Klarr.
`,
};
