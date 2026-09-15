import type { Article } from "@/types/aide";

export const article: Article = {
  slug: "fermetures",
  titre: "Fermer un jour ou une période",
  resume:
    "Congés, jour férié, salle déjà prise : bloquer sans défaire ta configuration.",
  categorie: "salle",
  ordre: 2,
  questions: [
    "Comment bloquer un jour ?",
    "Je pars en vacances, comment je ferme ?",
    "Comment fermer une seule salle ?",
  ],
  markdown: `
**Réservations → Espaces, services et page publique**, section **Fermetures**.

## Pourquoi passer par là

La tentation, quand on part en vacances, c'est de supprimer ses services. C'est une mauvaise idée : au retour il faut tout ressaisir, et les réservations déjà prises sur ces services se retrouvent orphelines.

Une fermeture est faite pour ça. Tu poses une période, plus rien ne s'y réserve — ni en ligne ni au téléphone — et **ta configuration reste intacte**. Tu n'as rien à défaire au retour.

## Ce que tu saisis

- **Du / Au** — laisse la date de fin vide pour fermer un seul jour.
- **Ce qui ferme** — tout l'établissement, ou une seule salle. Une privatisation traitée hors Klarr, un chantier dans la cave : tu fermes la salle concernée, le reste continue de tourner.
- **Un motif** — il est **affiché au client** sur ta page de réservation. « Congés d'été » vaut mieux qu'une case vide qui donne l'impression d'un bug.

## Ce que voit le client

Sur un jour fermé, ta page n'affiche pas tes services barrés un par un : elle dit que c'est fermé, et pourquoi. Lister des créneaux indisponibles donne l'impression qu'on pourrait insister quelque part.

## Si tu fermes après coup

Tu peux fermer un jour sur lequel des convives sont déjà attendus. Klarr ne les efface pas et ne les prévient pas tout seul : l'écran de service affiche un bandeau et **garde la liste visible**, pour que tu saches qui rappeler.

## Rouvrir

Le bouton **Rouvrir** en face de la fermeture. Le créneau redevient réservable aussitôt.
`,
};
