"use client";

import { useActionState, useState } from "react";
import {
  creerCampagne,
  enregistrerCampagne,
  type CampagneState,
} from "@/app/dashboard/[id]/campagnes/actions";
import {
  LIBELLE_SEGMENT,
  EXPLICATION_SEGMENT,
  SEGMENTS,
  type Segment,
} from "@/lib/campagnes/cibles";
import { OBJET_MAX, TEXTE_MAX } from "@/lib/campagnes/regles";

const initial: CampagneState = { error: null, message: null };

export type Valeurs = {
  objet: string;
  texte: string;
  boutonLibelle: string;
  boutonUrl: string;
  segment: Segment;
};

const VIDE: Valeurs = {
  objet: "",
  texte: "",
  boutonLibelle: "",
  boutonUrl: "",
  segment: "tous",
};

/**
 * Rédiger une campagne.
 *
 * Le compteur du segment est la pièce qui compte. Un restaurateur qui
 * écrit « Tout le fichier » imagine ses huit cents clients ; il en a cent
 * dix-huit qui ont coché la case. Lui montrer le vrai nombre pendant
 * qu'il écrit vaut mieux que de le lui apprendre après l'envoi — et ça
 * lui donne une raison de faire cocher la case.
 */
export function FormulaireCampagne({
  restaurantId,
  campagneId,
  valeurs = VIDE,
  compteurs,
  modifiable = true,
}: {
  restaurantId: string;
  /** Absent en création : l'action crée puis redirige vers l'édition. */
  campagneId?: string;
  valeurs?: Valeurs;
  /** Combien de personnes recevraient, par segment, à cet instant. */
  compteurs: Record<Segment, number>;
  /** Faux dès que la campagne est partie : on ne réécrit pas l'histoire. */
  modifiable?: boolean;
}) {
  const [state, action, pending] = useActionState(
    campagneId ? enregistrerCampagne : creerCampagne,
    initial,
  );
  const [objet, setObjet] = useState(valeurs.objet);
  const [texte, setTexte] = useState(valeurs.texte);
  const [segment, setSegment] = useState<Segment>(valeurs.segment);
  const [boutonLibelle, setBoutonLibelle] = useState(valeurs.boutonLibelle);

  const champ =
    "rounded-md border border-zinc-300 px-3 py-2 text-sm font-normal outline-none focus:border-brand-navy disabled:bg-zinc-50 disabled:text-zinc-500";
  const trop = texte.length > TEXTE_MAX || objet.length > OBJET_MAX;

  return (
    <form
      action={action}
      className="flex max-w-2xl flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5"
    >
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      {campagneId && (
        <input type="hidden" name="campagne_id" value={campagneId} />
      )}

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        L&apos;objet
        <input
          name="objet"
          value={objet}
          onChange={(e) => setObjet(e.target.value)}
          disabled={!modifiable}
          placeholder="Notre carte d'automne arrive lundi"
          className={champ}
        />
        <span
          className={`text-xs font-normal ${objet.length > OBJET_MAX ? "text-red-600" : "text-zinc-500"}`}
        >
          {objet.length} / {OBJET_MAX} caractères — c&apos;est la seule phrase
          que tout le monde lira.
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Le message
        <textarea
          name="texte"
          rows={10}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          disabled={!modifiable}
          placeholder={
            "Bonjour,\n\nNotre carte d'automne arrive lundi : gibier, champignons, et la tarte aux quetsches de la maison.\n\nÀ très vite,"
          }
          className={champ}
        />
        <span
          className={`text-xs font-normal ${texte.length > TEXTE_MAX ? "text-red-600" : "text-zinc-500"}`}
        >
          {texte.length} / {TEXTE_MAX} caractères. Une ligne vide sépare deux
          paragraphes. Votre nom signe le message, inutile de le répéter.
        </span>
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-700">À qui</span>
        <div className="flex flex-col gap-1.5">
          {SEGMENTS.map((cle) => (
            <label
              key={cle}
              className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2 transition-colors ${
                segment === cle
                  ? "border-brand-orange bg-brand-orange-soft"
                  : "border-zinc-200 hover:border-zinc-300"
              }`}
            >
              <input
                type="radio"
                name="segment"
                value={cle}
                checked={segment === cle}
                onChange={() => setSegment(cle)}
                disabled={!modifiable}
                className="mt-1"
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-zinc-800">
                  {LIBELLE_SEGMENT[cle]}{" "}
                  <span className="font-normal text-zinc-500">
                    — {compteurs[cle]} personne
                    {compteurs[cle] > 1 ? "s" : ""}
                  </span>
                </span>
                <span className="text-xs text-zinc-500">
                  {EXPLICATION_SEGMENT[cle]}
                </span>
              </span>
            </label>
          ))}
        </div>
        {compteurs.tous === 0 && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
            Personne n&apos;a encore accepté vos e-mails. Vous pouvez écrire la
            campagne, elle partira quand le fichier se remplira — la case est
            proposée à chaque réservation.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Un bouton{" "}
          <span className="font-normal text-zinc-400">(facultatif)</span>
          <input
            name="bouton_libelle"
            value={boutonLibelle}
            onChange={(e) => setBoutonLibelle(e.target.value)}
            disabled={!modifiable}
            placeholder="Réserver une table"
            className={champ}
          />
        </label>
        {boutonLibelle.trim() && (
          <label className="flex min-w-60 flex-1 flex-col gap-1 text-sm font-medium text-zinc-700">
            Vers quelle adresse
            <input
              name="bouton_url"
              type="url"
              defaultValue={valeurs.boutonUrl}
              disabled={!modifiable}
              placeholder="https://www.klarr.net/reserver/..."
              className={champ}
            />
          </label>
        )}
      </div>

      {modifiable && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending || trop}
            className="w-fit rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
          >
            {pending
              ? "Enregistrement…"
              : campagneId
                ? "Enregistrer"
                : "Créer le brouillon"}
          </button>
          {state.error ? (
            <p className="text-sm text-red-600" role="alert">
              {state.error}
            </p>
          ) : (
            state.message && (
              <p className="text-sm text-emerald-700">{state.message}</p>
            )
          )}
        </div>
      )}
    </form>
  );
}
