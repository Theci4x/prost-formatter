import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Les garde-fous du Commis.
 *
 * Un assistant ouvert au public est un robinet ouvert sur le compte qui le
 * paie. Deux limites : ce qu'un visiteur peut demander dans la journée, et
 * ce que l'ensemble des visiteurs peut coûter dans la journée. La seconde
 * est celle qui compte vraiment — la première ne fait que ralentir
 * quelqu'un qui aurait mille adresses.
 */

/** Un visiteur anonyme : dix questions suffisent pour comprendre l'offre. */
export const QUESTIONS_VISITEUR = 10;

/** Plafond quotidien, tous demandeurs confondus, en centimes d'euro. */
export const PLAFOND_JOUR_CENTIMES = 2000;

export type Verdict =
  | { autorise: true }
  | { autorise: false; motif: "visiteur" | "plafond" };

export const MESSAGES: Record<"visiteur" | "plafond", string> = {
  visiteur:
    "Tu as atteint le nombre de questions pour aujourd'hui. Reviens demain, ou écris-nous : on répond toujours.",
  plafond:
    "Le Commis fait une pause pour aujourd'hui. Écris-nous en attendant, on répond toujours.",
};

/**
 * L'empreinte d'un visiteur : l'adresse IP et le navigateur, hachés avec un
 * secret. On ne conserve donc jamais l'adresse elle-même — le compteur sert
 * à limiter les abus, pas à savoir qui visite.
 */
export function empreinteVisiteur(
  ip: string,
  navigateur: string,
  secret: string,
): string {
  const brut = `${ip}|${navigateur}|${secret}`;
  return `v:${createHash("sha256").update(brut).digest("hex").slice(0, 32)}`;
}

/** L'adresse du demandeur derrière le proxy de l'hébergeur. */
export function adresseIp(entetes: Headers): string {
  const transmise = entetes.get("x-forwarded-for");
  // « client, proxy1, proxy2 » : la première est celle du client.
  if (transmise) return transmise.split(",")[0]!.trim();
  return entetes.get("x-real-ip")?.trim() || "inconnue";
}

/** Une relecture depuis le cache coûte un dixième du tarif d'entrée. */
const LECTURE_CACHE = 0.1;

/**
 * Le surcoût d'une écriture en cache, selon la durée demandée.
 *
 * Les deux durées ne coûtent pas la même chose, et l'écart n'est pas
 * anecdotique : garder une heure coûte le double du tarif d'entrée, contre
 * une fois et quart pour cinq minutes. Compter une écriture d'une heure au
 * prix de cinq minutes sous-estime l'échange de près de quarante pour
 * cent — et c'est ce compteur qui décide quand le Commis s'arrête.
 */
export const ECRITURE_CACHE = { "5m": 1.25, "1h": 2 } as const;

export type DureeCache = keyof typeof ECRITURE_CACHE;

/**
 * Ce que coûte un échange, en centimes, d'après les jetons consommés.
 *
 * Les jetons relus depuis le cache coûtent un dixième du plein tarif : sans
 * les distinguer, on surestimerait d'un facteur dix sur un assistant dont
 * la consigne — le mode d'emploi entier — est justement mise en cache.
 *
 * `dureeCache` doit être celle réellement demandée à l'API. L'appelant
 * n'a pas à s'en souvenir deux fois : il tient la durée dans une seule
 * constante et la passe ici comme il la passe à `cache_control`.
 */
export function coutCentimes({
  entree,
  sortie,
  cacheEcriture = 0,
  cacheLecture = 0,
  dureeCache,
  dollarsEntreeParMillion,
  dollarsSortieParMillion,
  eurosParDollar = 0.92,
}: {
  entree: number;
  sortie: number;
  cacheEcriture?: number;
  cacheLecture?: number;
  /** La durée passée à `cache_control`, qui fixe le prix de l'écriture. */
  dureeCache: DureeCache;
  dollarsEntreeParMillion: number;
  dollarsSortieParMillion: number;
  eurosParDollar?: number;
}): number {
  const dollars =
    (entree * dollarsEntreeParMillion +
      cacheEcriture * dollarsEntreeParMillion * ECRITURE_CACHE[dureeCache] +
      cacheLecture * dollarsEntreeParMillion * LECTURE_CACHE +
      sortie * dollarsSortieParMillion) /
    1_000_000;
  return Math.round(dollars * eurosParDollar * 100);
}

type Compteurs = { requetes: number; centimes: number };

async function consommer(
  supabase: SupabaseClient,
  cle: string,
  requetes: number,
  centimes: number,
): Promise<Compteurs | null> {
  const { data, error } = await supabase.rpc("commis_consommer", {
    p_cle: cle,
    p_requetes: requetes,
    p_centimes: centimes,
  });
  if (error) {
    console.error("[commis/quota]", error);
    return null;
  }
  const ligne = (data as Compteurs[] | null)?.[0];
  return ligne ?? null;
}

/**
 * Réserve une question. Incrémente d'abord, vérifie ensuite : l'inverse
 * laisserait passer deux questions simultanées au-dessus de la limite.
 *
 * Une panne de la base autorise la question plutôt que de la refuser. Un
 * compteur cassé ne doit pas éteindre l'assistant ; le plafond de dépense
 * réel reste celui du compte Anthropic.
 */
export async function reserver(
  supabase: SupabaseClient,
  cle: string,
  { illimite = false }: { illimite?: boolean } = {},
): Promise<Verdict> {
  const global = await consommer(supabase, "global", illimite ? 0 : 0, 0);
  if (global && global.centimes >= PLAFOND_JOUR_CENTIMES) {
    return { autorise: false, motif: "plafond" };
  }

  const demandeur = await consommer(supabase, cle, 1, 0);
  if (!illimite && demandeur && demandeur.requetes > QUESTIONS_VISITEUR) {
    return { autorise: false, motif: "visiteur" };
  }

  return { autorise: true };
}

/** Enregistre ce que l'échange a réellement coûté, une fois la réponse finie. */
export async function facturer(
  supabase: SupabaseClient,
  cle: string,
  centimes: number,
): Promise<void> {
  if (centimes <= 0) return;
  await Promise.all([
    consommer(supabase, cle, 0, centimes),
    consommer(supabase, "global", 0, centimes),
  ]);
}
