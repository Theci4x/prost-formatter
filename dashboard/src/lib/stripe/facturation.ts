import "server-only";
import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe/client";

/**
 * Les factures de l'abonnement Klarr et les informations qu'elles portent.
 *
 * Stripe émet les factures et les garde ; on ne recopie rien. On les lit
 * pour les montrer au restaurateur, et on écrit ses coordonnées sur son
 * client Stripe — c'est de là que chaque nouvelle facture les tire.
 */

/** Le client Stripe de l'établissement, s'il en a déjà un. */
export async function clientDuRestaurant(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<string | null> {
  // Celui des abonnements d'abord : c'est lui que Stripe prélève.
  const { data: abonnement } = await supabase
    .from("restaurant_subscriptions")
    .select("stripe_customer_id")
    .eq("restaurant_id", restaurantId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const duPaiement = (abonnement as { stripe_customer_id?: string } | null)
    ?.stripe_customer_id;
  if (duPaiement) return duPaiement;

  // Sinon, celui créé pendant l'essai quand il a rempli ses informations.
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", restaurantId)
    .maybeSingle();
  return (
    (restaurant as { stripe_client_id?: string | null } | null)
      ?.stripe_client_id ?? null
  );
}

export type InfosFacturation = {
  nom: string;
  email: string;
  ligne1: string;
  ligne2: string;
  codePostal: string;
  ville: string;
  pays: string;
  siret: string;
  tva: string;
};

export const INFOS_VIDES: InfosFacturation = {
  nom: "",
  email: "",
  ligne1: "",
  ligne2: "",
  codePostal: "",
  ville: "",
  pays: "FR",
  siret: "",
  tva: "",
};

/** Le nom du champ qui porte le SIRET sur la facture. */
export const CHAMP_SIRET = "SIRET";

export async function lireFacturation(
  client: string,
): Promise<InfosFacturation | null> {
  try {
    const c = await getStripe().customers.retrieve(client, {
      expand: ["tax_ids"],
    });
    if (c.deleted) return null;
    const tva = c.tax_ids?.data.find((t) => t.type === "eu_vat")?.value ?? "";
    const siret =
      c.invoice_settings?.custom_fields?.find((f) => f.name === CHAMP_SIRET)
        ?.value ?? "";
    return {
      nom: c.name ?? "",
      email: c.email ?? "",
      ligne1: c.address?.line1 ?? "",
      ligne2: c.address?.line2 ?? "",
      codePostal: c.address?.postal_code ?? "",
      ville: c.address?.city ?? "",
      pays: c.address?.country ?? "FR",
      siret,
      tva,
    };
  } catch (erreur) {
    console.error("[stripe/facturation] lecture", client, erreur);
    return null;
  }
}

export type Facture = {
  id: string;
  numero: string | null;
  date: string;
  montantCentimes: number;
  devise: string;
  statut: "payee" | "a_regler" | "annulee" | "autre";
  pdf: string | null;
  page: string | null;
};

function statutDe(f: Stripe.Invoice): Facture["statut"] {
  if (f.status === "paid") return "payee";
  if (f.status === "open") return "a_regler";
  if (f.status === "void" || f.status === "uncollectible") return "annulee";
  return "autre";
}

/** Les factures émises, de la plus récente à la plus ancienne. */
export async function listerFactures(client: string): Promise<Facture[]> {
  try {
    const liste = await getStripe().invoices.list({
      customer: client,
      limit: 36,
    });
    return liste.data
      .filter((f) => f.status !== "draft")
      .map((f) => ({
        id: f.id ?? "",
        numero: f.number ?? null,
        date: new Date(f.created * 1000).toISOString(),
        montantCentimes: f.total ?? 0,
        devise: (f.currency ?? "eur").toUpperCase(),
        statut: statutDe(f),
        pdf: f.invoice_pdf ?? null,
        page: f.hosted_invoice_url ?? null,
      }));
  } catch (erreur) {
    // Une panne chez Stripe ne doit pas fermer la page d'abonnement.
    console.error("[stripe/facturation] factures", client, erreur);
    return [];
  }
}
