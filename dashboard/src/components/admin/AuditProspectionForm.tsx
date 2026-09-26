"use client";

import { useActionState } from "react";
import {
  auditerPourProspection,
  type EtatAuditProspection,
} from "@/app/admin/audits/actions";

const initial: EtatAuditProspection = { etat: "idle" };

const champ =
  "rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-navy focus:bg-white";

/**
 * « Auditer un restaurant » : nom, ville, langue du rapport.
 *
 * L'analyse prend une trentaine de secondes — Google Maps, le site, puis
 * les assistants IA. Le bouton le dit, pour qu'on ne clique pas deux fois.
 */
export function AuditProspectionForm() {
  const [etat, action, enCours] = useActionState(
    auditerPourProspection,
    initial,
  );

  return (
    <div className="flex flex-col gap-4">
      <form
        action={action}
        className="grid gap-3 sm:grid-cols-[2fr_1.3fr_1fr_auto]"
      >
        <input
          name="nom"
          required
          defaultValue={etat.nom}
          placeholder="Nom du restaurant"
          className={champ}
        />
        <input
          name="ville"
          required
          defaultValue={etat.ville}
          placeholder="Ville"
          className={champ}
        />
        <select
          name="langue"
          defaultValue={etat.langue ?? "fr"}
          className={champ}
          aria-label="Langue du rapport"
        >
          <option value="fr">Rapport en français</option>
          <option value="zh">Rapport en chinois</option>
          <option value="en">Rapport en anglais</option>
        </select>
        <button
          type="submit"
          disabled={enCours}
          className="rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-60"
        >
          {enCours ? "Analyse… (30 s)" : "Auditer"}
        </button>
      </form>

      {etat.etat === "erreur" && etat.erreur && (
        <p className="text-sm text-red-600" role="alert">
          {etat.erreur}
        </p>
      )}

      {etat.etat === "choix" && etat.candidats && (
        <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <span className="text-sm font-semibold text-amber-900">
            Plusieurs établissements correspondent — lequel ?
          </span>
          <ul className="flex flex-col gap-2">
            {etat.candidats.map((candidat) => (
              <li key={candidat.id}>
                <form action={action}>
                  <input type="hidden" name="place_id" value={candidat.id} />
                  <input type="hidden" name="nom" value={etat.nom ?? ""} />
                  <input type="hidden" name="ville" value={etat.ville ?? ""} />
                  <input
                    type="hidden"
                    name="langue"
                    value={etat.langue ?? "fr"}
                  />
                  <button
                    type="submit"
                    disabled={enCours}
                    className="flex w-full flex-col items-start rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-left text-sm transition-colors hover:border-brand-navy disabled:opacity-60"
                  >
                    <span className="font-semibold text-ink">
                      {candidat.nom}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {candidat.adresse}
                    </span>
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
