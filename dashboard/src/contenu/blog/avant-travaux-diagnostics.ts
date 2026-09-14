import type { Billet } from "@/types/blog";

export const billet: Billet = {
  slug: "diagnostics-avant-travaux-restaurant",
  titre: "Les diagnostics à faire avant de toucher aux murs",
  resume:
    "Le diagnostic immobilier de la vente ne couvre pas les travaux. Amiante, plomb, bruit : ce qu'il faut avoir en main avant que le premier marteau tombe.",
  categorie: "ouvrir",
  publieLe: "2026-09-14",
  misAJourLe: "2026-09-14",
  sources: [
    {
      intitule: "Code du travail, article R4412-97 (repérage amiante avant travaux)",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000034616411",
    },
    {
      intitule: "Décret n° 2017-899 du 9 mai 2017 relatif au repérage de l'amiante avant certaines opérations",
      url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000034637576",
    },
    {
      intitule: "Décret n° 2017-1244 du 7 août 2017 relatif à la prévention des risques liés aux bruits et aux sons amplifiés",
      url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000035388481",
    },
  ],
  markdown: `
Voici l'erreur que fait à peu près tout le monde, et je l'ai faite : **le diagnostic immobilier remis à la vente ou à la signature du bail ne vaut pas diagnostic avant travaux.** Ce sont deux documents différents, avec deux objets différents, et le second est à votre charge.

Le premier informe l'acheteur ou le locataire sur l'état du bien. Le second protège les ouvriers qui vont percer, poncer et déposer. Le premier regarde ce qui se voit ; le second va chercher ce qui est derrière les cloisons, sous les revêtements, dans les colles de carrelage.

Quand on s'en aperçoit, le chantier a commencé. C'est trop tard : il faut l'arrêter.

## Le repérage amiante avant travaux

**Qui doit le faire :** vous, en tant que maître d'ouvrage — c'est-à-dire celui qui décide des travaux. Pas l'artisan, pas le propriétaire des murs. Vous.

**Quand :** avant le début des travaux, et le rapport doit être remis aux entreprises qui interviennent, pour qu'elles organisent leur protection.

**Sur quels bâtiments :** ceux construits avant le 1er juillet 1997, date d'interdiction de l'amiante en France. Un immeuble haussmannien, un local des années 1970, un pavillon de 1990 : tous concernés.

L'obligation vient du décret n° 2017-899, codifié aux articles R. 4412-97 et suivants du code du travail. Le repérage doit être fait par un opérateur certifié.

**Ce que ça change concrètement.** Un restaurant, ce sont des travaux qui touchent partout : dépose de faux plafonds, percements pour l'extraction, saignées pour la plomberie, dépose d'anciens sols. Autant d'endroits où l'amiante se cachait — dalles de sol, colles, flocages, conduits.

Si le repérage révèle de l'amiante, les travaux ne sont pas impossibles : ils deviennent encadrés, avec des entreprises certifiées et des délais plus longs. Ce qui coûte cher, ce n'est pas l'amiante, c'est de la découvrir en cours de chantier.

## Le plomb

Même logique, autre matériau. Pour les immeubles construits **avant le 1er janvier 1949**, le constat de risque d'exposition au plomb concerne les peintures anciennes. Là encore, le constat remis à la vente ne couvre pas la même chose qu'un repérage destiné à protéger des ouvriers qui vont gratter et poncer.

Si vous reprenez un local dans un immeuble ancien — et à Paris, Lyon ou Bordeaux, c'est la règle plus que l'exception — posez la question avant de signer le devis des travaux, pas après.

## L'étude d'impact des nuisances sonores

Celle-là surprend tout le monde, parce qu'on croit qu'elle ne concerne que les boîtes de nuit.

**Elle concerne tout lieu ouvert au public qui diffuse régulièrement de la musique amplifiée.** Un bar à vins avec une enceinte au plafond, un restaurant qui passe de la musique le soir, un rooftop : le décret n° 2017-1244 du 7 août 2017 ne parle pas de discothèques, il parle de sons amplifiés.

**Ce qu'elle contient :** une étude faite par un acousticien, qui examine l'effet des différentes configurations de votre installation sur le voisinage, et détermine les mesures à prendre — limiteur de pression acoustique, isolation, orientation des enceintes.

**Le piège du calendrier.** L'étude sert à décider des travaux d'insonorisation. La faire après les travaux, c'est découvrir qu'il faut refaire un plafond qu'on vient de poser. Elle vient donc dans la phase de conception, avec l'architecte, pas à la fin.

Elle vous sera demandée à l'ouverture, mais aussi lors d'une demande d'horaires tardifs, d'un contrôle, ou de la première plainte d'un voisin. Autant l'avoir.

## Dans quel ordre

1. **Avant de signer le bail** — demandez les diagnostics existants et l'année de construction. Ils ne suffiront pas, mais ils vous disent ce qui vous attend.
2. **Avant de dessiner les travaux** — étude d'impact sonore si vous comptez diffuser de la musique. Elle conditionne le plan.
3. **Avant le premier coup de marteau** — repérage amiante, et plomb si l'immeuble est d'avant 1949. Rapport transmis aux entreprises.
4. **Pendant le chantier** — voir l'article sur vos obligations quand des ouvriers travaillent chez vous : elles ne sont pas celles que vous croyez.

## Ce qu'il faut vérifier vous-même

Cet article donne le cadre national. Trois choses lui échappent et se règlent localement :

- **votre catégorie d'ERP**, qui dépend de votre effectif accueilli et change les obligations de sécurité ;
- **le règlement sanitaire départemental**, qui peut être plus strict que le texte national sur le bruit ;
- **le plan local d'urbanisme**, pour tout ce qui touche à la façade, l'enseigne et l'extraction.

Ces trois-là se demandent à votre mairie et à la préfecture, et personne d'autre ne peut répondre à votre place.
`,
};
