import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation — Klarr",
};

export default function CguPage() {
  return (
    <LegalLayout
      title="Conditions générales d'utilisation"
      version="1.1"
      date="10 septembre 2026"
      current="cgu"
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
          Klarr est édité par <strong>EDIREF</strong>, société à responsabilité
          limitée au capital de 1 000 euros, immatriculée au registre du
          commerce et des sociétés de Paris sous le numéro 503 428 369, dont
          le siège social est situé 10 rue de Penthièvre, 75008 Paris.
          L&apos;ensemble des informations légales figure dans les{" "}
          <Link href="/mentions-legales">mentions légales</Link>.
        </p>
      </LegalSection>

      <LegalSection n="03" title="Public concerné">
        <p>
          Klarr est un service destiné exclusivement à des professionnels
          agissant dans le cadre de leur activité — restaurateurs, gérants
          d&apos;établissement ou leurs mandataires. Il n&apos;est pas proposé
          aux consommateurs au sens du code de la consommation.
        </p>
        <p>
          En souscrivant, vous déclarez agir à des fins professionnelles. Le
          droit de rétractation de quatorze jours prévu pour les
          consommateurs ne s&apos;applique donc pas, sauf dans les cas où la
          loi l&apos;étend à un professionnel employant moins de six salariés
          et souscrivant en dehors de son champ d&apos;activité principale.
        </p>
      </LegalSection>

      <LegalSection n="04" title="Compte utilisateur">
        <p>
          L&apos;accès au tableau de bord nécessite la création d&apos;un
          compte (e-mail et mot de passe). Vous êtes responsable de la
          confidentialité de vos identifiants et de toute activité effectuée
          depuis votre compte. Vous vous engagez à fournir des informations
          exactes sur votre établissement.
        </p>
      </LegalSection>

      <LegalSection n="05" title="Connexions à des services tiers">
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

      <LegalSection n="06" title="Abonnement, prix et paiement">
        <p>
          L&apos;accès aux fonctionnalités de Klarr est soumis à un abonnement
          mensuel, souscrit établissement par établissement depuis la page
          « Abonnement » du tableau de bord. Le prix en vigueur, exprimé hors
          taxes et toutes taxes comprises, vous est présenté sur la page de
          paiement avant toute validation ; aucune somme n&apos;est prélevée
          sans que vous ayez vu ce montant.
        </p>
        <p>
          Le paiement est traité par <strong>Stripe</strong>. EDIREF
          n&apos;a jamais connaissance de votre numéro de carte. La facture
          correspondante est mise à votre disposition par Stripe à chaque
          échéance.
        </p>
        <p>
          L&apos;abonnement se renouvelle par tacite reconduction chaque mois
          à la date anniversaire de la souscription, jusqu&apos;à
          résiliation. Une modification du prix vous serait notifiée au moins
          un mois avant sa prise d&apos;effet, avec la possibilité de
          résilier sans frais avant cette date.
        </p>
      </LegalSection>

      <LegalSection n="07" title="Résiliation">
        <p>
          Vous pouvez résilier votre abonnement à tout moment, sans motif ni
          frais, depuis la page « Abonnement » de votre tableau de bord.
          La résiliation prend effet au terme de la période mensuelle en
          cours : vous conservez l&apos;accès jusqu&apos;à cette échéance, et
          le mois entamé n&apos;est pas remboursé au prorata.
        </p>
        <p>
          Vous pouvez également supprimer votre compte et l&apos;ensemble des
          données associées, selon les modalités décrites dans la page{" "}
          <Link href="/suppression-donnees">suppression des données</Link>.
        </p>
        <p>
          EDIREF se réserve le droit de suspendre un compte en cas
          d&apos;usage abusif, frauduleux ou contraire aux présentes CGU,
          après information de l&apos;utilisateur sauf urgence ou obligation
          légale.
        </p>
      </LegalSection>

      <LegalSection n="08" title="Propriété intellectuelle">
        <p>
          Le nom, le logo et l&apos;interface de Klarr sont la propriété de
          son éditeur. Les contenus que vous ajoutez (photos, menu,
          description de votre établissement) restent votre propriété ; vous
          garantissez disposer des droits nécessaires pour les publier via
          Klarr.
        </p>
      </LegalSection>

      <LegalSection n="09" title="Responsabilité">
        <p>
          Klarr est fourni « en l&apos;état ». Certaines fonctionnalités
          dépendent de services tiers (Google, Meta, TikTok, Yelp,
          Tripadvisor) dont l&apos;éditeur ne maîtrise ni la disponibilité ni
          l&apos;exactitude des données. Klarr ne saurait être tenu
          responsable d&apos;une interruption, d&apos;une inexactitude, ou
          d&apos;une indisponibilité de ces services tiers.
        </p>
      </LegalSection>

      <LegalSection n="10" title="Droit applicable">
        <p>
          Les présentes CGU sont soumises au droit français. Les parties
          s&apos;efforceront de résoudre à l&apos;amiable tout différend.
          À défaut d&apos;accord, et le service étant réservé aux
          professionnels, le litige relèvera de la compétence exclusive du
          tribunal de commerce de Paris.
        </p>
        <p>
          EDIREF peut modifier les présentes CGU. Toute modification
          substantielle sera notifiée par e-mail au moins un mois avant son
          entrée en vigueur ; à défaut d&apos;acceptation, vous pourrez
          résilier votre abonnement sans frais.
        </p>
      </LegalSection>

      <LegalSection n="11" title="Contact">
        <p>
          Pour toute question relative à ces conditions :{" "}
          <a href="mailto:contact@klarr.biz">
            contact@klarr.biz
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
