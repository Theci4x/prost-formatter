"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ProspectForm } from "@/components/prospects/ProspectForm";
import { languages, translations, type Lang } from "@/lib/i18n/testPresence";
import { choisirLangueVisiteur } from "@/app/langue-actions";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";

export function TestPresencePage({ initiale = "fr" }: { initiale?: Lang }) {
  const [lang, setLang] = useState<Lang>(initiale);
  const [, enFond] = useTransition();
  const t = translations[lang];

  // L'affichage change tout de suite, le témoin se met à jour derrière :
  // le choix fait ici suit le visiteur sur le reste du site, sans le
  // faire attendre pour autant.
  const choisir = (code: Lang) => {
    setLang(code);
    enFond(() => {
      void choisirLangueVisiteur(code);
    });
  };

  return (
    <div className="flex flex-1 flex-col items-center bg-brand-cream px-6 py-16 sm:py-20 print:bg-white print:px-0 print:py-0">
      {/* Large, parce que le rapport d'audit en a besoin : il tenait dans
          cinq cents pixels au milieu d'un écran de dix-neuf cents. Le texte
          d'accueil et le formulaire, eux, gardent une largeur de lecture —
          un formulaire de six champs étalé sur toute la page se remplit
          plus mal, pas mieux. */}
      <div className="flex w-full max-w-7xl flex-col gap-10 print:max-w-none print:gap-6">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 text-ink"
        >
          <KlarrMark size={26} />
          <KlarrWordmark className="text-xl" />
        </Link>

        <div className="flex justify-center gap-1 print:hidden">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => choisir(l.code)}
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

        <div className="mx-auto flex max-w-2xl flex-col gap-3 text-center print:hidden">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-brand-orange-dark">
            {t.badge}
          </span>
          <h1 className="font-serif text-[2.4rem] leading-[1.08] text-ink sm:text-[3.4rem]">
            {t.title}
          </h1>
          <p className="text-base leading-relaxed text-ink-soft sm:text-lg">
            {t.subtitle}
          </p>
        </div>

        <ProspectForm t={t.form} auditT={t.audit} langue={lang} />

        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 print:hidden">
          <h2 className="text-center font-serif text-3xl text-ink">
            {t.faqTitle}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {t.faq.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-line bg-paper px-5 py-4 shadow-sm"
              >
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
