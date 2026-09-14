"use server";

import { randomUUID } from "node:crypto";
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
import { aTraduire } from "@/lib/menu/traduction";
import { traduirePlats } from "@/lib/menu/traduire";
import {
  MENU_VIDE,
  type MenuItem,
  type MenuValeurs,
  type Traductions,
} from "@/types/menu";

export type MenuState = {
  error: string | null;
  rendu: number;
  valeurs: MenuValeurs;
};

const BUCKET = "restaurant-photos";
// Le même plafond que le logo : au-delà, l'hébergeur refuse le corps de la
// requête avant que ce code ne s'exécute, et l'écran n'aurait rien à dire.
const TAILLE_MAX = 4 * 1024 * 1024;

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


/**
 * La photo d'un plat. Une seule : on remplace, on n'empile pas. L'ancien
 * fichier part du stockage dans la foulée — un fichier orphelin se paie au
 * mois et ne s'affiche nulle part.
 */
export async function envoyerPhotoPlat(formData: FormData): Promise<{
  error: string | null;
}> {
  const restaurantId = texte(formData.get("restaurant_id"));
  const id = texte(formData.get("id"));
  const fichier = formData.get("photo") as File | null;

  if (!peutGerer(await roleSur(restaurantId))) {
    return { error: "Seul un gérant peut modifier la carte." };
  }
  if (!fichier || fichier.size === 0) {
    return { error: "Choisis une photo." };
  }
  if (!fichier.type.startsWith("image/")) {
    return { error: "Ce fichier n'est pas une image." };
  }
  if (fichier.size > TAILLE_MAX) {
    return {
      error: "Photo trop lourde (4 Mo maximum). Réduis-la avant de l'envoyer.",
    };
  }

  const supabase = await createClient();
  // Le premier dossier reste l'identifiant de l'établissement : c'est sur lui
  // que portent les règles d'accès au stockage.
  const extension = fichier.name.split(".").pop()?.toLowerCase() || "jpg";
  const chemin = `${restaurantId}/carte/${randomUUID()}.${extension}`;

  const { error: envoi } = await supabase.storage
    .from(BUCKET)
    .upload(chemin, fichier, { contentType: fichier.type });
  if (envoi) {
    console.error("[envoyerPhotoPlat]", envoi);
    return { error: "L'envoi a échoué. Réessaie." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(chemin);

  // L'ancien chemin est relu avant l'écriture : c'est lui qu'on efface une
  // fois le nouveau enregistré, et jamais avant — une suppression d'abord
  // laisserait le plat sans photo si l'écriture échouait.
  const { data: avant } = await supabase
    .from("restaurant_menu_items")
    .select("photo_storage_path")
    .eq("id", id)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  const { error } = await supabase
    .from("restaurant_menu_items")
    .update({
      photo_url: publicUrl,
      photo_storage_path: chemin,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("restaurant_id", restaurantId);

  if (error) {
    console.error("[envoyerPhotoPlat]", error);
    await supabase.storage.from(BUCKET).remove([chemin]);
    return { error: "La photo n'a pas été enregistrée." };
  }

  const ancien = (avant as { photo_storage_path: string | null } | null)
    ?.photo_storage_path;
  if (ancien && ancien !== chemin) {
    await supabase.storage.from(BUCKET).remove([ancien]);
  }

  revalidatePath(`/dashboard/${restaurantId}/menu`);
  return { error: null };
}

export async function retirerPhotoPlat(formData: FormData) {
  const restaurantId = texte(formData.get("restaurant_id"));
  const id = texte(formData.get("id"));
  if (!peutGerer(await roleSur(restaurantId))) return;

  const supabase = await createClient();
  const { data: avant } = await supabase
    .from("restaurant_menu_items")
    .select("photo_storage_path")
    .eq("id", id)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  const { error } = await supabase
    .from("restaurant_menu_items")
    .update({
      photo_url: null,
      photo_storage_path: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("restaurant_id", restaurantId);

  if (error) {
    console.error("[retirerPhotoPlat]", error);
    return;
  }

  const chemin = (avant as { photo_storage_path: string | null } | null)
    ?.photo_storage_path;
  if (chemin) await supabase.storage.from(BUCKET).remove([chemin]);

  revalidatePath(`/dashboard/${restaurantId}/menu`);
}


/**
 * Traduire en anglais ce qui ne l'est pas encore, ou ne l'est plus depuis
 * que le français a changé. Ce qui est déjà à jour n'est pas renvoyé au
 * modèle : une carte de quarante plats coûterait une fortune à retraduire
 * en entier à chaque virgule corrigée.
 */
export async function traduireCarte(formData: FormData): Promise<{
  error: string | null;
  traduits: number;
}> {
  const restaurantId = texte(formData.get("restaurant_id"));
  if (!peutGerer(await roleSur(restaurantId))) {
    return { error: "Seul un gérant peut traduire la carte.", traduits: 0 };
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      error:
        "La traduction automatique n'est pas encore branchée (clé Anthropic manquante).",
      traduits: 0,
    };
  }

  const carte = await chargerCarte(restaurantId);
  const manquants = aTraduire(carte, "en");
  if (manquants.length === 0) {
    return { error: null, traduits: 0 };
  }

  let traductions;
  try {
    traductions = await traduirePlats(manquants);
  } catch (erreur) {
    console.error("[traduireCarte]", erreur);
    return {
      error: "La traduction a échoué. Réessaie dans un moment.",
      traduits: 0,
    };
  }

  if (traductions.size === 0) {
    return { error: "Aucune traduction n'a pu être produite.", traduits: 0 };
  }

  const supabase = await createClient();
  const maintenant = new Date().toISOString();
  const ecritures = await Promise.all(
    [...traductions.entries()].map(([id, traduction]) => {
      const plat = manquants.find((item) => item.id === id)!;
      // Les autres langues déjà enregistrées sont conservées : on ne remplace
      // que l'anglais.
      const suite: Traductions = { ...(plat.traductions ?? {}), en: traduction };
      return supabase
        .from("restaurant_menu_items")
        .update({ traductions: suite, updated_at: maintenant })
        .eq("id", id)
        .eq("restaurant_id", restaurantId);
    }),
  );

  const echec = ecritures.find((resultat) => resultat.error);
  if (echec) {
    console.error("[traduireCarte]", echec.error);
    return {
      error: "Certaines traductions n'ont pas été enregistrées.",
      traduits: 0,
    };
  }

  revalidatePath(`/dashboard/${restaurantId}/menu`);
  return { error: null, traduits: traductions.size };
}
