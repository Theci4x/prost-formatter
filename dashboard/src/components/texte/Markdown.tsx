import { marked, type Token, type Tokens } from "marked";

/**
 * Du markdown, rendu en éléments React — jamais en HTML.
 *
 * Claude répond en markdown : des titres, du gras, des listes, des
 * tableaux. Affiché tel quel dans un `whitespace-pre-wrap`, ça donne un
 * mur de `##` et de `**` que personne ne lit.
 *
 * On ne passe pas par `marked.parse` et `dangerouslySetInnerHTML`, comme
 * le fait la page d'aide. Là-bas le texte vient du dépôt : c'est le
 * nôtre, et il n'y a rien à filtrer. Ici il vient d'un modèle à qui l'on
 * donne le nom du restaurant et les mots-clés saisis par le
 * restaurateur. Un mot-clé est une saisie libre, et un texte qui a
 * traversé une saisie libre ne se rend pas en HTML.
 *
 * On lit donc les jetons de `marked` et on écrit les balises nous-mêmes.
 * Aucune chaîne n'est interprétée comme du balisage : le risque
 * disparaît par construction plutôt que par filtrage, et on ne dépend
 * pas d'une liste de choses à interdire qu'on finirait par oublier de
 * tenir à jour.
 */

/** Seuls ces protocoles font un lien. Le reste s'affiche en texte. */
function lienSur(href: string): boolean {
  return /^(https?:|mailto:)/i.test(href.trim());
}

function enLigne(jetons: Token[] | undefined, texte: string) {
  if (!jetons?.length) return texte;
  return jetons.map((jeton, i) => {
    const cle = `${jeton.type}-${i}`;
    switch (jeton.type) {
      case "strong":
        return (
          <strong key={cle} className="font-semibold text-zinc-900">
            {enLigne((jeton as Tokens.Strong).tokens, jeton.raw)}
          </strong>
        );
      case "em":
        return (
          <em key={cle}>{enLigne((jeton as Tokens.Em).tokens, jeton.raw)}</em>
        );
      case "codespan":
        return (
          <code
            key={cle}
            className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-800"
          >
            {(jeton as Tokens.Codespan).text}
          </code>
        );
      case "link": {
        const lien = jeton as Tokens.Link;
        const contenu = enLigne(lien.tokens, lien.text);
        if (!lienSur(lien.href)) return <span key={cle}>{contenu}</span>;
        return (
          <a
            key={cle}
            href={lien.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-orange underline"
          >
            {contenu}
          </a>
        );
      }
      case "br":
        return <br key={cle} />;
      case "del":
        return (
          <del key={cle}>
            {enLigne((jeton as Tokens.Del).tokens, jeton.raw)}
          </del>
        );
      default: {
        // `text`, `escape`, `html` et le reste : on rend le texte, jamais
        // le balisage. Un jeton « html » arrive ici et ressort en
        // caractères visibles, ce qui est exactement ce qu'on veut.
        //
        // Un jeton « text » peut porter ses propres jetons — c'est le cas
        // du contenu d'une puce, que `marked` n'enveloppe pas dans un
        // paragraphe quand la liste est serrée. Sans cette descente, le
        // gras d'une puce ressortait en « ** » à l'écran.
        const enfants = (jeton as Tokens.Text).tokens;
        if (enfants?.length) {
          return <span key={cle}>{enLigne(enfants, jeton.raw)}</span>;
        }
        // Rendu tel quel, sans enveloppe : un « span » par fragment de
        // texte alourdit le document sans rien porter, et React accepte
        // une chaîne dans un tableau sans réclamer de clé.
        return (jeton as Tokens.Text).text ?? jeton.raw;
      }
    }
  });
}

/**
 * Les titres, dimensionnés par rapport au texte qui les entoure.
 *
 * En « em » et non en pas fixe : ce composant sert aussi bien une fiche
 * d'analyse qu'une bulle de discussion, et un titre de seize pixels dans
 * un texte de quatorze n'a pas le même effet que dans un texte de seize.
 */
const TITRES: Record<number, string> = {
  1: "mt-6 text-[1.4em] font-semibold text-zinc-900 first:mt-0",
  2: "mt-6 text-[1.15em] font-semibold text-zinc-900 first:mt-0",
  3: "mt-5 text-[1em] font-semibold text-zinc-900 first:mt-0",
};

function bloc(jeton: Token, cle: string) {
  switch (jeton.type) {
    case "heading": {
      const t = jeton as Tokens.Heading;
      const niveau = Math.min(Math.max(t.depth, 1), 3);
      const Balise = (["h3", "h4", "h5"] as const)[niveau - 1];
      return (
        <Balise key={cle} className={TITRES[niveau]}>
          {enLigne(t.tokens, t.text)}
        </Balise>
      );
    }
    case "paragraph": {
      const t = jeton as Tokens.Paragraph;
      return (
        <p key={cle} className="leading-relaxed">
          {enLigne(t.tokens, t.text)}
        </p>
      );
    }
    case "list": {
      const t = jeton as Tokens.List;
      const Balise = t.ordered ? "ol" : "ul";
      return (
        <Balise
          key={cle}
          start={t.ordered ? Number(t.start) || 1 : undefined}
          className={`flex flex-col gap-1.5 pl-5 leading-relaxed ${
            t.ordered ? "list-decimal" : "list-disc"
          }`}
        >
          {t.items.map((item, i) => (
            <li key={i} className="pl-1">
              {item.tokens?.some(
                (j) => j.type === "paragraph" || j.type === "list",
              )
                ? item.tokens.map((j, k) => bloc(j, `${i}-${k}`))
                : enLigne(item.tokens, item.text)}
            </li>
          ))}
        </Balise>
      );
    }
    case "table": {
      const t = jeton as Tokens.Table;
      return (
        <div
          key={cle}
          className="overflow-x-auto rounded-lg border border-zinc-200"
        >
          <table className="w-full border-collapse text-[0.95em]">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                {t.header.map((cellule, i) => (
                  <th key={i} className="px-3 py-2 font-semibold">
                    {enLigne(cellule.tokens, cellule.text)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="[&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_tr]:border-b [&_tr]:border-zinc-100 [&_tr:last-child]:border-0">
              {t.rows.map((ligne, i) => (
                <tr key={i}>
                  {ligne.map((cellule, j) => (
                    <td key={j}>{enLigne(cellule.tokens, cellule.text)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "blockquote": {
      const t = jeton as Tokens.Blockquote;
      return (
        <blockquote
          key={cle}
          className="border-l-2 border-brand-orange/40 bg-brand-orange/5 px-4 py-3 leading-relaxed"
        >
          <div className="flex flex-col gap-2">
            {t.tokens.map((j, i) => bloc(j, `${cle}-${i}`))}
          </div>
        </blockquote>
      );
    }
    case "code": {
      const t = jeton as Tokens.Code;
      return (
        <pre
          key={cle}
          className="overflow-x-auto rounded-lg bg-zinc-900 px-4 py-3 text-[0.85em] leading-relaxed text-zinc-100"
        >
          <code>{t.text}</code>
        </pre>
      );
    }
    case "hr":
      return <hr key={cle} className="border-zinc-200" />;
    case "space":
      return null;
    default: {
      const texte = (jeton as Tokens.Text).text ?? jeton.raw;
      if (!texte?.trim()) return null;
      return (
        <p key={cle} className="leading-relaxed">
          {texte}
        </p>
      );
    }
  }
}

/**
 * La taille, la couleur et la graisse viennent du conteneur : ce
 * composant ne met en forme que la structure. Un appelant écrit donc
 * « text-sm text-zinc-700 » autour de lui, comme il le ferait autour
 * d'un paragraphe ordinaire.
 */
export function Markdown({ texte }: { texte: string }) {
  const jetons = marked.lexer(texte);
  return (
    <div className="flex flex-col gap-3">
      {jetons.map((jeton, i) => bloc(jeton, String(i)))}
    </div>
  );
}
