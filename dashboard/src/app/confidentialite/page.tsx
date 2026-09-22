import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";
import {
  SOUS_TRAITANTS,
  enumererHorsUnion,
  type NomSousTraitant,
} from "@/lib/legal/sous-traitants";

export const metadata: Metadata = {
  // Sans adresse canonique, klarr.net et www.klarr.net se font
  // concurrence dans l'index pour la même page.
  alternates: { canonical: "/confidentialite" },
  title: "Politique de confidentialité",
  description:
    "Quelles données Klarr collecte, pourquoi, combien de temps, et comment les faire effacer.",
};

/** Les en-têtes d'un tableau, dans le style des pages légales. */
const TH = "px-4 py-2 font-semibold";
const CADRE = "overflow-x-auto rounded-xl border border-zinc-200";
const TABLE = "w-full min-w-[480px] border-collapse text-sm";
const TETE =
  "border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500";
const CORPS =
  "[&_td]:px-4 [&_td]:py-2.5 [&_tr]:border-b [&_tr]:border-zinc-100 [&_tr:last-child]:border-0";

/**
 * Ce que chacun fait — vu de cette page-ci.
 *
 * Plus large que dans l'accord de sous-traitance : Vercel y mesure aussi
 * l'audience du site, qui ne porte pas sur les convives et relève donc
 * d'EDIREF responsable de traitement, pas d'EDIREF sous-traitant.
 */
const FINALITES: Record<NomSousTraitant, string> = {
  Supabase: "Base de données, authentification, stockage de fichiers",
  Vercel: "Hébergement de l'application et mesure d'audience agrégée",
  Stripe:
    "Paiement des abonnements, facturation, encaissement des acomptes et cautions",
  Resend: "Acheminement des e-mails : confirmations, rappels, devis, campagnes",
  Anthropic:
    "Audits de visibilité, suggestions et propositions de réponse aux avis, à votre demande",
};

export default function ConfidentialitePage() {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      version="2.2"
      date="22 septembre 2026"
      current="confidentialite"
    >
      <LegalSection n="01" title="Responsable du traitement">
        <p>
          Le responsable du traitement est <strong>EDIREF</strong>, société à
          responsabilité limitée au capital de 1 000 euros, immatriculée au
          registre du commerce et des sociétés de Paris sous le numéro 503 428
          369, dont le siège social est situé 10 rue de Penthièvre, 75008 Paris.
        </p>
        <p>
          Pour toute question relative à vos données personnelles ou pour
          exercer vos droits :{" "}
          <a href="mailto:contact@klarr.net">contact@klarr.net</a>, ou par
          courrier à l&apos;adresse du siège.
        </p>
      </LegalSection>

      <LegalSection
        n="02"
        title="Deux relations, et elles ne se confondent pas"
      >
        <p>
          Klarr traite deux familles de données, dans deux rôles différents.
          C&apos;est la distinction qui commande tout le reste de cette page.
        </p>
        <ul>
          <li>
            <strong>Vos données de restaurateur</strong> — votre compte, votre
            établissement, votre facturation, les coordonnées laissées sur nos
            formulaires publics. EDIREF en est le{" "}
            <strong>responsable de traitement</strong> : c&apos;est elle qui
            décide pourquoi et comment elles sont traitées, et la présente
            politique les décrit.
          </li>
          <li>
            <strong>Les données de vos convives</strong> — celles de vos
            réservations, de votre fichier client, de vos devis et de vos
            campagnes.{" "}
            <strong>Vous en êtes le responsable de traitement</strong> et EDIREF
            agit pour votre compte, en qualité de sous-traitant. Nous ne les
            traitons que pour exécuter le service que vous nous demandez, jamais
            pour notre propre compte ni pour celui d&apos;un autre
            établissement, et nous ne les recoupons pas d&apos;un restaurant à
            l&apos;autre.
          </li>
        </ul>
        <p>
          Cette seconde relation est encadrée par les{" "}
          <Link href="/cgu">conditions d&apos;utilisation</Link> et détaillée
          par l&apos;
          <Link href="/sous-traitance">accord de sous-traitance</Link>, que
          l&apos;article 28 du RGPD rend obligatoire entre un responsable de
          traitement et son sous-traitant.
        </p>
      </LegalSection>

      <LegalSection n="03" title="Données traitées">
        <p>
          <strong>En tant que responsable de traitement</strong>, pour ce qui
          vous concerne :
        </p>
        <ul>
          <li>
            <strong>Compte</strong> — adresse e-mail, mot de passe (stocké sous
            forme d&apos;empreinte, jamais en clair), comptes d&apos;équipe et
            rôles que vous créez.
          </li>
          <li>
            <strong>Fiche établissement</strong> — nom, adresse, téléphone, site
            web, description, horaires, carte, photos.
          </li>
          <li>
            <strong>Abonnement</strong> — identifiants de facturation transmis
            par Stripe. Votre numéro de carte n&apos;arrive jamais jusqu&apos;à
            nous.
          </li>
          <li>
            <strong>Mots-clés et analyses</strong> — mots-clés suivis, résultats
            des audits de visibilité, réponses recueillies auprès des assistants
            conversationnels.
          </li>
          <li>
            <strong>Connexions tierces</strong> — jetons d&apos;accès et données
            de profil renvoyées par les plateformes que vous connectez
            volontairement (section 4).
          </li>
          <li>
            <strong>Notifications</strong> — l&apos;adresse technique de votre
            navigateur, si vous activez les alertes sur votre appareil.
          </li>
          <li>
            <strong>Prospects</strong> — si vous utilisez le formulaire public «
            test de présence Google » : prénom, nom, e-mail, téléphone,
            établissement et ville.
          </li>
          <li>
            <strong>Demandes de rappel</strong> — si vous demandez à être
            rappelé depuis notre assistant : nom, établissement, e-mail,
            téléphone si vous le laissez, et la dernière question que vous lui
            avez posée. Ces éléments ne sont pas enregistrés dans le service :
            ils partent vers notre messagerie et notre outil interne de
            discussion, comme une demande d&apos;assistance.
          </li>
        </ul>
        <p>
          <strong>En tant que sous-traitant</strong>, pour le compte du
          restaurateur, sur les données de ses convives :
        </p>
        <ul>
          <li>
            <strong>Réservations et inscriptions</strong> — nom, e-mail,
            téléphone, nombre de couverts, date, occasion, message laissé au
            restaurant, note interne écrite par le restaurateur.
          </li>
          <li>
            <strong>Fichier client</strong> — la même personne, regroupée par
            adresse e-mail, avec son historique de venues, son consentement
            commercial, la date et l&apos;origine de ce consentement, et sa
            désinscription éventuelle.
          </li>
          <li>
            <strong>Devis de privatisation</strong> — coordonnées du client et
            contenu du devis.
          </li>
          <li>
            <strong>Campagnes</strong> — le texte écrit par le restaurateur et
            le journal des envois : à qui, quand, avec quel résultat.
          </li>
          <li>
            <strong>Jeu (roue de la fortune)</strong> — l&apos;adresse e-mail du
            participant, la date de sa participation, le lot obtenu, son code de
            retrait et sa date d&apos;expiration. Le jeu est organisé par le
            restaurateur, qui en est le responsable de traitement ; son
            règlement figure sur la page du jeu.
          </li>
          <li>
            <strong>Journal des courriels</strong> — trace des confirmations et
            rappels de réservation envoyés, et de leurs échecs.
          </li>
        </ul>
        <p>
          Le jeu s&apos;appuie aussi sur une{" "}
          <strong>empreinte technique non nominative</strong> — dérivée de
          l&apos;adresse IP et du navigateur, conservée sous forme
          d&apos;empreinte et jamais en clair — qui sert uniquement à faire
          respecter le nombre de participations par appareil et par jour. Elle
          ne permet pas d&apos;identifier une personne et ne sert à rien
          d&apos;autre.
        </p>
      </LegalSection>

      <LegalSection n="04" title="Connexions à des services tiers">
        <p>
          Klarr ne se connecte à aucune plateforme tierce sans votre action
          explicite. Chaque connexion se fait via le protocole OAuth : vous êtes
          redirigé vers le service concerné, vous vous authentifiez avec votre
          propre compte, et vous choisissez d&apos;autoriser ou non
          l&apos;accès. Vous pouvez révoquer l&apos;accès à tout moment depuis
          votre tableau de bord Klarr ou directement depuis les paramètres du
          service tiers.
        </p>
        <div className={CADRE}>
          <table className={TABLE}>
            <thead>
              <tr className={TETE}>
                <th className={TH}>Service</th>
                <th className={TH}>Données lues</th>
                <th className={TH}>Publication</th>
              </tr>
            </thead>
            <tbody className={CORPS}>
              <tr>
                <td>Google Business Profile</td>
                <td>
                  Compte Google associé (e-mail), fiche(s) d&apos;établissement
                </td>
                <td>Non — lecture seule</td>
              </tr>
              <tr>
                <td>Facebook / Instagram</td>
                <td>
                  Statut de la Page professionnelle, abonnés, derniers posts
                </td>
                <td>Non — lecture seule</td>
              </tr>
              <tr>
                <td>TikTok</td>
                <td>
                  Profil public (<code>user.info.basic</code>), statistiques (
                  <code>user.info.stats</code>), dernières vidéos (
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

      <LegalSection n="05" title="Finalités et bases légales">
        <div className={CADRE}>
          <table className={TABLE}>
            <thead>
              <tr className={TETE}>
                <th className={TH}>Finalité</th>
                <th className={TH}>Base légale</th>
              </tr>
            </thead>
            <tbody className={CORPS}>
              <tr>
                <td>Fournir le tableau de bord et ses modules</td>
                <td>Exécution du contrat (art. 6.1.b)</td>
              </tr>
              <tr>
                <td>Gérer votre compte et sécuriser son accès</td>
                <td>Exécution du contrat (art. 6.1.b)</td>
              </tr>
              <tr>
                <td>Afficher les données de vos comptes connectés</td>
                <td>
                  Consentement, donné par l&apos;autorisation OAuth et révocable
                  (art. 6.1.a)
                </td>
              </tr>
              <tr>
                <td>
                  Produire les audits de visibilité et les suggestions, à votre
                  demande
                </td>
                <td>Exécution du contrat (art. 6.1.b)</td>
              </tr>
              <tr>
                <td>
                  Répondre à une demande de test de présence et vous en
                  transmettre le résultat
                </td>
                <td>Mesures précontractuelles (art. 6.1.b)</td>
              </tr>
              <tr>
                <td>Vous adresser nos communications professionnelles</td>
                <td>
                  Intérêt légitime en relation entre professionnels (art.
                  6.1.f), opposition possible à tout moment
                </td>
              </tr>
              <tr>
                <td>Établir et conserver la facturation</td>
                <td>Obligation légale (art. 6.1.c)</td>
              </tr>
              <tr>
                <td>Prévenir la fraude et l&apos;abus du service</td>
                <td>Intérêt légitime (art. 6.1.f)</td>
              </tr>
              <tr>
                <td>Traiter les données de vos convives</td>
                <td>
                  Pour votre compte, sur vos instructions — la base légale est
                  celle que vous retenez en tant que responsable
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection n="06" title="Sous-traitants">
        <div className={CADRE}>
          <table className={TABLE}>
            <thead>
              <tr className={TETE}>
                <th className={TH}>Sous-traitant</th>
                <th className={TH}>Finalité</th>
                <th className={TH}>Localisation</th>
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
          Chacun est engagé contractuellement à ne traiter ces données que sur
          instruction.{" "}
          <strong>
            Aucune donnée n&apos;est vendue, louée ou partagée à des fins
            publicitaires
          </strong>
          , et aucune n&apos;est utilisée pour entraîner un modèle
          d&apos;intelligence artificielle.
        </p>
      </LegalSection>

      <LegalSection n="07" title="Transferts hors de l'Union européenne">
        <p>
          {enumererHorsUnion()} sont établis aux États-Unis&nbsp;: l&apos;usage
          de Klarr implique donc un transfert de certaines données hors de
          l&apos;Union européenne. Ces transferts sont encadrés par les clauses
          contractuelles types de la Commission européenne, et le cas échéant
          par le Data Privacy Framework lorsque le sous-traitant y est certifié.
        </p>
        <p>
          Lorsque vous reliez un compte Google, Facebook, Instagram ou TikTok,
          les requêtes adressées à ces plateformes sont soumises à leurs propres
          politiques de confidentialité, sur lesquelles EDIREF n&apos;a pas la
          main.
        </p>
      </LegalSection>

      <LegalSection n="08" title="Durées de conservation">
        <div className={CADRE}>
          <table className={TABLE}>
            <thead>
              <tr className={TETE}>
                <th className={TH}>Donnée</th>
                <th className={TH}>Durée</th>
              </tr>
            </thead>
            <tbody className={CORPS}>
              <tr>
                <td>Compte et fiche établissement</td>
                <td>Durée du contrat, puis trente jours au plus</td>
              </tr>
              <tr>
                <td>
                  Réservations, devis, fichier client, campagnes et journaux
                  d&apos;envoi
                </td>
                <td>
                  Durée du contrat du restaurateur, qui peut les effacer à tout
                  moment
                </td>
              </tr>
              <tr>
                <td>Coordonnées laissées sur le test de présence</td>
                <td>Trois ans après la demande</td>
              </tr>
              <tr>
                <td>Jetons de connexion à un service tiers</td>
                <td>Jusqu&apos;à révocation de la connexion</td>
              </tr>
              <tr>
                <td>Factures et pièces comptables</td>
                <td>Dix ans (obligation légale)</td>
              </tr>
              <tr>
                <td>Participations au jeu et codes de retrait</td>
                <td>
                  Trois ans après la participation — le temps qu&apos;un lot
                  contesté puisse être vérifié
                </td>
              </tr>
              <tr>
                <td>Compteurs techniques (plafonds anti-abus)</td>
                <td>Douze mois</td>
              </tr>
              <tr>
                <td>Journaux de connexion</td>
                <td>Douze mois, chez notre hébergeur de base de données</td>
              </tr>
              <tr>
                <td>Échanges avec l&apos;assistance et demandes de rappel</td>
                <td>
                  Trois ans après la clôture, dans notre messagerie — ils ne
                  sont pas enregistrés dans le service
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Une tâche quotidienne efface ce qui a dépassé ces durées, sans que
          personne ait à le demander. L&apos;effacement intervient aussi à votre
          demande, ou à la fermeture du compte selon les modalités décrites dans
          la page{" "}
          <Link href="/suppression-donnees">suppression des données</Link>. Une
          demande portant sur un convive est exécutée quel que soit le délai
          écoulé.
        </p>
      </LegalSection>

      <LegalSection n="09" title="Cookies">
        <p>
          Klarr utilise uniquement des cookies fonctionnels : maintien de votre
          session de connexion, mémorisation de la langue choisie, et cookies
          techniques temporaires liés au processus de connexion OAuth
          (protection anti-CSRF). Aucun cookie publicitaire ou de suivi tiers
          n&apos;est utilisé.
        </p>
        <p>
          La fréquentation du site est mesurée par Vercel Web Analytics, qui ne
          dépose aucun cookie et ne crée aucun identifiant permettant de vous
          suivre d&apos;une visite à l&apos;autre. Seules des données agrégées
          (pages vues, pays, type d&apos;appareil) sont conservées. Aucun
          consentement n&apos;est donc requis, et aucun profil individuel
          n&apos;est constitué.
        </p>
      </LegalSection>

      <LegalSection n="10" title="Vos droits">
        <p>
          Conformément au RGPD et à la loi Informatique et Libertés, vous
          disposez sur vos données des droits suivants :
        </p>
        <ul>
          <li>
            <strong>Accès</strong> — savoir si vos données sont traitées et en
            obtenir une copie.
          </li>
          <li>
            <strong>Rectification</strong> — corriger ce qui est inexact ou
            incomplet.
          </li>
          <li>
            <strong>Effacement</strong> — les faire supprimer dans les cas
            prévus par la loi.
          </li>
          <li>
            <strong>Limitation</strong> — demander la suspension d&apos;un
            traitement le temps d&apos;une vérification.
          </li>
          <li>
            <strong>Opposition</strong> — vous opposer à un traitement fondé sur
            l&apos;intérêt légitime, notamment à la prospection.
          </li>
          <li>
            <strong>Portabilité</strong> — récupérer vos données dans un format
            lisible par une machine.
          </li>
          <li>
            <strong>Retrait du consentement</strong> — à tout moment, sans que
            cela remette en cause ce qui a été fait avant.
          </li>
        </ul>
        <p>
          Écrivez à <a href="mailto:contact@klarr.net">contact@klarr.net</a>.
          Nous répondons dans un délai d&apos;un mois. Un justificatif
          d&apos;identité peut vous être demandé si un doute subsiste.
        </p>
        <p>
          <strong>Si vous êtes le convive d&apos;un restaurant</strong> et que
          votre demande porte sur vos réservations ou sur les messages que vous
          recevez, adressez-vous d&apos;abord à cet établissement : c&apos;est
          lui qui décide de ces données. Écrivez-nous si vous ne parvenez pas à
          le joindre, et nous ferons le lien.
        </p>
        <p>
          Vous pouvez enfin introduire une réclamation auprès de la{" "}
          <a href="https://www.cnil.fr" target="_blank" rel="noopener">
            CNIL
          </a>{" "}
          — 3 place de Fontenoy, TSA 80715, 75334 Paris cedex 07.
        </p>
      </LegalSection>

      <LegalSection n="11" title="Sécurité">
        <p>
          Les échanges avec Klarr sont chiffrés de bout en bout par HTTPS. Les
          mots de passe ne sont jamais stockés en clair. Les numéros de carte
          bancaire sont saisis chez Stripe et ne transitent jamais par nos
          serveurs.
        </p>
        <p>
          L&apos;accès aux données de chaque restaurant est cloisonné au niveau
          de la base de données elle-même, par des règles de sécurité au niveau
          des lignes (<em>Row Level Security</em>). Ce n&apos;est pas
          l&apos;application qui décide qui voit quoi : c&apos;est la base, ce
          qui reste vrai même en cas de défaut du code.
        </p>
      </LegalSection>

      <LegalSection n="12" title="Violation de données">
        <p>
          En cas de violation de données susceptible d&apos;engendrer un risque
          pour vos droits et libertés, EDIREF en informe la CNIL dans les
          soixante-douze heures, et vous en informe directement lorsque le
          risque est élevé, dans les conditions prévues par les articles 33 et
          34 du RGPD.
        </p>
        <p>
          Lorsque la violation concerne des données de convives, nous prévenons
          le restaurateur concerné : c&apos;est à lui, en tant que responsable
          de traitement, qu&apos;il revient d&apos;en informer les personnes.
        </p>
      </LegalSection>

      <LegalSection n="13" title="Mineurs">
        <p>
          Klarr est un service destiné aux professionnels. Nous ne collectons
          pas sciemment de données concernant des mineurs. Si vous constatez
          qu&apos;un mineur nous a transmis des données, écrivez-nous et nous
          les supprimerons.
        </p>
      </LegalSection>

      <LegalSection n="14" title="Modifications">
        <p>
          Cette politique peut évoluer, notamment lorsque le service change.
          Toute modification substantielle vous sera communiquée par e-mail ou
          signalée dans le tableau de bord. La date d&apos;entrée en vigueur
          figure en tête de page.
        </p>
      </LegalSection>

      <LegalSection n="15" title="Contact">
        <p>
          Pour toute question sur cette politique ou sur vos données :{" "}
          <a href="mailto:contact@klarr.net">contact@klarr.net</a>, ou par
          courrier à EDIREF, 10 rue de Penthièvre, 75008 Paris.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
