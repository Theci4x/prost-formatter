import type { Metadata } from "next";
import Link from "next/link";
import { CadreJournal } from "@/components/blog/CadreJournal";
import { Commis } from "@/components/commis/Commis";
import { CHEMIN_ACTUALITES, toutesLesActualites } from "@/lib/actualites";
import { dateLisible } from "@/lib/blog/billets";

export const metadata: Metadata = {
  title: "Actualités de la restauration et des réservations",
  description:
    "Rachats, fermetures de plateformes, nouvelles règles : ce qui change pour les restaurateurs, daté, sourcé, et ce qu'il faut en faire.",
  alternates: { canonical: CHEMIN_ACTUALITES },
};

/**
 * L'onglet Actualités : court, daté, et à part du journal. Le journal
 * répond aux questions qui durent ; ici, ce qui vient de se passer.
 */
export default function ActualitesPage() {
  const actualites = toutesLesActualites();

  return (
    <>
      <CadreJournal
        large
        fil={<span style={{ fontSize: 14 }}>Actualités</span>}
      >
        <header className="flex flex-col gap-3">
          <h1
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontSize: "clamp(2rem, 5vw, 2.6rem)",
              lineHeight: 1.1,
              color: "var(--ink)",
            }}
          >
            Actualités
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.65 }}>
            Ce qui bouge chez les plateformes de réservation et dans les règles
            du métier, avec ce que ça change pour votre restaurant. Chaque
            article est daté et renvoie à ses sources.
          </p>
        </header>

        <ul className="flex flex-col gap-4">
          {actualites.map((actualite) => (
            <li key={actualite.slug}>
              <Link
                href={`${CHEMIN_ACTUALITES}/${actualite.slug}`}
                className="flex flex-col gap-2 transition-colors hover:border-[var(--ink-soft)]"
                style={{
                  borderRadius: "1rem",
                  border: "1px solid var(--line)",
                  background: "var(--paper)",
                  padding: "1.25rem 1.4rem",
                  textDecoration: "none",
                  color: "var(--ink)",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--accent-dark)",
                  }}
                >
                  {dateLisible(actualite.publieLe)}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-instrument-serif), Georgia, serif",
                    fontSize: "1.45rem",
                    lineHeight: 1.2,
                  }}
                >
                  {actualite.titre}
                </span>
                <span
                  style={{
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "var(--ink-soft)",
                  }}
                >
                  {actualite.resume}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </CadreJournal>
      <Commis />
    </>
  );
}
