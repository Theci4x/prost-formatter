"use client";

import { useState } from "react";
import Link from "next/link";
import { ProspectForm } from "@/components/prospects/ProspectForm";
import { languages, translations, type Lang } from "@/lib/i18n/testPresence";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";

export function TestPresencePage() {
  const [lang, setLang] = useState<Lang>("fr");
  const t = translations[lang];

  return (
    <div className="flex flex-1 flex-col items-center bg-brand-cream px-6 py-16 sm:py-20">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 text-ink"
        >
          <KlarrMark size={26} />
          <KlarrWordmark className="text-xl" />
        </Link>

        <div className="flex justify-center gap-1">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                lang === l.code
                  ? "bg-ink text-white"
                  : "text-ink-soft hover:bg-brand-sand"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-brand-orange-dark">
            {t.badge}
          </span>
          <h1 className="font-serif text-[2.4rem] leading-[1.08] text-ink sm:text-[2.9rem]">
            {t.title}
          </h1>
          <p className="text-[15px] leading-relaxed text-ink-soft">
            {t.subtitle}
          </p>
        </div>

        <ProspectForm t={t.form} auditT={t.audit} langue={lang} />

        <div className="flex flex-col gap-3">
          <h2 className="text-center font-serif text-2xl text-ink">
            {t.faqTitle}
          </h2>
          <div className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-paper shadow-sm">
            {t.faq.map((item) => (
              <details key={item.question} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink">
                  {item.question}
                  <span className="text-ink-soft transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
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
