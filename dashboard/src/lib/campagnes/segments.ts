import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { pivot, VENUES_FIDELE, type Segment } from "@/lib/campagnes/cibles";

/**
 * À qui part une campagne.
 *
 * Quatre segments, pas douze. Un restaurateur qui doit composer sa cible
 * avec des filtres ne l'écrit jamais : il veut « tout le monde », « ceux
 * qu'on n'a pas revus » ou « les habitués », et ces trois-là couvrent ce
 * qu'on fait réellement d'un fichier de restaurant.
 *
 * Tous passent par le même tamis, qui n'est pas négociable : le
 * consentement donné et pas repris. Il n'est pas appliqué par le segment
 * mais par la fonction commune — un segment ajouté un jour de fatigue ne
 * doit pas pouvoir l'oublier.
 */

export {
  SEGMENTS,
  estSegment,
  MOIS_DE_FRAICHEUR,
  VENUES_FIDELE,
  LIBELLE_SEGMENT,
  EXPLICATION_SEGMENT,
  pivot,
  type Segment,
} from "@/lib/campagnes/cibles";

export type Destinataire = {
  id: string;
  email: string;
  nom: string | null;
};

/**
 * Le `select` doit précéder les filtres chez PostgREST : la sélection est
 * donc passée en argument plutôt que chaînée après coup, sinon compter et
 * lister demanderaient deux fois les mêmes conditions — et c'est
 * exactement ainsi qu'un tamis finit par diverger de l'autre.
 */
function requete(
  supabase: SupabaseClient,
  restaurantId: string,
  segment: Segment,
  maintenant: Date,
  selection: { colonnes: string; compter?: boolean },
) {
  // Le tamis commun. Il passe avant le segment, et aucun appelant ne peut
  // l'écarter : c'est la seule porte vers cette vue.
  let q = supabase
    .from("restaurant_contacts_fiches")
    .select(
      selection.colonnes,
      selection.compter ? { count: "exact", head: true } : undefined,
    )
    .eq("restaurant_id", restaurantId)
    .eq("consentement", true)
    .is("desabonne_le", null);

  const seuil = pivot(maintenant);
  if (segment === "recents") q = q.gte("derniere_venue", seuil);
  // Quelqu'un qui n'est jamais venu n'est pas perdu : il n'a jamais été
  // là. Le `not.is null` l'écarte, sans quoi « pas revus depuis six
  // mois » désignerait aussi des gens qui n'ont rien à se rappeler.
  if (segment === "perdus")
    q = q.lt("derniere_venue", seuil).not("derniere_venue", "is", null);
  if (segment === "fideles") q = q.gte("venues", VENUES_FIDELE);

  return q;
}

/**
 * Combien de personnes recevraient, si on envoyait maintenant.
 *
 * Sert à l'écran de rédaction, jamais à l'envoi : entre le moment où on
 * écrit et celui où le message part, des gens se désinscrivent, et
 * d'autres cochent la case. C'est l'envoi qui fait foi.
 */
export async function compterSegment({
  supabase,
  restaurantId,
  segment,
  maintenant = new Date(),
}: {
  supabase: SupabaseClient;
  restaurantId: string;
  segment: Segment;
  maintenant?: Date;
}): Promise<number> {
  const { count, error } = await requete(
    supabase,
    restaurantId,
    segment,
    maintenant,
    { colonnes: "id", compter: true },
  );
  if (error) {
    console.error("[segments] comptage", error.message);
    return 0;
  }
  return count ?? 0;
}

/**
 * La liste, résolue au moment de l'envoi et pas avant.
 *
 * C'est la règle qui compte ici. Une personne qui se désinscrit le mardi
 * ne doit pas recevoir la campagne programmée le lundi pour le mercredi.
 * Figer la liste à la programmation serait plus simple, et enverrait des
 * messages à des gens qui ont dit non entre-temps.
 */
export async function resoudreSegment({
  supabase,
  restaurantId,
  segment,
  maintenant = new Date(),
}: {
  supabase: SupabaseClient;
  restaurantId: string;
  segment: Segment;
  maintenant?: Date;
}): Promise<Destinataire[]> {
  const { data, error } = await requete(
    supabase,
    restaurantId,
    segment,
    maintenant,
    { colonnes: "id, email, nom" },
  ).order("email", { ascending: true });

  if (error) {
    // Jamais `?? []` : une campagne qui part à zéro personne parce qu'une
    // requête a échoué se marquerait « envoyée » sans que rien ne parte.
    throw new Error(`Segment illisible : ${error.message}`);
  }
  // La colonne passée en argument, PostgREST ne sait plus la typer : il
  // rend son type « chaîne inconnue ». Le contrat est tenu juste au-dessus.
  return (data ?? []) as unknown as Destinataire[];
}
