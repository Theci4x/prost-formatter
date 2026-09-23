"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { JOURS_SEMAINE, type Horaires } from "@/types/restaurant";
import { notifierInterne } from "@/lib/notifications/interne";
import { siteUrl } from "@/lib/site-url";

export type RestaurantFormState = {
  error: string | null;
};

const JOUR_LISIBLE: Record<string, string> = {
  lundi: "lundi",
  mardi: "mardi",
  mercredi: "mercredi",
  jeudi: "jeudi",
  vendredi: "vendredi",
  samedi: "samedi",
  dimanche: "dimanche",
};

/**
 * Reconstruit l'objet horaires à partir des champs
 * `horaire_<jour>_ferme/ouverture/fermeture` soumis par RestaurantForm,
 * et de la seconde plage quand la coupure est cochée.
 *
 * Une coupure incohérente est refusée plutôt que corrigée en silence :
 * « 12h – 15h et 11h – 14h » n'est pas une faute de frappe qu'on devine,
 * et l'afficher tel quel sur la devanture ferait venir des gens à
 * l'heure où la maison est vide.
 */
function parseHoraires(formData: FormData): {
  horaires: Horaires;
  erreur: string | null;
} {
  const horaires: Horaires = {};
  for (const jour of JOURS_SEMAINE) {
    const ferme = formData.get(`horaire_${jour}_ferme`) === "on";
    const ouverture =
      (formData.get(`horaire_${jour}_ouverture`) as string) || "09:00";
    const fermeture =
      (formData.get(`horaire_${jour}_fermeture`) as string) || "22:00";

    const coupure = !ferme && formData.get(`horaire_${jour}_coupure`) === "on";
    const ouverture2 =
      (formData.get(`horaire_${jour}_ouverture2`) as string) || "";
    const fermeture2 =
      (formData.get(`horaire_${jour}_fermeture2`) as string) || "";

    if (coupure) {
      if (!ouverture2 || !fermeture2) {
        return {
          horaires,
          erreur: `Renseigne les heures du second service du ${JOUR_LISIBLE[jour]}, ou décoche la coupure.`,
        };
      }
      // Les heures se comparent comme du texte : « HH:MM » se range dans
      // l'ordre chronologique, et c'est vrai tant qu'on reste dans la
      // journée — ce qui est le cas d'une coupure.
      if (ouverture2 <= fermeture) {
        return {
          horaires,
          erreur: `Le second service du ${JOUR_LISIBLE[jour]} doit commencer après la fermeture du premier.`,
        };
      }
      if (fermeture2 <= ouverture2) {
        return {
          horaires,
          erreur: `Le second service du ${JOUR_LISIBLE[jour]} se termine avant d'avoir commencé.`,
        };
      }
    }

    horaires[jour] = {
      ferme,
      ouverture,
      fermeture,
      seconde: coupure
        ? { ouverture: ouverture2, fermeture: fermeture2 }
        : null,
    };
  }
  return { horaires, erreur: null };
}

export async function createRestaurant(
  _prevState: RestaurantFormState,
  formData: FormData,
): Promise<RestaurantFormState> {
  const nom = formData.get("nom") as string;
  const adresse = formData.get("adresse") as string;
  const telephone = formData.get("telephone") as string;
  const siteWeb = formData.get("site_web") as string;
  const description = formData.get("description") as string;
  const typeCuisine = formData.get("type_cuisine") as string;

  const { horaires, erreur } = parseHoraires(formData);
  if (erreur) return { error: erreur };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("restaurants").insert({
    nom,
    adresse: adresse || null,
    telephone: telephone || null,
    site_web: siteWeb || null,
    description: description || null,
    type_cuisine: typeCuisine?.trim() || null,
    horaires,
    proprietaire_id: user.id,
    // L'adresse qui reçoit les réservations, par défaut celle du compte.
    // Vide, elle veut dire « ne rien recevoir » : un restaurateur aurait
    // dû deviner qu'un champ l'attendait au fond de la configuration pour
    // être prévenu de ses propres tables. Elle se change, et se vide, mais
    // c'est un choix désormais, pas un oubli.
    email_contact: user.email ?? null,
  });

  if (error) {
    return { error: error.message };
  }

  // Cinq établissements se sont inscrits sans que personne ne le sache. Un
  // essai de quatorze jours commence à cette seconde : c'est maintenant
  // qu'un mot de bienvenue vaut quelque chose, pas le jour où il expire.
  await notifierInterne({
    titre: `Nouvel établissement — ${nom}`,
    lignes: [
      adresse ? `${nom} — ${adresse}` : nom,
      `Propriétaire : ${user.email ?? "adresse inconnue"}`,
      telephone ? `Téléphone : ${telephone}` : "Aucun téléphone renseigné.",
      "Essai de 14 jours ouvert.",
    ],
    lien: { libelle: "Ouvrir l'administration", url: `${siteUrl()}/admin` },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/**
 * Deux valeurs égales à l'ordre des clés près : une colonne jsonb ne
 * rend pas forcément les horaires dans l'ordre où on les a écrits.
 */
function stable(valeur: unknown): string {
  if (Array.isArray(valeur)) return `[${valeur.map(stable).join(",")}]`;
  if (valeur && typeof valeur === "object") {
    // Une clé vide ou nulle vaut une clé absente : le formulaire envoie
    // parfois `seconde: undefined` là où la base n'a rien, et ce n'est pas
    // une modification de la fiche.
    const objet = valeur as Record<string, unknown>;
    return `{${Object.keys(objet)
      .filter((cle) => objet[cle] != null && objet[cle] !== "")
      .sort()
      .map((cle) => `${JSON.stringify(cle)}:${stable(objet[cle])}`)
      .join(",")}}`;
  }
  return JSON.stringify(valeur ?? null);
}

/** Ce qu'on recopie sur les autres plateformes a-t-il changé ? */
function ficheChangee(
  avant: Record<string, unknown>,
  apres: Record<string, unknown>,
): boolean {
  return Object.keys(apres).some(
    (cle) => stable(avant[cle] ?? null) !== stable(apres[cle] ?? null),
  );
}

export async function updateRestaurant(
  _prevState: RestaurantFormState,
  formData: FormData,
): Promise<RestaurantFormState> {
  const id = formData.get("id") as string;
  const nom = formData.get("nom") as string;
  const adresse = formData.get("adresse") as string;
  const telephone = formData.get("telephone") as string;
  const siteWeb = formData.get("site_web") as string;
  const description = formData.get("description") as string;
  const typeCuisine = formData.get("type_cuisine") as string;

  const { horaires, erreur } = parseHoraires(formData);
  if (erreur) return { error: erreur };

  const supabase = await createClient();

  // Ce qu'il y avait avant, pour savoir si la fiche recopiée ailleurs
  // (Apple, PagesJaunes…) vient de devenir fausse.
  const { data: avant } = await supabase
    .from("restaurants")
    .select("nom, adresse, telephone, site_web, horaires")
    .eq("id", id)
    .maybeSingle();

  const nouvelle = {
    nom,
    adresse: adresse || null,
    telephone: telephone || null,
    site_web: siteWeb || null,
    horaires,
  };

  // La RLS ("restaurants_update_own") garantit qu'on ne peut modifier que
  // ses propres restaurants, meme si l'id est manipule.
  const { error } = await supabase
    .from("restaurants")
    .update({
      ...nouvelle,
      description: description || null,
      type_cuisine: typeCuisine?.trim() || null,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  // À part, et sans bloquer : sur une base sans la migration 0080, la
  // colonne n'existe pas, et l'enregistrement de la fiche ne doit pas
  // échouer pour autant.
  if (avant && ficheChangee(avant, nouvelle)) {
    const { error: erreurDate } = await supabase
      .from("restaurants")
      .update({ fiche_modifiee_le: new Date().toISOString() })
      .eq("id", id);
    if (erreurDate)
      console.error("[updateRestaurant] fiche_modifiee_le", erreurDate.message);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteRestaurant(formData: FormData) {
  const id = formData.get("id") as string;

  const supabase = await createClient();
  await supabase.from("restaurants").delete().eq("id", id);

  revalidatePath("/dashboard");
}

/**
 * Ouvre ou ferme la vitrine du restaurant.
 *
 * Comme pour la carte, publier est un geste : une fiche remplie à moitié
 * n'a rien à faire sur une adresse que Google va indexer, et un
 * restaurateur doit pouvoir tout saisir avant de se montrer.
 */
export async function basculerVitrine(formData: FormData) {
  const id = formData.get("id") as string;
  const publier = formData.get("publier") === "1";

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurants")
    .update({ site_publie: publier })
    .eq("id", id);

  if (error) console.error("[basculerVitrine]", error);

  revalidatePath(`/dashboard/${id}/edit`);
  // La vitrine elle-même : sans cette ligne, une page qu'on vient de fermer
  // resterait servie depuis le cache.
  revalidatePath("/restaurant/[slug]", "page");
  // Et le plan du site, qui se régénère sinon toutes les heures : une
  // vitrine publiée doit pouvoir être soumise à Google dans la minute, pas
  // au prochain tour d'horloge.
  revalidatePath("/sitemap.xml");
}
