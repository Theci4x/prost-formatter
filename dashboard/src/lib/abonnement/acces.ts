import "server-only";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  ACCES_COMPLET,
  calculerAcces,
  moduleDeLaSection,
  modulesDeLaSection,
  sectionOuverte,
  type Acces,
  type EtatAbonnement,
  type Module,
} from "@/lib/abonnement/modules";

/**
 * Lit ce à quoi un établissement a droit.
 *
 * Tolérant par construction : si la lecture échoue — migration pas encore
 * passée, base injoignable —, on ouvre tout. Un verrou de facturation qui
 * se referme sur une panne coûte plus cher qu'un mois d'abonnement : il
 * enferme un restaurateur dehors un vendredi soir, et c'est lui qui
 * appelle, furieux, pendant son service.
 */
export async function chargerAcces(
  restaurantId: string,
  supabase?: SupabaseClient,
): Promise<Acces> {
  const client = supabase ?? (await createClient());

  const [restaurantResult, abonnementsResult] = await Promise.all([
    client
      .from("restaurants")
      .select("created_at, acces_offert_jusqu_au")
      .eq("id", restaurantId)
      .maybeSingle(),
    client
      .from("restaurant_subscriptions")
      .select("module, status")
      .eq("restaurant_id", restaurantId),
  ]);

  const restaurant = restaurantResult.data as {
    created_at: string;
    acces_offert_jusqu_au: string | null;
  } | null;
  if (!restaurant) return ACCES_COMPLET;

  return calculerAcces({
    abonnements: (abonnementsResult.data ?? []) as EtatAbonnement[],
    creeLe: restaurant.created_at,
    accesOffertJusquAu: restaurant.acces_offert_jusqu_au ?? null,
    maintenant: new Date(),
  });
}

/**
 * Garde de page : renvoie vers l'abonnement si le module n'est pas ouvert.
 *
 * Griser une case dans le menu n'est pas une sécurité — l'adresse se tape
 * à la main. C'est cette fonction qui ferme réellement la porte, et elle
 * doit être appelée par chaque page concernée.
 */
export async function exigerModule(
  restaurantId: string,
  requis: Module,
): Promise<Acces> {
  const acces = await chargerAcces(restaurantId);
  if (!acces.ouvert[requis]) {
    redirect(`/dashboard/${restaurantId}/abonnement?module=${requis}`);
  }
  return acces;
}

/**
 * La même chose, à partir du nom de la section.
 *
 * Une section ouverte par deux modules se contente de l'un des deux ; on
 * ne renvoie vers l'abonnement que si aucun n'est ouvert, et on y met
 * alors en avant le premier de la liste.
 */
export async function exigerSection(
  restaurantId: string,
  section: string,
): Promise<Acces> {
  if (modulesDeLaSection(section).length === 0) return ACCES_COMPLET;

  const acces = await chargerAcces(restaurantId);
  if (!sectionOuverte(acces, section)) {
    const aProposer = moduleDeLaSection(section);
    redirect(`/dashboard/${restaurantId}/abonnement?module=${aProposer}`);
  }
  return acces;
}
