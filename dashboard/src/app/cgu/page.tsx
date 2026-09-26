import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  // Sans adresse canonique, klarr.net et www.klarr.net se font
  // concurrence dans l'index pour la même page.
  alternates: { canonical: "/cgu" },
  title: "Conditions générales d'utilisation",
  description:
    "Les conditions d'utilisation de Klarr : abonnement, résiliation, responsabilités et données.",
};

export default function CguPage() {
  return (
    <LegalLayout
      title="Conditions générales d'utilisation"
      version="2.2"
      date="22 septembre 2026"
      current="cgu"
    >
      <LegalSection n="01" title="Objet">
        <p>
          Les présentes conditions générales d&apos;utilisation (« CGU »)
          encadrent l&apos;accès et l&apos;utilisation du service Klarr, un
          tableau de bord en ligne permettant à un restaurateur indépendant de
          gérer la présence numérique de son établissement.
        </p>
      </LegalSection>

      <LegalSection n="02" title="Éditeur du service">
        <p>
          Klarr est édité par <strong>EDIREF</strong>, société à responsabilité
          limitée au capital de 1 000 euros, immatriculée au registre du
          commerce et des sociétés de Paris sous le numéro 503 428 369, dont le
          siège social est situé 10 rue de Penthièvre, 75008 Paris.
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
          En souscrivant, vous déclarez agir à des fins professionnelles et
          disposer de la capacité juridique pour engager votre établissement. Le
          droit de rétractation de quatorze jours prévu pour les consommateurs
          ne s&apos;applique donc pas, sauf dans les cas où la loi l&apos;étend
          à un professionnel employant moins de six salariés et souscrivant en
          dehors de son champ d&apos;activité principale.
        </p>
      </LegalSection>

      <LegalSection n="04" title="Compte utilisateur">
        <p>
          L&apos;accès au tableau de bord nécessite la création d&apos;un compte
          (e-mail et mot de passe). Vous êtes responsable de la confidentialité
          de vos identifiants et de toute activité effectuée depuis votre
          compte. Vous vous engagez à fournir des informations exactes sur votre
          établissement et à les tenir à jour.
        </p>
        <p>
          Vos identifiants sont personnels. Pour donner accès à quelqu&apos;un
          de votre équipe, utilisez les comptes d&apos;équipe prévus pour cela
          plutôt que de partager les vôtres : ils permettent de retirer un accès
          sans changer de mot de passe. Si vous constatez une connexion que vous
          n&apos;avez pas autorisée, prévenez-nous sans délai — nous pouvons
          suspendre l&apos;accès le temps de comprendre.
        </p>
      </LegalSection>

      <LegalSection n="05" title="Connexions à des services tiers">
        <p>
          Klarr vous permet de connecter volontairement des comptes tiers
          (Google Business Profile, Facebook, Instagram, TikTok) afin
          d&apos;afficher leurs données dans votre tableau de bord. Chaque
          connexion se fait via une autorisation explicite (OAuth) que vous
          pouvez révoquer à tout moment. Klarr n&apos;accède qu&apos;en lecture
          à ces comptes et ne publie ni ne modifie rien en votre nom, sauf
          fonctionnalité future qui serait explicitement présentée et validée
          par vous avant activation.
        </p>
        <p>
          Klarr n&apos;est ni affilié à, ni approuvé par Google, Meta ou TikTok.
          L&apos;usage de ces connexions reste soumis aux conditions
          d&apos;utilisation propres à chacune de ces plateformes.
        </p>
      </LegalSection>

      <LegalSection n="06" title="Abonnement, prix et paiement">
        <p>
          L&apos;accès aux fonctionnalités de Klarr est soumis à un abonnement
          mensuel, souscrit établissement par établissement depuis la page «
          Abonnement » du tableau de bord. Le prix en vigueur, exprimé hors
          taxes et toutes taxes comprises, vous est présenté sur la page de
          paiement avant toute validation ; aucune somme n&apos;est prélevée
          sans que vous ayez vu ce montant.
        </p>
        <p>
          Chaque module ouvre sur une période d&apos;essai gratuite, décomptée à
          partir de la création de l&apos;établissement :
          <strong> trente jours</strong> pour le module Réservations,
          <strong> quatorze jours</strong> pour le module Klarr — visibilité.
          Aucune carte bancaire n&apos;est demandée pour en bénéficier et aucun
          prélèvement n&apos;intervient à son terme : l&apos;accès au module se
          referme, et il vous appartient de souscrire si vous souhaitez le
          conserver. Les durées affichées sur la page « Abonnement » de votre
          tableau de bord font foi.
        </p>
        <p>
          Le paiement est traité par <strong>Stripe</strong>. EDIREF n&apos;a
          jamais connaissance de votre numéro de carte. La facture
          correspondante est mise à votre disposition par Stripe à chaque
          échéance.
        </p>
        <p>
          L&apos;abonnement se renouvelle par tacite reconduction chaque mois à
          la date anniversaire de la souscription, jusqu&apos;à résiliation. Une
          modification du prix vous serait notifiée au moins un mois avant sa
          prise d&apos;effet, avec la possibilité de résilier sans frais avant
          cette date.
        </p>
      </LegalSection>

      <LegalSection n="07" title="Défaut de paiement">
        <p>
          Si un prélèvement échoue, Stripe le représente selon sa propre
          procédure et vous en êtes informé par e-mail. Il s&apos;agit le plus
          souvent d&apos;une carte expirée : la mettre à jour depuis la page «
          Abonnement » suffit à débloquer la situation.
        </p>
        <p>
          <strong>Votre accès reste ouvert pendant les relances.</strong> Un
          plafond de carte atteint un dimanche ne doit pas fermer votre carnet
          le lundi. Ce n&apos;est qu&apos;une fois la séquence de relances close
          sans règlement que le module concerné se referme.
        </p>
        <p>
          Vos données ne sont alors ni supprimées ni modifiées : elles restent
          en place, et l&apos;accès rouvre dès le règlement. Votre page de
          réservation publique, en revanche, n&apos;est plus accessible tant que
          le module est fermé — nous préférons qu&apos;elle disparaisse plutôt
          qu&apos;elle promette une table que personne ne verra arriver.
        </p>
        <p>
          Les relations entre professionnels étant soumises au code de commerce,
          une somme impayée à son échéance donne lieu de plein droit à des
          pénalités de retard et à l&apos;indemnité forfaitaire de recouvrement
          de 40 euros prévue par l&apos;article L. 441-10 de ce code.
        </p>
      </LegalSection>

      <LegalSection n="08" title="Résiliation">
        <p>
          Vous pouvez résilier votre abonnement à tout moment, sans motif ni
          frais, depuis la page « Abonnement » de votre tableau de bord. La
          résiliation prend effet au terme de la période mensuelle en cours :
          vous conservez l&apos;accès jusqu&apos;à cette échéance, et le mois
          entamé n&apos;est pas remboursé au prorata.
        </p>
        <p>
          Vous pouvez également supprimer votre compte et l&apos;ensemble des
          données associées, selon les modalités décrites dans la page{" "}
          <Link href="/suppression-donnees">suppression des données</Link>.
        </p>
        <p>
          EDIREF se réserve le droit de suspendre ou de fermer un compte en cas
          d&apos;usage abusif, frauduleux ou contraire aux présentes CGU, après
          information de l&apos;utilisateur sauf urgence ou obligation légale.
          Lorsque la situation le permet, nous vous laissons le temps
          d&apos;exporter vos données avant la fermeture.
        </p>
      </LegalSection>

      <LegalSection n="09" title="Disponibilité et assistance">
        <p>
          Nous mettons en œuvre les moyens raisonnables pour que le service soit
          accessible en continu et pour que vos données y soient conservées en
          sécurité. Il s&apos;agit d&apos;une obligation de moyens : nous ne
          garantissons pas une disponibilité ininterrompue, et aucun niveau de
          service chiffré n&apos;est promis par les présentes.
        </p>
        <p>
          Le service et vos données sont hébergés chez des prestataires
          professionnels, listés dans la{" "}
          <Link href="/confidentialite">politique de confidentialité</Link>, qui
          précise également le cadre des transferts hors de l&apos;Union
          européenne.
        </p>
        <p>
          Des interruptions peuvent survenir pour maintenance. Lorsqu&apos;une
          interruption est programmée et qu&apos;elle dépasse quelques minutes,
          nous vous prévenons par e-mail à l&apos;avance.
        </p>
        <p>
          L&apos;assistance se demande par écrit, depuis la page{" "}
          <Link href="/aide/contact">aide</Link> ou à{" "}
          <a href="mailto:contact@klarr.net">contact@klarr.net</a>. Elle est
          comprise dans l&apos;abonnement.
        </p>
      </LegalSection>

      <LegalSection n="10" title="Propriété intellectuelle">
        <p>
          Le nom, le logo, l&apos;interface et le code de Klarr sont la
          propriété de son éditeur. Les présentes ne vous transfèrent aucun
          droit sur eux : elles vous donnent un droit d&apos;usage du service
          pendant la durée de votre abonnement, et rien de plus.
        </p>
        <p>
          Les contenus que vous ajoutez — photos, carte, description de votre
          établissement, textes de vos messages —{" "}
          <strong>restent votre propriété</strong>. Vous garantissez disposer
          des droits nécessaires pour les publier via Klarr.
        </p>
        <p>
          Pour que Klarr puisse faire ce que vous lui demandez — afficher votre
          page de réservation, publier votre carte, joindre vos photos à un
          e-mail envoyé en votre nom —, vous nous concédez sur ces contenus une
          licence d&apos;utilisation gratuite, non exclusive et strictement
          limitée à l&apos;exécution du service, pour la durée de votre
          abonnement. Elle ne nous donne aucun autre droit : nous ne les vendons
          pas, ne les cédons pas, et ne les utilisons pour aucun autre
          établissement. Elle s&apos;éteint avec votre abonnement.
        </p>
        <p>
          Nous pouvons citer le nom et le logo de votre établissement comme
          référence commerciale. Il suffit de nous écrire pour que nous cessions
          de le faire.
        </p>
      </LegalSection>

      <LegalSection n="11" title="Vos contenus et vos envois">
        <p>
          Vous êtes seul responsable de ce que vous publiez via Klarr et de ce
          que vous envoyez à vos clients. Vous vous engagez à ne rien diffuser
          d&apos;illicite, de diffamatoire, de trompeur, de contrefaisant, ni
          rien qui porte atteinte aux droits d&apos;un tiers ou à la dignité des
          personnes.
        </p>
        <p>
          <strong>
            Les messages envoyés à vos clients partent en votre nom.
          </strong>{" "}
          Vous garantissez que les personnes auxquelles vous écrivez ont accepté
          de recevoir vos messages. Klarr n&apos;ajoute personne à votre fichier
          sans une case cochée par la personne elle-même, et chaque envoi porte
          un lien de désinscription : vous vous engagez à ne pas contourner ces
          deux garde-fous, ni à réintégrer quelqu&apos;un qui s&apos;est
          désinscrit.
        </p>
        <p>
          Le fichier client que vous consultez et exportez contient des données
          personnelles appartenant à vos convives. Ce que vous en faites une
          fois exporté relève de votre seule responsabilité.
        </p>
        <p>
          Si un tiers — une personne, une plateforme ou une autorité — met
          EDIREF en cause à raison de vos contenus ou de vos envois, vous vous
          engagez à l&apos;en garantir et à prendre en charge les conséquences
          qui en découleraient.
        </p>
      </LegalSection>

      <LegalSection n="12" title="Jeux et loteries proposés à vos clients">
        <p>
          Klarr met à votre disposition un module de jeu — la roue de la fortune
          — que vous pouvez proposer à vos clients. Si vous l&apos;activez,{" "}
          <strong>vous en êtes l&apos;organisateur</strong> : vous en définissez
          les lots, les chances et la durée, et il vous appartient
          d&apos;honorer les lots attribués. EDIREF fournit l&apos;outil et
          n&apos;est ni organisateur, ni garant, ni partie au jeu.
        </p>
        <p>
          Vous vous engagez à ne proposer que des lots que vous pouvez servir,
          et à honorer tout code présenté pendant sa durée de validité. Un lot
          annoncé et refusé engage votre seule responsabilité, y compris
          vis-à-vis de la répression des fraudes.
        </p>
        <p>
          Un règlement est publié automatiquement à partir de vos réglages, à
          l&apos;adresse de votre jeu, et reste accessible au participant avant
          qu&apos;il ne joue. Il reflète ce que le service applique réellement —
          durée de validité, limites de participation, cases gagnantes et
          perdantes : vous ne pouvez pas en modifier le texte, précisément pour
          qu&apos;il ne puisse pas contredire le fonctionnement.
        </p>
        <p>
          <strong>Le tirage ne peut pas être conditionné à un avis.</strong> Le
          service ne connaît ni la note ni le contenu d&apos;un avis, et le
          résultat est identique que le participant en laisse un ou non. Vous
          vous interdisez de laisser entendre le contraire à vos clients, sur
          quelque support que ce soit — un lot subordonné à un avis positif est
          interdit par les plateformes d&apos;avis et constitue une pratique
          commerciale trompeuse.
        </p>
        <p>
          Sur les données des participants, vous êtes responsable de traitement
          et EDIREF agit pour votre compte, dans les conditions de
          l&apos;article 17.
        </p>
      </LegalSection>

      <LegalSection n="13" title="Responsabilité">
        <p>
          Klarr est fourni « en l&apos;état ». Certaines fonctionnalités
          dépendent de services tiers (Google, Meta, TikTok, Yelp, Tripadvisor,
          assistants conversationnels) dont l&apos;éditeur ne maîtrise ni la
          disponibilité ni l&apos;exactitude des données. Klarr ne saurait être
          tenu responsable d&apos;une interruption, d&apos;une inexactitude, ou
          d&apos;une indisponibilité de ces services tiers.
        </p>
        <p>
          <strong>Klarr ne garantit aucun résultat commercial.</strong> Nous
          mesurons, nous signalons et nous facilitons ; nous ne promettons ni un
          volume de réservations, ni une position dans les résultats de
          recherche, ni qu&apos;un assistant conversationnel citera votre
          établissement. Personne ne peut le promettre, et nous préférons
          l&apos;écrire ici plutôt que de le laisser espérer.
        </p>
        <p>
          Les analyses, suggestions et propositions de réponse produites avec
          l&apos;aide d&apos;un modèle d&apos;intelligence artificielle sont des
          propositions. Elles restent à relire et à valider par vous avant toute
          publication ou tout envoi.
        </p>
        <p>
          En tout état de cause, la responsabilité d&apos;EDIREF au titre des
          présentes est limitée aux dommages directs, et plafonnée au montant
          total que vous lui avez versé au cours des douze mois précédant le
          fait générateur. Sont notamment exclus les préjudices indirects :
          perte de chiffre d&apos;affaires, perte de clientèle, perte de données
          imputable à un tiers, atteinte à l&apos;image.
        </p>
      </LegalSection>

      <LegalSection n="14" title="Force majeure">
        <p>
          Aucune des parties ne peut voir sa responsabilité engagée si
          l&apos;inexécution de ses obligations résulte d&apos;un cas de force
          majeure au sens de l&apos;article 1218 du code civil. Sont notamment
          considérés comme tels la défaillance d&apos;un opérateur de
          télécommunications, une panne majeure d&apos;un prestataire
          d&apos;hébergement, une catastrophe naturelle ou une décision
          d&apos;autorité.
        </p>
        <p>
          La partie empêchée en informe l&apos;autre sans délai. Si
          l&apos;empêchement dure plus de trois mois, chacune des parties peut
          résilier l&apos;abonnement sans indemnité. Les obligations de paiement
          échues avant l&apos;événement restent dues.
        </p>
      </LegalSection>

      <LegalSection n="15" title="Confidentialité">
        <p>
          Chaque partie s&apos;engage à tenir confidentielles les informations
          de l&apos;autre dont elle aurait connaissance à l&apos;occasion du
          contrat, et à ne pas les divulguer sans accord écrit, pendant toute la
          durée de l&apos;abonnement et trois ans après son terme.
        </p>
        <p>
          Cet engagement ne couvre pas les informations déjà publiques, déjà
          connues de celui qui les reçoit, ou dont la communication est exigée
          par une autorité ou par la loi.
        </p>
      </LegalSection>

      <LegalSection n="16" title="Preuve">
        <p>
          Les enregistrements conservés par les systèmes d&apos;EDIREF et de ses
          prestataires — journaux de connexion, historique des réservations,
          journaux d&apos;envoi — sont admis entre les parties comme moyen de
          preuve des opérations effectuées via le service.
        </p>
        <p>
          Vous pouvez à tout moment en demander une copie, et contester le
          contenu d&apos;un enregistrement par tout moyen.
        </p>
      </LegalSection>

      <LegalSection n="17" title="Données personnelles">
        <p>
          Les données que vous nous confiez en tant qu&apos;utilisateur de Klarr
          — votre compte, votre établissement, votre facturation — sont traitées
          par EDIREF dans les conditions décrites par la{" "}
          <Link href="/confidentialite">politique de confidentialité</Link>, qui
          précise les finalités, les durées de conservation, les sous-traitants
          et vos droits.
        </p>
        <p>
          Les données de <strong>vos convives</strong> relèvent d&apos;une autre
          relation : vous en êtes le responsable de traitement, et EDIREF agit
          pour votre compte. Nous ne les traitons que pour exécuter le service
          que vous nous demandez, jamais pour notre propre compte ni pour celui
          d&apos;un autre établissement, et nous les restituons ou les
          supprimons à la fin du contrat selon les modalités de la page{" "}
          <Link href="/suppression-donnees">suppression des données</Link>.
        </p>
        <p>
          Cette relation est encadrée par l&apos;
          <Link href="/sous-traitance">accord de sous-traitance</Link>, annexe
          aux présentes CGU exigée par l&apos;article 28 du RGPD. Il précise ce
          qui est traité, par qui, avec quelles garanties, et ce qu&apos;il
          advient des données à la fin du contrat. Il est accepté en même temps
          que les présentes conditions.
        </p>
      </LegalSection>

      <LegalSection n="18" title="Droit applicable">
        <p>
          Les présentes CGU sont soumises au droit français. Les parties
          s&apos;efforceront de résoudre à l&apos;amiable tout différend. À
          défaut d&apos;accord dans le mois suivant la première notification
          écrite, et le service étant réservé aux professionnels, le litige
          relèvera de la compétence exclusive du tribunal de commerce de Paris.
        </p>
        <p>
          EDIREF peut modifier les présentes CGU. Toute modification
          substantielle sera notifiée par e-mail au moins un mois avant son
          entrée en vigueur ; à défaut d&apos;acceptation, vous pourrez résilier
          votre abonnement sans frais.
        </p>
        <p>
          Si l&apos;une des clauses des présentes était jugée nulle ou
          inapplicable, les autres resteraient en vigueur.
        </p>
      </LegalSection>

      <LegalSection n="19" title="Contact">
        <p>
          Pour toute question relative à ces conditions :{" "}
          <a href="mailto:contact@klarr.net">contact@klarr.net</a>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
