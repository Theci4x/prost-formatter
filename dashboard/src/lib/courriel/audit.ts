import "server-only";
import { envoyerCourriel } from "@/lib/courriel/envoyer";
import { echapper } from "@/lib/courriel/messages";
import { formater, type ActionPrioritaire } from "@/lib/audit/actions";
import type { PresenceIa } from "@/lib/audit/ia";
import { translations, type Lang } from "@/lib/i18n/testPresence";

/**
 * Le rapport d'audit, envoyé à celui qui l'a demandé.
 *
 * Jusqu'ici le résultat s'affichait à l'écran et nulle part ailleurs :
 * l'onglet fermé, il ne restait rien au restaurateur. Il avait laissé son
 * téléphone, vu son score, et n'avait pas de quoi le relire le lendemain
 * ni le montrer à son associé.
 *
 * Ce n'est pas de la prospection : il est venu chercher ce rapport, et la
 * page le lui a promis en toutes lettres — « vos coordonnées servent
 * uniquement à vous transmettre ce test ». On livre ce qui a été annoncé.
 * Une relance commerciale, elle, demanderait un consentement distinct.
 *
 * Il a sa propre mise en page, et non l'enveloppe des réservations : un
 * score se lit en grand, trois piliers se comparent sur des barres, une
 * réponse d'IA se cite. Passés dans des encadrés de confirmation, tout
 * cela devenait quatre boîtes grises identiques — le premier envoi réel
 * l'a montré. Les contraintes restent celles du courriel : tableaux,
 * styles en ligne, attributs `bgcolor` en doublon des fonds (Outlook
 * ignore les uns, la version imprimée les autres), aucune image distante.
 *
 * Comme tout envoi dans ce dossier : ne lève jamais. Un rapport qui ne
 * part pas ne doit pas effacer le prospect qu'on vient d'enregistrer.
 */

const ENCRE = "#1f1b17";
const ENCRE_DOUCE = "#7a7168";
const FOND = "#f4f1ec";
const PISTE = "#e6dfd4";
const BORDURE = "#e9e3da";
const MARQUE = "#0f1e3d";
const ACCENT = "#b9600a";
const POLICE =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";

type Label = "excellent" | "bon" | "moyen" | "critique";

/**
 * La couleur du verdict, et lui seul : les barres restent dans la marque.
 * Un rapport tout en rouge et vert se lit comme un feu tricolore, pas
 * comme une analyse.
 */
const COULEUR_LABEL: Record<Label, string> = {
  excellent: "#1f7a4d",
  bon: "#1f7a4d",
  moyen: ACCENT,
  critique: "#b42318",
};

/** Le libellé du verdict dans la langue du lecteur ; tel quel s'il est inconnu. */
function libelleLabel(t: (typeof translations)[Lang], label: string) {
  const connus = t.audit.labels as Record<string, string>;
  return connus[label] ?? label;
}

function sansSaut(texte: string) {
  return texte.replace(/[\r\n]+/g, " ").slice(0, 180);
}

/* ------------------------------------------------------------------ */
/* Les pièces, en HTML                                                  */
/* ------------------------------------------------------------------ */

function paragraphe(html: string, style = ""): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${ENCRE};${style}">${html}</p>`;
}

function surtitre(texte: string): string {
  return `<p style="margin:0 0 6px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;font-weight:700;color:${ACCENT}">${echapper(texte)}</p>`;
}

/**
 * Une barre de score. Une table dans une table : la piste prend toute la
 * largeur, la barre en prend le pourcentage — c'est la seule manière de
 * dessiner une proportion que toutes les messageries respectent.
 */
function barre(pourcent: number): string {
  const largeur = Math.max(2, Math.min(100, Math.round(pourcent)));
  return [
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px"><tr>`,
    `<td bgcolor="${PISTE}" style="background:${PISTE};border-radius:4px;font-size:0;line-height:0;height:8px">`,
    `<table role="presentation" width="${largeur}%" cellpadding="0" cellspacing="0" border="0"><tr>`,
    `<td bgcolor="${MARQUE}" style="background:${MARQUE};border-radius:4px;font-size:0;line-height:0;height:8px">&nbsp;</td>`,
    `</tr></table></td></tr></table>`,
  ].join("");
}

function pilier(nom: string, score: number): string {
  return [
    `<tr><td style="padding:10px 0 4px">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>`,
    `<td style="font-family:${POLICE};font-size:14px;color:${ENCRE}">${echapper(nom)}</td>`,
    `<td align="right" style="font-family:${POLICE};font-size:14px;font-weight:700;color:${ENCRE};white-space:nowrap">${score}<span style="font-weight:400;color:${ENCRE_DOUCE}">/100</span></td>`,
    `</tr></table>`,
    barre(score),
    `</td></tr>`,
  ].join("");
}

function blocScore({
  t,
  etablissement,
  score,
  label,
  piliers,
}: {
  t: (typeof translations)[Lang];
  etablissement: string;
  score: number;
  label: string;
  piliers: { localSeo: number; eReputation: number; geo: number };
}): string {
  const couleur = COULEUR_LABEL[label as Label] ?? MARQUE;
  return [
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 28px"><tr>`,
    `<td bgcolor="${FOND}" style="background:${FOND};border-radius:14px;padding:24px 24px 18px">`,
    // Le nom, le score en grand, le verdict.
    `<p style="margin:0 0 2px;font-family:${POLICE};font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${ENCRE_DOUCE}">${echapper(t.audit.courriel.scoreDe)}</p>`,
    `<p style="margin:0 0 14px;font-family:${SERIF};font-size:22px;line-height:1.2;color:${ENCRE}">${echapper(etablissement)}</p>`,
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>`,
    `<td style="font-family:${SERIF};font-size:64px;line-height:1;color:${MARQUE};letter-spacing:-0.02em">${score}</td>`,
    `<td style="padding:0 0 6px 6px;font-family:${SERIF};font-size:22px;color:${ENCRE_DOUCE};vertical-align:bottom">/100</td>`,
    `<td style="padding:0 0 12px 16px;vertical-align:bottom">`,
    `<span style="display:inline-block;padding:5px 11px;border-radius:999px;background:${couleur};font-family:${POLICE};font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#ffffff">${echapper(libelleLabel(t, label))}</span>`,
    `</td></tr></table>`,
    // Les trois piliers.
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;border-top:1px solid ${BORDURE}">`,
    pilier(t.audit.localSeo, piliers.localSeo),
    pilier(t.audit.eReputation, piliers.eReputation),
    pilier(t.audit.geo, piliers.geo),
    `</table>`,
    `</td></tr></table>`,
  ].join("");
}

function blocIa(t: (typeof translations)[Lang], p: PresenceIa): string {
  const c = t.audit.courriel;
  const verdict = p.cite
    ? p.rang
      ? c.citeRang(p.rang)
      : c.cite
    : c.nonCite;
  const concurrents =
    !p.cite && p.concurrents.length > 0
      ? `<p style="margin:10px 0 0;font-family:${POLICE};font-size:14px;line-height:1.6;color:${ENCRE_DOUCE}">${echapper(c.aVotrePlace)}&nbsp;: ${p.concurrents
          .map(
            (nom) =>
              `<span style="display:inline-block;margin:2px 4px 2px 0;padding:3px 9px;border-radius:999px;border:1px solid ${BORDURE};background:#ffffff;font-size:13px;color:${ENCRE}">${echapper(nom)}</span>`,
          )
          .join("")}</p>`
      : "";
  return [
    surtitre(c.iaTitre),
    `<p style="margin:0 0 12px;font-size:14px;color:${ENCRE_DOUCE}">${echapper(c.iaSousTitre)}</p>`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px"><tr>`,
    `<td style="padding:18px 22px;border-left:3px solid ${MARQUE};background:${FOND}" bgcolor="${FOND}">`,
    `<p style="margin:0 0 10px;font-family:${SERIF};font-size:20px;line-height:1.35;font-style:italic;color:${ENCRE}">«&nbsp;${echapper(p.question)}&nbsp;»</p>`,
    `<p style="margin:0;font-family:${POLICE};font-size:15px;font-weight:700;color:${p.cite ? COULEUR_LABEL.bon : COULEUR_LABEL.critique}">${echapper(verdict)}</p>`,
    concurrents,
    `</td></tr></table>`,
  ].join("");
}

function blocActions(
  t: (typeof translations)[Lang],
  actions: ActionPrioritaire[],
): string {
  const lignes = actions
    .map((action, i) => {
      const texte = t.audit.actions[action.cle];
      // Le constat porte des valeurs mesurées ({n}, {total}, {hote}) :
      // sans `formater`, le lecteur verrait les accolades telles quelles.
      const constat = formater(texte.constat, action.valeurs);
      const dernier = i === actions.length - 1;
      return [
        `<tr>`,
        `<td width="36" valign="top" style="padding:14px 0 ${dernier ? 0 : 14}px">`,
        `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${MARQUE}" width="26" height="26" align="center" style="background:${MARQUE};border-radius:13px;font-family:${POLICE};font-size:13px;font-weight:700;color:#ffffff;line-height:26px">${i + 1}</td></tr></table>`,
        `</td>`,
        `<td valign="top" style="padding:14px 0 ${dernier ? 0 : 14}px;${dernier ? "" : `border-bottom:1px solid ${BORDURE}`}">`,
        `<p style="margin:0 0 3px;font-family:${POLICE};font-size:15px;font-weight:700;line-height:1.4;color:${ENCRE}">${echapper(texte.titre)}</p>`,
        `<p style="margin:0 0 6px;font-family:${POLICE};font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-weight:700;color:${ACCENT}">${echapper(t.audit.impacts[action.impact])}</p>`,
        `<p style="margin:0;font-family:${POLICE};font-size:14px;line-height:1.6;color:${ENCRE_DOUCE}">${echapper(constat)}</p>`,
        `</td></tr>`,
      ].join("");
    })
    .join("");
  return [
    surtitre(t.audit.actionsTitre),
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px">${lignes}</table>`,
  ].join("");
}

function bouton(libelle: string, url: string, sous: string): string {
  const href = echapper(url).replace(/"/g, "&quot;");
  return [
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 26px"><tr><td align="center">`,
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>`,
    `<td bgcolor="${MARQUE}" style="background:${MARQUE};border-radius:10px">`,
    `<a href="${href}" style="display:inline-block;padding:15px 32px;font-family:${POLICE};font-size:15px;font-weight:600;line-height:1;color:#ffffff;text-decoration:none;border-radius:10px;border:1px solid ${MARQUE}">${echapper(libelle)}</a>`,
    `</td></tr></table>`,
    `<p style="margin:10px 0 0;font-family:${POLICE};font-size:12px;color:${ENCRE_DOUCE}">${echapper(sous)}</p>`,
    `</td></tr></table>`,
  ].join("");
}

function pageHtml(
  t: (typeof translations)[Lang],
  corps: string,
  langue: Lang,
): string {
  const c = t.audit.courriel;
  return [
    `<!DOCTYPE html><html lang="${langue}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${echapper(c.surtitre)}</title></head>`,
    `<body style="margin:0;padding:0;background:${FOND}" bgcolor="${FOND}">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${FOND}" style="background:${FOND};width:100%">`,
    `<tr><td align="center" style="padding:28px 12px">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid ${BORDURE};border-radius:16px;overflow:hidden">`,
    // Le bandeau : la marque en toutes lettres, sans image à charger.
    `<tr><td bgcolor="${MARQUE}" style="background:${MARQUE};padding:20px 32px;border-radius:16px 16px 0 0">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>`,
    `<td style="font-family:${SERIF};font-size:24px;letter-spacing:0.01em;color:#ffffff">Klarr</td>`,
    `<td align="right" style="font-family:${POLICE};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;font-weight:600;color:#ffffff;opacity:0.75">${echapper(c.surtitre)}</td>`,
    `</tr></table></td></tr>`,
    `<tr><td style="padding:30px 32px 28px;font-family:${POLICE}">${corps}</td></tr>`,
    `</table>`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px"><tr><td style="padding:18px 24px 0;font-family:${POLICE};font-size:11px;line-height:1.6;color:${ENCRE_DOUCE};text-align:center">`,
    `Klarr · <a href="https://www.klarr.net" style="color:${ENCRE_DOUCE};text-decoration:underline">klarr.net</a> · <a href="mailto:contact@klarr.net" style="color:${ENCRE_DOUCE};text-decoration:underline">contact@klarr.net</a><br>${echapper(c.pied)}`,
    `</td></tr></table>`,
    `</td></tr></table></body></html>`,
  ].join("");
}

/* ------------------------------------------------------------------ */
/* Le message                                                           */
/* ------------------------------------------------------------------ */

export type Rapport = {
  destinataire: string;
  prenom: string;
  etablissement: string;
  score: number;
  label: string;
  piliers: { localSeo: number; eReputation: number; geo: number };
  actions: ActionPrioritaire[];
  presenceIa?: PresenceIa;
  lienEssai: string;
  /** Celle dans laquelle la page a été lue : le rapport la suit. */
  langue: Lang;
};

/**
 * Le HTML et le texte du rapport, séparés de l'envoi pour pouvoir être
 * regardés — et testés — sans clé Resend ni boîte aux lettres.
 */
export function composerRapport(r: Rapport): {
  sujet: string;
  html: string;
  texte: string;
} {
  const t = translations[r.langue] ?? translations.fr;
  const c = t.audit.courriel;
  // Trois actions au plus : un courriel qui en liste huit ne se lit pas,
  // et les suivantes attendront de toute façon les premières.
  const retenues = r.actions.slice(0, 3);

  const html = pageHtml(
    t,
    [
      paragraphe(echapper(c.bonjour(r.prenom))),
      paragraphe(echapper(c.intro(r.etablissement))),
      blocScore({
        t,
        etablissement: r.etablissement,
        score: r.score,
        label: r.label,
        piliers: r.piliers,
      }),
      r.presenceIa ? blocIa(t, r.presenceIa) : "",
      retenues.length > 0 ? blocActions(t, retenues) : "",
      paragraphe(echapper(c.sansNous)),
      bouton(c.bouton, r.lienEssai, c.sousBouton),
      paragraphe(echapper(c.ensemble)),
      paragraphe(`— ${echapper(c.signature)}`, `color:${ENCRE_DOUCE}`),
    ].join(""),
    r.langue,
  );

  const lignes: string[] = [
    c.bonjour(r.prenom),
    "",
    c.intro(r.etablissement),
    "",
    `${c.scoreDe} — ${r.etablissement}`,
    `${r.score}/100 · ${libelleLabel(t, r.label)}`,
    `${t.audit.localSeo} : ${r.piliers.localSeo}/100`,
    `${t.audit.eReputation} : ${r.piliers.eReputation}/100`,
    `${t.audit.geo} : ${r.piliers.geo}/100`,
    "",
  ];
  if (r.presenceIa) {
    const p = r.presenceIa;
    lignes.push(
      `${c.iaTitre} ${c.iaSousTitre} :`,
      `«\u00a0${p.question}\u00a0»`,
      p.cite ? (p.rang ? c.citeRang(p.rang) : c.cite) : c.nonCite,
    );
    if (!p.cite && p.concurrents.length > 0) {
      lignes.push(`${c.aVotrePlace} : ${p.concurrents.join(", ")}`);
    }
    lignes.push("");
  }
  if (retenues.length > 0) {
    lignes.push(`${t.audit.actionsTitre} :`);
    retenues.forEach((action, i) => {
      const texte = t.audit.actions[action.cle];
      lignes.push(
        `${i + 1}. ${texte.titre} (${t.audit.impacts[action.impact]})`,
        `   ${formater(texte.constat, action.valeurs)}`,
      );
    });
    lignes.push("");
  }
  lignes.push(
    c.sansNous,
    "",
    `${c.bouton} : ${r.lienEssai}`,
    c.sousBouton,
    "",
    c.ensemble,
    "",
    `— ${c.signature}`,
    "",
    "—",
    c.pied,
  );

  return {
    sujet: sansSaut(c.sujet(r.etablissement, r.score)),
    html,
    texte: lignes.join("\n"),
  };
}

export async function envoyerRapportAuProspect(r: Rapport) {
  const { sujet, html, texte } = composerRapport(r);
  return envoyerCourriel({
    destinataire: r.destinataire,
    sujet,
    html,
    texte,
    // « Répondez simplement à ce message » : la réponse doit arriver là où
    // quelqu'un la lit, pas dans la boîte des confirmations de table.
    repondreA: "contact@klarr.net",
  });
}
