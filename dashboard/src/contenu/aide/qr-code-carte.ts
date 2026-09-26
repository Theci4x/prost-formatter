import type { Article } from "@/types/aide";

export const article: Article = {
  slug: "qr-code-carte",
  titre: "Le QR code de ta carte",
  resume:
    "Un code à poser sur les tables, qui ouvre ta carte sur le téléphone du client.",
  categorie: "carte",
  ordre: 2,
  questions: [
    "Comment avoir un QR code pour ma carte ?",
    "Comment imprimer mon QR code ?",
    "Mon QR code ne marche pas",
  ],
  markdown: `
Dès que ta carte est publiée, Klarr fabrique son **QR code** tout seul. Il est sur l'écran **Menu**, sous le bloc de publication.

## Ce qu'il ouvre

L'adresse de ta carte entière : **klarr.net/carte/ton-restaurant**. Le client scanne avec l'appareil photo de son téléphone, rien à installer.

Cette page est faite pour être lue debout, sur un petit écran : les plats, leurs photos, leurs prix, et un bouton pour réserver une prochaine fois.

## L'imprimer

Deux téléchargements :

- **PNG** — c'est ce qu'attendent les imprimeurs et les outils de mise en page comme Canva. Prends celui-là par défaut.
- **SVG** — du vectoriel, qui reste net quelle que soit la taille. Donne celui-ci à ton imprimeur si tu fais faire des chevalets de table.

## Conseils d'impression

Ne le fais pas trop petit : 3 cm de côté est un minimum confortable sur une table.

Laisse du blanc autour. Un QR collé bord à bord dans un cadre se scanne mal.

Le code supporte d'être un peu abîmé — il est fabriqué avec une correction d'erreur qui encaisse environ 15 % de dégâts. Une tache de sauce ne le tue pas ; un coin arraché, si.

## S'il ne mène nulle part

Le QR n'existe que si ta carte est **publiée**. Si tu la retires de ta page, l'adresse cesse de répondre et le téléchargement aussi — un QR posé sur trente tables qui mène à une page vide est pire que pas de QR du tout.

Donc si le tien ne marche plus : vérifie d'abord que ta carte est toujours publiée.

Bonne nouvelle : **l'adresse ne change jamais**. Tu peux modifier ta carte autant que tu veux, ajouter des plats, changer les prix — le QR déjà imprimé reste valable.
`,
};
