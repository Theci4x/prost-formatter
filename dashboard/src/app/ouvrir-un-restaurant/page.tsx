import type { Metadata } from "next";
import Link from "next/link";
import { Commis } from "@/components/commis/Commis";
import { RappelOuverture } from "@/components/ouverture/RappelOuverture";
import { DonneesStructurees } from "@/components/seo/DonneesStructurees";
import { filAriane } from "@/lib/seo/donnees-structurees";
import { siteUrl } from "@/lib/site-url";

/**
 * Le plan d'ouverture : le fil qui relie les outils entre eux.
 *
 * Pas un sixième outil. Les cinq précédents répondent chacun à une
 * question précise et se suffisent à eux-mêmes ; ce qui manquait était
 * l'ordre dans lequel on les rencontre, parce qu'on ne cherche pas un
 * calendrier d'ouverture quand on hésite encore sur un local.
 *
 * Et surtout, le rappel. C'est la vraie raison d'être de cette page. Une
 * série d'outils gratuits pour des gens à six ou dix-huit mois de leur
 * ouverture, sans moyen de revenir vers eux, fait la prospection des
 * concurrents : on rend le service, le concurrent passe l'appel au
 * huitième mois. Le formulaire est donc en bas mais il n'est pas
 * accessoire — c'est lui qui transforme une bonne action en travail
 * utile.
 */

const CHEMIN = "/ouvrir-un-restaurant";

export const metadata: Metadata = {
  title: "Ouvrir un restaurant : par quoi commencer, dans quel ordre",
  description:
    "Le local avant tout le reste, puis les autorisations, puis la visibilité. Quatre outils gratuits, dans l'ordre où les questions se posent — et un rappel le mois de votre ouverture.",
  alternates: { canonical: CHEMIN },
};

type Etape = {
  moment: string;
  titre: string;
  texte: string;
  lien: string;
  action: string;
};

const ETAPES: Etape[] = [
  {
    moment: "Avant de signer",
    titre: "Ce local peut-il accueillir un restaurant ?",
    texte:
      "Extraction, destination du bail, copropriété, ERP, terrasse. Cinq points, et ce sont les seuls qui peuvent rendre le projet impossible plutôt que coûteux. Tout le reste se rattrape ; ceux-là, non.",
    lien: "/diagnostic-local-restaurant",
    action: "Faire le diagnostic",
  },
  {
    moment: "Une fois le local tenu",
    titre: "Quand commencer chaque démarche ?",
    texte:
      "Donnez votre date d'ouverture, on remonte le fil. Les délais fixés par un texte sont calculés ; ceux qui dépendent de votre mairie sont signalés comme tels plutôt que devinés.",
    lien: "/calendrier-ouverture-restaurant",
    action: "Voir le calendrier",
  },
  {
    moment: "Dans les semaines qui précèdent",
    titre: "Est-ce qu'on vous trouve ?",
    texte:
      "La fiche Google se crée avant l'ouverture, pas le jour J : sa vérification passe souvent par un courrier postal. On regarde ce que Google, les avis et les IA disent de vous aujourd'hui.",
    lien: "/audit-fiche-google-restaurant",
    action: "Auditer la fiche",
  },
  {
    moment: "Quand le carnet se choisit",
    titre: "Commission ou abonnement ?",
    texte:
      "La question se tranche avec vos chiffres, pas avec les nôtres. Le calculateur peut très bien conclure que la plateforme vous coûte moins cher — il le dit quand c'est le cas.",
    lien: "/calculateur-commissions-restaurant",
    action: "Faire le calcul",
  },
];

export default function OuvrirPage() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 py-12">
        <DonneesStructurees
          donnees={filAriane([
            { nom: "Klarr", url: siteUrl() },
            { nom: "Ouvrir un restaurant", url: `${siteUrl()}${CHEMIN}` },
          ])}
        />

        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-orange">
            Ouvrir
          </span>
          <h1 className="font-serif text-4xl text-ink sm:text-5xl">
            Par quoi commencer
          </h1>
          <p className="text-base text-zinc-600">
            Quatre outils, gratuits, sans compte à créer, dans l&apos;ordre où
            les questions se posent vraiment. Aucun ne vous vend quoi que ce
            soit — et deux d&apos;entre eux peuvent conclure contre nous.
          </p>
        </div>

        <ol className="flex flex-col gap-4">
          {ETAPES.map((etape, rang) => (
            <li
              key={etape.lien}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-orange">
                  {rang + 1} · {etape.moment}
                </span>
                <h2 className="text-base font-semibold text-zinc-900">
                  {etape.titre}
                </h2>
              </div>
              <p className="text-sm text-zinc-600">{etape.texte}</p>
              <Link
                href={etape.lien}
                className="w-fit rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-brand-navy transition-colors hover:border-brand-navy"
              >
                {etape.action} →
              </Link>
            </li>
          ))}
        </ol>

        <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-zinc-900">
            Et le reste du parcours
          </p>
          <p className="text-sm text-zinc-600">
            Licence, déclaration sanitaire, hygiène, musique, TVA, bruit : le
            journal les traite un par un, avec les textes en bas de page pour
            que vous puissiez vérifier.
          </p>
          <Link
            href="/blog"
            className="w-fit text-sm text-brand-navy underline-offset-2 hover:underline"
          >
            Le journal →
          </Link>
        </div>

        <RappelOuverture source="plan-ouverture" />
      </main>

      <Commis />
    </div>
  );
}
