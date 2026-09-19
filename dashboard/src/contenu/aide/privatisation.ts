import type { Article } from "@/types/aide";

export const article: Article = {
  slug: "privatisation",
  titre: "Privatiser une salle",
  resume:
    "Louer une salle entière à un groupe, avec ou sans acompte.",
  categorie: "salle",
  ordre: 3,
  questions: [
    "Comment gérer une privatisation ?",
    "Comment louer ma cave à un groupe ?",
    "À partir de combien de personnes je privatise ?",
  ],
  markdown: `
Une privatisation, c'est un groupe qui prend une salle **en entier**. Personne d'autre n'y est assis, même s'il reste de la place.

## Régler une salle pour la privatisation

Dans la configuration de la salle, coche **privatisation** et indique **à partir de combien de convives**. En dessous de ce seuil, Klarr refuse poliment plutôt que de te faire bloquer une salle pour six personnes.

Une salle peut accepter les deux : des tables ordinaires **et** la privatisation. C'est le cas courant de la salle principale. Une cave, elle, ne se loue souvent qu'en entier — décoche alors « réservations individuelles ».

## Ce que Klarr garantit

Une salle privatisée sur un service est **entièrement retirée de la vente** sur ce service. Aucune table individuelle ne s'y ajoutera.

Et l'inverse est vrai aussi : Klarr n'accepte une privatisation que si la salle est **entièrement libre** sur ce créneau. On ne déplace pas des clients déjà attendus pour faire de la place à un groupe.

Le déjeuner et le dîner restent indépendants : une cave privatisée à midi se reloue le soir.

## Demander un acompte

Tu peux réclamer une garantie sur les privatisations, et sur elles seules — une table de deux ne bloque pas une salle, lui demander une garantie ferait fuir sans rien protéger.

Deux formules, au choix, par salle :

- **un acompte** — une somme réellement encaissée, en forfait ou par couvert ;
- **une caution** — la carte est enregistrée mais **rien n'est débité**, sauf défection.

Les deux sont exclusives : on ne réclame pas les deux au même client. Voir les articles dédiés.
`,
};
