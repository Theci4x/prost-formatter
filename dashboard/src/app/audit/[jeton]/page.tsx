import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import {
  COLONNES_AUDIT,
  resultatDe,
  type LigneAudit,
} from "@/lib/audit/prospection";
import {
  estLangue,
  languages,
  translations,
  type Lang,
} from "@/lib/i18n/testPresence";
import { AuditResultCard } from "@/components/prospects/AuditResultCard";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";

/**
 * Le rapport qu'on envoie au restaurateur qu'on démarche.
 *
 * Le jeton, long et tiré au hasard, est la seule clé : la page ne dit rien
 * de plus que ce qu'on lui aurait apporté sur papier. Elle n'a rien à
 * faire dans un index — un audit est adressé à quelqu'un, pas publié.
 */
export const metadata: Metadata = {
  title: "Audit de présence en ligne — Klarr",
  robots: { index: false, follow: false },
};

const PREPARE_POUR: Record<Lang, (nom: string) => string> = {
  fr: (nom) => `Audit préparé pour ${nom}`,
  en: (nom) => `Audit prepared for ${nom}`,
  zh: (nom) => `为「${nom}」准备的检测报告`,
};

const QUAND: Record<Lang, string> = {
  fr: "fr-FR",
  en: "en-GB",
  zh: "zh-CN",
};

export default async function RapportAuditPage({
  params,
  searchParams,
}: {
  params: Promise<{ jeton: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { jeton } = await params;
  const { lang } = await searchParams;
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(jeton)) notFound();

  // Clé de service, mais une seule ligne, désignée par un jeton
  // impossible à deviner : la table n'est lisible par personne d'autre.
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("visibility_audits")
    .select(COLONNES_AUDIT)
    .eq("jeton", jeton)
    .eq("origine", "prospection")
    .maybeSingle();

  const ligne = data as LigneAudit | null;
  const audit = ligne ? resultatDe(ligne) : null;
  if (!ligne || !audit) notFound();

  const langue: Lang = estLangue(lang) ? lang : ligne.langue;
  const t = translations[langue];
  const nom = audit.fiche?.nom ?? ligne.restaurant_name;

  return (
    <div className="flex flex-1 flex-col items-center bg-brand-cream px-6 py-12 sm:py-16 print:bg-white print:px-0 print:py-0">
      <div className="flex w-full max-w-7xl flex-col gap-8 print:max-w-none print:gap-6">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 text-ink"
        >
          <KlarrMark size={26} />
          <KlarrWordmark className="text-xl" />
        </Link>

        <div className="flex justify-center gap-1 print:hidden">
          {languages.map((l) => (
            <Link
              key={l.code}
              href={`/audit/${jeton}?lang=${l.code}`}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                langue === l.code
                  ? "bg-ink text-white"
                  : "text-ink-soft hover:bg-brand-sand"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="mx-auto flex max-w-2xl flex-col gap-2 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-brand-orange-dark">
            {PREPARE_POUR[langue](nom)}
          </span>
          <h1 className="font-serif text-[2.2rem] leading-[1.1] text-ink sm:text-[3rem]">
            {t.audit.title}
          </h1>
          <p className="text-sm text-ink-soft">
            {new Date(ligne.created_at).toLocaleDateString(QUAND[langue], {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <AuditResultCard audit={audit} t={t.audit} />
      </div>
    </div>
  );
}
