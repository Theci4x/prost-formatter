import type { Article } from "@/types/aide";

export const article: Article = {
  slug: "plan-de-salle",
  titre: "Dessiner ton plan de salle",
  resume:
    "Poser tes tables comme elles sont vraiment, et t'en servir pendant le service.",
  categorie: "salle",
  ordre: 1,
  questions: [
    "Comment dessiner mon plan de salle ?",
    "Comment ajouter une table ?",
    "Est-ce que Klarr refuse une réservation s'il n'y a plus de table ?",
  ],
  markdown: `
**Réservations → Plan de salle.**

## Ce que le plan fait, et ce qu'il ne fait pas

Le plan sert à **placer**, pas à vendre.

Klarr continue d'accepter ou de refuser les réservations **en couverts**. Il ne dira jamais « complet » parce qu'il ne reste plus de table de quatre. C'est voulu : un moteur qui raisonnerait en tables refuserait un groupe de six que tu aurais assis en rapprochant le 4 et le 2 — ce que tu fais tous les soirs.

Le plan répond à l'autre question, celle du chef de rang à 19h30 : **qui est assis où**.

## Poser des tables

La palette de gauche propose des gabarits : rondes de 2 à 8, carrées, rectangles de 4 à 10, banquettes, tables hautes. Un clic pose la table sur le plan, à la première place libre, avec le numéro suivant.

Ensuite :

- **glisse-la** à la souris pour la déplacer, ou sélectionne-la et utilise les **flèches du clavier** ;
- les boutons **⟲** et **⟳** la tournent d'un quart de tour ;
- le panneau de droite permet de changer son **numéro** et son **nombre de places**.

## Les repères

Le bar, l'entrée, la cuisine, les toilettes, un mur, un poteau. Ils n'accueillent personne, mais sans eux ton chef de rang ne reconnaît pas la salle sur l'écran, et le plan ne sert plus à rien. Pose-les comme les tables.

## Annuler, enregistrer

**Annuler** et **Rétablir** défont et refont tes gestes, immédiatement. Rien n'est écrit tant que tu n'as pas cliqué **Enregistrer le plan** — tu peux donc essayer sans risque.

Un bandeau te prévient tant que des modifications ne sont pas enregistrées.

## Deux règles

**Deux tables peuvent se superposer.** On rapproche des tables tous les jours. Klarr le signale en orange, il ne l'interdit pas.

**Deux tables ne peuvent pas porter le même numéro.** « Mets-les au 12 » doit désigner une seule table. Si ça arrive, l'enregistrement est refusé et le numéro en cause est nommé — rien n'est écrit entre-temps.

## Les salles sans plan

Une salle qui ne se loue qu'en entier n'a pas de plan, et c'est normal : quand un groupe la privatise, il n'y a personne à placer. Ces salles sont listées sous le plan avec la raison.

Si tu veux un plan pour une salle, coche « réservations individuelles » sur cette salle dans la configuration.
`,
};
