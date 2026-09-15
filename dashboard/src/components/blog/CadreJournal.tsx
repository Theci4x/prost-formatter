import Link from "next/link";
import { Instrument_Serif, Manrope } from "next/font/google";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

const manrope = Manrope({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-manrope",
});

const ACCENT = "#E8871E";

/**
 * Le gabarit du journal.
 *
 * Il reprend la palette et les fontes de la page d'accueil. Les premières
 * versions de ces pages étaient en gris Tailwind sur un fond de marque qui
 * n'existait pas — quelqu'un arrivant par une recherche, puis cliquant vers
 * l'accueil, avait l'impression de changer de site. Un blog dont on ne
 * reconnaît pas la maison ne ramène personne à la maison.
 */
export function CadreJournal({
  fil,
  children,
  large = false,
}: {
  /** Ce qui suit le logo, en haut : « Le journal », puis la rubrique. */
  fil: React.ReactNode;
  children: React.ReactNode;
  large?: boolean;
}) {
  return (
    <div
      className={`klarr-grain ${instrumentSerif.variable} ${manrope.variable}`}
      style={{
        // @ts-expect-error -- les propriétés CSS libres ne sont pas dans les
        // typages de React.
        "--bg": "oklch(98% 0.006 80)",
        "--bg-alt": "oklch(95.5% 0.012 75)",
        "--ink": "oklch(19% 0.012 60)",
        "--ink-soft": "oklch(46% 0.02 60)",
        "--line": "oklch(89% 0.012 70)",
        "--accent-dark": "oklch(46% 0.13 50)",
        "--paper": "oklch(100% 0 0)",
        "--accent": ACCENT,
        "--accent-soft": `color-mix(in oklch, ${ACCENT} 12%, white)`,
        background: "var(--bg)",
        color: "var(--ink-soft)",
        fontFamily: "var(--font-manrope), system-ui, sans-serif",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid var(--line)",
          background: "var(--paper)",
        }}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-2 px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2"
            style={{ color: "var(--ink)" }}
          >
            <KlarrMark size={20} />
            <KlarrWordmark />
          </Link>
          {fil}
        </div>
      </header>

      <main
        className={`mx-auto flex w-full flex-1 flex-col px-6 py-10 ${
          large ? "max-w-3xl gap-12" : "max-w-2xl gap-8"
        }`}
      >
        {children}
      </main>

      <footer style={{ borderTop: "1px solid var(--line)" }}>
        <div
          className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-5 gap-y-2 px-6 py-6"
          style={{ fontSize: 14, color: "var(--ink-soft)" }}
        >
          <Link href="/">Accueil</Link>
          <Link href="/blog">Le journal</Link>
          <Link href="/aide">Aide</Link>
          <Link href="/mentions-legales">Mentions légales</Link>
        </div>
      </footer>
    </div>
  );
}

/** Le séparateur du fil d'Ariane, pour que les deux pages soient d'accord. */
export function Separateur() {
  return <span style={{ color: "var(--line)" }}>/</span>;
}
