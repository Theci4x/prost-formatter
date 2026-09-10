import Link from "next/link";

export type JourCharge = {
  date: string;
  demandes: number;
  confirmees: number;
};

const JOURS_ENTETE = ["L", "M", "M", "J", "V", "S", "D"];

function moisPrecedent(mois: string): string {
  const [annee, m] = mois.split("-").map(Number);
  const d = new Date(Date.UTC(annee, m - 2, 1));
  return d.toISOString().slice(0, 7);
}

function moisSuivant(mois: string): string {
  const [annee, m] = mois.split("-").map(Number);
  const d = new Date(Date.UTC(annee, m, 1));
  return d.toISOString().slice(0, 7);
}

function libelleMois(mois: string): string {
  return new Date(`${mois}-01T12:00:00`).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Grille du mois avec la charge de chaque jour. Server component : le
 * changement de mois passe par un lien, la page n'a donc pas besoin de
 * JavaScript pour se feuilleter.
 */
export function CalendrierMois({
  mois,
  jourSelectionne,
  charges,
  lienBase,
}: {
  mois: string;
  jourSelectionne: string | null;
  charges: JourCharge[];
  lienBase: string;
}) {
  const [annee, m] = mois.split("-").map(Number);
  const premier = new Date(Date.UTC(annee, m - 1, 1));
  const nbJours = new Date(Date.UTC(annee, m, 0)).getUTCDate();
  // getUTCDay() : 0 = dimanche. La grille commence le lundi.
  const decalage = (premier.getUTCDay() + 6) % 7;

  const parDate = new Map(charges.map((charge) => [charge.date, charge]));
  const aujourdhui = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`${lienBase}?mois=${moisPrecedent(mois)}`}
          aria-label="Mois précédent"
          className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
        >
          ←
        </Link>
        <span className="text-sm font-semibold text-zinc-900 first-letter:capitalize">
          {libelleMois(mois)}
        </span>
        <Link
          href={`${lienBase}?mois=${moisSuivant(mois)}`}
          aria-label="Mois suivant"
          className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
        >
          →
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-400">
        {JOURS_ENTETE.map((jour, index) => (
          <span key={`${jour}-${index}`}>{jour}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: decalage }, (_, index) => (
          <span key={`vide-${index}`} />
        ))}

        {Array.from({ length: nbJours }, (_, index) => {
          const numero = index + 1;
          const date = `${mois}-${String(numero).padStart(2, "0")}`;
          const charge = parDate.get(date);
          const selectionne = date === jourSelectionne;
          const total = (charge?.demandes ?? 0) + (charge?.confirmees ?? 0);

          return (
            <Link
              key={date}
              href={`${lienBase}?mois=${mois}&jour=${date}`}
              className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-lg text-sm transition-colors ${
                selectionne
                  ? "bg-brand-navy font-semibold text-white"
                  : total > 0
                    ? "bg-brand-orange-soft text-brand-navy hover:bg-brand-orange/20"
                    : "text-zinc-500 hover:bg-zinc-100"
              } ${date === aujourdhui && !selectionne ? "ring-1 ring-brand-orange" : ""}`}
            >
              <span>{numero}</span>
              {/* Une pastille pleine pour les réservations fermes, creuse
                  pour les demandes en attente : le restaurateur voit d'un
                  coup d'œil ce qui lui reste à trancher. */}
              {total > 0 && (
                <span className="flex gap-0.5">
                  {charge?.confirmees ? (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${selectionne ? "bg-white" : "bg-brand-navy"}`}
                    />
                  ) : null}
                  {charge?.demandes ? (
                    <span
                      className={`h-1.5 w-1.5 rounded-full border ${selectionne ? "border-white" : "border-brand-orange"}`}
                    />
                  ) : null}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-navy" />
          Confirmées
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full border border-brand-orange" />
          En attente
        </span>
      </div>
    </div>
  );
}
