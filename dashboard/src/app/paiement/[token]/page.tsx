import { notFound, redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { creerPaiementAcompte, paiementAbouti } from "@/lib/stripe/paiement";
import { cautionEnregistree, demanderCaution } from "@/lib/stripe/caution";
import { langueVisiteur } from "@/lib/i18n/langue";
import { PAIEMENT } from "@/lib/i18n/paiement";
import { sommeEuros } from "@/lib/i18n/nombres";
import { dateLongue } from "@/lib/i18n/dates";
import { creneau } from "@/lib/i18n/jours";
import {
  prevenirAcompteRegle,
  prevenirCautionDeposee,
} from "@/lib/push/argent";
import { chargerSeance, PaiementSeance } from "./seance";

import type { Metadata } from "next";

// L'adresse de cette page contient le jeton de paiement du client. Un moteur
// qui l'indexe le publie : rien de ce qui est ici n'a vocation à être trouvé
// par une recherche.
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: PAIEMENT[await langueVisiteur()].titreOnglet,
    robots: { index: false, follow: false, nocache: true },
  };
}

export const dynamic = "force-dynamic";

type Ligne = {
  id: string;
  restaurant_id: string;
  espace_id: string;
  service_id: string | null;
  date_reservation: string;
  couverts: number;
  client_nom: string;
  client_email: string | null;
  statut: string;
  acompte_centimes: number | null;
  acompte_statut: string;
  caution_centimes: number | null;
  caution_statut: string;
  paiement_token: string;
  stripe_session_id: string | null;
  stripe_setup_session_id: string | null;
};

function Cadre({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-cream px-6 py-16">
      <div className="flex w-full max-w-lg flex-col gap-5 rounded-2xl border border-zinc-200/70 bg-white p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}

export default async function PaiementPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ retour?: string; annule?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  // La page porte « noindex » — le jeton est dans l'adresse : elle peut
  // deviner la langue du navigateur sans conséquence pour Google.
  const langue = await langueVisiteur();
  const p = PAIEMENT[langue];
  const formatDate = (date: string) => dateLongue(date, langue);

  // Le jeton est la seule autorisation : on ne demande pas au visiteur de se
  // connecter, c'est un client du restaurant, pas un utilisateur de Klarr.
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("restaurant_reservations")
    .select(
      "id, restaurant_id, espace_id, service_id, date_reservation, couverts, client_nom, client_email, statut, acompte_centimes, acompte_statut, caution_centimes, caution_statut, paiement_token, stripe_session_id, stripe_setup_session_id",
    )
    .eq("paiement_token", token)
    .maybeSingle();

  // Le jeton peut désigner une séance plutôt qu'une réservation de table :
  // un seul lien, deux natures, et le client n'a pas à savoir laquelle.
  if (!data) {
    const seance = await chargerSeance(supabase, token);
    if (seance) {
      return (
        <PaiementSeance
          seance={seance}
          token={token}
          retour={Boolean(query.retour)}
          annule={Boolean(query.annule)}
          langue={langue}
        />
      );
    }
  }

  const ligne = data as Ligne | null;
  // Le même lien sert l'acompte et la caution : c'est la réservation qui dit
  // lequel des deux est attendu.
  if (!ligne || (!ligne.acompte_centimes && !ligne.caution_centimes)) {
    notFound();
  }
  const enCaution = !ligne.acompte_centimes && Boolean(ligne.caution_centimes);

  const [restaurantResult, espaceResult, serviceResult, connexionResult] =
    await Promise.all([
      supabase
        .from("restaurants")
        .select("nom, adresse")
        .eq("id", ligne.restaurant_id)
        .maybeSingle(),
      supabase
        .from("restaurant_espaces")
        .select("nom")
        .eq("id", ligne.espace_id)
        .maybeSingle(),
      ligne.service_id
        ? supabase
            .from("restaurant_services")
            .select("nom, heure_debut, heure_fin")
            .eq("id", ligne.service_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("restaurant_stripe_connexions")
        .select("stripe_account_id")
        .eq("restaurant_id", ligne.restaurant_id)
        .maybeSingle(),
    ]);

  const restaurant = restaurantResult.data as {
    nom: string;
    adresse: string | null;
  } | null;
  const espace = espaceResult.data as { nom: string } | null;
  const service = serviceResult.data as {
    nom: string;
    heure_debut: string;
    heure_fin: string;
  } | null;
  const connexion = connexionResult.data as {
    stripe_account_id: string;
  } | null;

  if (!restaurant || !espace) notFound();

  const somme = sommeEuros(
    (enCaution ? ligne.caution_centimes : ligne.acompte_centimes) ?? 0,
    langue,
  );

  // — Caution déjà enregistrée : rien de plus à demander au client.
  if (
    enCaution &&
    ["enregistree", "debitee", "liberee"].includes(ligne.caution_statut)
  ) {
    return (
      <Cadre>
        <span className="text-sm font-medium text-emerald-700">
          {p.carteEnregistreeBadge}
        </span>
        <h1 className="text-xl font-semibold text-zinc-900">
          {p.reservationConfirmee(restaurant.nom)}
        </h1>
        <p className="text-sm text-zinc-600">
          {p.cautionDejaPosee(
            somme,
            restaurant.nom,
            formatDate(ligne.date_reservation),
          )}
        </p>
      </Cadre>
    );
  }

  // — Déjà payé : on le dit, et on ne propose pas de payer deux fois.
  if (!enCaution && ligne.acompte_statut === "paye") {
    return (
      <Cadre>
        <span className="text-sm font-medium text-emerald-700">
          {p.acompteRecuBadge}
        </span>
        <h1 className="text-xl font-semibold text-zinc-900">
          {p.reservationConfirmee(restaurant.nom)}
        </h1>
        <p className="text-sm text-zinc-600">
          {p.acompteRecuTexte(
            somme,
            restaurant.nom,
            formatDate(ligne.date_reservation),
          )}
        </p>
      </Cadre>
    );
  }

  if (ligne.statut === "annulee" || ligne.statut === "refusee") {
    return (
      <Cadre>
        <h1 className="text-xl font-semibold text-zinc-900">
          {p.plusActiveTitre}
        </h1>
        <p className="text-sm text-zinc-600">
          {p.plusActiveTexte(restaurant.nom)}
        </p>
      </Cadre>
    );
  }

  // — Retour depuis Stripe : l'état est relu chez eux, jamais déduit de l'URL.
  if (query.retour && connexion) {
    if (enCaution && ligne.stripe_setup_session_id) {
      const resultat = await cautionEnregistree(
        connexion.stripe_account_id,
        ligne.stripe_setup_session_id,
        token,
      );
      if (resultat.enregistree) {
        // Sous condition de statut, et on regarde ce qui a bougé : le
        // webhook fait le même travail de son côté quand le client ne
        // revient pas. Le premier des deux qui passe écrit et prévient ;
        // le second ne trouve plus rien et se tait.
        const { data: posee } = await supabase
          .from("restaurant_reservations")
          .update({
            caution_statut: "enregistree",
            caution_enregistree_le: new Date().toISOString(),
            stripe_customer_id: resultat.customerId,
            stripe_payment_method_id: resultat.carteId,
            // La carte enregistrée rend la réservation ferme : jusque-là,
            // la salle n'était tenue que par une option qui s'éteint seule.
            statut: "confirmee",
            option_expire_le: null,
          })
          .eq("id", ligne.id)
          .eq("caution_statut", "attendue")
          .select("id")
          .maybeSingle();

        if (posee) {
          await prevenirCautionDeposee(supabase, {
            id: ligne.id,
            restaurant_id: ligne.restaurant_id,
            client_nom: ligne.client_nom,
            caution_centimes: ligne.caution_centimes,
          });
        }
        redirect(`/paiement/${token}`);
      }
    } else if (!enCaution && ligne.stripe_session_id) {
      const resultat = await paiementAbouti(
        connexion.stripe_account_id,
        ligne.stripe_session_id,
        token,
      );
      if (resultat.paye) {
        const { data: reglee } = await supabase
          .from("restaurant_reservations")
          .update({
            acompte_statut: "paye",
            acompte_paye_le: new Date().toISOString(),
            stripe_payment_intent_id: resultat.paymentIntentId,
            // Idem : c'est l'acompte qui engage l'établissement.
            statut: "confirmee",
            option_expire_le: null,
          })
          .eq("id", ligne.id)
          .eq("acompte_statut", "attendu")
          .select("id")
          .maybeSingle();

        if (reglee) {
          await prevenirAcompteRegle(supabase, {
            id: ligne.id,
            restaurant_id: ligne.restaurant_id,
            client_nom: ligne.client_nom,
            acompte_centimes: ligne.acompte_centimes,
          });
        }
        redirect(`/paiement/${token}`);
      }
    }
  }

  if (!connexion) {
    return (
      <Cadre>
        <h1 className="text-xl font-semibold text-zinc-900">
          {p.pasOuvertTitre}
        </h1>
        <p className="text-sm text-zinc-600">
          {p.pasOuvertReservation(restaurant.nom)}
        </p>
      </Cadre>
    );
  }

  let lienStripe: string | null = null;
  let echec = false;
  try {
    if (enCaution) {
      const demande = await demanderCaution({
        compteStripe: connexion.stripe_account_id,
        token,
        nomClient: ligne.client_nom,
        emailClient: ligne.client_email,
        reservationId: ligne.id,
      });
      lienStripe = demande.url;
      await supabase
        .from("restaurant_reservations")
        .update({ stripe_setup_session_id: demande.sessionId })
        .eq("id", ligne.id);
    } else {
      const paiement = await creerPaiementAcompte({
        compteStripe: connexion.stripe_account_id,
        token,
        // L'intitulé s'affiche sur la page de Stripe : il parle la langue
        // du client, pas celle du serveur.
        intitule: p.intitulePrivatisation(
          espace.nom,
          ligne.couverts,
          sommeEuros(ligne.acompte_centimes ?? 0, langue),
        ),
        centimes: ligne.acompte_centimes ?? 0,
        emailClient: ligne.client_email,
        reservationId: ligne.id,
      });
      lienStripe = paiement.url;
      await supabase
        .from("restaurant_reservations")
        .update({ stripe_session_id: paiement.sessionId })
        .eq("id", ligne.id);
    }
  } catch (erreur) {
    console.error("[paiement]", erreur);
    echec = true;
  }

  return (
    <Cadre>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-zinc-500">{restaurant.nom}</span>
        <h1 className="text-xl font-semibold text-zinc-900">
          {enCaution ? p.carteEnGarantie : p.acompteDe(somme)}
        </h1>
      </div>

      {enCaution && (
        <p className="rounded-xl bg-brand-orange-soft p-4 text-sm text-brand-navy">
          {p.engagement(
            restaurant.nom,
            sommeEuros(ligne.caution_centimes ?? 0, langue),
          )}
        </p>
      )}

      <dl className="flex flex-col gap-2 border-y border-zinc-100 py-4 text-sm">
        {[
          [p.auNomDe, ligne.client_nom],
          [p.dateLabel, formatDate(ligne.date_reservation)],
          [
            p.serviceLabel,
            service
              ? `${service.nom} — ${creneau(service.heure_debut, service.heure_fin, langue)}`
              : null,
          ],
          [p.espacePrivatise, espace.nom],
          [p.convivesLabel, p.convivesValeur(ligne.couverts)],
        ]
          .filter(([, valeur]) => valeur)
          .map(([libelle, valeur]) => (
            <div key={libelle} className="flex justify-between gap-4">
              <dt className="text-zinc-500">{libelle}</dt>
              <dd className="text-right font-medium text-zinc-900">{valeur}</dd>
            </div>
          ))}
      </dl>

      {query.annule && !echec && (
        <p className="text-sm text-zinc-500">{p.interrompuReservation}</p>
      )}

      {echec || !lienStripe ? (
        <p className="text-sm text-red-600">
          {p.indisponible(restaurant.nom)}
        </p>
      ) : (
        <a
          href={lienStripe}
          className="rounded-md bg-brand-navy px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
        >
          {enCaution ? p.enregistrerMaCarte : p.payer(somme)}
        </a>
      )}

      <p className="text-xs text-zinc-400">
        {enCaution
          ? p.piedCaution(restaurant.nom)
          : p.piedAcompte(restaurant.nom)}
      </p>
    </Cadre>
  );
}
