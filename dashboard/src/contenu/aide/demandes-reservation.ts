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

Pour l'instant, rien d'automatique : **Klarr n'envoie pas encore d'e-mail de confirmation**. Tant que l'envoi d'e-mails n'est pas branché, c'est à toi de rappeler ou d'écrire au client. Son adresse et son téléphone sont sur la demande, cliquables.

C'est la limite la plus visible du produit aujourd'hui, et elle est en cours.

## Annuler après coup

Une réservation confirmée peut être annulée depuis la même liste. Le créneau se rouvre immédiatement.

Si elle portait un acompte déjà encaissé, le remboursement se fait depuis ton tableau de bord Stripe : c'est ton compte, c'est ta décision, Klarr ne touche pas à l'argent de tes clients.
`,
};
