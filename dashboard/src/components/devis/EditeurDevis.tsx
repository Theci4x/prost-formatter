"use client";

import { useActionState, useState } from "react";
import {
  enregistrerDevis,
  enregistrerPrestation,
  envoyerDevis,
  oublierPrestation,
  type DevisState,
} from "@/app/dashboard/[id]/devis/actions";
import {
  calculer,
  enCentimes,
  enQuantite,
  formatEuros,
  formatTaux,
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
 * Le taux de TVA vit sur la ligne, et non sur le devis. Un menu à 10 % et
 * un forfait boissons à 20 % dans la même proposition est le cas normal,
 * et c'est la ventilation par taux que le document doit montrer.
 *
 * Les lignes voyagent en JSON dans un champ caché. Un tableau de champs
 * indexés se décale dès qu'on supprime une ligne au milieu, et la
 * troisième ligne devient la deuxième sans que personne ne s'en aperçoive.
 */

type LigneSaisie = {
  libelle: string;
  quantite: string;
  prix: string;
  tva: number;
};

/** Une prestation du catalogue, prête à devenir une ligne. */
export type PrestationConnue = {
  id: string;
  libelle: string;
  prix: string;
  tva: number;
};

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
      tauxTva: ligne.tva,
    }));
}

function vide(ligne: LigneSaisie): boolean {
  return !ligne.libelle.trim() && !ligne.prix.trim();
}

function Etoile() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.4l6.1-.9z" />
    </svg>
  );
}

export function EditeurDevis({
  devisId,
  restaurantId,
  lignesInitiales,
  tauxParDefaut,
  acompteInitial,
  valideJusquauInitial,
  messageInitial,
  mentionsInitiales,
  prestations,
  couverts,
  modifiable,
}: {
  devisId: string;
  restaurantId: string;
  lignesInitiales: LigneSaisie[];
  /** Le taux proposé pour une ligne neuve : celui qui domine la maison. */
  tauxParDefaut: number;
  acompteInitial: string;
  valideJusquauInitial: string;
  messageInitial: string;
  mentionsInitiales: string;
  /** Le catalogue de la maison, du plus récemment servi au moins. */
  prestations: PrestationConnue[];
  /** Le nombre de convives demandé : la quantité la plus probable. */
  couverts: number;
  /** Faux une fois le devis accepté : on ne réécrit pas ce qui est signé. */
  modifiable: boolean;
}) {
  const [lignes, setLignes] = useState<LigneSaisie[]>(
    lignesInitiales.length > 0
      ? lignesInitiales
      : [
          {
            libelle: "",
            quantite: String(couverts),
            prix: "",
            tva: tauxParDefaut,
          },
        ],
  );
  const [acompte, setAcompte] = useState(acompteInitial);

  const [etatEnregistre, actionEnregistrer, enregistrement] = useActionState(
    enregistrerDevis,
    initial,
  );
  const [etatEnvoye, actionEnvoyer, envoi] = useActionState(
    envoyerDevis,
    initial,
  );
  const [etatCatalogue, actionCatalogue, ajoutCatalogue] = useActionState(
    enregistrerPrestation,
    initial,
  );
  const [etatOubli, actionOublier] = useActionState(oublierPrestation, initial);

  const totaux = calculer(versLignes(lignes));
  const occupe = enregistrement || envoi || ajoutCatalogue;
  const etat = etatEnvoye.erreur
    ? etatEnvoye
    : etatCatalogue.erreur
      ? etatCatalogue
      : etatOubli.erreur
        ? etatOubli
        : etatEnregistre;

  function modifier(
    rang: number,
    champModifie: keyof LigneSaisie,
    valeur: string | number,
  ) {
    setLignes((avant) =>
      avant.map((ligne, i) =>
        i === rang ? { ...ligne, [champModifie]: valeur } : ligne,
      ),
    );
  }

  /**
   * Une prestation du catalogue devient une ligne. Elle remplace la ligne
   * en cours si celle-ci est encore vierge : sinon, cliquer sur une
   * formule au tout début d'un devis laisserait une ligne blanche en tête.
   */
  function reprendre(prestation: PrestationConnue) {
    const neuve: LigneSaisie = {
      libelle: prestation.libelle,
      quantite: String(couverts),
      prix: prestation.prix,
      tva: prestation.tva,
    };
    setLignes((avant) => {
      const dernier = avant[avant.length - 1];
      if (dernier && vide(dernier)) {
        return [...avant.slice(0, -1), neuve];
      }
      return [...avant, neuve];
    });
  }

  return (
    <form className="flex flex-col gap-6">
      <input type="hidden" name="devis_id" value={devisId} />
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      <input type="hidden" name="lignes" value={JSON.stringify(lignes)} />

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-2xl text-ink">Le détail</h2>

        {/* Le catalogue avant la saisie : un restaurateur qui propose
            trois formules toute l'année n'a pas à les retaper. */}
        {modifiable && prestations.length > 0 && (
          <div className="flex flex-col gap-2 rounded-xl border border-line bg-brand-cream p-3">
            <span className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-soft">
              Tes prestations
            </span>
            <div className="flex flex-wrap gap-2">
              {prestations.map((prestation) => (
                <span
                  key={prestation.id}
                  className="flex items-stretch overflow-hidden rounded-lg border border-line bg-paper"
                >
                  <button
                    type="button"
                    onClick={() => reprendre(prestation)}
                    className="px-3 py-1.5 text-sm text-ink transition-colors hover:bg-brand-sand"
                  >
                    {prestation.libelle}{" "}
                    <span className="text-ink-soft">
                      · {prestation.prix} € · {formatTaux(prestation.tva)}
                    </span>
                  </button>
                  <button
                    formAction={actionOublier}
                    name="prestation_id"
                    value={prestation.id}
                    aria-label={`Retirer ${prestation.libelle} du catalogue`}
                    className="border-l border-line px-2 text-ink-soft transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

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
                  className={`${champ} w-full basis-full sm:w-auto sm:flex-1 sm:basis-40`}
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
                {/* Le taux se choisit ici, ligne par ligne : la nourriture
                    consommée sur place est à 10 %, l'alcool à 20 %, et les
                    deux figurent dans la même privatisation. */}
                <select
                  value={ligne.tva}
                  onChange={(e) =>
                    modifier(rang, "tva", Number(e.target.value))
                  }
                  aria-label="Taux de TVA"
                  disabled={!modifiable}
                  className={`${champ} w-[5.5rem] shrink-0`}
                >
                  {TAUX_TVA.map((taux) => (
                    <option key={taux} value={taux}>
                      {formatTaux(taux)}
                    </option>
                  ))}
                </select>
                <span className="w-24 shrink-0 text-right text-sm font-semibold tabular-nums text-ink">
                  {total === null ? "—" : formatEuros(total)}
                </span>
                {modifiable && (
                  <button
                    formAction={actionCatalogue}
                    name="rang"
                    value={rang}
                    disabled={occupe || vide(ligne)}
                    title="Enregistrer dans mes prestations"
                    aria-label={`Enregistrer la ligne ${rang + 1} dans mes prestations`}
                    className="shrink-0 rounded-lg p-2 text-ink-soft transition-colors hover:text-brand-orange-dark disabled:opacity-30"
                  >
                    <Etoile />
                  </button>
                )}
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
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setLignes((avant) => [
                  ...avant,
                  { libelle: "", quantite: "1", prix: "", tva: tauxParDefaut },
                ])
              }
              className="w-fit rounded-lg border border-line bg-paper px-3 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink"
            >
              Ajouter une ligne
            </button>
            <span className="text-xs text-ink-soft">
              <span className="inline-block align-middle">
                <Etoile />
              </span>{" "}
              enregistre une ligne dans tes prestations, pour la reprendre au
              prochain devis.
            </span>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-5">
        <div className="flex items-center justify-between text-sm text-ink-soft">
          <span>Total HT</span>
          <span className="tabular-nums">{formatEuros(totaux.htCentimes)}</span>
        </div>
        {/* Une ligne par taux : c'est ce que portera le document, et ce que
            le comptable ventilera. */}
        {totaux.ventilation.map((assiette) => (
          <div
            key={assiette.taux}
            className="flex items-center justify-between gap-4 text-sm text-ink-soft"
          >
            <span>
              TVA {formatTaux(assiette.taux)}
              {totaux.ventilation.length > 1 && (
                <span className="text-xs">
                  {" "}
                  sur {formatEuros(assiette.htCentimes)} HT
                </span>
              )}
            </span>
            <span className="tabular-nums">
              {formatEuros(assiette.tvaCentimes)}
            </span>
          </div>
        ))}
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
          Ton mot d&apos;accompagnement
          <textarea
            name="message"
            defaultValue={messageInitial}
            rows={4}
            placeholder="Ce qui est compris, ce qui ne l'est pas, une précision sur l'horaire…"
            disabled={!modifiable}
            className={`${champ} w-full`}
          />
          <span className="text-xs font-normal text-ink-soft">
            Il apparaît dans l&apos;e-mail et sur le devis. Propre à ce devis.
          </span>
        </label>

        {/* Un devis est un document contractuel : il porte l'identité de
            l'entreprise et ses conditions. Le texte appartient à la maison
            et sert tous ses devis — mais il se fige sur celui-ci à
            l'envoi, pour qu'un devis signé reste ce qu'il était. */}
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Tes mentions légales et conditions
          <textarea
            name="mentions"
            defaultValue={mentionsInitiales}
            rows={6}
            placeholder={
              "SARL Au Bon Accueil au capital de 10 000 € — 12 rue des Halles, 75001 Paris\nSIRET 000 000 000 00000 — RCS Paris — TVA FR00000000000\n\nAcompte de 30 % à la commande, solde le jour de la prestation.\nAnnulation sans frais jusqu'à 30 jours avant l'événement ; au-delà, l'acompte reste acquis."
            }
            disabled={!modifiable}
            className={`${champ} w-full text-xs leading-relaxed`}
          />
          <span className="text-xs font-normal text-ink-soft">
            Communes à tous tes devis : tu ne les écris qu&apos;une fois. Elles
            s&apos;impriment en pied de document.
          </span>
        </label>
      </section>

      {etat.erreur && (
        <p className="text-sm text-red-600" role="alert">
          {etat.erreur}
        </p>
      )}
      {!etat.erreur && etatCatalogue.enregistre && (
        <p className="text-sm text-emerald-700">
          Prestation enregistrée. Le devis, lui, n&apos;est pas encore
          enregistré.
        </p>
      )}
      {!etat.erreur && etatEnvoye.enregistre && (
        <p className="text-sm text-emerald-700">Devis envoyé au client.</p>
      )}
      {!etat.erreur &&
        etatEnregistre.enregistre &&
        !etatEnvoye.enregistre &&
        !etatCatalogue.enregistre && (
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
