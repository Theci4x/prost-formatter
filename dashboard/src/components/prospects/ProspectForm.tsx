"use client";

import { useActionState } from "react";
import {
  confirmerEtablissement,
  submitProspect,
  type ProspectFormState,
} from "@/app/test-presence-google/actions";
import { AuditResultCard } from "@/components/prospects/AuditResultCard";
import { ChoixEtablissement } from "@/components/prospects/ChoixEtablissement";
import { BarreAnalyse } from "@/components/prospects/BarreAnalyse";
import type { translations, Lang } from "@/lib/i18n/testPresence";

const initialState: ProspectFormState = { status: "idle" };

type Translations = (typeof translations)[keyof typeof translations];

export function ProspectForm({
  t,
  auditT,
  langue,
}: {
  t: Translations["form"];
  auditT: Translations["audit"];
  /** Le rapport part dans la langue où la page a été lue. */
  langue: Lang;
}) {
  const [state, formAction, pending] = useActionState(
    submitProspect,
    initialState,
  );
  const [confirmation, confirmerAction, confirmationEnCours] = useActionState(
    confirmerEtablissement,
    initialState,
  );

  // Deux actions, un seul écran : dès que la confirmation a parlé, c'est
  // elle qui fait foi.
  const courant = confirmation.status === "idle" ? state : confirmation;

  if (courant.status === "success") {
    if (courant.audit) {
      return (
        <AuditResultCard
          audit={courant.audit}
          t={auditT}
          email={courant.email}
        />
      );
    }
    return (
      <div className="rounded-2xl border border-brand-orange/30 bg-brand-orange-soft px-6 py-8 text-center">
        <p className="font-serif text-2xl text-ink">{t.successTitle}</p>
        <p className="mt-2 text-sm text-ink-soft">{t.successBody}</p>
      </div>
    );
  }

  // Son nom désigne plusieurs endroits : plutôt que d'auditer celui d'un
  // autre, on lui demande. Ses coordonnées sont déjà enregistrées.
  if (state.status === "choix" && state.candidats) {
    return (
      <ChoixEtablissement
        t={t}
        action={confirmerAction}
        enCours={confirmationEnCours}
        candidats={state.candidats}
        prospectId={state.prospectId ?? ""}
        entreprise={state.entreprise ?? ""}
        ville={state.ville ?? ""}
        email={state.email ?? ""}
        prenom={state.prenom ?? ""}
        langue={state.langue ?? langue}
      />
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-2xl border border-line bg-paper p-6 shadow-[0_24px_60px_-40px_oklch(20%_0.02_60/35%)] sm:p-7"
    >
      <input type="hidden" name="langue" value={langue} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="prenom" className="text-sm font-medium text-ink">
            {t.prenom}
          </label>
          <input
            id="prenom"
            name="prenom"
            defaultValue={courant.valeurs?.prenom ?? ""}
            type="text"
            required
            className="rounded-lg border border-line bg-paper px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-orange"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nom" className="text-sm font-medium text-ink">
            {t.nom}
          </label>
          <input
            id="nom"
            name="nom"
            defaultValue={courant.valeurs?.nom ?? ""}
            type="text"
            required
            className="rounded-lg border border-line bg-paper px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-orange"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="entreprise" className="text-sm font-medium text-ink">
            {t.entreprise}
          </label>
          <input
            id="entreprise"
            name="entreprise"
            defaultValue={courant.valeurs?.entreprise ?? ""}
            type="text"
            required
            className="rounded-lg border border-line bg-paper px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-orange"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ville" className="text-sm font-medium text-ink">
            {t.ville}
          </label>
          <input
            id="ville"
            name="ville"
            defaultValue={courant.valeurs?.ville ?? ""}
            type="text"
            required
            className="rounded-lg border border-line bg-paper px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-orange"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-ink">
            {t.email}
          </label>
          <input
            id="email"
            name="email"
            defaultValue={courant.valeurs?.email ?? ""}
            type="email"
            required
            className="rounded-lg border border-line bg-paper px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-orange"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="telephone" className="text-sm font-medium text-ink">
            {t.telephone}
          </label>
          <input
            id="telephone"
            name="telephone"
            defaultValue={courant.valeurs?.telephone ?? ""}
            type="tel"
            required
            className="rounded-lg border border-line bg-paper px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-orange"
          />
        </div>
      </div>

      {courant.status === "error" && (
        <p className="text-sm text-red-600">
          {courant.error === "missing"
            ? t.missingFields
            : courant.error === "quota"
              ? t.quotaError
              : courant.error === "telephone"
                ? t.telephoneError
                : t.genericError}
        </p>
      )}

      {/* Information au moment de la collecte : le RGPD l'exige là où la
          donnée est saisie, pas seulement dans une page à part.

          Le lien est marqué dans la phrase plutôt que recollé ici. Le
          gabarit posait une espace avant et un point après : les deux
          sont faux en chinois, qui ne veut pas d'espace devant 《…》 et
          termine par 。 Chaque langue garde donc sa ponctuation. */}
      <p className="max-w-prose text-xs leading-relaxed text-ink-soft">
        {t.privacyNotice.split(/\[\[|\]\]/).map((morceau, rang) =>
          rang % 2 === 1 ? (
            <a
              key={rang}
              href="/confidentialite"
              target="_blank"
              rel="noopener"
              className="underline hover:text-ink"
            >
              {morceau}
            </a>
          ) : (
            <span key={rang}>{morceau}</span>
          ),
        )}
      </p>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-xl bg-ink px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_14px_30px_-14px_oklch(20%_0.02_60/50%)] transition-[transform,opacity] hover:-translate-y-px disabled:opacity-50"
      >
        {pending ? t.submitting : t.submit}
      </button>

      {pending && <BarreAnalyse libelle={t.submittingDetail} />}
    </form>
  );
}
