import type { Metadata } from "next";
import Link from "next/link";
import { Commis } from "@/components/commis/Commis";
import { EnteteOutil } from "@/components/outils/EnteteOutil";
import { SuiteOutils } from "@/components/outils/SuiteOutils";
import { RappelOuverture } from "@/components/ouverture/RappelOuverture";
import { DonneesStructurees } from "@/components/seo/DonneesStructurees";
import { filAriane } from "@/lib/seo/donnees-structurees";
import { siteUrl } from "@/lib/site-url";
import { langueIndexable } from "@/lib/i18n/langue";
import { adressePour } from "@/lib/blog/traductions";
import { t } from "@/lib/i18n/outils";
import {
  ECRAN,
  PHASES,
  calendrier,
  dateLisible,
  jalonsDe,
  lireDate,
  ouvertureParDefaut,
  resumeCalendrier,
} from "@/lib/ouverture/calendrier";

/**
 * Le calendrier d'ouverture, à rebours depuis la date visée.
 *
 * L'écran distingue à l'œil nu ce qui est calculé de ce qui ne l'est pas
 * — un jalon national porte une date, un jalon local porte un numéro de
 * téléphone à composer. La raison est dans `calendrier.ts` : un délai
 * faux est pire qu'un délai absent, parce qu'on s'organise dessus.
 *
 * Les dates passent par `dateLisible(date, langue)` et non par un format
 * français figé : c'est la page où la traduction se voit le plus, puisque
 * le lecteur y compte des jours.
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
  const langue = await langueIndexable();
  const query = await searchParams;
  const ouverture = lireDate(query.ouverture);
  const planifie = Boolean(query.planifie) && ouverture !== null;
  const jalons = calendrier(ouverture);
  const calcules = jalons.filter((jalon) => jalon.date !== null).length;

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <EnteteOutil langue={langue} />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-5 py-12">
        <DonneesStructurees
          donnees={filAriane([
            { nom: "Klarr", url: siteUrl() },
            { nom: "Calendrier d'ouverture", url: `${siteUrl()}${CHEMIN}` },
          ])}
        />

        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-orange">
            {t(ECRAN.surtitre, langue)}
          </span>
          <h1 className="font-serif text-4xl text-ink sm:text-5xl">
            {t(ECRAN.titre, langue)}
          </h1>
          <p className="text-base text-zinc-600">{t(ECRAN.chapo, langue)}</p>
        </div>

        <div className="rounded-2xl border border-zinc-300 bg-white p-5">
          <p className="text-base font-semibold text-zinc-900">
            {t(ECRAN.pourquoiTitre, langue)}
          </p>
          <p className="mt-1.5 text-base text-zinc-600">
            {t(ECRAN.pourquoiTexte, langue)}
          </p>
        </div>

        <form
          method="get"
          className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm sm:flex-row sm:items-end"
        >
          <input type="hidden" name="planifie" value="1" />
          <label
            className="flex flex-1 flex-col gap-1.5 text-base font-medium text-zinc-700"
            htmlFor="ouverture"
          >
            {t(ECRAN.champ, langue)}
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
            {t(ECRAN.bouton, langue)}
          </button>
        </form>

        {planifie && ouverture && (
          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="font-serif text-3xl text-ink">
                {t(ECRAN.ouvertureLe, langue)} {dateLisible(ouverture, langue)}
              </h2>
              <p className="text-base text-zinc-600">
                {resumeCalendrier(calcules, jalons.length, langue)}
              </p>
            </div>

            {PHASES.map((phase) => {
              const dePhase = jalonsDe(jalons, phase.id);
              if (dePhase.length === 0) return null;
              return (
                <div key={phase.id} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-navy">
                      {t(phase.titre, langue)}
                    </h3>
                    <p className="text-base text-zinc-500">
                      {t(phase.chapo, langue)}
                    </p>
                  </div>

                  <ul className="flex flex-col gap-3">
                    {dePhase.map((jalon) => {
                      const article = jalon.article
                        ? adressePour(jalon.article, langue)
                        : null;
                      return (
                        <li
                          key={jalon.id}
                          className="flex flex-col gap-2 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
                        >
                          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                            <span className="text-base font-medium text-zinc-900">
                              {t(jalon.titre, langue)}
                            </span>
                            {jalon.date ? (
                              <span className="shrink-0 rounded-full bg-brand-navy px-2.5 py-0.5 text-xs font-medium text-white">
                                {dateLisible(jalon.date, langue)}
                              </span>
                            ) : (
                              <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                                {t(ECRAN.aDemander, langue)}
                              </span>
                            )}
                          </div>

                          <p className="text-base text-zinc-600">
                            {t(jalon.quoi, langue)}
                          </p>

                          {jalon.precedent && (
                            <p className="text-base text-zinc-500">
                              <span className="font-medium text-zinc-700">
                                {t(ECRAN.apres, langue)}
                              </span>{" "}
                              {t(jalon.precedent.titre, langue)}.
                            </p>
                          )}

                          {jalon.aQuiDemander && (
                            <p className="text-base text-zinc-500">
                              <span className="font-medium text-zinc-700">
                                {t(ECRAN.aQuiDemander, langue)}
                              </span>{" "}
                              {t(jalon.aQuiDemander, langue)}
                            </p>
                          )}

                          {/* Même règle que dans le journal : pas de lien
                            vers un article qui n'existe pas encore dans
                            la langue du lecteur. */}
                          {article && (
                            <Link
                              href={article}
                              className="w-fit text-base text-brand-navy underline-offset-2 hover:underline"
                            >
                              {t(ECRAN.enSavoirPlus, langue)}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}

            <p className="text-sm text-zinc-500">{t(ECRAN.note, langue)}</p>
          </section>
        )}

        {planifie && <RappelOuverture source="calendrier" langue={langue} />}

        <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
          <p className="text-base font-semibold text-zinc-900">
            {t(ECRAN.localTitre, langue)}
          </p>
          <p className="text-base text-zinc-600">
            {t(ECRAN.localTexte, langue)}
          </p>
          <Link
            href="/diagnostic-local-restaurant"
            className="w-fit text-base text-brand-navy underline-offset-2 hover:underline"
          >
            {t(ECRAN.localLien, langue)}
          </Link>
        </div>
        <SuiteOutils actuel="calendrier" langue={langue} />
      </main>

      <Commis />
    </div>
  );
}
