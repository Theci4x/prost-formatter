import {
  isAuthRetryableFetchError,
  type AuthError,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";

/**
 * Ne pas confondre « déconnecté » et « injoignable ».
 *
 * `getUser()` interroge le réseau à chaque appel : il demande à Supabase
 * si le jeton est toujours bon. Quand la réponse n'arrive pas — 4G qui
 * vacille, cave d'un restaurant, Supabase qui tousse —, il renvoie un
 * utilisateur nul, exactement comme si personne n'était connecté.
 *
 * Traiter les deux pareil, c'est renvoyer un restaurateur à l'écran de
 * connexion parce qu'un paquet s'est perdu. Il a un service à faire, il
 * ne comprend pas, et il finit par ne plus ouvrir l'application. C'est
 * ce qui se passait.
 *
 * Supabase sépare pourtant les deux cas : une panne de transport est une
 * `AuthRetryableFetchError` — le nom le dit —, tandis qu'une session
 * absente ou un jeton refusé sont des erreurs d'authentification
 * ordinaires. On s'en sert.
 */

export type Verdict =
  | { etat: "connecte"; user: User }
  | {
      etat: "deconnecte";
      /**
       * Ce que Supabase a répondu, quand il a répondu quelque chose. C'est
       * ce qui distingue une session jamais ouverte (« Auth session
       * missing ») d'un jeton déjà consommé (« Already Used ») — deux
       * causes qui ne se corrigent pas du tout au même endroit.
       */
      motif?: string;
    }
  /** On n'a pas pu savoir. Surtout ne rien casser sur cette base. */
  | { etat: "indecidable"; motif: string };

export function verdictDe(
  user: User | null,
  erreur: AuthError | null,
): Verdict {
  if (user) return { etat: "connecte", user };
  if (!erreur) return { etat: "deconnecte" };

  // Panne de transport, ou serveur qui rend un 5xx : on ne sait pas.
  if (isAuthRetryableFetchError(erreur)) {
    return { etat: "indecidable", motif: erreur.message };
  }
  if (typeof erreur.status === "number" && erreur.status >= 500) {
    return { etat: "indecidable", motif: erreur.message };
  }

  // Tout le reste — session absente, jeton expiré, jeton refusé — est une
  // vraie déconnexion.
  return {
    etat: "deconnecte",
    motif: [erreur.code, erreur.message].filter(Boolean).join(" — "),
  };
}

/**
 * Demande qui est connecté, avec une seconde chance.
 *
 * La plupart des coupures durent moins qu'un battement de cils. Un seul
 * nouvel essai les absorbe sans que personne ne s'en aperçoive, et c'est
 * toute la différence entre « je n'ai rien vu » et « un écran de plus à
 * chasser en plein coup de feu ». Au-delà, on arrête : la requête d'un
 * restaurateur pressé ne doit pas attendre trois allers-retours.
 */
export async function lireSession(
  supabase: SupabaseClient,
  attendre: (ms: number) => Promise<void> = (ms) =>
    new Promise((r) => setTimeout(r, ms)),
): Promise<Verdict> {
  const premier = await demander(supabase);
  if (premier.etat !== "indecidable") return premier;

  await attendre(200);
  return demander(supabase);
}

async function demander(supabase: SupabaseClient): Promise<Verdict> {
  try {
    const { data, error } = await supabase.auth.getUser();
    return verdictDe(data.user, error);
  } catch (cause) {
    // `getUser()` ne lève pas, en principe. En principe — et le jour où
    // il le fait, ce n'est sûrement pas parce que le restaurateur s'est
    // déconnecté.
    return {
      etat: "indecidable",
      motif: cause instanceof Error ? cause.message : String(cause),
    };
  }
}
