import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Klarr",
};

export default function ConfidentialitePage() {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      version="1.1"
      date="10 septembre 2026"
      current="confidentialite"
    >
      <LegalSection n="01" title="Responsable du traitement">
        <p>
          Le responsable du traitement est <strong>EDIREF</strong>, société à
          responsabilité limitée au capital de 1 000 euros, immatriculée au
          registre du commerce et des sociétés de Paris sous le numéro
          503 428 369, dont le siège social est situé 10 rue de Penthièvre,
          75008 Paris. Pour toute question relative à vos données
          personnelles, contactez{" "}
          <a href="mailto:contact@klarr.biz">contact@klarr.biz</a>.
        </p>
      </LegalSection>

      <LegalSection n="02" title="Données collectées">
        <p>Selon votre usage du tableau de bord, nous traitons :</p>
        <ul>
          <li>
            <strong>Compte</strong> — adresse e-mail, mot de passe (stocké
            chiffré).
          </li>
          <li>
            <strong>Fiche établissement</strong> — nom, adresse, téléphone,
            site web, description, horaires, menu, photos que vous ajoutez
            vous-même.
          </li>
          <li>
            <strong>Mots-clés SEO</strong> — mots-clés que vous suivez pour
            votre établissement.
          </li>
          <li>
            <strong>Connexions tierces</strong> — jetons d&apos;accès et
            données de profil renvoyées par les plateformes que vous
            connectez volontairement (voir section 3).
          </li>
          <li>
            <strong>Prospects</strong> — si vous utilisez le formulaire
            public « test de présence Google », l&apos;e-mail et
            l&apos;établissement renseignés.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n="03" title="Connexions à des services tiers">
        <p>
          Klarr ne se connecte à aucune plateforme tierce sans votre action
          explicite. Chaque connexion se fait via le protocole OAuth : vous
          êtes redirigé vers le service concerné, vous vous authentifiez
          avec votre propre compte, et vous choisissez d&apos;autoriser ou
          non l&apos;accès. Vous pouvez révoquer l&apos;accès à tout moment
          depuis votre tableau de bord Klarr ou directement depuis les
          paramètres du service tiers.
        </p>
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-2 font-semibold">Service</th>
                <th className="px-4 py-2 font-semibold">Données lues</th>
                <th className="px-4 py-2 font-semibold">Publication</th>
              </tr>
            </thead>
            <tbody className="[&_td]:px-4 [&_td]:py-2.5 [&_tr]:border-b [&_tr]:border-zinc-100 [&_tr:last-child]:border-0">
              <tr>
                <td>Google Business Profile</td>
                <td>Compte Google associé (e-mail), fiche(s) d&apos;établissement</td>
                <td>Non — lecture seule</td>
              </tr>
              <tr>
                <td>Facebook / Instagram</td>
                <td>Statut de la Page professionnelle, abonnés, derniers posts</td>
                <td>Non — lecture seule</td>
              </tr>
              <tr>
                <td>TikTok</td>
                <td>
                  Profil public (<code>user.info.basic</code>), statistiques
                  (<code>user.info.stats</code>), dernières vidéos (
                  <code>video.list</code>)
                </td>
                <td>Non — lecture seule</td>
              </tr>
              <tr>
                <td>Yelp / Tripadvisor</td>
                <td>Avis publics de votre établissement (API publiques)</td>
                <td>Non concerné</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Aucune de ces connexions ne permet à Klarr de publier du contenu,
          modifier vos paramètres ou agir en votre nom sur ces plateformes.
        </p>
      </LegalSection>

      <LegalSection n="04" title="Finalités et base légale">
        <p>Vos données sont utilisées pour :</p>
        <ul>
          <li>fournir les fonctionnalités du tableau de bord (exécution du contrat) ;</li>
          <li>
            afficher les données de vos comptes connectés (consentement
            OAuth explicite, révocable) ;
          </li>
          <li>
            générer les analyses de visibilité et suggestions SEO à votre
            demande (intérêt légitime / exécution du contrat) ;
          </li>
          <li>répondre à vos demandes de contact (consentement).</li>
        </ul>
      </LegalSection>

      <LegalSection n="05" title="Hébergement et sous-traitants">
        <p>Klarr fait appel aux sous-traitants suivants :</p>
        <ul>
          <li>
            <strong>Supabase</strong> — base de données et stockage de
            fichiers, hébergés au sein de l&apos;Union européenne.
          </li>
          <li>
            <strong>Vercel</strong> — hébergement de l&apos;application.
          </li>
          <li>
            <strong>Anthropic (Claude)</strong> — génération des analyses de
            visibilité, des suggestions SEO et des propositions de réponse
            aux avis, à votre demande.
          </li>
          <li>
            <strong>Stripe</strong> — traitement des paiements
            d&apos;abonnement et facturation. Vos données de carte sont
            saisies chez Stripe et ne transitent jamais par Klarr.
          </li>
        </ul>
        <p>
          Aucune donnée n&apos;est vendue, louée ou partagée à des fins
          publicitaires.
        </p>
      </LegalSection>

      <LegalSection n="06" title="Transferts hors de l'Union européenne">
        <p>
          Vercel, Anthropic et Stripe sont établis aux États-Unis&nbsp;:
          l&apos;usage de Klarr implique donc un transfert de certaines
          données hors de l&apos;Union européenne. Ces transferts sont
          encadrés par les clauses contractuelles types de la Commission
          européenne, et le cas échéant par le Data Privacy Framework
          lorsque le sous-traitant y est certifié.
        </p>
        <p>
          Lorsque vous reliez un compte Google, Facebook, Instagram ou
          TikTok, les requêtes adressées à ces plateformes sont soumises à
          leurs propres politiques de confidentialité, sur lesquelles EDIREF
          n&apos;a pas la main.
        </p>
      </LegalSection>

      <LegalSection n="07" title="Durée de conservation">
        <p>
          Les données de compte et d&apos;établissement sont conservées tant
          que votre compte est actif, puis effacées selon les modalités
          décrites dans la page{" "}
          <Link href="/suppression-donnees">suppression des données</Link>.
        </p>
        <p>
          Les coordonnées laissées dans le formulaire public « test de
          présence Google » sont conservées trois ans à compter du dernier
          contact, puis supprimées. Vous pouvez en demander l&apos;effacement
          à tout moment.
        </p>
        <p>
          Les factures d&apos;abonnement sont conservées dix ans, durée
          imposée par les obligations comptables.
        </p>
      </LegalSection>

      <LegalSection n="08" title="Cookies">
        <p>
          Klarr utilise uniquement des cookies fonctionnels : maintien de
          votre session de connexion, et cookies techniques temporaires liés
          au processus de connexion OAuth (protection anti-CSRF). Aucun
          cookie publicitaire ou de suivi tiers n&apos;est utilisé.
        </p>
      </LegalSection>

      <LegalSection n="09" title="Vos droits">
        <p>
          Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès,
          de rectification, d&apos;effacement, de portabilité et
          d&apos;opposition sur vos données. Pour l&apos;exercer, écrivez à
          l&apos;adresse de contact indiquée en fin de page. Vous disposez également du
          droit d&apos;introduire une réclamation auprès de la{" "}
          <a href="https://www.cnil.fr" target="_blank" rel="noopener">
            CNIL
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection n="10" title="Sécurité">
        <p>
          Les échanges avec Klarr sont chiffrés (HTTPS). L&apos;accès aux
          données de chaque restaurant est restreint à son propriétaire par
          des règles de sécurité au niveau des lignes (Row Level Security)
          sur la base de données.
        </p>
      </LegalSection>

      <LegalSection n="11" title="Contact et réclamation">
        <p>
          Pour toute question sur cette politique ou vos données :{" "}
          <a href="mailto:contact@klarr.biz">
            contact@klarr.biz
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
