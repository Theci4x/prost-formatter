import type { Article } from "@/types/aide";

export const article: Article = {
  slug: "statistiques",
  titre: "Suivre tes réservations",
  resume:
    "Ce que les chiffres disent de ton service : remplissage, annulations, jours forts.",
  categorie: "reservations",
  ordre: 4,
  questions: [
    "Où sont les statistiques ?",
    "Comment savoir mon taux de remplissage ?",
    "Combien de couverts ce mois-ci ?",
  ],
  markdown: `
Les statistiques sont sur la page **Réservations**, sous les demandes.

## Ce qu'elles montrent

- **Les couverts servis** sur la période, et leur évolution.
- **Le taux de remplissage** : ce que tu as vendu rapporté à ce que tu pouvais vendre. C'est le chiffre le plus utile, parce qu'il compare ta salle à elle-même et pas à celle du voisin.
- **Les annulations et les demandes refusées** : trop de refus, c'est souvent une capacité mal réglée ou un délai de prévenance trop large.
- **Tes jours et tes services les plus forts**.

## Comment les lire

Un taux de remplissage bas un mardi midi n'est pas un problème, c'est un mardi midi. Ce qui compte, c'est son évolution d'un mois sur l'autre, et l'écart entre tes services.

Beaucoup de demandes refusées sur un créneau qui n'est pas plein veut généralement dire que ta capacité déclarée est en dessous de la réalité, ou qu'une salle est marquée « privatisation seulement » alors qu'elle accueille des tables.

Les réservations prises au téléphone comptent comme les autres, à condition que tu les saisisses. Si tes chiffres te paraissent faux, c'est presque toujours par là qu'il faut commencer.
`,
};
