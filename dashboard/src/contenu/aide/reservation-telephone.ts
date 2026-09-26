import type { Article } from "@/types/aide";

export const article: Article = {
  slug: "reservation-telephone",
  titre: "Prendre une réservation au téléphone",
  resume:
    "Saisir une réservation reçue par téléphone pour qu'elle compte comme les autres.",
  categorie: "reservations",
  ordre: 2,
  questions: [
    "Comment ajouter une réservation à la main ?",
    "Un client a appelé, comment je l'enregistre ?",
    "C'est quoi le bouton Forcer ?",
  ],
  markdown: `
La moitié de tes réservations arrive encore par téléphone. Si elles ne sont pas dans Klarr, tes jauges sont fausses et ta page en ligne promet des places que tu n'as plus.

## Où

Le bouton **« + Réservation prise au téléphone »** est présent à deux endroits : sur la page **Réservations** et sur l'**écran de service**. Le second est plus pratique en plein coup de feu.

## Ce qu'il faut saisir

Le nom, la date, le nombre de convives et le service. Le téléphone est facultatif mais très utile : il devient cliquable sur l'écran de service, pour rappeler en un geste.

Le champ **type** distingue deux cas :

- **Réservation individuelle** — une table ordinaire. Tu n'as pas à choisir la salle, Klarr s'en charge.
- **Privatisation** — un groupe prend une salle entière. Là, tu choisis laquelle.

La **note interne** n'est jamais montrée au client. C'est pour toi et ton équipe : « table près de la fenêtre », « allergie arachides », « anniversaire, prévoir une bougie ».

## Forcer

La case **Forcer** enregistre la réservation même si la jauge est pleine.

À utiliser quand tu sais que ça passe : tu ajoutes deux chaises au bout d'une table, tu sais qu'un groupe partira tôt. Klarr ne t'en empêche pas — il t'a prévenu, tu décides.

Une réservation prise au téléphone est confirmée d'office : tu l'as déjà acceptée en décrochant.
`,
};
