import type { Metadata } from "next";
import Link from "next/link";
import { CadreJournal } from "@/components/blog/CadreJournal";
import { Commis } from "@/components/commis/Commis";
import { siteUrl } from "@/lib/site-url";
import {
  LIGNES,
  LIMITES,
  QUESTIONS_COMPARATIF,
  RELEVE,
  SOLUTIONS,
  TARIFS_KLARR,
} from "@/lib/comparatif/donnees";

const CHEMIN = "/comparatif-logiciels-reservation-restaurant";
const TITRE =
  "Klarr, TheFork, Zenchef, Guestonline : quel logiciel de réservation pour votre restaurant ?";
const RESUME =
  "Les quatre solutions de réservation pour restaurants indépendants en France, comparées sur leur modèle économique, leur tarif et ce qu'elles font vraiment — y compris ce que Klarr ne fait pas.";

export const metadata: Metadata = {
  title: TITRE,
  description: RESUME,
  alternates: { canonical: CHEMIN },
};

export default function ComparatifPage() {
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
      mainEntity: QUESTIONS_COMPARATIF.map(({ question, reponse }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: reponse },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Logiciels de réservation pour restaurants indépendants",
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
      <CadreJournal fil="Comparatif" large>
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
            Tarifs et caractéristiques des autres éditeurs relevés sur leurs
            pages publiques en {RELEVE}. Ils changent : si vous constatez une
            erreur, dites-le-nous et nous la corrigerons.
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
              {defavorables} ligne{defavorables > 1 ? "s" : ""} sur{" "}
              {LIGNES.length} ne nous {defavorables > 1 ? "sont" : "est"} pas
              favorable{defavorables > 1 ? "s" : ""}, et la section suivante dit
              ce que Klarr ne fait pas. Un comparatif dont l&apos;auteur gagne
              partout ne se lit pas.
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
                  Critère
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
            {defavorables} ligne{defavorables > 1 ? "s" : ""} sur{" "}
            {LIGNES.length} ne nous {defavorables > 1 ? "sont" : "est"} pas
            favorable{defavorables > 1 ? "s" : ""}. Un comparatif dont
            l&apos;auteur gagne partout ne se lit pas.
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif" style={{ fontSize: "1.7rem" }}>
            Ce que Klarr ne fait pas
          </h2>
          {LIMITES.map((limite) => (
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
            Les tarifs de Klarr
          </h2>
          <ul className="flex flex-col gap-2" style={{ fontSize: 15.5 }}>
            <li>
              <strong>Réservations</strong> — {TARIFS_KLARR.reservations}
            </li>
            <li>
              <strong>Votre visibilité</strong> — {TARIFS_KLARR.visibilite}
            </li>
            <li>
              <strong>Les deux</strong> — {TARIFS_KLARR.pack}
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif" style={{ fontSize: "1.7rem" }}>
            Questions fréquentes
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
            {QUESTIONS_COMPARATIF.map(({ question, reponse }) => (
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
          <p style={{ margin: 0 }}>
            Avant de choisir, regardez où vous en êtes : ce que votre fiche
            Google montre vraiment, ce que disent vos avis, et ce qu&apos;une IA
            répond quand un client cherche où manger près de chez vous.
            C&apos;est gratuit et sans carte bancaire.
          </p>
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
            Tester ma présence en ligne
          </Link>
        </aside>
      </CadreJournal>
      <Commis />
    </>
  );
}
