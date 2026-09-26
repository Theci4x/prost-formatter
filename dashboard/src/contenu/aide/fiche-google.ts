import type { Article } from "@/types/aide";

export const article: Article = {
  slug: "fiche-google",
  titre: "Ta fiche Google et tes avis",
  resume:
    "Relier ta fiche, suivre ta note, répondre à tes avis.",
  categorie: "visibilite",
  ordre: 1,
  questions: [
    "Comment relier ma fiche Google ?",
    "Comment répondre à mes avis ?",
    "Où voir ma note Google ?",
  ],
  markdown: `
**Connexions**, puis **Google**.

## Ce que ça apporte

Une fois ta fiche reliée, Klarr peut :

- **relever ta note et ton nombre d'avis**, et les afficher sur ta page de réservation — un client qui voit 4,6 sur 214 avis réserve plus facilement ;
- **lister tes avis** dans **Avis**, et te proposer une réponse rédigée que tu relis, corriges et publies.

## La réponse aux avis

Klarr propose, tu décides. La réponse est **toujours** relue par toi avant publication : un avis négatif mal répondu fait plus de dégâts que le silence.

Le ton s'adapte : un avis à 5 étoiles n'appelle pas la même chose qu'une plainte sur une attente d'une heure. Dans les deux cas la réponse reste courte, concrète, et n'invente aucune excuse.

## Le plus important, et ce n'est pas Klarr

Le champ **« Lien pour les réservations »** de ta fiche Google. Mets-y l'adresse de ta page Klarr.

C'est de loin l'action qui rapporte le plus de couverts, parce que c'est là que les gens cherchent un restaurant. Cinq minutes, une fois.

## Si la connexion n'est pas disponible

La connexion Google demande une validation de Google côté Klarr, en cours. Tant qu'elle n'est pas accordée, le bouton peut refuser de se connecter.

Ça n'empêche rien d'autre : tes réservations, ta carte et ton plan de salle fonctionnent sans Google. Et tu peux dès maintenant coller ton lien de réservation dans ta fiche à la main — c'est le geste qui compte.
`,
};
