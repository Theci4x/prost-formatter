import type { Metadata } from "next";
import Link from "next/link";
import { CadreJournal, Separateur } from "@/components/blog/CadreJournal";
import { LangueDocument } from "@/components/blog/LangueDocument";
import { Couverture } from "@/components/blog/Couverture";
import { billetsPour } from "@/lib/blog/traductions";
import { dateLisible } from "@/lib/blog/billets";
import { JOURNAL } from "@/lib/i18n/journal";
import { tempsDeLecture, cheminJournal } from "@/types/blog";

const LANGUE = "en" as const;

/**
 * L'index d'une langue traduite.
 *
 * Plus sobre que l'index français, et volontairement : il porte quelques
 * articles, pas vingt. Une mise en page conçue pour un sommaire de vingt
 * entrées en met trois dans un décor de vingt, et ça se voit.
 *
 * Seuls les articles réellement traduits y figurent. Montrer un titre
 * français dans une liste anglaise ferait cliquer vers une impasse, et
 * Google classerait la page comme contenu mince.
 */
export const metadata: Metadata = {
  title: JOURNAL[LANGUE].index.titre,
  description: JOURNAL[LANGUE].index.chapo,
  alternates: {
    canonical: cheminJournal(LANGUE),
    languages: { fr: "/blog", en: "/blog/en", zh: "/blog/zh" },
  },
};

export default function Page() {
  const t = JOURNAL[LANGUE];
  const billets = billetsPour(LANGUE);

  return (
    <>
      <LangueDocument langue={LANGUE} />
      <CadreJournal
        large
        langue={LANGUE}
        journal={{}}
        fil={
          <>
            <Separateur />
            <span style={{ fontSize: 14 }}>{t.journal}</span>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <h1
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontSize: "clamp(2rem, 6vw, 2.75rem)",
              lineHeight: 1.08,
              color: "var(--ink)",
            }}
          >
            {t.index.titre}
          </h1>
          <p style={{ maxWidth: "36rem", fontSize: 17, lineHeight: 1.65 }}>
            {t.index.chapo}
          </p>
        </div>

        {billets.length === 0 ? (
          <p style={{ fontSize: 15 }}>{t.index.vide}</p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2">
            {billets.map((billet) => (
              <li key={billet.slug} style={{ display: "flex" }}>
                <Link
                  href={`${cheminJournal(LANGUE)}/${billet.slug}`}
                  className="flex w-full flex-col overflow-hidden rounded-2xl"
                  style={{
                    border: "1px solid var(--line)",
                    background: "var(--paper)",
                    color: "inherit",
                  }}
                >
                  <Couverture
                    slug={billet.slug}
                    rubrique={t.rubriques[billet.categorie]}
                    image={billet.image}
                  />
                  <div className="flex flex-1 flex-col gap-2 px-6 py-5">
                    <span
                      style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3 }}
                    >
                      {billet.titre}
                    </span>
                    <span style={{ fontSize: 14.5, lineHeight: 1.6 }}>
                      {billet.resume}
                    </span>
                    <span
                      style={{
                        marginTop: "auto",
                        paddingTop: 10,
                        fontSize: 12.5,
                      }}
                    >
                      {dateLisible(billet.misAJourLe, LANGUE)} ·{" "}
                      {tempsDeLecture(billet.markdown)} {t.lecture}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CadreJournal>
    </>
  );
}
