"use client";

import { useActionState, useState } from "react";
import {
  enregistrerDevis,
  envoyerDevis,
  type DevisState,
} from "@/app/dashboard/[id]/devis/actions";
import {
  calculer,
  enCentimes,
  enQuantite,
  formatEuros,
  TAUX_TVA,
  type Ligne,
} from "@/lib/devis/calcul";

/**
 * La composition d'un devis.
 *
 * Les totaux se recalculent à la frappe : un restaurateur qui compose une
 * privatisation ajuste un prix pour tomber sur un chiffre rond, et devoir
 * enregistrer pour voir le total lui ferait faire le calcul de tête —
 * donc à côté.
 *
 * Les lignes voyagent en JSON dans un champ caché. Un tableau de champs
 * indexés se décale dès qu'on supprime une ligne au milieu, et la
 * troisième ligne devient la deuxième sans que personne ne s'en aperçoive.
 */

type LigneSaisie = { libelle: string; quantite: string; prix: string };

const initial: DevisState = { erreur: null, enregistre: false };

const champ =
  "min-w-0 rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none transition-colors focus:border-brand-orange";

/** Ce qui est chiffrable est chiffré ; le reste vaut zéro le temps de la saisie. */
function versLignes(saisies: LigneSaisie[]): Ligne[] {
  return saisies
    .filter((ligne) => ligne.libelle.trim())
    .map((ligne) => ({
      libelle: ligne.libelle,
      quantite: enQuantite(ligne.quantite) ?? 0,
      prixUnitaireCentimes: enCentimes(ligne.prix) ?? 0,
    }));
}

export function EditeurDevis({
  devisId,
  restaurantId,
  lignesInitiales,
  tvaInitiale,
  acompteInitial,
  valideJusquauInitial,
  messageInitial,
  couverts,
  modifiable,
}: {
  devisId: string;
  restaurantId: string;
  lignesInitiales: LigneSaisie[];
  tvaInitiale: number;
  acompteInitial: string;
  valideJusquauInitial: string;
  messageInitial: string;
  /** Le nombre de convives demandé : la quantité la plus probable. */
  couverts: number;
  /** Faux une fois le devis accepté : on ne réécrit pas ce qui est signé. */
  modifiable: boolean;
}) {
  const [lignes, setLignes] = useState<LigneSaisie[]>(
    lignesInitiales.length > 0
      ? lignesInitiales
      : [{ libelle: "", quantite: String(couverts), prix: "" }],
  );
  const [tva, setTva] = useState(tvaInitiale);
  const [acompte, setAcompte] = useState(acompteInitial);

  const [etatEnregistre, actionEnregistrer, enregistrement] = useActionState(
    enregistrerDevis,
    initial,
  );
  const [etatEnvoye, actionEnvoyer, envoi] = useActionState(
    envoyerDevis,
    initial,
  );

  const totaux = calculer(versLignes(lignes), tva);
  const occupe = enregistrement || envoi;
  const etat = etatEnvoye.erreur ? etatEnvoye : etatEnregistre;

  function modifier(rang: number, champModifie: keyof LigneSaisie, valeur: string) {
    setLignes((avant) =>
      avant.map((ligne, i) =>
        i === rang ? { ...ligne, [champModifie]: valeur } : ligne,
      ),
    );
  }

  return (
    <form className="flex flex-col gap-6">
      <input type="hidden" name="devis_id" value={devisId} />
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      <input type="hidden" name="lignes" value={JSON.stringify(lignes)} />

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-2xl text-ink">Le détail</h2>

        <div className="flex flex-col gap-2">
          {lignes.map((ligne, rang) => {
            const quantite = enQuantite(ligne.quantite);
            const prix = enCentimes(ligne.prix);
            const total =
              quantite !== undefined && prix !== undefined
                ? Math.round(quantite * prix)
                : null;

            return (
              <div
                key={rang}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-paper p-3"
              >
                <input
                  value={ligne.libelle}
                  onChange={(e) => modifier(rang, "libelle", e.target.value)}
                  placeholder="Menu, mise à disposition, forfait boissons…"
                  disabled={!modifiable}
                  className={`${champ} w-full basis-full sm:w-auto sm:flex-1 sm:basis-64`}
                />
                <input
                  value={ligne.quantite}
                  onChange={(e) => modifier(rang, "quantite", e.target.value)}
                  inputMode="decimal"
                  aria-label="Quantité"
                  placeholder="30"
                  disabled={!modifiable}
                  className={`${champ} w-20 shrink-0`}
                />
                <span className="text-sm text-ink-soft">×</span>
                <input
                  value={ligne.prix}
                  onChange={(e) => modifier(rang, "prix", e.target.value)}
                  inputMode="decimal"
                  aria-label="Prix unitaire en euros"
                  placeholder="45,00"
                  disabled={!modifiable}
                  className={`${champ} w-24 shrink-0`}
                />
                <span className="w-24 shrink-0 text-right text-sm font-semibold tabular-nums text-ink">
                  {total === null ? "—" : formatEuros(total)}
                </span>
                {modifiable && lignes.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setLignes((avant) => avant.filter((_, i) => i !== rang))
                    }
                    aria-label={`Retirer la ligne ${rang + 1}`}
                    className="shrink-0 rounded-lg p-2 text-ink-soft transition-colors hover:text-red-600"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {modifiable && (
          <button
            type="button"
            onClick={() =>
              setLignes((avant) => [
                ...avant,
                { libelle: "", quantite: "1", prix: "" },
              ])
            }
            className="w-fit rounded-lg border border-line bg-paper px-3 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink"
          >
            Ajouter une ligne
          </button>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-5">
        <div className="flex items-center justify-between text-sm text-ink-soft">
          <span>Total HT</span>
          <span className="tabular-nums">{formatEuros(totaux.htCentimes)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm text-ink-soft">
          <label className="flex items-center gap-2">
            TVA
            <select
              name="tva"
              value={tva}
              onChange={(e) => setTva(Number(e.target.value))}
              disabled={!modifiable}
              className="rounded-lg border border-line bg-paper px-2 py-1 text-sm outline-none focus:border-brand-orange"
            >
              {TAUX_TVA.map((taux) => (
                <option key={taux} value={taux}>
                  {taux} %
                </option>
              ))}
            </select>
          </label>
          <span className="tabular-nums">{formatEuros(totaux.tvaCentimes)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-line pt-3">
          <span className="font-semibold text-ink">Total TTC</span>
          <span className="font-serif text-3xl text-ink">
            {formatEuros(totaux.ttcCentimes)}
          </span>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-2xl text-ink">Les conditions</h2>

        <div className="flex flex-wrap gap-4">
          <label className="flex min-w-0 flex-col gap-1 text-sm font-medium text-ink">
            Acompte à l&apos;acceptation
            <input
              name="acompte"
              value={acompte}
              onChange={(e) => setAcompte(e.target.value)}
              inputMode="decimal"
              placeholder="Laisser vide : rien à payer d'avance"
              disabled={!modifiable}
              className={`${champ} w-full sm:w-64`}
            />
            <span className="text-xs font-normal text-ink-soft">
              {acompte.trim() && totaux.ttcCentimes > 0
                ? `Soit ${Math.round(((enCentimes(acompte) ?? 0) / totaux.ttcCentimes) * 100)} % du total.`
                : "En euros. Le client le règle en acceptant le devis."}
            </span>
          </label>

          <label className="flex min-w-0 flex-col gap-1 text-sm font-medium text-ink">
            Valable jusqu&apos;au
            <input
              type="date"
              name="valide_jusquau"
              defaultValue={valideJusquauInitial}
              disabled={!modifiable}
              className={`${champ} w-full sm:w-48`}
            />
            <span className="text-xs font-normal text-ink-soft">
              Passé cette date, le devis ne s&apos;accepte plus.
            </span>
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Votre mot d&apos;accompagnement
          <textarea
            name="message"
            defaultValue={messageInitial}
            rows={4}
            placeholder="Ce qui est compris, ce qui ne l'est pas, une précision sur l'horaire…"
            disabled={!modifiable}
            className={`${champ} w-full`}
          />
          <span className="text-xs font-normal text-ink-soft">
            Il apparaît dans l&apos;e-mail et sur le devis.
          </span>
        </label>
      </section>

      {etat.erreur && (
        <p className="text-sm text-red-600" role="alert">
          {etat.erreur}
        </p>
      )}
      {!etat.erreur && etatEnvoye.enregistre && (
        <p className="text-sm text-emerald-700">
          Devis envoyé au client.
        </p>
      )}
      {!etat.erreur && etatEnregistre.enregistre && !etatEnvoye.enregistre && (
        <p className="text-sm text-emerald-700">Enregistré.</p>
      )}

      {modifiable && (
        <div className="flex flex-wrap gap-3">
          <button
            formAction={actionEnvoyer}
            disabled={occupe}
            className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy disabled:opacity-50"
          >
            {envoi ? "Envoi…" : "Enregistrer et envoyer au client"}
          </button>
          <button
            formAction={actionEnregistrer}
            disabled={occupe}
            className="rounded-lg border border-line bg-paper px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink disabled:opacity-50"
          >
            {enregistrement ? "Enregistrement…" : "Enregistrer seulement"}
          </button>
        </div>
      )}
    </form>
  );
}
