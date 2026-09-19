import Link from "next/link";
import type { CategorieBillet } from "@/types/blog";

/**
 * Ce qu'on propose au lecteur, une fois l'article fini.
 *
 * Le principe d'avant tient toujours : une seule mention de Klarr, à la
 * fin, sans transition forcée. Quelqu'un venu chercher une obligation
 * réglementaire n'est pas venu acheter un logiciel, et le lui rappeler
 * trois fois dans l'article le ferait partir.
 *
 * Deux choses changent. L'encart menait à l'accueil, c'est-à-dire à une
 * page de vente : on demandait à quelqu'un qui cherchait un renseignement
 * de se décider. Il mène maintenant au test de présence — gratuit, sans
 * carte, avec un résultat à l'écran. On donne avant de demander, et on
 * repart avec un contact au lieu d'une visite anonyme.
 *
 * Et la phrase d'accroche suit la rubrique. La même formule pour un
 * article sur le HACCP et pour un article sur les avis Google ne prolonge
 * ni l'un ni l'autre : elle se lit comme une publicité posée là.
 */
const ACCROCHES: Record<CategorieBillet, string> = {
  ouvrir:
    "Quand les démarches seront derrière vous, il restera à vous faire trouver. Votre fiche Google existe peut-être déjà, remplie par Google lui-même ou par un client.",
  remplir:
    "Tout ce qui précède se mesure : ce que votre fiche Google montre vraiment, ce que disent vos avis, et ce que répond une IA quand un client cherche où manger près de chez vous.",
  gerer:
    "Avant de payer une commission pour être trouvé, il vaut la peine de savoir où vous en êtes sans elle : votre fiche, vos avis, et ce que les assistants IA répondent à votre place.",
};

export function InvitationTest({ categorie }: { categorie: CategorieBillet }) {
  return (
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
      <p style={{ margin: 0 }}>{ACCROCHES[categorie]}</p>

      <p style={{ margin: 0 }}>
        Klarr le regarde pour vous et vous rend le constat en trois minutes :
        votre fiche, vos avis, et la réponse exacte d&apos;une IA à la question
        que pose votre client. C&apos;est gratuit et sans carte bancaire.
      </p>

      <Link
        href="/test-presence-google"
        style={{
          alignSelf: "flex-start",
          borderRadius: "0.75rem",
          background: "var(--ink)",
          color: "var(--paper)",
          padding: "0.8rem 1.4rem",
          fontSize: 15,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Tester ma présence en ligne
      </Link>
    </aside>
  );
}
