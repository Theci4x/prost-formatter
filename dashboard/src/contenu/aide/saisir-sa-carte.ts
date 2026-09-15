import type { Article } from "@/types/aide";

export const article: Article = {
  slug: "saisir-sa-carte",
  titre: "Saisir et publier ta carte",
  resume:
    "Tes plats, dans l'ordre du repas, avec photos, visibles par tes clients.",
  categorie: "carte",
  ordre: 1,
  questions: [
    "Comment ajouter ma carte ?",
    "Comment changer l'ordre des catégories ?",
    "Comment retirer un plat sans le supprimer ?",
  ],
  markdown: `
**Menu**, dans le menu de gauche de ton établissement.

## Ajouter un plat

Quatre champs : la **catégorie** (Entrées, Plats, Desserts…), le **nom du plat**, une **description** facultative et un **prix**.

Le prix se tape comme on l'écrit : 14,50 ou 14.50, les deux passent. Laisse-le **vide** si tu ne veux pas l'afficher — « selon arrivage » n'est pas zéro euro, et un plat sans prix reste sans prix chez le client.

La catégorie reste remplie d'un plat à l'autre : on saisit une carte bloc par bloc, pas en zigzag. Si tu écris « entrées » alors que « Entrées » existe déjà, Klarr les regroupe : pas de doublon à cause d'une majuscule.

## L'ordre

**Tes catégories s'affichent dans l'ordre où tu les ranges, pas par ordre alphabétique.** Une carte se lit dans l'ordre du repas.

Les flèches **↑ ↓** déplacent un plat dans sa catégorie, et celles en face du titre déplacent **la catégorie entière**, ses plats avec elle. Un plat ne change jamais de catégorie en se déplaçant.

## Décrocher un plat

Le poisson n'est pas arrivé ce matin : clique **Décrocher**. Le plat disparaît de la carte du client mais reste chez toi, avec sa description et son prix. **Remettre** le rétablit. Tu ne retapes rien.

**Supprimer**, lui, efface pour de bon.

## Les photos

Chaque plat peut porter **une photo**. Clique sur le carré « Photo » à gauche du plat et choisis ton fichier — 4 Mo maximum.

Un client choisit avec les yeux : le tartare photographié se commande, le tartare décrit se lit. Tu n'es pas obligé d'en mettre partout, la moitié d'une carte n'est jamais photographiée et c'est très bien.

## Publier

Tant que tu n'as pas cliqué **Publier sur ma page**, ta carte n'est visible que par toi. C'est volontaire : une carte tapée pour essayer n'a rien à faire d'un coup sur une adresse publique.

Une fois publiée, elle apparaît sur ta page de réservation, sous les disponibilités, et obtient **sa propre page** — celle du QR code.

**Retirer de ma page** la dépublie aussitôt, des deux endroits.
`,
};
