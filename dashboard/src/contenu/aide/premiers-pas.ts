import type { Article } from "@/types/aide";

export const article: Article = {
  slug: "premiers-pas",
  titre: "Créer son établissement",
  resume:
    "Les cinq minutes qui séparent un compte vide d'une page de réservation en ligne.",
  categorie: "demarrer",
  ordre: 1,
  questions: [
    "Comment je commence ?",
    "Comment créer mon restaurant sur Klarr ?",
    "Par quoi commencer ?",
  ],
  markdown: `
Klarr a besoin de trois choses pour commencer à prendre des réservations à ta place : **ton établissement**, **au moins une salle**, et **au moins un service**. Tant qu'il manque l'un des trois, ta page de réservation n'a rien à proposer et reste fermée.

## 1. Ton établissement

Depuis le tableau de bord, **Ajouter un établissement**. Le nom et l'adresse suffisent.

Le nom est celui que verront tes clients, en haut de ta page de réservation. C'est aussi lui qui servira à fabriquer l'adresse de cette page, alors écris-le comme tu veux qu'on le lise.

Tu peux gérer plusieurs établissements avec le même compte : ils apparaissent côte à côte sur le tableau de bord, chacun avec sa configuration.

## 2. Tes salles

Va dans **Réservations**, puis **Espaces, services et page publique**.

Une salle, c'est un endroit qui accueille des convives : la salle du bas, le premier étage, la terrasse, la cave. Pour chacune, tu donnes :

- **un nom** — celui que tu emploies, pas un nom technique ;
- **une capacité en couverts** — le nombre de personnes que tu peux y asseoir en même temps ;
- **ce qu'elle accepte** : des réservations individuelles, la privatisation, ou les deux.

Une salle qui n'accepte que la privatisation ne se loue qu'en entier. Un groupe qui la prend la prend toute, et Klarr n'y proposera jamais une table de deux en même temps.

Si tu privatises, indique à partir de combien de convives. En dessous, Klarr refusera poliment plutôt que de te faire bloquer une salle pour six personnes.

## 3. Tes services

Toujours au même endroit, plus bas.

Un service, c'est un créneau pendant lequel tu prends des réservations : le déjeuner, le dîner. Pour chacun :

- **le nom** et les **heures** de début et de fin ;
- **les jours** de la semaine où il tourne ;
- **le délai de prévenance** : combien d'heures avant le service tu arrêtes d'accepter les demandes en ligne. Mets 0 si tu prends la dernière minute.

Un service peut finir après minuit. Saisis simplement 17h30 à 2h : Klarr comprend que la fin est le lendemain et l'affiche clairement.

Le déjeuner et le dîner comptent séparément. Une salle privatisée à midi reste disponible le soir.

## 4. Ouvrir ta page

Une fois que tu as au moins une salle et un service, un bouton apparaît : **Ouvrir ma page de réservation**.

Klarr fabrique alors une adresse dérivée du nom de ton établissement. C'est elle que tu partages sur ta fiche Google, ton Instagram et ta page Facebook.

Profites-en pour ajouter, sur le même écran :

- **ton logo**, affiché en haut de ta page ;
- **tes mentions légales**, affichées en bas. C'est toi qui contractes avec le client, pas Klarr : raison sociale, SIRET, adresse, conditions d'annulation.

## Et ensuite ?

Tes clients peuvent réserver. Les demandes arrivent dans **Réservations**, et ce que tu dois faire le jour même se passe sur l'**écran de service**.
`,
};
