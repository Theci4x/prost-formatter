import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { diagnostic, relireCompte } from "@/lib/stripe/connect";
import { deconnecterStripe } from "./actions";
import type { Restaurant } from "@/types/restaurant";
import type { StripeConnexion } from "@/types/stripe";
import { exiger } from "@/lib/equipe/roles";

const MOTIFS: Record<string, string> = {
  annule: "Connexion annulée : rien n'a été relié.",
  etat: "La connexion a expiré. Relance-la depuis cette page.",
  code: "Stripe n'a pas renvoyé d'autorisation. Réessaie.",
  acces: "Ce restaurant n'est pas le tien.",
  echange: "Stripe a refusé la connexion. Réessaie dans un instant.",
  configuration:
    "Klarr n'est pas encore configuré pour Stripe Connect. Ce n'est pas de ton fait — préviens-nous.",
};

export default async function PaiementsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ stripe_error?: string; stripe_connecte?: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");
  const query = await searchParams;
  const supabase = await createClient();

  const [restaurantResult, connexionResult] = await Promise.all([
    supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("restaurant_stripe_connexions")
      .select("*")
      .eq("restaurant_id", id)
      .maybeSingle(),
  ]);

  const restaurant = restaurantResult.data as Restaurant | null;
  if (!restaurant) notFound();

  const connexion = connexionResult.data as StripeConnexion | null;

  // L'état est relu chez Stripe : un dossier complété depuis la connexion
  // doit s'afficher comme tel sans que le restaurateur ait à se reconnecter.
  const frais = connexion ? await relireCompte(connexion.stripe_account_id) : null;
  const etat = frais ?? (connexion
    ? {
        paiementsActifs: connexion.paiements_actifs,
        dossierComplet: connexion.dossier_complet,
      }
    : null);
  const aFaire = etat ? diagnostic(etat) : null;

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.abonnement}
        title={`Paiements — ${restaurant.nom}`}
      />

      {query.stripe_connecte && (
        <p className="max-w-2xl rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Ton compte Stripe est relié.
        </p>
      )}
      {query.stripe_error && (
        <p className="max-w-2xl rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {MOTIFS[query.stripe_error] ?? "La connexion a échoué."}
        </p>
      )}

      <div className="flex max-w-2xl flex-col gap-2">
        <p className="text-sm text-zinc-600">
          Relie <span className="font-medium">ton</span> compte Stripe pour
          demander un acompte sur une privatisation, prendre une empreinte de
          carte en garantie, ou faire payer une expérience à l&apos;avance.
        </p>
        <p className="text-sm text-zinc-500">
          L&apos;argent va directement chez toi : Klarr ne le touche jamais et
          ne prélève aucune commission. Tes virements, tes remboursements et
          tes litiges restent dans ton tableau de bord Stripe, comme
          aujourd&apos;hui.
        </p>
      </div>

      {connexion ? (
        <div className="flex max-w-2xl flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="flex flex-col">
              <span className="font-medium text-zinc-900">
                {connexion.nom_affiche ?? "Compte Stripe relié"}
              </span>
              <span className="font-mono text-xs text-zinc-400">
                {connexion.stripe_account_id}
              </span>
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                etat?.paiementsActifs
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-brand-orange-soft text-brand-navy"
              }`}
            >
              {etat?.paiementsActifs ? "Prêt à encaisser" : "En attente"}
            </span>
          </div>

          {aFaire && <p className="text-sm text-zinc-600">{aFaire}</p>}

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
            >
              Ouvrir mon tableau de bord Stripe
            </a>
            <form action={deconnecterStripe}>
              <input type="hidden" name="restaurant_id" value={id} />
              <button
                type="submit"
                className="text-sm font-medium text-zinc-500 hover:text-red-600"
              >
                Retirer la connexion
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex max-w-2xl flex-col items-start gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">
            Tu peux relier un compte Stripe existant, ou en créer un pendant la
            connexion si tu n&apos;en as pas encore.
          </p>
          <a
            href={`/api/stripe/connect/authorize?restaurant_id=${id}`}
            className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
          >
            Connecter mon compte Stripe
          </a>
        </div>
      )}

      <Link
        href={`/dashboard/${id}/connexions`}
        className="text-sm text-zinc-500 hover:text-zinc-900"
      >
        ← Toutes mes connexions
      </Link>
    </div>
  );
}
