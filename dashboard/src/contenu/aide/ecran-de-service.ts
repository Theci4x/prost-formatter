import type { Article } from "@/types/aide";

export const article: Article = {
  slug: "ecran-de-service",
  titre: "L'écran de service",
  resume:
    "L'écran du jour : combien de couverts, qui vient, qui reste à placer.",
  categorie: "reservations",
  ordre: 3,
  questions: [
    "Où voir les réservations du jour ?",
    "Comment savoir combien de couverts ce soir ?",
    "Quel écran ouvrir pendant le service ?",
  ],
  markdown: `
C'est l'écran à ouvrir en arrivant, et à laisser ouvert pendant le service. Il ne montre qu'une journée.

## Ce qu'il annonce en haut

Le chiffre que le chef veut en arrivant : **combien de couverts attendus**. À côté, le nombre de réservations, et le nombre de demandes encore à trancher.

Les flèches **Veille** et **Lendemain** te déplacent d'un jour. **Aujourd'hui** te ramène.

## Service par service, salle par salle

Pour chaque service qui tourne ce jour-là, tu vois chacune de tes salles avec :

- sa jauge — combien de couverts pris sur combien, en rouge quand c'est complet ;
- ton **plan de salle**, si tu l'as dessiné, avec le nom de qui occupe chaque table ;
- la liste des convives attendus, avec leur téléphone et leurs notes.

## Placer

Si tu as dessiné ton plan, chaque réservation porte un menu **Table**. Tu y assignes le groupe, et son nom apparaît aussitôt sur le plan.

Le menu ne propose que les tables possibles : celles de la bonne salle, encore libres sur ce service. Un badge en haut du service compte ce qu'il te reste **à placer**.

Tu peux asseoir huit personnes à une table de deux — on rapproche des tables tous les jours — mais Klarr te le signale en orange, pour que ce soit un choix et pas un oubli.

## Un jour fermé

Si tu as posé une fermeture sur ce jour, un bandeau le dit. Les convives déjà attendus **restent affichés** : ce sont eux qu'il te reste à prévenir.
`,
};
