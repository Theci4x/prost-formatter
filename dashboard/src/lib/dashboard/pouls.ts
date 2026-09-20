import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { completude } from "@/lib/seo/questions-suggerees";

/**
 * Le pouls d'un établissement : les quelques chiffres qui changent chaque
 * jour, réunis pour l'écran d'accueil du tableau de bord.
 *
 * Seize cases identiques, c'est un plan du site ; un restaurateur qui
 * l'ouvre le matin ne sait pas où regarder. Les chiffres d'ici lui disent
 * s'il a du travail — et où. Tout vient de tables qui existent déjà :
 * aucune requête ici n'invente une donnée, et chacune tolère l'absence
 * (une maison qui n'a pas encore de carnet n'a simplement rien à compter).
 *
 * Chaque compteur échoue seul : une table indisponible laisse sa case à
 * zéro sans priver les autres. Rien d'ici ne doit empêcher la page de
 * s'afficher.
 */

export type Pouls = {
  /** Le jour compté, « 2026-09-17 ». */
  jour: string;
  /** Couverts confirmés aujourd'hui, avant et après 17 h. */
  couvertsMidi: number;
  couvertsSoir: number;
  /** Demandes en attente d'une décision, aujourd'hui ou plus tard. */
  aConfirmer: number;
  /** Retours privés (totem, QR) pas encore lus. */
  retoursALire: number;
  /** Dernier relevé Google : note et nombre d'avis. */
  note: number | null;
  nombreAvis: number | null;
  /** Avis gagnés depuis le relevé d'il y a une semaine. Null sans recul. */
  avisCetteSemaine: number | null;
  /** La prochaine publication Google programmée, ISO. */
  prochainPost: string | null;
  cartePubliee: boolean;
  /**
   * Vrai quand l'établissement n'a aucune adresse de contact. Sans elle,
   * l'alerte de réservation ne part nulle part et le client qui répond à
   * sa confirmation écrit dans le vide — en silence, des deux côtés.
   */
  sansEmailContact: boolean;
  nombrePlats: number;
  nombrePhotos: number;
  couvertureUrl: string | null;
  sitePublie: boolean;
  nombreQuestions: number;
  /**
   * L'avancement sur les questions qu'on propose : combien sont
   * répondues, sur combien concernent cette maison — celle qui n'ouvre
   * que le soir n'est pas comptée en retard sur le menu du midi.
   *
   * Distinct de `nombreQuestions`, qui compte tout ce qu'elle a écrit,
   * ses propres questions comprises.
   */
  questionsSuggerees: { repondues: number; attendues: number };
  connexions: {
    google: boolean;
    facebook: boolean;
    instagram: boolean;
    tiktok: boolean;
  };
  /** Sur les questions posées aux IA, combien citent la maison au dernier passage. */
  ia: { citees: number; total: number } | null;
  /**
   * Le fichier client : tout le monde, et ceux à qui on a le droit
   * d'écrire. L'écart entre les deux est le chiffre utile — il dit
   * combien de clients sont passés sans cocher la case.
   */
  contacts: { total: number; joignables: number };
};

/** Même convention que l'écran de service : le jour, tel que le serveur le voit. */
export function jourDuPouls(maintenant: Date): string {
  return maintenant.toISOString().slice(0, 10);
}

/** Avant 17 h, c'est le midi. Une frontière simple vaut mieux qu'une jointure sur les services. */
const HEURE_SOIR = "17:00";

type Reservation = { heure_arrivee: string | null; couverts: number | null };
type Snapshot = {
  note: number | string | null;
  nombre_avis: number | null;
  releve_le: string;
};
type Check = { question_id: string; est_cite: boolean; created_at: string };

type Filtres = Record<string, string | boolean>;

/**
 * Compte des lignes sans les rapatrier. `head: true` ne renvoie que le
 * total : douze compteurs par établissement ne doivent pas coûter douze
 * lectures de table.
 */
async function compter(
  supabase: SupabaseClient,
  table: string,
  egaux: Filtres,
  auMoins?: { colonne: string; valeur: string },
): Promise<number> {
  try {
    let requete = supabase
      .from(table)
      .select("id", { count: "exact", head: true });
    for (const [colonne, valeur] of Object.entries(egaux)) {
      requete = requete.eq(colonne, valeur);
    }
    if (auMoins) requete = requete.gte(auMoins.colonne, auMoins.valeur);
    const { count, error } = await requete;
    if (error) {
      console.error(`[pouls] ${table}`, error.message);
      return 0;
    }
    return count ?? 0;
  } catch (cause) {
    console.error(`[pouls] ${table}`, cause);
    return 0;
  }
}

export async function chargerPouls(
  supabase: SupabaseClient,
  restaurant: {
    id: string;
    photo_couverture_id?: string | null;
    site_publie?: boolean | null;
    carte_publique?: boolean | null;
    email_contact?: string | null;
  },
  maintenant: Date = new Date(),
): Promise<Pouls> {
  const id = restaurant.id;
  const jour = jourDuPouls(maintenant);
  const ilYAUneSemaine = new Date(
    maintenant.getTime() - 7 * 86400000,
  ).toISOString();

  const [
    tablesDuJour,
    aConfirmer,
    retoursALire,
    snapshots,
    prochainPost,
    nombrePlats,
    nombrePhotos,
    couverture,
    questionsPosees,
    google,
    social,
    tiktok,
    checks,
    contactsTotal,
    contactsJoignables,
    services,
  ] = await Promise.all([
    supabase
      .from("restaurant_reservations")
      .select("heure_arrivee, couverts")
      .eq("restaurant_id", id)
      .eq("date_reservation", jour)
      .eq("statut", "confirmee")
      .then(({ data, error }) => {
        if (error) console.error("[pouls] réservations du jour", error.message);
        return (data ?? []) as Reservation[];
      }),
    compter(
      supabase,
      "restaurant_reservations",
      { restaurant_id: id, statut: "demande" },
      { colonne: "date_reservation", valeur: jour },
    ),
    compter(supabase, "restaurant_retours", {
      restaurant_id: id,
      traite: false,
    }),
    supabase
      .from("restaurant_reputation_snapshots")
      .select("note, nombre_avis, releve_le")
      .eq("restaurant_id", id)
      .eq("plateforme", "google")
      .order("releve_le", { ascending: false })
      .limit(14)
      .then(({ data }) => (data ?? []) as Snapshot[]),
    supabase
      .from("restaurant_posts")
      .select("publier_le")
      .eq("restaurant_id", id)
      .eq("statut", "programme")
      .gte("publier_le", maintenant.toISOString())
      .order("publier_le", { ascending: true })
      .limit(1)
      .maybeSingle()
      .then(
        ({ data }) =>
          (data as { publier_le: string } | null)?.publier_le ?? null,
      ),
    compter(supabase, "restaurant_menu_items", {
      restaurant_id: id,
      actif: true,
    }),
    compter(supabase, "restaurant_photos", { restaurant_id: id }),
    restaurant.photo_couverture_id
      ? supabase
          .from("restaurant_photos")
          .select("url")
          .eq("id", restaurant.photo_couverture_id)
          .maybeSingle()
          .then(({ data }) => (data as { url: string } | null)?.url ?? null)
      : Promise.resolve<string | null>(null),
    supabase
      .from("restaurant_faq")
      .select("question")
      .eq("restaurant_id", id)
      .then(({ data, error }) => {
        if (error) console.error("[pouls] faq", error.message);
        return ((data ?? []) as { question: string }[]).map((q) => q.question);
      }),
    compter(supabase, "google_business_connections", { restaurant_id: id }),
    supabase
      .from("social_connections")
      .select("instagram_business_account_id")
      .eq("restaurant_id", id)
      .limit(1)
      .maybeSingle()
      .then(
        ({ data }) =>
          data as { instagram_business_account_id: string | null } | null,
      ),
    compter(supabase, "tiktok_connections", { restaurant_id: id }),
    supabase
      .from("ai_visibility_checks")
      .select("question_id, est_cite, created_at")
      .eq("restaurant_id", id)
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => (data ?? []) as Check[]),
    compter(supabase, "restaurant_contacts", { restaurant_id: id }),
    // `compter` ne sait poser que des égalités, et « pas désinscrit »
    // s'écrit `is null`. L'index partiel de la migration rend la requête
    // immédiate malgré la table entière.
    supabase
      .from("restaurant_contacts")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", id)
      .eq("consentement", true)
      .is("desabonne_le", null)
      .then(({ count, error }) => {
        if (error) console.error("[pouls] contacts joignables", error.message);
        return count ?? 0;
      }),
    supabase
      .from("restaurant_services")
      .select("heure_debut")
      .eq("restaurant_id", id)
      .then(({ data }) => (data ?? []) as { heure_debut: string | null }[]),
  ]);

  let couvertsMidi = 0;
  let couvertsSoir = 0;
  for (const table of tablesDuJour) {
    const couverts = table.couverts ?? 0;
    if ((table.heure_arrivee ?? "20:00") < HEURE_SOIR) couvertsMidi += couverts;
    else couvertsSoir += couverts;
  }

  // Le relevé le plus récent donne la note ; le premier relevé d'il y a au
  // moins sept jours donne le recul. Sans lui, on ne prétend pas savoir.
  const dernier = snapshots[0] ?? null;
  const reference =
    snapshots.find((s) => s.releve_le <= ilYAUneSemaine) ?? null;
  const avisCetteSemaine =
    dernier?.nombre_avis != null && reference?.nombre_avis != null
      ? dernier.nombre_avis - reference.nombre_avis
      : null;

  // Une question n'est comptée qu'une fois, sur son dernier passage : les
  // lignes arrivent de la plus récente à la plus ancienne.
  const derniereParQuestion = new Map<string, boolean>();
  for (const check of checks) {
    if (!derniereParQuestion.has(check.question_id)) {
      derniereParQuestion.set(check.question_id, check.est_cite);
    }
  }
  const ia =
    derniereParQuestion.size > 0
      ? {
          citees: [...derniereParQuestion.values()].filter(Boolean).length,
          total: derniereParQuestion.size,
        }
      : null;

  // La même règle que l'écran des questions : une maison qui n'ouvre que
  // le soir n'a pas à répondre sur le menu du midi, et ne doit donc pas
  // rester éternellement « 6 sur 7 » pour une question hors sujet.
  const avancement = completude(
    {
      serviceMidi: services.some(
        (service) => (service.heure_debut ?? "").slice(0, 5) < "15:00",
      ),
    },
    questionsPosees,
  );

  return {
    jour,
    couvertsMidi,
    couvertsSoir,
    aConfirmer,
    retoursALire,
    note: dernier?.note != null ? Number(dernier.note) : null,
    nombreAvis: dernier?.nombre_avis ?? null,
    avisCetteSemaine,
    prochainPost,
    cartePubliee: restaurant.carte_publique === true,
    sansEmailContact: !restaurant.email_contact?.trim(),
    nombrePlats,
    nombrePhotos,
    couvertureUrl: couverture,
    sitePublie: restaurant.site_publie === true,
    nombreQuestions: questionsPosees.length,
    questionsSuggerees: {
      repondues: avancement.repondues,
      attendues: avancement.attendues,
    },
    connexions: {
      google: google > 0,
      facebook: social !== null,
      instagram: Boolean(social?.instagram_business_account_id),
      tiktok: tiktok > 0,
    },
    ia,
    contacts: { total: contactsTotal, joignables: contactsJoignables },
  };
}
