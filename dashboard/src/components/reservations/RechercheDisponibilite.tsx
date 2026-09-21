"use client";

import { usePathname, useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";

/**
 * Le choix de la date, du nombre de convives et de la salle.
 *
 * Avant, c'était un formulaire ordinaire : chaque changement rechargeait
 * la page entière, la ramenait en haut, et il fallait redescendre pour
 * voir les créneaux. Des testeurs l'ont dit mot pour mot — « ça recharge
 * la page », « faut aller en bas ».
 *
 * Ici, chaque changement met à jour les créneaux sur place, sans bouger
 * l'écran d'un pixel. Et il n'y a plus de bouton à trouver : choisir une
 * date, c'est demander les disponibilités.
 *
 * Tout reste un vrai formulaire `method="get"` : sans JavaScript, les
 * boutons de convives envoient leur valeur comme avant et le bouton de
 * recherche reparaît. Une page de réservation doit marcher partout, y
 * compris sur le téléphone d'un client dans un sous-sol.
 */

type Espace = { id: string; nom: string; capacite: number };

export function RechercheDisponibilite({
  date,
  couverts,
  espaceId,
  espaces,
  dateMin,
  children,
}: {
  date: string;
  couverts: number;
  espaceId: string | null;
  /** Les salles privatisables, quand l'établissement en propose. */
  espaces: Espace[] | null;
  dateMin: string;
  /** Les créneaux, rendus par le serveur. */
  children: React.ReactNode;
}) {
  const router = useRouter();
  const chemin = usePathname();
  const [enCours, demarrer] = useTransition();

  // Ce que les champs montrent, tout de suite. Sans ça, choisir une date
  // sur une connexion lente la ferait revenir à l'ancienne le temps que le
  // serveur réponde — on croirait que le clic n'a pas pris. React rétablit
  // seul la valeur réelle si la navigation échoue.
  const [choix, poserChoix] = useOptimistic({ date, couverts, espaceId });

  function naviguer(change: {
    date?: string;
    couverts?: number;
    espace?: string | null;
  }) {
    const nouveau = {
      date: change.date ?? choix.date,
      couverts: change.couverts ?? choix.couverts,
      espaceId: change.espace !== undefined ? change.espace : choix.espaceId,
    };

    const params = new URLSearchParams();
    params.set("date", nouveau.date);
    params.set("couverts", String(nouveau.couverts));
    if (nouveau.espaceId) params.set("espace", nouveau.espaceId);

    // L'heure retenue est volontairement oubliée : elle n'existe peut-être
    // pas à la nouvelle date, et une heure fantôme afficherait un service
    // vide sans dire pourquoi.
    demarrer(() => {
      poserChoix(nouveau);
      router.replace(`${chemin}?${params}`, { scroll: false });
    });
  }

  const champ =
    "rounded-lg border border-line bg-paper px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-orange";

  return (
    <div className="flex flex-col gap-4">
      <form
        method="get"
        className="flex w-full max-w-full flex-wrap items-end gap-4 rounded-2xl border border-line bg-paper p-5 shadow-sm"
      >
        {choix.espaceId && (
          <input type="hidden" name="espace" value={choix.espaceId} />
        )}

        <label className="flex min-w-0 flex-1 basis-36 flex-col gap-1 text-sm font-medium text-ink sm:flex-none sm:basis-auto">
          Date
          <input
            type="date"
            name="date"
            value={choix.date}
            min={dateMin}
            // Un champ de date natif porte sa largeur intrinsèque, qui
            // varie d'un navigateur à l'autre : sans ces bornes, il élargit
            // la carte au-delà de l'écran d'un iPhone.
            onChange={(evenement) => {
              const choisie = evenement.target.value;
              if (choisie) naviguer({ date: choisie });
            }}
            className={`${champ} w-full min-w-0`}
          />
        </label>

        {/* Deux boutons plutôt qu'un champ numérique : au téléphone, on
            règle un nombre de convives au pouce, sans faire surgir un
            clavier. Ce sont de vrais boutons d'envoi, qui portent leur
            valeur — sans JavaScript, ils marchent encore. */}
        <div className="flex shrink-0 flex-col gap-1 text-sm font-medium text-ink">
          Convives
          <div className="flex items-center gap-1 rounded-lg border border-line bg-paper p-1">
            <button
              type="submit"
              name="couverts"
              value={Math.max(1, choix.couverts - 1)}
              disabled={choix.couverts <= 1}
              aria-label="Un convive de moins"
              onClick={(evenement) => {
                evenement.preventDefault();
                naviguer({ couverts: Math.max(1, choix.couverts - 1) });
              }}
              className="flex h-9 w-9 items-center justify-center rounded-md text-lg text-ink transition-colors hover:bg-brand-sand disabled:opacity-30"
            >
              −
            </button>
            <span className="w-8 text-center text-base font-semibold tabular-nums text-ink">
              {choix.couverts}
            </span>
            <button
              type="submit"
              name="couverts"
              value={choix.couverts + 1}
              aria-label="Un convive de plus"
              onClick={(evenement) => {
                evenement.preventDefault();
                naviguer({ couverts: choix.couverts + 1 });
              }}
              className="flex h-9 w-9 items-center justify-center rounded-md text-lg text-ink transition-colors hover:bg-brand-sand"
            >
              +
            </button>
          </div>
        </div>

        {/* La privatisation ne se propose qu'au-delà d'un certain nombre de
            convives : un couple qui réserve pour deux ne la verrait jamais,
            et repartirait sans savoir que la salle se loue. */}
        {espaces && espaces.length > 0 && (
          <label className="flex w-full min-w-0 basis-full flex-col gap-1 text-sm font-medium text-ink sm:w-auto sm:basis-auto">
            Je souhaite
            <select
              name="espace"
              value={choix.espaceId ?? ""}
              onChange={(evenement) =>
                naviguer({ espace: evenement.target.value || null })
              }
              className={`${champ} w-full min-w-0 max-w-full`}
            >
              <option value="">Réserver une table</option>
              {espaces.map((espace) => (
                <option key={espace.id} value={espace.id}>
                  Privatiser {espace.nom} — jusqu&apos;à {espace.capacite}{" "}
                  couverts
                </option>
              ))}
            </select>
          </label>
        )}

        {/* Sans JavaScript, rien ne se met à jour tout seul : le bouton
            d'autrefois reparaît, et la page fonctionne comme avant. */}
        <noscript>
          <button
            type="submit"
            className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white"
          >
            Voir les disponibilités
          </button>
        </noscript>
      </form>

      {/* Les créneaux s'estompent le temps de la mise à jour : sans ce
          signal, un changement de date sur une connexion lente donne
          l'impression que rien ne s'est passé. */}
      <div
        aria-busy={enCours}
        className={`flex flex-col transition-opacity duration-200 ${
          enCours ? "opacity-50" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Une heure d'arrivée. Même principe que ci-dessus : un lien véritable,
 * qui fonctionne sans JavaScript, mais qui met à jour la page sur place
 * quand JavaScript est là — au lieu de la recharger et de la remonter.
 */
export function LienCreneau({
  href,
  actif,
  children,
}: {
  href: string;
  actif: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [enCours, demarrer] = useTransition();

  return (
    <a
      href={href}
      aria-current={actif ? "true" : undefined}
      onClick={(evenement) => {
        // Un clic du milieu, ou avec Ctrl, ouvre un onglet : on ne le vole
        // pas.
        if (
          evenement.metaKey ||
          evenement.ctrlKey ||
          evenement.shiftKey ||
          evenement.button !== 0
        ) {
          return;
        }
        evenement.preventDefault();
        demarrer(() => router.replace(href, { scroll: false }));
      }}
      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
        actif
          ? "border-brand-navy bg-brand-navy text-white"
          : "border-line text-ink hover:border-brand-navy"
      } ${enCours ? "opacity-50" : ""}`}
    >
      {children}
    </a>
  );
}
