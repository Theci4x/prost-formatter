"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { peutGerer, roleSur } from "@/lib/equipe/roles";
import {
  deplacerCategorie,
  deplacerPlat,
  enCentimes,
  prochainOrdre,
  type Repositionnement,
  type Sens,
} from "@/lib/menu/carte";
import { MENU_VIDE, type MenuItem, type MenuValeurs } from "@/types/menu";

export type MenuState = {
  error: string | null;
  rendu: number;
  valeurs: MenuValeurs;
};

function texte(valeur: FormDataEntryValue | null): string {
  return ((valeur as string | null) ?? "").trim();
}

function lireSens(brut: string): Sens {
  return brut === "haut" ? "haut" : "bas";
}

async function chargerCarte(restaurantId: string): Promise<MenuItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("restaurant_menu_items")
    .select("*")
    .eq("restaurant_id", restaurantId);
  return (data ?? []) as MenuItem[];
}

/**
 * Applique un réordonnancement. Les écritures partent ensemble : une carte
 * à moitié renumérotée se lirait dans un ordre que personne n'a choisi.
 */
async function appliquer(
  restaurantId: string,
  positions: Repositionnement[],
): Promise<void> {
  if (positions.length === 0) return;
  const supabase = await createClient();
  const maintenant = new Date().toISOString();
  await Promise.all(
    positions.map((position) =>
      supabase
        .from("restaurant_menu_items")
        .update({ ordre: position.ordre, updated_at: maintenant })
        .eq("id", position.id)
        .eq("restaurant_id", restaurantId),
    ),
  );
  revalidatePath(`/dashboard/${restaurantId}/menu`);
}

export async function ajouterPlat(
  prevState: MenuState,
  formData: FormData,
): Promise<MenuState> {
  const restaurantId = texte(formData.get("restaurant_id"));
  const valeurs: MenuValeurs = {
    categorie: texte(formData.get("categorie")),
    nom: texte(formData.get("nom")),
    description: texte(formData.get("description")),
    prix: texte(formData.get("prix")),
  };
  const rendu = prevState.rendu + 1;
  const echec = (error: string): MenuState => ({ error, rendu, valeurs });

  if (!peutGerer(await roleSur(restaurantId))) {
    return echec("Seul un gérant peut modifier la carte.");
  }
  if (!valeurs.categorie) {
    return echec("Indique une catégorie : Entrées, Plats, Desserts…");
  }
  if (!valeurs.nom) return echec("Donne un nom à ce plat.");

  const prix = enCentimes(valeurs.prix);
  if (prix === undefined) {
    return echec("Le prix doit être un montant, par exemple 12,50.");
  }

  const carte = await chargerCarte(restaurantId);
  const doublon = carte.some(
    (plat) =>
      plat.categorie.toLowerCase() === valeurs.categorie.toLowerCase() &&
      plat.nom.toLowerCase() === valeurs.nom.toLowerCase(),
  );
  if (doublon) {
    return echec(`« ${valeurs.nom} » est déjà dans ${valeurs.categorie}.`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("restaurant_menu_items").insert({
    restaurant_id: restaurantId,
    // La catégorie est reprise telle qu'elle existe déjà, à la casse près :
    // sans ça, « entrées » et « Entrées » feraient deux blocs distincts sur
    // la carte du client.
    categorie:
      carte.find(
        (plat) =>
          plat.categorie.toLowerCase() === valeurs.categorie.toLowerCase(),
      )?.categorie ?? valeurs.categorie,
    nom: valeurs.nom,
    description: valeurs.description || null,
    prix_centimes: prix,
    ordre: prochainOrdre(carte),
  });

  if (error) {
    console.error("[ajouterPlat]", error);
    return echec("Impossible d'ajouter ce plat. Réessaie.");
  }

  revalidatePath(`/dashboard/${restaurantId}/menu`);
  // La catégorie reste : on saisit une carte bloc par bloc, pas en zigzag.
  return {
    error: null,
    rendu,
    valeurs: { ...MENU_VIDE, categorie: valeurs.categorie },
  };
}

export async function supprimerPlat(formData: FormData) {
  const restaurantId = texte(formData.get("restaurant_id"));
  const id = texte(formData.get("id"));
  if (!peutGerer(await roleSur(restaurantId))) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_menu_items")
    .delete()
    .eq("id", id)
    .eq("restaurant_id", restaurantId);

  if (error) console.error("[supprimerPlat]", error);
  revalidatePath(`/dashboard/${restaurantId}/menu`);
}

/** Décrocher un plat de la carte, ou l'y remettre. */
export async function basculerPlat(formData: FormData) {
  const restaurantId = texte(formData.get("restaurant_id"));
  const id = texte(formData.get("id"));
  const actif = texte(formData.get("actif")) === "1";
  if (!peutGerer(await roleSur(restaurantId))) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_menu_items")
    .update({ actif, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("restaurant_id", restaurantId);

  if (error) console.error("[basculerPlat]", error);
  revalidatePath(`/dashboard/${restaurantId}/menu`);
}

export async function monterPlat(formData: FormData) {
  const restaurantId = texte(formData.get("restaurant_id"));
  const id = texte(formData.get("id"));
  const sens = lireSens(texte(formData.get("sens")));
  if (!peutGerer(await roleSur(restaurantId))) return;

  const carte = await chargerCarte(restaurantId);
  await appliquer(restaurantId, deplacerPlat(carte, id, sens));
}

export async function monterCategorie(formData: FormData) {
  const restaurantId = texte(formData.get("restaurant_id"));
  const categorie = texte(formData.get("categorie"));
  const sens = lireSens(texte(formData.get("sens")));
  if (!peutGerer(await roleSur(restaurantId))) return;

  const carte = await chargerCarte(restaurantId);
  await appliquer(restaurantId, deplacerCategorie(carte, categorie, sens));
}

/**
 * Publier la carte sur la page de réservation, ou la retirer. Décidé par le
 * restaurateur, jamais par défaut : une carte saisie pour essayer n'a rien à
 * faire sur une adresse publique.
 */
export async function basculerCartePublique(formData: FormData) {
  const restaurantId = texte(formData.get("restaurant_id"));
  const publique = texte(formData.get("publique")) === "1";
  if (!peutGerer(await roleSur(restaurantId))) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurants")
    .update({ carte_publique: publique })
    .eq("id", restaurantId);

  if (error) console.error("[basculerCartePublique]", error);
  revalidatePath(`/dashboard/${restaurantId}/menu`);
}
