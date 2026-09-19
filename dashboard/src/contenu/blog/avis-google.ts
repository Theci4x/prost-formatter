import type { Billet } from "@/types/blog";

export const billet: Billet = {
  slug: "avis-google-restaurant-ce-qui-est-interdit",
  titre: "Les avis Google : ce que vous n'avez pas le droit de faire",
  resume:
    "Tout le monde explique comment en avoir plus. Presque personne ne dit ce qui est interdit — et c'est là que les restaurateurs se mettent en danger, souvent en suivant des conseils trouvés en ligne.",
  categorie: "remplir",
  publieLe: "2026-09-14",
  misAJourLe: "2026-09-14",
  sources: [
    {
      intitule:
        "Code de la consommation, article L121-4 (pratiques réputées trompeuses en toutes circonstances)",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044224578/",
    },
    {
      intitule:
        "Code de la consommation, articles L121-2 à L121-5 (pratiques commerciales trompeuses)",
      url: "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000032227299",
    },
    {
      intitule:
        "Code de la consommation, article L132-2 (sanctions des pratiques commerciales trompeuses)",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049532070",
    },
    {
      intitule:
        "DGCCRF — Restaurants : droits et obligations des professionnels",
      url: "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/restaurants-droits-et-obligations-des-professionnels",
    },
  ],
  essentiel: [
    "Les faux avis sont une pratique réputée trompeuse « en toutes circonstances » : l'administration n'a pas à prouver que vous vouliez tromper quelqu'un. Jusqu'à 300 000 € et deux ans, ou 10 % du chiffre d'affaires pour une société.",
    "Sonder ses clients et n'envoyer le lien Google qu'aux plus contents — le « review gating » — est interdit par Google et juridiquement fragile.",
    "Un avis négatif qui exprime une opinion est protégé. La diffamation commence à l'imputation d'un fait précis : intoxication, insalubrité, escroquerie. Et elle se prescrit en trois mois.",
    "Votre réponse ne s'adresse pas à celui qui a écrit, mais aux centaines de gens qui la liront avant de réserver.",
  ],
  image: {
    fichier: "/blog/avis-google.jpg",
    alt: "Un restaurateur regarde ses avis sur son ordinateur, à côté de notes sur les faux avis et les sanctions prévues par le code de la consommation.",
  },
  suite: [
    {
      slug: "reservations-sans-commission-guide-restaurants-independants",
      pourquoi:
        "Votre fiche bien tenue vous amène des clients directs. Voilà ce qu'ils vous coûtent ailleurs.",
    },
    {
      slug: "no-show-restaurant-cout-empreinte-bancaire",
      pourquoi:
        "Le revers d'une fiche qui marche : des réservations qui n'arrivent jamais.",
    },
  ],
  markdown: `
Il existe des centaines d'articles sur « comment obtenir plus d'avis Google ». Il n'en existe presque aucun sur ce qui est interdit — alors que c'est là que les restaurateurs se mettent en danger, souvent de bonne foi, en appliquant des conseils trouvés en ligne.

*Une précision d'usage : Klarr propose un audit de visibilité, nous ne sommes donc pas complètement extérieurs au sujet. Nous ne vendons en revanche ni gestion d'avis ni prestation de référencement.*

## Les quatre choses franchement illégales

**1. Écrire ou faire écrire de faux avis.** Cela inclut ce qu'on ne perçoit pas comme de la fraude : demander à sa famille, à ses amis ou à ses salariés de déposer un avis alors qu'ils n'ont pas dîné chez vous. L'article L121-4 du code de la consommation vise le fait de « diffuser ou faire diffuser par une autre personne […] de faux avis de consommateurs ».

**2. Acheter des avis.** Même chose, en pire, parce que la trace de la transaction existe quelque part.

**3. Offrir quelque chose contre un avis, sans le déclarer.** Un café, une remise, un dessert : c'est un avantage. Il ne s'agit pas d'un usage commercial anodin mais d'un avis obtenu en échange d'une contrepartie.

**4. Le « review gating ».** C'est la pratique la plus répandue et la moins perçue comme une faute : on sonde d'abord le client — « comment s'est passé votre repas ? » — et on n'envoie le lien Google qu'à ceux qui ont répondu du bien. Google l'interdit explicitement. Et juridiquement, une note construite en écartant les mécontents est difficile à défendre.

::: chiffre 300 000 € et deux ans
La sanction d'une pratique commerciale trompeuse. Pour une société, l'amende peut être portée à **10 % du chiffre d'affaires annuel moyen** des trois derniers exercices connus, ou à 50 % des dépenses engagées pour la pratique.
:::

::: attention Ce que « en toutes circonstances » veut dire
Le code range les faux avis parmi les pratiques **réputées trompeuses en toutes circonstances**. En clair : l'administration n'a pas à démontrer que vous vouliez tromper quelqu'un, ni que quelqu'un l'a été. Le fait suffit à caractériser l'infraction.

C'est ce qui distingue celle-ci de la plupart des autres — et c'est pourquoi « tout le monde le fait » n'est pas une défense, ici moins qu'ailleurs.
:::

## Ce que vous avez parfaitement le droit de faire

La liste est plus longue qu'on ne croit, et elle suffit largement :

- **Demander un avis.** Rien ne l'interdit. La seule règle est de le demander **à tous vos clients, sans trier**.
- **Faciliter le geste** : un QR code sur l'addition, un lien dans le message de remerciement. Ce qui compte, c'est que le lien parte vers tout le monde.
- **Choisir le moment.** Au départ, pas trois semaines après.
- **Récompenser la fidélité**, à condition que l'avantage n'ait aucun lien avec le fait de laisser un avis.
- **Répondre à tous les avis**, bons comme mauvais.

::: exemple La nuance qui fait tout basculer
« Une remise pour vous remercier de votre avis » → **interdit**.

« Une remise pour nos clients fidèles », offerte à tous, sans rapport avec un avis → **autorisé**.

La différence tient au lien direct entre l'avantage et l'avis. C'est lui, et lui seul, qui fait basculer la pratique.
:::

## Un avis négatif : ce que vous pouvez faire, et ce que vous ne pouvez pas

**Une opinion est protégée.** « L'accueil était froid », « c'est trop cher pour ce que c'est », « je ne recommande pas » : c'est désagréable, ce n'est pas une faute. La liberté d'expression couvre le jugement, même injuste, même de mauvaise foi apparente.

**La diffamation commence à l'imputation d'un fait précis** qui porte atteinte à l'honneur ou à la considération : affirmer que vous avez intoxiqué quelqu'un, que votre cuisine est insalubre, que vous escroquez vos clients. Là, il ne s'agit plus d'un avis mais d'une accusation.

Deux limites à connaître avant de s'énerver :

- **L'exception de vérité.** Si le client dit vrai, il n'y a pas de diffamation.
- **La bonne foi.** Un propos mesuré, reposant sur des faits vérifiables, sans animosité personnelle, est protégé même s'il vous nuit.

::: attention Trois mois, et c'est fini
La prescription en matière de diffamation est de **trois mois à compter de la publication**. C'est très court, et c'est le piège : le temps de s'indigner, de signaler à Google, d'attendre une réponse, d'en parler à un avocat — le délai est passé.

Et n'attendez pas de la plateforme qu'elle tranche : un hébergeur ne se fait pas juge de la vérité d'un propos. Un signalement échoue le plus souvent sur un avis diffamatoire mais pas manifestement illicite.
:::

::: attention Le réflexe qui se retourne contre vous
Attaquer un client mécontent est presque toujours une mauvaise idée, même quand on a raison en droit. Une procédure est publique, elle se raconte, et elle coûte plus cher en réputation que l'avis qu'elle visait.

Réservez l'action aux cas graves **et faux** — intoxication, insalubrité, escroquerie —, et agissez vite à cause des trois mois. Pour tout le reste, une réponse bien écrite vaut mieux qu'un avocat.
:::

## Répondre : à qui vous parlez vraiment

C'est le contresens le plus coûteux. On écrit sa réponse au client qui a laissé l'avis, en essayant d'avoir raison contre lui.

**Votre réponse ne s'adresse pas à lui.** Il ne la lira probablement jamais. Elle s'adresse aux centaines de gens qui liront cet avis avant de décider s'ils réservent chez vous.

Ce qui en découle :

- **Répondez à tous**, y compris aux bons. Une page où seuls les avis négatifs reçoivent une réponse raconte quelque chose.
- **Court.** Une réponse longue donne du poids à l'avis et le fait relire deux fois.
- **Jamais de contre-attaque.** Le lecteur ne cherche pas qui a raison : il regarde comment vous réagissez quand ça va mal, parce que c'est ce qui pourrait lui arriver.
- **Aucun détail sur le client.** Ne dites pas ce qu'il a commandé, à quelle heure il est venu, avec qui. C'est une donnée personnelle, et c'est perçu comme une trahison par tous ceux qui lisent.
- **Proposez de poursuivre en privé.** Une adresse, un numéro, et on sort de la scène.

::: exemple Ce que lit le futur client
Il ne lit pas « qui a raison ». Il lit **comment vous vous comportez quand quelqu'un est mécontent**.

Une réponse posée à un avis injuste vaut mieux, commercialement, qu'un avis injuste en moins.
:::

## Ce qu'il faut vérifier vous-même

- **Vos pratiques actuelles.** Quelqu'un chez vous trie-t-il les clients avant d'envoyer le lien ? Souvent, personne n'a décidé ça — ça s'est installé.
- **Ce que fait votre prestataire en votre nom.** Certains outils de « gestion des avis » filtrent les mécontents sans le dire clairement. C'est vous qui répondrez, pas eux.
- **Les trois mois**, si vous envisagez une action sur un avis grave.
- **La rédaction de vos réponses**, au regard de ce qu'elles révèlent de vos clients.

---

Sur ce que la loi impose par ailleurs sur votre carte et votre devanture :
[Menu ou carte : ce que votre choix fait à vos marges](/blog/menu-ou-carte-restaurant-marges).
`,
};
