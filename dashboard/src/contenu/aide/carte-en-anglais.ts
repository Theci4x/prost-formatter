import type { Article } from "@/types/aide";

export const article: Article = {
  slug: "carte-en-anglais",
  titre: "Ta carte en anglais",
  resume:
    "Une traduction automatique, et la règle qui évite qu'elle te fasse mentir.",
  categorie: "carte",
  ordre: 3,
  questions: [
    "Comment traduire ma carte ?",
    "Mes clients étrangers peuvent-ils lire ma carte ?",
    "Pourquoi un plat reste en français ?",
  ],
  markdown: `
Sur l'écran **Menu**, un bloc **« Ta carte en anglais »** avec un bouton **Traduire en anglais**.

La traduction est faite par Claude, l'intelligence artificielle d'Anthropic. Elle prend quelques secondes.

## Ce qu'elle fait, et ne fait pas

Elle traduit le nom du plat, sa description et sa catégorie. Entrées devient Starters, Plats devient Main courses.

Elle **garde en français ce qui n'a pas de traduction** : les appellations (Saint-Nectaire, Comté, Côtes du Rhône), et les plats passés tels quels en anglais (tartare, foie gras, crème brûlée, confit). Un nom français reconnaissable vaut mieux qu'une traduction littérale qui ne veut rien dire.

Elle **n'invente rien**. Une description absente reste absente. Elle n'ajoute ni ingrédient, ni cuisson, ni accompagnement qui ne soit pas dans ton texte français. C'est essentiel : sur un allergène, une invention ne se rattrape pas.

## Le client choisit sa langue

Sur ta page de carte, deux boutons en haut : **Français** et **English**. Le bouton anglais n'apparaît que si ta carte est réellement traduite — un sélecteur qui renvoie du français est une déception, pas une fonctionnalité.

Les prix, eux, ne changent pas de langue.

## Pourquoi un plat reste en français

**C'est le point important.** Si tu corriges un plat en français après l'avoir traduit, sa version anglaise **ne s'affiche plus** : le client revoit le français.

C'est volontaire. Mieux vaut une carte à moitié bilingue qu'une carte anglaise qui décrit un plat que tu as changé depuis.

Le tableau de bord te le signale : le plat porte une étiquette **« anglais à refaire »**, et le bouton indique combien de plats sont à traduire. Un clic et c'est réglé.

## Le coût

Seuls les plats non traduits, ou dont le français a changé, repartent à la traduction. Une carte de quarante plats ne se retraduit pas en entier parce que tu as corrigé une virgule.
`,
};
