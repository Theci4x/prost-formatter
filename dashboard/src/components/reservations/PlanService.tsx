import type { ClesService } from "@/lib/i18n/service";
import {
  cadreDuPlan,
  occupationDuPlan,
  type ReservationPlacable,
} from "@/lib/reservations/plan";
import type { Repere, TableSalle } from "@/types/plan";
import {
  bordureForme,
  classesForme,
  classesRepere,
} from "@/components/reservations/FormeSalle";
import { LIBELLES_REPERE } from "@/types/plan";

/**
 * Le plan pendant le service : chaque table porte le nom de qui l'occupe.
 * Lecture seule — on place depuis la liste, où il y a la place d'afficher
 * pourquoi un placement coince.
 */
export function PlanService({
  tables,
  espaceId,
  reservations,
  reperes = [],
  sv,
}: {
  tables: TableSalle[];
  espaceId: string;
  reservations: ReservationPlacable[];
  reperes?: Repere[];
  sv: ClesService;
}) {
  const occupation = occupationDuPlan({ tables, espaceId, reservations });
  if (occupation.length === 0) return null;

  // Le plan est recadré sur ce qui est réellement dessiné : en plein
  // service, une salle de six tables ne doit pas occuper l'écran entier de
  // vide.
  const cadre = cadreDuPlan(
    occupation.map(({ table }) => table),
    reperes,
  );
  // Le plan garde ses proportions et se règle sur la largeur disponible.
  const echelle = 100 / cadre.largeur;

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-zinc-200 bg-white"
      style={{ aspectRatio: `${cadre.largeur} / ${cadre.hauteur}` }}
    >
      {reperes.map((repere) => (
        <div
          key={repere.id}
          title={repere.libelle ?? LIBELLES_REPERE[repere.type]}
          style={{
            left: `${(repere.x - cadre.x) * echelle}%`,
            top: `${((repere.y - cadre.y) / cadre.hauteur) * 100}%`,
            width: `${repere.largeur * echelle}%`,
            height: `${(repere.hauteur / cadre.hauteur) * 100}%`,
            transform: `rotate(${repere.rotation}deg)`,
          }}
          className={`absolute border ${classesRepere(repere.type)}`}
        />
      ))}

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
                ? sv.tableOccupee(
                    table.nom,
                    occupants.map((o) => o.client_nom).join(", "),
                    couverts,
                  )
                : sv.tableLibre(table.nom, table.places)
            }
            style={{
              left: `${(table.x - cadre.x) * echelle}%`,
              top: `${((table.y - cadre.y) / cadre.hauteur) * 100}%`,
              width: `${table.largeur * echelle}%`,
              height: `${(table.hauteur / cadre.hauteur) * 100}%`,
              transform: `rotate(${table.rotation}deg)`,
            }}
            className={`absolute flex flex-col items-center justify-center overflow-hidden px-0.5 text-center leading-tight ${classesForme(
              table.forme,
            )} ${bordureForme(table.forme)} ${couleur}`}
          >
            <span className="text-[10px] font-semibold sm:text-xs">
              {table.nom}
            </span>
            {prise ? (
              <span className="w-full truncate text-[9px] opacity-90 sm:text-[11px]">
                {alerte && "\u26a0 "}
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
