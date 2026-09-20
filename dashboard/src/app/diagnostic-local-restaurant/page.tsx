import type { Metadata } from "next";
import Link from "next/link";
import { Commis } from "@/components/commis/Commis";
import { DonneesStructurees } from "@/components/seo/DonneesStructurees";
import { filAriane } from "@/lib/seo/donnees-structurees";
import { siteUrl } from "@/lib/site-url";
import {
  POINTS,
  QUESTIONS,
  REPONSES,
  compter,
  etablirBilan,
  lireReponses,
  type Niveau,
} from "@/lib/diagnostic/local";

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

const COULEUR: Record<
  Niveau,
  { cadre: string; pastille: string; mot: string }
> = {
  bloquant: {
    cadre: "border-red-200 bg-red-50",
    pastille: "bg-red-100 text-red-900",
    mot: "À régler avant de signer",
  },
  verifier: {
    cadre: "border-amber-200 bg-amber-50",
    pastille: "bg-amber-100 text-amber-900",
    mot: "À vérifier",
  },
  leve: {
    cadre: "border-zinc-200 bg-white",
    pastille: "bg-zinc-100 text-zinc-700",
    mot: "Rien à demander ici",
  },
};

export default async function DiagnosticPage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const query = await searchParams;
  const reponses = lireReponses(query);
  const repondu = Boolean(query.diagnostique);
  const bilans = etablirBilan(reponses);
  const totaux = compter(bilans);

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 py-12">
        <DonneesStructurees
          donnees={filAriane([
            { nom: "Klarr", url: siteUrl() },
            { nom: "Diagnostic d'un local", url: `${siteUrl()}${CHEMIN}` },
          ])}
        />

        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-orange">
            Avant de signer
          </span>
          <h1 className="font-serif text-4xl text-ink sm:text-5xl">
            Ce local peut-il accueillir votre restaurant ?
          </h1>
          <p className="text-base text-zinc-600">
            Cinq points empêchent d&apos;ouvrir : l&apos;extraction, la
            destination du bail, la copropriété, l&apos;ERP et la terrasse. Ce
            ne sont pas les plus longs à régler, ce sont ceux qui se règlent{" "}
            <strong>avant la signature</strong> — ou ne se règlent pas.
          </p>
        </div>

        {/* L'avertissement est ici, pas en bas : quelqu'un qui lit un
            résultat a déjà cessé de lire le reste de la page. */}
        <div className="rounded-2xl border border-zinc-300 bg-white p-5">
          <p className="text-sm font-semibold text-zinc-900">
            Ce questionnaire ne vous dira jamais que le local convient.
          </p>
          <p className="mt-1.5 text-sm text-zinc-600">
            Nous n&apos;avons vu ni les lieux, ni le bail, ni le règlement de
            copropriété : nous ne pouvons rien conclure, et personne ne le
            pourrait à notre place. Ce qu&apos;il fait, c&apos;est transformer
            vos « je ne sais pas » en questions précises, adressées à des gens
            précis. Il ne remplace ni un architecte, ni un avocat, ni un bureau
            de contrôle — il vous dit lesquels appeler.
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
                {point.titre}
              </legend>
              {QUESTIONS.filter((q) => q.point === point.id).map((question) => (
                <div key={question.id} className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-zinc-800">
                    {question.texte}
                  </p>
                  {question.aide && (
                    <p className="text-xs text-zinc-500">{question.aide}</p>
                  )}
                  <div className="flex flex-wrap gap-4">
                    {REPONSES.map((valeur) => (
                      <label
                        key={valeur}
                        className="flex items-center gap-1.5 text-sm text-zinc-700"
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={valeur}
                          defaultChecked={reponses.get(question.id) === valeur}
                          className="accent-brand-navy"
                        />
                        {valeur === "inconnu" ? "Je ne sais pas" : valeur}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </fieldset>
          ))}

          <button
            type="submit"
            className="rounded-md bg-brand-navy px-5 py-3 text-base font-medium text-white transition-colors hover:bg-brand-navy-hover"
          >
            Voir ce qu&apos;il me reste à vérifier
          </button>
        </form>

        {repondu && (
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="font-serif text-3xl text-ink">
                Ce qu&apos;il vous reste à vérifier
              </h2>
              <p className="text-sm text-zinc-600">
                {totaux.bloquant > 0
                  ? `${totaux.bloquant} point${totaux.bloquant > 1 ? "s" : ""} à régler avant de signer, ${totaux.verifier} à vérifier.`
                  : totaux.verifier > 0
                    ? `Aucun point bloquant d'après vos réponses, ${totaux.verifier} à vérifier quand même.`
                    : "Vos réponses ne laissent aucune question ouverte sur ces cinq points — ce qui ne veut pas dire que le local convient, seulement que ces cinq-là sont traités."}
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
                      {bilan.point.titre}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style.pastille}`}
                    >
                      {style.mot}
                    </span>
                  </div>

                  <ul className="flex flex-col gap-2">
                    {bilan.constats.map((constat, rang) => (
                      <li key={rang} className="text-sm text-zinc-700">
                        {constat.texte}
                      </li>
                    ))}
                  </ul>

                  {/* Toujours affiché, même sur un point levé : c'est la
                      seule chose que cette page apporte vraiment. */}
                  <div className="rounded-xl bg-white/70 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      À qui demander
                    </p>
                    <p className="mt-1 text-sm text-zinc-700">
                      {bilan.point.aQuiDemander}
                    </p>
                  </div>

                  {bilan.point.article && (
                    <Link
                      href={`/blog/${bilan.point.article.slug}`}
                      className="w-fit text-sm text-brand-navy underline-offset-2 hover:underline"
                    >
                      {bilan.point.article.titre} →
                    </Link>
                  )}
                </article>
              );
            })}

            <p className="text-xs text-zinc-500">
              Cette page vit dans son adresse : copiez-la pour la retrouver, ou
              envoyez-la à votre associé, à votre courtier ou à votre avocat.
            </p>
          </section>
        )}

        <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-zinc-900">
            Et après la signature ?
          </p>
          <p className="text-sm text-zinc-600">
            Licence, déclaration sanitaire, HACCP, SACEM, diagnostics avant
            travaux : tout cela se règle ensuite, et se rattrape. Les cinq
            points ci-dessus, non.
          </p>
          <Link
            href="/blog/ouvrir-un-restaurant-demarches"
            className="w-fit text-sm text-brand-navy underline-offset-2 hover:underline"
          >
            Ouvrir un restaurant : tout ce qu&apos;on découvre trop tard →
          </Link>
        </div>
      </main>

      <Commis />
    </div>
  );
}
