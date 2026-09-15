import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import type { Restaurant } from "@/types/restaurant";
import type { RestaurantSubscription } from "@/types/subscription";
import { exiger } from "@/lib/equipe/roles";
import { chargerAcces } from "@/lib/abonnement/acces";
import {
  LIBELLE_MODULE,
  MODULES,
  PRIX_MODULE,
  RESUME_MODULE,
  abonnementOuvrant,
  type Module,
} from "@/lib/abonnement/modules";

const STATUS_LABELS: Record<string, string> = {
  active: "Actif",
  trialing: "Période d'essai",
  past_due: "Paiement en retard",
  canceled: "Résilié",
  incomplete: "Paiement incomplet",
  incomplete_expired: "Paiement expiré",
  unpaid: "Impayé",
};

export default async function AbonnementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exiger(id, "proprietaire");

  const supabase = await createClient();

  const { data: restaurantData } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const restaurant = restaurantData as Restaurant | null;
  if (!restaurant) {
    notFound();
  }

  const { data: subscriptionsData } = await supabase
    .from("restaurant_subscriptions")
    .select("*")
    .eq("restaurant_id", id);

  const abonnements = new Map(
    ((subscriptionsData ?? []) as (RestaurantSubscription & {
      module?: string;
    })[]).map((abonnement) => [
      (abonnement.module ?? "visibilite") as Module,
      abonnement,
    ]),
  );
  const acces = await chargerAcces(id, supabase);

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.abonnement}
        title={`Abonnement — ${restaurant.nom}`}
      />

      {acces.enEssai && acces.joursRestants !== null && (
        <p className="max-w-2xl rounded-2xl border border-brand-orange/30 bg-brand-orange-soft px-5 py-4 text-sm text-brand-navy">
          <span className="font-medium">
            Essai gratuit — {acces.joursRestants} jour
            {acces.joursRestants > 1 ? "s" : ""} restant
            {acces.joursRestants > 1 ? "s" : ""}.
          </span>{" "}
          Tout est ouvert jusque-là. Ensuite, chaque module se paie
          séparément, et ta page de réservation comme ton site vitrine
          restent en ligne tant que le module correspondant l&apos;est.
        </p>
      )}

      <div className="grid max-w-4xl gap-4 sm:grid-cols-2">
        {MODULES.map((cle) => {
          const abonnement = abonnements.get(cle);
          const paye = abonnement
            ? abonnementOuvrant(abonnement.status)
            : false;
          const ouvert = acces.ouvert[cle];

          return (
            <div
              key={cle}
              className={`flex flex-col gap-3 rounded-2xl border p-6 shadow-sm ${
                paye
                  ? "border-emerald-200/70 bg-white"
                  : "border-zinc-200/70 bg-white"
              }`}
            >
              <div className="flex flex-col gap-1">
                <span className="text-base font-semibold text-zinc-900">
                  {LIBELLE_MODULE[cle]}
                </span>
                <span className="text-sm font-medium text-brand-navy">
                  {PRIX_MODULE[cle]}
                </span>
                <span className="text-sm leading-relaxed text-zinc-500">
                  {RESUME_MODULE[cle]}
                </span>
              </div>

              {abonnement ? (
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-zinc-900">
                    Statut :{" "}
                    <span
                      className={paye ? "text-emerald-700" : "text-orange-600"}
                    >
                      {STATUS_LABELS[abonnement.status] ?? abonnement.status}
                    </span>
                  </p>
                  {abonnement.current_period_end && (
                    <p className="text-sm text-zinc-500">
                      Prochain renouvellement :{" "}
                      {new Date(
                        abonnement.current_period_end,
                      ).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  {ouvert
                    ? "Ouvert pendant l'essai. Souscris pour le garder."
                    : "Ce module est fermé."}
                </p>
              )}

              <a
                href={
                  abonnement
                    ? `/api/stripe/portal?restaurant_id=${id}`
                    : `/api/stripe/checkout?restaurant_id=${id}&module=${cle}`
                }
                className={`mt-auto w-fit rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-colors ${
                  paye
                    ? "border border-zinc-300 text-zinc-700 hover:border-brand-navy hover:text-brand-navy"
                    : "bg-brand-navy text-white hover:bg-brand-navy-hover"
                }`}
              >
                {abonnement ? "Gérer" : "S'abonner"}
              </a>
            </div>
          );
        })}
      </div>

      <p className="max-w-2xl text-sm text-zinc-500">
        Les deux modules s&apos;achètent séparément : tu peux prendre la
        visibilité sans les réservations, ou l&apos;inverse. Un abonnement
        vaut pour cet établissement — un second restaurant a son propre
        carnet, sa propre fiche Google et sa propre clientèle, donc ses
        propres abonnements. Aucune commission par couvert, jamais.
      </p>

    </div>
  );
}
