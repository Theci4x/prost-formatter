import type { Metadata } from "next";
import Link from "next/link";
import { Commis } from "@/components/commis/Commis";
import { EnteteOutil } from "@/components/outils/EnteteOutil";
import { RappelOuverture } from "@/components/ouverture/RappelOuverture";
import { DonneesStructurees } from "@/components/seo/DonneesStructurees";
import { filAriane } from "@/lib/seo/donnees-structurees";
import { siteUrl } from "@/lib/site-url";
import { langueIndexable } from "@/lib/i18n/langue";
import { PLAN, t } from "@/lib/i18n/outils";
import type { OutilId } from "@/components/outils/SuiteOutils";

/**
 * Le plan d'ouverture : le fil qui relie les outils entre eux.
 *
 * Pas un sixième outil. Les cinq précédents répondent chacun à une
 * question précise et se suffisent à eux-mêmes ; ce qui manquait était
 * l'ordre dans lequel on les rencontre, parce qu'on ne cherche pas un
 * calendrier d'ouverture quand on hésite encore sur un local.
 *
 * Et surtout, le rappel. C'est la vraie raison d'être de cette page. Une
 * série d'outils gratuits pour des gens à six ou dix-huit mois de leur
 * ouverture, sans moyen de revenir vers eux, fait la prospection des
 * concurrents : on rend le service, le concurrent passe l'appel au
 * huitième mois. Le formulaire est donc en bas mais il n'est pas
 * accessoire — c'est lui qui transforme une bonne action en travail
 * utile.
 */

const CHEMIN = "/ouvrir-un-restaurant";

export const metadata: Metadata = {
  title: "Ouvrir un restaurant : par quoi commencer, dans quel ordre",
  description:
    "Le local avant tout le reste, puis les autorisations, puis la visibilité. Quatre outils gratuits, dans l'ordre où les questions se posent — et un rappel le mois de votre ouverture.",
  alternates: { canonical: CHEMIN },
};

/** Les quatre, dans l'ordre. Leurs textes vivent dans les traductions. */
const ETAPES: { id: OutilId; lien: string }[] = [
  { id: "diagnostic", lien: "/diagnostic-local-restaurant" },
  { id: "calendrier", lien: "/calendrier-ouverture-restaurant" },
  { id: "audit", lien: "/audit-fiche-google-restaurant" },
  { id: "calculateur", lien: "/calculateur-commissions-restaurant" },
];

export default async function OuvrirPage() {
  const langue = await langueIndexable();
  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <EnteteOutil langue={langue} />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-5 py-12">
        <DonneesStructurees
          donnees={filAriane([
            { nom: "Klarr", url: siteUrl() },
            { nom: "Ouvrir un restaurant", url: `${siteUrl()}${CHEMIN}` },
          ])}
        />

        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-orange">
            {t(PLAN.surtitre, langue)}
          </span>
          <h1 className="font-serif text-4xl text-ink sm:text-5xl">
            {t(PLAN.titre, langue)}
          </h1>
          <p className="text-base text-zinc-600">{t(PLAN.chapo, langue)}</p>
        </div>

        <ol className="flex flex-col gap-4">
          {ETAPES.map((etape, rang) => (
            <li
              key={etape.lien}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-orange">
                  {rang + 1} · {t(PLAN.moments[etape.id], langue)}
                </span>
                <h2 className="text-base font-semibold text-zinc-900">
                  {t(PLAN.titres[etape.id], langue)}
                </h2>
              </div>
              <p className="text-base text-zinc-600">
                {t(PLAN.textes[etape.id], langue)}
              </p>
              <Link
                href={etape.lien}
                className="w-fit rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-brand-navy transition-colors hover:border-brand-navy"
              >
                {t(PLAN.actions[etape.id], langue)} →
              </Link>
            </li>
          ))}
        </ol>

        <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
          <p className="text-base font-semibold text-zinc-900">
            {t(PLAN.resteTitre, langue)}
          </p>
          <p className="text-base text-zinc-600">
            {t(PLAN.resteTexte, langue)}
          </p>
          <Link
            href="/blog"
            className="w-fit text-base text-brand-navy underline-offset-2 hover:underline"
          >
            {t(PLAN.journal, langue)}
          </Link>
        </div>

        <RappelOuverture source="plan-ouverture" langue={langue} />
      </main>

      <Commis />
    </div>
  );
}
