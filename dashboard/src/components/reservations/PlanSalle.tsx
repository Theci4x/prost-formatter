"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import {
  ajouterTable,
  deplacerTable,
  modifierTable,
  supprimerTable,
  type TableState,
} from "@/app/dashboard/[id]/reservations/plan/actions";
import {
  FORMES,
  GRILLE_COLONNES,
  GRILLE_LIGNES,
  TABLE_VIDE,
  type FormeTable,
  type TableSalle,
  type TableValeurs,
} from "@/types/plan";
import type { Espace } from "@/types/reservation";

const initialState: TableState = {
  error: null,
  rendu: 0,
  valeurs: TABLE_VIDE,
};

const champ =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy";
const label = "flex flex-col gap-1 text-sm font-medium text-zinc-700";

/**
 * La forme se lit à la silhouette : un rond, un carré, un rectangle couché.
 * Le chef de rang reconnaît sa salle sans lire les libellés.
 */
function silhouette(forme: FormeTable): string {
  if (forme === "ronde") return "m-auto aspect-square h-[calc(100%-6px)] rounded-full";
  if (forme === "carree") return "m-auto aspect-square h-[calc(100%-6px)] rounded-md";
  return "m-auto h-2/3 w-[calc(100%-6px)] rounded-md";
}

function Champs({
  restaurantId,
  espaceId,
  valeurs,
}: {
  restaurantId: string;
  espaceId: string;
  valeurs: TableValeurs;
}) {
  return (
    <>
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      <input type="hidden" name="espace_id" value={espaceId} />

      <label className={label} htmlFor={`table-nom-${espaceId}`}>
        Numéro
        <input
          id={`table-nom-${espaceId}`}
          name="nom"
          required
          defaultValue={valeurs.nom}
          placeholder="12"
          className={champ}
        />
      </label>
      <label className={label} htmlFor={`table-places-${espaceId}`}>
        Places
        <input
          id={`table-places-${espaceId}`}
          name="places"
          type="number"
          min={1}
          required
          defaultValue={valeurs.places}
          className={champ}
        />
      </label>
      <label className={label} htmlFor={`table-forme-${espaceId}`}>
        Forme
        <select
          id={`table-forme-${espaceId}`}
          name="forme"
          defaultValue={valeurs.forme}
          className={champ}
        >
          {FORMES.map((forme) => (
            <option key={forme.valeur} value={forme.valeur}>
              {forme.libelle}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

export function PlanSalle({
  restaurantId,
  espace,
  tables,
}: {
  restaurantId: string;
  espace: Espace;
  tables: TableSalle[];
}) {
  const [state, action, pending] = useActionState(ajouterTable, initialState);
  const [deplacees, setDeplacees] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [selection, setSelection] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const grille = useRef<HTMLDivElement>(null);
  const glisse = useRef<string | null>(null);

  const position = (table: TableSalle) =>
    deplacees[table.id] ?? { x: table.x, y: table.y };

  const placesPlan = tables.reduce((total, table) => total + table.places, 0);
  const selectionnee = tables.find((table) => table.id === selection) ?? null;

  function envoyerPosition(table: TableSalle, x: number, y: number) {
    if (x === position(table).x && y === position(table).y) return;
    // Déjà une table sur la case : on refuse tout de suite, sans aller-retour
    // serveur, pour que la table reparte visuellement à sa place.
    const occupee = tables.some(
      (autre) =>
        autre.id !== table.id &&
        position(autre).x === x &&
        position(autre).y === y,
    );
    if (occupee) {
      setMessage("Il y a déjà une table à cet endroit.");
      return;
    }

    setDeplacees((etat) => ({ ...etat, [table.id]: { x, y } }));
    setMessage(null);

    const donnees = new FormData();
    donnees.set("restaurant_id", restaurantId);
    donnees.set("espace_id", espace.id);
    donnees.set("table_id", table.id);
    donnees.set("x", String(x));
    donnees.set("y", String(y));
    startTransition(async () => {
      const reponse = await deplacerTable(donnees);
      if (reponse.error) {
        // Le serveur a refusé : on remet la table où elle était, sinon
        // l'écran montre un plan que la base ne connaît pas.
        setDeplacees((etat) => {
          const suite = { ...etat };
          delete suite[table.id];
          return suite;
        });
        setMessage(reponse.error);
      }
    });
  }

  function caseSousLePointeur(
    event: React.PointerEvent,
  ): { x: number; y: number } | null {
    const cadre = grille.current?.getBoundingClientRect();
    if (!cadre) return null;
    const x = Math.floor(
      ((event.clientX - cadre.left) / cadre.width) * GRILLE_COLONNES,
    );
    const y = Math.floor(
      ((event.clientY - cadre.top) / cadre.height) * GRILLE_LIGNES,
    );
    if (x < 0 || y < 0 || x >= GRILLE_COLONNES || y >= GRILLE_LIGNES) {
      return null;
    }
    return { x, y };
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-zinc-900">{espace.nom}</h2>
        <span className="text-sm tabular-nums text-zinc-500">
          {tables.length} tables · {placesPlan} places dessinées sur{" "}
          {espace.capacite} couverts déclarés
        </span>
      </div>

      {placesPlan > espace.capacite && (
        <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Le plan compte {placesPlan - espace.capacite} places de plus que la
          capacité déclarée de cette salle. Klarr continue de s&apos;arrêter à{" "}
          {espace.capacite} couverts pour accepter les réservations : corrige
          la capacité dans la configuration si le plan a raison.
        </p>
      )}

      <p className="text-sm text-zinc-500">
        Glisse une table pour la déplacer, ou sélectionne-la et utilise les
        flèches du clavier. Le plan sert à placer tes clients : il ne change
        rien à ce que Klarr accepte, qui se compte toujours en couverts.
      </p>

      <div
        ref={grille}
        className="grid w-full max-w-3xl touch-none select-none overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50"
        style={{
          gridTemplateColumns: `repeat(${GRILLE_COLONNES}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${GRILLE_LIGNES}, minmax(0, 1fr))`,
          aspectRatio: `${GRILLE_COLONNES} / ${GRILLE_LIGNES}`,
          // Les repères de la grille sont peints en fond : des cases vides
          // en éléments réels décaleraient les tables posées à une position
          // précise.
          backgroundImage:
            "repeating-linear-gradient(to right, rgb(228 228 231) 0 1px, transparent 1px calc(100% / " +
            GRILLE_COLONNES +
            ")), repeating-linear-gradient(to bottom, rgb(228 228 231) 0 1px, transparent 1px calc(100% / " +
            GRILLE_LIGNES +
            "))",
        }}
      >
        {tables.map((table) => {
          const { x, y } = position(table);
          const active = selection === table.id;
          return (
            <button
              key={table.id}
              type="button"
              aria-label={`Table ${table.nom}, ${table.places} places`}
              onPointerDown={(event) => {
                glisse.current = table.id;
                setSelection(table.id);
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerUp={(event) => {
                if (glisse.current !== table.id) return;
                glisse.current = null;
                const cible = caseSousLePointeur(event);
                if (cible) envoyerPosition(table, cible.x, cible.y);
              }}
              onKeyDown={(event) => {
                const pas: Record<string, [number, number]> = {
                  ArrowLeft: [-1, 0],
                  ArrowRight: [1, 0],
                  ArrowUp: [0, -1],
                  ArrowDown: [0, 1],
                };
                const delta = pas[event.key];
                if (!delta) return;
                event.preventDefault();
                const cx = Math.min(
                  Math.max(x + delta[0], 0),
                  GRILLE_COLONNES - 1,
                );
                const cy = Math.min(
                  Math.max(y + delta[1], 0),
                  GRILLE_LIGNES - 1,
                );
                envoyerPosition(table, cx, cy);
              }}
              style={{ gridColumnStart: x + 1, gridRowStart: y + 1 }}
              className={`flex cursor-grab flex-col items-center justify-center border text-center leading-none transition-colors ${silhouette(
                table.forme,
              )} ${
                active
                  ? "border-brand-navy bg-brand-navy text-white"
                  : "border-zinc-300 bg-white text-zinc-700 hover:border-brand-navy"
              }`}
            >
              <span className="text-[11px] font-semibold sm:text-sm">
                {table.nom}
              </span>
              <span className="text-[9px] opacity-70 sm:text-[11px]">
                {table.places}p
              </span>
            </button>
          );
        })}
      </div>

      {message && <p className="text-sm text-red-600">{message}</p>}

      {selectionnee && (
        <ModifierTable
          key={selectionnee.id}
          restaurantId={restaurantId}
          espaceId={espace.id}
          table={selectionnee}
          onFini={() => setSelection(null)}
        />
      )}

      <form action={action} className="flex flex-wrap items-end gap-3">
        <Champs
          key={state.rendu}
          restaurantId={restaurantId}
          espaceId={espace.id}
          valeurs={state.valeurs}
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
        >
          {pending ? "Ajout…" : "Ajouter cette table"}
        </button>
        {state.error && (
          <p className="w-full text-sm text-red-600">{state.error}</p>
        )}
      </form>
    </section>
  );
}

function ModifierTable({
  restaurantId,
  espaceId,
  table,
  onFini,
}: {
  restaurantId: string;
  espaceId: string;
  table: TableSalle;
  onFini: () => void;
}) {
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-brand-navy/30 bg-brand-navy/5 p-4">
      <p className="text-sm font-medium text-zinc-900">
        Table {table.nom}{" "}
        <span className="font-normal text-zinc-500">
          — sélectionnée, les flèches la déplacent
        </span>
      </p>
      <form
        action={(donnees) => {
          donnees.set("restaurant_id", restaurantId);
          donnees.set("espace_id", espaceId);
          donnees.set("table_id", table.id);
          startTransition(async () => {
            const reponse = await modifierTable(donnees);
            setErreur(reponse.error);
            if (!reponse.error) onFini();
          });
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <label className={label} htmlFor={`edit-nom-${table.id}`}>
          Numéro
          <input
            id={`edit-nom-${table.id}`}
            name="nom"
            defaultValue={table.nom}
            className={champ}
          />
        </label>
        <label className={label} htmlFor={`edit-places-${table.id}`}>
          Places
          <input
            id={`edit-places-${table.id}`}
            name="places"
            type="number"
            min={1}
            defaultValue={table.places}
            className={champ}
          />
        </label>
        <label className={label} htmlFor={`edit-forme-${table.id}`}>
          Forme
          <select
            id={`edit-forme-${table.id}`}
            name="forme"
            defaultValue={table.forme}
            className={champ}
          >
            {FORMES.map((forme) => (
              <option key={forme.valeur} value={forme.valeur}>
                {forme.libelle}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={enCours}
          className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
        >
          Enregistrer
        </button>
      </form>

      {erreur && <p className="text-sm text-red-600">{erreur}</p>}

      <form action={supprimerTable}>
        <input type="hidden" name="restaurant_id" value={restaurantId} />
        <input type="hidden" name="table_id" value={table.id} />
        <button
          type="submit"
          className="text-sm text-red-600 underline-offset-2 hover:underline"
        >
          Supprimer la table {table.nom}
        </button>
      </form>
    </div>
  );
}
