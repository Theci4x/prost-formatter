import type { Billet } from "@/types/blog";

export const billet: Billet = {
  slug: "pourquoi-je-sors-derriere-mon-voisin-google-maps",
  titre: "Pourquoi vous sortez derrière le restaurant d'à côté",
  resume:
    "Votre place sur Maps n'existe pas : elle change selon l'endroit d'où l'on cherche. Ce que Google publie sur son classement local, les trois seuls leviers dont vous disposez, et la façon de vérifier sans vous mentir à vous-même.",
  categorie: "remplir",
  publieLe: "2026-09-19",
  misAJourLe: "2026-09-19",
  sources: [
    {
      intitule: "Google — Améliorer le classement local de son établissement",
      url: "https://support.google.com/business/answer/7091",
    },
    {
      intitule: "Google — aide sur la fiche d'établissement",
      url: "https://support.google.com/business",
    },
    {
      intitule:
        "Google Search Central — données structurées pour les établissements locaux",
      url: "https://developers.google.com/search/docs/appearance/structured-data/local-business",
    },
  ],
  essentiel: [
    "Il n'existe pas de classement. Deux clients du même trottoir obtiennent des résultats différents : la distance à celui qui cherche pèse énormément, et vous n'y pouvez rien.",
    "Google publie trois critères : pertinence, distance, notoriété. Deux sont à votre portée, et le détail de leur pondération n'est public nulle part.",
    "Chercher depuis votre comptoir ne prouve rien : vous êtes à zéro mètre de vous-même, et Google vous connaît. Vérifiez autrement.",
    "Bourrer le nom de l'établissement de mots-clés est contraire aux règles de Google et expose à la suspension de la fiche. C'est le raccourci le plus cher du métier.",
  ],
  suite: [
    {
      slug: "fiche-google-restaurant-ce-qui-compte-vraiment",
      pourquoi:
        "Les champs sur lesquels agir, avec ce que chacun pèse dans la note.",
    },
    {
      slug: "avis-google-restaurant-ce-qui-est-interdit",
      pourquoi:
        "La notoriété se construit sur les avis. Et sur ce terrain, les raccourcis se paient.",
    },
  ],
  markdown: `
**Disons-le tout de suite : nous ne sommes pas neutres.** Klarr vend un outil qui surveille les fiches Google. Mais il ne fera pas monter la vôtre, et aucun outil ne le fera : ce qui suit explique pourquoi, et ce qui marche vraiment.

## La mauvaise nouvelle : votre place n'existe pas

« Je sors en troisième position » est une phrase qui n'a pas de sens, et c'est la première chose à comprendre.

Deux personnes assises à la même terrasse, qui tapent la même chose au même moment, n'obtiennent pas la même liste. Elle dépend de l'endroit exact d'où l'on cherche, à quelques centaines de mètres près, de l'heure — un restaurant fermé descend —, du téléphone, de l'historique de celui qui cherche.

Il n'y a donc pas *une* position à faire monter. Il y a une **probabilité d'apparaître**, et elle se travaille autrement.

C'est aussi ce qui explique votre observation. Si le voisin sort devant vous, ce n'est pas forcément parce que sa fiche est meilleure : c'est peut-être parce que vous cherchez depuis un point qui est plus proche de lui que de vous.

## Les trois critères que Google publie

Google documente publiquement ce qui décide du classement local, et s'en tient à trois mots.

**La pertinence.** À quel point votre fiche correspond à ce qui est cherché. « Bar à cocktails » et « restaurant » ne répondent pas à la même question, et c'est vous qui choisissez lequel vous êtes.

**La distance.** Entre celui qui cherche et vous. C'est le critère le plus lourd dans la pratique, et le seul sur lequel vous ne pouvez rien.

**La notoriété.** À quel point votre établissement est connu — avis, mentions, liens, articles, présence ailleurs que sur votre propre site.

Ce que Google ne publie pas, c'est la pondération entre ces trois-là. Personne ne la connaît. Ceux qui vous vendent une position garantie vendent une chose qu'ils ne contrôlent pas.

## La distance : ce que vous ne pouvez pas changer

Autant le dire nettement : vous ne déplacerez pas votre restaurant.

Ce que ça implique concrètement est plus utile qu'il n'y paraît. **Votre zone de chalandise numérique est beaucoup plus petite que vous ne le croyez.** Un client qui cherche depuis l'autre bout de la ville verra surtout ce qui est près de lui, quelle que soit la qualité de votre fiche.

Deux conséquences pratiques :

- **Cessez de vous comparer à des établissements d'un autre quartier.** Votre vraie concurrence sur Maps, ce sont les cinq ou six adresses dans votre rayon immédiat.
- **Les recherches sans lieu sont les plus disputées.** « Restaurant italien » depuis un point quelconque est une bataille perdue d'avance. « Restaurant italien ouvert dimanche midi » en est une autre — beaucoup moins de monde y répond.

## La pertinence : ce que vous déclarez être

C'est le levier le plus rapide, et le plus souvent mal réglé.

**Votre catégorie principale** décide des questions auxquelles vous pouvez répondre. Un bar à bière rangé en « restaurant » ne sortira jamais sur « où boire une bonne bière » — et c'est pourtant ce qu'on cherche pour aller chez lui. Choisissez celle qui décrit ce que vous êtes vraiment, pas la plus large.

**Les catégories secondaires, les attributs, les services** — terrasse, accès, moyens de paiement, plats à emporter — sont autant de questions auxquelles vous devenez éligible. Chacune paraît insignifiante ; ensemble, elles décident de la moitié des recherches où vous sortez.

**Votre description et votre carte publiée** disent avec quels mots on peut vous trouver. Si le mot « brunch » n'apparaît nulle part chez vous, personne ne vous trouvera en cherchant un brunch.

Nous détaillons ces champs, avec ce que chacun pèse, dans un article à part.

## La notoriété : ce qu'on dit de vous ailleurs

C'est le levier le plus lent et le plus solide.

Les avis y comptent — leur nombre, leur note, leur régularité. Mais pas seulement : un restaurant dont parlent la presse locale, un blog de quartier, un guide, une liste « les meilleures adresses de », est un restaurant dont plusieurs voix parlent. Une seule voix, la vôtre, pèse peu.

C'est là que se joue l'écart réel avec votre voisin, une fois la distance mise de côté. Et c'est un travail de mois, pas de semaines.

## Les raccourcis qui se paient

**Ne bourrez pas le nom de votre établissement de mots-clés.** « Chez Marcel — Restaurant Italien Pizza Paris 11 » n'est pas votre nom. C'est contraire aux règles de Google sur la représentation d'un établissement, ça vous expose à la suspension de la fiche, et une fiche suspendue ne sort plus nulle part. Le gain est réel à court terme ; c'est bien ce qui rend le piège efficace.

**N'achetez pas d'avis, et n'en échangez pas.** Même remarque, avec en plus le risque juridique — c'est le sujet d'un autre de nos articles.

**Ne créez pas de deuxième fiche** pour une deuxième adresse que vous n'occupez pas. Les fiches en double se détectent et se sanctionnent.

## Comment vérifier sans vous mentir

C'est l'erreur la plus répandue : sortir son téléphone au comptoir et chercher son propre nom.

Vous êtes alors à zéro mètre de vous-même, connecté à votre compte, avec un historique où votre restaurant apparaît cent fois par jour. Le résultat vous est favorable, et il ne dit strictement rien.

Trois façons de faire mieux :

1. **Cherchez ce que cherche un client**, pas votre nom. « Bar à cocktails Paris 11 », pas « Chez Marcel ».
2. **Depuis un autre point de la ville**, sur un appareil qui n'est pas le vôtre, hors de votre compte. Demandez à un ami à trois rues de là.
3. **Notez qui sort devant vous, et regardez leur fiche.** C'est l'exercice le plus instructif de tout cet article : ouvrez les trois premières, comptez leurs photos, leurs avis, la fraîcheur du dernier. Vous verrez très vite ce qui vous sépare — et souvent ce n'est pas mystérieux.

## Ce qui reste vrai

On ne pilote pas une position. On augmente une probabilité, sur des recherches qu'on a choisies, dans un rayon qu'on n'a pas choisi.

Le reste est du travail ordinaire et sans magie : une fiche complète, une catégorie juste, des avis qui continuent d'arriver, et quelques voix extérieures qui parlent de vous. Ce sont les mêmes gestes qui décident de votre présence dans les réponses des assistants IA — ce qui est une raison de plus de s'y mettre.
`,
};
