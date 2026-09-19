import type { Billet } from "@/types/blog";

export const billet: Billet = {
  slug: "haccp-plan-maitrise-sanitaire-restaurant",
  titre: "HACCP : le classeur qu'on achète ne vous protège de rien",
  resume:
    "Ce n'est pas un diplôme, c'est une méthode — et le plan de maîtrise sanitaire décrit votre cuisine, pas celle d'un modèle. Les trois volets, les températures, et ce qu'on vous vend sans que ce soit obligatoire.",
  categorie: "ouvrir",
  publieLe: "2026-09-15",
  misAJourLe: "2026-09-15",
  sources: [
    {
      intitule:
        "Règlement (CE) n° 852/2004, article 5 (procédures fondées sur les principes HACCP)",
      url: "https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32004R0852",
    },
    {
      intitule:
        "Règlement (CE) n° 178/2002, article 18 (traçabilité des denrées alimentaires)",
      url: "https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32002R0178",
    },
    {
      intitule:
        "Arrêté du 21 décembre 2009 relatif aux règles sanitaires applicables au commerce de détail",
      url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000021573483",
    },
    {
      intitule:
        "Arrêté du 21 décembre 2009, annexe IV (températures de conservation)",
      url: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000041864953",
    },
    {
      intitule:
        "Décret n° 2011-731 du 24 juin 2011 relatif à l'obligation de formation en hygiène alimentaire",
      url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000024266465",
    },
  ],
  essentiel: [
    "HACCP n'est pas un diplôme mais une méthode. Deux obligations distinctes : une formation de quatorze heures pour au moins une personne, et un plan de maîtrise sanitaire que vous écrivez vous-même.",
    "Un plan acheté tout fait décrit une cuisine qui n'est pas la vôtre. Un contrôleur le repère en trois questions.",
    "Le point le plus regardé est le refroidissement : passer de +63 °C à +10 °C en moins de deux heures.",
    "Le plat témoin est obligatoire en restauration collective, pas en restauration commerciale. On en vend pourtant beaucoup aux restaurants traditionnels.",
  ],
  image: {
    fichier: "/blog/haccp-pms.jpg",
    alt: "Un cuisinier en gants, dans une cuisine inox, devant un classeur « sécurité alimentaire » acheté tout fait et une liste des relevés obligatoires à tenir chaque jour.",
  },
  suite: [
    {
      slug: "declaration-sanitaire-restaurant-ddpp",
      pourquoi: "Le contrôle qui vient vérifier ce classeur.",
    },
    {
      slug: "avis-google-restaurant-ce-qui-est-interdit",
      pourquoi: "Un client ne lit pas votre plan sanitaire — il lit vos avis.",
    },
  ],
  markdown: `
On dit « avoir son HACCP » comme on dirait avoir son permis. Ce n'est pas ça, et cette confusion coûte cher — en argent dépensé pour rien, et en sécurité qu'on croit avoir.

**HACCP n'est pas un diplôme. C'est une méthode d'analyse des dangers.** Et derrière ce sigle, il y a en réalité deux obligations distinctes, qui n'ont pas le même objet ni la même façon d'être remplies.

## Deux obligations, et une seule s'achète

**La formation.** Le décret n° 2011-731 impose que tout établissement de restauration commerciale compte dans son effectif **au moins une personne** justifiant d'une formation en hygiène alimentaire — quatorze heures minimum. Deux dispenses : un diplôme figurant sur la liste fixée par arrêté, ou trois ans d'expérience comme gestionnaire ou exploitant dans une entreprise du secteur.

Celle-là s'achète, se passe en deux jours, et c'est très bien ainsi.

**Le plan de maîtrise sanitaire.** L'article 5 du règlement européen n° 852/2004 impose à tout exploitant du secteur alimentaire de mettre en place des procédures **fondées sur les principes HACCP**. Ce document, c'est le plan de maîtrise sanitaire — le PMS.

Celui-là ne s'achète pas.

::: attention Le classeur acheté ne vous protège de rien
Un PMS vendu tout fait décrit un restaurant qui n'est pas le vôtre : d'autres locaux, d'autres circuits, d'autres fournisseurs, d'autres plats. Un contrôleur le repère en trois questions, parce qu'il décrit une cuisine qu'il n'a pas sous les yeux.

Et surtout : **ce n'est pas le classeur qui est contrôlé, c'est ce que vous faites.** Le document sert à montrer que vous savez pourquoi vous le faites. Un classeur parfait sur une cuisine qui ne le suit pas est une circonstance aggravante, pas une protection.
:::

Un modèle est un bon point de départ — il vous dit quoi couvrir. Il ne remplace pas le travail de l'adapter, et ce travail se fait une fois.

## Les trois volets du plan de maîtrise sanitaire

**1. Les bonnes pratiques d'hygiène.** C'est le socle, et c'est le plus long à écrire :

- le **personnel** : tenue, lavage des mains, formation, suivi ;
- les **locaux et équipements**, et le plan de nettoyage-désinfection — quoi, avec quoi, à quelle fréquence, par qui ;
- la **lutte contre les nuisibles** ;
- l'**eau** ;
- la **maîtrise des températures** ;
- la **séparation des flux** — le propre et le sale qui ne se croisent pas ;
- les **déchets**.

**2. Le plan HACCP proprement dit** : les sept principes appliqués à votre activité. Identifier les dangers, déterminer les points où vous pouvez agir, fixer les limites, surveiller, corriger quand ça sort des clous, vérifier que le système marche, et tout documenter.

**3. La traçabilité et la gestion des non-conformités.** Un pas en amont, un pas en aval : savoir d'où vient chaque produit, et à qui vous l'avez cédé le cas échéant. Plus la procédure de retrait-rappel — qui appelle qui, dans quel ordre, un samedi soir à 22 h.

## Les températures, qui sont le cœur du contrôle

| Situation | Température |
|---|---|
| Préparations culinaires élaborées à l'avance | **+3 °C** |
| Denrées très périssables | **+4 °C** (ou l'étiquetage du fabricant) |
| Produits surgelés | **−18 °C** |
| Maintien au chaud | **+63 °C** minimum |
| Refroidissement rapide | de **+63 °C à +10 °C en moins de 2 heures** |

::: chiffre Deux heures
Le temps maximal pour descendre de +63 °C à +10 °C. C'est la fenêtre dans laquelle les bactéries se multiplient le plus vite, et c'est le premier point regardé dès que vous préparez à l'avance.

Un refroidissement plus lent reste possible — mais seulement si une analyse des dangers validée démontre qu'il garantit la sécurité. Autrement dit : il faut l'avoir faite, et pouvoir la montrer.
:::

## Le plat témoin : ce que vous n'êtes pas obligé de faire

Voilà un point sur lequel on vend beaucoup de choses aux restaurants traditionnels.

- **En restauration collective**, le plat témoin est obligatoire : des prélèvements de 80 à 100 g, conservés entre 0 et +3 °C pendant au moins cinq jours, tenus à disposition en cas de suspicion de toxi-infection alimentaire collective.
- **En restauration commerciale, il ne l'est pas.** Un restaurant traditionnel qui sert à l'assiette n'y est pas tenu.

Cela dit, sur un repas de groupe ou un banquet, en faire reste une bonne idée — parce qu'en cas de suspicion, c'est la seule chose qui peut vous disculper.

::: attention Ce qu'on vous vend, et ce que la loi demande
Beaucoup de choses se vendent au nom de l'HACCP : des classeurs tout faits, des sachets de plats témoins, des thermomètres connectés, des « recyclages obligatoires ».

Le décret de 2011 ne fixe **aucune durée de validité** à la formation en hygiène alimentaire — contrairement au [permis d'exploitation](/blog/permis-exploitation-licence-restaurant), qui vaut dix ans. Si on vous vend un recyclage comme une obligation légale, demandez le texte qui la prévoit.

Rien de tout cela n'est inutile. Mais utile et obligatoire sont deux choses différentes, et savoir laquelle est laquelle vous fait économiser plusieurs centaines d'euros par an.
:::

## Ce qu'un contrôle regarde vraiment

- **Vos relevés.** Sont-ils faits au fil de l'eau, ou remplis d'un coup le matin de la visite ? Un relevé de températures avec la même valeur tous les jours est un aveu, pas une preuve.
- **Votre traçabilité.** D'où vient ce qui est dans le frigo, maintenant, et pouvez-vous le montrer.
- **La cohérence** entre ce que dit le document et ce que fait la cuisine.
- **Votre équipe.** On posera la question à la personne présente, pas à vous. Si personne ne sait répondre, le classeur ne servira à rien.

## Ce qu'il faut vérifier vous-même

- **Le guide de bonnes pratiques d'hygiène de votre secteur.** Ces guides sont validés par l'administration et constituent la meilleure base pour construire votre PMS.
- **Le règlement sanitaire départemental**, qui peut être plus strict que le texte national.
- **Qui, chez vous, détient la formation** — et ce qui se passe le jour où cette personne part.
- **Ce que vos relevés racontent** si on les lit aujourd'hui, sans prévenir.

---

Sur la démarche qui précède tout cela, et le cas qui bascule vers l'agrément :
[Immatriculer sa société ne déclare pas son restaurant](/blog/declaration-sanitaire-restaurant-ddpp).
`,
};
