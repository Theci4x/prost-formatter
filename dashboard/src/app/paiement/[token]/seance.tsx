import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { creerPaiementAcompte, paiementAbouti } from "@/lib/stripe/paiement";
import { formatEuros } from "@/lib/reservations/acompte";
import { formatHeure } from "@/types/reservation";

type Seance = {
  id: string;
  restaurant_id: string;
  date_seance: string;
  places: number;
  montant_centimes: number;
  client_nom: string;
  client_email: string | null;
  statut: string;
  stripe_session_id: string | null;
  nom_experience: string;
  heure: string;
  duree_minutes: number | null;
  nom_restaurant: string;
  compte_stripe: string | null;
};

/** La séance désignée par un jeton, avec ce qu'il faut pour l'afficher. */
export async function chargerSeance(
  supabase: SupabaseClient,
  token: string,
): Promise<Seance | null> {
  const { data } = await supabase
    .from("restaurant_experience_reservations")
    .select(
      "id, restaurant_id, experience_id, date_seance, places, montant_centimes, client_nom, client_email, statut, stripe_session_id",
    )
    .eq("paiement_token", token)
    .maybeSingle();

  const place = data as
    | (Omit<
        Seance,
        | "nom_experience"
        | "heure"
        | "duree_minutes"
        | "nom_restaurant"
        | "compte_stripe"
      > & {
        experience_id: string;
      })
    | null;
  if (!place) return null;

  const [experienceResult, restaurantResult, connexionResult] =
    await Promise.all([
      supabase
        .from("restaurant_experiences")
        .select("nom, heure, duree_minutes")
        .eq("id", place.experience_id)
        .maybeSingle(),
      supabase
        .from("restaurants")
        .select("nom")
        .eq("id", place.restaurant_id)
        .maybeSingle(),
      supabase
        .from("restaurant_stripe_connexions")
        .select("stripe_account_id")
        .eq("restaurant_id", place.restaurant_id)
        .maybeSingle(),
    ]);

  const experience = experienceResult.data as {
    nom: string;
    heure: string;
    duree_minutes: number | null;
  } | null;
  const restaurant = restaurantResult.data as { nom: string } | null;
  if (!experience || !restaurant) return null;

  return {
    ...place,
    nom_experience: experience.nom,
    heure: experience.heure,
    duree_minutes: experience.duree_minutes,
    nom_restaurant: restaurant.nom,
    compte_stripe:
      (connexionResult.data as { stripe_account_id: string } | null)
        ?.stripe_account_id ?? null,
  };
}

function formatJour(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Cadre({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-cream px-6 py-16">
      <div className="flex w-full max-w-lg flex-col gap-5 rounded-2xl border border-zinc-200/70 bg-white p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}

export async function PaiementSeance({
  seance,
  token,
  retour,
  annule,
}: {
  seance: Seance;
  token: string;
  retour: boolean;
  annule: boolean;
}) {
  const somme = formatEuros(seance.montant_centimes);

  if (seance.statut === "annulee") {
    return (
      <Cadre>
        <h1 className="text-xl font-semibold text-zinc-900">
          Cette inscription a été annulée.
        </h1>
        <p className="text-sm text-zinc-600">
          Aucun paiement n&apos;est attendu. Contactez {seance.nom_restaurant}{" "}
          si vous pensez qu&apos;il s&apos;agit d&apos;une erreur.
        </p>
      </Cadre>
    );
  }

  if (seance.statut === "confirmee") {
    return (
      <Cadre>
        <span className="text-sm font-medium text-emerald-700">
          Inscription confirmée
        </span>
        <h1 className="text-xl font-semibold text-zinc-900">
          {seance.nom_experience}
        </h1>
        <p className="text-sm text-zinc-600">
          Nous avons bien reçu votre paiement de {somme}.{" "}
          {seance.nom_restaurant} vous attend le{" "}
          {formatJour(seance.date_seance)} à {formatHeure(seance.heure)}. Cette
          page vaut reçu.
        </p>
      </Cadre>
    );
  }

  // Retour depuis Stripe : l'état est relu chez eux, jamais déduit de l'URL.
  const supabaseModule = await import("@/lib/supabase/service");
  const supabase = supabaseModule.createServiceClient();

  if (retour && seance.compte_stripe && seance.stripe_session_id) {
    const resultat = await paiementAbouti(
      seance.compte_stripe,
      seance.stripe_session_id,
      token,
    );
    if (resultat.paye) {
      await supabase
        .from("restaurant_experience_reservations")
        .update({
          statut: "confirmee",
          paye_le: new Date().toISOString(),
          stripe_payment_intent_id: resultat.paymentIntentId,
        })
        .eq("id", seance.id);
      redirect(`/paiement/${token}`);
    }
  }

  if (!seance.compte_stripe) {
    return (
      <Cadre>
        <h1 className="text-xl font-semibold text-zinc-900">
          Le paiement n&apos;est pas encore ouvert.
        </h1>
        <p className="text-sm text-zinc-600">
          {seance.nom_restaurant} doit terminer la configuration de ses
          paiements. Reprenez contact avec l&apos;établissement — votre place
          reste enregistrée.
        </p>
      </Cadre>
    );
  }

  let lien: string | null = null;
  let echec = false;
  try {
    const paiement = await creerPaiementAcompte({
      compteStripe: seance.compte_stripe,
      token,
      intitule: `${seance.nom_experience} — ${seance.places} place${seance.places > 1 ? "s" : ""} le ${formatJour(seance.date_seance)}`,
      centimes: seance.montant_centimes,
      emailClient: seance.client_email,
      reservationId: seance.id,
    });
    lien = paiement.url;
    await supabase
      .from("restaurant_experience_reservations")
      .update({ stripe_session_id: paiement.sessionId })
      .eq("id", seance.id);
  } catch (erreur) {
    console.error("[paiement séance]", erreur);
    echec = true;
  }

  return (
    <Cadre>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-zinc-500">{seance.nom_restaurant}</span>
        <h1 className="text-xl font-semibold text-zinc-900">
          {seance.nom_experience}
        </h1>
      </div>

      <dl className="flex flex-col gap-2 border-y border-zinc-100 py-4 text-sm">
        {[
          ["Au nom de", seance.client_nom],
          ["Date", formatJour(seance.date_seance)],
          [
            "Heure",
            seance.duree_minutes
              ? `${formatHeure(seance.heure)} · ${seance.duree_minutes} min`
              : formatHeure(seance.heure),
          ],
          ["Places", `${seance.places} place${seance.places > 1 ? "s" : ""}`],
          ["Total", somme],
        ].map(([libelle, valeur]) => (
          <div key={libelle} className="flex justify-between gap-4">
            <dt className="text-zinc-500">{libelle}</dt>
            <dd className="text-right font-medium text-zinc-900">{valeur}</dd>
          </div>
        ))}
      </dl>

      {annule && !echec && (
        <p className="text-sm text-zinc-500">
          Paiement interrompu. Votre place est retenue le temps que vous
          reveniez.
        </p>
      )}

      {echec || !lien ? (
        <p className="text-sm text-red-600">
          Le paiement est momentanément indisponible. Réessayez dans quelques
          minutes, ou contactez {seance.nom_restaurant}.
        </p>
      ) : (
        <a
          href={lien}
          className="rounded-md bg-brand-navy px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
        >
          Payer {somme}
        </a>
      )}

      <p className="text-xs text-zinc-400">
        Paiement traité par Stripe, directement au bénéfice de{" "}
        {seance.nom_restaurant}. Klarr ne perçoit aucune commission.
      </p>
    </Cadre>
  );
}
