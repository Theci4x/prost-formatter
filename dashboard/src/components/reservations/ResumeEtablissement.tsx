import { formatHeure } from "@/types/reservation";
import type { ResumeEtablissement as Resume } from "@/lib/reservations/resume";

const PRIVATISATION: Record<Resume["privatisation"], string> = {
  totale: "Totale",
  partielle: "Partielle",
  aucune: "Non proposée",
};

function Fait({
  icone,
  libelle,
  valeur,
}: {
  icone: React.ReactNode;
  libelle: string;
  valeur: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-2 text-center">
      <span className="text-zinc-400">{icone}</span>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        {libelle}
      </span>
      <span className="text-sm font-medium text-zinc-900">{valeur}</span>
    </div>
  );
}

const traits = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/**
 * Les quelques faits qu'un client vérifie avant de regarder les créneaux.
 * Tout vient de la configuration du restaurateur : il n'a rien à ressaisir,
 * et la bande ne peut donc pas contredire ce que la page propose plus bas.
 */
export function ResumeEtablissement({
  resume,
  note,
  nombreAvis,
}: {
  resume: Resume;
  note: number | null;
  nombreAvis: number | null;
}) {
  if (resume.capaciteMax === 0 && resume.finLaPlusTardive === null) return null;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
      {note !== null && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-base font-semibold text-zinc-900">
            {note.toFixed(1).replace(".", ",")}/5
          </span>
          <span className="text-brand-orange" aria-hidden="true">
            {"★".repeat(Math.round(note))}
            <span className="text-zinc-200">
              {"★".repeat(5 - Math.round(note))}
            </span>
          </span>
          {nombreAvis !== null && (
            <span className="text-zinc-500">
              {nombreAvis} avis Google
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-y-5 sm:grid-cols-4">
        {resume.capaciteMax > 0 && (
          <Fait
            libelle="Réservation"
            valeur={`Jusqu'à ${resume.capaciteMax} pers.`}
            icone={
              <svg width="22" height="22" viewBox="0 0 24 24" {...traits}>
                <path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20" />
                <circle cx="10" cy="8" r="3.2" />
                <path d="M20 20v-1.5a3.5 3.5 0 0 0-2.6-3.4" />
                <path d="M15.5 5.2a3.2 3.2 0 0 1 0 5.6" />
              </svg>
            }
          />
        )}
        <Fait
          libelle="Privatisation"
          valeur={PRIVATISATION[resume.privatisation]}
          icone={
            <svg width="22" height="22" viewBox="0 0 24 24" {...traits}>
              <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
              <path d="M10 21v-5h4v5" />
            </svg>
          }
        />
        {resume.finLaPlusTardive && (
          <Fait
            libelle="Jusqu'à"
            valeur={formatHeure(resume.finLaPlusTardive)}
            icone={
              <svg width="22" height="22" viewBox="0 0 24 24" {...traits}>
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 7.5V12l3 1.8" />
              </svg>
            }
          />
        )}
        {resume.espaces > 0 && (
          <Fait
            libelle="Espaces"
            valeur={`${resume.espaces} ${resume.espaces > 1 ? "salles" : "salle"}`}
            icone={
              <svg width="22" height="22" viewBox="0 0 24 24" {...traits}>
                <rect x="3" y="4" width="8" height="7" rx="1.5" />
                <rect x="13" y="4" width="8" height="16" rx="1.5" />
                <rect x="3" y="13" width="8" height="7" rx="1.5" />
              </svg>
            }
          />
        )}
      </div>
    </div>
  );
}
