import "server-only";
import {
  echapper,
  enveloppe,
  lien,
  texteNu,
  type Bloc,
} from "@/lib/courriel/messages";
import { siteUrl } from "@/lib/site-url";

/**
 * Le message d'une campagne.
 *
 * Il réutilise l'enveloppe des confirmations de réservation : même carte,
 * même police, même nom du restaurant qui signe en tête. Un client qui a
 * déjà reçu une confirmation reconnaît la maison, et c'est exactement ce
 * qu'on veut — il n'a pas l'impression d'être passé dans une liste de
 * diffusion achetée quelque part.
 *
 * Ce qui change, c'est le pied. Une campagne est de la prospection : elle
 * doit dire qui écrit et comment ne plus recevoir. Ce n'est pas une
 * politesse, c'est la condition pour avoir le droit de l'envoyer.
 */

export type Campagne = {
  objet: string;
  texte: string;
  bouton_libelle: string | null;
  bouton_url: string | null;
};

export type Maison = {
  nom: string;
  adresse: string | null;
};

/** L'adresse de désinscription d'une personne, dans chaque message. */
export function lienDesabonnement(jeton: string): string {
  return `${siteUrl()}/desabonnement/${jeton}`;
}

/**
 * La même chose pour le bouton natif de la messagerie.
 *
 * Ce n'est pas la page mais une route qui n'accepte que POST : c'est ce
 * que réclame la norme du désabonnement en un clic, et c'est aussi ce qui
 * protège la page — un antivirus qui visite les liens d'un message
 * fait des GET, jamais des POST, et ne désinscrira donc personne.
 */
export function lienDesabonnementUnClic(jeton: string): string {
  return `${siteUrl()}/api/desabonnement/${jeton}`;
}

/**
 * Le texte du restaurateur, découpé en paragraphes.
 *
 * Une ligne vide sépare deux paragraphes, comme partout ailleurs. Le
 * contenu est échappé : c'est du texte saisi dans un champ, il ne doit
 * pas pouvoir devenir du HTML — ni par malveillance, ni par accident, et
 * un « < » tapé au clavier ne doit pas avaler la fin du message.
 */
function paragraphes(texte: string): Bloc[] {
  return texte
    .split(/\n\s*\n/)
    .map((bloc) => bloc.trim())
    .filter(Boolean)
    .map((bloc) => echapper(bloc).replace(/\n/g, "<br />"));
}

/**
 * Le pied obligatoire.
 *
 * Trois choses, et pas une de plus : qui écrit, où il est, comment
 * partir. L'adresse postale n'est pas décorative — la loi demande que le
 * destinataire puisse identifier l'expéditeur, et « Prost » tout court
 * n'identifie personne.
 *
 * Le rappel du pourquoi compte autant : quelqu'un qui ne se souvient pas
 * d'avoir donné son adresse signale le message comme indésirable, et
 * c'est ce signalement-là qui coûte cher — à ce restaurant et à tous les
 * autres qui partagent le domaine d'envoi.
 */
function pied(maison: Maison, jeton: string): string {
  const morceaux = [
    `Vous recevez ce message parce que vous avez accepté les actualités de ${echapper(maison.nom)} en réservant.`,
  ];
  if (maison.adresse) morceaux.push(echapper(maison.adresse));
  morceaux.push(lien("Me désinscrire en un clic", lienDesabonnement(jeton)));
  return morceaux.join("<br />");
}

export type MessagePret = { sujet: string; texte: string; html: string };

export function composer({
  campagne,
  maison,
  jeton,
}: {
  campagne: Campagne;
  maison: Maison;
  /** Le jeton du destinataire : son lien de désinscription, à lui seul. */
  jeton: string;
}): MessagePret {
  const blocs: Bloc[] = paragraphes(campagne.texte);
  if (campagne.bouton_libelle && campagne.bouton_url) {
    blocs.push({
      bouton: { libelle: campagne.bouton_libelle, url: campagne.bouton_url },
    });
  }

  const bas = pied(maison, jeton);
  return {
    sujet: campagne.objet,
    texte: texteNu(blocs, maison.nom, bas),
    html: enveloppe(blocs, maison.nom, bas),
  };
}

/**
 * L'expéditeur d'une campagne.
 *
 * Le nom affiché est celui du restaurant : le convive s'est abonné chez
 * lui, pas chez Klarr. L'adresse technique, elle, reste sur le domaine
 * réservé aux campagnes — un restaurant n'a pas à poser d'enregistrement
 * DNS pour que Klarr lui serve à quelque chose, et envoyer depuis un
 * domaine qu'on n'a pas autorisé fait tomber le message en indésirable.
 *
 * Un identifiant par établissement plutôt qu'une boîte commune : la
 * messagerie du convive sait les ranger séparément, et celui qui bloque
 * un restaurant ne les bloque pas tous.
 */
export function expediteur(maison: {
  nom: string;
  slug: string | null;
}): string {
  const domaine = process.env.EMAIL_CAMPAGNES_DOMAINE?.trim();
  if (!domaine) throw new Error("EMAIL_CAMPAGNES_DOMAINE absente.");

  const identifiant =
    (maison.slug ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 40) || "restaurant";

  // Une virgule ou un guillemet dans le nom casse l'en-tête : « Prost,
  // le bar » deviendrait deux destinataires. Les guillemets règlent le
  // cas, à condition d'échapper ceux du nom.
  const affiche =
    maison.nom.replace(/[\\"]/g, " ").replace(/\s+/g, " ").trim() ||
    "Restaurant";
  return `"${affiche}" <${identifiant}@${domaine}>`;
}

/**
 * Le module est-il ouvert ?
 *
 * Tant que le domaine d'envoi n'est pas vérifié chez le fournisseur,
 * l'écran reste caché. Même discipline que pour les publications Google :
 * une campagne programmée qui ne part jamais coûte plus cher qu'un écran
 * absent.
 */
export function campagnesOuvertes(): boolean {
  return Boolean(process.env.EMAIL_CAMPAGNES_DOMAINE?.trim());
}
