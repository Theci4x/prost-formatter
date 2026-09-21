import type { Metadata } from "next";
import Link from "next/link";
import { Commis } from "@/components/commis/Commis";
import { EnteteOutil } from "@/components/outils/EnteteOutil";
import { SuiteOutils } from "@/components/outils/SuiteOutils";
import { DonneesStructurees } from "@/components/seo/DonneesStructurees";
import { filAriane } from "@/lib/seo/donnees-structurees";
import { siteUrl } from "@/lib/site-url";
import { langueIndexable } from "@/lib/i18n/langue";
import { t } from "@/lib/i18n/outils";
import { ECRAN, PILIERS } from "@/lib/audit/ecran";
import { adressePour } from "@/lib/blog/traductions";
import { LIBELLE_MODULE, PRIX_MODULE } from "@/lib/abonnement/modules";

/**
 * La porte d'entrée de l'audit de visibilité.
 *
 * L'audit lui-même existe depuis longtemps, et il fait bien plus qu'un
 * « kit de lancement Google » : il interroge la fiche réelle, la note,
 * les photos, la fraîcheur des avis, le balisage du site et sa présence
 * dans les réponses des IA. Ce qui lui manquait était une porte : une
 * page qui réponde à « auditer ma fiche Google restaurant » et qui
 * explique ce qu'on regarde avant de demander une adresse.
 *
 * Le formulaire, lui, reste `noindex` — c'est un formulaire, il ne
 * répond à aucune recherche. Celle-ci y répond, donc elle s'indexe.
 *
 * **Elle démontre, elle ne remplace pas.** C'est le point de cette page
 * et la raison pour laquelle Klarr ne distribue pas un guide « comment
 * remplir votre fiche » : un guide apprend au restaurateur à se passer
 * du module de visibilité, qu'il paie. Montrer ce qui manque chez lui,
 * précisément, avec ses chiffres, fait l'inverse — et lui rend service
 * dans les deux cas, puisqu'il repart avec la liste même s'il ne prend
 * rien.
 */

const CHEMIN = "/audit-fiche-google-restaurant";

export const metadata: Metadata = {
  title: "Auditer sa fiche Google de restaurant, gratuitement",
  description:
    "Ce que Google, les avis et les IA disent de votre restaurant aujourd'hui. Photos, horaires, fraîcheur des avis, balisage du site : ce qu'on regarde, et ce que l'audit vous rend.",
  alternates: { canonical: CHEMIN },
};

export default async function AuditPage() {
  const langue = await langueIndexable();
  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <EnteteOutil langue={langue} />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-5 py-12">
        <DonneesStructurees
          donnees={filAriane([
            { nom: "Klarr", url: siteUrl() },
            { nom: "Audit de fiche Google", url: `${siteUrl()}${CHEMIN}` },
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
          <Link
            href="/test-presence-google"
            className="w-fit rounded-md bg-brand-navy px-5 py-3 text-base font-medium text-white transition-colors hover:bg-brand-navy-hover"
          >
            {t(ECRAN.bouton, langue)}
          </Link>
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-3xl text-ink">
            {t(ECRAN.regardeTitre, langue)}
          </h2>
          {PILIERS.map((pilier) => {
            // Un article non traduit perd son lien et garde son texte :
            // c'est la règle du journal, et renvoyer un lecteur chinois
            // vers une page française serait une impasse annoncée comme
            // une piste.
            const adresse = adressePour(pilier.article.slug, langue);
            return (
              <article
                key={pilier.id}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-semibold text-zinc-900">
                    {t(pilier.titre, langue)}
                  </h3>
                  <p className="text-base text-zinc-600">
                    {t(pilier.quoi, langue)}
                  </p>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {pilier.signaux.map((signal) => (
                    <li
                      key={signal.fr}
                      className="flex gap-2 text-base text-zinc-600"
                    >
                      <span aria-hidden="true" className="text-zinc-300">
                        —
                      </span>
                      {t(signal, langue)}
                    </li>
                  ))}
                </ul>
                {adresse && (
                  <Link
                    href={adresse}
                    className="w-fit text-base text-brand-navy underline-offset-2 hover:underline"
                  >
                    {t(pilier.article.titre, langue)} →
                  </Link>
                )}
              </article>
            );
          })}
        </section>

        {/* La frontière, dite franchement. Un prospect qui comprend ce
            qu'il achète discute moins et reste plus longtemps. */}
        <section className="flex flex-col gap-3 rounded-2xl border border-zinc-300 bg-white p-6">
          <h2 className="text-base font-semibold text-zinc-900">
            {t(ECRAN.frontiereTitre, langue)}
          </h2>
          <p className="text-base text-zinc-600">
            <strong>{t(ECRAN.gratuitFort, langue)}</strong>
            {t(ECRAN.gratuitSuite, langue)}
          </p>
          <p className="text-base text-zinc-600">
            <strong>{t(ECRAN.payantFort, langue)}</strong>{" "}
            {t(ECRAN.payantTexte, langue)
              .replace("{module}", LIBELLE_MODULE.visibilite)
              .replace("{prix}", PRIX_MODULE.visibilite)}
          </p>
          <p className="text-base text-zinc-600">
            {t(ECRAN.gesteTexte, langue)}
          </p>
        </section>

        <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
          <p className="text-base font-semibold text-zinc-900">
            {t(ECRAN.ouvertureTitre, langue)}
          </p>
          <p className="text-base text-zinc-600">
            {t(ECRAN.ouvertureTexte, langue)}
          </p>
          <Link
            href="/calendrier-ouverture-restaurant"
            className="w-fit text-base text-brand-navy underline-offset-2 hover:underline"
          >
            {t(ECRAN.ouvertureLien, langue)}
          </Link>
        </div>
        <SuiteOutils actuel="audit" langue={langue} />
      </main>

      <Commis />
    </div>
  );
}
