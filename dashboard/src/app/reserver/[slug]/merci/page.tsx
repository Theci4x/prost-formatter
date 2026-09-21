import type { Metadata } from "next";
import Link from "next/link";
import { SignatureKlarr } from "@/components/brand/SignatureKlarr";
import { langueVisiteur } from "@/lib/i18n/langue";
import { RESERVER } from "@/lib/i18n/reserver";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: RESERVER[await langueVisiteur()].mercititre,
    robots: { index: false, follow: false },
  };
}

export default async function MerciPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ confirmee?: string }>;
}) {
  const { slug } = await params;
  const r = RESERVER[await langueVisiteur()];
  // La plupart des réservations sont confirmées sur-le-champ : annoncer une
  // attente de 48 heures à quelqu'un dont la table est déjà prise serait
  // faux, et lui ferait rappeler pour vérifier.
  const confirmee = (await searchParams).confirmee === "1";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-brand-cream px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      <div className="flex max-w-md flex-col gap-3">
        <h1 className="font-serif text-4xl text-ink">
          {confirmee ? r.confirmeeTitre : r.mercititre}
        </h1>
        {confirmee ? (
          <>
            <p className="text-sm leading-relaxed text-zinc-600">
              {r.confirmeeDetail}
            </p>
            <p className="text-sm leading-relaxed text-zinc-600">
              {r.confirmeeEmpechement}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-zinc-600">
              {r.attenteDelai}
            </p>
            <p className="text-sm leading-relaxed text-zinc-600">
              {r.attenteRienDebite}
            </p>
          </>
        )}
      </div>

      <Link
        href={`/reserver/${slug}`}
        className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
      >
        {r.faireUneAutreDemande}
      </Link>

      <SignatureKlarr texte={r.propulseePar} className="mt-4" />
    </div>
  );
}
