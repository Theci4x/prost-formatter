import { heureLisible } from "@/lib/site/horaires";

/**
 * Les messages envoyés autour d'une réservation.
 *
 * Écrits en texte d'abord, en HTML ensuite : beaucoup de clients lisent
 * leurs e-mails dans une messagerie qui n'affiche pas le HTML, et un
 * message de confirmation illisible vaut une absence de confirmation.
 *
 * Le ton est celui du restaurant, pas celui d'un logiciel : c'est le nom
 * du restaurant qui signe, et c'est à lui qu'on répond.
 */

export type Contexte = {
  restaurantNom: string;
  restaurantAdresse: string | null;
  clientNom: string;
  date: string;
  heure: string | null;
  couverts: number;
  serviceNom: string | null;
  type: "table" | "privatisation";
  /**
   * L'adresse qui permet au client de rendre sa table en un clic. Sans
   * elle, un empêchement se règle par téléphone en plein service — donc
   * le plus souvent ne se règle pas, et la table reste vide.
   */
  lienAnnulation?: string | null;
};

export type Message = { sujet: string; texte: string; html: string };

function dateLisible(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** « samedi 4 octobre à 20h, 4 couverts ». */
function rappel(c: Contexte): string {
  const quand = c.heure
    ? `${dateLisible(c.date)} à ${heureLisible(c.heure)}`
    : dateLisible(c.date);
  const combien = `${c.couverts} couvert${c.couverts > 1 ? "s" : ""}`;
  return `${quand}, ${combien}`;
}

/**
 * Un sujet tient sur une ligne. Un nom de client contenant un retour
 * chariot injecterait des en-têtes dans le message : ce champ vient d'un
 * formulaire public, il ne se recopie pas tel quel.
 */
function sujet(texte: string): string {
  return texte.replace(/[\r\n]+/g, " ").slice(0, 180);
}

function echapper(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Le HTML : volontairement pauvre. Les messageries mangent les feuilles de
 * style, les images distantes et la moitié des balises ; ce qui survit
 * partout, c'est du texte avec quelques paragraphes.
 */
function enveloppe(corps: string[], signature: string): string {
  const paragraphes = corps
    .filter((ligne) => ligne !== "")
    .map(
      (p) =>
        `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1a1614">${p}</p>`,
    )
    .join("");
  return `<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:520px">${paragraphes}<p style="margin:24px 0 0;font-size:13px;color:#6b6259">${echapper(signature)}</p></div>`;
}

/**
 * La phrase qui rend la table. Elle vient en dernier et sans emphase :
 * on ne pousse personne à annuler, on rend juste la chose possible.
 */
function ligneAnnulation(c: Contexte): string {
  return c.lienAnnulation
    ? `Un empêchement ? Rends ta table en un clic : ${echapper(c.lienAnnulation)}`
    : "";
}

/** Reçue, mais pas encore confirmée : le restaurant doit se prononcer. */
export function demandeRecue(c: Contexte): Message {
  const quoi =
    c.type === "privatisation" ? "votre demande de privatisation" : "votre demande de réservation";
  const lignes = [
    `Bonjour ${echapper(c.clientNom)},`,
    `Nous avons bien reçu ${quoi} chez ${echapper(c.restaurantNom)} : <strong>${echapper(rappel(c))}</strong>.`,
    `Elle n'est pas encore confirmée — le restaurant revient vers vous très vite. Vous recevrez un second message dès que ce sera fait.`,
    ligneAnnulation(c) || `Si vos plans changent, répondez simplement à cet e-mail.`,
  ];
  return {
    sujet: sujet(`Demande reçue — ${c.restaurantNom}`),
    texte: texteDe(lignes, c),
    html: enveloppe(lignes, c.restaurantNom),
  };
}

/** Confirmée : c'est le message que le client gardera. */
export function reservationConfirmee(c: Contexte): Message {
  const lignes = [
    `Bonjour ${echapper(c.clientNom)},`,
    `Votre table est confirmée chez ${echapper(c.restaurantNom)} : <strong>${echapper(rappel(c))}</strong>.`,
    c.restaurantAdresse
      ? `L'adresse : ${echapper(c.restaurantAdresse)}.`
      : `À très bientôt.`,
    ligneAnnulation(c) ||
      `Un empêchement ? Prévenez-nous en répondant à cet e-mail — une table rendue à temps, c'est une table qui resert.`,
  ];
  return {
    sujet: sujet(`Réservation confirmée — ${c.restaurantNom}`),
    texte: texteDe(lignes, c),
    html: enveloppe(lignes, c.restaurantNom),
  };
}

/**
 * Refusée ou annulée par l'établissement. Le pire service qu'on puisse
 * rendre à un client, c'est de le laisser croire qu'il a une table : il se
 * présente à vingt heures et repart. Ce message part donc aussi, et il dit
 * les choses.
 */
export function reservationRefusee(
  c: Contexte,
  motif: "refusee" | "annulee",
): Message {
  const lignes = [
    `Bonjour ${echapper(c.clientNom)},`,
    motif === "refusee"
      ? `${echapper(c.restaurantNom)} ne peut malheureusement pas honorer votre demande du <strong>${echapper(rappel(c))}</strong>.`
      : `${echapper(c.restaurantNom)} doit annuler votre réservation du <strong>${echapper(rappel(c))}</strong>.`,
    `Rien ne vous est facturé. Si une autre date vous convient, la page de réservation vous montre ce qui reste disponible.`,
    `Vous pouvez répondre à cet e-mail pour joindre l'établissement.`,
  ];
  return {
    sujet: sujet(
      `${motif === "refusee" ? "Demande non retenue" : "Réservation annulée"} — ${c.restaurantNom}`,
    ),
    texte: texteDe(lignes, c),
    html: enveloppe(lignes, c.restaurantNom),
  };
}

/** Pour le restaurateur : une réservation vient d'entrer. */
export function alerteRestaurateur(
  c: Contexte,
  confirmee: boolean,
  lien: string,
): Message {
  const etat = confirmee
    ? "Elle est déjà confirmée automatiquement."
    : "<strong>Elle attend votre validation.</strong>";
  const lignes = [
    `${c.type === "privatisation" ? "Demande de privatisation" : "Nouvelle réservation"} : <strong>${echapper(c.clientNom)}</strong>, ${echapper(rappel(c))}.`,
    c.serviceNom ? `Service : ${echapper(c.serviceNom)}.` : "",
    etat,
    `Le carnet : ${echapper(lien)}`,
  ];
  return {
    sujet: sujet(
      `${confirmee ? "Réservation" : "À valider"} — ${c.clientNom}, ${rappel(c)}`,
    ),
    texte: texteDe(lignes, c),
    html: enveloppe(lignes, "Klarr"),
  };
}

/**
 * Le rappel de la veille.
 *
 * Ce n'est pas une politesse : c'est le deuxième levier sur le no-show,
 * après l'annulation en un clic. Un client prévenu la veille se souvient
 * — et s'il ne peut plus venir, c'est ce message-là qui le lui fait
 * dire, pendant qu'il reste une soirée pour revendre la table.
 *
 * D'où le lien d'annulation, mis en évidence plutôt que caché : on ne
 * cherche pas à retenir quelqu'un qui ne viendra pas.
 */
export function rappelReservation(c: Contexte): Message {
  const lignes = [
    `Bonjour ${echapper(c.clientNom)},`,
    `Petit rappel : vous êtes attendus <strong>${echapper(rappel(c))}</strong> chez ${echapper(c.restaurantNom)}.`,
    c.restaurantAdresse
      ? `L'adresse : ${echapper(c.restaurantAdresse)}.`
      : `À demain.`,
    ligneAnnulation(c) ||
      `Un empêchement ? Répondez à cet e-mail, l'établissement préfère le savoir ce soir que demain à table.`,
  ];
  return {
    sujet: sujet(`Demain — ${c.restaurantNom}, ${rappel(c)}`),
    texte: texteDe(lignes, c),
    html: enveloppe(lignes, c.restaurantNom),
  };
}

/**
 * Pour le restaurateur : le client vient de rendre sa table.
 *
 * C'est une bonne nouvelle, et le message le dit — la table est de
 * nouveau vendable, et elle l'est d'autant mieux qu'on l'apprend tôt.
 */
export function alerteAnnulationClient(c: Contexte, lien: string): Message {
  const lignes = [
    `<strong>${echapper(c.clientNom)}</strong> vient d'annuler : ${echapper(rappel(c))}.`,
    `La table est de nouveau disponible à la réservation — personne n'a eu à décrocher le téléphone.`,
    `Le carnet : ${echapper(lien)}`,
  ];
  return {
    sujet: sujet(`Annulation — ${c.clientNom}, ${rappel(c)}`),
    texte: texteDe(lignes, c),
    html: enveloppe(lignes, "Klarr"),
  };
}

/**
 * La version texte : les mêmes lignes, sans balises et sans entités. Les
 * lignes sont écrites pour le HTML, donc échappées ; les relire telles
 * quelles afficherait « Chez Paul &amp; Fils » dans un message qui n'a
 * pourtant rien de HTML.
 */
function texteDe(lignes: string[], c: Contexte): string {
  const nu = lignes.filter((ligne) => ligne !== "").map(deshtml);
  return `${nu.join("\n\n")}\n\n— ${c.restaurantNom}`;
}

function deshtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}
