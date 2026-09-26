import Link from "next/link";
import { CHEMIN_ACTUALITES, toutesLesActualites } from "@/lib/actualites";
import { dateLisible } from "@/lib/blog/billets";
import type { Langue } from "@/lib/i18n/langues";

const TEXTES: Record<Langue, { titre: string; toutes: string; note: string }> =
  {
    fr: { titre: "Actualités", toutes: "Toutes les actualités →", note: "" },
    en: {
      titre: "News",
      toutes: "All news →",
      note: "Written in French.",
    },
    zh: { titre: "行业新闻", toutes: "全部新闻 →", note: "文章为法语。" },
  };

/**
 * Une rangée discrète, sous le journal : les deux dernières actualités.
 *
 * Discrète parce qu'elle vient après tout le reste, et qu'elle n'est pas
 * là pour vendre : elle donne une raison de revenir, et à Google un chemin
 * depuis la page la plus visitée vers les pages qui répondent à ce qu'on
 * cherche cette semaine.
 */
export function ActualitesAccueil({ langue }: { langue: Langue }) {
  const dernieres = toutesLesActualites().slice(0, 2);
  if (dernieres.length === 0) return null;
  const t = TEXTES[langue];

  return (
    <section
      aria-labelledby="actualites-accueil"
      style={{ maxWidth: 1180, margin: "0 auto", padding: "8px 32px 40px" }}
    >
      <div
        style={{
          borderTop: "1px solid var(--line)",
          paddingTop: 28,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <h2
            id="actualites-accueil"
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--accent-dark)",
            }}
          >
            {t.titre}
            {t.note && (
              <span
                style={{
                  marginLeft: 10,
                  fontWeight: 500,
                  letterSpacing: 0,
                  textTransform: "none",
                  color: "var(--ink-soft)",
                }}
              >
                {t.note}
              </span>
            )}
          </h2>
          <Link
            href={CHEMIN_ACTUALITES}
            style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}
          >
            {t.toutes}
          </Link>
        </div>
        <ul
          className="grid gap-4 sm:grid-cols-2"
          style={{ margin: 0, padding: 0, listStyle: "none" }}
        >
          {dernieres.map((actualite) => (
            <li key={actualite.slug}>
              <Link
                href={`${CHEMIN_ACTUALITES}/${actualite.slug}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  textDecoration: "none",
                  color: "var(--ink)",
                }}
              >
                <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
                  {dateLisible(actualite.publieLe)}
                </span>
                <span
                  style={{ fontSize: 16.5, fontWeight: 600, lineHeight: 1.35 }}
                >
                  {actualite.titre}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
