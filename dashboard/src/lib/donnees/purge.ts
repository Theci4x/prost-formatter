import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * L'effacement des données arrivées au bout de leur durée.
 *
 * La politique de confidentialité annonce des durées. Tant que rien ne
 * les applique, ce ne sont pas des durées mais des intentions — et une
 * politique qui promet un effacement qui n'a pas lieu vaut moins qu'une
 * politique qui n'aurait rien promis. Ce fichier est ce qui la rend
 * vraie.
 *
 * **Les durées vivent ici, et nulle part ailleurs.** Le jour où l'une
 * change, elle change à un seul endroit, et le document se relit à côté.
 *
 * Rien ici ne lève. La purge voyage avec la tâche quotidienne, derrière
 * des rappels de réservation et des relances de paiement : une table
 * verrouillée ne doit pas faire échouer ce qui la précède, et ce qui n'a
 * pas été effacé ce soir le sera demain.
 */

/** Les coordonnées laissées sur le test de présence, et ce qui en dérive. */
const PROSPECTS_JOURS = 3 * 365;

/**
 * Les compteurs de plafond, seule trace technique qui nous appartienne.
 * Ils portent une empreinte dérivée d'une adresse IP : ce sont eux que la
 * politique désigne par « journaux techniques », et douze mois est la
 * durée qu'elle annonce.
 */
const COMPTEURS_JOURS = 365;

export type BilanPurge = {
  prospects: number;
  audits: number;
  suivis: number;
  compteurs: number;
};

type Reponse = { data: unknown[] | null; error: { message: string } | null };

/** La date au-delà de laquelle une ligne a fait son temps. */
function limite(maintenant: Date, jours: number): Date {
  return new Date(maintenant.getTime() - jours * 24 * 3600 * 1000);
}

/** « 2023-09-20 », pour les colonnes qui portent un jour et non un instant. */
function jour(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Exécute une suppression et compte ce qu'elle a emporté, sans jamais
 * lever. Le `select()` final n'est pas décoratif : sans lui, PostgREST ne
 * rend aucune ligne et on ne saurait pas ce qui a été effacé.
 */
async function effacer(
  table: string,
  executer: () => PromiseLike<Reponse>,
): Promise<number> {
  try {
    const { data, error } = await executer();
    if (error) {
      console.error(`[purge] ${table}`, error.message);
      return 0;
    }
    return data?.length ?? 0;
  } catch (cause) {
    console.error(
      `[purge] ${table}`,
      cause instanceof Error ? cause.message : String(cause),
    );
    return 0;
  }
}

export async function purgerLesDonneesExpirees({
  supabase,
  maintenant = new Date(),
}: {
  /** La clé de service : ces tables n'ont aucune politique d'écriture. */
  supabase: SupabaseClient;
  maintenant?: Date;
}): Promise<BilanPurge> {
  const seuil = limite(maintenant, PROSPECTS_JOURS).toISOString();

  // Trois tables, trois suppressions explicites — parce qu'aucune ne suit
  // le prospect toute seule.
  //
  // `visibility_audits.prospect_id` est déclaré « on delete set null » :
  // supprimer le prospect détache son audit au lieu de l'emporter. Et les
  // notes de suivi désignent leur cible par un simple identifiant, sans
  // clé étrangère du tout — « rappelé, pas intéressé » survivrait à la
  // personne qu'il décrit.
  //
  // Chacune est donc effacée sur sa propre date, ce qui rend l'ordre
  // indifférent : c'est l'oubli d'une table qui coûterait cher, pas
  // l'ordre dans lequel on les traite.
  //
  // Les notes portant sur un restaurant ne bougent pas : elles racontent
  // une relation commerciale en cours, pas un prospect qui n'a rien donné.
  const audits = await effacer("visibility_audits", () =>
    supabase
      .from("visibility_audits")
      .delete()
      .lt("created_at", seuil)
      .select(),
  );

  const suivis = await effacer("suivis", () =>
    supabase
      .from("suivis")
      .delete()
      .eq("cible_type", "prospect")
      .lt("created_at", seuil)
      .select(),
  );

  const prospects = await effacer("prospects", () =>
    supabase.from("prospects").delete().lt("created_at", seuil).select(),
  );

  // Les compteurs de plafond, dont la clé primaire porte le jour.
  const seuilCompteurs = jour(limite(maintenant, COMPTEURS_JOURS));
  const limites = await effacer("limites_usage", () =>
    supabase.from("limites_usage").delete().lt("jour", seuilCompteurs).select(),
  );
  const commis = await effacer("commis_usage", () =>
    supabase.from("commis_usage").delete().lt("jour", seuilCompteurs).select(),
  );

  return { prospects, audits, suivis, compteurs: limites + commis };
}
