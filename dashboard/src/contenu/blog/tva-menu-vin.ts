import type { Billet } from "@/types/blog";

export const billet: Billet = {
  slug: "tva-restaurant-menu-avec-vin-ventilation",
  titre: "TVA : un menu avec un verre de vin ne se taxe pas à 10 %",
  resume:
    "Dès qu'un prix forfaitaire comprend de l'alcool, il faut le ventiler entre deux taux — et le justifier. À défaut, l'administration applique 20 % sur la totalité du menu.",
  categorie: "gerer",
  publieLe: "2026-09-15",
  misAJourLe: "2026-09-15",
  sources: [
    {
      intitule:
        "BOFiP — TVA, taux réduits : ventes à consommer sur place et restauration (BOI-TVA-LIQ-30-20-10-20)",
      url: "https://bofip.impots.gouv.fr/bofip/256-PGP.html/identifiant=BOI-TVA-LIQ-30-20-10-20-20240807",
    },
    {
      intitule:
        "BOFiP — TVA, produits alimentaires et ventes à emporter ou à livrer (BOI-TVA-LIQ-30-10-10)",
      url: "https://bofip.impots.gouv.fr/bofip/2033-PGP.html/identifiant=BOI-TVA-LIQ-30-10-10-20240207",
    },
    {
      intitule:
        "BOFiP — Précisions sur le taux applicable aux boissons alcooliques (loi de finances pour 2020, art. 38)",
      url: "https://bofip.impots.gouv.fr/bofip/11606-PGP.html/ACTU-2020-00195-8",
    },
    {
      intitule:
        "BOFiP — TVA, base d'imposition : subventions et indemnités (BOI-TVA-BASE-10-10-50)",
      url: "https://bofip.impots.gouv.fr/bofip/13552-PGP.html/identifiant=BOI-TVA-BASE-10-10-50-20220511",
    },
    {
      intitule:
        "BOFiP — TVA, fait générateur et exigibilité : prestations de services (BOI-TVA-BASE-20-20)",
      url: "https://bofip.impots.gouv.fr/bofip/283-PGP.html/identifiant=BOI-TVA-BASE-20-20-20181107",
    },
  ],
  essentiel: [
    "Les boissons alcooliques sont à 20 %, sur place comme à emporter. La nourriture servie sur place est à 10 %. Un menu qui mélange les deux doit être ventilé.",
    "La ventilation vous appartient : l'administration attend une méthode économiquement rationnelle que vous puissiez justifier. À défaut, le prix entier est soumis au taux le plus élevé.",
    "Sur un menu à 32 € comprenant un verre de vin, l'écart entre la bonne ventilation et le taux plein est de 2,10 € — et le délai de reprise est de trois ans.",
    "Les arrhes conservées après un no-show sont une indemnité, donc hors champ de la TVA. Un acompte, lui, est dans le champ. Le mot que vous écrivez décide.",
  ],
  markdown: `
« La restauration, c'est 10 %. »

C'est vrai pour la nourriture. Ça ne l'est pas pour l'alcool, et la difficulté commence exactement là où les deux se rencontrent : dans un menu à prix fixe qui comprend un verre de vin.

## Les trois taux, dans l'ordre où on les rencontre

- **10 %** — les ventes à consommer sur place : nourriture et boissons non alcoolisées. Et, depuis 2012, la vente à emporter ou la livraison de produits alimentaires préparés **en vue d'une consommation immédiate**.
- **20 %** — **toutes** les boissons alcooliques, sans exception et sans distinction : sur place, à emporter, livrées. Un verre de vin au comptoir et une bouteille vendue à emporter relèvent du même taux.
- **5,5 %** — les produits alimentaires destinés à une **consommation différée**, c'est-à-dire conditionnés dans des contenants permettant leur conservation. Le pain, une terrine en bocal, un plat sous vide à réchauffer chez soi.

La ligne de partage entre 10 % et 5,5 % n'est donc pas « sur place ou à emporter » : c'est **immédiat ou différé**.

## Le piège : le menu à prix forfaitaire

Vous vendez un menu 32 € comprenant entrée, plat, dessert et un verre de vin. Le client paie un prix unique. Mais ce prix recouvre deux opérations taxées différemment.

**Il faut donc le ventiler.** Et la charge de cette ventilation vous appartient : l'administration attend une méthode **économiquement rationnelle**, que vous soyez en mesure de **justifier**.

::: attention À défaut de ventilation, tout passe à 20 %
C'est la règle qui coûte cher, et elle est simple : lorsque le prix forfaitaire n'est pas correctement ventilé, il est soumis **en totalité** au taux applicable à l'opération la plus taxée.

Autrement dit, faute d'une méthode justifiable, ce n'est pas le verre de vin qui passe à 20 % — c'est le menu entier.
:::

## La méthode, sur un menu à 32 €

Le BOFiP donne une méthode acceptable lorsque les produits du menu sont aussi vendus à la carte : on calcule la part du prix à la carte qui relève du taux réduit, et on applique ce rapport au prix du menu.

Admettons cette carte :

| Produit | Prix TTC à la carte | Taux | Prix HT |
|---|---|---|---|
| Entrée | 9,00 € | 10 % | 8,18 € |
| Plat | 22,00 € | 10 % | 20,00 € |
| Dessert | 8,00 € | 10 % | 7,27 € |
| Verre de vin | 6,00 € | 20 % | 5,00 € |
| **Total à la carte** | | | **40,45 €** |

La part à taux réduit est de 35,45 € sur 40,45 €, soit **87,64 %**. La part à 20 % est donc de **12,36 %**.

On applique ces proportions au menu :

> Prix TTC du menu : 32,00 €
>
> Base à 10 % : 25,21 € → TVA **2,52 €**
> Base à 20 % : 3,56 € → TVA **0,71 €**
>
> TVA totale : **3,23 €**

::: chiffre 2,10 € par menu
La TVA due sans ventilation serait de 5,33 € (32 € au taux plein), contre 3,23 € correctement ventilés.

**Écart : 2,10 € sur chaque menu vendu.** Vingt menus par jour, six jours sur sept, cela fait environ **1 100 € par mois** — et le délai de reprise de l'administration est de **trois ans**.
:::

**Deux précisions sur la méthode :**

- La ventilation s'apprécie **menu par menu**. Il est toutefois admis de retenir une méthode forfaitaire unique pour l'ensemble des menus comportant de l'alcool, **à condition que la proportion d'alcool soit semblable de l'un à l'autre**.
- Si vos produits ne sont pas vendus séparément à la carte, la méthode ci-dessus ne s'applique pas telle quelle. Il vous faut en construire une autre — et pouvoir l'expliquer.

::: exemple Ce qui est réellement contrôlé
On ne vous demandera pas d'avoir trouvé le chiffre exact. On vous demandera de montrer **comment vous êtes arrivé à votre chiffre**.

Une note d'une page, écrite une fois, qui explique la méthode, les prix à la carte retenus et la date du calcul, vaut mieux qu'un pourcentage juste dont personne ne sait d'où il sort. Refaites-la à chaque changement de carte.
:::

## Les autres endroits où ça se joue

- **Le café.** Boisson non alcoolisée : 10 % sur place, et 10 % à emporter puisqu'elle est destinée à une consommation immédiate.
- **La bouteille vendue à emporter.** 20 %, comme au verre. L'alcool ne connaît pas le taux réduit.
- **Le pain, les bocaux, les plats sous vide** vendus pour plus tard : 5,5 %, parce que la consommation est différée.
- **Le même plat chaud à emporter** : 10 %, parce qu'elle ne l'est pas.
- **Les formules du midi avec boisson** : même piège que le menu du soir, en plus fréquent.

## Le lien avec le no-show, que personne ne fait

Voici un point qui vaut une consultation, et qui découle directement de ce que vous écrivez dans vos conditions.

- **Les arrhes conservées** après un désistement ont la nature d'une **indemnité forfaitaire de dédit** : elles réparent un préjudice, elles ne rémunèrent aucune prestation. À ce titre, elles sont **hors du champ de la TVA**.
- **Un acompte**, lui, est un premier versement sur le prix d'une opération à venir. Il est **dans le champ**, et la TVA devient exigible dès l'encaissement.

::: attention Le mot que vous écrivez décide du régime
Deux restaurants qui débitent exactement le même montant pour la même absence peuvent se retrouver dans deux régimes de TVA différents — selon que leurs conditions parlent d'arrhes ou d'acompte.

C'est une raison de plus de l'écrire clairement, et de l'écrire avant d'en avoir besoin.
:::

→ [Le no-show : ce qu'il coûte, et ce qui le réduit vraiment](/blog/no-show-restaurant-cout-empreinte-bancaire)

## Ce qu'il faut vérifier vous-même

- **Votre méthode de ventilation actuelle.** Existe-t-elle ? Quelqu'un sait-il l'expliquer ? Si la réponse est non deux fois, c'est le sujet à traiter cette semaine.
- **Vos formules et menus** qui comprennent une boisson alcoolisée, y compris ceux du midi et les offres de groupe.
- **La rédaction de vos conditions d'annulation** : arrhes ou acompte.
- **Et surtout, votre expert-comptable.** Cet article donne le cadre et l'ordre de grandeur ; il ne remplace pas quelqu'un qui a vos factures sous les yeux. C'est une heure de rendez-vous contre plusieurs milliers d'euros de redressement possible.
`,
};
