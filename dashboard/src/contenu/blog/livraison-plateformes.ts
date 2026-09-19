import type { Billet } from "@/types/blog";

export const billet: Billet = {
  slug: "livraison-uber-eats-deliveroo-calcul-marge",
  titre: "Livraison : à partir de quel prix vous perdez de l'argent",
  resume:
    "Personne ne peut vous donner le vrai taux de commission, et c'est le problème. Voici la méthode pour le calculer sur votre propre carte — et pourquoi tous vos plats n'y survivent pas de la même façon.",
  categorie: "gerer",
  publieLe: "2026-09-14",
  misAJourLe: "2026-09-14",
  sources: [
    {
      intitule:
        "BOFiP — TVA, taux réduits : ventes à consommer sur place et restauration",
      url: "https://bofip.impots.gouv.fr/bofip/256-PGP.html/identifiant=BOI-TVA-LIQ-30-20-10-20-20240807",
    },
    {
      intitule: "Service-public Entreprendre — Déclarer et payer la TVA",
      url: "https://entreprendre.service-public.gouv.fr/vosdroits/F23566",
    },
    {
      intitule:
        "DGCCRF — Restaurants : droits et obligations des professionnels",
      url: "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/restaurants-droits-et-obligations-des-professionnels",
    },
    {
      intitule:
        "L'Hôtellerie Restauration — Livraison en 2026 : les plateformes toujours au cœur de la stratégie",
      url: "https://www.lhotellerie-restauration.fr/actualite/livraison-en-2026-les-plateformes-toujours-au-coeur-de-la-strategie",
    },
  ],
  essentiel: [
    "Aucun taux fiable ne circule : les contrats varient, et aucune plateforme ne publie de grille opposable. Cet article donne une méthode, pas un chiffre.",
    "Sur un plat à 18 € vendu au même prix en livraison, la marge passe de 11,36 € à 5,65 €. Il faudrait le vendre 27 € pour retrouver la marge de salle.",
    "Tous vos plats n'y survivent pas pareil : la commission est proportionnelle, le coût matière ne l'est pas. Une carte de livraison est un sous-ensemble choisi, pas votre carte.",
    "Le piège comptable : quand la plateforme facture depuis un autre pays de l'Union, la TVA sur la commission s'autoliquide. L'oublier se paie au contrôle.",
  ],
  image: {
    fichier: "/blog/livraison-plateformes.jpg",
    alt: "Un restaurateur devant son ordinateur, entouré de sacs de livraison en kraft et d'un sac isotherme de coursier, avec des notes sur les commissions et les marges.",
  },
  suite: [
    {
      slug: "reservations-sans-commission-guide-restaurants-independants",
      pourquoi: "La même arithmétique, appliquée aux réservations.",
    },
    {
      slug: "menu-ou-carte-restaurant-marges",
      pourquoi:
        "Ce qui survit à la commission dépend d'abord de ce qu'il y a sur la carte.",
    },
  ],
  markdown: `
**Disons-le tout de suite : nous ne sommes pas neutres.** Klarr vend une page de réservation et de commande sans commission. Nous avons donc un intérêt direct à ce que vous trouviez les commissions des plateformes trop chères.

Lisez ce qui suit avec cette idée en tête — et surtout, refaites les calculs avec vos propres chiffres. C'est tout l'objet de l'article : vous n'avez pas besoin de nous croire, vous avez besoin d'une méthode.

## Ce qu'on ne peut pas vous dire, et pourquoi

Vous avez déjà lu « 30 % de commission » quelque part. Nous aussi. Nous avons cherché la source, et il n'y en a pas de solide.

Les taux annoncés vont d'environ 14 % à 30 % selon la formule — livraison par la plateforme, livraison par vos soins, simple retrait — et varient selon le contrat, la ville, l'ancienneté, et ce que vous avez négocié. Aucune plateforme ne publie de grille sur laquelle on puisse s'appuyer, et aucun rapport public français ne fixe le chiffre.

Alors traitons-le autrement. **Le seul taux qui compte est le vôtre**, et il est sur vos relevés. Cet article vous donne ce qu'on peut donner : la liste de ce qui compose le coût réel, et le calcul à faire ensuite.

## Les six lignes qui font le coût réel

Ce que vous payez n'est jamais la seule commission de base :

1. **La commission**, selon la formule choisie.
2. **Les frais de service et d'encaissement**, qui s'ajoutent à la commission.
3. **Les promotions partagées** — le « 1 acheté, 1 offert » que vous financez en partie.
4. **La publicité sur la plateforme.** Le classement se paie ; ne pas payer, c'est descendre.
5. **Les litiges non contestés.** Une commande remboursée au client reste à votre charge si vous ne contestez pas dans le délai. Ce délai est court, et personne ne le surveille un samedi soir.
6. **L'emballage.**

::: attention La ligne qu'on oublie toujours
L'emballage. En salle, l'assiette, le verre et les couverts sont un matériel amorti : ils reviennent en plonge et resservent le lendemain. En livraison, tout part avec le client, à chaque commande.

Selon ce que vous servez, comptez entre 0,50 € et 1,50 € par commande. Sur une marge déjà entamée par la commission, ce n'est plus un détail — et ça n'apparaît sur aucun relevé de plateforme, puisque c'est vous qui l'achetez.
:::

## Le calcul, sur un plat

Prenons un plat vendu **18 € en salle**, TVA à 10 %, coût matière 5,00 €.

| | En salle | En livraison |
|---|---|---|
| Prix affiché | 18,00 € | 18,00 € |
| Prix HT | 16,36 € | 16,36 € |
| Commission (30 % du HT) | — | − 4,91 € |
| Coût matière | − 5,00 € | − 5,00 € |
| Emballage | — | − 0,80 € |
| **Il vous reste** | **11,36 €** | **5,65 €** |

::: chiffre 5,65 € contre 11,36 €
Le même plat, le même prix affiché, le même travail en cuisine. Ce n'est pas une marge qui baisse : c'est une marge divisée par deux.
:::

**Alors à quel prix faudrait-il le vendre ?** On cherche le prix qui laisse les mêmes 11,36 € :

> (Marge visée + coût matière + emballage) ÷ (1 − taux), puis on ajoute la TVA.
>
> (11,36 + 5,00 + 0,80) ÷ 0,70 = 24,51 € HT, soit **27 € TTC**.

Soit **+50 % sur le prix de salle**.

Et voilà la vraie question, qu'aucun article indigné ne pose : *est-ce que quelqu'un commande votre plat à 27 € quand celui d'à côté est à 18 € ?* Non. Donc en pratique, on ne retrouve pas sa marge. On arbitre.

::: exemple La méthode, à faire sur vos cinq plats les plus vendus
1. **Marge en salle** = prix HT − coût matière.
2. **Reste en livraison** = prix HT × (1 − votre taux) − coût matière − emballage.
3. **Prix de livraison à marge égale** = (marge salle + coût matière + emballage) ÷ (1 − votre taux), puis + TVA.

Une heure avec votre carte et vos fiches techniques. Vous serez surpris : ils ne réagissent pas tous pareil, et deux d'entre eux n'ont probablement rien à faire sur la plateforme.
:::

## Pourquoi vos plats n'y survivent pas pareil

C'est le point que presque personne n'explique, et c'est le plus utile.

**La commission est proportionnelle au prix. Le coût matière, non.** Deux plats vendus au même prix, avec des coûts matière différents, sortent de la livraison dans des états très différents :

| Plat à 18 € | Coût matière | Marge en salle | Reste en livraison | Ce qui survit |
|---|---|---|---|---|
| Faible coût matière | 3,00 € | 13,36 € | 7,65 € | **57 %** |
| Fort coût matière | 7,00 € | 9,36 € | 3,65 € | **39 %** |

Le plat à faible coût matière garde plus de la moitié de sa marge. Celui à fort coût matière en perd presque deux tiers.

C'est pour ça que les pâtes, les pizzas et les bols tiennent en livraison, et pas une belle pièce de poisson. Ce n'est pas une question de transport ni de goût : c'est de l'arithmétique.

**Conséquence : une carte de livraison n'est pas votre carte.** C'est un sous-ensemble, choisi pour cette raison précise — et c'est exactement ce que font les maisons qui gagnent de l'argent en livraison.

## Le piège comptable dont personne ne parle

Trois choses à savoir, et la troisième coûte cher :

- **Ce que le client paie pour la livraison n'est pas votre chiffre d'affaires.** Ne le comptez pas dedans.
- **La commission est une prestation de service à 20 %**, déductible comme une autre charge.
- **Et selon l'entité qui vous facture, la TVA sur cette commission s'autoliquide.** Quand la facture vient d'une société établie dans un autre pays de l'Union, ce n'est pas elle qui vous facture la TVA française : c'est vous qui la déclarez *et* la déduisez, sur votre propre déclaration. Quand la facture vient d'une entité française, la TVA y figure et se déduit simplement.

L'oubli de l'autoliquidation ne se voit pas tout de suite. Il se voit au contrôle, et il se régularise avec les intérêts.

**Ce qui décide, c'est l'entité qui émet votre facture, pas le nom de l'application.** Sortez une facture de commission, regardez qui la signe et depuis quel pays, et posez la question à votre expert-comptable. Dix minutes.

## Ce que les plateformes apportent vraiment

Un article honnête doit dire ça aussi, sans quoi il n'est qu'un argumentaire :

- **Du volume à des heures creuses.** Une cuisine allumée à 15 h avec un cuisinier payé produit zéro euro. Un plat à 5,65 € de marge n'est pas une bonne affaire, mais c'est mieux que rien.
- **De la découverte.** Des gens qui ne connaissaient pas votre nom vous essaient. Une partie reviendra en salle.
- **Zéro coût d'acquisition et zéro logistique.** Vous ne payez ni publicité ni livreur ni assurance. Vous payez un pourcentage sur ce qui passe, et rien quand rien ne passe.
- **De la trésorerie régulière**, ce qui n'est pas rien quand la salle est irrégulière.

La bonne question n'est donc pas « plateforme ou pas ». C'est : **quels plats, à quelles heures, à quel prix.**

## Ce que vous n'y gagnez pas

- **Le client n'est pas le vôtre.** Vous ne connaissez ni son nom, ni son adresse, ni son historique. Vous ne pouvez pas le faire revenir sans repasser par la plateforme — et payer à nouveau.
- **Le classement se paie.** La visibilité n'est pas acquise : elle s'achète, en publicité et en promotions financées par vous.

::: attention La porte que presque personne n'utilise
Les clauses de parité tarifaire des plateformes visent en général **les plateformes concurrentes** : on vous interdit d'être moins cher ailleurs sur une application rivale. Elles ne visent pas votre propre canal de commande directe.

Autrement dit, vous avez le droit d'être moins cher chez vous que sur l'application — et de le dire à vos clients, sur votre carte, sur votre site, sur le sac. La plupart des restaurateurs ne l'utilisent jamais.

Les clauses évoluent : vérifiez la rédaction exacte de votre contrat en cours avant de vous appuyer dessus.
:::

## Ce qu'il faut vérifier vous-même

- **Votre taux réel**, sur vos relevés des trois derniers mois — pas celui d'un article, le nôtre compris.
- **La base de calcul** : la commission porte-t-elle sur le HT ou sur le TTC ? Le contrat le dit, et ça change le résultat.
- **Le délai de contestation des litiges**, et qui le surveille chez vous.
- **L'autoliquidation**, avec votre expert-comptable, facture en main.
- **Les clauses de parité** de votre contrat en cours.

---

Sur la construction d'une carte et le chiffre qu'il faut vraiment regarder :
[Menu ou carte : ce que votre choix fait à vos marges](/blog/menu-ou-carte-restaurant-marges).
`,
};
