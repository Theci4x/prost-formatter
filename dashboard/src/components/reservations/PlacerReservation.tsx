"use client";

import { useState, useTransition } from "react";
import { placerReservation } from "@/app/dashboard/[id]/reservations/plan/actions";
import type { TableSalle } from "@/types/plan";

/**
 * Asseoir un groupe. Les tables impossibles sont écartées en amont, mais le
 * serveur revérifie : deux chefs de rang peuvent placer au même instant.
 */
export function PlacerReservation({
  restaurantId,
  reservationId,
  tableActuelle,
  couverts,
  tables,
}: {
  restaurantId: string;
  reservationId: string;
  tableActuelle: TableSalle | null;
  couverts: number;
  tables: TableSalle[];
}) {
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();

  function changer(tableId: string) {
    const donnees = new FormData();
    donnees.set("restaurant_id", restaurantId);
    donnees.set("reservation_id", reservationId);
    donnees.set("table_id", tableId);
    startTransition(async () => {
      const reponse = await placerReservation(donnees);
      setErreur(reponse.error);
    });
  }

  const serre = tableActuelle && couverts > tableActuelle.places;

  return (
    <span className="flex flex-col items-end gap-1">
      <label className="flex items-center gap-2 text-sm">
        <span className="text-zinc-500">Table</span>
        <select
          aria-label="Table de cette réservation"
          value={tableActuelle?.id ?? ""}
          disabled={enCours}
          onChange={(event) => changer(event.target.value)}
          className="rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-brand-navy disabled:opacity-50"
        >
          <option value="">À placer</option>
          {/* La table occupée reste dans la liste, sans quoi le menu
              afficherait « À placer » sur un groupe déjà assis. */}
          {tableActuelle &&
            !tables.some((table) => table.id === tableActuelle.id) && (
              <option value={tableActuelle.id}>{tableActuelle.nom}</option>
            )}
          {tables.map((table) => (
            <option key={table.id} value={table.id}>
              {table.nom} · {table.places}p
            </option>
          ))}
        </select>
      </label>
      {serre && (
        <span className="text-xs text-amber-700">
          {couverts} convives sur une table de {tableActuelle.places}.
        </span>
      )}
      {erreur && <span className="text-xs text-red-600">{erreur}</span>}
    </span>
  );
}
