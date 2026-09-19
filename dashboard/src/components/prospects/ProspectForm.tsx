"use client";

import { useActionState } from "react";
import {
  submitProspect,
  type ProspectFormState,
} from "@/app/test-presence-google/actions";
import { AuditResultCard } from "@/components/prospects/AuditResultCard";
import type { translations } from "@/lib/i18n/testPresence";

const initialState: ProspectFormState = { status: "idle" };

type Translations = (typeof translations)[keyof typeof translations];

export function ProspectForm({
  t,
  auditT,
}: {
  t: Translations["form"];
  auditT: Translations["audit"];
}) {
  const [state, formAction, pending] = useActionState(
    submitProspect,
    initialState,
  );

  if (state.status === "success") {
    if (state.audit) {
      return (
        <AuditResultCard audit={state.audit} t={auditT} email={state.email} />
      );
    }
    return (
      <div className="rounded-2xl border border-brand-orange/30 bg-brand-orange-soft px-6 py-8 text-center">
        <p className="font-serif text-2xl text-ink">{t.successTitle}</p>
        <p className="mt-2 text-sm text-ink-soft">{t.successBody}</p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-2xl border border-line bg-paper p-6 shadow-[0_24px_60px_-40px_oklch(20%_0.02_60/35%)] sm:p-7"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="prenom" className="text-sm font-medium text-ink">
            {t.prenom}
          </label>
          <input
            id="prenom"
            name="prenom"
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
            type="tel"
            required
            className="rounded-lg border border-line bg-paper px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-orange"
          />
        </div>
      </div>

      {state.status === "error" && (
        <p className="text-sm text-red-600">
          {state.error === "missing" ? t.missingFields : t.genericError}
        </p>
      )}

      {/* Information au moment de la collecte : le RGPD l'exige là où la
          donnée est saisie, pas seulement dans une page à part. */}
      <p className="max-w-prose text-xs leading-relaxed text-ink-soft">
        {t.privacyNotice}{" "}
        <a
          href="/confidentialite"
          target="_blank"
          rel="noopener"
          className="underline hover:text-ink"
        >
          {t.privacyLink}
        </a>
        .
      </p>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-xl bg-ink px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_14px_30px_-14px_oklch(20%_0.02_60/50%)] transition-[transform,opacity] hover:-translate-y-px disabled:opacity-50"
      >
        {pending ? t.submitting : t.submit}
      </button>
    </form>
  );
}
