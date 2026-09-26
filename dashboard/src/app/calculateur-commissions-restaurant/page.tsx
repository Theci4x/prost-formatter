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
import { t } from "@/lib/i18n/outils";
import { ECRAN, remplir } from "@/lib/commission/ecran";
import { adressePour } from "@/lib/blog/traductions";
import {
  ABONNEMENT,
  COMMISSION_MAX,
  COMMISSION_MIN,
  calculer,
  euros,
  lireSaisie,
  verdict,
} from "@/lib/commission/calcul";

/**
 * « Combien me coûte la commission ? »
 *
 * La seule des pages d'appel de Klarr qui s'adresse à quelqu'un capable
 * de signer ce mois-ci : un restaurant déjà ouvert, déjà sur une
 * plateforme, qui tape « commission TheFork » un soir de bilan. Les
 * autres outils de la série visent des gens à douze mois de leur
 * ouverture ; celui-ci vise une facture qui arrive à la fin du mois.
 *
 * Formulaire GET, sans JavaScript : le résultat vit dans l'adresse, donc
 * il se partage — à un associé, à un comptable — et le bouton
 * « précédent » ramène à l'essai précédent. C'est aussi la seule façon
 * que Google lise autre chose qu'un formulaire vide.
 *
 * Le calcul peut conclure contre nous, et le fait. Voir `calcul.ts`.
 */

const CHEMIN = "/calculateur-commissions-restaurant";

export const metadata: Metadata = {
  title: "Calculateur : combien vous coûtent les commissions de réservation ?",
  description:
    "Vos couverts, votre commission au couvert, et la part de clients qui seraient venus sans la plateforme. Le coût annuel réel, et à partir de quand l'abonnement devient moins cher — ou ne l'est pas.",
  alternates: { canonical: CHEMIN },
};

type Query = {
  couverts?: string | string[];
  commission?: string | string[];
  acquis?: string | string[];
  calcule?: string | string[];
};

const champ =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-base outline-none focus:border-brand-navy";
const etiquette = "flex flex-col gap-1.5 text-base font-medium text-zinc-700";

function Ligne({
  libelle,
  valeur,
  fort = false,
  aide,
}: {
  libelle: string;
  valeur: string;
  fort?: boolean;
  aide?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-zinc-100 py-3 last:border-0">
      <span className="flex flex-col">
        <span
          className={
            fort
              ? "text-base font-semibold text-zinc-900"
              : "text-base text-zinc-600"
          }
        >
          {libelle}
        </span>
        {aide && <span className="text-sm text-zinc-400">{aide}</span>}
      </span>
      <span
        className={`shrink-0 tabular-nums ${
          fort
            ? "text-2xl font-semibold text-zinc-900"
            : "text-base text-zinc-700"
        }`}
      >
        {valeur}
      </span>
    </div>
  );
}

export default async function CalculateurPage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const langue = await langueIndexable();
  const query = await searchParams;
  const saisie = lireSaisie(query);
  const resultat = calculer(saisie);
  const conclusion = verdict(resultat);
  // Tant que rien n'a été soumis, on montre le formulaire pré-rempli mais
  // pas de conclusion : afficher un verdict sur des chiffres que personne
  // n'a saisis, c'est le comparateur d'éditeur qu'on refuse d'être.
  const calcule = Boolean(query.calcule);
  const raisonnement = adressePour(
    "reservations-sans-commission-guide-restaurants-independants",
    langue,
  );

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <EnteteOutil langue={langue} />

      <main className={PAGE_OUTIL}>
        <DonneesStructurees
          donnees={filAriane([
            { nom: "Klarr", url: siteUrl() },
            { nom: "Calculateur de commissions", url: `${siteUrl()}${CHEMIN}` },
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
            <form
              method="get"
              className="flex flex-col gap-5 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm"
            >
              <input type="hidden" name="calcule" value="1" />

              <label className={etiquette} htmlFor="couverts">
                {t(ECRAN.champCouverts, langue)}
                <input
                  id="couverts"
                  name="couverts"
                  type="number"
                  min={0}
                  max={100000}
                  step={10}
                  defaultValue={saisie.couvertsPlateforme}
                  className={champ}
                />
                <span className="text-sm font-normal text-zinc-500">
                  {t(ECRAN.aideCouverts, langue)}
                </span>
              </label>

              <label className={etiquette} htmlFor="commission">
                {t(ECRAN.champCommission, langue)}
                <input
                  id="commission"
                  name="commission"
                  type="number"
                  min={COMMISSION_MIN}
                  max={COMMISSION_MAX}
                  step={0.1}
                  defaultValue={saisie.commissionParCouvert}
                  className={champ}
                />
                <span className="text-sm font-normal text-zinc-500">
                  {t(ECRAN.aideCommission, langue)}
                </span>
              </label>

              <label className={etiquette} htmlFor="acquis">
                {t(ECRAN.champAcquis, langue)}
                <input
                  id="acquis"
                  name="acquis"
                  type="number"
                  min={0}
                  max={100}
                  step={5}
                  defaultValue={saisie.partDejaAcquise}
                  className={champ}
                />
                <span className="text-sm font-normal text-zinc-500">
                  {t(ECRAN.aideAcquis, langue)}
                </span>
              </label>

              <button
                type="submit"
                className="rounded-md bg-brand-navy px-5 py-3 text-base font-medium text-white transition-colors hover:bg-brand-navy-hover"
              >
                {t(ECRAN.bouton, langue)}
              </button>
            </form>

            {calcule && (
              <section className="flex flex-col gap-5 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
                <h2 className="text-base font-semibold text-zinc-900">
                  {t(ECRAN.surUneAnnee, langue)}
                </h2>

                <div className="flex flex-col">
                  <Ligne
                    libelle={t(ECRAN.ligneCout, langue)}
                    valeur={euros(resultat.commissionAn, langue)}
                    fort
                    aide={remplir(t(ECRAN.aideCout, langue), {
                      mois: euros(resultat.commissionMois, langue),
                    })}
                  />
                  <Ligne
                    libelle={t(ECRAN.ligneGaspillage, langue)}
                    valeur={euros(resultat.gaspillageAn, langue)}
                    aide={remplir(t(ECRAN.aideGaspillage, langue), {
                      part: saisie.partDejaAcquise,
                    })}
                  />
                  <Ligne
                    libelle={t(ECRAN.ligneAcquisition, langue)}
                    valeur={euros(resultat.acquisitionAn, langue)}
                    aide={t(ECRAN.aideAcquisition, langue)}
                  />
                  <Ligne
                    libelle={t(ECRAN.ligneAbonnement, langue)}
                    valeur={`${euros(resultat.abonnementAn, langue)} ${t(ECRAN.horsTaxes, langue)}`}
                    aide={remplir(t(ECRAN.aideAbonnement, langue), {
                      prix: ABONNEMENT.reservationsHT,
                    })}
                  />
                </div>

                {conclusion === "abonnement" && (
                  <div className="flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-900">
                      {remplir(t(ECRAN.abonnementTitre, langue), {
                        ecart: euros(resultat.ecartAn, langue),
                      })}
                    </p>
                    <p className="text-base text-emerald-800">
                      {remplir(t(ECRAN.abonnementTexte, langue), {
                        gaspillage: euros(resultat.gaspillageAn, langue),
                      })}
                    </p>
                  </div>
                )}

                {conclusion === "limite" && (
                  <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-900">
                      {remplir(t(ECRAN.limiteTitre, langue), {
                        ecart: euros(resultat.ecartAn, langue),
                      })}
                    </p>
                    <p className="text-base text-amber-800">
                      {t(ECRAN.limiteTexte, langue)}
                    </p>
                  </div>
                )}

                {conclusion === "commission" && (
                  <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-base font-semibold text-zinc-900">
                      {t(ECRAN.commissionTitre, langue)}
                    </p>
                    <p className="text-base text-zinc-700">
                      {remplir(t(ECRAN.commissionTexte, langue), {
                        seuil: Number.isFinite(resultat.seuilCouverts)
                          ? remplir(t(ECRAN.couverts, langue), {
                              n: resultat.seuilCouverts,
                            })
                          : t(ECRAN.ceVolume, langue),
                      })}
                    </p>
                  </div>
                )}

                <p className="text-sm text-zinc-500">{t(ECRAN.note, langue)}</p>
              </section>
            )}
          </div>
          <aside className={COTE}>
            <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
              <p className="text-base font-semibold text-zinc-900">
                {t(ECRAN.neutreTitre, langue)}
              </p>
              <p className="text-base text-zinc-600">
                {t(ECRAN.neutreTexte, langue)}
              </p>
              {/* Même règle que dans le journal : pas de lien vers un article
              qui n'existe pas encore dans la langue du lecteur. */}
              {raisonnement && (
                <Link
                  href={raisonnement}
                  className="w-fit text-base text-brand-navy underline-offset-2 hover:underline"
                >
                  {t(ECRAN.lienJournal, langue)}
                </Link>
              )}
              <Link
                href="/comparatif-logiciels-reservation-restaurant"
                className="w-fit text-base text-brand-navy underline-offset-2 hover:underline"
              >
                {t(ECRAN.lienComparatif, langue)}
              </Link>
            </div>
            <SuiteOutils actuel="calculateur" langue={langue} />
          </aside>
        </div>
      </main>

      <Commis />
    </div>
  );
}
