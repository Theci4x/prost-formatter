/**
 * La lettre qui porte le lot.
 *
 * Elle a un seul travail : que le client la retrouve dans trois semaines,
 * au moment où il choisit où dîner. Le code est donc gros et seul, la date
 * limite est écrite en toutes lettres, et le nom de la maison est dans
 * l'objet — c'est ce qu'on cherche dans une boîte pleine.
 *
 * Pas de pièce jointe, pas de code-barres, pas d'image : une image ne
 * s'affiche pas par défaut dans la moitié des clients de messagerie, et un
 * lot qu'on ne voit pas est un lot perdu.
 *
 * Elle porte la même carte que les confirmations de réservation, signée
 * du nom de la maison : le client la reçoit du restaurant où il vient de
 * dîner, pas d'un logiciel.
 */

import type { Langue } from "@/lib/i18n/langues";
import { AVIS } from "@/lib/i18n/avis";
import { dateComplete } from "@/lib/i18n/dates";
import { echapper, enveloppe, lien, type Bloc } from "@/lib/courriel/messages";

export type Lettre = { sujet: string; texte: string; html: string };

export function courrielDuLot({
  maison,
  lot,
  code,
  expireLe,
  adresseTotem,
  langue = "fr",
}: {
  maison: string;
  lot: string;
  code: string;
  /** Format « 2026-10-21 ». */
  expireLe: string;
  adresseTotem: string;
  /**
   * La langue du joueur, lue au moment du tirage. C'est la seule occasion
   * de la connaître : la lettre part d'un serveur, pas d'une requête, et
   * personne ne sera là pour la lui redemander dans trois semaines.
   */
  langue?: Langue;
}): Lettre {
  const a = AVIS[langue] ?? AVIS.fr;
  const limite = dateComplete(expireLe, langue);

  const texte = [
    a.lettreGagne(lot),
    "",
    a.lettreCodeLigne(code),
    "",
    a.lettrePresentez(maison, limite),
    "",
    a.lettreMontrerSuffit,
    "",
    adresseTotem,
  ].join("\n");

  const blocs: Bloc[] = [
    `<strong>${echapper(a.lettreGagne(lot))}</strong>`,
    { code: { libelle: a.lettreVotreCode, valeur: code } },
    a.lettrePresentezHtml(echapper(limite)),
    lien(adresseTotem, adresseTotem),
  ];
  const html = enveloppe(blocs, maison, undefined, langue);

  return {
    sujet: a.lettreSujet(maison, lot, code),
    texte,
    html,
  };
}
