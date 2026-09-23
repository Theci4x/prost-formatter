import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * La lecture du fichier client.
 *
 * Tout passe par la vue `restaurant_contacts_fiches`, qui recolle
 * l'identité et l'historique en une requête. Les compteurs de venues ne
 * sont stockés nulle part : ils se déduisent des réservations, et c'est
 * volontaire — un compteur tenu à la main finit toujours par mentir.
 */

export type Fiche = {
  id: string;
  email: string;
  nom: string | null;
  telephone: string | null;
  consentement: boolean;
  consentement_le: string | null;
  desabonne_le: string | null;
  note_interne: string | null;
  venues: number;
  couverts: number;
  premiere_venue: string | null;
  derniere_venue: string | null;
};

/**
 * Le plafond d'un écran.
 *
 * Une maison qui tourne depuis trois ans a plusieurs milliers de fiches,
 * et les afficher toutes ne sert personne : on cherche quelqu'un, ou on
 * regarde les derniers venus. Au-delà, la recherche prend le relais — et
 * l'écran le dit plutôt que de laisser croire que le fichier s'arrête là.
 */
export const FICHES_PAR_PAGE = 100;

export type Tri = "recents" | "fideles" | "nom";

const COLONNE_DE_TRI: Record<Tri, { colonne: string; croissant: boolean }> = {
  recents: { colonne: "derniere_venue", croissant: false },
  fideles: { colonne: "venues", croissant: false },
  nom: { colonne: "nom", croissant: true },
};

export type Lecture = {
  fiches: Fiche[];
  /** Le total du fichier, indépendamment de la recherche et de la page. */
  total: number;
  /** Ceux à qui on a le droit d'écrire, sur ce même total. */
  joignables: number;
  /** Combien répondent à la recherche en cours. */
  trouves: number;
  /**
   * Vrai quand la vue n'a pas répondu et que la liste vient directement
   * de la table : les personnes sont là, leurs venues non. L'écran le dit
   * au lieu d'annoncer un fichier vide sous un compteur qui en affiche
   * deux — c'est ce qu'il faisait.
   */
  sansHistorique: boolean;
};

/** Les colonnes de la table qu'on montre, le jeton de désinscription exclu. */
const COLONNES_CONTACT =
  "id, email, nom, telephone, consentement, consentement_le, desabonne_le, note_interne, created_at";

/** Le motif de recherche, débarrassé de ce qui a un sens pour PostgREST. */
function motifDe(q: string): string {
  // `%` et `,` ont un sens dans la syntaxe de PostgREST : sans cet
  // échappement, chercher « a,b » coupe le filtre en deux conditions.
  return `%${q.replace(/[%,()]/g, " ")}%`;
}

/**
 * Cherche dans un fichier client.
 *
 * La recherche porte sur le nom et l'adresse, jamais sur la note interne :
 * elle est au restaurateur, et un collègue qui tape un mot au hasard n'a
 * pas à tomber dessus.
 */
export async function lireFiches({
  supabase,
  restaurantId,
  recherche = "",
  tri = "recents",
  page = 0,
}: {
  supabase: SupabaseClient;
  restaurantId: string;
  recherche?: string;
  tri?: Tri;
  page?: number;
}): Promise<Lecture> {
  const q = recherche.trim();
  const { colonne, croissant } = COLONNE_DE_TRI[tri];

  let requete = supabase
    .from("restaurant_contacts_fiches")
    .select("*", { count: "exact" })
    .eq("restaurant_id", restaurantId);

  if (q) {
    const motif = motifDe(q);
    requete = requete.or(`nom.ilike.${motif},email.ilike.${motif}`);
  }

  const debut = page * FICHES_PAR_PAGE;
  const [liste, totaux] = await Promise.all([
    requete
      // Une maison sans venue n'a pas de dernière venue : elle passe
      // après, et non en tête comme le ferait l'ordre par défaut.
      .order(colonne, { ascending: croissant, nullsFirst: false })
      .order("email", { ascending: true })
      .range(debut, debut + FICHES_PAR_PAGE - 1),
    compterLeFichier(supabase, restaurantId),
  ]);

  if (liste.error) {
    console.error("[fiches] lecture", liste.error.message);
    // La vue calcule l'historique ; la table, elle, a les personnes. Si
    // la première ne répond pas, on montre au moins les secondes.
    return {
      ...(await lireSansHistorique(supabase, restaurantId, q, tri, debut)),
      total: totaux.total,
      joignables: totaux.joignables,
    };
  }

  return {
    fiches: (liste.data ?? []) as Fiche[],
    total: totaux.total,
    joignables: totaux.joignables,
    trouves: liste.count ?? 0,
    sansHistorique: false,
  };
}

/**
 * Le repli : la table des contacts telle quelle, sans venues ni dates.
 * « Derniers venus » y devient « derniers inscrits » — l'ordre le plus
 * proche qu'on puisse tenir sans l'historique.
 */
async function lireSansHistorique(
  supabase: SupabaseClient,
  restaurantId: string,
  q: string,
  tri: Tri,
  debut: number,
): Promise<{ fiches: Fiche[]; trouves: number; sansHistorique: true }> {
  let requete = supabase
    .from("restaurant_contacts")
    .select(COLONNES_CONTACT, { count: "exact" })
    .eq("restaurant_id", restaurantId);
  if (q) {
    const motif = motifDe(q);
    requete = requete.or(`nom.ilike.${motif},email.ilike.${motif}`);
  }
  const { data, count, error } = await (tri === "nom"
    ? requete.order("nom", { ascending: true, nullsFirst: false })
    : requete.order("created_at", { ascending: false })
  )
    .order("email", { ascending: true })
    .range(debut, debut + FICHES_PAR_PAGE - 1);

  if (error) {
    console.error("[fiches] repli", error.message);
    return { fiches: [], trouves: 0, sansHistorique: true };
  }
  const fiches = (
    (data ?? []) as Omit<
      Fiche,
      "venues" | "couverts" | "premiere_venue" | "derniere_venue"
    >[]
  ).map((contact) => ({
    ...contact,
    venues: 0,
    couverts: 0,
    premiere_venue: null,
    derniere_venue: null,
  }));
  return { fiches, trouves: count ?? 0, sansHistorique: true };
}

async function compterLeFichier(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<{ total: number; joignables: number }> {
  const [tous, ouverts] = await Promise.all([
    supabase
      .from("restaurant_contacts")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId),
    supabase
      .from("restaurant_contacts")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .eq("consentement", true)
      .is("desabonne_le", null),
  ]);
  if (tous.error) console.error("[fiches] total", tous.error.message);
  if (ouverts.error)
    console.error("[fiches] joignables", ouverts.error.message);
  return { total: tous.count ?? 0, joignables: ouverts.count ?? 0 };
}

/**
 * Le fichier en CSV.
 *
 * Point-virgule et BOM : c'est ce qu'Excel en français attend, et un
 * export qui s'ouvre en une seule colonne ne sert à rien. Les champs sont
 * toujours entre guillemets — un nom contient une virgule plus souvent
 * qu'on ne croit.
 *
 * Reste le tableur qui exécute ce qui commence par « = », « + », « - » ou
 * « @ » : l'apostrophe le neutralise. Mais tous les téléphones commencent
 * par « + », et les préfixer tous rendrait la colonne illisible et
 * incopiable. On laisse donc passer ce qui n'est fait que de chiffres, de
 * signes et d'espaces — un numéro, jamais un appel de fonction.
 */
export function enCsv(fiches: Fiche[]): string {
  const NUMERIQUE = /^[+\-]?[\d\s().+-]+$/;

  const cellule = (valeur: string | number | null): string => {
    const texte = valeur === null ? "" : String(valeur);
    const risque = /^[=+\-@\t\r]/.test(texte) && !NUMERIQUE.test(texte);
    return `"${(risque ? `'${texte}` : texte).replace(/"/g, '""')}"`;
  };

  const lignes = [
    [
      "Nom",
      "E-mail",
      "Téléphone",
      "Venues",
      "Couverts",
      "Première venue",
      "Dernière venue",
      "Accepte les e-mails",
      "Consentement donné le",
      "Désinscrit le",
      "Note",
    ],
    ...fiches.map((f) => [
      f.nom,
      f.email,
      f.telephone,
      f.venues,
      f.couverts,
      f.premiere_venue,
      f.derniere_venue,
      f.consentement && !f.desabonne_le ? "oui" : "non",
      f.consentement_le?.slice(0, 10) ?? null,
      f.desabonne_le?.slice(0, 10) ?? null,
      f.note_interne,
    ]),
  ];

  return "﻿" + lignes.map((l) => l.map(cellule).join(";")).join("\r\n");
}
