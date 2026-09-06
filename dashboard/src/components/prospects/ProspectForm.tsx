"use client";

import { useActionState } from "react";
import { submitProspect, type ProspectFormState } from "@/app/test-presence-google/actions";
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
      return <AuditResultCard audit={state.audit} t={auditT} />;
    }
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
        <p className="text-lg font-medium text-stone-900">{t.successTitle}</p>
        <p className="mt-2 text-sm text-stone-600">{t.successBody}</p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="prenom" className="text-sm font-medium text-stone-700">
            {t.prenom}
          </label>
          <input
            id="prenom"
            name="prenom"
            type="text"
            required
            className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-600"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nom" className="text-sm font-medium text-stone-700">
            {t.nom}
          </label>
          <input
            id="nom"
            name="nom"
            type="text"
            required
            className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="entreprise" className="text-sm font-medium text-stone-700">
            {t.entreprise}
          </label>
          <input
            id="entreprise"
            name="entreprise"
            type="text"
            required
            className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-600"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ville" className="text-sm font-medium text-stone-700">
            {t.ville}
          </label>
          <input
            id="ville"
            name="ville"
            type="text"
            required
            className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-stone-700">
            {t.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-600"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="telephone" className="text-sm font-medium text-stone-700">
            {t.telephone}
          </label>
          <input
            id="telephone"
            name="telephone"
            type="tel"
            required
            className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-600"
          />
        </div>
      </div>

      {state.status === "error" && (
        <p className="text-sm text-red-600">
          {state.error === "missing" ? t.missingFields : t.genericError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-700 disabled:opacity-50"
      >
        {pending ? t.submitting : t.submit}
      </button>
    </form>
  );
}
