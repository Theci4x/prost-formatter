"use client";

import { useActionState } from "react";
import type { Langue } from "@/lib/i18n/langues";
import { CARTE, type ClesCarte } from "@/lib/i18n/carte";
import { enregistrerFormats } from "@/app/dashboard/[id]/menu/actions";
import { formatsDe, formatsLisibles } from "@/lib/menu/carte";
import {
  FORMATS_INITIAL,
  FORMATS_MAX,
  FORMAT_LIBELLE_MAX,
  type Format,
} from "@/types/menu";

/**
 * Les formats de vente d'un plat, depuis la carte du tableau de bord.
 *
 * « Les escargots, je les vends par 6 ou par 12. » C'est le même plat :
 * même description, même photo, mêmes allergènes. En faire deux lignes
 * obligerait à tout saisir deux fois, et le sortirait deux fois dans le
 * document allergènes.
 *
 * Replié par défaut, comme les allergènes, et pour la même raison : la
 * plupart des plats n'ont qu'un prix, et quatre lignes de saisie ouvertes
 * sous chacun feraient d'une carte de trente plats un formulaire de cent
 * vingt champs.
 *
 * Les lignes sont posées d'avance et les vides sont ignorées à
 * l'enregistrement. Ça donne gratuitement la suppression : on efface la
 * ligne, on enregistre, et tout effacer ramène le plat à son prix unique.
 *
 * Le formulaire reste soumissible sans JavaScript — c'est une action
 * serveur, et le tableau de bord se tient souvent sur le téléphone du
 * gérant, en salle, avec un réseau qui va et vient. Le JavaScript ne sert
 * qu'à afficher le refus : une saisie à moitié remplie doit être dite,
 * pas avalée en silence.
 */

/** Le prix tel qu'on le retape : « 9,50 », pas « 950 ». */
function enEuros(centimes: number): string {
  return (centimes / 100).toFixed(2).replace(".", ",");
}

function Lignes({ formats, c }: { formats: Format[] | null; c: ClesCarte }) {
  const remplies = formats ?? [];
  const vides = Math.max(1, FORMATS_MAX - remplies.length);
  const lignes: (Format | undefined)[] = [
    ...remplies,
    ...Array.from({ length: vides }, () => undefined),
  ].slice(0, FORMATS_MAX);

  return (
    <>
      {lignes.map((format, rang) => (
        <div key={rang} className="flex items-center gap-2">
          <input
            name="format_libelle"
            defaultValue={format?.libelle ?? ""}
            maxLength={FORMAT_LIBELLE_MAX}
            placeholder={rang === 0 ? "6 pièces" : "12 pièces"}
            aria-label={c.libelleFormat(rang + 1)}
            className="min-w-0 flex-1 rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-brand-navy"
          />
          <input
            name="format_prix"
            inputMode="decimal"
            defaultValue={format ? enEuros(format.prix_centimes) : ""}
            placeholder="9,50"
            aria-label={c.prixFormat(rang + 1)}
            className="w-24 shrink-0 rounded-md border border-zinc-300 px-2 py-1.5 text-sm tabular-nums outline-none focus:border-brand-navy"
          />
        </div>
      ))}
    </>
  );
}

export function FormatsPlat({
  restaurantId,
  plat,
  langue,
}: {
  restaurantId: string;
  plat: { id: string; nom: string; formats: Format[] | null };
  langue: Langue;
}) {
  const c = CARTE[langue];
  const [state, action, pending] = useActionState(
    enregistrerFormats,
    FORMATS_INITIAL,
  );
  const formats = formatsDe(plat);

  return (
    <details className="w-full" open={state.error !== null}>
      <summary className="flex cursor-pointer list-none items-center gap-2 text-xs text-zinc-400 transition-colors hover:text-brand-navy">
        <span aria-hidden="true">▸</span>
        {formats ? (
          <span className="text-xs text-zinc-500">
            {formatsLisibles(formats)}
          </span>
        ) : (
          <span className="text-xs text-zinc-400">{c.formatsPrixUnique}</span>
        )}
      </summary>

      <form
        action={action}
        className="mt-2 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3"
      >
        <input type="hidden" name="restaurant_id" value={restaurantId} />
        <input type="hidden" name="id" value={plat.id} />

        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs text-zinc-500">
            {c.formatsDe(plat.nom)}
          </legend>
          {/* Voir PlatForm : React vide le formulaire après l'action, la
              clé le remonte avec ce qui vient d'être enregistré. */}
          <Lignes key={state.rendu} formats={formats} c={c} />
        </fieldset>

        {state.error && <p className="text-xs text-red-600">{state.error}</p>}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="w-fit rounded-md bg-brand-navy px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
          >
            {pending ? c.enregistrementEnCours : c.enregistrerFormats}
          </button>
          <span className="text-xs text-zinc-400">
            {c.formatsPrennentLaPlace}
          </span>
        </div>
      </form>
    </details>
  );
}
