import type { Billet } from "@/types/blog";

export const billet: Billet = {
  slug: "reglement-copropriete-restaurant",
  titre: "Le règlement de copropriété passe avant votre bail",
  resume:
    "Un bailleur ne peut pas vous accorder plus de droits qu'il n'en a. Le document qui décide vraiment est chez le syndic, il est public pour les copropriétaires, et personne ne le lit.",
  categorie: "ouvrir",
  publieLe: "2026-09-20",
  misAJourLe: "2026-09-20",
  // BROUILLON — sources à ouvrir une par une avant publication.
  brouillon: true,
  sources: [
    {
      intitule:
        "Loi n° 65-557 du 10 juillet 1965 fixant le statut de la copropriété des immeubles bâtis",
      url: "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000006068256/",
    },
    {
      intitule:
        "Code de la construction et de l'habitation, article L113-8 — antériorité des activités agricoles, industrielles, artisanales, commerciales ou aéroportuaires",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043975767/",
    },
  ],
  essentiel: [
    "Le règlement de copropriété s'impose au bail. Une clause d'habitation bourgeoise stricte interdit toute activité commerciale, quoi que le bailleur vous ait dit.",
    "Même sans interdiction, c'est lui qui commande le passage du conduit, l'enseigne, la climatisation, les horaires et les livraisons.",
    "Les procès-verbaux d'assemblée générale valent autant que le règlement : ils disent ce que la copropriété a déjà refusé à d'autres.",
    "L'antériorité protège une activité installée contre un voisin qui arrive après. Elle ne protège jamais celui qui arrive.",
  ],
  suite: [
    {
      slug: "extraction-restaurant-conduit-toiture",
      pourquoi: "Le vote qui décide de votre conduit se tient là.",
    },
    {
      slug: "etude-impact-nuisances-sonores-restaurant",
      pourquoi: "Ce que le bruit vous coûtera si personne ne l'a mesuré.",
    },
  ],
  markdown: `
Vous avez le bail. La clause de destination autorise la restauration, le bailleur est d'accord, l'agent est content. Et le syndic vous écrit trois semaines plus tard pour vous rappeler que le règlement de copropriété interdit toute activité commerciale dans l'immeuble.

Il a raison, et vous avez signé.

## Pourquoi le règlement gagne

Un propriétaire ne peut pas céder plus de droits qu'il n'en détient. Le bailleur est copropriétaire : il est lui-même tenu par le règlement de copropriété. Il ne peut donc pas vous autoriser une activité que ce règlement lui interdit — même de bonne foi, même par écrit, même contre loyer.

Le règlement de copropriété est un contrat qui s'impose à tous les occupants de l'immeuble, propriétaires comme locataires. Il se trouve chez le syndic, il est annexé aux actes de vente, et il se demande.

## La clause qui interdit tout

Beaucoup d'immeubles d'habitation portent une **clause d'habitation bourgeoise**. Elle existe en deux versions, et l'écart entre les deux est considérable.

- **Bourgeoise stricte** : l'immeuble est réservé à l'habitation. Aucune activité professionnelle, commerciale ou libérale. Un restaurant y est impossible, point.
- **Bourgeoise simple** : l'habitation et les professions libérales sont admises. Le commerce, non. Un restaurant y est également impossible.

Dans les deux cas, la présence d'un commerce au rez-de-chaussée ne prouve rien : il peut être antérieur au règlement, ou toléré depuis des années sans que personne n'ait agi. Une tolérance ne crée pas de droit, et le jour où un copropriétaire décide d'agir, c'est l'activité la plus récente qui tombe.

::: attention Ce que vous devez demander au syndic
Deux documents, et il faut les deux :

**Le règlement de copropriété en entier**, y compris ses modificatifs. Pas un extrait. Les clauses qui vous concernent sont dispersées entre la destination de l'immeuble, la description des lots et les charges.

**Les procès-verbaux des trois dernières assemblées générales.** Ils vous diront ce que la copropriété a voté, ce qu'elle a refusé, et à qui. Une AG qui a refusé un conduit d'extraction à votre prédécesseur en 2023 refusera probablement le vôtre.
:::

## Même sans interdiction, la copropriété décide beaucoup

Admettons que le commerce soit autorisé. La copropriété continue de commander tout ce qui touche aux parties communes, et un restaurant y touche plus que n'importe quel autre commerce :

- **Le conduit d'extraction**, qui traverse gaines, façade et toiture.
- **L'enseigne**, qui se pose sur une façade commune.
- **Le groupe froid et la climatisation**, qui se posent en cour ou en toiture, et qui font du bruit la nuit.
- **Les livraisons**, dont l'horaire peut être encadré.
- **Les poubelles**, dont le local est commun et souvent trop petit pour un restaurant.

Chacun de ces points passe par une autorisation d'assemblée générale. Aucun ne se règle en urgence.

## Le bruit et les odeurs, même quand tout est autorisé

Une activité parfaitement licite peut être condamnée pour trouble anormal de voisinage. C'est une responsabilité sans faute : il n'est pas nécessaire que vous ayez enfreint quoi que ce soit, il suffit que la gêne dépasse ce qu'un voisin doit normalement supporter.

Les trois classiques d'un restaurant en immeuble d'habitation : le bruit de la ventilation la nuit, les odeurs de cuisson, et les clients qui parlent fort en terrasse à minuit.

::: exemple L'antériorité ne joue pas dans votre sens
La loi protège l'activité installée en premier : celui qui vient habiter à côté d'un restaurant existant ne peut pas se plaindre de nuisances qu'il pouvait constater en arrivant.

C'est exactement l'inverse de votre situation. Les habitants sont là depuis vingt ans ; c'est vous qui arrivez. L'antériorité est de leur côté.
:::

## Ce que ça coûte de ne pas lire

Le règlement de copropriété se demande gratuitement au syndic et se lit en une heure. Les PV d'assemblée générale, autant.

Face à ça : un bail commercial engage neuf ans, avec une faculté de sortie triennale et une indemnité si vous partez avant. Une activité interdite peut être arrêtée en justice, et le bail continue de courir pendant ce temps.

C'est le meilleur rapport entre une heure de lecture et un risque, de tout le parcours d'ouverture. Et c'est l'étape que presque personne ne fait.
`,
};
