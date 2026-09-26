import Link from "next/link";
import { tousLesBillets, dateLisible } from "@/lib/blog/billets";
import { billetsPour } from "@/lib/blog/traductions";
import {
  cheminJournal,
  tempsDeLecture,
  titreCategorieBillet,
} from "@/types/blog";
import type { LangueJournal } from "@/types/blog";
import { JOURNAL } from "@/lib/i18n/journal";
import { Couverture } from "@/components/blog/Couverture";
import type { ClesAccueilPublic } from "@/lib/i18n/accueilPublic";

/**
 * Les derniers billets, en bas de l'accueil.
 *
 * Placé après le dernier appel à l'action, volontairement. Avant, il
 * détournerait quelqu'un au moment précis où on lui demande de s'inscrire.
 * Après, il rattrape celui qui a fait défiler toute la page sans rien
 * faire : à défaut de l'inscrire aujourd'hui, autant lui donner une
 * raison de revenir.
 *
 * Il sert aussi au référencement : Google suit les liens depuis la page
 * la plus visitée du site, et sans ce bloc les articles ne sont atteints
 * que par le plan du site et une ligne de pied de page.
 *
 * Il s'affichait un temps en français seulement, au motif que trois
 * cartes françaises au milieu d'une page chinoise font désordre. C'était
 * une erreur de jugement : le bloc disparaissait entièrement, et le site
 * donnait l'impression de ne pas avoir de journal du tout. Il est donc
 * resté partout, en français, avec une ligne qui le disait.
 *
 * Depuis, le journal est traduit : les cartes suivent la langue comme le
 * reste, titres, résumés, rubriques et dates compris. Il restait sinon un
 * mélange que personne n'assume — « 19 septembre 2026 · 7 分钟阅读 » sous
 * un titre français, au milieu d'une page chinoise.
 *
 * Le repli français demeure, et la ligne qui l'annonce avec lui : le jour
 * où l'on ajoutera un article sans le traduire tout de suite, ou une
 * quatrième langue, le bloc ne doit pas disparaître pour autant.
 */
export function Journal({
  t,
  langue,
}: {
  t: ClesAccueilPublic["journal"];
  langue: LangueJournal;
}) {
  const traduits = billetsPour(langue).slice(0, 3);
  // Rien de traduit dans cette langue : on montre le français plutôt que
  // de faire disparaître le journal, et on le dit.
  const enFrancais = traduits.length === 0;
  const billets = enFrancais ? tousLesBillets().slice(0, 3) : traduits;
  const rubriques = JOURNAL[langue].rubriques;
  if (billets.length === 0) return null;

  return (
    <div
      className="px-5 py-16 sm:px-8 sm:py-20"
      style={{ background: "var(--bg-alt)" }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 36,
        }}
      >
        <div
          className="flex-col sm:flex-row"
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--accent-dark)",
              }}
            >
              {t.surtitre}
            </span>
            <h2
              style={{
                fontFamily: "var(--font-instrument-serif), Georgia, serif",
                fontWeight: 400,
                margin: 0,
                fontSize: 32,
                lineHeight: 1.2,
              }}
            >
              {t.titre}
            </h2>
            <p
              style={{
                margin: 0,
                maxWidth: 620,
                fontSize: 16,
                lineHeight: 1.7,
                color: "var(--ink-soft)",
              }}
            >
              {t.chapo}
              {enFrancais && t.enFrancais && (
                <>
                  {" "}
                  <span style={{ opacity: 0.75 }}>{t.enFrancais}</span>
                </>
              )}
            </p>
          </div>
          <Link
            href="/blog"
            style={{
              flexShrink: 0,
              fontSize: 15,
              fontWeight: 600,
              color: "var(--accent-dark)",
            }}
          >
            {t.tous}
          </Link>
        </div>

        <ul
          className="grid-journal"
          style={{
            display: "grid",
            gap: 24,
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          {billets.map((billet) => (
            <li key={billet.slug} style={{ display: "flex" }}>
              <Link
                // `billetsPour` rend déjà le slug traduit : c'est la
                // racine de la langue qu'il faut lui mettre devant, pas
                // `adressePour`, qui part du slug français et rendrait ici
                // une adresse française coiffant un slug chinois.
                href={`${cheminJournal(enFrancais ? "fr" : langue)}/${billet.slug}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  overflow: "hidden",
                  borderRadius: 18,
                  border: "1px solid var(--line)",
                  background: "var(--paper)",
                  color: "inherit",
                }}
              >
                <Couverture
                  slug={billet.slug}
                  rubrique={
                    enFrancais
                      ? titreCategorieBillet(billet.categorie)
                      : rubriques[billet.categorie]
                  }
                  image={billet.image}
                />
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    flexDirection: "column",
                    gap: 8,
                    padding: "22px 24px 24px",
                  }}
                >
                  <span
                    style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3 }}
                  >
                    {billet.titre}
                  </span>
                  <span
                    style={{
                      fontSize: 14.5,
                      lineHeight: 1.6,
                      color: "var(--ink-soft)",
                    }}
                  >
                    {billet.resume}
                  </span>
                  <span
                    style={{
                      marginTop: "auto",
                      paddingTop: 10,
                      fontSize: 12.5,
                      color: "var(--ink-soft)",
                    }}
                  >
                    {dateLisible(billet.misAJourLe, enFrancais ? "fr" : langue)}{" "}
                    · {tempsDeLecture(billet.markdown)} {t.lecture}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
