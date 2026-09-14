import type { Billet } from "@/types/blog";

export const billet: Billet = {
  slug: "etude-impact-nuisances-sonores-restaurant",
  titre: "Étude d'impact sonore : qui est vraiment concerné",
  resume:
    "Non, une enceinte au plafond ne suffit pas à vous y soumettre. Mais un DJ le vendredi soir, oui — et l'étude doit précéder les travaux d'insonorisation, pas les suivre.",
  categorie: "ouvrir",
  publieLe: "2026-09-14",
  misAJourLe: "2026-09-14",
  sources: [
    {
      intitule:
        "Décret n° 2017-1244 du 7 août 2017 relatif à la prévention des risques liés aux bruits et aux sons amplifiés",
      url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000035388481",
    },
    {
      intitule: "Code de la santé publique, article R1336-1 (niveaux sonores dans les lieux recevant du public)",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000035425898",
    },
    {
      intitule:
        "Arrêté du 17 avril 2023 pris en application des articles R1336-1 à R1336-16 du code de la santé publique",
      url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000047490690",
    },
    {
      intitule: "Code du travail, article R4431-2 (valeurs d'exposition au bruit des salariés)",
      url: "https://code.travail.gouv.fr/code-du-travail/r4431-2",
    },
    {
      intitule: "ARS Île-de-France — Les lieux diffusant des sons amplifiés",
      url: "https://www.iledefrance.ars.sante.fr/les-lieux-diffusant-des-sons-amplifies-ldsa",
    },
  ],
  essentiel: [
    "L'étude ne s'impose pas à « tout lieu qui diffuse de la musique » : il faut deux conditions réunies, à titre habituel ET au-dessus de la règle d'égale énergie fondée sur 80 dB(A) sur 8 heures.",
    "Une musique d'ambiance de service est hors champ ; un DJ le vendredi, un rooftop sonorisé, un bar musical ne le sont pas.",
    "Le seuil est plus bas qu'il n'en a l'air : c'est une dose, pas un volume. 86 dB(A) pendant deux heures, c'est déjà le dépassement.",
    "Elle doit précéder les travaux d'insonorisation — c'est elle qui les décide.",
  ],
  markdown: `
On lit partout que « tout établissement qui diffuse de la musique » doit faire une étude d'impact des nuisances sonores. C'est faux, et l'approximation fait deux dégâts : elle fait dépenser de l'argent à des gens qui n'en ont pas besoin, et elle fait hausser les épaules à ceux qui devraient s'en soucier.

La règle est précise. Elle tient en deux conditions, et il faut les deux.

## Les deux conditions

Le décret n° 2017-1244 du 7 août 2017 s'applique aux lieux ouverts au public ou recevant du public, clos ou ouverts, qui accueillent des activités impliquant la diffusion de sons amplifiés :

1. **à titre habituel** — à l'exception des festivals, un événement isolé n'entre pas dans le champ ;
2. **à des niveaux sonores élevés**, définis par la règle d'égale énergie fondée sur **80 dB(A) équivalents sur 8 heures**.

Un restaurant qui passe de la musique d'ambiance pendant le service, à un volume qui laisse les tables se parler, n'atteint pas ce niveau : il n'est pas concerné. Un bar musical, un restaurant qui programme un DJ le vendredi, un rooftop avec une vraie sonorisation, une salle qui accueille des concerts : concernés.

::: chiffre 80 dB(A) sur 8 heures
Ce n'est pas un volume, c'est une **dose**. La règle d'égale énergie dit que doubler l'énergie sonore revient à diviser la durée par deux : 83 dB(A) pendant 4 heures, 86 pendant 2 heures, 89 pendant une heure — même dose, même dépassement.
:::

Or 86 dB(A), ce n'est pas un concert. C'est une salle pleine, animée, avec de la musique par-dessus, un vendredi à 22 h. Beaucoup d'établissements qui se croient hors champ y sont. Et la seule façon de le savoir n'est pas d'en discuter : c'est de mesurer.

## Ce qu'est l'étude

L'étude de l'impact des nuisances sonores — l'EINS, dans le jargon des acousticiens — se compose de deux parties :

- **l'étude acoustique** proprement dite : ce que votre installation produit dans ses différentes configurations, et ce qui en arrive chez les voisins ;
- **les dispositions que vous mettez en œuvre** pour rester conforme : isolation, emplacement et orientation des enceintes, bridage, limiteur de pression acoustique.

Elle tient compte des activités environnantes qui diffusent elles aussi des sons amplifiés — votre voisin n'est pas seulement quelqu'un que vous dérangez, c'est parfois quelqu'un qui alimente le même bruit de fond. Et elle est tenue à la disposition des agents de contrôle : il n'y a pas de guichet où l'envoyer, il y a un document à pouvoir produire.

## Le piège du calendrier

C'est le point qui coûte le plus cher, et il n'a rien de juridique.

::: attention L'ordre compte plus que le texte
L'étude sert à **décider** des travaux d'insonorisation : où isoler, avec quoi, jusqu'où. La faire après les travaux, c'est apprendre qu'il faut déposer un plafond qu'on vient de payer, ou recouper une cloison finie.
:::

Elle se place donc en phase de conception, avec l'architecte, au moment où le plan existe et où rien n'est encore posé. Un acousticien consulté à ce moment-là coûte une fraction de ce que coûte le même acousticien consulté après la première plainte.

C'est la même logique que pour les diagnostics : ce qui se fait avant est une dépense, ce qui se fait après est une reprise.
→ [Les diagnostics à faire avant de toucher aux murs](/blog/diagnostics-avant-travaux-restaurant)

## Le limiteur, et ce qu'on risque

Quand l'étude conclut que l'isolement ne suffit pas, elle prescrit un **limiteur de pression acoustique** : un boîtier placé entre la console et les amplis, réglé puis scellé, qui plafonne le niveau.

Ne pas l'installer alors que l'étude le prescrit, ou entraver son fonctionnement — le fameux réglage qu'on remonte le samedi soir — est une contravention de **5e classe** : jusqu'à 1 500 €, 3 000 € en récidive, avec confiscation possible du matériel de sonorisation.

Le vrai risque n'est pourtant pas l'amende. C'est l'arrêté de fermeture administrative, qui arrive après les plaintes, et qui ne se négocie pas.

## Les trois réglementations qu'on confond

Trois textes parlent de bruit dans votre établissement, et ils protègent trois personnes différentes. On les mélange en permanence.

**Les oreilles de vos clients.** L'article R1336-1 du code de la santé publique interdit de dépasser, en tout endroit accessible au public, 102 dB(A) et 118 dB(C) sur 15 minutes. S'y ajoutent la mise à disposition de protections auditives et l'aménagement de périodes ou de zones de repos auditif. L'enregistrement et l'affichage continus des niveaux, en revanche, ne visent que les discothèques quelle que soit leur capacité et les lieux de plus de 300 personnes : un restaurant y échappe presque toujours.

**Les oreilles de vos voisins.** C'est la logique d'émergence : ce qui compte n'est pas votre niveau, mais la différence que vous faites par rapport au bruit ambiant mesuré sans vous. L'ordre de grandeur est de 5 dB(A) en journée et 3 dB(A) entre 22 h et 7 h, assortis de termes correctifs liés à la durée, et de valeurs plus serrées par bande d'octave. Retenez surtout ceci : **ce sont les graves qui vous rattrapent.** Un voisin ne se plaint presque jamais du volume — il se plaint de la basse qui traverse le mur, et la basse ne s'arrête pas avec un rideau.

**Les oreilles de vos salariés.** Le code du travail a ses propres seuils d'exposition quotidienne : 80 dB(A) déclenche l'information et la mise à disposition de protections, 85 dB(A) impose un programme de réduction du bruit, 87 dB(A) ne doit jamais être dépassé. Vos clients passent deux heures dans la salle ; votre équipe y passe huit. Ce n'est pas le même calcul, et c'est celui qu'on oublie.

## Ce qu'il faut vérifier vous-même

- **Votre niveau réel se mesure.** Toute discussion sur « est-ce qu'on est concernés » sans sonomètre est une discussion vide.
- **Le règlement sanitaire départemental** et les arrêtés préfectoraux ou municipaux peuvent être plus stricts, en particulier sur les horaires et sur les terrasses.
- **Les terrasses et les rooftops** relèvent du même texte : « ouvert » ne veut pas dire hors champ.

Et si vous montez un dossier de travaux, faites entrer l'acousticien en même temps que l'architecte. C'est le seul moment où son avis ne coûte presque rien.
`,
};
