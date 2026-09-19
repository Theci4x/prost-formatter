import type { Billet } from "@/types/blog";

export const billet: Billet = {
  slug: "fiche-google-restaurant-ce-qui-compte-vraiment",
  titre: "Votre fiche Google, ligne par ligne",
  resume:
    "Trois champs remplis en dix minutes valent autant que votre note. Quinze photos valent plus que tout le reste. Voici la grille que nous utilisons pour noter une fiche, publiée telle quelle, avec ses points.",
  categorie: "remplir",
  publieLe: "2026-09-19",
  misAJourLe: "2026-09-19",
  sources: [
    {
      intitule: "Google — aide sur la fiche d'établissement",
      url: "https://support.google.com/business",
    },
    {
      intitule:
        "Google Search Central — données structurées pour les établissements locaux",
      url: "https://developers.google.com/search/docs/appearance/structured-data/local-business",
    },
    {
      intitule: "schema.org — type Restaurant",
      url: "https://schema.org/Restaurant",
    },
  ],
  essentiel: [
    "Téléphone, site et horaires valent 45 points sur 100. Trois champs, dix minutes, et personne ne les remplit tous.",
    "Les photos valent 25 points et ne coûtent rien. C'est le meilleur rapport effort/résultat de toute la fiche, et le plus souvent négligé.",
    "Sur les avis, la fraîcheur compte : la part de vos avis de moins de six mois pèse un cinquième de la note du pilier.",
    "Cette grille est la nôtre, pas celle de Google. Personne ne connaît la sienne. Mais ce qu'elle mesure est ce qu'un client regarde avant de pousser la porte.",
  ],
  suite: [
    {
      slug: "pourquoi-chatgpt-ne-parle-pas-de-votre-restaurant",
      pourquoi:
        "Cette même fiche est la première source que lisent les assistants IA.",
    },
    {
      slug: "avis-google-restaurant-ce-qui-est-interdit",
      pourquoi:
        "Le pilier qui pèse le plus lourd, et celui où l'on a le moins le droit de tricher.",
    },
  ],
  markdown: `
**Disons-le tout de suite : nous ne sommes pas neutres.** Klarr vend un outil qui note les fiches Google. Et la grille qui suit est **la nôtre** — pas celle de Google.

Personne ne connaît l'algorithme de Google, et quiconque prétend le contraire vend du vent. Ce que nous publions ici, c'est notre façon de compter, inspirée de ce qui se pratique en référencement local. Sa seule justification : elle mesure ce qu'un client regarde avant de pousser votre porte. Nous la publions avec ses points, pour que vous puissiez la contester.

## Ce qui se joue sur une fiche

Un client qui cherche où manger ne va pas sur votre site. Il voit un encadré à droite de son écran, ou une épingle sur une carte, et il décide en une dizaine de secondes : est-ce ouvert, est-ce bien, est-ce que ça ressemble à ce que je veux ce soir.

Tout l'article tient dans cette idée : **votre fiche n'est pas un annuaire, c'est votre devanture.** Et une devanture à moitié montée fait fuir avant qu'on lise le menu.

## La fiche, ligne par ligne

Voici ce que nous comptons, sur cent points.

| Ce qu'on regarde | Points |
|---|---|
| Un numéro de téléphone | 15 |
| Un site web déclaré | 15 |
| Des horaires renseignés | 15 |
| Des photos (jusqu'à quinze) | 25 |
| La note affichée | 15 |
| Le nombre d'avis | 15 |

**Le téléphone, le site et les horaires : 45 points pour dix minutes de travail.** C'est le constat le plus fréquent de nos audits, et le plus frustrant. Ce sont trois champs à remplir une fois pour toutes, et il manque presque toujours l'un des trois. Des horaires absents, c'est un client qui ne prend pas le risque de se déplacer. Un site absent, c'est toute la suite de l'analyse qui tombe à zéro — on y revient plus bas.

**Les photos : vingt-cinq points, et elles ne coûtent rien.** C'est le meilleur rapport effort/résultat de toute la fiche. Nous comptons proportionnellement jusqu'à quinze photos : au-delà, le gain s'arrête. En dessous de cinq, votre fiche paraît vide à côté de celle du voisin, et le client le ressent avant de le formuler. Quinze photos prises correctement un midi de semaine — la salle, trois plats, la devanture, la terrasse, le bar — valent plus de points que votre note.

**La note : quinze points à partir de 4 sur 5**, huit à partir de 3,5. Le seuil de 4 n'est pas arbitraire : c'est celui en dessous duquel un client compare avec le restaurant d'à côté.

**Le nombre d'avis : quinze points à partir de cent**, huit à partir de vingt. En dessous de vingt, une note reste fragile — un seul client mécontent la fait bouger d'un demi-point.

## Les avis, comptés à part

Les avis pèsent assez pour mériter leur propre note, également sur cent :

- **la note elle-même**, pour un peu plus de la moitié ;
- **le nombre**, jusqu'à deux cents avis, pour un quart ;
- **la fraîcheur**, pour un cinquième : la part de vos avis qui datent de moins de six mois.

Cette troisième ligne est celle que personne n'anticipe, et c'est la plus parlante. Vingt avis dont le dernier date de deux ans racontent un établissement qui a peut-être fermé. Dix avis dont trois de ce mois-ci racontent une maison qui tourne. Le client le lit comme ça, et les machines aussi.

La conséquence pratique : **demander des avis n'est pas un geste qu'on fait une fois.** Un restaurant qui a collecté cent avis il y a trois ans et plus rien depuis se dégrade tout seul, sans que sa note bouge d'un point.

Une précision qui a sa place ici : ce qu'on a le droit de faire pour obtenir ces avis est encadré, et les raccourcis se paient cher. Nous y avons consacré un article entier.

## Votre site, vu par une machine

Le troisième volet ne se joue pas sur la fiche mais sur le site qu'elle déclare. Et il commence par une condition brutale : **si votre site ne répond pas, ou s'il n'y en a pas, ce volet vaut zéro.** Pas peu : zéro.

S'il répond, nous comptons quatre choses :

| Ce qu'on regarde | Points |
|---|---|
| Le site répond | 25 |
| Il porte des données structurées | 30 |
| Elles déclarent un restaurant | 25 |
| Elles citent vos réseaux sociaux | 20 |

Les trois dernières lignes demandent une explication, parce qu'elles sont invisibles pour vos clients.

Votre site peut afficher votre adresse, vos horaires et votre carte en toutes lettres sans qu'aucune machine ne comprenne qu'il s'agit d'une adresse, d'horaires et d'une carte. Pour elle, c'est du texte. Les **données structurées** sont un petit bloc, invisible à l'écran, qui dit explicitement : ceci est un restaurant, voici sa cuisine, son adresse, sa fourchette de prix, ses horaires, sa note.

C'est la différence entre une page qui parle de vous et une page qui **se déclare** être vous. Et c'est ce qui permet à Google d'afficher autre chose qu'un lien bleu — et aux assistants IA de vous citer.

La dernière ligne, les réseaux déclarés, sert à recoudre : sans elle, votre site, votre fiche Google et votre compte Instagram sont traités comme trois établissements différents qui portent le même nom.

## Comment les trois se combinent

La note finale pondère les trois volets : la fiche et les avis comptent chacun pour un peu plus d'un tiers, le site pour un peu moins.

Ce n'est pas un hasard. La fiche et les avis sont ce qu'un client regarde vraiment avant de pousser la porte — ils méritent le même poids. Le site pèse un peu moins parce qu'il se construit **sur** les deux premiers : un balisage parfait sur un site que personne ne trouve ne remplit aucune table.

## Par où commencer ce soir

Dans cet ordre, parce qu'il suit les points gagnés par minute passée :

1. **Les trois champs.** Téléphone, site, horaires. Dix minutes, quarante-cinq points.
2. **Quinze photos.** Un midi, un téléphone correct, et c'est fait. Vingt-cinq points de plus.
3. **Votre catégorie.** Elle ne rapporte pas de points chez nous mais décide des recherches où vous sortez : « bar à cocktails » et « restaurant » ne répondent pas aux mêmes questions.
4. **Répondez aux avis**, tous, y compris les mauvais. Ça ne change pas la note, ça change ce que lit le suivant.
5. **Demandez des avis, en continu.** Pas une campagne : une habitude.
6. **Le balisage du site**, en dernier, parce que c'est le seul point de cette liste qui demande quelqu'un de technique — ou un outil qui le pose pour vous.

Un dernier mot sur la grille elle-même. Elle vaut ce que valent ses seuils, et ils sont discutables : pourquoi quinze photos et pas vingt, pourquoi 4 sur 5 et pas 4,2. Nous les avons choisis, nous les assumons, et nous les publions pour cette raison précise — **une note qu'on ne sait pas expliquer ne se défend pas.**
`,
};
