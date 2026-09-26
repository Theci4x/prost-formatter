import type { Article } from "@/types/aide";

export const article: Article = {
  slug: "caution-carte",
  titre: "Demander une caution",
  resume:
    "Enregistrer une carte sans rien débiter, et ne la débiter qu'en cas de défection.",
  categorie: "argent",
  ordre: 3,
  questions: [
    "Comment me protéger des no-show ?",
    "Comment prendre une empreinte de carte ?",
    "Comment débiter une caution ?",
  ],
  markdown: `
Une caution, c'est une carte **enregistrée mais pas débitée**. Le client ne paie rien. Tu ne prélèves que s'il ne vient pas.

C'est la réponse au no-show, et c'est souvent mieux accepté qu'un acompte : le client ne sort pas d'argent.

Il faut que **Stripe soit connecté**.

## Le régler

Dans la configuration de la salle, choisis la garantie **Caution** et le montant **maximum** que tu pourras prélever. Comme l'acompte, la caution ne s'applique qu'aux privatisations, et elle est exclusive de l'acompte.

## Comment ça se passe

Le client enregistre sa carte via un lien, sur une page Stripe. **Rien n'est débité** — ni bloqué sur son compte, ni retenu. C'est une autorisation de prélèvement pour plus tard.

Ça tient dans le temps, même plusieurs mois. C'est la différence avec un blocage bancaire classique, qui expire au bout de quelques jours et ne protège pas une privatisation réservée en avance.

## Débiter

Sur la réservation, un bouton te permet de prélever **jusqu'au plafond** que tu as fixé. Tu peux prélever moins : un groupe de douze qui vient à huit ne justifie pas toujours la totalité.

Klarr te demande confirmation, et affiche ensuite ce qui a été prélevé.

Une réservation qui porte une garantie **reste visible jusqu'au jour du service**, même traitée. Tu vois donc toujours ce que tu as prélevé, et sur qui.

## Ce que le client accepte

Au moment d'enregistrer sa carte, il voit clairement le montant maximum et dans quel cas il peut être prélevé. Pas de petites lignes : une caution qui surprend se termine en litige bancaire, et tu perds de toute façon.

## Si le prélèvement échoue

Une carte peut refuser un prélèvement différé, notamment si la banque réclame une authentification que le client n'est pas là pour donner. Klarr te le dit. Dans ce cas, la caution n'est pas un chèque de banque : elle décourage beaucoup plus qu'elle ne garantit.
`,
};
