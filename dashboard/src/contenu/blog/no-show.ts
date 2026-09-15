import type { Billet } from "@/types/blog";

export const billet: Billet = {
  slug: "no-show-restaurant-cout-empreinte-bancaire",
  titre: "Le no-show : ce qu'il coûte, et ce qui le réduit vraiment",
  resume:
    "Personne ne connaît son taux réel, et les chiffres qui circulent ne valent rien. Le calcul à faire sur votre salle, ce que dit la loi sur l'empreinte bancaire, et pourquoi le SMS de rappel ne sert pas à rappeler.",
  categorie: "gerer",
  publieLe: "2026-09-14",
  misAJourLe: "2026-09-14",
  sources: [
    {
      intitule:
        "Code de la consommation, articles L214-1 à L214-3 (arrhes et acomptes)",
      url: "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000032226992",
    },
    {
      intitule: "DGCCRF — Acompte, arrhes, avoir",
      url: "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/acompte-arrhes-avoir",
    },
    {
      intitule: "CNIL — Le paiement à distance par carte bancaire",
      url: "https://www.cnil.fr/fr/le-paiement-distance-par-carte-bancaire",
    },
    {
      intitule:
        "CNIL — Délibération n° 2018-303 : traitement des données de carte de paiement à distance",
      url: "https://www.cnil.fr/sites/default/files/atoms/files/recommandation_-_traitements_de_donnees_de_la_carte_de_paiement_pour_la_vente_de_biens_et_la_fourniture_de_services_a_distance.pdf",
    },
    {
      intitule:
        "DGCCRF — Restaurants : droits et obligations des professionnels",
      url: "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/restaurants-droits-et-obligations-des-professionnels",
    },
  ],
  essentiel: [
    "Les taux qui circulent — 10 %, 14 %, jusqu'à 50 % — viennent tous de sources commerciales. Le seul qui compte est le vôtre, et il se compte en un mois.",
    "Un no-show ne vous coûte pas le prix du repas : il vous coûte la marge, et la place que vous n'avez pas donnée à quelqu'un d'autre. Sur une salle de 40 couverts, l'ordre de grandeur est de 2 300 € par mois.",
    "L'empreinte bancaire n'est pas un paiement, et elle est légale — à condition d'annoncer le montant avant, de ne jamais stocker la carte vous-même, et de savoir si vous encaissez des arrhes ou un acompte : la loi ne leur fait pas le même sort.",
    "Le SMS de confirmation ne sert pas à rappeler. Il sert à rendre l'annulation facile : une table annulée à 17 h se revend, un no-show à 20 h 30 ne se revend pas.",
  ],
  image: {
    fichier: "/blog/no-show.jpg",
    alt: "Un restaurateur devant un cahier de réservations couvert de mentions « no-show », dans une salle vide aux chaises encore relevées.",
  },
  markdown: `
Demandez à dix restaurateurs leur taux de no-show. Dix vous répondront « beaucoup ». Aucun ne vous donnera un chiffre.

C'est le problème central, et il précède tous les autres : on ne peut pas traiter ce qu'on ne mesure pas. Les taux qui circulent — 10 %, 14 %, jusqu'à 30 ou 50 % selon les établissements — viennent tous d'éditeurs de logiciels qui vendent la solution au problème qu'ils chiffrent. Nous n'avons trouvé aucune étude publique française sur laquelle s'appuyer.

Alors commençons par ça.

## Mesurer, avant de traiter

Pendant un mois, sur chaque réservation, une seule colonne de plus, avec quatre valeurs :

- **honorée**
- **annulée à temps** (assez tôt pour que la table soit reprise)
- **annulée tard**
- **no-show**

Au bout d'un mois vous avez votre taux — et surtout, vous avez autre chose de bien plus utile : **sa répartition**.

::: exemple Ce que vous allez trouver
Le no-show n'est presque jamais uniforme. Il se concentre :

- sur les **réservations prises longtemps à l'avance** — plus le délai est long, plus la vie s'est passée entre-temps ;
- sur les **groupes**, où la décision d'annuler n'appartient à personne en particulier ;
- sur les **créneaux de pointe** — vendredi et samedi soir —, c'est-à-dire précisément là où la place coûte le plus cher.

Ces trois faits, une fois établis sur vos chiffres, changent tout : ils disent où mettre une garantie, et surtout où ne pas en mettre.
:::

## Ce qu'il coûte vraiment

Un no-show ne vous coûte pas le prix du repas. Il vous coûte **la marge** sur ce repas — et la place que vous n'avez pas donnée à quelqu'un d'autre.

Prenons une salle de 40 couverts, un ticket moyen de 35 €, un coût matière à 30 %, et un taux de no-show de 10 % sur le service du soir :

| | |
|---|---|
| Couverts perdus par service | 4 |
| Ticket moyen TTC | 35,00 € |
| Ticket HT (TVA 10 %) | 31,82 € |
| Coût matière (30 %) | − 9,55 € |
| **Marge par couvert** | **22,27 €** |
| **Perte par service** | **89 €** |

::: chiffre ≈ 2 300 € par mois
89 € par service, six services par semaine : environ 534 € par semaine, soit **près de 2 300 € par mois** de marge qui ne rentre pas.

Et ce calcul est **optimiste**. Il ne compte ni la matière préparée pour rien, ni le personnel dimensionné sur une salle pleine, ni les clients à qui vous avez dit non pendant que la table attendait.
:::

Refaites-le avec vos chiffres. La méthode pour établir une marge par couvert est la même que pour un plat :
[Menu ou carte : ce que votre choix fait à vos marges](/blog/menu-ou-carte-restaurant-marges).

## Le surbooking : un outil, pas une solution

La tentation est immédiate : si 10 % ne viennent pas, prenons 10 % de plus.

Ça marche **dans une salle qui tourne**. Une brasserie de cent couverts avec deux services et un flux continu absorbe quatre personnes de trop : elles attendent dix minutes au bar et c'est réglé.

Ça ne marche pas dans une petite salle à un seul service. Quatre personnes debout dans un restaurant de trente couverts un samedi soir, c'est une soirée gâchée pour elles, une pression inutile sur l'équipe, et un avis en ligne qui vous coûtera plus cher que les quatre couverts.

**Le surbooking est un outil de rotation, pas un outil de remplissage.** Si vous ne faites qu'un service, oubliez-le.

## L'empreinte bancaire : ce que la loi dit vraiment

C'est le sujet où l'on entend le plus de bêtises, alors prenons-le dans l'ordre.

**Une empreinte n'est pas un paiement.** C'est une autorisation : la carte est vérifiée, un montant est éventuellement bloqué, rien n'est débité. Si le client vient, la garantie est libérée et il ne s'est rien passé. S'il ne vient pas, vous pouvez débiter le montant **annoncé à l'avance**.

**Annoncé à l'avance, et accepté.** C'est la condition de validité. Un montant qui apparaît après coup, ou une pénalité sans rapport avec le préjudice, c'est une clause qu'on ne pourra pas opposer au client.

::: attention Arrhes ou acompte : la loi ne leur fait pas le même sort
À défaut de précision, **les sommes versées d'avance sont des arrhes**. Et les arrhes fonctionnent dans les deux sens :

- le **client** qui renonce les perd ;
- **vous**, si vous annulez, devez en **restituer le double**.

L'**acompte**, lui, engage fermement les deux parties : si un groupe de vingt annule la veille, vous êtes en droit de réclamer le prix convenu.

La différence ne tient qu'à un mot dans vos conditions, et personne ne le sait avant d'en avoir besoin. Écrivez-le noir sur blanc, et écrivez-le avant d'en avoir besoin.
:::

**Et surtout : ne stockez jamais la carte vous-même.** La CNIL est claire — les données de carte n'ont pas à être conservées au-delà de la transaction, et le cryptogramme ne doit jamais l'être après la première opération. Un numéro de carte noté dans le cahier de réservations, dans un tableur ou dans un courriel est une faute, doublée d'un risque : ce sont vos clients qui paieront la fuite, et vous qui répondrez.

La carte doit vivre chez un prestataire de paiement, et vous ne devez jamais voir autre chose que les quatre derniers chiffres.

## Ce que la garantie coûte aussi

Un article honnête doit le dire : **l'empreinte bancaire dissuade les no-shows, et elle dissuade aussi les réservations.**

Une partie de vos clients renoncera plutôt que de donner sa carte pour dîner à deux un mardi. C'est un arbitrage, et il dépend entièrement de votre situation :

- une maison **pleine tous les soirs** peut se le permettre : elle échange quelques réservations contre une salle fiable ;
- une maison **qui construit encore sa clientèle** ne peut pas : elle a besoin de chaque réservation, y compris de celles qui ne viendront pas.

D'où l'intérêt de la mesure du début : **ciblez la garantie là où le no-show se concentre.** Les groupes à partir d'un certain nombre de couverts, les créneaux de pointe, les privatisations. Demander une carte à deux personnes un mardi soir vous coûte plus de réservations que ça ne vous en sauve.

## Le SMS de confirmation ne sert pas à rappeler

C'est le contresens le plus répandu. On envoie un message pour que le client « n'oublie pas ». Or le client qui ne vient pas n'a presque jamais oublié : il a changé d'avis, il est coincé, il a un empêchement — et il n'ose pas appeler pendant le service.

**Le message ne sert pas à rappeler. Il sert à rendre l'annulation facile.**

Une table annulée à 17 h se revend. Un no-show à 20 h 30 ne se revend pas. Tout ce qui transforme le second en premier vous rapporte de l'argent.

Trois conséquences pratiques :

- **Le moment.** Trop tôt, le message est oublié. Trop tard, l'annulation ne vous sert plus à rien. Le matin du jour même, ou la veille au soir, laisse le temps de reprendre la table.
- **La formulation.** « À ce soir ! » n'appelle pas de réponse. « Confirmez ou annulez » en appelle une. Posez une question, vous aurez une réponse ; faites une déclaration, vous n'aurez rien.
- **Un geste, pas un appel.** Si annuler suppose de téléphoner pendant le coup de feu, personne n'annule — on ne vient pas, c'est plus simple. Un lien, un bouton, deux secondes.

## Ce qu'il faut vérifier vous-même

- **Votre taux et sa répartition**, sur un mois de vos propres réservations. Tout le reste en découle.
- **La rédaction de vos conditions** : arrhes ou acompte, montant, délai d'annulation. Faites-les relire une fois plutôt que de recopier un modèle trouvé en ligne.
- **Où vivent les données de carte** chez votre prestataire, et ce que vous en voyez.
- **Votre situation commerciale** avant d'imposer une garantie : elle se paie en réservations perdues, et ce prix n'est pas le même pour tout le monde.
`,
};
