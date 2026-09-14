"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { roleSur, peutGerer } from "@/lib/equipe/roles";
import { occupeLaJauge } from "@/lib/reservations/disponibilite";
import {
  caseLibre,
  dansLaGrille,
  nomDejaPris,
  placementPossible,
  prochaineCaseLibre,
  salleADessiner,
  type ReservationPlacable,
} from "@/lib/reservations/plan";
import type { Espace } from "@/types/reservation";
import { TABLE_VIDE, type FormeTable, type TableSalle, type TableValeurs } from "@/types/plan";

export type TableState = {
  error: string | null;
  rendu: number;
  valeurs: TableValeurs;
};

function texte(valeur: FormDataEntryValue | null): string {
  return ((valeur as string | null) ?? "").trim();
}

function lireForme(brut: string): FormeTable {
  return brut === "carree" || brut === "rectangle" ? brut : "ronde";
}

async function chargerTables(
  restaurantId: string,
  espaceId: string,
): Promise<TableSalle[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("restaurant_tables")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("espace_id", espaceId);
  return (data ?? []) as TableSalle[];
}

export async function ajouterTable(
  prevState: TableState,
  formData: FormData,
): Promise<TableState> {
  const restaurantId = texte(formData.get("restaurant_id"));
  const espaceId = texte(formData.get("espace_id"));
  const valeurs: TableValeurs = {
    nom: texte(formData.get("nom")),
    places: texte(formData.get("places")),
    forme: lireForme(texte(formData.get("forme"))),
  };
  const rendu = prevState.rendu + 1;
  const echec = (error: string): TableState => ({ error, rendu, valeurs });

  if (!peutGerer(await roleSur(restaurantId))) {
    return echec("Seul un gérant peut modifier le plan de salle.");
  }

  if (!valeurs.nom) return echec("Donne un numéro ou un nom à cette table.");
  const places = Number(valeurs.places);
  if (!Number.isInteger(places) || places <= 0) {
    return echec("Indique le nombre de places (un nombre entier).");
  }

  const supabaseSalle = await createClient();
  const { data: salleData } = await supabaseSalle
    .from("restaurant_espaces")
    .select("*")
    .eq("id", espaceId)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();
  const salle = salleData as Espace | null;
  if (!salle) return echec("Cette salle n'existe plus.");
  // Une salle qui ne se loue qu'en entier n'a personne à placer.
  if (!salleADessiner(salle)) {
    return echec(
      `${salle.nom} ne se loue qu'en entier : un groupe qui la privatise la prend toute, il n'y a pas de table à attribuer.`,
    );
  }

  const tables = await chargerTables(restaurantId, espaceId);
  if (nomDejaPris(tables, espaceId, valeurs.nom)) {
    return echec(`Il y a déjà une « ${valeurs.nom} » dans cette salle.`);
  }

  const place = prochaineCaseLibre(tables, espaceId);
  if (!place) {
    return echec(
      "Le plan est plein. Déplace ou supprime une table avant d'en ajouter une.",
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("restaurant_tables").insert({
    restaurant_id: restaurantId,
    espace_id: espaceId,
    nom: valeurs.nom,
    places,
    forme: valeurs.forme,
    x: place.x,
    y: place.y,
  });

  if (error) {
    console.error("[ajouterTable]", error);
    return echec("Impossible d'ajouter cette table. Réessaie.");
  }

  revalidatePath(`/dashboard/${restaurantId}/reservations/plan`);
  // Le nom est vidé, les places et la forme restent : on dessine une salle
  // table par table, et c'est presque toujours le même gabarit.
  return {
    error: null,
    rendu,
    valeurs: { ...TABLE_VIDE, places: valeurs.places, forme: valeurs.forme },
  };
}

/**
 * Déplacer une table sur la grille. Appelée au relâché de la souris comme à
 * la flèche du clavier : elle renvoie un message plutôt qu'un état de
 * formulaire, l'écran se contentant de l'afficher.
 */
export async function deplacerTable(formData: FormData): Promise<{
  error: string | null;
}> {
  const restaurantId = texte(formData.get("restaurant_id"));
  const espaceId = texte(formData.get("espace_id"));
  const tableId = texte(formData.get("table_id"));
  const x = Number(texte(formData.get("x")));
  const y = Number(texte(formData.get("y")));

  if (!peutGerer(await roleSur(restaurantId))) {
    return { error: "Seul un gérant peut modifier le plan de salle." };
  }
  if (!dansLaGrille(x, y)) return { error: "Cette position sort du plan." };

  const tables = await chargerTables(restaurantId, espaceId);
  if (!caseLibre(tables, espaceId, x, y, tableId)) {
    return { error: "Il y a déjà une table à cet endroit." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_tables")
    .update({ x, y, updated_at: new Date().toISOString() })
    .eq("id", tableId)
    .eq("restaurant_id", restaurantId);

  if (error) {
    console.error("[deplacerTable]", error);
    return { error: "Le déplacement n'a pas été enregistré." };
  }

  revalidatePath(`/dashboard/${restaurantId}/reservations/plan`);
  return { error: null };
}

export async function modifierTable(formData: FormData): Promise<{
  error: string | null;
}> {
  const restaurantId = texte(formData.get("restaurant_id"));
  const espaceId = texte(formData.get("espace_id"));
  const tableId = texte(formData.get("table_id"));
  const nom = texte(formData.get("nom"));
  const places = Number(texte(formData.get("places")));
  const forme = lireForme(texte(formData.get("forme")));

  if (!peutGerer(await roleSur(restaurantId))) {
    return { error: "Seul un gérant peut modifier le plan de salle." };
  }
  if (!nom) return { error: "Donne un numéro ou un nom à cette table." };
  if (!Number.isInteger(places) || places <= 0) {
    return { error: "Indique le nombre de places (un nombre entier)." };
  }

  const tables = await chargerTables(restaurantId, espaceId);
  if (nomDejaPris(tables, espaceId, nom, tableId)) {
    return { error: `Il y a déjà une « ${nom} » dans cette salle.` };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_tables")
    .update({ nom, places, forme, updated_at: new Date().toISOString() })
    .eq("id", tableId)
    .eq("restaurant_id", restaurantId);

  if (error) {
    console.error("[modifierTable]", error);
    return { error: "La modification n'a pas été enregistrée." };
  }

  revalidatePath(`/dashboard/${restaurantId}/reservations/plan`);
  return { error: null };
}

export async function supprimerTable(formData: FormData) {
  const restaurantId = texte(formData.get("restaurant_id"));
  const tableId = texte(formData.get("table_id"));

  if (!peutGerer(await roleSur(restaurantId))) return;

  const supabase = await createClient();
  // Les réservations déjà placées dessus ne sont pas effacées : la clé
  // étrangère les repasse simplement en « à placer » (on delete set null).
  const { error } = await supabase
    .from("restaurant_tables")
    .delete()
    .eq("id", tableId)
    .eq("restaurant_id", restaurantId);

  if (error) console.error("[supprimerTable]", error);
  revalidatePath(`/dashboard/${restaurantId}/reservations/plan`);
}

/**
 * Asseoir un groupe, ou le relever. Appelée depuis l'écran de service :
 * c'est du travail de salle, tout le monde y a droit, y compris le rôle
 * « service ».
 */
export async function placerReservation(formData: FormData): Promise<{
  error: string | null;
}> {
  const restaurantId = texte(formData.get("restaurant_id"));
  const reservationId = texte(formData.get("reservation_id"));
  const tableId = texte(formData.get("table_id"));

  if (!(await roleSur(restaurantId))) {
    return { error: "Tu n'as pas accès à cet établissement." };
  }

  const supabase = await createClient();

  // Retirer de table : rien à vérifier, une réservation non placée est
  // toujours valable.
  if (!tableId) {
    const { error } = await supabase
      .from("restaurant_reservations")
      .update({ table_id: null, updated_at: new Date().toISOString() })
      .eq("id", reservationId)
      .eq("restaurant_id", restaurantId);
    if (error) {
      console.error("[placerReservation]", error);
      return { error: "Le changement n'a pas été enregistré." };
    }
    revalidatePath(`/dashboard/${restaurantId}/service`);
    return { error: null };
  }

  const [reservationResult, tableResult] = await Promise.all([
    supabase
      .from("restaurant_reservations")
      .select("*")
      .eq("id", reservationId)
      .eq("restaurant_id", restaurantId)
      .maybeSingle(),
    supabase
      .from("restaurant_tables")
      .select("*")
      .eq("id", tableId)
      .eq("restaurant_id", restaurantId)
      .maybeSingle(),
  ]);

  const reservation = reservationResult.data as ReservationPlacable | null;
  const table = tableResult.data as TableSalle | null;
  if (!reservation || !table) {
    return { error: "Cette réservation ou cette table n'existe plus." };
  }

  // Le double placement se vérifie ici, pas en base : deux groupes sur la
  // même table est une erreur d'inattention, pas une donnée invalide — le
  // service doit pouvoir la faire exprès en dernier recours, mais jamais
  // sans le savoir.
  const { data: memeService } = await supabase
    .from("restaurant_reservations")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("date_reservation", reservation.date_reservation)
    .not("table_id", "is", null);

  // Une réservation annulée garde son table_id : elle ne doit plus bloquer
  // personne. occupeLaJauge fait déjà ce tri partout ailleurs.
  const maintenant = new Date();
  const occupees = ((memeService ?? []) as ReservationPlacable[]).filter(
    (autre) =>
      autre.service_id === reservation.service_id &&
      occupeLaJauge(autre, maintenant),
  );

  const verdict = placementPossible({ table, reservation, occupees });
  if (!verdict.ok) return { error: verdict.raison };

  const { error } = await supabase
    .from("restaurant_reservations")
    .update({ table_id: tableId, updated_at: new Date().toISOString() })
    .eq("id", reservationId)
    .eq("restaurant_id", restaurantId);

  if (error) {
    console.error("[placerReservation]", error);
    return { error: "Le placement n'a pas été enregistré." };
  }

  revalidatePath(`/dashboard/${restaurantId}/service`);
  return { error: null };
}
