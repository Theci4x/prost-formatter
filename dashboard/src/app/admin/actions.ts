"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";
import { STATUTS } from "@/lib/suivi";

/**
 * Ouvre — ou referme — l'accès d'un établissement à la main.
 *
 * Les premiers clients s'accompagnent au téléphone et se voient offrir
 * plusieurs mois. Le faire en SQL dans Supabase à chaque fois, c'est une
 * requête à retaper et un identifiant à recopier : la faute est vite
 * arrivée, et elle ferme la maison de quelqu'un d'autre.
 *
 * `requireAdmin` rend un 404 hors liste blanche. Il est rappelé ici et pas
 * seulement sur la page : une action serveur est une adresse publique, et
 * celle-ci écrit avec la clé de service, donc hors RLS.
 */
export async function offrirAcces(formData: FormData): Promise<void> {
  await requireAdmin();

  const restaurantId = ((formData.get("restaurant_id") as string) ?? "").trim();
  const jusquAu = ((formData.get("jusqu_au") as string) ?? "").trim();
  if (!restaurantId) return;

  // Un champ vidé retire la faveur : c'est le même formulaire qui donne et
  // qui reprend, sans bouton « supprimer » à côté qu'on cliquerait de
  // travers.
  const valeur = /^\d{4}-\d{2}-\d{2}$/.test(jusquAu) ? jusquAu : null;

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("restaurants")
    .update({ acces_offert_jusqu_au: valeur })
    .eq("id", restaurantId);

  if (error) console.error("[offrirAcces]", error);

  revalidatePath("/admin");
  revalidatePath(`/dashboard/${restaurantId}/abonnement`);
}

/**
 * Ajoute une ligne au journal d'un contact.
 *
 * Rien ne se met à jour : on empile. Une note fausse se corrige par une
 * note suivante, et l'historique reste lisible — c'est lui qui dit si un
 * restaurateur a été relancé trois fois ou jamais.
 */
export async function enregistrerSuivi(formData: FormData): Promise<void> {
  const auteur = await requireAdmin();

  const cibleType = ((formData.get("cible_type") as string) ?? "").trim();
  const cibleId = ((formData.get("cible_id") as string) ?? "").trim();
  const statut = ((formData.get("statut") as string) ?? "").trim();
  const note = ((formData.get("note") as string) ?? "").trim();

  if (cibleType !== "prospect" && cibleType !== "restaurant") return;
  if (!cibleId) return;
  if (!(STATUTS as readonly string[]).includes(statut)) return;

  const supabase = createServiceClient();
  const { error } = await supabase.from("suivis").insert({
    cible_type: cibleType,
    cible_id: cibleId,
    statut,
    note: note || null,
    auteur,
  });

  if (error) console.error("[enregistrerSuivi]", error);

  revalidatePath("/admin");
}
