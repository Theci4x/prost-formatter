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
import type { Langue } from "@/lib/i18n/langues";
import { COMMUN, traducteur, type T } from "@/lib/i18n/t";
import { CAMPAGNES } from "@/lib/i18n/pages/campagnes";

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
  maison,
  langue,
}: {
  langue: Langue;
  restaurantId: string;
  /** Absent en création : l'action crée puis redirige vers l'édition. */
  campagneId?: string;
  valeurs?: Valeurs;
  /** Combien de personnes recevraient, par segment, à cet instant. */
  compteurs: Record<Segment, number>;
  /** Faux dès que la campagne est partie : on ne réécrit pas l'histoire. */
  modifiable?: boolean;
  /** Le nom qui signe le message, pour l'aperçu. */
  maison?: string;
}) {
  const t = traducteur(langue, CAMPAGNES, COMMUN);
  const [state, action, pending] = useActionState(
    campagneId ? enregistrerCampagne : creerCampagne,
    initial,
  );
  const [objet, setObjet] = useState(valeurs.objet);
  const [texte, setTexte] = useState(valeurs.texte);
  const [segment, setSegment] = useState<Segment>(valeurs.segment);
  const [boutonLibelle, setBoutonLibelle] = useState(valeurs.boutonLibelle);

  const champ =
    "w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-normal outline-none transition-colors focus:border-brand-navy focus:bg-white disabled:text-zinc-500";
  const trop = texte.length > TEXTE_MAX || objet.length > OBJET_MAX;

  return (
    <form
      action={action}
      className="grid gap-8 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm sm:p-7 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]"
    >
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      {campagneId && (
        <input type="hidden" name="campagne_id" value={campagneId} />
      )}

      <div className="flex min-w-0 flex-col gap-6">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
          {t("L'objet")}
          <input
            name="objet"
            value={objet}
            onChange={(e) => setObjet(e.target.value)}
            disabled={!modifiable}
            placeholder={t("Notre carte d'automne arrive lundi")}
            className={`${champ} text-base`}
          />
          <span
            className={`text-xs font-normal ${objet.length > OBJET_MAX ? "text-red-600" : "text-zinc-500"}`}
          >
            {t(
              "{n} / {max} caractères — c'est la seule phrase que tout le monde lira.",
              { n: objet.length, max: OBJET_MAX },
            )}
          </span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
          {t("Le message")}
          <textarea
            name="texte"
            rows={11}
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            disabled={!modifiable}
            placeholder={t(
              "Bonjour,\n\nNotre carte d'automne arrive lundi : gibier, champignons, et la tarte aux quetsches de la maison.\n\nÀ très vite,",
            )}
            className={`${champ} leading-relaxed`}
          />
          <span
            className={`text-xs font-normal ${texte.length > TEXTE_MAX ? "text-red-600" : "text-zinc-500"}`}
          >
            {t(
              "{n} / {max} caractères. Une ligne vide sépare deux paragraphes. Votre nom signe le message, inutile de le répéter.",
              { n: texte.length, max: TEXTE_MAX },
            )}
          </span>
        </label>

        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-2.5 text-sm font-semibold text-ink">
            {t("À qui")}
          </legend>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {SEGMENTS.map((cle) => (
              <label
                key={cle}
                className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-4 transition-colors ${
                  segment === cle
                    ? "border-brand-orange bg-brand-orange-soft"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <input
                      type="radio"
                      name="segment"
                      value={cle}
                      checked={segment === cle}
                      onChange={() => setSegment(cle)}
                      disabled={!modifiable}
                      className="accent-brand-orange"
                    />
                    {t(LIBELLE_SEGMENT[cle])}
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="font-serif text-2xl leading-none text-ink">
                      {compteurs[cle]}
                    </span>
                    <span className="block text-[11px] text-zinc-500">
                      {t(compteurs[cle] > 1 ? "personnes" : "personne")}
                    </span>
                  </span>
                </span>
                <span className="text-xs leading-relaxed text-zinc-500">
                  {t(EXPLICATION_SEGMENT[cle])}
                </span>
              </label>
            ))}
          </div>
          {compteurs.tous === 0 && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
              {t(
                "Personne n'a encore accepté tes e-mails. Tu peux écrire la campagne, elle partira quand le fichier se remplira — la case est proposée à chaque réservation.",
              )}
            </p>
          )}
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
            <span>
              {t("Un bouton")}{" "}
              <span className="font-normal text-zinc-400">
                {t("(facultatif)")}
              </span>
            </span>
            <input
              name="bouton_libelle"
              value={boutonLibelle}
              onChange={(e) => setBoutonLibelle(e.target.value)}
              disabled={!modifiable}
              placeholder={t("Réserver une table")}
              className={champ}
            />
          </label>
          {boutonLibelle.trim() && (
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
              {t("Vers quelle adresse")}
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
          <div className="flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-5">
            <button
              type="submit"
              disabled={pending || trop}
              className="w-fit rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
            >
              {pending
                ? t("Enregistrement…")
                : campagneId
                  ? t("Enregistrer")
                  : t("Créer le brouillon")}
            </button>
            {state.error ? (
              <p className="text-sm text-red-600" role="alert">
                {t(state.error)}
              </p>
            ) : (
              state.message && (
                <p className="text-sm text-emerald-700">{t(state.message)}</p>
              )
            )}
          </div>
        )}
      </div>

      <Apercu
        t={t}
        maison={maison ?? t("Votre restaurant")}
        objet={objet}
        texte={texte}
        bouton={boutonLibelle}
      />
    </form>
  );
}

/**
 * Le message tel que le client le recevra, pendant qu'on l'écrit : la
 * même carte que l'envoi réel (`enveloppe`), le nom de la maison en tête,
 * le lien de désinscription en pied. On juge un e-mail sur ce qu'il a
 * l'air d'être, pas sur un champ de texte.
 */
function Apercu({
  t,
  maison,
  objet,
  texte,
  bouton,
}: {
  t: T;
  maison: string;
  objet: string;
  texte: string;
  bouton: string;
}) {
  const paragraphes = texte
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <div className="flex min-w-0 flex-col gap-3 xl:sticky xl:top-24 xl:self-start">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {t("Aperçu")}
      </span>
      <div className="overflow-hidden rounded-2xl border border-zinc-200/70">
        <div className="flex flex-col gap-0.5 border-b border-zinc-200/70 bg-white px-5 py-3">
          <span className="text-xs text-zinc-500">{maison}</span>
          <span className="truncate text-sm font-semibold text-ink">
            {objet || (
              <span className="font-normal text-zinc-400">
                {t("L'objet de ton message")}
              </span>
            )}
          </span>
        </div>
        <div className="bg-brand-cream px-4 py-6 sm:px-6">
          <div className="rounded-xl border border-line bg-paper px-6 py-6">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-navy">
              {maison}
            </p>
            {paragraphes.length > 0 ? (
              paragraphes.map((p, i) => (
                <p
                  key={i}
                  className="mb-3 whitespace-pre-line text-[15px] leading-relaxed text-ink"
                >
                  {p}
                </p>
              ))
            ) : (
              <p className="mb-3 text-[15px] leading-relaxed text-zinc-400">
                {t("Votre message apparaîtra ici.")}
              </p>
            )}
            {bouton.trim() && (
              <span className="mt-2 inline-block rounded-lg bg-brand-navy px-6 py-3 text-sm font-semibold text-white">
                {bouton}
              </span>
            )}
          </div>
          <p className="mt-4 text-center text-[11px] leading-relaxed text-zinc-500">
            Vous recevez ce message parce que vous avez accepté les actualités
            de {maison} en réservant.
            <br />
            <span className="underline">Me désinscrire en un clic</span>
          </p>
        </div>
      </div>
    </div>
  );
}
