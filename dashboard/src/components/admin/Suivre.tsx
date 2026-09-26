import { enregistrerSuivi } from "@/app/admin/actions";
import {
  LIBELLE_STATUT,
  STATUTS,
  TEINTE_STATUT,
  type Suivi,
} from "@/lib/suivi";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Le suivi d'un contact : ce qu'on en a fait, et la ligne suivante.
 *
 * Un journal plutôt qu'un état : « il rappelle après le service » vaut
 * plus que « à relancer », et l'état se lit dans la dernière ligne. Le
 * formulaire est en bas, jamais en haut — on lit avant d'écrire.
 */
export function Suivre({
  cibleType,
  cibleId,
  lignes,
}: {
  cibleType: Suivi["cible_type"];
  cibleId: string;
  lignes: Suivi[];
}) {
  const derniere = lignes[0];

  return (
    <div className="flex min-w-[260px] flex-col gap-2">
      {derniere ? (
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${TEINTE_STATUT[derniere.statut]}`}
            >
              {LIBELLE_STATUT[derniere.statut]}
            </span>
            <span className="text-xs text-zinc-400">
              {formatDate(derniere.created_at)}
            </span>
          </span>
          {derniere.note && (
            <span className="text-xs text-zinc-600">{derniere.note}</span>
          )}
        </div>
      ) : (
        <span className="text-xs text-zinc-400">Jamais contacté.</span>
      )}

      {lignes.length > 1 && (
        <details className="text-xs text-zinc-500">
          <summary className="cursor-pointer text-zinc-400">
            {lignes.length - 1} ligne(s) avant
          </summary>
          <ul className="mt-1 flex flex-col gap-1">
            {lignes.slice(1).map((ligne) => (
              <li key={ligne.created_at}>
                <span className="text-zinc-400">
                  {formatDate(ligne.created_at)} —{" "}
                </span>
                {LIBELLE_STATUT[ligne.statut]}
                {ligne.note ? ` : ${ligne.note}` : ""}
              </li>
            ))}
          </ul>
        </details>
      )}

      <form action={enregistrerSuivi} className="flex flex-col gap-1">
        <input type="hidden" name="cible_type" value={cibleType} />
        <input type="hidden" name="cible_id" value={cibleId} />
        <div className="flex items-center gap-1">
          <select
            name="statut"
            defaultValue={derniere?.statut ?? "a_rappeler"}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs outline-none focus:border-brand-navy"
          >
            {STATUTS.map((statut) => (
              <option key={statut} value={statut}>
                {LIBELLE_STATUT[statut]}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="note"
            placeholder="Ce qu'il a dit"
            className="min-w-0 flex-1 rounded-md border border-zinc-300 px-2 py-1 text-xs outline-none focus:border-brand-navy"
          />
          <button
            type="submit"
            className="shrink-0 rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 hover:border-brand-navy hover:text-brand-navy"
          >
            Noter
          </button>
        </div>
      </form>
    </div>
  );
}
