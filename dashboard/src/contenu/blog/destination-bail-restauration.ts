import type { Billet } from "@/types/blog";

export const billet: Billet = {
  slug: "destination-bail-commercial-restauration",
  titre: "« Tous commerces » ne veut pas dire restaurant",
  resume:
    "Deux destinations portent le même mot : celle du bail et celle de l'urbanisme. Elles se vérifient auprès de deux personnes différentes, et l'une des deux ne se rattrape pas.",
  categorie: "ouvrir",
  publieLe: "2026-09-20",
  misAJourLe: "2026-09-20",
  // BROUILLON — sources à ouvrir une par une avant publication.
  brouillon: true,
  sources: [
    {
      intitule:
        "Code de commerce, articles L145-47 à L145-55 — déspécialisation du bail commercial",
      url: "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006178918/",
    },
    {
      intitule:
        "Code de l'urbanisme, articles R151-27 et R151-28 — destinations et sous-destinations des constructions",
      url: "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000031720476/",
    },
  ],
  essentiel: [
    "La destination du bail dit ce que vous avez le droit d'exercer dans les murs. « Tous commerces » est large mais se lit mot à mot : certaines rédactions excluent les activités bruyantes ou odorantes.",
    "En changer s'appelle une déspécialisation. Elle a une procédure, des délais, et le bailleur peut s'y opposer — ce n'est pas une formalité.",
    "L'urbanisme est une autre affaire, avec une autre autorité : transformer un commerce ou un bureau en restaurant peut demander une autorisation en mairie.",
    "Les deux se vérifient avant de signer. Le bail se relit en dix minutes, la mairie se renseigne par téléphone.",
  ],
  suite: [
    {
      slug: "ouvrir-un-restaurant-demarches",
      pourquoi: "Le reste du parcours, dans l'ordre.",
    },
    {
      slug: "erp-restaurant-categorie-commission-securite",
      pourquoi:
        "L'autre chose que la mairie regardera quand vous déposerez vos travaux.",
    },
  ],
  markdown: `
Un même mot désigne deux choses sans rapport, et c'est de là que viennent la plupart des mauvaises surprises.

La **destination du bail** est une affaire privée, entre vous et le propriétaire des murs. La **destination urbanistique** est une affaire publique, entre le bâtiment et la commune. Vous pouvez parfaitement avoir le droit contractuel d'ouvrir un restaurant dans un local que l'urbanisme ne reconnaît pas comme tel — et l'inverse.

## La destination du bail

Tout bail commercial comporte une clause de destination. Elle dit ce que le preneur a le droit d'exercer dans les lieux, et elle est d'interprétation stricte : ce qui n'y est pas autorisé est interdit.

Trois rédactions se rencontrent, et elles ne se valent pas.

**La destination précise.** « Restaurant traditionnel », « bar à vins », « vente de sandwichs à emporter ». Confortable si elle décrit votre projet — et bloquante si votre projet évolue. Ouvrir le soir quand le bail dit « salon de thé » est un changement de destination.

**La destination « tous commerces ».** La plus large, et la plus mal lue. Elle vous laisse une grande liberté, mais il faut la lire jusqu'au bout : beaucoup de rédactions ajoutent des exclusions — activités bruyantes, odorantes, insalubres, ou nécessitant une licence. Une clause « tous commerces sauf activités nuisibles au voisinage » ne vous autorise pas une rôtisserie.

**La destination muette ou ancienne.** Un bail de 1997 écrit pour un magasin de chaussures ne dit rien du restaurant. Il ne l'autorise donc pas.

::: attention Ce que le bailleur dit et ce que le bail dit
« Aucun souci, mon locataire d'avant faisait de la restauration. » Cette phrase n'a aucune valeur.

Ce qui vaut, c'est la clause, et l'accord **écrit** du bailleur sur votre activité, annexé au bail. Une tolérance passée ne crée aucun droit, et un bailleur change — par vente, par succession.
:::

## Changer la destination : la déspécialisation

Si le bail ne couvre pas votre activité, il faut en changer la destination. Le Code de commerce appelle ça une déspécialisation, et il en connaît deux.

**La déspécialisation partielle** vise l'ajout d'activités *connexes ou complémentaires* à celle prévue. Un restaurant qui veut vendre à emporter, typiquement. La procédure est légère : on notifie le bailleur, qui dispose d'un délai pour contester. S'il se tait, c'est accordé.

**La déspécialisation plénière** vise une activité **différente**. C'est le cas d'un local de bureau ou de commerce qu'on veut transformer en restaurant. Là, la procédure est lourde : demande motivée, délai de réponse du bailleur, possibilité pour lui de refuser en invoquant un motif grave et légitime, et possibilité pour lui de réclamer une indemnité ou une révision du loyer.

Le point à retenir n'est pas la mécanique, c'est le calendrier : **cela prend des mois, et ça peut échouer.** Une déspécialisation en cours n'est pas une déspécialisation obtenue.

## L'urbanisme, qui est une autre personne

Le Code de l'urbanisme classe les constructions par destinations et sous-destinations. La restauration en est une. Passer d'une sous-destination à une autre — d'un commerce de détail à un restaurant, d'un bureau à un restaurant — constitue un changement de destination, et il s'autorise.

Selon les travaux et la commune, cela passe par une déclaration préalable ou un permis de construire. Et dans certaines communes, le plan local d'urbanisme protège les commerces de proximité, ou limite au contraire l'implantation de restaurants dans certaines rues.

::: exemple Le coup de téléphone qui coûte cinq minutes
Appelez le service urbanisme de la mairie. Donnez l'adresse et la référence cadastrale, et posez deux questions : quelle est la destination actuelle du local, et le PLU autorise-t-il la restauration à cette adresse.

C'est gratuit, c'est rapide, et c'est le genre de réponse qui vous évite d'acheter un local dans une rue où la mairie a décidé de ne plus autoriser de restaurants.
:::

## Dans quel ordre

1. **Lisez la clause de destination** du projet de bail. Vous-même, mot à mot. Pas le résumé de l'agent, pas la fiche de l'annonce.
2. **Demandez l'accord écrit du bailleur** sur votre activité exacte, annexé au bail. S'il hésite à l'écrire, vous venez d'apprendre quelque chose.
3. **Appelez l'urbanisme.** Avant de signer, pas pendant les travaux.
4. **Vérifiez le règlement de copropriété**, qui prime sur le bail et peut interdire ce que le bailleur vous autorise.

Ce dernier point surprend toujours, et c'est le sujet d'un autre article : un propriétaire ne peut pas vous accorder plus de droits qu'il n'en a lui-même.
`,
};
