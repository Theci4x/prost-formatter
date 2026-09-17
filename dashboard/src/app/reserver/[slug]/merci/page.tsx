import type { Metadata } from "next";
import Link from "next/link";
import { SignatureKlarr } from "@/components/brand/SignatureKlarr";

export const metadata: Metadata = {
  title: "Demande envoyée",
  robots: { index: false, follow: false },
};

export default async function MerciPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ confirmee?: string }>;
}) {
  const { slug } = await params;
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
        <h1 className="text-2xl font-semibold text-zinc-900">
          {confirmee ? "C'est réservé." : "Ta demande est partie."}
        </h1>
        {confirmee ? (
          <>
            <p className="text-sm leading-relaxed text-zinc-600">
              Ta table est confirmée. Tu reçois le détail par e-mail dans
              quelques instants — garde-le, il rappelle l&apos;heure et
              l&apos;adresse.
            </p>
            <p className="text-sm leading-relaxed text-zinc-600">
              Un empêchement ? Préviens l&apos;établissement en répondant à
              cet e-mail. Une table rendue à temps, c&apos;est une table qui
              resert.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-zinc-600">
              L&apos;établissement la reçoit à l&apos;instant et te répond
              sous 48 heures. Ton créneau est mis de côté jusque-là :
              personne d&apos;autre ne peut le réserver.
            </p>
            <p className="text-sm leading-relaxed text-zinc-600">
              Tu recevras la confirmation par e-mail. Rien n&apos;est débité
              tant que l&apos;établissement n&apos;a pas accepté.
            </p>
          </>
        )}
      </div>

      <Link
        href={`/reserver/${slug}`}
        className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
      >
        Faire une autre demande
      </Link>

      <SignatureKlarr texte="Réservations propulsées par" className="mt-4" />
    </div>
  );
}
