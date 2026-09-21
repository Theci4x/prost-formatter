import type { Metadata } from "next";
import Link from "next/link";
import { CadreJournal } from "@/components/blog/CadreJournal";
import { Commis } from "@/components/commis/Commis";
import { siteUrl } from "@/lib/site-url";
import { COMPARATIF, SOLUTIONS } from "@/lib/comparatif/donnees";
import { langueIndexable } from "@/lib/i18n/langue";

const CHEMIN = "/comparatif-logiciels-reservation-restaurant";

// La page porte le référencement de « logiciel réservation restaurant » :
// elle lit `langueIndexable` et non l'en-tête du visiteur, sans quoi un
// robot indexerait la version anglaise (voir `langueIndexable`).
export async function generateMetadata(): Promise<Metadata> {
  const c = COMPARATIF[await langueIndexable()];
  return {
    title: c.titre,
    description: c.resume,
    alternates: { canonical: CHEMIN },
  };
}

export default async function ComparatifPage() {
  const langue = await langueIndexable();
  const c = COMPARATIF[langue];
  const LIGNES = c.lignes;
  const TITRE = c.titre;
  const RESUME = c.resume;
  // Compté plutôt qu'écrit : la première version annonçait « deux lignes
  // sur cinq » quand une seule l'était — le défaut même qu'on reproche
  // aux comparatifs des autres.
  const defavorables = LIGNES.filter((ligne) => ligne.defavorable).length;
  const balisage = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: TITRE,
      description: RESUME,
      datePublished: "2026-09-19",
      dateModified: "2026-09-19",
      author: { "@type": "Organization", name: "Klarr", url: siteUrl() },
      publisher: { "@type": "Organization", name: "Klarr", url: siteUrl() },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${siteUrl()}${CHEMIN}`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: c.questions.map(({ question, reponse }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: reponse },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: c.titre,
      numberOfItems: SOLUTIONS.length,
      itemListElement: SOLUTIONS.map((solution, rang) => ({
        "@type": "ListItem",
        position: rang + 1,
        name: solution.nom,
        url: solution.url ?? siteUrl(),
      })),
    },
  ];

  return (
    <>
      <CadreJournal fil={c.fil} large langue={langue}>
        {balisage.map((bloc, rang) => (
          <script
            key={rang}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(bloc).replace(/</g, "\\u003c"),
            }}
          />
        ))}

        <header className="flex flex-col gap-4">
          <h1
            className="font-serif"
            style={{ fontSize: "clamp(2rem, 4vw, 2.9rem)", lineHeight: 1.1 }}
          >
            {TITRE}
          </h1>
          <p
            style={{ fontSize: 17, lineHeight: 1.7, color: "var(--ink-soft)" }}
          >
            {RESUME}
          </p>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>
            {c.relevePublic(c.releve)}
          </p>
        </header>

        {/* Le tableau ne porte que ce qui se vérifie sur une page tarifaire
            publique. Le reste est en prose plus bas, où l'on peut nuancer
            plutôt que de cocher une case à la place d'un concurrent. */}
        <div className="hidden sm:block" style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: 720,
              borderCollapse: "collapse",
              fontSize: 15,
            }}
          >
            <caption
              style={{
                captionSide: "bottom",
                paddingTop: "0.9rem",
                fontSize: 13.5,
                color: "var(--ink-soft)",
                textAlign: "left",
              }}
            >
              {c.aveuTableau(defavorables, LIGNES.length)}
            </caption>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                <th
                  scope="col"
                  style={{
                    textAlign: "left",
                    padding: "0.7rem 0.9rem 0.7rem 0",
                  }}
                >
                  {c.critereEntete}
                </th>
                {SOLUTIONS.map((solution) => (
                  <th
                    key={solution.cle}
                    scope="col"
                    style={{
                      textAlign: "left",
                      padding: "0.7rem 0.9rem",
                      fontWeight: solution.cle === "klarr" ? 700 : 600,
                      color:
                        solution.cle === "klarr"
                          ? "var(--accent-dark)"
                          : "var(--ink)",
                    }}
                  >
                    {solution.url ? (
                      <a
                        href={solution.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        style={{ color: "inherit" }}
                      >
                        {solution.nom}
                      </a>
                    ) : (
                      solution.nom
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LIGNES.map((ligne) => (
                <tr
                  key={ligne.critere}
                  style={{ borderBottom: "1px solid var(--line)" }}
                >
                  <th
                    scope="row"
                    style={{
                      textAlign: "left",
                      fontWeight: 600,
                      padding: "0.8rem 0.9rem 0.8rem 0",
                    }}
                  >
                    {ligne.critere}
                  </th>
                  {SOLUTIONS.map((solution) => (
                    <td
                      key={solution.cle}
                      style={{
                        padding: "0.8rem 0.9rem",
                        color:
                          solution.cle === "klarr" && !ligne.defavorable
                            ? "var(--ink)"
                            : "var(--ink-soft)",
                        fontWeight:
                          solution.cle === "klarr" && !ligne.defavorable
                            ? 600
                            : 400,
                      }}
                    >
                      {ligne.valeurs[solution.cle]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* À 390 px, un tableau de cinq colonnes défile latéralement et on
            n'y voit plus que la nôtre — c'est-à-dire plus aucune
            comparaison. Empilé par critère, tout reste sous les yeux. */}
        <div className="flex flex-col gap-3 sm:hidden">
          {LIGNES.map((ligne) => (
            <div
              key={ligne.critere}
              style={{
                borderRadius: "1rem",
                border: "1px solid var(--line)",
                background: "var(--paper)",
                padding: "1rem 1.1rem",
              }}
            >
              <p style={{ fontWeight: 600, marginBottom: "0.6rem" }}>
                {ligne.critere}
              </p>
              <dl className="flex flex-col gap-1.5" style={{ fontSize: 14.5 }}>
                {SOLUTIONS.map((solution) => (
                  <div
                    key={solution.cle}
                    className="flex items-baseline justify-between gap-3"
                  >
                    <dt
                      style={{
                        color:
                          solution.cle === "klarr"
                            ? "var(--accent-dark)"
                            : "var(--ink-soft)",
                        fontWeight: solution.cle === "klarr" ? 700 : 400,
                      }}
                    >
                      {solution.nom}
                    </dt>
                    <dd
                      style={{
                        textAlign: "right",
                        color:
                          solution.cle === "klarr" && !ligne.defavorable
                            ? "var(--ink)"
                            : "var(--ink-soft)",
                        fontWeight:
                          solution.cle === "klarr" && !ligne.defavorable
                            ? 600
                            : 400,
                      }}
                    >
                      {ligne.valeurs[solution.cle]}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>
            {c.aveuCourt(defavorables, LIGNES.length)}
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif" style={{ fontSize: "1.7rem" }}>
            {c.ceQueKlarrNeFaitPas}
          </h2>
          {c.limites.map((limite) => (
            <div
              key={limite.titre}
              style={{
                borderRadius: "1rem",
                border: "1px solid var(--line)",
                background: "var(--paper)",
                padding: "1.2rem 1.4rem",
              }}
            >
              <p style={{ fontWeight: 600, marginBottom: "0.4rem" }}>
                {limite.titre}
              </p>
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.65,
                  color: "var(--ink-soft)",
                }}
              >
                {limite.texte}
              </p>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif" style={{ fontSize: "1.7rem" }}>
            {c.lesTarifs}
          </h2>
          <ul className="flex flex-col gap-2" style={{ fontSize: 15.5 }}>
            <li>
              <strong>{c.tarifReservations}</strong> — {c.tarifs.reservations}
            </li>
            <li>
              <strong>{c.tarifVisibilite}</strong> — {c.tarifs.visibilite}
            </li>
            <li>
              <strong>{c.tarifLesDeux}</strong> — {c.tarifs.pack}
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif" style={{ fontSize: "1.7rem" }}>
            {c.questionsFrequentes}
          </h2>
          <div
            className="flex flex-col divide-y"
            style={{
              borderRadius: "1rem",
              border: "1px solid var(--line)",
              background: "var(--paper)",
              borderColor: "var(--line)",
            }}
          >
            {c.questions.map(({ question, reponse }) => (
              <details key={question} className="group px-5 py-4">
                <summary
                  className="flex cursor-pointer list-none items-center justify-between gap-4"
                  style={{ fontSize: 15, fontWeight: 600 }}
                >
                  {question}
                  <span
                    aria-hidden
                    className="transition-transform group-open:rotate-45"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    +
                  </span>
                </summary>
                <p
                  style={{
                    marginTop: "0.6rem",
                    fontSize: 15,
                    lineHeight: 1.65,
                    color: "var(--ink-soft)",
                  }}
                >
                  {reponse}
                </p>
              </details>
            ))}
          </div>
        </section>

        <aside
          style={{
            borderRadius: "1rem",
            border: "1px solid var(--line)",
            background: "var(--paper)",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.9rem",
            fontSize: 15,
            lineHeight: 1.65,
          }}
        >
          <p style={{ margin: 0 }}>{c.avantDeChoisir}</p>
          <Link
            href="/test-presence-google"
            style={{
              alignSelf: "flex-start",
              borderRadius: "0.75rem",
              background: "var(--ink)",
              color: "var(--paper)",
              padding: "0.8rem 1.4rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {c.testerMaPresence}
          </Link>
        </aside>
      </CadreJournal>
      <Commis />
    </>
  );
}
