import Link from "next/link";
import type { Statistiques as Stats } from "@/lib/reservations/statistiques";
import { JOURS_ISO, type Espace } from "@/types/reservation";

// Paire validée pour la vision des couleurs : séparation ΔE 32,9 en protanopie
// et contraste suffisant sur fond clair. Le bleu marine de la marque, trop
// sombre et trop gris, échouait comme couleur de série.
const SERIE_A = "#d97706";
const SERIE_B = "#1d4ed8";

function Tuile({
  valeur,
  libelle,
  precision,
}: {
  valeur: string;
  libelle: string;
  precision?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
      <span className="text-3xl font-semibold tabular-nums text-brand-navy">
        {valeur}
      </span>
      <span className="text-sm text-zinc-600">{libelle}</span>
      {precision && (
        <span className="text-xs text-zinc-400">{precision}</span>
      )}
    </div>
  );
}

/** Barres horizontales à série unique : une magnitude par catégorie. */
function Barres({
  titre,
  lignes,
  unite,
}: {
  titre: string;
  lignes: { cle: string; libelle: string; valeur: number; detail: string }[];
  unite: string;
}) {
  const max = Math.max(...lignes.map((l) => l.valeur), 1);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-900">{titre}</h3>
      {lignes.length === 0 ? (
        <p className="text-sm text-zinc-500">Rien sur cette période.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {lignes.map((ligne) => (
            <li key={ligne.cle} className="flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0 truncate text-zinc-600">
                {ligne.libelle}
              </span>
              <span className="flex h-2.5 flex-1 items-center">
                <span
                  title={ligne.detail}
                  className="h-2.5 rounded-[4px]"
                  style={{
                    width: `${Math.max((ligne.valeur / max) * 100, ligne.valeur > 0 ? 2 : 0)}%`,
                    background: SERIE_A,
                  }}
                />
              </span>
              {/* Étiquette directe plutôt qu'un axe : moins d'encre, et la
                  valeur reste lisible sans survoler. */}
              <span className="w-24 shrink-0 whitespace-nowrap text-right tabular-nums text-zinc-700">
                {ligne.valeur > 0 ? `${ligne.valeur} ${unite}` : "—"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Deux parts d'un même total, avec légende : jamais la couleur seule. */
function Repartition({
  titre,
  a,
  b,
}: {
  titre: string;
  a: { libelle: string; valeur: number };
  b: { libelle: string; valeur: number };
}) {
  const total = a.valeur + b.valeur;
  const partA = total ? (a.valeur / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-900">{titre}</h3>

      {total === 0 ? (
        <p className="text-sm text-zinc-500">Rien sur cette période.</p>
      ) : (
        <>
          {/* Deux segments séparés par un filet de fond : sans cet écart, la
              frontière disparaît quand les deux teintes se touchent. */}
          <span className="flex h-3 w-full overflow-hidden rounded-[4px] bg-zinc-100">
            {a.valeur > 0 && (
              <span
                title={`${a.libelle} : ${a.valeur}`}
                style={{
                  width: `${partA}%`,
                  background: SERIE_A,
                  borderRight: b.valeur > 0 ? "2px solid white" : undefined,
                }}
              />
            )}
            {b.valeur > 0 && (
              <span
                title={`${b.libelle} : ${b.valeur}`}
                className="flex-1"
                style={{ background: SERIE_B }}
              />
            )}
          </span>

          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: SERIE_A }}
              />
              <span className="text-zinc-600">{a.libelle}</span>
              <span className="font-medium tabular-nums text-zinc-900">
                {a.valeur}
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: SERIE_B }}
              />
              <span className="text-zinc-600">{b.libelle}</span>
              <span className="font-medium tabular-nums text-zinc-900">
                {b.valeur}
              </span>
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function pourcent(part: number | null): string {
  return part === null ? "—" : `${Math.round(part * 100)} %`;
}

export function Statistiques({
  stats,
  espaces,
  jours,
  lienPeriode,
}: {
  stats: Stats;
  espaces: Espace[];
  jours: number;
  /** Construit le lien d'une période sans perdre le reste de la page. */
  lienPeriode: (jours: number) => string;
}) {
  const nomEspace = new Map(espaces.map((e) => [e.id, e.nom]));

  return (
    <section id="statistiques" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold text-zinc-900">Statistiques</h2>
          {/* Fenêtre passée, dite explicitement : sans cette ligne, un carnet
              bien rempli pour le mois prochain ferait croire à un bug. */}
          <p className="text-sm text-zinc-500">
            Ce qui s&apos;est passé sur les{" "}
            {jours === 365 ? "365" : jours} derniers jours, aujourd&apos;hui
            compris. Ce qui est à venir est dans le calendrier.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-zinc-100 p-1">
          {[30, 90, 365].map((option) => (
            <Link
              key={option}
              href={lienPeriode(option)}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                option === jours
                  ? "bg-white font-medium text-brand-navy shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {option === 365 ? "1 an" : `${option} j`}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tuile
          valeur={String(stats.couvertsConfirmes)}
          libelle="Couverts confirmés"
          precision={
            stats.couvertsMoyens
              ? `${stats.couvertsMoyens.toFixed(1).replace(".", ",")} par réservation`
              : undefined
          }
        />
        <Tuile
          valeur={String(stats.reservationsConfirmees)}
          libelle="Réservations confirmées"
        />
        <Tuile
          valeur={pourcent(stats.partEnLigne)}
          libelle="Venues de ta page"
          precision="le reste est pris au téléphone"
        />
        <Tuile
          valeur={pourcent(stats.tauxAcceptation)}
          libelle="Demandes acceptées"
          precision={`sur ${stats.demandesEnLigne} demande${stats.demandesEnLigne > 1 ? "s" : ""} reçue${stats.demandesEnLigne > 1 ? "s" : ""}`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Barres
          titre="Couverts par jour de la semaine"
          unite="couverts"
          lignes={stats.parJour.map((ligne) => {
            const jour = JOURS_ISO.find((j) => j.valeur === ligne.jour);
            return {
              cle: String(ligne.jour),
              libelle: jour ? jour.long : String(ligne.jour),
              valeur: ligne.couverts,
              detail: `${ligne.reservations} réservation(s), ${ligne.couverts} couverts`,
            };
          })}
        />
        <Barres
          titre="Couverts par espace"
          unite="couverts"
          lignes={stats.parEspace.map((ligne) => ({
            cle: ligne.espaceId,
            libelle: nomEspace.get(ligne.espaceId) ?? "Espace supprimé",
            valeur: ligne.couverts,
            detail: `${ligne.reservations} réservation(s), ${ligne.couverts} couverts`,
          }))}
        />
        <Repartition
          titre="Individuelles et privatisations"
          a={{ libelle: "Individuelles", valeur: stats.parType.table }}
          b={{ libelle: "Privatisations", valeur: stats.parType.privatisation }}
        />
        <Repartition
          titre="D'où viennent les réservations"
          a={{ libelle: "Ta page en ligne", valeur: stats.parOrigine.client }}
          b={{ libelle: "Téléphone", valeur: stats.parOrigine.restaurateur }}
        />
      </div>
    </section>
  );
}
