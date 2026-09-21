import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { creerPaiementAcompte, paiementAbouti } from "@/lib/stripe/paiement";
import type { Langue } from "@/lib/i18n/langues";
import { PAIEMENT } from "@/lib/i18n/paiement";
import { sommeEuros } from "@/lib/i18n/nombres";
import { dateLongue } from "@/lib/i18n/dates";
import { heure as heureTraduite } from "@/lib/i18n/jours";

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
  langue,
}: {
  seance: Seance;
  token: string;
  retour: boolean;
  annule: boolean;
  langue: Langue;
}) {
  const p = PAIEMENT[langue];
  const somme = sommeEuros(seance.montant_centimes, langue);
  const formatJour = (date: string) => dateLongue(date, langue);
  const heureSeance = heureTraduite(seance.heure, langue);

  if (seance.statut === "annulee") {
    return (
      <Cadre>
        <h1 className="text-xl font-semibold text-zinc-900">
          {p.inscriptionAnnuleeTitre}
        </h1>
        <p className="text-sm text-zinc-600">
          {p.inscriptionAnnuleeTexte(seance.nom_restaurant)}
        </p>
      </Cadre>
    );
  }

  if (seance.statut === "confirmee") {
    return (
      <Cadre>
        <span className="text-sm font-medium text-emerald-700">
          {p.inscriptionConfirmeeBadge}
        </span>
        <h1 className="text-xl font-semibold text-zinc-900">
          {seance.nom_experience}
        </h1>
        <p className="text-sm text-zinc-600">
          {p.seanceReglee(
            somme,
            seance.nom_restaurant,
            formatJour(seance.date_seance),
            heureSeance,
          )}
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
          {p.pasOuvertTitre}
        </h1>
        <p className="text-sm text-zinc-600">
          {p.pasOuvertSeance(seance.nom_restaurant)}
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
      // L'intitulé se lit sur la page de Stripe : même langue que celle-ci.
      intitule: p.intituleSeance(
        seance.nom_experience,
        seance.places,
        formatJour(seance.date_seance),
      ),
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
          [p.auNomDe, seance.client_nom],
          [p.dateLabel, formatJour(seance.date_seance)],
          [
            p.heureLabel,
            seance.duree_minutes
              ? `${heureSeance} · ${seance.duree_minutes} min`
              : heureSeance,
          ],
          [p.placesLabel, p.placesValeur(seance.places)],
          [p.totalLabel, somme],
        ].map(([libelle, valeur]) => (
          <div key={libelle} className="flex justify-between gap-4">
            <dt className="text-zinc-500">{libelle}</dt>
            <dd className="text-right font-medium text-zinc-900">{valeur}</dd>
          </div>
        ))}
      </dl>

      {annule && !echec && (
        <p className="text-sm text-zinc-500">{p.interrompuSeance}</p>
      )}

      {echec || !lien ? (
        <p className="text-sm text-red-600">
          {p.indisponible(seance.nom_restaurant)}
        </p>
      ) : (
        <a
          href={lien}
          className="rounded-md bg-brand-navy px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
        >
          {p.payer(somme)}
        </a>
      )}

      <p className="text-xs text-zinc-400">
        {p.piedAcompte(seance.nom_restaurant)}
      </p>
    </Cadre>
  );
}
