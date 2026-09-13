import { notFound, redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { creerPaiementAcompte, paiementAbouti } from "@/lib/stripe/paiement";
import { formatEuros, resumePourClient } from "@/lib/reservations/acompte";
import { formatCreneau } from "@/types/reservation";

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
  paiement_token: string;
  stripe_session_id: string | null;
};

function formatDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Cadre({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF7F0] px-6 py-16">
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

  // Le jeton est la seule autorisation : on ne demande pas au visiteur de se
  // connecter, c'est un client du restaurant, pas un utilisateur de Klarr.
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("restaurant_reservations")
    .select(
      "id, restaurant_id, espace_id, service_id, date_reservation, couverts, client_nom, client_email, statut, acompte_centimes, acompte_statut, paiement_token, stripe_session_id",
    )
    .eq("paiement_token", token)
    .maybeSingle();

  const ligne = data as Ligne | null;
  if (!ligne || !ligne.acompte_centimes) notFound();

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

  const somme = formatEuros(ligne.acompte_centimes);

  // — Déjà payé : on le dit, et on ne propose pas de payer deux fois.
  if (ligne.acompte_statut === "paye") {
    return (
      <Cadre>
        <span className="text-sm font-medium text-emerald-700">
          Acompte reçu
        </span>
        <h1 className="text-xl font-semibold text-zinc-900">
          Votre réservation chez {restaurant.nom} est confirmée.
        </h1>
        <p className="text-sm text-zinc-600">
          Nous avons bien reçu votre acompte de {somme}. Cette page vaut reçu ;
          {" "}
          {restaurant.nom} vous attend le {formatDate(ligne.date_reservation)}.
        </p>
      </Cadre>
    );
  }

  if (ligne.statut === "annulee" || ligne.statut === "refusee") {
    return (
      <Cadre>
        <h1 className="text-xl font-semibold text-zinc-900">
          Cette réservation n&apos;est plus active.
        </h1>
        <p className="text-sm text-zinc-600">
          Aucun paiement n&apos;est attendu. Contactez {restaurant.nom} si vous
          pensez qu&apos;il s&apos;agit d&apos;une erreur.
        </p>
      </Cadre>
    );
  }

  // — Retour depuis Stripe : l'état est relu chez eux, jamais déduit de l'URL.
  if (query.retour && connexion && ligne.stripe_session_id) {
    const resultat = await paiementAbouti(
      connexion.stripe_account_id,
      ligne.stripe_session_id,
      token,
    );
    if (resultat.paye) {
      await supabase
        .from("restaurant_reservations")
        .update({
          acompte_statut: "paye",
          acompte_paye_le: new Date().toISOString(),
          stripe_payment_intent_id: resultat.paymentIntentId,
        })
        .eq("id", ligne.id);
      redirect(`/paiement/${token}`);
    }
  }

  if (!connexion) {
    return (
      <Cadre>
        <h1 className="text-xl font-semibold text-zinc-900">
          Le paiement n&apos;est pas encore ouvert.
        </h1>
        <p className="text-sm text-zinc-600">
          {restaurant.nom} doit terminer la configuration de ses paiements.
          Reprenez contact avec l&apos;établissement — rien n&apos;est perdu,
          votre réservation reste enregistrée.
        </p>
      </Cadre>
    );
  }

  let lienStripe: string | null = null;
  let echec = false;
  try {
    const paiement = await creerPaiementAcompte({
      compteStripe: connexion.stripe_account_id,
      token,
      intitule: resumePourClient(espace, ligne.couverts, ligne.acompte_centimes),
      centimes: ligne.acompte_centimes,
      emailClient: ligne.client_email,
      reservationId: ligne.id,
    });
    lienStripe = paiement.url;
    await supabase
      .from("restaurant_reservations")
      .update({ stripe_session_id: paiement.sessionId })
      .eq("id", ligne.id);
  } catch (erreur) {
    console.error("[paiement]", erreur);
    echec = true;
  }

  return (
    <Cadre>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-zinc-500">{restaurant.nom}</span>
        <h1 className="text-xl font-semibold text-zinc-900">
          Acompte de {somme}
        </h1>
      </div>

      <dl className="flex flex-col gap-2 border-y border-zinc-100 py-4 text-sm">
        {[
          ["Au nom de", ligne.client_nom],
          ["Date", formatDate(ligne.date_reservation)],
          [
            "Service",
            service
              ? `${service.nom} — ${formatCreneau(service.heure_debut, service.heure_fin)}`
              : null,
          ],
          ["Espace privatisé", espace.nom],
          ["Convives", `${ligne.couverts} couverts`],
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
        <p className="text-sm text-zinc-500">
          Paiement interrompu. Vous pouvez reprendre quand vous voulez, votre
          réservation est toujours là.
        </p>
      )}

      {echec || !lienStripe ? (
        <p className="text-sm text-red-600">
          Le paiement est momentanément indisponible. Réessayez dans quelques
          minutes, ou contactez {restaurant.nom}.
        </p>
      ) : (
        <a
          href={lienStripe}
          className="rounded-md bg-brand-navy px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
        >
          Payer {somme}
        </a>
      )}

      <p className="text-xs text-zinc-400">
        Paiement traité par Stripe, directement au bénéfice de {restaurant.nom}.
        Klarr ne perçoit aucune commission.
      </p>
    </Cadre>
  );
}
