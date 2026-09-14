import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { exiger } from "@/lib/equipe/roles";
import { EditeurPlan } from "@/components/reservations/EditeurPlan";
import { sallesADessiner, tablesDeLEspace } from "@/lib/reservations/plan";
import { brouillonDe } from "@/lib/reservations/plan-edition";
import type { Repere, TableSalle } from "@/types/plan";
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
  const [restaurantResult, espacesResult, tablesResult, reperesResult] =
    await Promise.all([
    supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("restaurant_espaces")
      .select("*")
      .eq("restaurant_id", id)
      .order("ordre"),
    supabase.from("restaurant_tables").select("*").eq("restaurant_id", id),
    supabase.from("restaurant_reperes").select("*").eq("restaurant_id", id),
  ]);

  const restaurant = restaurantResult.data as Restaurant | null;
  if (!restaurant) notFound();

  const toutesLesSalles = (espacesResult.data ?? []) as Espace[];
  const tables = (tablesResult.data ?? []) as TableSalle[];
  const reperes = (reperesResult.data ?? []) as Repere[];
  // Une salle qui ne se loue qu'en entier n'a pas de plan : on n'y place
  // personne, le groupe prend tout.
  const espaces = sallesADessiner(toutesLesSalles);
  const privatisationSeule = toutesLesSalles.filter(
    (salle) => !salle.accepte_table,
  );

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
          Dessine ta salle comme elle est — ta salle du bas, ton premier
          étage, ta terrasse. Pose tes tables où tu veux, à la bonne taille,
          tournées comme il faut, et ajoute le bar, l&apos;entrée ou un
          poteau pour t&apos;y retrouver. Pendant le service, tu assignes
          chaque réservation à une table depuis l&apos;écran du jour. Klarr
          continue d&apos;accepter ou de refuser les réservations en
          couverts : le plan sert à placer, pas à vendre.
        </p>
      </div>

      {espaces.length === 0 ? (
        <p className="rounded-2xl border border-zinc-200/70 bg-white p-5 text-sm text-zinc-500 shadow-sm">
          {toutesLesSalles.length === 0 ? (
            <>
              Crée d&apos;abord une salle dans{" "}
              <Link
                href={`/dashboard/${id}/reservations/configuration`}
                className="text-brand-navy underline-offset-2 hover:underline"
              >
                la configuration
              </Link>
              . Une table appartient toujours à une salle.
            </>
          ) : (
            <>
              Aucune de tes salles ne prend de réservation individuelle :
              elles ne se louent qu&apos;en entier, et une salle privatisée
              n&apos;a pas besoin de plan — le groupe prend tout. Coche
              « réservations individuelles » sur une salle dans{" "}
              <Link
                href={`/dashboard/${id}/reservations/configuration`}
                className="text-brand-navy underline-offset-2 hover:underline"
              >
                la configuration
              </Link>{" "}
              pour lui dessiner un plan.
            </>
          )}
        </p>
      ) : (
        espaces.map((espace) => (
          <EditeurPlan
            key={espace.id}
            restaurantId={id}
            espace={espace}
            initial={brouillonDe(
              tablesDeLEspace(tables, espace.id),
              reperes.filter((repere) => repere.espace_id === espace.id),
            )}
          />
        ))
      )}

      {privatisationSeule.length > 0 && (
        <p className="text-sm text-zinc-500">
          Sans plan, parce qu&apos;{privatisationSeule.length > 1 ? "elles" : "elle"}{" "}
          ne se loue{privatisationSeule.length > 1 ? "nt" : ""} qu&apos;en
          entier :{" "}
          <span className="font-medium text-zinc-700">
            {privatisationSeule.map((salle) => salle.nom).join(", ")}
          </span>
          . Quand un groupe privatise, il n&apos;y a personne à placer.
        </p>
      )}
    </div>
  );
}
