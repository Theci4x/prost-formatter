import Link from "next/link";
import { Instrument_Serif } from "next/font/google";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";

const instrumentSerif = Instrument_Serif({ weight: "400", subsets: ["latin"] });

export function LegalLayout({
  title,
  version,
  otherPageHref,
  otherPageLabel,
  children,
}: {
  title: string;
  version: string;
  otherPageHref: string;
  otherPageLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F0]">
      <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-white/90 px-6 py-4 backdrop-blur">
        <Link href="/" className="flex w-fit items-center gap-2">
          <KlarrMark size={22} />
          <KlarrWordmark className="text-lg text-zinc-900" />
        </Link>
      </header>

      <main className="flex flex-1 justify-center px-6 py-12">
        <div className="w-full max-w-[700px]">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-orange">
            Document légal
          </p>
          <h1
            className={`${instrumentSerif.className} mt-1 text-4xl font-normal text-brand-navy`}
          >
            {title}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Version {version} — en vigueur depuis le{" "}
            <strong className="font-semibold text-zinc-700">
              6 septembre 2026
            </strong>
          </p>

          <div className="mt-10 flex flex-col gap-10">{children}</div>

          <footer className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-zinc-200 pt-6 text-sm text-zinc-500">
            <span>© 2026 Klarr</span>
            <Link href={otherPageHref} className="underline hover:text-brand-navy">
              {otherPageLabel}
            </Link>
            <Link href="/" className="underline hover:text-brand-navy">
              Retour à l&apos;accueil
            </Link>
          </footer>
        </div>
      </main>
    </div>
  );
}

export function LegalSection({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 border-t border-zinc-200 pt-6">
      <h2 className="flex items-baseline gap-2 text-base font-bold text-brand-navy">
        <span className="tabular-nums text-brand-orange">{n}</span>
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-zinc-700 [&_a]:text-brand-orange [&_a]:underline [&_li]:ml-4 [&_li]:list-disc [&_p]:max-w-prose [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
        {children}
      </div>
    </section>
  );
}
