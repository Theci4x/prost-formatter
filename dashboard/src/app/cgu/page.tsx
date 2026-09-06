import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation — Klarr",
};

export default function CguPage() {
  return (
    <LegalLayout
      title="Conditions générales d'utilisation"
      version="1.0"
      otherPageHref="/confidentialite"
      otherPageLabel="Politique de confidentialité"
    >
      <LegalSection n="01" title="Objet">
        <p>
          Les présentes conditions générales d&apos;utilisation (« CGU »)
          encadrent l&apos;accès et l&apos;utilisation du service Klarr, un
          tableau de bord en ligne permettant à un restaurateur indépendant
          de gérer la présence numérique de son établissement.
        </p>
      </LegalSection>

      <LegalSection n="02" title="Éditeur du service">
        <p>
          Klarr est actuellement développé et exploité par Michael Fink, en
          nom propre, dans l&apos;attente de la création de la structure
          juridique dédiée (société). Contact :{" "}
          <a href="mailto:michael.fink75@gmail.com">
            michael.fink75@gmail.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection n="03" title="Compte utilisateur">
        <p>
          L&apos;accès au tableau de bord nécessite la création d&apos;un
          compte (e-mail et mot de passe). Vous êtes responsable de la
          confidentialité de vos identifiants et de toute activité effectuée
          depuis votre compte. Vous vous engagez à fournir des informations
          exactes sur votre établissement.
        </p>
      </LegalSection>

      <LegalSection n="04" title="Connexions à des services tiers">
        <p>
          Klarr vous permet de connecter volontairement des comptes tiers
          (Google Business Profile, Facebook, Instagram, TikTok) afin
          d&apos;afficher leurs données dans votre tableau de bord. Chaque
          connexion se fait via une autorisation explicite (OAuth) que vous
          pouvez révoquer à tout moment. Klarr n&apos;accède qu&apos;en
          lecture à ces comptes et ne publie ni ne modifie rien en votre nom,
          sauf fonctionnalité future qui serait explicitement présentée et
          validée par vous avant activation.
        </p>
        <p>
          Klarr n&apos;est ni affilié à, ni approuvé par Google, Meta ou
          TikTok. L&apos;usage de ces connexions reste soumis aux conditions
          d&apos;utilisation propres à chacune de ces plateformes.
        </p>
      </LegalSection>

      <LegalSection n="05" title="Accès et tarifs">
        <p>
          Klarr est actuellement en phase de lancement : l&apos;accès est
          proposé gratuitement ou sur invitation. Une offre d&apos;abonnement
          payante sera introduite ultérieurement ; les utilisateurs en seront
          informés à l&apos;avance et pourront choisir de la souscrire ou de
          résilier leur compte.
        </p>
      </LegalSection>

      <LegalSection n="06" title="Résiliation">
        <p>
          Vous pouvez supprimer votre compte et l&apos;ensemble des données
          associées à tout moment en écrivant à l&apos;adresse de contact.
          Klarr se réserve le droit de suspendre un compte en cas d&apos;usage
          abusif ou contraire aux présentes CGU.
        </p>
      </LegalSection>

      <LegalSection n="07" title="Propriété intellectuelle">
        <p>
          Le nom, le logo et l&apos;interface de Klarr sont la propriété de
          son éditeur. Les contenus que vous ajoutez (photos, menu,
          description de votre établissement) restent votre propriété ; vous
          garantissez disposer des droits nécessaires pour les publier via
          Klarr.
        </p>
      </LegalSection>

      <LegalSection n="08" title="Responsabilité">
        <p>
          Klarr est fourni « en l&apos;état ». Certaines fonctionnalités
          dépendent de services tiers (Google, Meta, TikTok, Yelp,
          Tripadvisor) dont l&apos;éditeur ne maîtrise ni la disponibilité ni
          l&apos;exactitude des données. Klarr ne saurait être tenu
          responsable d&apos;une interruption, d&apos;une inexactitude, ou
          d&apos;une indisponibilité de ces services tiers.
        </p>
      </LegalSection>

      <LegalSection n="09" title="Droit applicable">
        <p>
          Les présentes CGU sont soumises au droit français. Tout litige
          relève, à défaut de résolution amiable, des tribunaux compétents.
        </p>
      </LegalSection>

      <LegalSection n="10" title="Contact">
        <p>
          Pour toute question relative à ces conditions :{" "}
          <a href="mailto:michael.fink75@gmail.com">
            michael.fink75@gmail.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
