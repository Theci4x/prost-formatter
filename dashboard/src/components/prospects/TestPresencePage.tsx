"use client";

import { useState } from "react";
import { ProspectForm } from "@/components/prospects/ProspectForm";
import { languages, translations, type Lang } from "@/lib/i18n/testPresence";

export function TestPresencePage() {
  const [lang, setLang] = useState<Lang>("fr");
  const t = translations[lang];

  return (
    <div className="flex flex-1 flex-col items-center bg-stone-50 px-6 py-20">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <div className="flex justify-center gap-1">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                lang === l.code
                  ? "bg-stone-900 text-white"
                  : "text-stone-500 hover:bg-stone-200"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 text-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            {t.badge}
          </span>
          <h1 className="text-3xl font-semibold text-stone-900">{t.title}</h1>
          <p className="text-sm leading-relaxed text-stone-600">
            {t.subtitle}
          </p>
        </div>

        <ProspectForm t={t.form} auditT={t.audit} />

        <div className="flex flex-col gap-3">
          <h2 className="text-center text-lg font-semibold text-stone-900">
            {t.faqTitle}
          </h2>
          <div className="flex flex-col divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
            {t.faq.map((item) => (
              <details key={item.question} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-stone-900">
                  {item.question}
                  <span className="text-stone-400 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
