import type { Article } from "@/types/aide";

export const article: Article = {
  slug: "ce-que-klarr-ne-fait-pas",
  titre: "Ce que Klarr ne fait pas",
  resume:
    "Les limites, dites avant de vous engager plutôt qu'après.",
  categorie: "decouvrir",
  ordre: 3,
  questions: [
    "Est-ce que Klarr fait la caisse ?",
    "Est-ce que ça remplace mon logiciel ?",
    "Qu'est-ce qui manque ?",
    "Est-ce que Klarr m'amène des clients ?",
  ],
  markdown: `
Mieux vaut le savoir avant. Voici ce que Klarr **ne fait pas**, et ce qui n'est pas encore prêt.

## Ce que Klarr ne fera pas

**Ce n'est pas une caisse.** Klarr n'encaisse pas vos additions, ne gère pas vos tickets, ne s'interface pas avec votre logiciel de caisse. Votre caisse reste votre caisse.

**Ce n'est pas un logiciel de stocks ni de comptabilité.** Ni fiches techniques, ni inventaire, ni marges, ni paie.

**Klarr ne vous amène pas de clients par lui-même.** Ce n'est pas une place de marché : il n'y a pas d'annuaire Klarr où les convives cherchent un restaurant. Klarr vous aide à être trouvé là où les gens cherchent déjà — Google, les réseaux, les IA — et à convertir ceux qui vous trouvent. La différence est importante : une plateforme qui vous « amène » des clients vous les loue, et vous les reprend le jour où vous partez.

## Ce qui n'est pas encore prêt

**Les e-mails automatiques.** Klarr n'envoie pas encore de confirmation à votre client, ni le lien de paiement d'un acompte. Pour l'instant vous rappelez ou vous écrivez vous-même, avec les coordonnées affichées sur la demande. C'est la limite la plus visible du produit aujourd'hui, et elle est en cours de correction.

**Les devis de privatisation.** Même raison : ils attendent l'envoi d'e-mails.

**Les expériences et la jauge des salles.** Une séance — un cours de cocktails, par exemple — n'occupe pas la salle au sens du calcul de disponibilité. Si le cours et une privatisation tombent au même moment dans la même pièce, rien ne le signalera.

**La connexion à Google.** Elle demande une validation de Google, en cours. En attendant, vous pouvez coller votre lien de réservation dans votre fiche à la main — c'est le geste qui rapporte le plus, et il ne dépend de personne.

## Une limite de conception, assumée

Le **plan de salle sert à placer, pas à vendre**. Klarr accepte ou refuse les réservations en couverts, jamais en tables. Il ne dira donc jamais « complet » parce qu'il ne reste plus de table de quatre — parce qu'un moteur qui raisonnerait en tables refuserait un groupe de six que vous auriez assis en rapprochant deux tables.
`,
};
