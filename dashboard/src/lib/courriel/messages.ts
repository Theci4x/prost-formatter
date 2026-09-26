import type { Langue } from "@/lib/i18n/langues";
import { COURRIELS } from "@/lib/i18n/courriels";
import { dateJour } from "@/lib/i18n/dates";
import { heure as heureTraduite } from "@/lib/i18n/jours";

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
   * Pour les alertes au restaurateur : où retrouver la réservation dans
   * Klarr. Sans lui, l'e-mail annonce une table et laisse chercher le
   * tableau de bord ; avec lui, un geste suffit — y compris depuis le
   * téléphone, où l'on passe par la connexion puis revient ici.
   */
  lienCarnet?: string | null;
  /**
   * L'engagement de consommation, tel qu'il a été annoncé. Il figure
   * dans le message parce qu'un engagement qu'on ne peut pas relire se
   * conteste à l'addition.
   */
  minimumConsommation?: string | null;
  /**
   * La langue du client, lue au moment où il a rempli le formulaire et
   * rangée avec la réservation. Pas devinée à l'envoi : le rappel part la
   * nuit, sans personne au bout du fil à qui la redemander.
   *
   * Facultative, et le français par défaut : les alertes au restaurateur
   * n'en passent pas, et les réservations d'avant la migration 0074 n'en
   * ont pas.
   */
  langue?: Langue;
};

/** Le dictionnaire du client, ou le français faute de mieux. */
function mots(c: Contexte) {
  return COURRIELS[c.langue ?? "fr"] ?? COURRIELS.fr;
}

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
  | { encadre: string[] }
  /**
   * Un code à montrer au comptoir : gros, espacé, centré. Le lot de la
   * roue en a un, et c'est la seule chose de la lettre qu'on cherche
   * trois semaines plus tard.
   */
  | { code: { libelle: string; valeur: string } }
  /**
   * Du HTML déjà construit, posé tel quel : la grille de chiffres du
   * rapport mensuel ne rentre dans aucun des blocs ci-dessus. Il doit
   * être échappé par celui qui l'écrit.
   */
  | { brut: string };

const ENCRE = "#1f1b17";
const ENCRE_DOUCE = "#7a7168";
const FOND = "#f4f1ec";
const BORDURE = "#e9e3da";
const MARQUE = "#0f1e3d";
const POLICE =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/** « samedi 4 octobre à 20h », « Saturday 4 October at 20:00 », « 10月4日星期六 20:00 ». */
function quand(c: Contexte): string {
  const langue = c.langue ?? "fr";
  const jour = dateJour(c.date, langue);
  if (!c.heure) return jour;
  const h = heureTraduite(c.heure, langue);
  // « à » ne se traduit pas mot à mot : l'anglais dit « at », le chinois
  // ne met rien du tout entre la date et l'heure.
  if (langue === "en") return `${jour} at ${h}`;
  if (langue === "zh") return `${jour} ${h}`;
  return `${jour} à ${h}`;
}

/** « samedi 4 octobre à 20h, 4 couverts ». */
function rappel(c: Contexte): string {
  return mots(c).quandEtCombien(quand(c), c.couverts);
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
    ? mots(c).minimumConvenu(echapper(c.minimumConsommation))
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
  const m = mots(c);
  return c.lienAnnulation
    ? m.unChangement(lien(m.libelleLienChangement, c.lienAnnulation))
    : "";
}

/** Le quand et le combien, détachés du texte pour se relire d'un coup d'œil. */
function encadre(c: Contexte): Bloc {
  const lignes = [
    quand(c),
    mots(c).couvertsEtService(c.couverts, c.serviceNom),
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

function codeHtml(libelle: string, valeur: string): string {
  return [
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px"><tr>`,
    `<td align="center" bgcolor="${FOND}" style="padding:18px 16px;background:${FOND};border-radius:12px">`,
    `<div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;color:${ENCRE_DOUCE}">${echapper(libelle)}</div>`,
    `<div style="margin-top:6px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:32px;font-weight:700;letter-spacing:0.18em;color:${MARQUE}">${echapper(valeur)}</div>`,
    `</td></tr></table>`,
  ].join("");
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
  /** Le français par défaut : les alertes au restaurateur n'en passent pas. */
  langue: Langue = "fr",
): string {
  const corps = blocs
    .filter((bloc) => bloc !== "")
    .map((bloc) => {
      if (typeof bloc === "string") return paragraphe(bloc);
      if ("bouton" in bloc)
        return boutonHtml(bloc.bouton.libelle, bloc.bouton.url);
      if ("code" in bloc) return codeHtml(bloc.code.libelle, bloc.code.valeur);
      if ("brut" in bloc) return bloc.brut;
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
    `<p style="margin:16px 0 0;font-family:${POLICE};font-size:11px;color:${ENCRE_DOUCE}">${echapper((COURRIELS[langue] ?? COURRIELS.fr).envoyeParKlarr)}</p>`,
    `</td></tr></table>`,
  ].join("");
}

/** Reçue, mais pas encore confirmée : le restaurant doit se prononcer. */
export function demandeRecue(c: Contexte): Message {
  const m = mots(c);
  const maison = echapper(c.restaurantNom);
  const blocs: Bloc[] = [
    m.bonjour(echapper(c.clientNom)),
    c.type === "privatisation"
      ? m.bienRecuPrivatisation(maison)
      : m.bienRecuReservation(maison),
    encadre(c),
    ligneMinimum(c),
    m.pasEncoreConfirmee,
    ligneAnnulation(c) || m.siVosPlansChangent,
  ];
  return {
    sujet: sujet(m.demandeRecueSujet(c.restaurantNom)),
    texte: texteDe(blocs, c),
    html: enveloppe(blocs, c.restaurantNom, undefined, c.langue),
  };
}

/** Confirmée : c'est le message que le client gardera. */
export function reservationConfirmee(c: Contexte): Message {
  const m = mots(c);
  const blocs: Bloc[] = [
    m.bonjour(echapper(c.clientNom)),
    m.tableConfirmee(echapper(c.restaurantNom)),
    encadre(c),
    ligneMinimum(c),
    ligneAnnulation(c) || m.unEmpechement,
  ];
  return {
    sujet: sujet(m.confirmeeSujet(c.restaurantNom)),
    texte: texteDe(blocs, c),
    html: enveloppe(blocs, c.restaurantNom, undefined, c.langue),
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
  const m = mots(c);
  const maison = echapper(c.restaurantNom);
  const quandLa = echapper(rappel(c));
  const blocs: Bloc[] = [
    m.bonjour(echapper(c.clientNom)),
    motif === "refusee"
      ? m.nePeutHonorer(maison, quandLa)
      : m.doitAnnuler(maison, quandLa),
    m.rienNestFacture,
    m.repondezACetEmail,
  ];
  return {
    sujet: sujet(
      motif === "refusee"
        ? m.refuseeSujet(c.restaurantNom)
        : m.annuleeSujet(c.restaurantNom),
    ),
    texte: texteDe(blocs, c),
    html: enveloppe(blocs, c.restaurantNom, undefined, c.langue),
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
  const m = mots(c);
  const blocs: Bloc[] = [
    m.bonjour(echapper(c.clientNom)),
    m.bienModifiee(echapper(c.restaurantNom)),
    encadre(c),
    ligneMinimum(c),
    ligneAnnulation(c),
  ].filter(Boolean) as Bloc[];

  return {
    sujet: sujet(m.modifieeSujet(c.restaurantNom)),
    texte: texteNu(blocs, c.restaurantNom, undefined, c.langue),
    html: enveloppe(blocs, c.restaurantNom, undefined, c.langue),
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
  // Un seul bouton, et il dit ce qu'on va faire : regarder une table déjà
  // acquise, ou trancher une demande qui attend.
  if (c.lienCarnet) {
    blocs.push({
      bouton: {
        libelle: confirmee ? "Voir la réservation" : "Accepter ou refuser",
        url: c.lienCarnet,
      },
    });
  }
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
  const m = mots(c);
  const montant = echapper(garantie.montant);

  const blocs: Bloc[] = [
    m.bonjour(echapper(c.clientNom)),
    m.bonneNouvelle(echapper(c.restaurantNom)),
    encadre(c),
    ligneMinimum(c),
    garantie.caution ? m.resteLaCarte(montant) : m.resteLAcompte(montant),
    {
      bouton: {
        libelle: garantie.caution ? m.boutonCarte : m.boutonAcompte,
        url,
      },
    },
    garantie.echeance
      ? m.salleReserveeJusqua(echapper(garantie.echeance))
      : m.salleReservee,
  ];

  return {
    sujet: sujet(
      garantie.caution
        ? m.sujetCarte(c.restaurantNom)
        : m.sujetAcompte(c.restaurantNom),
    ),
    texte: texteDe(blocs, c),
    html: enveloppe(blocs, c.restaurantNom, undefined, c.langue),
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
  const m = mots(c);
  const blocs: Bloc[] = [
    m.bonjour(echapper(c.clientNom)),
    m.petitRappel(echapper(c.restaurantNom)),
    encadre(c),
    ligneAnnulation(c) || m.empechementRappel,
  ];
  return {
    sujet: sujet(m.rappelSujet(c.restaurantNom, rappel(c))),
    texte: texteDe(blocs, c),
    html: enveloppe(blocs, c.restaurantNom, undefined, c.langue),
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
  return texteNu(blocs, c.restaurantNom, undefined, c.langue);
}

/** La version texte d'un message, signée du nom qu'on lui donne. */
export function texteNu(
  blocs: Bloc[],
  signature: string,
  pied?: string,
  /** Le français par défaut : les campagnes et les alertes n'en passent pas. */
  langue: Langue = "fr",
): string {
  const m = COURRIELS[langue] ?? COURRIELS.fr;
  const nu = blocs
    .filter((bloc) => bloc !== "")
    .map((bloc) => {
      if (typeof bloc === "string") return deshtml(bloc, langue);
      if ("bouton" in bloc)
        return m.lienTexte(bloc.bouton.libelle, bloc.bouton.url);
      if ("code" in bloc)
        return m.lienTexte(bloc.code.libelle, bloc.code.valeur);
      // Le HTML brut n'a pas d'équivalent texte : qui l'emploie écrit
      // sa version texte à part.
      if ("brut" in bloc) return "";
      return bloc.encadre.join("\n");
    })
    .filter((morceau) => morceau !== "");
  const corps = `${nu.join("\n\n")}\n\n— ${signature}`;
  return pied ? `${corps}\n\n—\n${deshtml(pied, langue)}` : corps;
}

function deshtml(html: string, langue: Langue = "fr"): string {
  const m = COURRIELS[langue] ?? COURRIELS.fr;
  return (
    html
      .replace(/<a href="([^"]*)"[^>]*>([^<]*)<\/a>/g, (_, url, libelle) =>
        m.lienTexte(libelle, url),
      )
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
