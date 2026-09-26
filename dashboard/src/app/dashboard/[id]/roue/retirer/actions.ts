"use server";

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { roleSur } from "@/lib/equipe/roles";
import {
  RETRAIT_INITIAL,
  aujourdhui,
  type RetraitState,
} from "@/lib/roue/retrait";

/**
 * Retirer un lot, en salle.
 *
 * Deux temps, et c'est délibéré : on cherche, on montre, **puis** on
 * confirme. Un écran qui brûlerait le code dès la saisie transformerait
 * une faute de frappe en lot perdu pour un client qui l'a sous les yeux.
 *
 * La garde n'est pas celle du reste de la roue. Régler les lots est un
 * geste de gérant ; en remettre un est un geste de service, et c'est le
 * serveur qui a le téléphone en main au moment où le client montre son
 * écran. N'importe quel membre de l'équipe peut donc retirer — personne
 * d'autre.
 */

async function membre(restaurantId: string): Promise<void> {
  const role = await roleSur(restaurantId);
  if (role === null) notFound();
}

export async function chercherCode(
  _precedent: RetraitState,
  donnees: FormData,
): Promise<RetraitState> {
  const restaurantId = String(donnees.get("restaurant_id") ?? "");
  // Saisi à la main, en salle : on pardonne la casse et les espaces.
  const code = String(donnees.get("code") ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
  if (!restaurantId)
    return { ...RETRAIT_INITIAL, error: "Établissement introuvable." };

  await membre(restaurantId);

  if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code)) {
    return {
      ...RETRAIT_INITIAL,
      error: "Un code fait six caractères, sans I, O, 0 ni 1.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("restaurant_roue_parties")
    .select("id, code, lot_libelle, lot_id, expire_le, utilise_le, gagnant")
    .eq("restaurant_id", restaurantId)
    .eq("code", code)
    .maybeSingle();

  if (error) {
    console.error("[roue/chercherCode]", error.message);
    return { ...RETRAIT_INITIAL, error: "La recherche a échoué. Réessaie." };
  }

  const partie = data as {
    id: string;
    code: string;
    lot_libelle: string;
    lot_id: string | null;
    expire_le: string;
    utilise_le: string | null;
    gagnant: boolean;
  } | null;

  if (!partie) {
    return { ...RETRAIT_INITIAL, error: "Ce code n'existe pas chez vous." };
  }

  // La précision est celle du lot au moment du retrait : c'est ce que le
  // serveur doit savoir maintenant, pas ce qui était écrit à l'époque.
  let precision: string | null = null;
  if (partie.lot_id) {
    const { data: lot } = await supabase
      .from("restaurant_roue_lots")
      .select("precision_interne")
      .eq("id", partie.lot_id)
      .maybeSingle();
    precision =
      (lot as { precision_interne: string | null } | null)?.precision_interne ??
      null;
  }

  return {
    error: null,
    retire: false,
    trouvaille: {
      id: partie.id,
      code: partie.code,
      libelle: partie.lot_libelle,
      precision,
      expireLe: partie.expire_le,
      utiliseLe: partie.utilise_le,
      gagnant: partie.gagnant,
    },
  };
}

export async function marquerRetire(
  precedent: RetraitState,
  donnees: FormData,
): Promise<RetraitState> {
  const restaurantId = String(donnees.get("restaurant_id") ?? "");
  const partieId = String(donnees.get("partie_id") ?? "");
  if (!restaurantId || !partieId) {
    return { ...precedent, error: "Lot introuvable." };
  }

  await membre(restaurantId);

  const supabase = await createClient();
  // `is null` dans la condition : deux serveurs qui retirent le même lot
  // au même instant, c'est le premier qui gagne et le second qui le voit.
  const { data, error } = await supabase
    .from("restaurant_roue_parties")
    .update({ utilise_le: new Date().toISOString() })
    .eq("id", partieId)
    .eq("restaurant_id", restaurantId)
    .is("utilise_le", null)
    .gte("expire_le", aujourdhui())
    .select("utilise_le")
    .maybeSingle();

  if (error) {
    console.error("[roue/marquerRetire]", error.message);
    return { ...precedent, error: "Le retrait a échoué. Réessaie." };
  }
  if (!data) {
    return {
      ...precedent,
      error: "Ce lot vient d'être retiré, ou il est périmé.",
    };
  }

  return { error: null, trouvaille: precedent.trouvaille, retire: true };
}
