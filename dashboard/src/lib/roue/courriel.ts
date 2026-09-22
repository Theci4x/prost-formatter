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
 */

import type { Langue } from "@/lib/i18n/langues";
import { AVIS } from "@/lib/i18n/avis";
import { dateComplete } from "@/lib/i18n/dates";

export type Lettre = { sujet: string; texte: string; html: string };

function echapper(texte: string): string {
  return texte.replace(
    /[<>&"]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!,
  );
}

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

  const html = `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:520px;padding:24px;">
  <p style="margin:0 0 6px;font-size:15px;color:#71717a;">${echapper(maison)}</p>
  <p style="margin:0 0 18px;font-size:22px;font-weight:600;color:#1B2A41;">${echapper(a.lettreGagne(lot))}</p>
  <div style="border:1px solid #e4e4e7;border-radius:14px;padding:18px;text-align:center;margin:0 0 18px;">
    <p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#71717a;">${echapper(a.lettreVotreCode)}</p>
    <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:.18em;color:#1B2A41;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${echapper(code)}</p>
  </div>
  <p style="margin:0 0 10px;font-size:15px;color:#3f3f46;">${a.lettrePresentezHtml(echapper(limite))}</p>
  <p style="margin:0;font-size:13px;color:#a1a1aa;"><a href="${echapper(adresseTotem)}" style="color:#E8763A;">${echapper(adresseTotem)}</a></p>
</div>`;

  return {
    sujet: a.lettreSujet(maison, lot, code),
    texte,
    html,
  };
}
