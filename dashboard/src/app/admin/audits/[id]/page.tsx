import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";
import { siteUrl } from "@/lib/site-url";
import { parCible, type Suivi } from "@/lib/suivi";
import {
  COLONNES_AUDIT,
  lienRapport,
  messageProspection,
  resultatDe,
  type LigneAudit,
} from "@/lib/audit/prospection";
import { estLangue, translations, type Lang } from "@/lib/i18n/testPresence";
import { AuditResultCard } from "@/components/prospects/AuditResultCard";
import { Suivre } from "@/components/admin/Suivre";
import { TexteACopier } from "@/components/admin/TexteACopier";

export const metadata: Metadata = {
  title: "Audit de prospection — Klarr",
  robots: { index: false, follow: false },
};

const NOM_LANGUE: Record<Lang, string> = {
  fr: "Français",
  zh: "中文",
  en: "English",
};

/**
 * L'audit d'un restaurant qu'on démarche : de quoi le lui envoyer, et de
 * quoi noter ce qu'il en a dit.
 *
 * En haut, ce qui part : le lien et le message, dans la langue qu'on
 * choisit. En dessous, le rapport tel qu'il le verra — à imprimer pour
 * le lui apporter en main propre.
 */
export default async function AuditProspectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ langue?: string }>;
}) {
  await requireAdmin(`/admin`);
  const { id } = await params;
  const query = await searchParams;

  const supabase = createServiceClient();
  const [{ data }, { data: suivisData }] = await Promise.all([
    supabase
      .from("visibility_audits")
      .select(COLONNES_AUDIT)
      .eq("id", id)
      .eq("origine", "prospection")
      .maybeSingle(),
    supabase
      .from("suivis")
      .select("cible_type, cible_id, statut, note, auteur, created_at")
      .eq("cible_type", "audit")
      .eq("cible_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const ligne = data as LigneAudit | null;
  const audit = ligne ? resultatDe(ligne) : null;
  if (!ligne || !audit || !ligne.jeton) notFound();

  const langue: Lang = estLangue(query.langue) ? query.langue : ligne.langue;
  const lien = lienRapport(siteUrl(), ligne.jeton, langue);
  const journal = parCible((suivisData ?? []) as Suivi[]);

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <div className="flex flex-col gap-2 print:hidden">
          <Link
            href="/admin#prospection"
            className="text-sm text-zinc-500 hover:text-ink"
          >
            ← Audits de prospection
          </Link>
          <h1 className="font-serif text-3xl text-ink">
            {ligne.restaurant_name}
          </h1>
          <p className="text-sm text-zinc-500">
            {ligne.ville} · audité le{" "}
            {new Date(ligne.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            · {audit.score}/100
          </p>
        </div>

        <div className="grid gap-5 print:hidden lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-base font-semibold text-zinc-900">
                À envoyer
              </span>
              <nav className="flex gap-1.5">
                {(["fr", "zh", "en"] as const).map((l) => (
                  <Link
                    key={l}
                    href={`/admin/audits/${id}?langue=${l}`}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      l === langue
                        ? "border-brand-navy bg-brand-navy text-white"
                        : "border-zinc-200 text-zinc-600 hover:border-ink"
                    }`}
                  >
                    {NOM_LANGUE[l]}
                  </Link>
                ))}
              </nav>
            </div>
            <TexteACopier
              key={`lien-${langue}`}
              titre="Lien du rapport"
              texte={lien}
              lignes={1}
            />
            <TexteACopier
              key={`message-${langue}`}
              titre="Message (WhatsApp, WeChat, e-mail)"
              texte={messageProspection(audit, lien, langue)}
              lignes={7}
            />
            <a
              href={lien}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit text-sm font-semibold text-brand-orange-dark hover:underline"
            >
              Voir la page comme lui ↗
            </a>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
            <span className="text-base font-semibold text-zinc-900">Suivi</span>
            <Suivre
              cibleType="audit"
              cibleId={id}
              lignes={journal.get(`audit:${id}`) ?? []}
            />
          </div>
        </div>

        <AuditResultCard audit={audit} t={translations[langue].audit} />
      </div>
    </div>
  );
}
