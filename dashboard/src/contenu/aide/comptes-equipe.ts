import type { Article } from "@/types/aide";

export const article: Article = {
  slug: "comptes-equipe",
  titre: "Donner un accès à ton équipe",
  resume:
    "Trois rôles, et ce que chacun voit — ou ne voit pas.",
  categorie: "equipe",
  ordre: 1,
  questions: [
    "Comment ajouter un serveur ?",
    "Comment donner accès à mon gérant ?",
    "Mon serveur peut-il voir mon chiffre d'affaires ?",
  ],
  markdown: `
**Équipe**, dans le menu de gauche de ton établissement. Seul le **propriétaire** peut ajouter ou retirer quelqu'un.

## Les trois rôles

**Propriétaire** — toi. Tout, y compris l'abonnement, Stripe et l'équipe.

**Gérant** — tout le quotidien : réservations, plan de salle, carte, photos, fiche Google, réseaux sociaux. Mais **pas** l'abonnement, **pas** Stripe, **pas** l'équipe.

**Service** — les réservations et l'écran de salle, rien d'autre. Il prend une réservation au téléphone, confirme une demande, place les clients sur le plan, lit la carte. Il ne configure rien.

## Ce que le service ne voit pas

C'est le point qui compte quand on donne un accès à toute une brigade :

- ni ton **abonnement**, ni ton **compte Stripe** ;
- ni les **jetons de connexion** à tes comptes Google, Facebook et TikTok — les montrer à toute la salle reviendrait à les distribuer ;
- il ne peut pas **redessiner le plan**, ni **modifier la carte**, ni **changer tes salles et tes services**.

Il lit la carte, en revanche : c'est ce qu'il récite toute la soirée.

## Ajouter quelqu'un

Tu saisis son **adresse e-mail** et son rôle. Il n'a pas besoin d'avoir déjà un compte : l'accès s'ouvre dès qu'il se connecte avec cette adresse.

Utilise l'adresse qu'il emploiera vraiment. Un accès est lié à une adresse, pas à une personne.

## Retirer quelqu'un

Un membre retiré perd l'accès immédiatement. Les réservations qu'il a prises restent, évidemment : elles appartiennent à l'établissement.

Quand quelqu'un quitte ta maison, retire-le le jour même. C'est la seule habitude à prendre.
`,
};
