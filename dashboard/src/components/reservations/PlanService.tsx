import {
  cadrePlan,
  occupationDuPlan,
  type ReservationPlacable,
} from "@/lib/reservations/plan";
import { type FormeTable, type TableSalle } from "@/types/plan";

function silhouette(forme: FormeTable): string {
  if (forme === "ronde") return "m-auto aspect-square h-full rounded-full";
  if (forme === "carree") return "m-auto aspect-square h-full rounded-md";
  return "my-auto h-2/3 w-full rounded-md";
}

/**
 * Le plan pendant le service : chaque table porte le nom de qui l'occupe.
 * Lecture seule — on place depuis la liste, où il y a la place d'afficher
 * pourquoi un placement coince.
 */
export function PlanService({
  tables,
  espaceId,
  reservations,
}: {
  tables: TableSalle[];
  espaceId: string;
  reservations: ReservationPlacable[];
}) {
  const occupation = occupationDuPlan({ tables, espaceId, reservations });
  if (occupation.length === 0) return null;

  // Le plan est recadré sur les tables réellement dessinées : en plein
  // service, une salle de six tables ne doit pas occuper l'écran entier de
  // cases vides.
  const cadre = cadrePlan(occupation.map(({ table }) => table));

  return (
    <div
      className="grid w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50"
      style={{
        gridTemplateColumns: `repeat(${cadre.colonnes}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${cadre.lignes}, minmax(0, 1fr))`,
        aspectRatio: `${cadre.colonnes} / ${cadre.lignes}`,
        // Recadré, un plan de trois tables s'étirerait sur toute la largeur
        // de la carte : une case ne dépasse pas la taille d'une vignette.
        maxWidth: `${cadre.colonnes * 72}px`,
      }}
    >
      {occupation.map(({ table, occupants, couverts, doublon, surcharge }) => {
        const prise = occupants.length > 0;
        const alerte = doublon || surcharge;
        const couleur = doublon
          ? "border-red-400 bg-red-50 text-red-900"
          : surcharge
            ? "border-amber-400 bg-amber-50 text-amber-900"
            : prise
              ? "border-brand-navy bg-brand-navy text-white"
              : "border-zinc-300 bg-white text-zinc-500";

        return (
          <div
            key={table.id}
            title={
              prise
                ? `${table.nom} — ${occupants
                    .map((o) => o.client_nom)
                    .join(", ")} (${couverts} couverts)`
                : `${table.nom} — libre, ${table.places} places`
            }
            style={{
              gridColumnStart: table.x - cadre.x0 + 1,
              gridRowStart: table.y - cadre.y0 + 1,
            }}
            className={`flex flex-col items-center justify-center overflow-hidden border px-0.5 text-center leading-tight ${silhouette(
              table.forme,
            )} ${couleur}`}
          >
            <span className="text-[10px] font-semibold sm:text-xs">
              {table.nom}
            </span>
            {prise ? (
              <span className="w-full truncate text-[9px] opacity-90 sm:text-[11px]">
                {alerte && "⚠ "}
                {occupants[0].client_nom}
              </span>
            ) : (
              <span className="text-[9px] opacity-70 sm:text-[11px]">
                {table.places}p
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
