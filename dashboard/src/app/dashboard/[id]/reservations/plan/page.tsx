import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { exiger } from "@/lib/equipe/roles";
import { PlanSalle } from "@/components/reservations/PlanSalle";
import { tablesDeLEspace } from "@/lib/reservations/plan";
import type { TableSalle } from "@/types/plan";
import type { Espace } from "@/types/reservation";
import type { Restaurant } from "@/types/restaurant";

export default async function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Dessiner la salle est de la configuration : le rôle « service » place
  // les clients sur l'écran de service, il ne redessine pas le plan.
  await exiger(id, "gerant");

  const supabase = await createClient();
  const [restaurantResult, espacesResult, tablesResult] = await Promise.all([
    supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("restaurant_espaces")
      .select("*")
      .eq("restaurant_id", id)
      .order("ordre"),
    supabase.from("restaurant_tables").select("*").eq("restaurant_id", id),
  ]);

  const restaurant = restaurantResult.data as Restaurant | null;
  if (!restaurant) notFound();

  const espaces = (espacesResult.data ?? []) as Espace[];
  const tables = (tablesResult.data ?? []) as TableSalle[];

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-1">
        <Link
          href={`/dashboard/${id}/reservations`}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← Réservations
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-900">Plan de salle</h1>
        <p className="max-w-2xl text-sm text-zinc-500">
          Dessine tes tables une fois, salle par salle. Pendant le service, tu
          assignes chaque réservation à une table depuis l&apos;écran du jour.
          Klarr continue d&apos;accepter ou de refuser les réservations en
          couverts : le plan sert à placer, pas à vendre.
        </p>
      </div>

      {espaces.length === 0 ? (
        <p className="rounded-2xl border border-zinc-200/70 bg-white p-5 text-sm text-zinc-500 shadow-sm">
          Crée d&apos;abord une salle dans{" "}
          <Link
            href={`/dashboard/${id}/reservations/configuration`}
            className="text-brand-navy underline-offset-2 hover:underline"
          >
            la configuration
          </Link>
          . Une table appartient toujours à une salle.
        </p>
      ) : (
        espaces.map((espace) => (
          <PlanSalle
            key={espace.id}
            restaurantId={id}
            espace={espace}
            tables={tablesDeLEspace(tables, espace.id)}
          />
        ))
      )}
    </div>
  );
}
