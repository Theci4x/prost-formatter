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

export type Lettre = { sujet: string; texte: string; html: string };

function echapper(texte: string): string {
  return texte.replace(
    /[<>&"]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!,
  );
}

/** « 21 octobre 2026 » — une date limite se lit en toutes lettres. */
function dateLisible(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function courrielDuLot({
  maison,
  lot,
  code,
  expireLe,
  adresseTotem,
}: {
  maison: string;
  lot: string;
  code: string;
  /** Format « 2026-10-21 ». */
  expireLe: string;
  adresseTotem: string;
}): Lettre {
  const limite = dateLisible(expireLe);

  const texte = [
    `Vous avez gagné : ${lot}`,
    "",
    `Votre code : ${code}`,
    "",
    `Présentez ce code à ${maison} lors de votre prochaine visite, avant le ${limite}.`,
    "",
    "Il suffit de montrer cet e-mail : le serveur s'occupe du reste.",
    "",
    adresseTotem,
  ].join("\n");

  const html = `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:520px;padding:24px;">
  <p style="margin:0 0 6px;font-size:15px;color:#71717a;">${echapper(maison)}</p>
  <p style="margin:0 0 18px;font-size:22px;font-weight:600;color:#1B2A41;">Vous avez gagné ${echapper(lot)}</p>
  <div style="border:1px solid #e4e4e7;border-radius:14px;padding:18px;text-align:center;margin:0 0 18px;">
    <p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#71717a;">Votre code</p>
    <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:.18em;color:#1B2A41;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${echapper(code)}</p>
  </div>
  <p style="margin:0 0 10px;font-size:15px;color:#3f3f46;">Présentez-le lors de votre prochaine visite, <strong>avant le ${echapper(limite)}</strong>. Montrer cet e-mail suffit.</p>
  <p style="margin:0;font-size:13px;color:#a1a1aa;"><a href="${echapper(adresseTotem)}" style="color:#E8763A;">${echapper(adresseTotem)}</a></p>
</div>`;

  return {
    sujet: `Votre lot chez ${maison} : ${lot}`,
    texte,
    html,
  };
}
