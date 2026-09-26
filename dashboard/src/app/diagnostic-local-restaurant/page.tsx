import type { Metadata } from "next";
import Link from "next/link";
import { Commis } from "@/components/commis/Commis";
import {
  COLONNES,
  COTE,
  LECTURE,
  PAGE_OUTIL,
  PRINCIPALE,
} from "@/components/outils/colonnes";
import { EnteteOutil } from "@/components/outils/EnteteOutil";
import { SuiteOutils } from "@/components/outils/SuiteOutils";
import { DonneesStructurees } from "@/components/seo/DonneesStructurees";
import { filAriane } from "@/lib/seo/donnees-structurees";
import { siteUrl } from "@/lib/site-url";
import { langueIndexable } from "@/lib/i18n/langue";
import { adressePour } from "@/lib/blog/traductions";
import {
  POINTS,
  QUESTIONS,
  REPONSES,
  compter,
  etablirBilan,
  lireReponses,
  ECRAN,
  resumeBilan,
  type Niveau,
} from "@/lib/diagnostic/local";
import { t } from "@/lib/i18n/outils";

/**
 * Le diagnostic d'un local, avant la signature du bail.
 *
 * Il ne conclut jamais que le local convient — voir `local.ts`, où cette
 * règle est expliquée. L'écran la tient de deux façons : l'avertissement
 * est **au-dessus** du résultat et non en bas de page, et chaque point
 * porte toujours son « à qui demander », y compris quand il est levé.
 *
 * Formulaire GET, comme le calculateur : les réponses vivent dans
 * l'adresse, donc le diagnostic s'envoie à un associé ou à un courtier
 * sans que personne ait à le refaire.
 */

const CHEMIN = "/diagnostic-local-restaurant";

export const metadata: Metadata = {
  title: "Ce local peut-il accueillir votre restaurant ?",
  description:
    "Extraction, destination du bail, copropriété, ERP, terrasse : les cinq points qui empêchent d'ouvrir. Neuf questions, et la liste de ce qu'il vous reste à vérifier — avant de signer.",
  alternates: { canonical: CHEMIN },
};

type Query = Record<string, string | string[] | undefined>;

const COULEUR: Record<Niveau, { cadre: string; pastille: string }> = {
  bloquant: {
    cadre: "border-red-200 bg-red-50",
    pastille: "bg-red-100 text-red-900",
  },
  verifier: {
    cadre: "border-amber-200 bg-amber-50",
    pastille: "bg-amber-100 text-amber-900",
  },
  leve: {
    cadre: "border-zinc-200 bg-white",
    pastille: "bg-zinc-100 text-zinc-700",
  },
};

export default async function DiagnosticPage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const langue = await langueIndexable();
  const query = await searchParams;
  const reponses = lireReponses(query);
  const repondu = Boolean(query.diagnostique);
  const bilans = etablirBilan(reponses);
  const totaux = compter(bilans);

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <EnteteOutil langue={langue} />

      <main className={PAGE_OUTIL}>
        <DonneesStructurees
          donnees={filAriane([
            { nom: "Klarr", url: siteUrl() },
            { nom: "Diagnostic d'un local", url: `${siteUrl()}${CHEMIN}` },
          ])}
        />

        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-orange">
            {t(ECRAN.surtitre, langue)}
          </span>
          <h1 className="font-serif text-4xl text-ink sm:text-5xl">
            {t(ECRAN.titre, langue)}
          </h1>
          <p className={`text-base text-zinc-600 ${LECTURE}`}>
            {t(ECRAN.chapo, langue)}
          </p>
        </div>

        <div className={COLONNES}>
          <div className={PRINCIPALE}>
            {/* L'avertissement est ici, pas en bas : quelqu'un qui lit un
            résultat a déjà cessé de lire le reste de la page. */}
            <div className="rounded-2xl border border-zinc-300 bg-white p-5">
              <p className="text-base font-semibold text-zinc-900">
                {t(ECRAN.avertissementTitre, langue)}
              </p>
              <p className="mt-1.5 text-base text-zinc-600">
                {t(ECRAN.avertissementTexte, langue)}
              </p>
            </div>

            <form
              method="get"
              className="flex flex-col gap-6 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm"
            >
              <input type="hidden" name="diagnostique" value="1" />

              {POINTS.map((point) => (
                <fieldset key={point.id} className="flex flex-col gap-4">
                  <legend className="text-sm font-semibold uppercase tracking-wide text-brand-navy">
                    {t(point.titre, langue)}
                  </legend>
                  {QUESTIONS.filter((q) => q.point === point.id).map(
                    (question) => (
                      <div key={question.id} className="flex flex-col gap-2">
                        <p className="text-base font-medium text-zinc-800">
                          {t(question.texte, langue)}
                        </p>
                        {question.aide && (
                          <p className="text-sm text-zinc-500">
                            {t(question.aide, langue)}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4">
                          {REPONSES.map((valeur) => (
                            <label
                              key={valeur}
                              className="flex items-center gap-1.5 text-base text-zinc-700"
                            >
                              <input
                                type="radio"
                                name={question.id}
                                value={valeur}
                                defaultChecked={
                                  reponses.get(question.id) === valeur
                                }
                                className="accent-brand-navy"
                              />
                              {t(ECRAN.reponses[valeur], langue)}
                            </label>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </fieldset>
              ))}

              <button
                type="submit"
                className="rounded-md bg-brand-navy px-5 py-3 text-base font-medium text-white transition-colors hover:bg-brand-navy-hover"
              >
                {t(ECRAN.bouton, langue)}
              </button>
            </form>

            {repondu && (
              <section className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="font-serif text-3xl text-ink">
                    {t(ECRAN.resultatTitre, langue)}
                  </h2>
                  <p className="text-base text-zinc-600">
                    {resumeBilan(totaux, langue)}
                  </p>
                </div>

                {bilans.map((bilan) => {
                  const style = COULEUR[bilan.niveau];
                  return (
                    <article
                      key={bilan.point.id}
                      className={`flex flex-col gap-3 rounded-2xl border p-5 ${style.cadre}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-semibold text-zinc-900">
                          {t(bilan.point.titre, langue)}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style.pastille}`}
                        >
                          {t(ECRAN.niveaux[bilan.niveau], langue)}
                        </span>
                      </div>

                      <ul className="flex flex-col gap-2">
                        {bilan.constats.map((constat, rang) => (
                          <li key={rang} className="text-base text-zinc-700">
                            {t(constat.texte, langue)}
                          </li>
                        ))}
                      </ul>

                      {/* Toujours affiché, même sur un point levé : c'est la
                      seule chose que cette page apporte vraiment. */}
                      <div className="rounded-xl bg-white/70 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {t(ECRAN.aQuiDemander, langue)}
                        </p>
                        <p className="mt-1 text-base text-zinc-700">
                          {t(bilan.point.aQuiDemander, langue)}
                        </p>
                      </div>

                      {/* Un article non traduit perd son lien et garde son
                      texte : renvoyer un lecteur chinois vers une page
                      française serait une impasse annoncée comme une
                      piste. C'est déjà la règle du journal. */}
                      {bilan.point.article &&
                        adressePour(bilan.point.article.slug, langue) && (
                          <Link
                            href={
                              adressePour(bilan.point.article.slug, langue)!
                            }
                            className="w-fit text-base text-brand-navy underline-offset-2 hover:underline"
                          >
                            {t(bilan.point.article.titre, langue)} →
                          </Link>
                        )}
                    </article>
                  );
                })}

                <p className="text-sm text-zinc-500">
                  {t(ECRAN.partage, langue)}
                </p>
              </section>
            )}
          </div>
          <aside className={COTE}>
            <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
              <p className="text-base font-semibold text-zinc-900">
                {t(ECRAN.apresTitre, langue)}
              </p>
              <p className="text-base text-zinc-600">
                {t(ECRAN.apresTexte, langue)}
              </p>
              <Link
                href="/blog/ouvrir-un-restaurant-demarches"
                className="w-fit text-base text-brand-navy underline-offset-2 hover:underline"
              >
                {t(ECRAN.apresLien, langue)}
              </Link>
            </div>
            <SuiteOutils actuel="diagnostic" langue={langue} />
          </aside>
        </div>
      </main>

      <Commis />
    </div>
  );
}
