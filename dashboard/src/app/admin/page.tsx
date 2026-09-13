import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";

export const metadata: Metadata = {
  title: "Administration — Klarr",
  robots: { index: false, follow: false },
};

type Prospect = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  entreprise: string;
  ville: string | null;
  created_at: string;
};

type Audit = {
  id: string;
  restaurant_name: string;
  ville: string;
  global_score: number | null;
  created_at: string;
};

type RestaurantRow = {
  id: string;
  nom: string;
  adresse: string | null;
  created_at: string;
};

type SubscriptionRow = {
  restaurant_id: string;
  status: string;
  current_period_end: string | null;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
      <span className="text-2xl font-semibold text-brand-navy">{value}</span>
      <span className="text-sm text-zinc-500">{label}</span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
      <div className="overflow-x-auto rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
        {children}
      </div>
    </section>
  );
}

export default async function AdminPage() {
  const email = await requireAdmin();

  // Le contrôle d'accès ci-dessus est la seule barrière : ce client
  // contourne toutes les règles de sécurité de la base.
  const supabase = createServiceClient();

  const [prospects, audits, restaurants, subscriptions, users] =
    await Promise.all([
      supabase
        .from("prospects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("visibility_audits")
        .select("id, restaurant_name, ville, global_score, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("restaurants")
        .select("id, nom, adresse, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("restaurant_subscriptions")
        .select("restaurant_id, status, current_period_end"),
      supabase.auth.admin.listUsers({ page: 1, perPage: 1 }),
    ]);

  const prospectRows = (prospects.data ?? []) as Prospect[];
  const auditRows = (audits.data ?? []) as Audit[];
  const restaurantRows = (restaurants.data ?? []) as RestaurantRow[];
  const subscriptionRows = (subscriptions.data ?? []) as SubscriptionRow[];

  // listUsers ne renvoie "total" que sur la variante paginée de sa réponse.
  const totalUsers =
    users.data && "total" in users.data ? users.data.total : "—";

  const activeSubscriptions = subscriptionRows.filter(
    (s) => s.status === "active" || s.status === "trialing",
  ).length;

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F0]">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200/70 bg-white/90 px-6 py-4 shadow-sm backdrop-blur">
        <Link href="/dashboard" className="flex items-center gap-2">
          <KlarrMark size={22} />
          <KlarrWordmark className="text-lg text-zinc-900" />
          <span className="ml-2 rounded-full bg-brand-orange-soft px-2.5 py-0.5 text-xs font-semibold text-brand-navy">
            admin
          </span>
        </Link>
        <span className="text-sm text-zinc-500">{email}</span>
      </header>

      <main className="flex flex-1 flex-col gap-8 px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Stat label="Prospects" value={prospectRows.length} />
          <Stat label="Audits lancés" value={auditRows.length} />
          <Stat label="Comptes créés" value={totalUsers} />
          <Stat label="Restaurants" value={restaurantRows.length} />
          <Stat label="Abonnements actifs" value={activeSubscriptions} />
        </div>

        <Section title="Prospects (test de présence Google)">
          {prospectRows.length === 0 ? (
            <p className="p-5 text-sm text-zinc-500">
              Aucun prospect pour le moment.
            </p>
          ) : (
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-5 py-3 font-semibold">Nom</th>
                  <th className="px-5 py-3 font-semibold">Établissement</th>
                  <th className="px-5 py-3 font-semibold">Contact</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="[&_td]:px-5 [&_td]:py-3 [&_tr]:border-b [&_tr]:border-zinc-100 [&_tr:last-child]:border-0">
                {prospectRows.map((prospect) => (
                  <tr key={prospect.id}>
                    <td className="font-medium text-zinc-900">
                      {prospect.prenom} {prospect.nom}
                    </td>
                    <td className="text-zinc-600">
                      {prospect.entreprise}
                      {prospect.ville ? ` — ${prospect.ville}` : ""}
                    </td>
                    <td className="text-zinc-600">
                      <a
                        href={`mailto:${prospect.email}`}
                        className="text-brand-orange hover:underline"
                      >
                        {prospect.email}
                      </a>
                      <br />
                      {prospect.telephone}
                    </td>
                    <td className="whitespace-nowrap text-zinc-500">
                      {formatDate(prospect.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        <Section title="Derniers audits">
          {auditRows.length === 0 ? (
            <p className="p-5 text-sm text-zinc-500">Aucun audit.</p>
          ) : (
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-5 py-3 font-semibold">Établissement</th>
                  <th className="px-5 py-3 font-semibold">Ville</th>
                  <th className="px-5 py-3 font-semibold">Score</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="[&_td]:px-5 [&_td]:py-3 [&_tr]:border-b [&_tr]:border-zinc-100 [&_tr:last-child]:border-0">
                {auditRows.map((audit) => (
                  <tr key={audit.id}>
                    <td className="font-medium text-zinc-900">
                      {audit.restaurant_name}
                    </td>
                    <td className="text-zinc-600">{audit.ville}</td>
                    <td className="text-zinc-600">
                      {audit.global_score ?? "—"}
                    </td>
                    <td className="whitespace-nowrap text-zinc-500">
                      {formatDate(audit.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        <Section title="Restaurants inscrits">
          {restaurantRows.length === 0 ? (
            <p className="p-5 text-sm text-zinc-500">Aucun restaurant.</p>
          ) : (
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-5 py-3 font-semibold">Nom</th>
                  <th className="px-5 py-3 font-semibold">Adresse</th>
                  <th className="px-5 py-3 font-semibold">Abonnement</th>
                  <th className="px-5 py-3 font-semibold">Créé le</th>
                </tr>
              </thead>
              <tbody className="[&_td]:px-5 [&_td]:py-3 [&_tr]:border-b [&_tr]:border-zinc-100 [&_tr:last-child]:border-0">
                {restaurantRows.map((restaurant) => {
                  const subscription = subscriptionRows.find(
                    (s) => s.restaurant_id === restaurant.id,
                  );
                  return (
                    <tr key={restaurant.id}>
                      <td className="font-medium text-zinc-900">
                        {restaurant.nom}
                      </td>
                      <td className="text-zinc-600">
                        {restaurant.adresse ?? "—"}
                      </td>
                      <td>
                        {subscription ? (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              subscription.status === "active" ||
                              subscription.status === "trialing"
                                ? "bg-green-50 text-green-700"
                                : "bg-orange-50 text-orange-700"
                            }`}
                          >
                            {subscription.status}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400">aucun</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap text-zinc-500">
                        {formatDate(restaurant.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Section>
      </main>
    </div>
  );
}
