import type { Metadata } from "next";
import Link from "next/link";
import { Commis } from "@/components/commis/Commis";
import { EnteteOutil } from "@/components/outils/EnteteOutil";
import { DonneesStructurees } from "@/components/seo/DonneesStructurees";
import { filAriane } from "@/lib/seo/donnees-structurees";
import { siteUrl } from "@/lib/site-url";
import { LIBELLE_MODULE, PRIX_MODULE } from "@/lib/abonnement/modules";

/**
 * La porte d'entrée de l'audit de visibilité.
 *
 * L'audit lui-même existe depuis longtemps, et il fait bien plus qu'un
 * « kit de lancement Google » : il interroge la fiche réelle, la note,
 * les photos, la fraîcheur des avis, le balisage du site et sa présence
 * dans les réponses des IA. Ce qui lui manquait était une porte : une
 * page qui réponde à « auditer ma fiche Google restaurant » et qui
 * explique ce qu'on regarde avant de demander une adresse.
 *
 * Le formulaire, lui, reste `noindex` — c'est un formulaire, il ne
 * répond à aucune recherche. Celle-ci y répond, donc elle s'indexe.
 *
 * **Elle démontre, elle ne remplace pas.** C'est le point de cette page
 * et la raison pour laquelle Klarr ne distribue pas un guide « comment
 * remplir votre fiche » : un guide apprend au restaurateur à se passer
 * du module de visibilité, qu'il paie. Montrer ce qui manque chez lui,
 * précisément, avec ses chiffres, fait l'inverse — et lui rend service
 * dans les deux cas, puisqu'il repart avec la liste même s'il ne prend
 * rien.
 */

const CHEMIN = "/audit-fiche-google-restaurant";

export const metadata: Metadata = {
  title: "Auditer sa fiche Google de restaurant, gratuitement",
  description:
    "Ce que Google, les avis et les IA disent de votre restaurant aujourd'hui. Photos, horaires, fraîcheur des avis, balisage du site : ce qu'on regarde, et ce que l'audit vous rend.",
  alternates: { canonical: CHEMIN },
};

type Pilier = {
  titre: string;
  quoi: string;
  signaux: string[];
  article: { slug: string; titre: string };
};

/**
 * Les trois piliers, décrits d'après ce que le code mesure vraiment —
 * voir `lib/audit/scoring.ts`. Écrire ici une liste plus flatteuse que
 * l'algorithme serait le plus court chemin vers un prospect déçu à la
 * lecture de son rapport.
 */
const PILIERS: Pilier[] = [
  {
    titre: "La fiche",
    quoi: "Ce que Google affiche de vous à quelqu'un qui cherche un restaurant dans votre rue.",
    signaux: [
      "Le téléphone et le site sont-ils renseignés",
      "Les horaires sont-ils publiés",
      "Combien de photos — en dessous d'une quinzaine, une fiche paraît vide",
      "La note, et le nombre d'avis qui la porte",
    ],
    article: {
      slug: "pourquoi-je-sors-derriere-mon-voisin-google-maps",
      titre: "Pourquoi vous sortez derrière le restaurant d'à côté",
    },
  },
  {
    titre: "Les avis",
    quoi: "Pas seulement la note : le volume, et surtout la fraîcheur.",
    signaux: [
      "La note moyenne",
      "Le nombre d'avis, jusqu'à deux cents",
      "La part de vos avis qui datent de moins de six mois",
      "Une bonne note vieille de trois ans pèse moins qu'une note correcte alimentée chaque mois",
    ],
    article: {
      slug: "avis-google-restaurant-ce-qui-est-interdit",
      titre: "Les avis Google : ce que vous n'avez pas le droit de faire",
    },
  },
  {
    titre: "Les IA",
    quoi: "Ce qu'un assistant répond quand on lui demande où manger chez vous.",
    signaux: [
      "Votre site est-il joignable",
      "Porte-t-il un balisage que les machines lisent",
      "Ce balisage dit-il « restaurant », ou seulement « site web »",
      "Vos réseaux sont-ils déclarés comme étant les vôtres",
    ],
    article: {
      slug: "pourquoi-chatgpt-ne-parle-pas-de-votre-restaurant",
      titre: "Pourquoi ChatGPT ne parle jamais de votre restaurant",
    },
  },
];

export default function AuditPage() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <EnteteOutil />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-5 py-12">
        <DonneesStructurees
          donnees={filAriane([
            { nom: "Klarr", url: siteUrl() },
            { nom: "Audit de fiche Google", url: `${siteUrl()}${CHEMIN}` },
          ])}
        />

        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-orange">
            Gratuit
          </span>
          <h1 className="font-serif text-4xl text-ink sm:text-5xl">
            Ce que Google dit de votre restaurant aujourd&apos;hui
          </h1>
          <p className="text-base text-zinc-600">
            Donnez le nom et l&apos;adresse. On regarde votre fiche réelle — pas
            un modèle — et on vous rend la liste de ce qui manque, classée par
            ce qui rapporte le plus. Sans compte à créer.
          </p>
          <Link
            href="/test-presence-google"
            className="w-fit rounded-md bg-brand-navy px-5 py-3 text-base font-medium text-white transition-colors hover:bg-brand-navy-hover"
          >
            Lancer l&apos;audit
          </Link>
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-3xl text-ink">
            Ce qu&apos;on regarde
          </h2>
          {PILIERS.map((pilier) => (
            <article
              key={pilier.titre}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-zinc-900">
                  {pilier.titre}
                </h3>
                <p className="text-base text-zinc-600">{pilier.quoi}</p>
              </div>
              <ul className="flex flex-col gap-1.5">
                {pilier.signaux.map((signal) => (
                  <li
                    key={signal}
                    className="flex gap-2 text-base text-zinc-600"
                  >
                    <span aria-hidden="true" className="text-zinc-300">
                      —
                    </span>
                    {signal}
                  </li>
                ))}
              </ul>
              <Link
                href={`/blog/${pilier.article.slug}`}
                className="w-fit text-base text-brand-navy underline-offset-2 hover:underline"
              >
                {pilier.article.titre} →
              </Link>
            </article>
          ))}
        </section>

        {/* La frontière, dite franchement. Un prospect qui comprend ce
            qu'il achète discute moins et reste plus longtemps. */}
        <section className="flex flex-col gap-3 rounded-2xl border border-zinc-300 bg-white p-6">
          <h2 className="text-base font-semibold text-zinc-900">
            Ce qui est gratuit, et ce qui ne l&apos;est pas
          </h2>
          <p className="text-base text-zinc-600">
            <strong>Le constat est gratuit</strong>, et il l&apos;est vraiment :
            vous repartez avec la liste, vous la traitez vous-même si vous
            voulez, et nous n&apos;avons rien à y redire. C&apos;est du travail
            de fiche, pas de la magie — quelqu&apos;un de méthodique y arrive.
          </p>
          <p className="text-base text-zinc-600">
            <strong>
              Ce qui se paie, c&apos;est de ne plus avoir à y penser.
            </strong>{" "}
            Le module « {LIBELLE_MODULE.visibilite} », à{" "}
            {PRIX_MODULE.visibilite}, tient la fiche à jour, centralise les avis
            et vous propose des réponses, suit vos mots-clés et regarde ce que
            les IA racontent de vous. La différence entre les deux n&apos;est
            pas le savoir : c&apos;est les heures du mardi après-midi.
          </p>
          <p className="text-base text-zinc-600">
            Et le geste qui rapporte le plus ne dépend de personne : mettez
            l&apos;adresse de votre page de réservation dans le champ prévu de
            votre fiche Google. Cinq minutes, une fois, gratuit, et sans nous.
          </p>
        </section>

        <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
          <p className="text-base font-semibold text-zinc-900">
            Vous n&apos;avez pas encore ouvert ?
          </p>
          <p className="text-base text-zinc-600">
            La fiche Google se crée avant l&apos;ouverture : la vérification
            passe souvent par un courrier postal, et l&apos;attendre le jour J
            revient à ouvrir sans exister sur la carte.
          </p>
          <Link
            href="/calendrier-ouverture-restaurant"
            className="w-fit text-base text-brand-navy underline-offset-2 hover:underline"
          >
            Le calendrier, à rebours depuis votre date d&apos;ouverture →
          </Link>
        </div>
      </main>

      <Commis />
    </div>
  );
}
