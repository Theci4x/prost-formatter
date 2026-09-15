import type { Article } from "@/types/aide";

export const article: Article = {
  slug: "combien-ca-coute",
  titre: "Combien coûte Klarr ?",
  resume: "Les tarifs, ce qui est inclus, et ce qui ne l'est pas.",
  categorie: "decouvrir",
  ordre: 2,
  questions: [
    "Combien ça coûte ?",
    "Quel est le prix ?",
    "Y a-t-il un engagement ?",
    "Y a-t-il des frais cachés ?",
  ],
  markdown: `
Deux abonnements mensuels, par établissement, que vous prenez ensemble ou séparément :

- **Klarr — 45 € TTC par mois.** Votre fiche Google, vos avis et les réponses proposées, votre visibilité dans les IA, votre carte avec photos, QR code et traduction anglaise, vos photos et vos réseaux sociaux.
- **Réservations — 35 € TTC par mois.** Votre page de réservation publique, l'écran de service, le plan de salle, les fermetures, les privatisations, les acomptes et les cautions, les expériences, les comptes d'équipe.

Soit **80 € TTC par mois** pour l'ensemble.

## Ce qui n'est pas facturé

**Aucune commission par couvert.** Jamais, quel que soit votre remplissage.

Aucun frais d'installation, aucun frais de mise en service, aucun engagement de durée. Vous résiliez quand vous voulez, et l'accès court jusqu'à la fin de la période déjà payée.

Le nombre de réservations, de salles, de tables, de plats et de membres d'équipe n'est pas limité.

## Ce qui peut s'ajouter

**Les frais Stripe**, uniquement si vous encaissez des acomptes. Ce sont les frais de Stripe sur votre propre compte, entre Stripe et vous : Klarr ne prélève rien au passage et ne voit pas cet argent.

Si vous n'encaissez pas d'acompte, il n'y a rien d'autre à payer que l'abonnement.

## Plusieurs établissements

L'abonnement est par établissement. Deux adresses, deux abonnements — mais un seul compte pour les gérer côte à côte.

## La facturation

Les factures sont émises par **EDIREF** et disponibles depuis votre espace de facturation. Vous y changez aussi votre moyen de paiement et vous y résiliez.
`,
};
