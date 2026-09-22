import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";
import {
  SOUS_TRAITANTS,
  enumererHorsUnion,
  type NomSousTraitant,
} from "@/lib/legal/sous-traitants";

/** Les en-têtes d'un tableau, dans le style des pages légales. */
const TH = "px-4 py-2 font-semibold";
const CADRE = "overflow-x-auto rounded-xl border border-zinc-200";
const TABLE = "w-full min-w-[480px] border-collapse text-sm";
const TETE =
  "border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500";
const CORPS =
  "[&_td]:px-4 [&_td]:py-2.5 [&_tr]:border-b [&_tr]:border-zinc-100 [&_tr:last-child]:border-0";

export const metadata: Metadata = {
  // Sans adresse canonique, klarr.net et www.klarr.net se font
  // concurrence dans l'index pour la même page.
  alternates: { canonical: "/sous-traitance" },
  title: "Accord de sous-traitance",
  description:
    "L'accord de sous-traitance exigé par l'article 28 du RGPD : ce qu'EDIREF fait des données de vos convives, et à quelles conditions.",
};

/**
 * Ce que chacun fait des données de vos convives — et rien d'autre.
 *
 * Les finalités sont plus étroites que dans la politique de
 * confidentialité, et c'est le sujet même de ce document : Vercel y
 * héberge l'application, sans la mesure d'audience, qui ne porte pas sur
 * les convives et ne relève pas de la sous-traitance.
 */
const FINALITES: Record<NomSousTraitant, string> = {
  Supabase: "Base de données, authentification, stockage de fichiers",
  Vercel: "Hébergement de l'application",
  Stripe: "Encaissement des acomptes et des cautions",
  Resend: "Acheminement des e-mails : confirmations, rappels, devis, campagnes",
  Anthropic: "Suggestions et propositions de réponse aux avis, à votre demande",
};

export default function SousTraitancePage() {
  return (
    <LegalLayout
      title="Accord de sous-traitance"
      version="1.0"
      date="22 septembre 2026"
      current="sous-traitance"
    >
      <LegalSection n="01" title="Pourquoi ce document existe">
        <p>
          Quand un de vos convives réserve une table, laisse son téléphone ou
          reçoit un e-mail de votre part, ces données sont les vôtres. Vous
          décidez pourquoi elles sont collectées et ce qu&apos;on en fait : le
          RGPD vous appelle le <strong>responsable de traitement</strong>. Klarr
          ne fait que les manipuler pour vous, sur votre demande : c&apos;est le{" "}
          <strong>sous-traitant</strong>.
        </p>
        <p>
          L&apos;article 28 du RGPD interdit cette situation sans contrat écrit.
          Pas « recommande » : interdit, et l&apos;obligation pèse sur vous
          comme sur nous. Le présent accord est ce contrat. Il complète les{" "}
          <Link href="/cgu">conditions d&apos;utilisation</Link>, dont il forme
          une annexe, et il est accepté en même temps qu&apos;elles.
        </p>
        <p>
          Il ne concerne <strong>que</strong> les données de vos convives. Vos
          données à vous — votre compte, votre établissement, votre facturation
          — relèvent d&apos;une autre relation, où EDIREF est responsable de
          traitement et que décrit la{" "}
          <Link href="/confidentialite">politique de confidentialité</Link>.
        </p>
      </LegalSection>

      <LegalSection n="02" title="Les parties">
        <ul>
          <li>
            <strong>Le responsable de traitement</strong>, c&apos;est vous :
            l&apos;établissement titulaire de l&apos;abonnement Klarr, tel
            qu&apos;identifié dans son compte.
          </li>
          <li>
            <strong>Le sous-traitant</strong>, c&apos;est{" "}
            <strong>EDIREF</strong>, société à responsabilité limitée
            immatriculée au registre du commerce et des sociétés de Paris sous
            le numéro 503 428 369, dont le siège social est situé 10 rue de
            Penthièvre, 75008 Paris, éditrice du service Klarr.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n="03" title="Ce qui est traité, et pour quoi">
        <p>
          L&apos;article 28 exige que cet accord dise précisément sur quoi il
          porte. Le voici.
        </p>
        <div className={CADRE}>
          <table className={TABLE}>
            <thead>
              <tr className={TETE}>
                <th className={TH}>Point</th>
                <th className={TH}>Ce qu&apos;il en est</th>
              </tr>
            </thead>
            <tbody className={CORPS}>
              <tr>
                <td>Objet</td>
                <td>
                  La fourniture du service Klarr : réservations, fichier client,
                  devis, campagnes, jeu de la roue
                </td>
              </tr>
              <tr>
                <td>Durée</td>
                <td>
                  Celle de votre abonnement, et la période de restitution ou
                  d&apos;effacement qui la suit (article 12)
                </td>
              </tr>
              <tr>
                <td>Nature</td>
                <td>
                  Collecte, enregistrement, conservation, consultation, envoi de
                  messages, effacement
                </td>
              </tr>
              <tr>
                <td>Finalité</td>
                <td>
                  Exécuter le service que vous demandez, et rien d&apos;autre :
                  ni pour notre propre compte, ni pour celui d&apos;un autre
                  établissement
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>Les catégories de données</strong> traitées pour votre compte
          sont : le nom et le prénom du convive, son adresse e-mail, son numéro
          de téléphone, la date, l&apos;heure et le nombre de couverts de sa
          réservation, ses demandes particulières telles qu&apos;il les écrit —
          allergies, occasion, place souhaitée —, l&apos;historique de ses
          venues et de ses annulations, l&apos;état de son consentement à
          recevoir vos campagnes, et le cas échéant sa participation au jeu de
          la roue avec le lot obtenu.
        </p>
        <p>
          <strong>Les personnes concernées</strong> sont vos convives et, quand
          ils s&apos;en servent, ceux de vos clients qui demandent un devis ou
          une privatisation.
        </p>
        <p>
          Un convive peut écrire ce qu&apos;il veut dans le champ des demandes
          particulières, y compris une allergie, qui est une donnée de santé au
          sens de l&apos;article 9. Klarr ne réclame jamais ce type
          d&apos;information et ne la traite pas autrement que comme du texte
          libre. C&apos;est à vous de ne pas en solliciter.
        </p>
      </LegalSection>

      <LegalSection n="04" title="Nous n'agissons que sur vos instructions">
        <p>
          EDIREF ne traite les données de vos convives que sur vos instructions
          documentées. Ces instructions sont : le présent accord, les conditions
          d&apos;utilisation, et les actions que vous effectuez dans le tableau
          de bord — accepter une réservation, envoyer une campagne, exporter
          votre fichier, supprimer une fiche.
        </p>
        <p>
          Nous ne les utilisons pas pour notre propre compte, ne les revendons
          pas, ne les louons pas, ne les recoupons pas d&apos;un établissement à
          l&apos;autre, et ne nous en servons pas pour entraîner un modèle
          d&apos;intelligence artificielle.
        </p>
        <p>
          Si nous estimons qu&apos;une de vos instructions viole le RGPD ou une
          autre règle de protection des données, nous vous en informons sans
          attendre et pouvons suspendre son exécution.
        </p>
        <p>
          Si une loi de l&apos;Union ou d&apos;un État membre nous oblige à
          traiter ces données au-delà de vos instructions, nous vous en
          informons avant de le faire, sauf si cette loi l&apos;interdit pour un
          motif d&apos;intérêt public.
        </p>
      </LegalSection>

      <LegalSection n="05" title="Les personnes qui y ont accès">
        <p>
          Seules les personnes qui en ont besoin pour faire fonctionner le
          service y accèdent. Elles sont tenues à une obligation de
          confidentialité, contractuelle ou légale, qui survit à la fin de leur
          mission.
        </p>
        <p>
          Côté salle, c&apos;est vous qui décidez : les comptes d&apos;équipe
          permettent de donner un accès et de le retirer sans partager vos
          identifiants. Un accès que vous laissez ouvert reste de votre
          responsabilité.
        </p>
      </LegalSection>

      <LegalSection n="06" title="Les mesures de sécurité">
        <p>
          Au titre de l&apos;article 32, les mesures suivantes sont en place.
          Elles sont décrites telles qu&apos;elles existent, pas telles
          qu&apos;on aimerait qu&apos;elles soient.
        </p>
        <ul>
          <li>
            <strong>
              Cloisonnement par établissement au niveau de la base de données.
            </strong>{" "}
            Ce n&apos;est pas l&apos;application qui filtre : chaque table porte
            des règles d&apos;accès, et une requête qui ne présente pas les
            droits du bon établissement ne rend rien. Une erreur de code ne
            suffit donc pas à faire fuiter le fichier d&apos;un restaurant vers
            un autre.
          </li>
          <li>
            <strong>Chiffrement en transit et au repos.</strong> Toutes les
            communications passent en HTTPS ; les données sont chiffrées au
            repos par notre hébergeur de base de données.
          </li>
          <li>
            <strong>Mots de passe.</strong> Nous ne les stockons pas. Ils sont
            gérés et hachés par notre fournisseur d&apos;authentification.
          </li>
          <li>
            <strong>Coordonnées bancaires.</strong> Elles ne transitent jamais
            par nos serveurs : les paiements sont saisis chez Stripe.
          </li>
          <li>
            <strong>Accès nominatifs et révocables</strong> pour votre équipe,
            avec des rôles distincts selon ce que chacun doit pouvoir faire.
          </li>
          <li>
            <strong>Sauvegardes</strong> tenues par notre hébergeur de base de
            données, qui permettent de restaurer le service après un incident.
          </li>
          <li>
            <strong>Effacement automatique</strong> de ce qui a dépassé les
            durées de conservation annoncées.
          </li>
        </ul>
        <p>
          Ces mesures évoluent avec l&apos;état de l&apos;art. Toute
          modification maintient un niveau de protection au moins équivalent.
        </p>
      </LegalSection>

      <LegalSection n="07" title="Les sous-traitants que nous employons">
        <p>
          Vous autorisez EDIREF à faire appel aux sous-traitants ultérieurs
          suivants pour exécuter le service. Chacun est lié par un contrat qui
          lui impose les mêmes obligations que celles du présent accord.
        </p>
        <div className={CADRE}>
          <table className={TABLE}>
            <thead>
              <tr className={TETE}>
                <th className={TH}>Sous-traitant</th>
                <th className={TH}>Ce qu&apos;il fait</th>
                <th className={TH}>Où</th>
              </tr>
            </thead>
            <tbody className={CORPS}>
              {SOUS_TRAITANTS.map((s) => (
                <tr key={s.nom}>
                  <td>{s.nom}</td>
                  <td>{FINALITES[s.nom]}</td>
                  <td>{s.localisation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Avant d&apos;ajouter ou de remplacer l&apos;un d&apos;eux, EDIREF vous
          en informe par e-mail au moins <strong>trente jours</strong> à
          l&apos;avance. Vous pouvez vous y opposer pendant ce délai, pour un
          motif tenant à la protection des données. Si l&apos;opposition ne peut
          être levée, vous pouvez résilier votre abonnement sans frais ni
          préavis, et les sommes versées d&apos;avance vous sont remboursées au
          prorata.
        </p>
        <p>
          EDIREF demeure pleinement responsable devant vous du respect par ces
          sous-traitants de leurs obligations.
        </p>
      </LegalSection>

      <LegalSection n="08" title="Les transferts hors de l'Union européenne">
        <p>
          La base de données est en Union européenne. {enumererHorsUnion()} sont
          établis aux États-Unis : l&apos;usage de Klarr implique donc un
          transfert de certaines données hors de l&apos;Union.
        </p>
        <p>
          Ces transferts sont encadrés par les clauses contractuelles types
          adoptées par la Commission européenne, et le cas échéant par le Data
          Privacy Framework lorsque le sous-traitant y est certifié.
        </p>
      </LegalSection>

      <LegalSection n="09" title="Quand un convive exerce ses droits">
        <p>
          Un convive qui veut accéder à ses données, les corriger, les faire
          effacer ou s&apos;opposer à leur traitement doit s&apos;adresser à
          vous : vous êtes son interlocuteur, pas nous.
        </p>
        <p>
          Le tableau de bord vous permet de répondre seul, et c&apos;est voulu :
          vous pouvez consulter, corriger, exporter et supprimer une fiche
          client sans nous demander quoi que ce soit. Un lien de désinscription
          figure au bas de chaque campagne et fonctionne sans votre
          intervention.
        </p>
        <p>
          Si une demande dépasse ce que le tableau de bord permet, écrivez à{" "}
          <a href="mailto:contact@klarr.net">contact@klarr.net</a> : nous vous
          aidons dans un délai utile pour que vous teniez le vôtre. Si un
          convive s&apos;adresse à nous directement, nous ne lui répondons pas
          sur le fond et nous vous transmettons sa demande.
        </p>
      </LegalSection>

      <LegalSection n="10" title="En cas de violation de données">
        <p>
          Si nous constatons une violation de données touchant celles de vos
          convives — accès non autorisé, perte, divulgation —, nous vous en
          informons{" "}
          <strong>
            sans délai injustifié et au plus tard sous quarante-huit heures
          </strong>{" "}
          après en avoir pris connaissance.
        </p>
        <p>
          Cette information précise, dans la mesure de ce que nous savons : la
          nature de la violation, les catégories et le nombre approximatif de
          personnes et d&apos;enregistrements concernés, les conséquences
          probables, et les mesures prises ou proposées pour y remédier. Si tout
          n&apos;est pas connu d&apos;un coup, nous vous le communiquons au fur
          et à mesure.
        </p>
        <p>
          La notification à la CNIL et, s&apos;il y a lieu, l&apos;information
          des convives vous incombent : c&apos;est vous le responsable de
          traitement. Nous vous fournissons ce qu&apos;il faut pour le faire.
        </p>
      </LegalSection>

      <LegalSection n="11" title="Analyses d'impact et consultation préalable">
        <p>
          Si un traitement que vous menez avec Klarr appelle une analyse
          d&apos;impact relative à la protection des données, ou une
          consultation préalable de la CNIL, nous vous fournissons sur demande
          les informations techniques dont nous disposons et qui vous manquent :
          nature des traitements, mesures de sécurité, sous-traitants,
          localisation.
        </p>
      </LegalSection>

      <LegalSection n="12" title="À la fin du contrat">
        <p>
          À la fin de votre abonnement, vous choisissez : la restitution de vos
          données ou leur effacement. À défaut de choix exprimé dans les{" "}
          <strong>trente jours</strong> suivant la fin du contrat, elles sont
          effacées.
        </p>
        <p>
          La restitution se fait dans un format structuré et lisible par une
          machine, depuis le tableau de bord tant qu&apos;il est accessible, ou
          sur demande écrite ensuite.
        </p>
        <p>
          L&apos;effacement porte aussi sur les copies, sauf celles que nous
          sommes tenus de conserver au titre d&apos;une obligation légale — une
          facture, par exemple, se conserve dix ans. Les sauvegardes sont
          écrasées selon leur cycle de rotation habituel et ne sont pas
          exploitées entre-temps.
        </p>
        <p>
          Les modalités pratiques figurent sur la page{" "}
          <Link href="/suppression-donnees">suppression des données</Link>.
        </p>
      </LegalSection>

      <LegalSection n="13" title="Ce que vous pouvez vérifier">
        <p>
          EDIREF met à votre disposition toute information nécessaire pour
          démontrer le respect de l&apos;article 28. Une demande écrite à{" "}
          <a href="mailto:contact@klarr.net">contact@klarr.net</a> suffit.
        </p>
        <p>
          Vous pouvez faire réaliser un audit, par vous-même ou par un tiers
          indépendant que vous mandatez et qui n&apos;est pas un concurrent
          d&apos;EDIREF. Il s&apos;exerce une fois par an au plus, sauf incident
          de sécurité avéré, sur préavis écrit de trente jours, pendant les
          heures ouvrées, sans perturber le service et sans donner accès aux
          données d&apos;un autre établissement. Les frais sont à votre charge,
          sauf si l&apos;audit révèle un manquement grave.
        </p>
      </LegalSection>

      <LegalSection n="14" title="Ce qui reste à votre charge">
        <p>
          Un accord de sous-traitance ne vous décharge de rien. Restent vos
          obligations, et elles ne sont pas de pure forme :
        </p>
        <ul>
          <li>
            disposer d&apos;une base légale pour chaque traitement que vous
            menez — l&apos;exécution du contrat pour une réservation, le
            consentement pour une campagne commerciale ;
          </li>
          <li>
            informer vos convives de ce que vous faites de leurs données et de
            l&apos;identité de vos sous-traitants, EDIREF compris ;
          </li>
          <li>
            recueillir et conserver la preuve du consentement avant
            d&apos;envoyer une campagne, et ne jamais importer dans Klarr un
            fichier obtenu sans base légale ;
          </li>
          <li>
            tenir votre registre des traitements, et désigner un délégué à la
            protection des données si votre activité l&apos;exige ;
          </li>
          <li>
            ne donner un accès au tableau de bord qu&apos;aux personnes qui en
            ont besoin, et le retirer quand elles quittent la maison.
          </li>
        </ul>
        <p>
          Les instructions que vous nous donnez engagent votre responsabilité.
          Klarr exécute ; il ne vérifie pas que vous aviez le droit de demander.
        </p>
      </LegalSection>

      <LegalSection n="15" title="Durée, modification, droit applicable">
        <p>
          Le présent accord prend effet à la souscription de votre abonnement et
          reste en vigueur tant qu&apos;EDIREF traite des données pour votre
          compte.
        </p>
        <p>
          Toute modification substantielle vous est notifiée par e-mail{" "}
          <strong>un mois</strong> avant son entrée en vigueur. Si elle ne vous
          convient pas, vous pouvez résilier sans frais avant cette date.
        </p>
        <p>
          En cas de contradiction entre le présent accord et les conditions
          d&apos;utilisation sur un point de protection des données, c&apos;est
          le présent accord qui l&apos;emporte.
        </p>
        <p>
          Il est soumis au droit français et relève de la compétence des
          tribunaux de Paris. Pour toute question :{" "}
          <a href="mailto:contact@klarr.net">contact@klarr.net</a>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
