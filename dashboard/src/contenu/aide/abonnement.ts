import type { Article } from "@/types/aide";

export const article: Article = {
  slug: "abonnement",
  titre: "Ton abonnement",
  resume: "Ce que tu paies, ce que tu ne paies pas, et comment arrêter.",
  categorie: "argent",
  ordre: 4,
  questions: [
    "Combien coûte Klarr ?",
    "Comment résilier ?",
    "Y a-t-il une commission par couvert ?",
  ],
  markdown: `
**Abonnement**, dans le menu de gauche. Seul le propriétaire de l'établissement y a accès.

## Ce que tu paies

Un abonnement mensuel par établissement :

- **Klarr — 45 € TTC par mois** : ta fiche Google, tes avis, ta visibilité, ta carte, tes photos.
- **Réservations — 35 € TTC par mois** : la page de réservation, l'écran de service, le plan de salle, les acomptes et les cautions.

## Ce que tu ne paies pas

**Aucune commission par couvert.** Jamais.

C'est la différence de fond avec les places de marché. Chez elles, plus tu remplis, plus tu paies — et les clients qu'elles t'amènent deviennent leurs clients. Ici, un vendredi complet ne coûte pas un centime de plus qu'un mardi vide, et tes clients restent les tiens.

Les frais Stripe sur les acomptes que tu encaisses sont ceux de Stripe, entre lui et toi. Klarr ne se sert pas au passage.

## Changer ou arrêter

Depuis le même écran. La résiliation prend effet à la fin de la période en cours : tu gardes l'accès jusqu'au terme que tu as déjà payé.

Tes données restent les tiennes. Tu peux demander leur suppression à tout moment — la procédure est décrite sur la page **Suppression des données**.

## Facturation

Les factures sont émises par **EDIREF**, la société qui édite Klarr, et disponibles depuis ton espace de facturation Stripe.
`,
};
