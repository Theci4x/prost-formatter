import type { Billet } from "@/types/blog";

export const billet: Billet = {
  slug: "pourquoi-chatgpt-ne-parle-pas-de-votre-restaurant",
  titre: "Pourquoi ChatGPT ne parle jamais de votre restaurant",
  resume:
    "Quand un client demande à une IA où dîner dans votre quartier, elle nomme deux ou trois maisons. Il n'y a pas de deuxième page. Voici ce qui décide de qui est cité, ce que personne ne peut vous promettre, et comment savoir où vous en êtes.",
  categorie: "remplir",
  publieLe: "2026-09-19",
  misAJourLe: "2026-09-19",
  image: {
    fichier: "/blog/visibilite-ia-chatgpt.jpg",
    alt: "Une restauratrice en tablier, pensive, dans sa salle où trois clients déjeunent près de la fenêtre.",
  },
  sources: [
    {
      intitule: "schema.org — type Restaurant",
      url: "https://schema.org/Restaurant",
    },
    {
      intitule: "Google Search Central — la documentation du référencement",
      url: "https://developers.google.com/search",
    },
    {
      intitule: "schema.org — type LocalBusiness",
      url: "https://schema.org/LocalBusiness",
    },
    {
      intitule: "Google — aide sur la fiche d'établissement",
      url: "https://support.google.com/business",
    },
  ],
  essentiel: [
    "Une réponse d'assistant nomme deux ou trois établissements et s'arrête. Il n'y a pas de deuxième page, donc pas de dixième place de consolation.",
    "L'assistant ne connaît pas votre restaurant : il connaît ce que ses sources en disent. Fiche Google, avis, mentions ailleurs, données structurées de votre site.",
    "Personne ne peut vous garantir d'y figurer, et méfiez-vous de qui le promet. Il n'existe ni classement à consulter, ni levier direct.",
    "En revanche, on peut le mesurer : poser la question, lire la réponse, la dater, recommencer. C'est la seule façon de savoir si ce que vous changez sert à quelque chose.",
  ],
  suite: [
    {
      slug: "avis-google-restaurant-ce-qui-est-interdit",
      pourquoi:
        "La source que tous les assistants lisent en premier, et ce qu'on n'a pas le droit d'y faire.",
    },
    {
      slug: "reservations-sans-commission-guide-restaurants-independants",
      pourquoi:
        "Être trouvé sans payer de commission suppose un endroit où envoyer les gens.",
    },
    {
      slug: "fiche-google-restaurant-ce-qui-compte-vraiment",
      pourquoi:
        "La première des cinq sources, notée ligne par ligne, avec les points.",
    },
    {
      slug: "pourquoi-je-sors-derriere-mon-voisin-google-maps",
      pourquoi:
        "Le même travail, vu depuis Google Maps — et pourquoi votre position n'existe pas.",
    },
  ],
  markdown: `
**Disons-le tout de suite : nous ne sommes pas neutres.** Klarr vend un outil qui mesure ce que les assistants IA répondent sur un restaurant. Nous avons donc un intérêt direct à ce que le sujet vous inquiète.

Alors voici l'article écrit à l'envers de ce qu'on lit ailleurs : d'abord ce que personne ne peut vous promettre, ensuite ce qui compte vraiment, et enfin comment vérifier vous-même sans nous.

## Ce qui se passe quand un client pose la question

Quelqu'un tape, dans ChatGPT ou dans Gemini : « où dîner à six dans le 11e ce samedi ». L'assistant ne rend pas une liste de résultats. Il répond par une phrase, et il nomme **deux ou trois maisons**.

C'est toute la différence avec Google. Sur une page de résultats, la dixième place existe : elle rapporte peu, mais elle existe. Dans une réponse d'assistant, **il n'y a pas de deuxième page**. Vous y êtes ou vous n'y êtes pas, et celui qui n'y est pas n'apparaît nulle part — pas plus bas, nulle part.

C'est ce qui rend le sujet différent du référencement classique, et c'est aussi ce qui le rend difficile à travailler : il n'y a pas de position à faire remonter, il y a une présence à obtenir.

## Pourquoi votre restaurant n'y est pas

Un assistant ne connaît pas votre restaurant. Il connaît **ce que ses sources en disent**.

Un modèle répond à ce genre de question de deux façons, souvent mélangées : ce qu'il a retenu de son entraînement, et ce qu'il va chercher sur le web au moment où on lui pose la question. Dans les deux cas, la mécanique est la même : si votre maison n'existe pas, ou existe mal, dans les endroits où il regarde, il ne peut pas la nommer. Il ne vous oublie pas — il ne vous a jamais rencontré.

Les endroits où il regarde, ce sont ceux que vous connaissez déjà : votre fiche Google, les avis, les sites qui parlent de restaurants dans votre ville, les guides, les annuaires, et votre propre site quand celui-ci dit clairement ce qu'il est.

D'où la conclusion la plus utile de cet article, et elle est rassurante : **le travail à faire n'est pas nouveau.** C'est le même que pour Google, avec une exigence de plus sur la cohérence.

## Les cinq choses qui décident

**1. [Une fiche Google complète et vivante](/blog/fiche-google-restaurant-ce-qui-compte-vraiment).** Horaires exacts, catégorie juste — « bar à cocktails » et non « restaurant » si c'est ce que vous êtes —, photos récentes, description qui dit ce qu'on mange. Une fiche à moitié remplie est une source à moitié muette.

**2. Des avis, et surtout des avis récents.** Vingt avis dont le dernier date de deux ans disent « cet endroit a peut-être fermé ». Dix avis dont trois de ce mois-ci disent « cet endroit tourne ». La fraîcheur pèse au moins autant que la quantité.

**3. Des mentions ailleurs que chez vous.** Un assistant recoupe. Un restaurant dont on ne parle que sur son propre site est un restaurant dont une seule voix parle. La presse locale, un blog de quartier, un guide, une liste « les meilleures adresses de » : chacune de ces mentions est une voix de plus.

**4. Un site qui se dit restaurant.** C'est le point le plus technique et le plus souvent manqué. Votre site peut afficher votre adresse et vos horaires en toutes lettres sans qu'aucune machine ne comprenne qu'il s'agit d'une adresse et d'horaires. Les données structurées servent exactement à ça : déclarer, dans un format prévu pour, « ceci est un restaurant, voici sa cuisine, son adresse, sa fourchette de prix, ses horaires ». C'est du balisage invisible pour vos clients et décisif pour les machines.

**5. La même information partout.** Une adresse qui diffère d'une ligne entre votre fiche et votre site, un horaire qui traîne sur un annuaire depuis trois ans, un numéro de téléphone périmé : chaque écart affaiblit l'ensemble. Une machine qui trouve trois versions d'un fait n'en retient aucune avec confiance.

## Ce que personne ne peut vous promettre

Il faut le dire clairement, parce qu'un marché s'est monté autour de ce sujet.

**Il n'existe aucun levier direct.** On ne s'inscrit pas dans ChatGPT. On n'y achète pas de place. Personne ne dispose d'un bouton qui ferait apparaître votre nom dans une réponse, et quiconque vous le vend vous vend autre chose.

**Il n'existe pas de classement à consulter.** Pas de position moyenne, pas de tableau de bord officiel, rien qui ressemble à ce que Google publie.

**Les réponses varient.** Posez deux fois la même question et vous n'obtiendrez pas toujours les mêmes noms. Changez d'assistant, et encore moins. Une mesure isolée ne prouve rien : seule la répétition dans le temps dit quelque chose.

Cette instabilité n'est pas un défaut de la mesure, c'est la nature de l'objet. Et c'est précisément pour ça qu'il faut mesurer plutôt que deviner.

## Comment savoir où vous en êtes

Vous pouvez le faire vous-même, ce soir, gratuitement. La méthode tient en quatre points.

**Posez la question du client, pas la vôtre.** « Meilleur restaurant italien près de République » est une vraie question. « Que penses-tu du restaurant Chez Marcel » n'en est pas une : vous lui soufflez la réponse. Le test n'a de valeur que si vous ne prononcez pas votre nom.

**Posez-la à plusieurs assistants.** Ils ne lisent pas les mêmes sources et ne répondent pas pareil. Être cité par l'un et pas par l'autre est une information en soi.

**Notez la réponse entière, avec la date.** Pas seulement « j'y suis » ou « je n'y suis pas », mais quels noms sortent, et dans quel ordre. Les concurrents cités à votre place sont le vrai enseignement : ce sont eux que vos clients découvrent, et vous les connaissez.

**Recommencez dans un mois.** Après avoir complété votre fiche, répondu à vos avis, ajouté des photos. C'est la comparaison qui vous dira si ça sert, pas la première mesure.

Faites-le à la main : ça marche, ça ne coûte rien, et vous comprendrez le sujet mieux qu'avec n'importe quel rapport. Si vous ne voulez pas le refaire tous les mois, c'est ce que notre module Visibilité automatise — il pose vos questions, garde les réponses datées, et trace la courbe ([voir comment, en vidéo](/visibilite-restaurant-ia)). Mais commencez par le faire vous-même une fois.

## Ce que ça change, concrètement

Un restaurateur qui découvre que l'IA cite trois maisons de sa rue et pas la sienne réagit rarement en achetant un logiciel. Il réagit en allant regarder sa fiche Google, et il y trouve presque toujours de quoi faire : une catégorie fausse, quatre photos datant de l'ouverture, des horaires d'été laissés en place depuis septembre, et vingt avis sans une seule réponse.

C'est le vrai effet de cette mesure : elle ne vous apprend pas une technique nouvelle, **elle vous rend urgent ce que vous remettiez à plus tard.** Et ce que vous corrigerez pour les assistants, vous le corrigerez du même geste pour Google Maps et pour le client qui cherche votre numéro un dimanche soir.
`,
};
