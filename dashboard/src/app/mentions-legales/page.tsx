import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Mentions légales — Klarr",
};

export default function MentionsLegalesPage() {
  return (
    <LegalLayout
      title="Mentions légales"
      version="1.0"
      date="10 septembre 2026"
      current="mentions-legales"
    >
      <LegalSection n="01" title="Éditeur du site">
        <ul>
          <li>
            <strong>Dénomination sociale</strong> — EDIREF
          </li>
          <li>
            <strong>Forme juridique</strong> — société à responsabilité
            limitée
          </li>
          <li>
            <strong>Capital social</strong> — 1 000 euros
          </li>
          <li>
            <strong>Siège social</strong> — 10 rue de Penthièvre, 75008 Paris,
            France
          </li>
          <li>
            <strong>Immatriculation</strong> — RCS Paris 503 428 369
          </li>
          <li>
            <strong>Numéro de TVA intracommunautaire</strong> — FR66 503 428 369
          </li>
          <li>
            <strong>Contact</strong> —{" "}
            <a href="mailto:contact@klarr.biz">contact@klarr.biz</a>
          </li>
        </ul>
      </LegalSection>

      <LegalSection n="02" title="Directeur de la publication">
        <p>Thomas Bavoil, en sa qualité de gérant d&apos;EDIREF.</p>
      </LegalSection>

      <LegalSection n="03" title="Hébergement">
        <p>
          Le site est hébergé par <strong>Vercel Inc.</strong>, 340 S Lemon
          Ave #4133, Walnut, CA 91789, États-Unis —{" "}
          <a href="https://vercel.com" target="_blank" rel="noopener">
            vercel.com
          </a>
          .
        </p>
        <p>
          Les données de compte et d&apos;établissement sont stockées par{" "}
          <strong>Supabase</strong> au sein de l&apos;Union européenne. Le
          détail des sous-traitants figure dans la{" "}
          <Link href="/confidentialite">politique de confidentialité</Link>.
        </p>
      </LegalSection>

      <LegalSection n="04" title="Propriété intellectuelle">
        <p>
          Le nom Klarr, son logo, son interface et les textes de ce site sont
          la propriété d&apos;EDIREF. Toute reproduction ou représentation,
          totale ou partielle, sans autorisation écrite préalable est
          interdite.
        </p>
        <p>
          Les marques Google, Facebook, Instagram, TikTok, Yelp et Tripadvisor
          appartiennent à leurs titulaires respectifs. Klarr n&apos;est ni
          affilié à, ni approuvé par ces sociétés ; leurs noms ne sont cités
          qu&apos;à titre descriptif, pour désigner les services auxquels un
          utilisateur peut relier son établissement.
        </p>
      </LegalSection>

      <LegalSection n="05" title="Données personnelles et cookies">
        <p>
          Le traitement des données personnelles est décrit dans la{" "}
          <Link href="/confidentialite">politique de confidentialité</Link>, et les
          modalités d&apos;effacement dans la page{" "}
          <Link href="/suppression-donnees">suppression des données</Link>.
        </p>
        <p>
          Ce site ne dépose aucun cookie publicitaire ni aucun traceur de
          mesure d&apos;audience. Seuls des cookies strictement nécessaires au
          fonctionnement du service sont utilisés — c&apos;est pourquoi aucun
          bandeau de consentement ne vous est présenté.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
