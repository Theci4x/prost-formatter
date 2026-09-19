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
 *
 * La mise en forme obéit aux contraintes du courriel, pas à celles du
 * web : tableaux plutôt que flex, styles en ligne plutôt que feuille de
 * style, aucune image distante. Ce qui survit à Outlook, à Gmail et à la
 * messagerie d'un téléphone, c'est ça et rien d'autre.
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
   * L'adresse où le client reprend la main : décaler l'heure, changer le
   * nombre de convives, ou rendre la table. Sans elle, un changement se
   * règle par téléphone en plein service — donc le plus souvent ne se
   * règle pas, et la table reste vide ou mal dimensionnée.
   */
  lienAnnulation?: string | null;
  /**
   * L'engagement de consommation, tel qu'il a été annoncé. Il figure
   * dans le message parce qu'un engagement qu'on ne peut pas relire se
   * conteste à l'addition.
   */
  minimumConsommation?: string | null;
};

export type Message = { sujet: string; texte: string; html: string };

/**
 * Un message se compose de trois sortes de blocs. Le texte courant, le
 * bouton — un seul par message, sans quoi aucun n'est l'action — et
 * l'encadré qui porte le quand et le combien, seule chose qu'un client
 * relit vraiment.
 */
export type Bloc =
  | string
  | { bouton: { libelle: string; url: string } }
  | { encadre: string[] };

const ENCRE = "#1f1b17";
const ENCRE_DOUCE = "#7a7168";
const FOND = "#f4f1ec";
const BORDURE = "#e9e3da";
const MARQUE = "#0f1e3d";
const POLICE =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

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

export function echapper(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Dans un attribut, le guillemet referme la valeur : il s'échappe aussi. */
function echapperUrl(url: string): string {
  return echapper(url).replace(/"/g, "&quot;");
}

/**
 * Un lien dans une phrase. L'adresse ne s'affiche pas : une suite de
 * trente caractères aléatoires au milieu d'un paragraphe fait douter de
 * l'expéditeur, alors même qu'elle prouve le contraire.
 */
export function lien(libelle: string, url: string): string {
  return `<a href="${echapperUrl(url)}" style="color:${MARQUE};text-decoration:underline">${echapper(libelle)}</a>`;
}

/** L'engagement pris, rappelé au client. Vide quand il n'y en a pas. */
function ligneMinimum(c: Contexte): string {
  return c.minimumConsommation
    ? `Minimum de consommation convenu : <strong>${echapper(c.minimumConsommation)}</strong>. Rien n'a été encaissé : ce montant se règle sur place.`
    : "";
}

/**
 * La phrase qui laisse la main au client. Elle vient en dernier, en lien
 * discret et non en bouton : on ne pousse personne à annuler, on rend
 * juste la chose possible.
 *
 * Elle parlait d'annulation seule, et c'est ce que le lien savait faire.
 * Il permet maintenant de décaler l'heure ou de changer le nombre de
 * convives — ce que le client veut presque toujours faire en réalité. Le
 * dire dans cet ordre n'est pas cosmétique : un client qui ne lit que
 * « annuler » annule, puis refait une réservation, et la table passe par
 * une minute de vide où quelqu'un d'autre peut la prendre.
 */
function ligneAnnulation(c: Contexte): string {
  return c.lienAnnulation
    ? `Un changement ? ${lien("Modifiez ou annulez votre réservation", c.lienAnnulation)} — l'heure, le nombre de convives, ou rendre la table.`
    : "";
}

/** Le quand et le combien, détachés du texte pour se relire d'un coup d'œil. */
function encadre(c: Contexte): Bloc {
  const lignes = [
    c.heure
      ? `${dateLisible(c.date)} à ${heureLisible(c.heure)}`
      : dateLisible(c.date),
    `${c.couverts} couvert${c.couverts > 1 ? "s" : ""}${
      c.serviceNom ? ` · ${c.serviceNom}` : ""
    }`,
  ];
  if (c.restaurantAdresse) lignes.push(c.restaurantAdresse);
  return { encadre: lignes };
}

function paragraphe(html: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${ENCRE}">${html}</p>`;
}

function boutonHtml(libelle: string, url: string): string {
  return [
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 22px">`,
    `<tr><td style="border-radius:8px;background:${MARQUE}">`,
    `<a href="${echapperUrl(url)}" style="display:inline-block;padding:13px 28px;font-family:${POLICE};font-size:15px;font-weight:600;line-height:1;color:#ffffff;text-decoration:none;border-radius:8px">${echapper(libelle)}</a>`,
    `</td></tr></table>`,
  ].join("");
}

function encadreHtml(lignes: string[]): string {
  const contenu = lignes
    .map(
      (ligne, i) =>
        `<div style="font-size:${i === 0 ? "17px" : "14px"};line-height:1.5;color:${
          i === 0 ? ENCRE : ENCRE_DOUCE
        };${i === 0 ? "font-weight:600;" : "margin-top:4px;"}">${echapper(ligne)}</div>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px"><tr><td style="padding:16px 18px;background:${FOND};border-radius:10px;border-left:3px solid ${MARQUE}">${contenu}</td></tr></table>`;
}

/**
 * L'enveloppe : une carte claire sur fond chaud, le nom qui signe en
 * tête plutôt qu'en pied. Tout est en tableaux et en styles en ligne —
 * c'est laid à écrire, c'est la seule chose qui s'affiche partout.
 */
export function enveloppe(
  blocs: Bloc[],
  signature: string,
  /**
   * Les mentions de pied, pour les messages qui en ont l'obligation :
   * qui écrit, et comment ne plus recevoir. Une confirmation de
   * réservation n'en a pas besoin — ce n'est pas de la prospection —, une
   * campagne ne peut pas s'en passer.
   */
  pied?: string,
): string {
  const corps = blocs
    .filter((bloc) => bloc !== "")
    .map((bloc) => {
      if (typeof bloc === "string") return paragraphe(bloc);
      if ("bouton" in bloc)
        return boutonHtml(bloc.bouton.libelle, bloc.bouton.url);
      return encadreHtml(bloc.encadre);
    })
    .join("");

  return [
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${FOND};width:100%">`,
    `<tr><td align="center" style="padding:28px 12px">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:544px;background:#ffffff;border:1px solid ${BORDURE};border-radius:14px">`,
    `<tr><td style="padding:30px 32px 26px;font-family:${POLICE}">`,
    `<p style="margin:0 0 22px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;color:${MARQUE}">${echapper(signature)}</p>`,
    corps,
    `</td></tr></table>`,
    pied
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:544px"><tr><td style="padding:18px 32px 0;font-family:${POLICE};font-size:11px;line-height:1.6;color:${ENCRE_DOUCE};text-align:center">${pied}</td></tr></table>`
      : "",
    `<p style="margin:16px 0 0;font-family:${POLICE};font-size:11px;color:${ENCRE_DOUCE}">Envoyé par Klarr</p>`,
    `</td></tr></table>`,
  ].join("");
}

/** Reçue, mais pas encore confirmée : le restaurant doit se prononcer. */
export function demandeRecue(c: Contexte): Message {
  const quoi =
    c.type === "privatisation"
      ? "votre demande de privatisation"
      : "votre demande de réservation";
  const blocs: Bloc[] = [
    `Bonjour ${echapper(c.clientNom)},`,
    `Nous avons bien reçu ${quoi} chez ${echapper(c.restaurantNom)}.`,
    encadre(c),
    ligneMinimum(c),
    `Elle n'est pas encore confirmée — le restaurant revient vers vous très vite. Vous recevrez un second message dès que ce sera fait.`,
    ligneAnnulation(c) ||
      `Si vos plans changent, répondez simplement à cet e-mail.`,
  ];
  return {
    sujet: sujet(`Demande reçue — ${c.restaurantNom}`),
    texte: texteDe(blocs, c),
    html: enveloppe(blocs, c.restaurantNom),
  };
}

/** Confirmée : c'est le message que le client gardera. */
export function reservationConfirmee(c: Contexte): Message {
  const blocs: Bloc[] = [
    `Bonjour ${echapper(c.clientNom)},`,
    `Votre table est confirmée chez ${echapper(c.restaurantNom)}.`,
    encadre(c),
    ligneMinimum(c),
    ligneAnnulation(c) ||
      `Un empêchement ? Prévenez-nous en répondant à cet e-mail — une table rendue à temps, c'est une table qui resert.`,
  ];
  return {
    sujet: sujet(`Réservation confirmée — ${c.restaurantNom}`),
    texte: texteDe(blocs, c),
    html: enveloppe(blocs, c.restaurantNom),
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
  const blocs: Bloc[] = [
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
    texte: texteDe(blocs, c),
    html: enveloppe(blocs, c.restaurantNom),
  };
}

/** Pour le restaurateur : une réservation vient d'entrer. */
/**
 * Le client a changé son heure ou son nombre de convives.
 *
 * Ces deux messages ne passent pas par la table des envois : celle-ci
 * n'autorise qu'un courriel par genre et par réservation, ce qui est juste
 * pour une confirmation — on ne confirme qu'une fois — et faux pour une
 * modification, qu'un client peut faire deux fois dans la semaine.
 */
export function reservationModifiee(c: Contexte): Message {
  const blocs: Bloc[] = [
    `Bonjour ${echapper(c.clientNom)},`,
    `Votre réservation chez ${echapper(c.restaurantNom)} a bien été modifiée.`,
    encadre(c),
    ligneMinimum(c),
    ligneAnnulation(c),
  ].filter(Boolean) as Bloc[];

  return {
    sujet: sujet(`Réservation modifiée — ${c.restaurantNom}`),
    texte: texteNu(blocs, c.restaurantNom),
    html: enveloppe(blocs, c.restaurantNom),
  };
}

/** La même nouvelle, côté maison : c'est le plan de salle qui bouge. */
export function alerteModification(c: Contexte, avant: string): Message {
  const blocs: Bloc[] = [
    `<strong>${echapper(c.clientNom)} a modifié sa réservation.</strong>`,
    `Auparavant : ${echapper(avant)}`,
    encadre(c),
    `La disponibilité a été revérifiée avant d'accepter le changement.`,
  ];

  return {
    sujet: sujet(`Réservation modifiée — ${c.clientNom}`),
    texte: texteNu(blocs, "Klarr"),
    html: enveloppe(blocs, "Klarr"),
  };
}

export function alerteRestaurateur(c: Contexte, confirmee: boolean): Message {
  const etat = confirmee
    ? "Elle est déjà confirmée automatiquement."
    : "<strong>Elle attend votre validation.</strong>";
  const blocs: Bloc[] = [
    `${c.type === "privatisation" ? "Demande de privatisation" : "Nouvelle réservation"} : <strong>${echapper(c.clientNom)}</strong>.`,
    encadre(c),
    etat,
  ];
  return {
    sujet: sujet(
      `${confirmee ? "Réservation" : "À valider"} — ${c.clientNom}, ${rappel(c)}`,
    ),
    texte: texteDe(blocs, c),
    html: enveloppe(blocs, "Klarr"),
  };
}

/**
 * Le lien de paiement, envoyé au client quand sa demande est acceptée.
 *
 * Le message dit trois choses, dans cet ordre : la bonne nouvelle, ce
 * qu'il reste à faire, et jusqu'à quand. C'est le seul message à porter
 * un bouton — parce que c'est le seul dont l'action appartient au
 * destinataire. Le restaurateur, lui, est déjà dans son carnet.
 */
export function lienDePaiement(
  c: Contexte,
  url: string,
  garantie: { montant: string; caution: boolean; echeance: string | null },
): Message {
  const quoi = garantie.caution
    ? `Pour la confirmer définitivement, il reste à enregistrer une carte en garantie de <strong>${echapper(garantie.montant)}</strong>. <strong>Rien ne sera prélevé</strong> : elle ne serait débitée qu'en cas de défection.`
    : `Pour la confirmer définitivement, il reste à régler un acompte de <strong>${echapper(garantie.montant)}</strong>, qui viendra en déduction de l'addition.`;

  const blocs: Bloc[] = [
    `Bonjour ${echapper(c.clientNom)},`,
    `Bonne nouvelle : ${echapper(c.restaurantNom)} a accepté votre demande.`,
    encadre(c),
    ligneMinimum(c),
    quoi,
    {
      bouton: {
        libelle: garantie.caution ? "Enregistrer ma carte" : "Régler l'acompte",
        url,
      },
    },
    garantie.echeance
      ? `La salle vous est réservée jusqu'au ${echapper(garantie.echeance)}. Passé ce délai, elle repart à la réservation.`
      : `La salle vous est réservée le temps de cette formalité.`,
  ];

  return {
    sujet: sujet(
      `${garantie.caution ? "Carte à enregistrer" : "Acompte à régler"} — ${c.restaurantNom}`,
    ),
    texte: texteDe(blocs, c),
    html: enveloppe(blocs, c.restaurantNom),
  };
}

/**
 * Le rappel de la veille.
 *
 * Ce n'est pas une politesse : c'est le deuxième levier sur le no-show,
 * après l'annulation en un clic. Un client prévenu la veille se souvient
 * — et s'il ne peut plus venir, c'est ce message-là qui le lui fait
 * dire, pendant qu'il reste une soirée pour revendre la table.
 */
export function rappelReservation(c: Contexte): Message {
  const blocs: Bloc[] = [
    `Bonjour ${echapper(c.clientNom)},`,
    `Petit rappel : vous êtes attendus chez ${echapper(c.restaurantNom)}.`,
    encadre(c),
    ligneAnnulation(c) ||
      `Un empêchement ? Répondez à cet e-mail, l'établissement préfère le savoir ce soir que demain à table.`,
  ];
  return {
    sujet: sujet(`Demain — ${c.restaurantNom}, ${rappel(c)}`),
    texte: texteDe(blocs, c),
    html: enveloppe(blocs, c.restaurantNom),
  };
}

/**
 * Pour le restaurateur : le client vient de rendre sa table.
 *
 * C'est une bonne nouvelle, et le message le dit — la table est de
 * nouveau vendable, et elle l'est d'autant mieux qu'on l'apprend tôt.
 */
export function alerteAnnulationClient(c: Contexte): Message {
  const blocs: Bloc[] = [
    `<strong>${echapper(c.clientNom)}</strong> vient d'annuler.`,
    encadre(c),
    `La table est de nouveau disponible à la réservation — personne n'a eu à décrocher le téléphone.`,
  ];
  return {
    sujet: sujet(`Annulation — ${c.clientNom}, ${rappel(c)}`),
    texte: texteDe(blocs, c),
    html: enveloppe(blocs, "Klarr"),
  };
}

/**
 * La version texte : les mêmes blocs, sans balises et sans entités. Les
 * lignes sont écrites pour le HTML, donc échappées ; les relire telles
 * quelles afficherait « Chez Paul &amp; Fils » dans un message qui n'a
 * pourtant rien de HTML.
 *
 * Un lien, lui, doit redevenir visible : le texte brut ne sait pas
 * cliquer, et une adresse cachée y devient une adresse perdue.
 */
function texteDe(blocs: Bloc[], c: Contexte): string {
  return texteNu(blocs, c.restaurantNom);
}

/** La version texte d'un message, signée du nom qu'on lui donne. */
export function texteNu(
  blocs: Bloc[],
  signature: string,
  pied?: string,
): string {
  const nu = blocs
    .filter((bloc) => bloc !== "")
    .map((bloc) => {
      if (typeof bloc === "string") return deshtml(bloc);
      if ("bouton" in bloc)
        return `${bloc.bouton.libelle} : ${bloc.bouton.url}`;
      return bloc.encadre.join("\n");
    });
  const corps = `${nu.join("\n\n")}\n\n— ${signature}`;
  return pied ? `${corps}\n\n—\n${deshtml(pied)}` : corps;
}

function deshtml(html: string): string {
  return (
    html
      .replace(/<a href="([^"]*)"[^>]*>([^<]*)<\/a>/g, "$2 : $1")
      // Le point de la phrase collé à l'adresse : plusieurs messageries
      // l'avalent dans le lien cliquable, et le lien ne mène nulle part.
      .replace(/(https?:\/\/[^\s]*[^\s.])\.(?=\s|$)/g, "$1")
      // Une coupure de ligne se retire du HTML, elle ne disparaît pas du
      // texte : sans ça, deux lignes écrites l'une sous l'autre par le
      // restaurateur arrivent collées bout à bout — « … du marché.Et la
      // tarte aux quetsches ». Vu sur la première campagne d'essai.
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
  );
}
