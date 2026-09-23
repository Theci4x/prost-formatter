import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { chargerAcces } from "@/lib/abonnement/acces";
import { MONTANTS_PAR_DEFAUT } from "@/lib/bons/regles";

export type MaisonCadeau = {
  id: string;
  nom: string;
  adresse: string | null;
  logo_url: string | null;
  slug: string;
  montants: number[];
  validite: number;
  texte: string | null;
  compteStripe: string;
  /** Tout est réuni pour vendre : module, réglage, compte Stripe actif. */
  ouvert: boolean;
};

/**
 * La maison derrière une page de bons cadeaux, et si elle peut vendre.
 *
 * Trois conditions : le module Réservations ouvert (c'est lui qui porte
 * les paiements), la vente activée par le restaurateur, et un compte
 * Stripe relié qui accepte les paiements. Sans l'une d'elles, la page
 * dit poliment que ce n'est pas possible — elle ne prend pas d'argent
 * qui n'aurait nulle part où aller.
 */
export async function chargerMaisonCadeau(
  slug: string,
): Promise<MaisonCadeau | null> {
  if (!slug) return null;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug_reservation", slug)
    .maybeSingle();
  const r = data as {
    id: string;
    nom: string;
    adresse: string | null;
    logo_url: string | null;
    bons_cadeaux_actifs?: boolean | null;
    bons_cadeaux_montants?: number[] | null;
    bons_cadeaux_validite_mois?: number | null;
    bons_cadeaux_texte?: string | null;
  } | null;
  if (!r) return null;

  const [{ data: connexion }, acces] = await Promise.all([
    supabase
      .from("restaurant_stripe_connexions")
      .select("stripe_account_id, paiements_actifs")
      .eq("restaurant_id", r.id)
      .maybeSingle(),
    chargerAcces(r.id, supabase),
  ]);
  const compte = connexion as {
    stripe_account_id: string;
    paiements_actifs: boolean;
  } | null;

  const montants = r.bons_cadeaux_montants?.length
    ? r.bons_cadeaux_montants
    : MONTANTS_PAR_DEFAUT;

  return {
    id: r.id,
    nom: r.nom,
    adresse: r.adresse,
    logo_url: r.logo_url,
    slug,
    montants,
    validite: r.bons_cadeaux_validite_mois ?? 12,
    texte: r.bons_cadeaux_texte ?? null,
    compteStripe: compte?.stripe_account_id ?? "",
    ouvert: Boolean(
      r.bons_cadeaux_actifs &&
      acces.ouvert.reservations &&
      compte?.stripe_account_id &&
      compte.paiements_actifs,
    ),
  };
}
