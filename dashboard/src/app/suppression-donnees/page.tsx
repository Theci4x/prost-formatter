import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Suppression des données — Klarr",
};

export default function SuppressionDonneesPage() {
  return (
    <LegalLayout
      title="Suppression des données"
      version="1.0"
      date="9 septembre 2026"
      current="suppression-donnees"
    >
      <LegalSection n="01" title="Ce que Klarr conserve">
        <p>
          Quand vous reliez un compte (Google, Facebook, Instagram, TikTok) à
          un établissement, Klarr conserve uniquement de quoi lire vos données
          publiques en votre nom :
        </p>
        <ul>
          <li>
            un jeton d&apos;accès délivré par la plateforme, révocable à tout
            moment ;
          </li>
          <li>
            l&apos;identifiant et le nom du compte relié (page Facebook, compte
            Instagram professionnel, compte TikTok, fiche établissement
            Google) ;
          </li>
          <li>
            pour TikTok, le nom affiché et le nombre d&apos;abonnés au moment
            de la connexion.
          </li>
        </ul>
        <p>
          Vos avis, publications et statistiques sont lus à la demande et
          affichés dans le tableau de bord ; ils ne sont pas recopiés dans
          notre base.
        </p>
      </LegalSection>

      <LegalSection n="02" title="Supprimer une connexion vous-même">
        <p>
          C&apos;est immédiat et vous n&apos;avez besoin de personne :
          connectez-vous à Klarr, ouvrez l&apos;établissement concerné, allez
          dans <strong>Connexions</strong>, puis sur la plateforme voulue
          cliquez sur <strong>Gérer</strong> et sur{" "}
          <strong>Déconnecter</strong>.
        </p>
        <p>
          Le jeton d&apos;accès et les informations de compte associées sont
          effacés de nos serveurs au moment du clic. Klarr n&apos;a alors plus
          aucun accès à ce compte.
        </p>
        <p>
          Pour Facebook et Instagram, vous pouvez également retirer
          l&apos;autorisation depuis Facebook : <em>Paramètres et
          confidentialité</em> → <em>Paramètres</em> → <em>Applications et
          sites web</em> → sélectionnez Klarr → <em>Supprimer</em>.
        </p>
      </LegalSection>

      <LegalSection n="03" title="Supprimer un établissement ou tout votre compte">
        <p>
          Supprimer un établissement depuis le tableau de bord efface en même
          temps ses connexions, ses photos, son menu et ses mots-clés.
        </p>
        <p>
          Pour la suppression complète de votre compte et de toutes les
          données associées, écrivez à{" "}
          <a href="mailto:contact@klarr.biz">contact@klarr.biz</a> depuis
          l&apos;adresse e-mail de votre compte, avec pour objet «&nbsp;
          Suppression de mon compte&nbsp;». Nous procédons à la suppression
          sous trente jours au plus et vous confirmons par e-mail une fois
          l&apos;opération faite.
        </p>
      </LegalSection>

      <LegalSection n="04" title="Sauvegardes et obligations légales">
        <p>
          Les données supprimées peuvent subsister jusqu&apos;à trente jours
          dans les sauvegardes chiffrées de notre hébergeur, le temps que
          celles-ci soient renouvelées. Elles n&apos;y sont plus accessibles
          depuis l&apos;application.
        </p>
        <p>
          Les factures d&apos;abonnement sont conservées dix ans, comme la loi
          comptable l&apos;impose ; elles ne contiennent aucune donnée issue
          des plateformes que vous avez reliées.
        </p>
        <p>
          Une question sur vos données ?{" "}
          <a href="mailto:contact@klarr.biz">contact@klarr.biz</a>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
