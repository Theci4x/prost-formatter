import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { Compteur, TitreSection } from "@/components/dashboard/Compteur";
import { diagnostic, relireCompte } from "@/lib/stripe/connect";
import { deconnecterStripe } from "./actions";
import type { Restaurant } from "@/types/restaurant";
import type { StripeConnexion } from "@/types/stripe";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";

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
  await exigerModule(id, "reservations");
  const query = await searchParams;
  const supabase = await createClient();

  const [restaurantResult, connexionResult, garantiesResult] =
    await Promise.all([
      supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("restaurant_stripe_connexions")
        .select("*")
        .eq("restaurant_id", id)
        .maybeSingle(),
      // Ce que les garanties ont rapporté et ce qui attend : trois
      // chiffres qui disent à quoi sert cet écran, avant de parler de
      // Stripe.
      supabase
        .from("restaurant_reservations")
        .select(
          "acompte_centimes, acompte_statut, caution_statut, date_reservation",
        )
        .eq("restaurant_id", id)
        .or("acompte_statut.neq.non_requis,caution_statut.neq.non_requise"),
    ]);

  const restaurant = restaurantResult.data as Restaurant | null;
  if (!restaurant) notFound();

  const connexion = connexionResult.data as StripeConnexion | null;

  // L'état est relu chez Stripe : un dossier complété depuis la connexion
  // doit s'afficher comme tel sans que le restaurateur ait à se reconnecter.
  const frais = connexion
    ? await relireCompte(connexion.stripe_account_id)
    : null;
  const etat =
    frais ??
    (connexion
      ? {
          paiementsActifs: connexion.paiements_actifs,
          dossierComplet: connexion.dossier_complet,
        }
      : null);
  const aFaire = etat ? diagnostic(etat) : null;

  const garanties = (garantiesResult.data ?? []) as {
    acompte_centimes: number | null;
    acompte_statut: string;
    caution_statut: string;
    date_reservation: string;
  }[];
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const encaisse = garanties
    .filter((g) => g.acompte_statut === "paye")
    .reduce((somme, g) => somme + (g.acompte_centimes ?? 0), 0);
  const empreintes = garanties.filter(
    (g) =>
      g.caution_statut === "enregistree" && g.date_reservation >= aujourdhui,
  ).length;
  const enAttente = garanties.filter(
    (g) =>
      (g.acompte_statut === "attendu" || g.caution_statut === "attendue") &&
      g.date_reservation >= aujourdhui,
  ).length;
  const euros = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: encaisse % 100 === 0 ? 0 : 2,
  });
  const pret = Boolean(etat?.paiementsActifs);

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-3">
        <PageHeader
          icon={dashboardIcons.abonnement}
          title={`Paiements — ${restaurant.nom}`}
        />
        <p className="max-w-4xl text-sm text-zinc-600">
          Relie <span className="font-medium">ton</span> compte Stripe pour
          demander un acompte sur une privatisation, prendre une empreinte de
          carte en garantie, ou faire payer une expérience à l&apos;avance.
          L&apos;argent va directement chez toi : Klarr ne le touche jamais et
          ne prélève aucune commission.
        </p>
      </div>

      {query.stripe_connecte && (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          Ton compte Stripe est relié.
        </p>
      )}
      {query.stripe_error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {MOTIFS[query.stripe_error] ?? "La connexion a échoué."}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Compteur
          valeur={!connexion ? "—" : pret ? "Prêt" : "À finir"}
          libelle={
            !connexion
              ? "compte Stripe à relier"
              : pret
                ? "compte Stripe, prêt à encaisser"
                : "dossier Stripe à terminer"
          }
          accent={!pret}
        />
        <Compteur
          valeur={euros.format(encaisse / 100)}
          libelle="d'acomptes encaissés"
        />
        <Compteur
          valeur={String(empreintes)}
          libelle={`empreinte${empreintes > 1 ? "s" : ""} de carte en cours`}
        />
        {/* Les paiements attendus se suivent dans le carnet, réservation
            par réservation : la tuile y mène. */}
        <Link
          href={`/dashboard/${id}/reservations#garanties`}
          className="block [&>div]:h-full"
        >
          <Compteur
            valeur={String(enAttente)}
            libelle={`paiement${enAttente > 1 ? "s" : ""} en attente du client`}
            accent={enAttente > 0}
          />
        </Link>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* Le compte : relié ou non, prêt ou non. C'est la seule chose à
            régler ici ; le reste se passe chez Stripe. */}
        <section className="flex flex-col gap-4">
          <TitreSection>Ton compte Stripe</TitreSection>
          {connexion ? (
            <div
              className={`flex flex-col gap-5 rounded-2xl border p-6 shadow-sm ${
                pret
                  ? "border-emerald-200 bg-emerald-50/60"
                  : "border-brand-orange/50 bg-brand-orange-soft"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={`h-3 w-3 rounded-full ${
                      pret ? "bg-emerald-500" : "bg-brand-orange"
                    }`}
                  />
                  <span className="font-serif text-3xl text-ink">
                    {pret ? "Prêt à encaisser" : "Pas encore prêt"}
                  </span>
                </div>
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-zinc-600">
                  Stripe
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-ink">
                  {connexion.nom_affiche ?? "Compte Stripe relié"}
                </span>
                <span className="font-mono text-xs text-zinc-500">
                  {connexion.stripe_account_id}
                </span>
              </div>
              {aFaire && (
                <p className="rounded-xl bg-white/70 px-4 py-3 text-sm leading-relaxed text-ink">
                  {aFaire}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="https://dashboard.stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
                >
                  Ouvrir mon tableau de bord Stripe ↗
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
              <p className="text-xs leading-relaxed text-zinc-500">
                Tes virements, tes remboursements et tes litiges restent dans
                ton tableau de bord Stripe, comme aujourd&apos;hui.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-5 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-3 w-3 rounded-full bg-zinc-300"
                />
                <span className="font-serif text-3xl text-ink">
                  Aucun compte relié
                </span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-600">
                Tu peux relier un compte Stripe existant, ou en créer un pendant
                la connexion si tu n&apos;en as pas encore. Stripe demandera une
                pièce d&apos;identité et ton RIB.
              </p>
              <a
                href={`/api/stripe/connect/authorize?restaurant_id=${id}`}
                className="rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
              >
                Connecter mon compte Stripe
              </a>
            </div>
          )}
        </section>

        {/* Ce que le compte permet, et où ça se règle : sans ça, relier
            Stripe reste une case cochée qui ne sert à rien. */}
        <section className="flex flex-col gap-4">
          <TitreSection>Ce que tu peux encaisser</TitreSection>
          <ul className="grid gap-3 md:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
            {USAGES.map((usage) => (
              <li
                key={usage.titre}
                className="flex flex-col gap-2 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
              >
                <span className="text-base font-semibold text-ink">
                  {usage.titre}
                </span>
                <span className="text-sm leading-relaxed text-zinc-600">
                  {usage.texte}
                </span>
                <Link
                  href={`/dashboard/${id}/${usage.ou}`}
                  className="mt-auto w-fit pt-1 text-sm font-semibold text-brand-orange-dark hover:underline"
                >
                  {usage.lien} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Link
        href={`/dashboard/${id}/connexions`}
        className="w-fit text-sm font-semibold text-brand-orange-dark hover:underline"
      >
        ← Toutes mes connexions
      </Link>
    </div>
  );
}

const USAGES = [
  {
    titre: "Un acompte sur une privatisation",
    texte:
      "Le client verse une somme à la réservation : la salle ne se bloque pas pour rien.",
    lien: "Régler les espaces",
    ou: "reservations/configuration",
  },
  {
    titre: "Une empreinte de carte",
    texte:
      "Rien n'est débité. En cas de table vide sans prévenir, tu prélèves le montant annoncé.",
    lien: "Régler les garanties",
    ou: "reservations/configuration",
  },
  {
    titre: "Une expérience payée d'avance",
    texte:
      "Dégustation, atelier, soirée à thème : la place est payée en réservant.",
    lien: "Voir les expériences",
    ou: "experiences",
  },
];
