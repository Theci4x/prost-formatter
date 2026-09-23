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
import { exigerModule } from "@/lib/abonnement/acces";
import { Compteur } from "@/components/dashboard/Compteur";

export default async function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Dessiner la salle est de la configuration : le rôle « service » place
  // les clients sur l'écran de service, il ne redessine pas le plan.
  await exiger(id, "gerant");
  await exigerModule(id, "reservations");

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
  // Ce qui est dessiné, comparé à ce qui est déclaré : l'écart dit s'il
  // reste des tables à poser avant que le plan serve en plein service.
  const idsDessines = new Set(espaces.map((espace) => espace.id));
  const tablesDessinees = tables.filter((table) =>
    idsDessines.has(table.espace_id),
  );
  const places = tablesDessinees.reduce((t, table) => t + table.places, 0);
  const couvertsDeclares = espaces.reduce((t, e) => t + e.capacite, 0);

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-1">
        <Link
          href={`/dashboard/${id}/reservations`}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← Réservations
        </Link>
        <h1 className="font-serif text-4xl text-ink">Plan de salle</h1>
        <p className="max-w-4xl text-sm text-zinc-600">
          Dessine ta salle comme elle est — ta salle du bas, ton premier étage,
          ta terrasse. Pose tes tables où tu veux, à la bonne taille, tournées
          comme il faut, et ajoute le bar, l&apos;entrée ou un poteau pour
          t&apos;y retrouver. Pendant le service, tu assignes chaque réservation
          à une table depuis l&apos;écran du jour. Klarr continue
          d&apos;accepter ou de refuser les réservations en couverts : le plan
          sert à placer, pas à vendre.
        </p>
      </div>

      {espaces.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Compteur
            valeur={espaces.length}
            libelle={`salle${espaces.length > 1 ? "s" : ""} avec un plan`}
          />
          <Compteur
            valeur={tablesDessinees.length}
            libelle={`table${tablesDessinees.length > 1 ? "s" : ""} posée${tablesDessinees.length > 1 ? "s" : ""}`}
            accent={tablesDessinees.length === 0}
          />
          <Compteur
            valeur={places}
            libelle={`place${places > 1 ? "s" : ""} dessinée${places > 1 ? "s" : ""}`}
          />
          <Compteur
            valeur={couvertsDeclares}
            libelle="couverts déclarés dans la configuration"
          />
        </div>
      )}

      {/* Une salle par carte, parfois trois ou quatre : les raccourcis
          évitent de faire défiler un plan entier pour atteindre le suivant. */}
      {espaces.length > 1 && (
        <nav className="flex flex-wrap gap-2">
          {espaces.map((espace) => (
            <a
              key={espace.id}
              href={`#salle-${espace.id}`}
              className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-ink hover:text-ink"
            >
              {espace.nom}
            </a>
          ))}
        </nav>
      )}

      {espaces.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-sm text-zinc-600">
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
              Aucune de tes salles ne prend de réservation individuelle : elles
              ne se louent qu&apos;en entier, et une salle privatisée n&apos;a
              pas besoin de plan — le groupe prend tout. Coche « réservations
              individuelles » sur une salle dans{" "}
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
          Sans plan, parce qu&apos;
          {privatisationSeule.length > 1 ? "elles" : "elle"} ne se loue
          {privatisationSeule.length > 1 ? "nt" : ""} qu&apos;en entier :{" "}
          <span className="font-medium text-zinc-700">
            {privatisationSeule.map((salle) => salle.nom).join(", ")}
          </span>
          . Quand un groupe privatise, il n&apos;y a personne à placer.
        </p>
      )}
    </div>
  );
}
