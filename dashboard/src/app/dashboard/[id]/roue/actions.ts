"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exiger } from "@/lib/equipe/roles";
import { LOTS_MAX, LOT_VIDE, type LotValeurs } from "@/types/roue";

/**
 * Les réglages de la roue et ses cases.
 *
 * Tout passe par `exiger(…, "gerant")` : un serveur peut valider un code
 * en salle, il n'a pas à décider combien de desserts la maison offre.
 */

export type LotState = {
  error: string | null;
  rendu: number;
  valeurs: LotValeurs;
};

function lire(donnees: FormData): LotValeurs {
  return {
    libelle: String(donnees.get("libelle") ?? "").trim(),
    precision: String(donnees.get("precision") ?? "").trim(),
    gagnant: donnees.get("gagnant") !== null,
    poids: String(donnees.get("poids") ?? "").trim(),
    stock: String(donnees.get("stock") ?? "").trim(),
  };
}

/**
 * Un entier saisi à la main, ou `null` quand le champ est vide.
 *
 * Rend `undefined` quand ce qui est tapé n'est pas un nombre : l'appelant
 * distingue alors « laissé vide » de « mal rempli », ce qu'un seul `null`
 * ne permettrait pas.
 */
function entier(valeur: string): number | null | undefined {
  if (valeur === "") return null;
  if (!/^\d+$/.test(valeur)) return undefined;
  return Number(valeur);
}

type Verdict =
  | { error: string }
  | { valeurs: LotValeurs; poids: number; stock: number | null };

function valider(valeurs: LotValeurs): Verdict {
  if (!valeurs.libelle) {
    return {
      error: "Donne un nom à cette case — c'est ce que le client lira.",
    };
  }
  if (valeurs.libelle.length > 80) {
    return { error: "Ce nom est trop long : 80 caractères au maximum." };
  }

  const poids = entier(valeurs.poids);
  if (poids === undefined || poids === null) {
    return { error: "La fréquence doit être un nombre entier, 0 ou plus." };
  }
  if (poids > 1000) {
    return { error: "La fréquence est plafonnée à 1000." };
  }

  const stock = entier(valeurs.stock);
  if (stock === undefined) {
    return {
      error: "Le stock doit être un nombre entier, ou vide pour illimité.",
    };
  }

  return { valeurs, poids, stock };
}

export async function ajouterLot(
  _precedent: LotState,
  donnees: FormData,
): Promise<LotState> {
  const restaurantId = String(donnees.get("restaurant_id") ?? "");
  const valeurs = lire(donnees);
  const rendu = _precedent.rendu + 1;
  if (!restaurantId)
    return { error: "Établissement introuvable.", rendu, valeurs };

  await exiger(restaurantId, "gerant");
  const supabase = await createClient();

  const verdict = valider(valeurs);
  if ("error" in verdict) return { error: verdict.error, rendu, valeurs };

  // Le plafond n'est pas une limite technique : au-delà d'une douzaine de
  // cases, la roue devient illisible à l'écran d'un téléphone et le client
  // ne voit plus ce qu'il a gagné.
  const { count } = await supabase
    .from("restaurant_roue_lots")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId);
  if ((count ?? 0) >= LOTS_MAX) {
    return {
      error: `Douze cases au maximum : au-delà, la roue devient illisible sur un téléphone.`,
      rendu,
      valeurs,
    };
  }

  const { error } = await supabase.from("restaurant_roue_lots").insert({
    restaurant_id: restaurantId,
    libelle: verdict.valeurs.libelle,
    precision_interne: verdict.valeurs.precision || null,
    gagnant: verdict.valeurs.gagnant,
    poids: verdict.poids,
    stock: verdict.stock,
    ordre: count ?? 0,
  });
  if (error) {
    console.error("[roue/ajouterLot]", error.message);
    return { error: "L'enregistrement a échoué. Réessaie.", rendu, valeurs };
  }

  revalidatePath(`/dashboard/${restaurantId}/roue`);
  return { error: null, rendu, valeurs: LOT_VIDE };
}

export async function modifierLot(
  _precedent: LotState,
  donnees: FormData,
): Promise<LotState> {
  const restaurantId = String(donnees.get("restaurant_id") ?? "");
  const lotId = String(donnees.get("lot_id") ?? "");
  const valeurs = lire(donnees);
  const rendu = _precedent.rendu + 1;
  if (!restaurantId || !lotId) {
    return { error: "Case introuvable.", rendu, valeurs };
  }

  await exiger(restaurantId, "gerant");

  const verdict = valider(valeurs);
  if ("error" in verdict) return { error: verdict.error, rendu, valeurs };

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_roue_lots")
    .update({
      libelle: verdict.valeurs.libelle,
      precision_interne: verdict.valeurs.precision || null,
      gagnant: verdict.valeurs.gagnant,
      poids: verdict.poids,
      stock: verdict.stock,
    })
    .eq("id", lotId)
    .eq("restaurant_id", restaurantId);
  if (error) {
    console.error("[roue/modifierLot]", error.message);
    return { error: "L'enregistrement a échoué. Réessaie.", rendu, valeurs };
  }

  revalidatePath(`/dashboard/${restaurantId}/roue`);
  return { error: null, rendu, valeurs };
}

/**
 * Retirer une case.
 *
 * Les parties déjà jouées gardent le libellé qu'on leur avait promis :
 * c'est la colonne `lot_libelle`, et la clé étrangère passe à NULL plutôt
 * que d'emporter l'historique. Un client qui se présente avec son code la
 * semaine suivante doit être servi.
 */
export async function supprimerLot(donnees: FormData): Promise<void> {
  const restaurantId = String(donnees.get("restaurant_id") ?? "");
  const lotId = String(donnees.get("id") ?? "");
  if (!restaurantId || !lotId) return;

  await exiger(restaurantId, "gerant");
  const supabase = await createClient();
  await supabase
    .from("restaurant_roue_lots")
    .delete()
    .eq("id", lotId)
    .eq("restaurant_id", restaurantId);

  revalidatePath(`/dashboard/${restaurantId}/roue`);
}

export type ReglagesState = { error: string | null; ok: boolean };

export async function enregistrerReglages(
  _precedent: ReglagesState,
  donnees: FormData,
): Promise<ReglagesState> {
  const restaurantId = String(donnees.get("restaurant_id") ?? "");
  if (!restaurantId) return { error: "Établissement introuvable.", ok: false };

  await exiger(restaurantId, "gerant");

  const titre = String(donnees.get("titre") ?? "").trim();
  if (!titre) {
    return {
      error: "Le titre affiché au client ne peut pas être vide.",
      ok: false,
    };
  }

  const validite = entier(String(donnees.get("validite_jours") ?? "").trim());
  if (
    validite === undefined ||
    validite === null ||
    validite < 1 ||
    validite > 365
  ) {
    return { error: "La validité du lot va de 1 à 365 jours.", ok: false };
  }

  const rejeu = entier(String(donnees.get("delai_rejeu_jours") ?? "").trim());
  if (rejeu === undefined || rejeu === null || rejeu > 365) {
    return {
      error: "Le délai avant de rejouer va de 0 à 365 jours.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("restaurant_roue").upsert(
    {
      restaurant_id: restaurantId,
      titre,
      sous_titre: String(donnees.get("sous_titre") ?? "").trim() || null,
      validite_jours: validite,
      delai_rejeu_jours: rejeu,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "restaurant_id" },
  );
  if (error) {
    console.error("[roue/reglages]", error.message);
    return { error: "L'enregistrement a échoué. Réessaie.", ok: false };
  }

  revalidatePath(`/dashboard/${restaurantId}/roue`);
  return { error: null, ok: true };
}

/**
 * Allumer ou éteindre la roue.
 *
 * Séparé des réglages, et volontairement : c'est le seul geste qui change
 * ce que voient les clients. On ne l'allume pas par mégarde en corrigeant
 * une faute de frappe dans le titre.
 */
export async function basculerRoue(donnees: FormData): Promise<void> {
  const restaurantId = String(donnees.get("restaurant_id") ?? "");
  const active = String(donnees.get("active") ?? "") === "1";
  if (!restaurantId) return;

  await exiger(restaurantId, "gerant");
  const supabase = await createClient();
  await supabase.from("restaurant_roue").upsert(
    {
      restaurant_id: restaurantId,
      active,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "restaurant_id" },
  );

  revalidatePath(`/dashboard/${restaurantId}/roue`);
}
