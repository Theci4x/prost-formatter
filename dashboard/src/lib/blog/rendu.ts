import { Marked } from "marked";

/**
 * Le rendu d'un billet : du markdown vers du HTML, plus le sommaire.
 *
 * Deux choses que `marked` ne fait pas tout seul et dont un article long a
 * besoin : des ancres sur les titres (sans quoi aucun sommaire n'est
 * possible, et aucun lien ne peut viser une section), et des encadrés.
 *
 * Les encadrés s'écrivent dans le markdown ainsi :
 *
 *     ::: attention Le piège du calendrier
 *     Le texte de l'encadré, en markdown.
 *     :::
 *
 * On les sort du texte avant de le donner à `marked`, on les remplace par
 * un jeton, et on recolle après. Passer du HTML brut au parseur en
 * espérant qu'il le laisse tranquille marche jusqu'au jour où une ligne
 * vide au mauvais endroit casse tout ; le jeton, lui, est prévisible.
 */

export type Section = { id: string; titre: string };

export type TonEncadre = "attention" | "chiffre" | "exemple";

const TONS: TonEncadre[] = ["attention", "chiffre", "exemple"];

/** « Le piège du calendrier » → « le-piege-du-calendrier ». */
export function ancre(titre: string): string {
  const base = titre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "section";
}

function echapper(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type Bloc = { ton: TonEncadre; titre: string; corps: string };

/**
 * Sort les encadrés du markdown et les remplace par un jeton sur sa propre
 * ligne. Le jeton ne contient ni crochet ni tiret : rien qui ressemble à
 * une syntaxe markdown que le parseur pourrait vouloir interpréter.
 */
function extraireEncadres(markdown: string): { texte: string; blocs: Bloc[] } {
  const blocs: Bloc[] = [];
  const texte = markdown.replace(
    /^:::[ \t]*(\w+)[ \t]*(.*)$\n([\s\S]*?)^:::[ \t]*$/gm,
    (tout, ton: string, titre: string, corps: string) => {
      if (!TONS.includes(ton as TonEncadre)) return tout;
      blocs.push({
        ton: ton as TonEncadre,
        titre: titre.trim(),
        corps: corps.trim(),
      });
      return `\n\nENCADREKLARR${blocs.length - 1}\n\n`;
    },
  );
  return { texte, blocs };
}

export async function rendreBillet(
  markdown: string,
): Promise<{ html: string; sommaire: Section[] }> {
  const { texte, blocs } = extraireEncadres(markdown);

  const sommaire: Section[] = [];
  const vus = new Map<string, number>();

  // Une instance par appel : le renderer accumule le sommaire, et une
  // instance partagée mélangerait les sommaires de deux billets rendus
  // en même temps.
  const moteur = new Marked({
    renderer: {
      heading({ tokens, depth }) {
        const titre = this.parser.parseInline(tokens);
        const brut = tokens.map((t) => ("raw" in t ? t.raw : "")).join("");
        let id = ancre(brut);
        // Deux sections homonymes dans un même billet, ça arrive : « Ce
        // qu'il faut vérifier vous-même » existe partout.
        const deja = vus.get(id) ?? 0;
        vus.set(id, deja + 1);
        if (deja > 0) id = `${id}-${deja + 1}`;
        if (depth === 2) sommaire.push({ id, titre: brut.trim() });
        return `<h${depth} id="${id}">${titre}</h${depth}>\n`;
      },
    },
  });

  let html = await moteur.parse(texte);

  // Le corps de chaque encadré est du markdown lui aussi : il se parse à
  // part, sans le renderer à sommaire — les titres d'un encadré n'ont
  // rien à faire dans la table des matières.
  const rendus = await Promise.all(
    blocs.map(async (bloc) => {
      const corps = await new Marked().parse(bloc.corps);
      const titre = bloc.titre
        ? `<p class="encadre-titre">${echapper(bloc.titre)}</p>`
        : "";
      return `<aside class="encadre" data-ton="${bloc.ton}">${titre}<div class="encadre-corps">${corps}</div></aside>`;
    }),
  );

  rendus.forEach((rendu, i) => {
    html = html.replace(`<p>ENCADREKLARR${i}</p>`, rendu);
  });

  return { html, sommaire };
}
