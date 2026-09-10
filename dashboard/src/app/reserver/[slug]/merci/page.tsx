import type { Metadata } from "next";
import Link from "next/link";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";

export const metadata: Metadata = {
  title: "Demande envoyée",
  robots: { index: false, follow: false },
};

export default async function MerciPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#FAF7F0] px-6 py-16 text-center">
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
          Ta demande est partie.
        </h1>
        <p className="text-sm leading-relaxed text-zinc-600">
          L&apos;établissement la reçoit à l&apos;instant et te répond sous
          48 heures. Ton créneau est mis de côté jusque-là : personne
          d&apos;autre ne peut le réserver.
        </p>
        <p className="text-sm leading-relaxed text-zinc-600">
          Tu recevras la confirmation par e-mail. Rien n&apos;est débité tant
          que l&apos;établissement n&apos;a pas accepté.
        </p>
      </div>

      <Link
        href={`/reserver/${slug}`}
        className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
      >
        Faire une autre demande
      </Link>

      <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
        <KlarrMark size={16} />
        <span>
          Réservations propulsées par{" "}
          <KlarrWordmark className="text-zinc-500" />
        </span>
      </div>
    </div>
  );
}
