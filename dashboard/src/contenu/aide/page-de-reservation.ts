import type { Article } from "@/types/aide";

export const article: Article = {
  slug: "page-de-reservation",
  titre: "Ta page de réservation",
  resume:
    "L'adresse à partager partout, ce que le client y voit, et ce que tu peux y montrer.",
  categorie: "demarrer",
  ordre: 2,
  questions: [
    "Où trouver le lien de réservation ?",
    "Quelle adresse je donne à mes clients ?",
    "Que voit le client avant de réserver ?",
  ],
  markdown: `
Ta page de réservation est une page publique, à ton nom, que tu partages où tu veux. Elle ne demande à ton client ni compte, ni application, ni mot de passe.

## Où la trouver

**Réservations → Espaces, services et page publique**. L'adresse s'affiche dès que tu as ouvert la page, et tu peux la copier de là.

Elle ressemble à quelque chose comme **klarr.net/reserver/ton-restaurant**.

## Où la mettre

Les trois endroits qui rapportent le plus, dans cet ordre :

1. **Ta fiche Google** — champ « Lien pour les réservations ». C'est de loin celui qui amène le plus de monde, parce que c'est là que les gens cherchent.
2. **La bio de ton Instagram**.
3. **Ta page Facebook**, bouton « Réserver ».

## Ce que le client y voit

- tes photos, s'il y en a ;
- ta note Google et ton nombre d'avis, si Klarr a pu les relever ;
- **uniquement ce qui est réellement disponible** — c'est le point important. Klarr ne montre jamais un créneau qu'il ne peut pas tenir. Pas de double réservation, pas de « finalement non » le lendemain ;
- ta carte, si tu l'as publiée ;
- tes expériences, si tu en proposes.

Le client choisit une date et un nombre de convives, et voit ce qui reste. Il envoie une demande : elle arrive chez toi, et c'est toi qui tranches.

## Ce que ça change pour toi

Aucune commission par couvert. Jamais. Ce que le client dépense chez toi reste chez toi.

## Personnaliser

Sur le même écran de configuration, tu peux ajouter :

- **ton logo** en haut de page ;
- **tes mentions légales** en bas — obligatoires dès que tu encaisses un acompte, et de toute façon rassurantes.

Les photos se gèrent dans **Photos** pour l'établissement, et salle par salle dans la configuration : une photo par salle aide le client à choisir entre ta terrasse et ta cave.
`,
};
