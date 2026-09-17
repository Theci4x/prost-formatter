import Link from "next/link";
import { tousLesBillets, dateLisible } from "@/lib/blog/billets";
import { tempsDeLecture } from "@/types/blog";
import { Couverture } from "@/components/blog/Couverture";
import { titreCategorieBillet } from "@/types/blog";

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
 */
export function Journal() {
  const billets = tousLesBillets().slice(0, 3);
  if (billets.length === 0) return null;

  return (
    <div className="px-5 py-16 sm:px-8 sm:py-20" style={{ background: "var(--bg-alt)" }}>
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
              Le journal
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
              Ce qu&apos;on aurait aimé lire avant d&apos;ouvrir.
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
              Des articles gratuits sur les démarches, les diagnostics et les
              autorisations — écrits à partir de ce qu&apos;on a découvert
              trop tard, sources à l&apos;appui.
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
            Tous les articles →
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
                href={`/blog/${billet.slug}`}
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
                  rubrique={titreCategorieBillet(billet.categorie)}
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
                    {dateLisible(billet.misAJourLe)} ·{" "}
                    {tempsDeLecture(billet.markdown)} min de lecture
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
