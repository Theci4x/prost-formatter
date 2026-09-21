import type { Metadata } from "next";
import Link from "next/link";
import { Commis } from "@/components/commis/Commis";
import { EnteteOutil } from "@/components/outils/EnteteOutil";
import { DonneesStructurees } from "@/components/seo/DonneesStructurees";
import { filAriane } from "@/lib/seo/donnees-structurees";
import { siteUrl } from "@/lib/site-url";
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
const etiquette = "flex flex-col gap-1.5 text-sm font-medium text-zinc-700";

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
              ? "text-sm font-semibold text-zinc-900"
              : "text-sm text-zinc-600"
          }
        >
          {libelle}
        </span>
        {aide && <span className="text-xs text-zinc-400">{aide}</span>}
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
  const query = await searchParams;
  const saisie = lireSaisie(query);
  const resultat = calculer(saisie);
  const conclusion = verdict(resultat);
  // Tant que rien n'a été soumis, on montre le formulaire pré-rempli mais
  // pas de conclusion : afficher un verdict sur des chiffres que personne
  // n'a saisis, c'est le comparateur d'éditeur qu'on refuse d'être.
  const calcule = Boolean(query.calcule);

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <EnteteOutil />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 py-12">
        <DonneesStructurees
          donnees={filAriane([
            { nom: "Klarr", url: siteUrl() },
            { nom: "Calculateur de commissions", url: `${siteUrl()}${CHEMIN}` },
          ])}
        />

        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-orange">
            Calculateur
          </span>
          <h1 className="font-serif text-4xl text-ink sm:text-5xl">
            Combien vous coûtent vos commissions ?
          </h1>
          <p className="text-base text-zinc-600">
            Trois chiffres, dont un que les comparateurs d&apos;éditeurs ne
            posent jamais : la part de vos clients qui seraient venus sans la
            plateforme. C&apos;est celui qui décide.
          </p>
        </div>

        <form
          method="get"
          className="flex flex-col gap-5 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm"
        >
          <input type="hidden" name="calcule" value="1" />

          <label className={etiquette} htmlFor="couverts">
            Couverts réservés via la plateforme, par mois
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
            <span className="text-xs font-normal text-zinc-500">
              Pas votre total de couverts : seulement ceux qui passent par elle.
            </span>
          </label>

          <label className={etiquette} htmlFor="commission">
            Commission par couvert, en euros
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
            <span className="text-xs font-normal text-zinc-500">
              Entre 1 et 2 € chez la plupart des plateformes françaises. Prenez
              le vôtre, il se négocie.
            </span>
          </label>

          <label className={etiquette} htmlFor="acquis">
            Sur 100 de ces clients, combien seraient venus sans elle ?
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
            <span className="text-xs font-normal text-zinc-500">
              Personne ne le sait au couvert près. Vos habitués, ceux qui vous
              cherchaient par votre nom, ceux qui passaient devant : estimez.
            </span>
          </label>

          <button
            type="submit"
            className="rounded-md bg-brand-navy px-5 py-3 text-base font-medium text-white transition-colors hover:bg-brand-navy-hover"
          >
            Calculer
          </button>
        </form>

        {calcule && (
          <section className="flex flex-col gap-5 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-900">
              Sur une année
            </h2>

            <div className="flex flex-col">
              <Ligne
                libelle="Ce que la commission vous coûte"
                valeur={euros(resultat.commissionAn)}
                fort
                aide={`${euros(resultat.commissionMois)} par mois`}
              />
              <Ligne
                libelle="Payé sur des clients qui seraient venus quand même"
                valeur={euros(resultat.gaspillageAn)}
                aide={`${saisie.partDejaAcquise} % de la commission`}
              />
              <Ligne
                libelle="Payé pour une vraie découverte"
                valeur={euros(resultat.acquisitionAn)}
                aide="Là, la commission achète quelque chose"
              />
              <Ligne
                libelle="L'abonnement Klarr, module Réservations"
                valeur={`${euros(resultat.abonnementAn)} HT`}
                aide={`${ABONNEMENT.reservationsHT} € HT par mois, sans commission`}
              />
            </div>

            {conclusion === "abonnement" && (
              <div className="flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-900">
                  L&apos;abonnement vous coûterait {euros(resultat.ecartAn)} de
                  moins par an.
                </p>
                <p className="text-sm text-emerald-800">
                  Et surtout : les {euros(resultat.gaspillageAn)} payés sur des
                  clients déjà acquis ne servent à rien. C&apos;est cette
                  ligne-là qu&apos;un abonnement supprime — pas la découverte,
                  que vous continuerez de payer autrement.
                </p>
              </div>
            )}

            {conclusion === "limite" && (
              <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">
                  L&apos;écart est de {euros(resultat.ecartAn)} par an.
                  C&apos;est peu.
                </p>
                <p className="text-sm text-amber-800">
                  À ce niveau, changer d&apos;outil ne se justifie pas par le
                  prix seul. Regardez plutôt ce que vous perdez d&apos;autre :
                  la relation au client, le fichier, la main sur vos
                  disponibilités. Si ça vous est égal, restez.
                </p>
              </div>
            )}

            {conclusion === "commission" && (
              <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-zinc-900">
                  À votre volume, la commission vous coûte moins cher que notre
                  abonnement.
                </p>
                <p className="text-sm text-zinc-700">
                  Nous vendons l&apos;abonnement, et nous vous disons de ne pas
                  le prendre : en dessous d&apos;environ{" "}
                  {Number.isFinite(resultat.seuilCouverts)
                    ? `${resultat.seuilCouverts} couverts`
                    : "ce volume"}{" "}
                  réservés par mois à ce tarif, la plateforme est le bon calcul.
                  Revenez quand vous les dépasserez.
                </p>
              </div>
            )}

            <p className="text-xs text-zinc-500">
              Ce calcul ne compte que les commissions. Il ignore ce qu&apos;une
              plateforme apporte — de la demande que vous n&apos;auriez pas eue
              — et ce qu&apos;elle coûte en plus : l&apos;adresse e-mail de
              votre client, que vous ne récupérez pas.
            </p>
          </section>
        )}

        <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-zinc-900">
            Nous ne sommes pas neutres, et autant le dire.
          </p>
          <p className="text-sm text-zinc-600">
            Klarr vend une page de réservation à l&apos;abonnement, sans
            commission : nous avons un intérêt direct à ce que vous trouviez les
            commissions trop chères. C&apos;est pourquoi ce calculateur vous
            donne la méthode plutôt qu&apos;un résultat, et vous dit quand
            rester où vous êtes.
          </p>
          <Link
            href="/blog/reservations-sans-commission-guide-restaurants-independants"
            className="w-fit text-sm text-brand-navy underline-offset-2 hover:underline"
          >
            Le raisonnement en entier, dans le journal →
          </Link>
          <Link
            href="/comparatif-logiciels-reservation-restaurant"
            className="w-fit text-sm text-brand-navy underline-offset-2 hover:underline"
          >
            Le comparatif avec TheFork, Zenchef et Guestonline →
          </Link>
        </div>
      </main>

      <Commis />
    </div>
  );
}
