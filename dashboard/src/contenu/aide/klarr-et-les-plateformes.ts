import type { Article } from "@/types/aide";

export const article: Article = {
  slug: "klarr-et-les-plateformes",
  titre: "Klarr et les plateformes à commission",
  resume:
    "Ce que change le fait de ne pas payer au couvert, et ce que ça implique.",
  categorie: "decouvrir",
  ordre: 4,
  questions: [
    "Quelle différence avec TheFork ?",
    "Pourquoi pas de commission ?",
    "Klarr est-il moins cher qu'une plateforme ?",
  ],
  markdown: `
La question revient toujours, et elle mérite une réponse franche.

## Le modèle des plateformes

Une place de marché vous facture **par couvert servi**. Elle vous amène des convives, et prélève à chaque fois. Deux conséquences :

- **plus vous remplissez, plus vous payez.** Un vendredi complet coûte cher ;
- **les clients qu'elle vous amène sont les siens.** Leur adresse, leur historique, leurs habitudes lui appartiennent. Le jour où vous partez, ils restent chez elle.

En échange, elle vous apporte quelque chose de réel : de la demande. Un restaurant inconnu dans une rue passante y trouve son compte, au moins au début.

## Le modèle de Klarr

Un abonnement fixe, **aucune commission par couvert**. Un vendredi complet ne coûte pas un centime de plus qu'un mardi vide, et vos clients restent les vôtres — leurs coordonnées sont dans votre tableau de bord, exportables.

Ce n'est pas qu'une promesse commerciale : Klarr n'est pas intermédiaire de paiement. Les acomptes de vos clients arrivent sur **votre** compte Stripe, jamais sur le nôtre. Techniquement, nous n'avons pas la main pour nous servir au passage.

## Ce que Klarr ne vous donne pas

**De la demande.** Klarr ne vous amène pas de convives. Il n'y a pas d'annuaire Klarr.

Si vous dépendez entièrement d'une plateforme pour remplir, passer à Klarr du jour au lendemain vous coûtera des couverts. Le chemin raisonnable est progressif : ouvrir sa page Klarr, la mettre sur sa fiche Google — c'est là que les gens cherchent —, sur son Instagram, sur ses cartes de visite, et regarder la part qui bascule mois après mois.

## Le calcul, en clair

À 80 € TTC par mois, Klarr coûte moins cher qu'une plateforme dès que vous dépassez **une trentaine de couverts par mois** amenés par celle-ci, en prenant une commission autour de 2,50 € le couvert.

Au-delà, chaque couvert supplémentaire est gratuit chez Klarr. C'est là que l'écart se creuse — et il se creuse d'autant plus que vous marchez bien.
`,
};
