import type { Article } from "@/types/aide";

export const article: Article = {
  slug: "acompte-privatisation",
  titre: "Réclamer un acompte",
  resume:
    "Faire payer une avance sur une privatisation, et savoir où elle en est.",
  categorie: "argent",
  ordre: 2,
  questions: [
    "Comment demander un acompte ?",
    "Comment faire payer une avance sur une privatisation ?",
    "Où voir les acomptes à encaisser ?",
  ],
  markdown: `
Un acompte est une somme **réellement encaissée** avant le service. Il ne se réclame que sur les **privatisations** : une table de deux ne bloque pas une salle, lui demander une avance ferait fuir sans rien protéger.

Il faut que **Stripe soit connecté**.

## Le régler

Dans la configuration de la salle, choisis la garantie **Acompte**, puis le montant, sous deux formes :

- **Forfait** — une somme fixe, quel que soit le nombre de convives. « 300 € pour la cave. »
- **Par couvert** — le montant est multiplié par le nombre de convives. « 20 € par personne. »

Une salle demande un acompte **ou** une caution, jamais les deux.

## Comment ça se passe

1. Un groupe demande la privatisation.
2. Tu acceptes la demande.
3. La réservation apparaît dans **« Acomptes à encaisser »**, sur la page Réservations.
4. Tu y récupères un **lien de paiement** à envoyer au client.
5. Il paie par carte, sur une page Stripe sécurisée. L'argent arrive sur ton compte.
6. La réservation passe en acompte payé.

Pour l'instant, **l'envoi du lien est à ta charge** : Klarr ne l'expédie pas encore automatiquement par e-mail. Tu le copies et tu l'envoies par le canal que tu veux — mail, SMS, WhatsApp. C'est en cours.

## Suivre

Chaque réservation avec acompte affiche son état : attendu, payé, remboursé. Tant qu'un acompte est attendu, la salle reste bloquée : tu as accepté, tu tiens ta promesse.

## Rembourser

Depuis **ton** tableau de bord Stripe. C'est ton argent et ton client : Klarr ne décide pas à ta place d'un remboursement.
`,
};
