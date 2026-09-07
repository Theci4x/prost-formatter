import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import type { Restaurant } from "@/types/restaurant";
import type { RestaurantSubscription } from "@/types/subscription";

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

  const { data: subscriptionData } = await supabase
    .from("restaurant_subscriptions")
    .select("*")
    .eq("restaurant_id", id)
    .maybeSingle();

  const subscription = subscriptionData as RestaurantSubscription | null;
  const isActive =
    subscription?.status === "active" || subscription?.status === "trialing";

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.abonnement}
        title={`Abonnement — ${restaurant.nom}`}
      />

      <div className="flex max-w-xl flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
        {subscription ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-900">
                  Statut :{" "}
                  <span className={isActive ? "text-green-600" : "text-orange-600"}>
                    {STATUS_LABELS[subscription.status] ?? subscription.status}
                  </span>
                </p>
                {subscription.current_period_end && (
                  <p className="text-sm text-zinc-500">
                    Prochain renouvellement :{" "}
                    {new Date(subscription.current_period_end).toLocaleDateString(
                      "fr-FR",
                    )}
                  </p>
                )}
              </div>
            </div>
            <a
              href={`/api/stripe/portal?restaurant_id=${id}`}
              className="w-fit rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-navy-hover hover:shadow"
            >
              Gérer mon abonnement
            </a>
          </>
        ) : (
          <>
            <p className="text-sm text-zinc-600">
              Aucun abonnement actif pour ce restaurant. Souscris pour
              débloquer l&apos;accès complet au tableau de bord Klarr
              (paiement par carte bancaire ou prélèvement SEPA).
            </p>
            <a
              href={`/api/stripe/checkout?restaurant_id=${id}`}
              className="w-fit rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-navy-hover hover:shadow"
            >
              S&apos;abonner
            </a>
          </>
        )}
      </div>
    </div>
  );
}
