import type { Article } from "@/types/aide";

export const article: Article = {
  slug: "connecter-stripe",
  titre: "Connecter ton compte Stripe",
  resume:
    "Encaisser des acomptes sur ton propre compte, sans commission Klarr.",
  categorie: "argent",
  ordre: 1,
  questions: [
    "Comment encaisser des acomptes ?",
    "Klarr prend combien de commission ?",
    "Où va l'argent de mes clients ?",
  ],
  markdown: `
**Paiements**, dans le menu de gauche de ton établissement.

## Ce que c'est

Tu connectes **ton propre compte Stripe**. Pas celui de Klarr.

Concrètement : l'argent de tes clients arrive directement chez toi, sur ton compte, avec tes virements et ton calendrier. Klarr ne le détient jamais et ne fait pas transiter un euro.

Si tu n'as pas encore de compte Stripe, tu en crées un au passage — c'est gratuit, et ça prend une dizaine de minutes avec un IBAN et un justificatif d'identité.

## Ce que Klarr prélève

**Rien.** Zéro commission par couvert, zéro commission sur les acomptes.

Ce n'est pas une promesse commerciale, c'est une propriété du montage : Klarr n'est pas un intermédiaire de paiement et n'a techniquement pas la main pour se servir au passage. Tu paies ton abonnement, point.

Stripe, lui, prélève ses frais habituels sur les encaissements — c'est son métier et c'est entre lui et toi.

## Ce que tu gardes

Comme c'est ton compte :

- tu as **ton tableau de bord Stripe**, avec tous les paiements ;
- tu fais **tes remboursements** toi-même, quand tu veux ;
- tu gères **tes litiges** directement ;
- tes **virements** suivent ton calendrier habituel.

## Une fois connecté

Les acomptes et les cautions deviennent disponibles dans la configuration de tes salles. Tant que Stripe n'est pas relié, Klarr ne propose pas de réclamer de l'argent — il ne saurait pas où l'envoyer.

Seul le **propriétaire** de l'établissement peut relier ou délier Stripe. Un gérant voit que c'est connecté, il ne peut pas y toucher.
`,
};
