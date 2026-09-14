"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { enregistrerPlan } from "@/app/dashboard/[id]/reservations/plan/actions";
import {
  aimanter,
  contraindre,
  rotationSuivante,
  tablesQuiSeChevauchent,
  prochainePlaceLibre,
} from "@/lib/reservations/plan";
import {
  prochainNumero,
  type Brouillon,
  type RepereBrouillon,
  type TableBrouillon,
} from "@/lib/reservations/plan-edition";
import {
  LIBELLES_REPERE,
  MODELES,
  MODELES_REPERE,
  PLAN_HAUTEUR,
  PLAN_LARGEUR,
  type ModeleTable,
  type TypeRepere,
} from "@/types/plan";
import type { Espace } from "@/types/reservation";
import {
  bordureForme,
  classesForme,
  classesRepere,
} from "@/components/reservations/FormeSalle";

type Selection = { genre: "table" | "repere"; id: string } | null;

const ZOOMS = [0.4, 0.55, 0.7, 0.85, 1, 1.25];

function copie(brouillon: Brouillon): Brouillon {
  return {
    tables: brouillon.tables.map((table) => ({ ...table })),
    reperes: brouillon.reperes.map((repere) => ({ ...repere })),
  };
}

const outil =
  "rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-600 transition-colors hover:border-brand-navy hover:text-brand-navy disabled:opacity-30 disabled:hover:border-zinc-200 disabled:hover:text-zinc-600";

/**
 * L'éditeur de plan de salle.
 *
 * Chaque restaurant est unique : on ne pose plus les tables dans une grille
 * imposée, on les dépose où l'on veut, à la taille et à l'orientation qu'on
 * veut. Le brouillon vit dans le navigateur — d'où l'annulation immédiate et
 * gratuite — et part en base d'un seul bloc quand on enregistre.
 */
export function EditeurPlan({
  restaurantId,
  espace,
  initial,
}: {
  restaurantId: string;
  espace: Espace;
  initial: Brouillon;
}) {
  const [historique, setHistorique] = useState<Brouillon[]>([initial]);
  const [position, setPosition] = useState(0);
  const [enregistre, setEnregistre] = useState<Brouillon>(initial);
  const [selection, setSelection] = useState<Selection>(null);
  const [zoom, setZoom] = useState(0.7);
  const [message, setMessage] = useState<string | null>(null);
  const [erreurs, setErreurs] = useState<string[]>([]);
  const [enCours, startTransition] = useTransition();
  const cadre = useRef<HTMLDivElement>(null);
  const glisse = useRef<{
    genre: "table" | "repere";
    id: string;
    decalageX: number;
    decalageY: number;
  } | null>(null);

  const brouillon = historique[position];

  /** Chaque modification empile un état : c'est ce qui rend « Annuler » sûr. */
  const appliquer = useCallback(
    (transformation: (courant: Brouillon) => Brouillon) => {
      setHistorique((passe) => {
        const base = passe[Math.min(position, passe.length - 1)];
        const suite = transformation(copie(base));
        // On tronque ce qui suit : on repart de l'état affiché, pas de la fin.
        return [...passe.slice(0, position + 1), suite].slice(-60);
      });
      setPosition((p) => Math.min(p + 1, 59));
      setMessage(null);
    },
    [position],
  );

  const modifie = useMemo(
    () => JSON.stringify(brouillon) !== JSON.stringify(enregistre),
    [brouillon, enregistre],
  );

  const chevauchements = useMemo(
    () =>
      tablesQuiSeChevauchent(
        brouillon.tables.map((table) => ({
          ...table,
          restaurant_id: restaurantId,
          espace_id: espace.id,
        })),
      ),
    [brouillon.tables, restaurantId, espace.id],
  );

  const places = brouillon.tables.reduce((t, table) => t + table.places, 0);

  function ajouterTable(modele: ModeleTable) {
    appliquer((courant) => {
      const place = prochainePlaceLibre(
        [...courant.tables, ...courant.reperes],
        modele.largeur,
        modele.hauteur,
      );
      const table: TableBrouillon = {
        id: crypto.randomUUID(),
        nom: prochainNumero(courant.tables),
        places: modele.places,
        forme: modele.forme,
        largeur: modele.largeur,
        hauteur: modele.hauteur,
        rotation: 0,
        ...place,
      };
      courant.tables.push(table);
      setSelection({ genre: "table", id: table.id });
      return courant;
    });
  }

  function ajouterRepere(type: TypeRepere) {
    const modele = MODELES_REPERE.find((m) => m.cle === type)!;
    appliquer((courant) => {
      const place = prochainePlaceLibre(
        [...courant.tables, ...courant.reperes],
        modele.largeur,
        modele.hauteur,
      );
      const repere: RepereBrouillon = {
        id: crypto.randomUUID(),
        type,
        libelle: null,
        largeur: modele.largeur,
        hauteur: modele.hauteur,
        rotation: 0,
        ...place,
      };
      courant.reperes.push(repere);
      setSelection({ genre: "repere", id: repere.id });
      return courant;
    });
  }

  function deplacer(genre: "table" | "repere", id: string, x: number, y: number) {
    appliquer((courant) => {
      const liste = genre === "table" ? courant.tables : courant.reperes;
      const element = liste.find((e) => e.id === id);
      if (!element) return courant;
      const borne = contraindre(
        aimanter(x),
        aimanter(y),
        element.largeur,
        element.hauteur,
      );
      element.x = borne.x;
      element.y = borne.y;
      return courant;
    });
  }

  function tourner(sens: 1 | -1) {
    if (!selection) return;
    appliquer((courant) => {
      const liste =
        selection.genre === "table" ? courant.tables : courant.reperes;
      const element = liste.find((e) => e.id === selection.id);
      if (element) element.rotation = rotationSuivante(element.rotation, sens);
      return courant;
    });
  }

  function supprimer() {
    if (!selection) return;
    appliquer((courant) => {
      if (selection.genre === "table") {
        courant.tables = courant.tables.filter((t) => t.id !== selection.id);
      } else {
        courant.reperes = courant.reperes.filter((r) => r.id !== selection.id);
      }
      return courant;
    });
    setSelection(null);
  }

  function majTable(id: string, champs: Partial<TableBrouillon>) {
    appliquer((courant) => {
      const table = courant.tables.find((t) => t.id === id);
      if (table) Object.assign(table, champs);
      return courant;
    });
  }

  function enregistrer() {
    const donnees = new FormData();
    donnees.set("restaurant_id", restaurantId);
    donnees.set("espace_id", espace.id);
    donnees.set("plan", JSON.stringify(brouillon));
    setErreurs([]);
    setMessage(null);
    const instantane = copie(brouillon);
    startTransition(async () => {
      const reponse = await enregistrerPlan(donnees);
      if (reponse.erreurs.length > 0) {
        setErreurs(reponse.erreurs);
        return;
      }
      if (reponse.error) {
        setMessage(reponse.error);
        return;
      }
      setEnregistre(instantane);
      setMessage("Plan enregistré.");
    });
  }

  function pointDuPlan(event: React.PointerEvent) {
    const boite = cadre.current?.getBoundingClientRect();
    if (!boite) return null;
    return {
      x: (event.clientX - boite.left) / zoom,
      y: (event.clientY - boite.top) / zoom,
    };
  }

  const tableSelectionnee =
    selection?.genre === "table"
      ? brouillon.tables.find((t) => t.id === selection.id)
      : undefined;
  const repereSelectionne =
    selection?.genre === "repere"
      ? brouillon.reperes.find((r) => r.id === selection.id)
      : undefined;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-zinc-900">{espace.nom}</h2>
        <span className="text-sm tabular-nums text-zinc-500">
          {brouillon.tables.length} tables · {places} places dessinées sur{" "}
          {espace.capacite} couverts déclarés
        </span>
      </div>

      {places > espace.capacite && (
        <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Le plan compte {places - espace.capacite} places de plus que la
          capacité déclarée de cette salle. Klarr continue de s&apos;arrêter à{" "}
          {espace.capacite} couverts pour accepter les réservations : corrige
          la capacité dans la configuration si le plan a raison.
        </p>
      )}

      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={outil}
          disabled={position === 0}
          onClick={() => {
            setPosition((p) => Math.max(p - 1, 0));
            setSelection(null);
          }}
        >
          ↶ Annuler
        </button>
        <button
          type="button"
          className={outil}
          disabled={position >= historique.length - 1}
          onClick={() => {
            setPosition((p) => Math.min(p + 1, historique.length - 1));
            setSelection(null);
          }}
        >
          ↷ Rétablir
        </button>

        <span className="mx-1 h-5 w-px bg-zinc-200" aria-hidden="true" />

        <button
          type="button"
          aria-label="Dézoomer"
          className={outil}
          disabled={zoom <= ZOOMS[0]}
          onClick={() =>
            setZoom((z) => ZOOMS[Math.max(ZOOMS.indexOf(z) - 1, 0)])
          }
        >
          −
        </button>
        <span className="text-sm tabular-nums text-zinc-500">
          {Math.round(zoom * 100)} %
        </span>
        <button
          type="button"
          aria-label="Zoomer"
          className={outil}
          disabled={zoom >= ZOOMS[ZOOMS.length - 1]}
          onClick={() =>
            setZoom((z) =>
              ZOOMS[Math.min(ZOOMS.indexOf(z) + 1, ZOOMS.length - 1)],
            )
          }
        >
          +
        </button>

        <span className="mx-1 h-5 w-px bg-zinc-200" aria-hidden="true" />

        <button
          type="button"
          aria-label="Tourner à gauche"
          className={outil}
          disabled={!selection}
          onClick={() => tourner(-1)}
        >
          ⟲
        </button>
        <button
          type="button"
          aria-label="Tourner à droite"
          className={outil}
          disabled={!selection}
          onClick={() => tourner(1)}
        >
          ⟳
        </button>
        <button
          type="button"
          className={outil}
          disabled={!selection}
          onClick={supprimer}
        >
          Supprimer
        </button>

        <span className="ml-auto flex items-center gap-3">
          {modifie && (
            <span className="text-sm text-amber-700">
              Modifications non enregistrées
            </span>
          )}
          {message && !modifie && (
            <span className="text-sm text-zinc-500">{message}</span>
          )}
          <button
            type="button"
            onClick={enregistrer}
            disabled={enCours || !modifie}
            className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
          >
            {enCours ? "Enregistrement…" : "Enregistrer le plan"}
          </button>
        </span>
      </div>

      {erreurs.length > 0 && (
        <ul className="flex list-disc flex-col gap-1 rounded-xl border border-red-300 bg-red-50 px-6 py-3 text-sm text-red-800">
          {erreurs.map((erreur) => (
            <li key={erreur}>{erreur}</li>
          ))}
        </ul>
      )}
      {message && modifie && <p className="text-sm text-red-600">{message}</p>}

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Palette */}
        <div className="flex shrink-0 flex-col gap-3 lg:w-56">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Tables
            </span>
            <div className="grid grid-cols-3 gap-2 lg:grid-cols-2">
              {MODELES.map((modele) => (
                <button
                  key={modele.cle}
                  type="button"
                  onClick={() => ajouterTable(modele)}
                  className="flex flex-col items-center gap-1 rounded-lg border border-zinc-200 px-2 py-2 text-[11px] text-zinc-600 transition-colors hover:border-brand-navy hover:text-brand-navy"
                >
                  <span
                    aria-hidden="true"
                    className={`bg-zinc-200 ${classesForme(modele.forme)} ${bordureForme(modele.forme)} border-zinc-400`}
                    style={{
                      width: Math.max(12, modele.largeur / 6),
                      height: Math.max(12, modele.hauteur / 6),
                    }}
                  />
                  {modele.libelle}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Repères
            </span>
            <div className="grid grid-cols-3 gap-2 lg:grid-cols-2">
              {MODELES_REPERE.map((modele) => (
                <button
                  key={modele.cle}
                  type="button"
                  onClick={() => ajouterRepere(modele.cle)}
                  className="rounded-lg border border-zinc-200 px-2 py-2 text-[11px] text-zinc-600 transition-colors hover:border-brand-navy hover:text-brand-navy"
                >
                  {modele.libelle}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Le plan */}
        <div className="min-w-0 flex-1 overflow-auto rounded-xl border border-zinc-200 bg-zinc-50 p-2">
          <div
            ref={cadre}
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) setSelection(null);
            }}
            className="relative origin-top-left bg-white"
            style={{
              width: PLAN_LARGEUR,
              height: PLAN_HAUTEUR,
              transform: `scale(${zoom})`,
              // Le plan reste de taille fixe ; c'est le conteneur qui doit
              // réserver la place occupée après mise à l'échelle.
              marginBottom: PLAN_HAUTEUR * (zoom - 1),
              marginRight: PLAN_LARGEUR * (zoom - 1),
              backgroundImage:
                "repeating-linear-gradient(to right, rgb(244 244 245) 0 1px, transparent 1px 40px)," +
                "repeating-linear-gradient(to bottom, rgb(244 244 245) 0 1px, transparent 1px 40px)",
            }}
          >
            {brouillon.reperes.map((repere) => {
              const actif =
                selection?.genre === "repere" && selection.id === repere.id;
              return (
                <button
                  key={repere.id}
                  type="button"
                  aria-label={`${LIBELLES_REPERE[repere.type]}${repere.libelle ? ` ${repere.libelle}` : ""}`}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    const point = pointDuPlan(event);
                    if (!point) return;
                    setSelection({ genre: "repere", id: repere.id });
                    glisse.current = {
                      genre: "repere",
                      id: repere.id,
                      decalageX: point.x - repere.x,
                      decalageY: point.y - repere.y,
                    };
                    event.currentTarget.setPointerCapture(event.pointerId);
                  }}
                  onPointerUp={(event) => {
                    const prise = glisse.current;
                    glisse.current = null;
                    if (!prise || prise.id !== repere.id) return;
                    const point = pointDuPlan(event);
                    if (!point) return;
                    deplacer(
                      "repere",
                      repere.id,
                      point.x - prise.decalageX,
                      point.y - prise.decalageY,
                    );
                  }}
                  style={{
                    left: repere.x,
                    top: repere.y,
                    width: repere.largeur,
                    height: repere.hauteur,
                    transform: `rotate(${repere.rotation}deg)`,
                  }}
                  className={`absolute flex cursor-grab touch-none items-center justify-center border text-[11px] text-zinc-600 ${classesRepere(
                    repere.type,
                  )} ${actif ? "ring-2 ring-brand-navy" : ""}`}
                >
                  {repere.libelle ?? LIBELLES_REPERE[repere.type]}
                </button>
              );
            })}

            {brouillon.tables.map((table) => {
              const actif =
                selection?.genre === "table" && selection.id === table.id;
              const gene = chevauchements.has(table.id);
              return (
                <button
                  key={table.id}
                  type="button"
                  aria-label={`Table ${table.nom}, ${table.places} places`}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    const point = pointDuPlan(event);
                    if (!point) return;
                    setSelection({ genre: "table", id: table.id });
                    glisse.current = {
                      genre: "table",
                      id: table.id,
                      decalageX: point.x - table.x,
                      decalageY: point.y - table.y,
                    };
                    event.currentTarget.setPointerCapture(event.pointerId);
                  }}
                  onPointerUp={(event) => {
                    const prise = glisse.current;
                    glisse.current = null;
                    if (!prise || prise.id !== table.id) return;
                    const point = pointDuPlan(event);
                    if (!point) return;
                    deplacer(
                      "table",
                      table.id,
                      point.x - prise.decalageX,
                      point.y - prise.decalageY,
                    );
                  }}
                  onKeyDown={(event) => {
                    const pas: Record<string, [number, number]> = {
                      ArrowLeft: [-10, 0],
                      ArrowRight: [10, 0],
                      ArrowUp: [0, -10],
                      ArrowDown: [0, 10],
                    };
                    const delta = pas[event.key];
                    if (!delta) return;
                    event.preventDefault();
                    deplacer(
                      "table",
                      table.id,
                      table.x + delta[0],
                      table.y + delta[1],
                    );
                  }}
                  style={{
                    left: table.x,
                    top: table.y,
                    width: table.largeur,
                    height: table.hauteur,
                    transform: `rotate(${table.rotation}deg)`,
                  }}
                  className={`absolute flex cursor-grab touch-none flex-col items-center justify-center leading-none transition-colors ${classesForme(
                    table.forme,
                  )} ${bordureForme(table.forme)} ${
                    actif
                      ? "border-brand-navy bg-brand-navy text-white"
                      : gene
                        ? "border-amber-500 bg-amber-50 text-amber-900"
                        : "border-zinc-400 bg-white text-zinc-700"
                  }`}
                >
                  <span className="text-xs font-semibold">{table.nom}</span>
                  <span className="text-[10px] opacity-70">
                    {table.places}p
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panneau de l'élément sélectionné */}
        <div className="flex shrink-0 flex-col gap-3 lg:w-56">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Sélection
          </span>

          {!selection && (
            <p className="text-sm text-zinc-500">
              Clique une table pour la renommer, la tourner ou la retirer.
              Glisse-la pour la déplacer, ou utilise les flèches du clavier.
            </p>
          )}

          {tableSelectionnee && (
            <div className="flex flex-col gap-3 rounded-xl border border-brand-navy/30 bg-brand-navy/5 p-3">
              <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
                Numéro
                <input
                  value={tableSelectionnee.nom}
                  onChange={(event) =>
                    majTable(tableSelectionnee.id, { nom: event.target.value })
                  }
                  className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-brand-navy"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
                Places
                <input
                  type="number"
                  min={1}
                  value={tableSelectionnee.places}
                  onChange={(event) =>
                    majTable(tableSelectionnee.id, {
                      places: Number(event.target.value),
                    })
                  }
                  className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-brand-navy"
                />
              </label>
              {chevauchements.has(tableSelectionnee.id) && (
                <p className="text-xs text-amber-700">
                  Cette table en recouvre une autre. Ce n&apos;est pas
                  interdit — on rapproche des tables — mais vérifie que
                  c&apos;est voulu.
                </p>
              )}
            </div>
          )}

          {repereSelectionne && (
            <div className="flex flex-col gap-3 rounded-xl border border-brand-navy/30 bg-brand-navy/5 p-3">
              <span className="text-sm font-medium text-zinc-900">
                {LIBELLES_REPERE[repereSelectionne.type]}
              </span>
              <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
                Nom affiché{" "}
                <span className="font-normal text-zinc-400">(facultatif)</span>
                <input
                  value={repereSelectionne.libelle ?? ""}
                  onChange={(event) =>
                    appliquer((courant) => {
                      const repere = courant.reperes.find(
                        (r) => r.id === repereSelectionne.id,
                      );
                      if (repere) {
                        repere.libelle = event.target.value || null;
                      }
                      return courant;
                    })
                  }
                  className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-brand-navy"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
