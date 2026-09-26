import "server-only";
import { envoyerCourriel } from "@/lib/courriel/envoyer";
import { echapper, enveloppe, texteNu, type Bloc } from "@/lib/courriel/messages";
import { formatEuros } from "@/lib/devis/calcul";

/**
 * Les e-mails d'un devis.
 *
 * Ils ne passent pas par la table des courriels de réservation, et c'est
 * volontaire : celle-ci n'autorise qu'un envoi par genre et par
 * réservation, ce qui est juste pour une confirmation — on ne confirme
 * qu'une fois — et faux pour un devis, qu'un restaurateur corrige et
 * renvoie. C'est `devis.envoye_le` qui garde la trace du dernier envoi.
 */

function jourLisible(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Le devis part chez le client, avec le lien pour le lire et l'accepter. */
export async function envoyerDevisAuClient({
  destinataire,
  repondreA,
  restaurantNom,
  clientNom,
  numero,
  totalTtcCentimes,
  acompteCentimes,
  valideJusquau,
  message,
  lien,
}: {
  destinataire: string;
  repondreA?: string;
  restaurantNom: string;
  clientNom: string;
  numero: string;
  totalTtcCentimes: number;
  acompteCentimes: number | null;
  valideJusquau: string;
  message: string | null;
  lien: string;
}) {
  const details = [
    `Devis ${numero}`,
    `Total : ${formatEuros(totalTtcCentimes)} TTC`,
  ];
  if (acompteCentimes) {
    details.push(`Acompte à l'acceptation : ${formatEuros(acompteCentimes)}`);
  }
  details.push(`Valable jusqu'au ${jourLisible(valideJusquau)}`);

  const blocs: Bloc[] = [
    `Bonjour ${echapper(clientNom)},`,
    `Voici notre proposition pour votre événement.`,
    { encadre: details },
    // Le mot du restaurateur passe avant le bouton : c'est lui qui donne
    // envie d'ouvrir, pas le récapitulatif.
    ...(message ? [echapper(message)] : []),
    { bouton: { libelle: "Voir le devis", url: lien } },
    `Le détail, les conditions et la réponse à donner se trouvent sur cette page. Vous pouvez aussi nous répondre directement à cet e-mail.`,
  ];

  return envoyerCourriel({
    destinataire,
    repondreA,
    sujet: `Votre devis — ${restaurantNom}`,
    texte: texteNu(blocs, restaurantNom),
    html: enveloppe(blocs, restaurantNom),
  });
}

/**
 * La réponse du client, au restaurateur. Le refus compte autant que
 * l'acceptation : une salle qu'on croyait vendue se remet en vente.
 */
export async function prevenirReponseDevis({
  destinataire,
  clientNom,
  numero,
  accepte,
  motif,
  totalTtcCentimes,
  lien,
}: {
  destinataire: string;
  clientNom: string;
  numero: string;
  accepte: boolean;
  motif: string | null;
  totalTtcCentimes: number;
  lien: string;
}) {
  const blocs: Bloc[] = accepte
    ? [
        `<strong>${echapper(clientNom)} a accepté le devis ${echapper(numero)}.</strong>`,
        { encadre: [`Total : ${formatEuros(totalTtcCentimes)} TTC`] },
        `La demande est passée en attente de règlement si un acompte était prévu, et confirmée sinon.`,
        { bouton: { libelle: "Ouvrir le carnet", url: lien } },
      ]
    : [
        `${echapper(clientNom)} a refusé le devis ${echapper(numero)}.`,
        ...(motif ? [`Motif : ${echapper(motif)}`] : []),
        `La salle redevient disponible à la date demandée.`,
        { bouton: { libelle: "Ouvrir le carnet", url: lien } },
      ];

  return envoyerCourriel({
    destinataire,
    sujet: accepte
      ? `Devis accepté — ${clientNom}`
      : `Devis refusé — ${clientNom}`,
    texte: texteNu(blocs, "Klarr"),
    html: enveloppe(blocs, "Klarr"),
  });
}
