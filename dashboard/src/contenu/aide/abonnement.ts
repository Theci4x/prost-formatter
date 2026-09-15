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

Deux modules, **achetables séparément**, et un abonnement par établissement :

- **Klarr — 45 € TTC par mois** : ta fiche Google, tes avis, ta visibilité, ta carte, tes photos et ton site vitrine.
- **Réservations — 35 € TTC par mois** : la page de réservation, le carnet, l'écran de service, le plan de salle, les acomptes et les cautions.

Tu peux prendre l'un sans l'autre. Un second établissement a son propre carnet, sa propre fiche Google et sa propre clientèle : il prend donc ses propres abonnements.

## Les trente premiers jours

Tout est ouvert pendant **30 jours** à la création d'un établissement, sans carte à donner. Le compte à rebours s'affiche sur l'écran Abonnement.

Passé ce délai, les sections d'un module non souscrit se grisent dans le tableau de bord. Ce que tu as saisi reste intact et te reste accessible : la fiche de ton établissement, ton équipe, tes connexions et cette page ne se ferment jamais.

Attention en revanche à tes adresses publiques : **ta page de réservation dépend du module Réservations, ton site vitrine du module Klarr.** Sans le module, l'adresse ne répond plus — mieux vaut ça qu'un client qui réserve dans un carnet que tu ne peux plus ouvrir.

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
