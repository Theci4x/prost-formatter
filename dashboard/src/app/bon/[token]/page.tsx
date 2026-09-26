import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { SignatureKlarr } from "@/components/brand/SignatureKlarr";
import { BoutonImprimer } from "@/components/bons/BoutonImprimer";
import { langueVisiteur } from "@/lib/i18n/langue";
import { BONS } from "@/lib/i18n/bons";
import { dateLongue } from "@/lib/i18n/dates";
import { etatDuBon, prixBon } from "@/lib/bons/regles";
import { creerPaiementBon, validerBon, type Bon } from "@/lib/bons/serveur";
import { paiementAbouti } from "@/lib/stripe/paiement";

/**
 * Le bon lui-même, à l'adresse que seul l'acheteur (et le bénéficiaire,
 * s'il l'a reçu) connaît. Avant le paiement, c'est la page qui relance
 * Stripe ; après, c'est le bon, qu'on imprime ou qu'on montre en caisse.
 */

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: BONS[await langueVisiteur()].titreOngletBon,
    // Le jeton est dans l'adresse : rien ici n'a vocation à être trouvé.
    robots: { index: false, follow: false, nocache: true },
  };
}

function aujourdhuiParis(): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default async function BonPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ retour?: string; annule?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  const langue = await langueVisiteur();
  const b = BONS[langue];

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("restaurant_bons_cadeaux")
    .select("*")
    .eq("paiement_token", token)
    .maybeSingle();
  const bon = data as Bon | null;
  if (!bon) notFound();

  const [{ data: maisonData }, { data: connexion }] = await Promise.all([
    supabase
      .from("restaurants")
      .select("nom, adresse, slug_reservation")
      .eq("id", bon.restaurant_id)
      .maybeSingle(),
    supabase
      .from("restaurant_stripe_connexions")
      .select("stripe_account_id")
      .eq("restaurant_id", bon.restaurant_id)
      .maybeSingle(),
  ]);
  const maison = maisonData as {
    nom: string;
    adresse: string | null;
    slug_reservation: string | null;
  } | null;
  if (!maison) notFound();
  const compte =
    (connexion as { stripe_account_id: string } | null)?.stripe_account_id ??
    null;

  const somme = prixBon(bon.montant_centimes, langue);

  if (bon.statut === "attente") {
    // Retour depuis Stripe : l'état se relit chez eux, jamais dans l'URL.
    if (query.retour && compte && bon.stripe_session_id) {
      const resultat = await paiementAbouti(
        compte,
        bon.stripe_session_id,
        token,
      );
      if (resultat.paye) {
        await validerBon(supabase, token, resultat.paymentIntentId);
        redirect(`/bon/${token}`);
      }
    }

    let lien: string | null = null;
    if (compte && !query.retour) {
      try {
        const paiement = await creerPaiementBon({
          compteStripe: compte,
          bon,
          intitule: `${b.bonCadeau} — ${maison.nom}`,
        });
        lien = paiement.url;
        await supabase
          .from("restaurant_bons_cadeaux")
          .update({ stripe_session_id: paiement.sessionId })
          .eq("id", bon.id);
      } catch (cause) {
        console.error("[bon/stripe]", cause);
      }
    }

    return (
      <Cadre signature={b.signature}>
        <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-8 shadow-sm">
          <span className="text-sm text-zinc-500">{maison.nom}</span>
          <h1 className="font-serif text-3xl text-ink">{b.attenteTitre}</h1>
          <p className="text-base text-zinc-600">
            {b.attenteTexte(somme, maison.nom)}
          </p>
          {query.annule && (
            <p className="text-sm text-zinc-500">{b.interrompu}</p>
          )}
          {query.retour ? (
            <p className="text-sm text-zinc-600">{b.verification}</p>
          ) : lien ? (
            <a
              href={lien}
              className="rounded-lg bg-brand-navy px-5 py-3.5 text-center text-base font-semibold text-white transition-colors hover:bg-brand-navy-hover"
            >
              {b.payer(somme)}
            </a>
          ) : (
            <p className="text-sm text-red-600">{b.erreurPaiement}</p>
          )}
        </div>
      </Cadre>
    );
  }

  const etat = etatDuBon(bon, aujourdhuiParis());
  const jusqua = bon.expire_le ? dateLongue(bon.expire_le, langue) : null;
  const avertissement =
    etat === "epuise"
      ? b.epuise
      : etat === "expire" && jusqua
        ? b.expire(jusqua)
        : etat === "annule"
          ? b.annule
          : bon.solde_centimes < bon.montant_centimes
            ? b.soldeRestant(prixBon(bon.solde_centimes, langue))
            : null;

  return (
    <Cadre signature={b.signature}>
      <article className="relative flex flex-col gap-6 overflow-hidden rounded-3xl border border-zinc-200/70 bg-white p-8 shadow-sm print:border-zinc-400 print:shadow-none sm:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-orange/15 blur-2xl print:hidden"
        />
        <div className="relative flex flex-col gap-1">
          <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-brand-orange-dark">
            {b.bonCadeau}
          </span>
          <h1 className="font-serif text-4xl leading-tight text-ink">
            {maison.nom}
          </h1>
          {maison.adresse && (
            <p className="text-sm text-zinc-500">{maison.adresse}</p>
          )}
        </div>

        <div className="relative flex flex-wrap items-end justify-between gap-4 border-y border-dashed border-zinc-300 py-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.12em] text-zinc-500">
              {b.valeur}
            </span>
            <span className="font-serif text-5xl leading-none text-ink">
              {somme}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs uppercase tracking-[0.12em] text-zinc-500">
              {b.code}
            </span>
            <span className="font-mono text-2xl font-bold tracking-[0.18em] text-brand-navy">
              {bon.code}
            </span>
          </div>
        </div>

        <div className="relative flex flex-col gap-2 text-base text-ink">
          {bon.beneficiaire_nom && (
            <p className="font-semibold">{b.pour(bon.beneficiaire_nom)}</p>
          )}
          {bon.origine === "vente" && (
            <p className="text-zinc-600">{b.dePart(bon.acheteur_nom)}</p>
          )}
          {bon.message && (
            <p className="whitespace-pre-line italic text-zinc-700">
              « {bon.message} »
            </p>
          )}
        </div>

        {avertissement && (
          <p
            className={`relative rounded-xl px-4 py-3 text-sm ${
              etat === "valide"
                ? "bg-zinc-50 text-zinc-700"
                : "bg-brand-orange-soft text-ink"
            }`}
          >
            {avertissement}
          </p>
        )}

        <div className="relative flex flex-col gap-1 text-sm text-zinc-600">
          {jusqua && etat !== "expire" && <p>{b.valableJusquau(jusqua)}</p>}
          <p>{b.commentUtiliser(maison.nom)}</p>
        </div>
      </article>

      {etat === "valide" && (
        <div className="flex flex-wrap gap-3 print:hidden">
          <BoutonImprimer libelle={b.imprimer} />
          {maison.slug_reservation && (
            <Link
              href={`/reserver/${maison.slug_reservation}`}
              className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
            >
              {b.reserver}
            </Link>
          )}
        </div>
      )}
    </Cadre>
  );
}

function Cadre({
  children,
  signature,
}: {
  children: React.ReactNode;
  signature: string;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-brand-cream px-6 py-16 print:bg-white print:py-0">
      <div className="flex w-full max-w-lg flex-col gap-5">{children}</div>
      <div className="print:hidden">
        <SignatureKlarr texte={signature} />
      </div>
    </div>
  );
}
