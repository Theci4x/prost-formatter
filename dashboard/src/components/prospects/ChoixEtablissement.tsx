"use client";

import { BarreAnalyse } from "@/components/prospects/BarreAnalyse";
import type { Candidat } from "@/lib/audit/correspondance";
import type { translations } from "@/lib/i18n/testPresence";

type Libelles = (typeof translations)[keyof typeof translations]["form"];

/**
 * « Lequel est le vôtre ? »
 *
 * On n'arrive ici que lorsque le nom saisi désigne plusieurs endroits, ou
 * aucun clairement. Une question de plus vaut mieux qu'un audit faux
 * envoyé par courriel avec notre logo dessus : le restaurateur qui lit la
 * note d'un concurrent sur sa propre fiche ne rappelle pas.
 *
 * Chaque établissement est un bouton d'envoi, pas une case à cocher : un
 * seul geste au lieu de deux, sur un téléphone comme sur un ordinateur.
 */
export function ChoixEtablissement({
  t,
  action,
  enCours,
  candidats,
  prospectId,
  entreprise,
  ville,
  email,
  prenom,
  langue,
}: {
  t: Libelles;
  action: (formData: FormData) => void;
  enCours: boolean;
  candidats: Candidat[];
  prospectId: string;
  entreprise: string;
  ville: string;
  email: string;
  prenom: string;
  /** Pour que le rapport parte dans la langue où la page a été lue. */
  langue: string;
}) {
  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-2xl border border-line bg-paper p-6 shadow-[0_24px_60px_-40px_oklch(20%_0.02_60/35%)] sm:p-7"
    >
      <input type="hidden" name="prospect_id" value={prospectId} />
      <input type="hidden" name="entreprise" value={entreprise} />
      <input type="hidden" name="ville" value={ville} />
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="prenom" value={prenom} />
      <input type="hidden" name="langue" value={langue} />

      <div className="flex flex-col gap-1">
        <p className="font-serif text-xl text-ink">{t.choixTitle}</p>
        <p className="text-sm text-ink-soft">{t.choixBody}</p>
      </div>

      <div className="flex flex-col gap-2">
        {candidats.map((candidat) => (
          <button
            key={candidat.id}
            type="submit"
            name="place_id"
            value={candidat.id}
            disabled={enCours}
            className="flex flex-col gap-0.5 rounded-xl border border-line px-4 py-3 text-left transition-colors hover:border-brand-orange hover:bg-brand-orange-soft disabled:opacity-50"
          >
            <span className="text-sm font-semibold text-ink">
              {candidat.nom}
            </span>
            <span className="text-xs text-ink-soft">{candidat.adresse}</span>
          </button>
        ))}
      </div>

      <button
        type="submit"
        name="place_id"
        value=""
        disabled={enCours}
        className="w-fit text-sm text-ink-soft underline hover:text-ink disabled:opacity-50"
      >
        {t.choixAucun}
      </button>

      {enCours && <BarreAnalyse libelle={t.submittingDetail} />}
    </form>
  );
}
