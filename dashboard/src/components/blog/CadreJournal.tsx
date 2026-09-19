import Link from "next/link";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";
import { ChoixLangueSite } from "@/components/landing/ChoixLangueSite";
import type { Langue } from "@/lib/i18n/langues";
import { NoteLangueJournal } from "@/components/blog/NoteLangueJournal";

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
  langue,
}: {
  /** Ce qui suit le logo, en haut : « Le journal », puis la rubrique. */
  fil: React.ReactNode;
  children: React.ReactNode;
  large?: boolean;
  /**
   * La langue de la page, sur les versions traduites. Sans elle, le
   * sélecteur lit le témoin du navigateur — ce qu'il faut sur les pages
   * françaises, qui ne sont pas traduites, mais qui afficherait « FR »
   * au-dessus d'un article chinois.
   */
  langue?: Langue;
}) {
  return (
    <div
      className="klarr-grain"
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
          {/* Le sélecteur sans langue courante : ces pages sont
              pré-générées, et le lire côté serveur les rendrait
              dynamiques. Il ne change rien au journal, qui reste en
              français — il rend le reste du site à la langue du visiteur,
              qui sans lui se retrouvait coincé ici. */}
          <div className="ml-auto">
            <ChoixLangueSite courante={langue} />
          </div>
        </div>
        {langue === undefined && <NoteLangueJournal />}
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
