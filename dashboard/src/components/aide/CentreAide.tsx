"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AIDE } from "@/lib/i18n/aide";
import type { Langue } from "@/lib/i18n/langues";
import { mots, racine } from "@/lib/aide/texte";

/**
 * Le centre d'aide : une recherche qui filtre pendant qu'on tape, et les
 * rubriques en dessous.
 *
 * Le serveur envoie, pour chaque article, les mots de son titre et ceux
 * de son corps — déjà découpés. Le navigateur n'a jamais le texte
 * complet : il n'en a pas besoin pour trouver, et la page reste légère.
 */

export type ArticleIndexe = {
  slug: string;
  titre: string;
  resume: string;
  /** Titre, questions et résumé : ce qui pèse lourd dans la recherche. */
  motsForts: string[];
  /** Le corps de l'article, mots uniques. */
  motsCorps: string[];
};

export type RubriqueIndexee = {
  cle: string;
  titre: string;
  resume: string;
  articles: ArticleIndexe[];
};

/**
 * La pertinence d'un article : 0 s'il manque un mot, et `principal` quand
 * tous les mots sont dans le titre, les questions ou le résumé — un
 * article qui ne fait que citer le mot au passage n'est pas une réponse.
 */
function note(
  article: ArticleIndexe,
  demandes: string[],
): { total: number; principal: boolean } {
  let total = 0;
  let principal = true;
  for (const mot of demandes) {
    const souche = racine(mot);
    const fort = article.motsForts.some(
      (m) => m === mot || racine(m) === souche,
    );
    const corps =
      !fort && article.motsCorps.some((m) => m === mot || racine(m) === souche);
    // Chaque mot doit se trouver quelque part : sinon « acompte terrasse »
    // ramènerait tout le mode d'emploi.
    if (!fort && !corps) return { total: 0, principal: false };
    if (!fort) principal = false;
    total += fort ? 5 : 1;
  }
  return { total, principal };
}

function CarteArticle({ article }: { article: ArticleIndexe }) {
  return (
    <Link
      href={`/aide/${article.slug}`}
      className="group flex h-full flex-col gap-1.5 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm transition-[border-color,transform,box-shadow] hover:-translate-y-px hover:border-ink hover:shadow-md"
    >
      <span className="flex items-start justify-between gap-3 text-base font-semibold text-ink">
        {article.titre}
        <span
          aria-hidden="true"
          className="text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
        >
          →
        </span>
      </span>
      <span className="text-sm leading-relaxed text-zinc-600">
        {article.resume}
      </span>
    </Link>
  );
}

export function CentreAide({
  langue,
  rubriques,
}: {
  langue: Langue;
  rubriques: RubriqueIndexee[];
}) {
  const a = AIDE[langue];
  const [requete, setRequete] = useState("");
  const demandes = useMemo(() => mots(requete), [requete]);

  const trouves = useMemo(() => {
    if (demandes.length === 0) return null;
    const notes = rubriques
      .flatMap((rubrique) => rubrique.articles)
      .map((article) => ({ article, ...note(article, demandes) }))
      .filter((entree) => entree.total > 0)
      .sort((x, y) => y.total - x.total);
    const principaux = notes.filter((entree) => entree.principal);
    // Sans réponse directe, les mentions deviennent les résultats : mieux
    // vaut un article qui en parle que rien du tout.
    return principaux.length > 0
      ? {
          principaux: principaux.map((entree) => entree.article),
          mentions: notes
            .filter((entree) => !entree.principal)
            .map((entree) => entree.article),
        }
      : { principaux: notes.map((entree) => entree.article), mentions: [] };
  }, [demandes, rubriques]);
  const resultats = trouves?.principaux ?? null;

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <label className="relative block max-w-3xl">
          <span className="sr-only">{a.rechercher}</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={requete}
            onChange={(e) => setRequete(e.target.value)}
            placeholder={a.rechercher}
            className="w-full rounded-2xl border border-zinc-200 bg-white py-4 pl-12 pr-4 text-base text-ink shadow-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-brand-navy"
          />
        </label>

        {/* Le sommaire : une rubrique se trouve d'un coup d'œil, sans
            faire défiler huit sections pour arriver à la bonne. */}
        {resultats === null && (
          <nav className="flex flex-wrap gap-2">
            {rubriques.map((rubrique) => (
              <a
                key={rubrique.cle}
                href={`#${rubrique.cle}`}
                className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-ink hover:text-ink"
              >
                {rubrique.titre}
              </a>
            ))}
          </nav>
        )}
      </div>

      {resultats !== null ? (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-serif text-2xl text-ink">
              {a.resultats(resultats.length)}
            </h2>
            <button
              type="button"
              onClick={() => setRequete("")}
              className="text-sm font-medium text-zinc-500 hover:text-ink"
            >
              {a.effacer}
            </button>
          </div>
          {resultats.length === 0 ? (
            <p className="rounded-2xl border border-zinc-200/70 bg-white p-6 text-sm text-zinc-600 shadow-sm">
              {a.aucunResultat}
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
              {resultats.map((article) => (
                <li key={article.slug}>
                  <CarteArticle article={article} />
                </li>
              ))}
            </ul>
          )}
          {trouves && trouves.mentions.length > 0 && (
            <div className="flex flex-col gap-2 pt-2">
              <h3 className="text-sm font-semibold text-zinc-500">
                {a.mentionneAussi}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {trouves.mentions.map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={`/aide/${article.slug}`}
                      className="inline-block rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 transition-colors hover:border-ink hover:text-ink"
                    >
                      {article.titre}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ) : (
        rubriques.map((rubrique) => (
          <section
            key={rubrique.cle}
            id={rubrique.cle}
            className="grid scroll-mt-8 gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-10"
          >
            <div className="flex flex-col gap-1 lg:sticky lg:top-8 lg:self-start">
              <h2 className="font-serif text-3xl text-ink">{rubrique.titre}</h2>
              <p className="text-sm leading-relaxed text-zinc-600">
                {rubrique.resume}
              </p>
              <span className="text-xs text-zinc-400">
                {a.nombreArticles(rubrique.articles.length)}
              </span>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 2xl:grid-cols-3">
              {rubrique.articles.map((article) => (
                <li key={article.slug}>
                  <CarteArticle article={article} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
