"use client";

import { useActionState, useState } from "react";
import {
  addEspace,
  modifierEspace,
  type EspaceState,
} from "@/app/dashboard/[id]/reservations/actions";
import {
  ESPACE_VIDE,
  type Espace,
  type EspaceValeurs,
} from "@/types/reservation";

const initialState: EspaceState = {
  error: null,
  rendu: 0,
  valeurs: ESPACE_VIDE,
};

const GARANTIES = [
  {
    valeur: "aucune" as const,
    titre: "Aucune",
    aide: "Le client réserve sans rien avancer.",
  },
  {
    valeur: "acompte" as const,
    titre: "Acompte",
    aide: "Il paie une somme d'avance, encaissée sur ton compte Stripe.",
  },
  {
    valeur: "caution" as const,
    titre: "Carte en garantie",
    aide: "Rien n'est prélevé : tu ne débites qu'en cas de défection.",
  },
];

const champ =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy";
const label = "flex flex-col gap-1 text-sm font-medium text-zinc-700";

function Champs({
  restaurantId,
  valeurs,
  // Les deux formulaires — ajout et modification — cohabitent sur la même
  // page : sans préfixe, un « label for » désignerait le champ de l'autre.
  prefixe = "espace",
  espaceId,
}: {
  restaurantId: string;
  valeurs: EspaceValeurs;
  prefixe?: string;
  espaceId?: string;
}) {
  // Le minimum de privatisation n'a de sens que si l'espace se privatise :
  // afficher le champ en permanence ferait croire qu'il est obligatoire.
  const [privatisable, setPrivatisable] = useState(valeurs.privatisable);
  const [garantie, setGarantie] = useState(valeurs.garantie);

  return (
    <>
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      {espaceId && (
        <input type="hidden" name="espace_id" value={espaceId} />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label} htmlFor={`${prefixe}-nom`}>
          Nom de l&apos;espace
          <input
            id={`${prefixe}-nom`}
            name="nom"
            required
            defaultValue={valeurs.nom}
            placeholder="Salle du bas"
            className={champ}
          />
        </label>
        <label className={label} htmlFor={`${prefixe}-capacite`}>
          Capacité (couverts)
          <input
            id={`${prefixe}-capacite`}
            name="capacite"
            type="number"
            min="1"
            required
            defaultValue={valeurs.capacite}
            placeholder="40"
            className={champ}
          />
        </label>
      </div>

      <label className={label} htmlFor={`${prefixe}-description`}>
        Description{" "}
        <span className="font-normal text-zinc-400">(facultatif)</span>
        <input
          id={`${prefixe}-description`}
          name="description"
          defaultValue={valeurs.description}
          placeholder="Salle voûtée en sous-sol, accès indépendant"
          className={champ}
        />
      </label>

      <div className="flex flex-col gap-3 rounded-xl bg-zinc-50 p-4">
        <label className="flex items-start gap-2.5 text-sm text-zinc-700">
          <input
            type="checkbox"
            name="accepte_table"
            defaultChecked={valeurs.accepteTable}
            className="mt-0.5"
          />
          <span>
            <span className="font-medium">Réservations individuelles</span> —
            plusieurs groupes partagent l&apos;espace en même temps, dans la
            limite de la capacité.
          </span>
        </label>

        <label className="flex items-start gap-2.5 text-sm text-zinc-700">
          <input
            type="checkbox"
            name="privatisable"
            checked={privatisable}
            onChange={(event) => setPrivatisable(event.target.checked)}
            className="mt-0.5"
          />
          <span>
            <span className="font-medium">Privatisation</span> — un seul groupe
            occupe l&apos;espace entier sur le créneau.
          </span>
        </label>

        {privatisable && (
          <>
            <label className={`${label} pl-7`} htmlFor={`${prefixe}-minimum`}>
              À partir de combien de couverts ?
              <input
                id={`${prefixe}-minimum`}
                name="privatisation_minimum"
                type="number"
                min="1"
                defaultValue={valeurs.minimum}
                className={`${champ} max-w-32`}
              />
              <span className="text-xs font-normal text-zinc-500">
                Une demande en dessous de ce nombre sera refusée
                automatiquement.
              </span>
            </label>

            <fieldset className="flex flex-col gap-2 pl-7">
              <legend className="mb-1 text-sm font-medium text-zinc-700">
                Garantie demandée au client
              </legend>

              {/* Un seul choix : réclamer un acompte ET une caution au même
                  client serait une maladresse commerciale, pas une sécurité
                  de plus. */}
              {GARANTIES.map((choix) => (
                <label
                  key={choix.valeur}
                  className="flex items-start gap-2.5 text-sm text-zinc-700"
                >
                  <input
                    type="radio"
                    name="garantie"
                    value={choix.valeur}
                    checked={garantie === choix.valeur}
                    onChange={() => setGarantie(choix.valeur)}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-medium">{choix.titre}</span>
                    <span className="block text-xs text-zinc-500">
                      {choix.aide}
                    </span>
                  </span>
                </label>
              ))}

              {garantie === "acompte" && (
                <div className="flex flex-wrap items-center gap-2 pl-7">
                  <input
                    id={`${prefixe}-acompte`}
                    name="acompte"
                    inputMode="decimal"
                    defaultValue={valeurs.acompte}
                    placeholder="500"
                    aria-label="Montant de l'acompte en euros"
                    className={`${champ} max-w-32`}
                  />
                  <span className="text-sm text-zinc-500">€</span>
                  <select
                    name="acompte_mode"
                    defaultValue={valeurs.acompteMode}
                    aria-label="Mode de calcul de l'acompte"
                    className={`${champ} max-w-56`}
                  >
                    <option value="forfait">au total</option>
                    <option value="par_couvert">par couvert</option>
                  </select>
                </div>
              )}

              {garantie === "caution" && (
                <div className="flex flex-col gap-2 pl-7">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      id={`${prefixe}-caution`}
                      name="caution"
                      inputMode="decimal"
                      defaultValue={valeurs.caution}
                      placeholder="1000"
                      aria-label="Plafond de la caution en euros"
                      className={`${champ} max-w-32`}
                    />
                    <span className="text-sm text-zinc-500">€</span>
                    {/* Par convive le plus souvent : c'est le nombre de
                        personnes qui fait le risque, pas la pièce. */}
                    <select
                      name="caution_mode"
                      defaultValue={valeurs.cautionMode}
                      aria-label="Mode de calcul de la caution"
                      className={`${champ} max-w-56`}
                    >
                      <option value="forfait">au total</option>
                      <option value="par_couvert">par personne</option>
                    </select>
                  </div>
                  <span className="text-xs text-zinc-500">
                    Débitables seulement si le groupe ne vient pas. Rien
                    n&apos;est prélevé à la réservation.
                  </span>
                </div>
              )}

              {garantie !== "aucune" && (
                <div className="flex flex-wrap items-center gap-2 pl-7">
                  <label
                    className="text-sm text-zinc-700"
                    htmlFor={`${prefixe}-seuil`}
                  >
                    À partir de
                  </label>
                  <input
                    id={`${prefixe}-seuil`}
                    name="garantie_seuil"
                    inputMode="numeric"
                    defaultValue={valeurs.seuil}
                    placeholder="20"
                    aria-label="Nombre de convives à partir duquel la garantie s'applique"
                    className={`${champ} max-w-24`}
                  />
                  <span className="text-sm text-zinc-500">
                    convives. En dessous, rien n&apos;est demandé.
                  </span>
                </div>
              )}
            </fieldset>

            {/* Le minimum de consommation n'est pas une garantie : rien
                n'est encaissé ni bloqué. C'est un engagement annoncé, qui
                s'honore à table — et qui doit donc se lire avant de
                réserver, pas se découvrir à l'addition. */}
            <label className={label} htmlFor={`${prefixe}-minimum-conso`}>
              Minimum de consommation{" "}
              <span className="font-normal text-zinc-400">(facultatif)</span>
              <span className="flex flex-wrap items-center gap-2">
                <input
                  id={`${prefixe}-minimum-conso`}
                  name="minimum_consommation"
                  inputMode="decimal"
                  defaultValue={valeurs.minimumConsommation}
                  placeholder="1000"
                  className={`${champ} max-w-32`}
                />
                <span className="text-sm text-zinc-500">€</span>
                <select
                  name="minimum_consommation_tva"
                  defaultValue={valeurs.minimumConsommationHt ? "ht" : "ttc"}
                  className={`${champ} max-w-28`}
                >
                  <option value="ht">HT</option>
                  <option value="ttc">TTC</option>
                </select>
              </span>
              <span className="text-xs font-normal text-zinc-500">
                Le client s&apos;engage à consommer au moins ce montant. Rien
                n&apos;est encaissé : c&apos;est annoncé avant la
                réservation, et ça se règle à l&apos;addition. Une
                privatisation d&apos;entreprise se négocie en HT, un
                anniversaire en TTC.
              </span>
            </label>
          </>
        )}
      </div>
    </>
  );
}

export function EspaceForm({ restaurantId }: { restaurantId: string }) {
  const [state, action, pending] = useActionState(addEspace, initialState);

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
    >
      {/* React vide de lui-même le formulaire après une action ; la clé le
          remonte avec les valeurs renvoyées — la saisie à corriger en cas
          d'erreur, un formulaire vierge après un enregistrement. */}
      <Champs
        key={state.rendu}
        restaurantId={restaurantId}
        valeurs={state.valeurs}
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
      >
        {pending ? "Enregistrement…" : "Ajouter cet espace"}
      </button>
    </form>
  );
}


/** Les valeurs du formulaire, telles qu'elles se lisent d'un espace en base. */
function valeursDe(espace: Espace): EspaceValeurs {
  const euros = (centimes: number | null) =>
    centimes ? (centimes / 100).toString().replace(".", ",") : "";
  return {
    nom: espace.nom,
    capacite: String(espace.capacite),
    description: espace.description ?? "",
    accepteTable: espace.accepte_table,
    privatisable: espace.privatisation_minimum !== null,
    minimum:
      espace.privatisation_minimum === null
        ? ""
        : String(espace.privatisation_minimum),
    acompte: euros(espace.acompte_centimes),
    acompteMode: espace.acompte_mode,
    caution: euros(espace.caution_centimes),
    cautionMode: espace.caution_mode ?? "forfait",
    seuil: espace.garantie_seuil_couverts
      ? String(espace.garantie_seuil_couverts)
      : "",
    minimumConsommation: euros(espace.minimum_consommation_centimes),
    minimumConsommationHt: espace.minimum_consommation_ht ?? true,
    garantie: espace.acompte_centimes
      ? "acompte"
      : espace.caution_centimes
        ? "caution"
        : "aucune",
  };
}

/**
 * Un espace modifiable sur place.
 *
 * Sans cet écran, la garantie ne se réglait qu'à la création : changer une
 * caution obligeait à supprimer l'espace et à le recréer, ce qui emportait
 * ses photos et détachait les réservations déjà prises dessus.
 */
export function EspaceModifiable({
  restaurantId,
  espace,
  children,
}: {
  restaurantId: string;
  espace: Espace;
  /** Ce qu'on affiche tant que le formulaire est fermé. */
  children: React.ReactNode;
}) {
  const [ouvertDepuis, setOuvertDepuis] = useState<number | null>(null);
  const [state, action, pending] = useActionState(modifierEspace, {
    error: null,
    rendu: 0,
    valeurs: valeursDe(espace),
  } as EspaceState);

  // Même raisonnement que pour les services : l'état ouvert se déduit du
  // rendu, pour qu'un enregistrement réussi referme le formulaire sans effet
  // de bord, et qu'un échec le laisse ouvert avec son message.
  const ouvert =
    ouvertDepuis !== null && !(state.rendu > ouvertDepuis && !state.error);

  if (!ouvert) {
    return (
      <div className="flex w-full flex-wrap items-start justify-between gap-4">
        {children}
        <button
          type="button"
          onClick={() => setOuvertDepuis(state.rendu)}
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
        >
          Modifier
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="flex w-full flex-col gap-4">
      <Champs
        key={state.rendu}
        restaurantId={restaurantId}
        espaceId={espace.id}
        prefixe={`mod-${espace.id}`}
        valeurs={state.valeurs}
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={() => setOuvertDepuis(null)}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          Fermer
        </button>
      </div>
    </form>
  );
}
