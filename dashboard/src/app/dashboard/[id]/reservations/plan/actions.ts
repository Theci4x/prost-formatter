"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { roleSur, peutGerer } from "@/lib/equipe/roles";
import { occupeLaJauge } from "@/lib/reservations/disponibilite";
import {
  placementPossible,
  salleADessiner,
  type ReservationPlacable,
} from "@/lib/reservations/plan";
import {
  diffReperes,
  diffTables,
  valider,
  type Brouillon,
} from "@/lib/reservations/plan-edition";
import type { Repere, TableSalle } from "@/types/plan";
import type { Espace } from "@/types/reservation";

function texte(valeur: FormDataEntryValue | null): string {
  return ((valeur as string | null) ?? "").trim();
}

/**
 * Enregistrer un plan de salle entier.
 *
 * L'éditeur tient un brouillon complet en mémoire : c'est ce qui rend
 * l'annulation immédiate, et ce qui évite d'écrire en base à chaque pixel
 * parcouru par la souris. Il envoie donc le plan d'un bloc, et c'est ici
 * qu'on décide ce qui est créé, modifié ou supprimé.
 */
export async function enregistrerPlan(formData: FormData): Promise<{
  error: string | null;
  erreurs: string[];
}> {
  const restaurantId = texte(formData.get("restaurant_id"));
  const espaceId = texte(formData.get("espace_id"));
  const brut = texte(formData.get("plan"));

  if (!peutGerer(await roleSur(restaurantId))) {
    return { error: "Seul un gérant peut modifier le plan de salle.", erreurs: [] };
  }

  let brouillon: Brouillon;
  try {
    brouillon = JSON.parse(brut) as Brouillon;
    if (!Array.isArray(brouillon.tables) || !Array.isArray(brouillon.reperes)) {
      throw new Error("forme inattendue");
    }
  } catch {
    return { error: "Plan illisible. Recharge la page et réessaie.", erreurs: [] };
  }

  const supabase = await createClient();

  const { data: salleData } = await supabase
    .from("restaurant_espaces")
    .select("*")
    .eq("id", espaceId)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();
  const salle = salleData as Espace | null;
  if (!salle) return { error: "Cette salle n'existe plus.", erreurs: [] };
  if (!salleADessiner(salle)) {
    return {
      error: `${salle.nom} ne se loue qu'en entier : il n'y a pas de table à y placer.`,
      erreurs: [],
    };
  }

  const erreurs = valider(brouillon);
  if (erreurs.length > 0) return { error: null, erreurs };

  const [tablesResult, reperesResult] = await Promise.all([
    supabase
      .from("restaurant_tables")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("espace_id", espaceId),
    supabase
      .from("restaurant_reperes")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("espace_id", espaceId),
  ]);

  const tables = diffTables(
    (tablesResult.data ?? []) as TableSalle[],
    brouillon.tables,
  );
  const reperes = diffReperes(
    (reperesResult.data ?? []) as Repere[],
    brouillon.reperes,
  );

  const maintenant = new Date().toISOString();
  const ops: PromiseLike<{ error: unknown }>[] = [];

  if (tables.aCreer.length > 0) {
    ops.push(
      supabase.from("restaurant_tables").insert(
        tables.aCreer.map((table) => ({
          id: table.id,
          restaurant_id: restaurantId,
          espace_id: espaceId,
          nom: table.nom.trim(),
          places: table.places,
          forme: table.forme,
          x: table.x,
          y: table.y,
          largeur: table.largeur,
          hauteur: table.hauteur,
          rotation: table.rotation,
        })),
      ),
    );
  }
  for (const table of tables.aMettreAJour) {
    ops.push(
      supabase
        .from("restaurant_tables")
        .update({
          nom: table.nom.trim(),
          places: table.places,
          forme: table.forme,
          x: table.x,
          y: table.y,
          largeur: table.largeur,
          hauteur: table.hauteur,
          rotation: table.rotation,
          updated_at: maintenant,
        })
        .eq("id", table.id)
        .eq("restaurant_id", restaurantId),
    );
  }
  if (tables.aSupprimer.length > 0) {
    // Les réservations placées sur une table supprimée repassent « à
    // placer » d'elles-mêmes (on delete set null) : on n'efface personne.
    ops.push(
      supabase
        .from("restaurant_tables")
        .delete()
        .in("id", tables.aSupprimer)
        .eq("restaurant_id", restaurantId),
    );
  }

  if (reperes.aCreer.length > 0) {
    ops.push(
      supabase.from("restaurant_reperes").insert(
        reperes.aCreer.map((repere) => ({
          id: repere.id,
          restaurant_id: restaurantId,
          espace_id: espaceId,
          type: repere.type,
          libelle: repere.libelle,
          x: repere.x,
          y: repere.y,
          largeur: repere.largeur,
          hauteur: repere.hauteur,
          rotation: repere.rotation,
        })),
      ),
    );
  }
  for (const repere of reperes.aMettreAJour) {
    ops.push(
      supabase
        .from("restaurant_reperes")
        .update({
          type: repere.type,
          libelle: repere.libelle,
          x: repere.x,
          y: repere.y,
          largeur: repere.largeur,
          hauteur: repere.hauteur,
          rotation: repere.rotation,
          updated_at: maintenant,
        })
        .eq("id", repere.id)
        .eq("restaurant_id", restaurantId),
    );
  }
  if (reperes.aSupprimer.length > 0) {
    ops.push(
      supabase
        .from("restaurant_reperes")
        .delete()
        .in("id", reperes.aSupprimer)
        .eq("restaurant_id", restaurantId),
    );
  }

  const resultats = await Promise.all(ops);
  const echec = resultats.find((resultat) => resultat.error);
  if (echec) {
    console.error("[enregistrerPlan]", echec.error);
    return {
      error: "Le plan n'a pas été enregistré entièrement. Recharge la page.",
      erreurs: [],
    };
  }

  revalidatePath(`/dashboard/${restaurantId}/reservations/plan`);
  revalidatePath(`/dashboard/${restaurantId}/service`);
  return { error: null, erreurs: [] };
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
