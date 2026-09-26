import type { Article } from "@/types/aide";

export const article: Article = {
  slug: "demandes-reservation",
  titre: "Accepter ou refuser une demande",
  resume:
    "Ce qui se passe entre le moment où un client demande une table et celui où il l'a.",
  categorie: "reservations",
  ordre: 1,
  questions: [
    "Comment je confirme une réservation ?",
    "Pourquoi une demande bloque mon créneau ?",
    "C'est quoi une option qui expire ?",
    "Est-ce que le client reçoit un e-mail de confirmation ?",
  ],
  markdown: `
Quand un client remplit ton formulaire, il envoie une **demande**. Elle n'est pas confirmée tant que tu ne l'as pas tranchée : c'est toi qui décides, pas Klarr.

## Où les voir

Dans **Réservations**. Les demandes en attente sont en haut, sur fond orange, avec deux boutons : accepter ou refuser.

Elles apparaissent aussi sur l'**écran de service** du jour concerné, dans « En attente de ta réponse ».

## L'option qui expire

Une demande non tranchée **bloque le créneau**. C'est volontaire : sans ça, tu pourrais confirmer deux groupes pour la même salle au même moment.

Mais elle ne le bloque pas indéfiniment. Chaque demande pose une **option** qui expire toute seule. Passé ce délai, le créneau se rouvre à la vente, et la demande passe en « expirée ».

C'est ce qui évite que trois curieux gèlent tes trois salles d'un vendredi soir parce que tu n'as pas ouvert ton téléphone.

## Ce que voit le client

Il est prévenu par e-mail, tout seul. Quand tu acceptes, Klarr lui écrit que sa réservation est confirmée — et si la salle demande un acompte ou une empreinte bancaire, c'est le **lien de paiement** qui part à la place : accepter et réclamer l'argent sont le même geste.

La veille, un **rappel** part également, avec un lien pour annuler en un clic. C'est le deuxième levier contre les tables vides : celui qui ne peut plus venir le dit pendant qu'il te reste une soirée pour la revendre.

Son adresse et son téléphone restent sur la demande, cliquables, si tu préfères l'appeler.

## Annuler après coup

Une réservation confirmée peut être annulée depuis la même liste. Le créneau se rouvre immédiatement.

Si elle portait un acompte déjà encaissé, le remboursement se fait depuis ton tableau de bord Stripe : c'est ton compte, c'est ta décision, Klarr ne touche pas à l'argent de tes clients.
`,
};
