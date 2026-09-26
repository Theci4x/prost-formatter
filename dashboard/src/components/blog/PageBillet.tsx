import Link from "next/link";
import { notFound } from "next/navigation";
import { Commis } from "@/components/commis/Commis";
import { CadreJournal, Separateur } from "@/components/blog/CadreJournal";
import { LangueDocument } from "@/components/blog/LangueDocument";
import { InvitationTest } from "@/components/blog/InvitationTest";
import { Couverture } from "@/components/blog/Couverture";
import { dateLisible, aLireEnsuite } from "@/lib/blog/billets";
import {
  adressePour,
  billetPour,
  languesDe,
  reecrireLiens,
} from "@/lib/blog/traductions";
import { NOM_LANGUE } from "@/lib/i18n/langues";
import { JOURNAL } from "@/lib/i18n/journal";
import { cheminJournal, type LangueJournal } from "@/types/blog";
import { rendreBillet } from "@/lib/blog/rendu";
import { tempsDeLecture } from "@/types/blog";
import { DonneesStructurees } from "@/components/seo/DonneesStructurees";
import { filAriane } from "@/lib/seo/donnees-structurees";
import { siteUrl } from "@/lib/site-url";

/**
 * Un article du journal, dans la langue demandée.
 *
 * Le même gabarit sert les trois : seul le dictionnaire d'habillage
 * change, et les adresses internes prennent le préfixe de la langue. Le
 * français n'en a pas — ses URL sont indexées depuis le début, et les
 * déplacer coûterait tout ce qu'elles ont gagné.
 */
export async function PageBillet({
  slug,
  langue,
}: {
  /** Le slug français : c'est lui qui identifie l'article. */
  slug: string;
  langue: LangueJournal;
}) {
  const billet = billetPour(slug, langue);
  if (!billet) notFound();

  const t = JOURNAL[langue];
  const racine = cheminJournal(langue);
  const rubrique = t.rubriques[billet.categorie];

  // Le même article ailleurs. Le sélecteur du bandeau règle la langue du
  // site ; ici c'est cette page-là qu'on cherche, et c'est ce qu'on veut
  // quand on tombe sur un texte qu'on ne lit pas.
  const autresLangues = languesDe(slug)
    .filter((autre) => autre !== langue)
    .flatMap((autre) => {
      const adresse = adressePour(slug, autre);
      return adresse ? [{ langue: autre, adresse }] : [];
    });

  // Le contenu vient du dépôt, pas d'un utilisateur : il n'y a pas de saisie
  // hostile à filtrer ici, seulement notre propre texte.
  const { html, sommaire } = await rendreBillet(
    reecrireLiens(billet.markdown, langue),
  );
  // « À lire ensuite » ne propose que ce qui existe dans cette langue.
  // Un lien vers un article français, sous un titre français, au bas
  // d'une page anglaise, est une impasse annoncée comme une piste.
  const voisins = aLireEnsuite(billet).filter(
    ({ billet: autre }) => adressePour(autre.slug, langue) !== null,
  );
  const site = siteUrl();
  const couverture = `/blog/${slug}/opengraph-image`;

  return (
    <>
      {langue !== "fr" && <LangueDocument langue={langue} />}
      <CadreJournal
        langue={langue}
        // La largeur du journal, celle de l'en-tête et du pied : un
        // article plus étroit que son propre fil d'Ariane se lisait comme
        // une colonne posée de travers au milieu de l'écran.
        large
        // Le sélecteur emmène vers ce même article dans la langue
        // choisie ; `langues` dit lesquelles existent, pour que le rappel
        // « c'est en français » ne s'affiche pas là où il y a mieux à
        // proposer qu'une excuse.
        journal={{ article: slug, langues: languesDe(slug) }}
        fil={
          <>
            <Separateur />
            <Link href={racine} style={{ fontSize: 14 }}>
              {t.journal}
            </Link>
            <Separateur />
            <span style={{ fontSize: 14 }}>{rubrique}</span>
          </>
        }
      >
        {/* Le balisage d'article porte les deux dates : Google affiche la
            plus récente, et sur un texte réglementaire c'est elle qui dit
            au lecteur s'il peut s'y fier. */}
        <DonneesStructurees
          donnees={{
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: billet.titre,
            description: billet.resume,
            datePublished: billet.publieLe,
            dateModified: billet.misAJourLe,
            inLanguage: langue,
            image: `${site}${couverture}`,
            mainEntityOfPage: `${site}${racine}/${billet.slug}`,
            /**
             * L'auteur manquait, et c'est le signal que Google appelle
             * E-E-A-T : qui parle, et de quel droit.
             *
             * L'organisation, pas une personne. Les articles ne portent
             * aucune signature à l'écran, et un balisage qui nomme un
             * auteur que la page n'affiche pas contredit ce qu'il
             * accompagne — c'est ce qu'on s'était déjà refusé en
             * renonçant à faire de Thomas Bavoil le fondateur de Klarr.
             * Le jour où un nom signera vraiment ces textes, il aura sa
             * place ici et dans la page.
             */
            author: {
              "@type": "Organization",
              name: "Klarr",
              url: site,
            },
            publisher: {
              "@type": "Organization",
              name: "Klarr",
              url: site,
            },
            ...(billet.sources.length > 0
              ? { citation: billet.sources.map((source) => source.intitule) }
              : {}),
          }}
        />
        <DonneesStructurees
          donnees={filAriane([
            { nom: t.journal, url: `${site}${racine}` },
            { nom: billet.titre, url: `${site}${racine}/${billet.slug}` },
          ])}
        />

        <div className="flex flex-col gap-4">
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--accent-dark)",
            }}
          >
            {rubrique}
          </span>
          <h1
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontSize: "clamp(2rem, 6vw, 2.75rem)",
              lineHeight: 1.1,
              color: "var(--ink)",
            }}
          >
            {billet.titre}
          </h1>
          <p
            style={{
              fontSize: "clamp(1.0625rem, 1rem + 0.35vw, 1.25rem)",
              lineHeight: 1.6,
            }}
          >
            {billet.resume}
          </p>
          <p style={{ fontSize: 13.5 }}>
            {t.misAJour} {dateLisible(billet.misAJourLe, langue)} ·{" "}
            {tempsDeLecture(billet.markdown)} {t.lecture}
          </p>

          {autresLangues.length > 0 && (
            <p style={{ fontSize: 13.5 }}>
              {autresLangues.map((autre, rang) => (
                <span key={autre.langue}>
                  {rang > 0 && " · "}
                  <Link
                    href={autre.adresse}
                    hrefLang={autre.langue}
                    style={{
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                    }}
                  >
                    {NOM_LANGUE[autre.langue]}
                  </Link>
                </span>
              ))}
            </p>
          )}
        </div>

        <div
          style={{
            overflow: "hidden",
            borderRadius: "1rem",
            border: "1px solid var(--line)",
          }}
        >
          <Couverture
            slug={billet.slug}
            rubrique={rubrique}
            image={billet.image}
            ratio={6}
            ratioPhoto={2}
            prioritaire
            largeur="(max-width: 896px) 100vw, 896px"
          />
        </div>
        {billet.image?.credit && (
          <p style={{ marginTop: "-1.25rem", fontSize: 12.5 }}>
            {billet.image.credit}
          </p>
        )}

        {billet.essentiel && billet.essentiel.length > 0 && (
          <section
            style={{
              borderRadius: "1rem",
              border: "1px solid var(--line)",
              background: "var(--paper)",
              padding: "1.35rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem",
            }}
          >
            <h2
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--ink)",
              }}
            >
              {t.essentiel}
            </h2>
            <ul className="flex flex-col gap-2.5">
              {billet.essentiel.map((point) => (
                <li
                  key={point}
                  className="flex gap-2.5"
                  style={{ fontSize: 15.5, lineHeight: 1.6 }}
                >
                  <span
                    aria-hidden
                    style={{
                      flexShrink: 0,
                      marginTop: 9,
                      width: 6,
                      height: 6,
                      borderRadius: 99,
                      background: "var(--accent)",
                    }}
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Un article réglementaire se consulte plus qu'il ne se lit :
            quelqu'un cherche « l'agrément » et veut y aller directement. */}
        {sommaire.length > 2 && (
          <nav
            aria-label={t.sommaire}
            style={{
              borderLeft: "2px solid var(--line)",
              paddingLeft: "1.1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.55rem",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--ink)",
              }}
            >
              {t.sommaire}
            </span>
            {sommaire.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                style={{ fontSize: 15, lineHeight: 1.45 }}
              >
                {section.titre}
              </a>
            ))}
          </nav>
        )}

        <article
          className="billet"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Les sources ne sont pas une coquetterie : un article qui affirme
            une obligation légale sans dire d'où elle sort ne se vérifie pas,
            et ne se relit pas quand le texte change. */}
        {billet.sources.length > 0 && (
          <section
            style={{
              borderRadius: "1rem",
              border: "1px solid var(--line)",
              background: "var(--paper)",
              padding: "1.35rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem",
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
              {t.sources}
            </h2>
            <ul className="flex flex-col gap-2">
              {billet.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 14.5,
                      color: "var(--accent-dark)",
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                    }}
                  >
                    {source.intitule}
                  </a>
                </li>
              ))}
            </ul>
            <p style={{ fontSize: 13 }}>
              {t.avertissement} {dateLisible(billet.misAJourLe, langue)}.
            </p>
          </section>
        )}

        {voisins.length > 0 && (
          <section
            className="flex flex-col gap-3 pt-2"
            style={{ borderTop: "1px solid var(--line)", paddingTop: "1.5rem" }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
              {t.suite}
            </h2>
            <ul className="flex flex-col gap-3">
              {voisins.map(({ billet: autre, pourquoi }) => (
                <li key={autre.slug} className="flex flex-col gap-0.5">
                  <Link
                    href={adressePour(autre.slug, langue) ?? racine}
                    style={{
                      fontSize: 15.5,
                      fontWeight: 600,
                      color: "var(--accent-dark)",
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                    }}
                  >
                    {autre.titre}
                  </Link>
                  {/* La raison plutôt que le seul titre : un titre de plus
                      se saute, une phrase qui dit ce qu'on y gagne se lit. */}
                  {pourquoi && (
                    <span style={{ fontSize: 14.5, color: "var(--ink-soft)" }}>
                      {pourquoi}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <InvitationTest categorie={billet.categorie} />
      </CadreJournal>
      <Commis />
    </>
  );
}
