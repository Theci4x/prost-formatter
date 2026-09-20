import type { Metadata } from "next";
import Link from "next/link";
import { Commis } from "@/components/commis/Commis";
import { DonneesStructurees } from "@/components/seo/DonneesStructurees";
import { filAriane } from "@/lib/seo/donnees-structurees";
import { siteUrl } from "@/lib/site-url";
import {
  PHASES,
  calendrier,
  dateLisible,
  jalonsDe,
  lireDate,
  ouvertureParDefaut,
} from "@/lib/ouverture/calendrier";

/**
 * Le calendrier d'ouverture, à rebours depuis la date visée.
 *
 * L'écran distingue à l'œil nu ce qui est calculé de ce qui ne l'est pas
 * — un jalon national porte une date, un jalon local porte un numéro de
 * téléphone à composer. La raison est dans `calendrier.ts` : un délai
 * faux est pire qu'un délai absent, parce qu'on s'organise dessus.
 */

const CHEMIN = "/calendrier-ouverture-restaurant";

export const metadata: Metadata = {
  title: "Calendrier : quand commencer chaque démarche pour ouvrir",
  description:
    "Votre date d'ouverture, et ce qu'il faut avoir fait avant. Les délais fixés par la loi sont calculés ; ceux qui dépendent de votre mairie sont signalés comme tels plutôt que devinés.",
  alternates: { canonical: CHEMIN },
};

type Query = { ouverture?: string | string[]; planifie?: string | string[] };

export default async function CalendrierPage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const query = await searchParams;
  const ouverture = lireDate(query.ouverture);
  const planifie = Boolean(query.planifie) && ouverture !== null;
  const jalons = calendrier(ouverture);
  const calcules = jalons.filter((jalon) => jalon.date !== null).length;

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 py-12">
        <DonneesStructurees
          donnees={filAriane([
            { nom: "Klarr", url: siteUrl() },
            { nom: "Calendrier d'ouverture", url: `${siteUrl()}${CHEMIN}` },
          ])}
        />

        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-orange">
            Calendrier
          </span>
          <h1 className="font-serif text-4xl text-ink sm:text-5xl">
            Quand commencer quoi
          </h1>
          <p className="text-base text-zinc-600">
            Donnez votre date d&apos;ouverture : on remonte le fil. Les
            démarches dont le délai est fixé par un texte reçoivent une date.
            Celles qui dépendent de votre mairie, de votre préfecture ou de
            votre copropriété reçoivent un numéro à appeler — pas une date
            inventée.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-300 bg-white p-5">
          <p className="text-sm font-semibold text-zinc-900">
            Pourquoi on ne vous donne pas toutes les dates.
          </p>
          <p className="mt-1.5 text-sm text-zinc-600">
            Un délai d&apos;instruction en mairie va de trois semaines à
            plusieurs mois selon la commune, la saison et le dossier. Un outil
            qui annoncerait « deux mois » se tromperait une fois sur deux, et
            celui qui s&apos;en apercevrait serait celui qui ouvre en retard. Ce
            qui ne varie jamais, en revanche, c&apos;est{" "}
            <strong>l&apos;ordre</strong> : c&apos;est lui que cette page vous
            donne en entier.
          </p>
        </div>

        <form
          method="get"
          className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm sm:flex-row sm:items-end"
        >
          <input type="hidden" name="planifie" value="1" />
          <label
            className="flex flex-1 flex-col gap-1.5 text-sm font-medium text-zinc-700"
            htmlFor="ouverture"
          >
            Votre date d&apos;ouverture, même approximative
            <input
              id="ouverture"
              name="ouverture"
              type="date"
              defaultValue={
                query.ouverture && typeof query.ouverture === "string"
                  ? query.ouverture
                  : ouvertureParDefaut()
              }
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-base outline-none focus:border-brand-navy"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-brand-navy px-5 py-2.5 text-base font-medium text-white transition-colors hover:bg-brand-navy-hover"
          >
            Remonter le fil
          </button>
        </form>

        {planifie && ouverture && (
          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="font-serif text-3xl text-ink">
                Ouverture le {dateLisible(ouverture)}
              </h2>
              <p className="text-sm text-zinc-600">
                {calcules} démarches sur {jalons.length} ont un délai fixé par
                un texte : elles portent une date. Les autres dépendent de gens
                qu&apos;il faut appeler.
              </p>
            </div>

            {PHASES.map((phase) => {
              const dePhase = jalonsDe(jalons, phase.id);
              if (dePhase.length === 0) return null;
              return (
                <div key={phase.id} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-navy">
                      {phase.titre}
                    </h3>
                    <p className="text-sm text-zinc-500">{phase.chapo}</p>
                  </div>

                  <ul className="flex flex-col gap-3">
                    {dePhase.map((jalon) => (
                      <li
                        key={jalon.id}
                        className="flex flex-col gap-2 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <span className="text-base font-medium text-zinc-900">
                            {jalon.titre}
                          </span>
                          {jalon.date ? (
                            <span className="shrink-0 rounded-full bg-brand-navy px-2.5 py-0.5 text-xs font-medium text-white">
                              {dateLisible(jalon.date)}
                            </span>
                          ) : (
                            <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                              délai à demander
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-zinc-600">{jalon.quoi}</p>

                        {jalon.precedent && (
                          <p className="text-sm text-zinc-500">
                            <span className="font-medium text-zinc-700">
                              Après :
                            </span>{" "}
                            {jalon.precedent.titre.toLowerCase()}.
                          </p>
                        )}

                        {jalon.aQuiDemander && (
                          <p className="text-sm text-zinc-500">
                            <span className="font-medium text-zinc-700">
                              À qui demander :
                            </span>{" "}
                            {jalon.aQuiDemander}
                          </p>
                        )}

                        {jalon.article && (
                          <Link
                            href={`/blog/${jalon.article}`}
                            className="w-fit text-sm text-brand-navy underline-offset-2 hover:underline"
                          >
                            En savoir plus →
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}

            <p className="text-xs text-zinc-500">
              Les dates calculées sont des dates <em>limites</em>, pas des dates
              conseillées : s&apos;y prendre la veille de l&apos;échéance,
              c&apos;est n&apos;avoir aucune marge si un dossier est incomplet.
              Cette page vit dans son adresse — gardez-la, elle se recalcule si
              votre date bouge.
            </p>
          </section>
        )}

        <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-zinc-900">
            Avant tout ça, il y a le local.
          </p>
          <p className="text-sm text-zinc-600">
            Aucune de ces démarches ne sert si l&apos;extraction, la destination
            du bail ou la copropriété rendent le projet impossible. Ces cinq
            points-là se vérifient avant de signer.
          </p>
          <Link
            href="/diagnostic-local-restaurant"
            className="w-fit text-sm text-brand-navy underline-offset-2 hover:underline"
          >
            Ce local peut-il accueillir votre restaurant ? →
          </Link>
        </div>
      </main>

      <Commis />
    </div>
  );
}
