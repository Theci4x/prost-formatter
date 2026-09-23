import type { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/site-url";
import {
  heuresPlage,
  intitulePlage,
  plagesHoraires,
} from "@/lib/site/horaires";
import {
  PLATEFORMES,
  estStatut,
  type Plateforme,
  type StatutPresence,
} from "@/lib/presence/plateformes";
import type { Restaurant } from "@/types/restaurant";

/**
 * Où en est la présence d'un restaurant : ce que Klarr sait déjà, ce que
 * le restaurateur a constaté, et ce qu'il doit reprendre.
 *
 * Partagé par la page Présence, le mode guidé et l'accueil : les trois
 * doivent compter la même chose, sinon l'accueil annonce « 3 fiches à
 * revoir » et la page en montre deux.
 */

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/** Ce que Klarr sait sans demander : relié chez nous, donc présent. */
export type Relie = { texte: string; ecran: string };
export type Constat = { statut: StatutPresence; verifieLe: string };

export type RestaurantPresence = Restaurant & {
  site_publie?: boolean;
  tripadvisor_location_id?: string | null;
  /** Colonne récente (0080) : absente sur une base pas encore migrée. */
  fiche_modifiee_le?: string | null;
};

export type ChampFiche = { libelle: string; valeur: string | null; ou: string };

export type EtatPresence = {
  restaurant: RestaurantPresence;
  relies: Record<string, Relie | null>;
  constats: Map<string, Constat>;
  champs: ChampFiche[];
  /** Sans la migration 0079, les statuts ne s'enregistrent pas : on le dit. */
  tableAbsente: boolean;
};

/**
 * La fiche qu'on recopie partout. Le site cité est la vitrine quand elle
 * est publiée : c'est la page que Klarr tient à jour.
 */
export function champsFiche(restaurant: RestaurantPresence): ChampFiche[] {
  const slug = restaurant.slug_reservation;
  const site = siteUrl();
  const horaires = plagesHoraires(restaurant.horaires ?? {})
    .map((plage) => `${intitulePlage(plage)} : ${heuresPlage(plage)}`)
    .join("\n");
  return [
    { libelle: "Nom", valeur: restaurant.nom, ou: "edit" },
    { libelle: "Adresse", valeur: restaurant.adresse, ou: "edit" },
    { libelle: "Téléphone", valeur: restaurant.telephone, ou: "edit" },
    {
      libelle: "Site web",
      valeur:
        restaurant.site_publie && slug
          ? `${site}/restaurant/${slug}`
          : restaurant.site_web,
      ou: "vitrine",
    },
    {
      libelle: "Réservation",
      valeur: slug ? `${site}/reserver/${slug}` : null,
      ou: "reservations/configuration",
    },
    { libelle: "Cuisine", valeur: restaurant.type_cuisine, ou: "edit" },
    { libelle: "Horaires", valeur: horaires || null, ou: "edit" },
    { libelle: "Description", valeur: restaurant.description, ou: "edit" },
  ];
}

export function reliesDe(
  restaurant: RestaurantPresence,
  google: { location_title: string | null } | null,
  social: {
    facebook_page_name: string | null;
    instagram_username: string | null;
  } | null,
): Record<string, Relie | null> {
  const slug = restaurant.slug_reservation;
  return {
    google: google
      ? { texte: google.location_title ?? "Fiche reliée", ecran: "google" }
      : null,
    facebook: social?.facebook_page_name
      ? { texte: social.facebook_page_name, ecran: "social" }
      : null,
    instagram: social?.instagram_username
      ? { texte: `@${social.instagram_username}`, ecran: "social" }
      : null,
    tripadvisor: restaurant.tripadvisor_location_id
      ? { texte: "Fiche épinglée dans Avis", ecran: "avis" }
      : null,
    vitrine:
      restaurant.site_publie && slug
        ? { texte: `${siteUrl()}/restaurant/${slug}`, ecran: "vitrine" }
        : null,
  };
}

export function constatsDe(
  lignes: { plateforme: string; statut: string; verifie_le: string }[],
): Map<string, Constat> {
  const constats = new Map<string, Constat>();
  for (const ligne of lignes) {
    if (estStatut(ligne.statut)) {
      constats.set(ligne.plateforme, {
        statut: ligne.statut,
        verifieLe: ligne.verifie_le,
      });
    }
  }
  return constats;
}

/**
 * Une plateforme à reprendre parce que la fiche a changé dans Klarr
 * depuis la dernière vérification.
 *
 * Seulement là où une fiche existe — reliée, ou constatée à jour ou à
 * corriger. La vitrine est exclue : c'est Klarr qui l'écrit, elle suit
 * toute seule. Google et Facebook, eux, ne la suivent pas encore : Klarr
 * les lit, il ne les écrit pas.
 */
export function aRevoir(
  cle: string,
  relie: Relie | null,
  constat: Constat | null,
  ficheModifieeLe: string | null | undefined,
): boolean {
  if (cle === "vitrine" || !ficheModifieeLe) return false;
  const existe =
    Boolean(relie) ||
    constat?.statut === "a_jour" ||
    constat?.statut === "a_corriger";
  if (!existe) return false;
  return !constat || constat.verifieLe < ficheModifieeLe;
}

export type EtatPlateforme = StatutPresence | "relie" | "a_revoir" | null;

export function etatDe(
  plateforme: Plateforme,
  etat: Pick<EtatPresence, "relies" | "constats" | "restaurant">,
): EtatPlateforme {
  const relie = etat.relies[plateforme.cle] ?? null;
  const constat = etat.constats.get(plateforme.cle) ?? null;
  if (
    aRevoir(plateforme.cle, relie, constat, etat.restaurant.fiche_modifiee_le)
  ) {
    return "a_revoir";
  }
  if (relie) return "relie";
  return constat?.statut ?? null;
}

/**
 * L'ordre du mode guidé : d'abord ce qui est devenu faux, puis ce qui
 * manque parmi les essentielles, puis les annuaires. Dans chaque bloc,
 * l'ordre de la liste — du plus consulté au moins consulté.
 */
export function fileGuidee(
  etat: Pick<EtatPresence, "relies" | "constats" | "restaurant">,
  passees: string[] = [],
): Plateforme[] {
  const aFaire = (p: Plateforme) => {
    const e = etatDe(p, etat);
    return e === null || e === "a_corriger" || e === "absente";
  };
  const file = [
    ...PLATEFORMES.filter((p) => etatDe(p, etat) === "a_revoir"),
    ...PLATEFORMES.filter((p) => p.niveau === 1 && aFaire(p)),
    ...PLATEFORMES.filter((p) => p.niveau === 2 && aFaire(p)),
  ];
  return file.filter((p) => !passees.includes(p.cle));
}

/** Une plateforme réglée : reliée ou constatée à jour, et pas à revoir. */
export function estReglee(etat: EtatPlateforme): boolean {
  return etat === "relie" || etat === "a_jour";
}

export async function chargerPresence(
  supabase: SupabaseClient,
  id: string,
): Promise<EtatPresence | null> {
  const [restaurantResult, presenceResult, googleResult, socialResult] =
    await Promise.all([
      supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("restaurant_presence")
        .select("plateforme, statut, verifie_le")
        .eq("restaurant_id", id),
      supabase
        .from("google_business_connections")
        .select("location_title")
        .eq("restaurant_id", id)
        .maybeSingle(),
      supabase
        .from("social_connections")
        .select("facebook_page_name, instagram_username")
        .eq("restaurant_id", id)
        .maybeSingle(),
    ]);

  const restaurant = restaurantResult.data as RestaurantPresence | null;
  if (!restaurant) return null;

  return {
    restaurant,
    relies: reliesDe(
      restaurant,
      googleResult.data as { location_title: string | null } | null,
      socialResult.data as {
        facebook_page_name: string | null;
        instagram_username: string | null;
      } | null,
    ),
    constats: constatsDe(
      (presenceResult.data ?? []) as {
        plateforme: string;
        statut: string;
        verifie_le: string;
      }[],
    ),
    champs: champsFiche(restaurant),
    tableAbsente: ["42P01", "PGRST205"].includes(
      presenceResult.error?.code ?? "",
    ),
  };
}
