import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { telephoneAEnregistrer } from "@/lib/contact/telephone";

/**
 * Le fichier client, tenu à jour au fil des réservations.
 *
 * Deux principes, et ils commandent tout ce fichier.
 *
 * **Une fiche qui ne s'écrit pas ne doit jamais faire échouer une
 * réservation.** Le client a rempli son formulaire, la table est prise :
 * lui afficher une erreur parce qu'on n'a pas su ranger son adresse
 * serait absurde. Rien d'ici ne lève, comme pour l'envoi des courriels.
 *
 * **Le consentement ne monte que sur un geste.** Réserver une table n'est
 * pas accepter une newsletter, et le RGPD ne laisse pas déduire l'un de
 * l'autre. Seule la case cochée fait passer un contact de muet à
 * joignable — et une personne désinscrite le reste, sauf à recocher
 * elle-même, ce qui est un consentement neuf et daté comme tel.
 */

export type SourceContact = "reservation" | "experience" | "import";

/** Mise en forme de l'adresse : c'est la clé de dédoublonnage. */
export function normaliserEmail(
  brut: string | null | undefined,
): string | null {
  const email = (brut ?? "").trim().toLowerCase();
  // La même expression que la contrainte de la base : ce qu'elle refuse
  // ne doit pas partir vers elle. Certaines réservations téléphoniques
  // portent « — » en guise d'adresse.
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return null;
  return email;
}

type Fiche = {
  id: string;
  consentement: boolean;
  desabonne_le: string | null;
};

/**
 * Range une personne dans le fichier de l'établissement.
 *
 * Le nom et le téléphone les plus récents l'emportent : on déménage, on
 * se marie, on change de numéro, et c'est la dernière réservation qui dit
 * vrai. Un téléphone absent, en revanche, n'efface pas celui qu'on avait.
 */
export async function enregistrerContact({
  supabase,
  restaurantId,
  nom,
  email: emailBrut,
  telephone,
  accepte,
  source,
  maintenant = new Date(),
}: {
  /** La clé de service : le formulaire public n'a aucun droit d'écriture. */
  supabase: SupabaseClient;
  restaurantId: string;
  nom: string;
  email: string | null | undefined;
  telephone?: string | null;
  /** La case du formulaire, telle qu'elle a été cochée ou non. */
  accepte: boolean;
  source: SourceContact;
  maintenant?: Date;
}): Promise<void> {
  const email = normaliserEmail(emailBrut);
  if (!email) return;

  // Normalisé ici, et pas seulement chez l'appelant : c'est la règle de
  // l'adresse au-dessus, appliquée au numéro. Une fiche client sert à
  // écrire à quelqu'un ; un numéro rangé sous trois formes selon le
  // formulaire d'origine ne sert à personne.
  const tel = telephoneAEnregistrer(telephone);
  const quand = maintenant.toISOString();

  try {
    const { data, error } = await supabase
      .from("restaurant_contacts")
      .select("id, consentement, desabonne_le")
      .eq("restaurant_id", restaurantId)
      .eq("email", email)
      .maybeSingle();

    // `?? []` avalerait l'erreur et ferait créer un doublon qui se
    // heurterait à l'index unique : on préfère s'arrêter et le dire.
    if (error) {
      console.error("[contacts] lecture", error.message);
      return;
    }

    const fiche = data as Fiche | null;

    if (!fiche) {
      const { error: erreurInsertion } = await supabase
        .from("restaurant_contacts")
        .insert({
          restaurant_id: restaurantId,
          email,
          nom: nom.trim() || null,
          telephone: tel,
          consentement: accepte,
          consentement_le: accepte ? quand : null,
          consentement_source: accepte ? source : null,
        });
      if (erreurInsertion) {
        console.error("[contacts] création", erreurInsertion.message);
      }
      return;
    }

    const patch: Record<string, unknown> = {
      nom: nom.trim() || null,
      updated_at: quand,
    };
    if (tel) patch.telephone = tel;

    // Recocher la case après s'être désinscrit est un consentement neuf :
    // le refuser condamnerait la personne à ne jamais revenir, alors
    // qu'elle vient de le demander explicitement. On le redate, et la
    // désinscription précédente s'efface avec.
    if (accepte && (!fiche.consentement || fiche.desabonne_le)) {
      patch.consentement = true;
      patch.consentement_le = quand;
      patch.consentement_source = source;
      patch.desabonne_le = null;
    }

    const { error: erreurMaj } = await supabase
      .from("restaurant_contacts")
      .update(patch)
      .eq("id", fiche.id);
    if (erreurMaj) console.error("[contacts] mise à jour", erreurMaj.message);
  } catch (cause) {
    console.error(
      "[contacts]",
      cause instanceof Error ? cause.message : String(cause),
    );
  }
}
