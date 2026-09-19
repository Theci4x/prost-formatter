import type { SupabaseClient } from "@supabase/supabase-js";
import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Les limites des formulaires ouverts à tous.
 *
 * Une règle traverse ce fichier : en cas de doute, on laisse passer. Un
 * compteur en panne ne doit pas empêcher un vrai client de réserver son
 * dîner — le risque qu'on couvre ici est l'abus automatisé, pas le client
 * pressé, et refuser un client à tort coûte plus cher que d'en laisser
 * passer dix de trop.
 */

/**
 * Demandes de réservation par visiteur et par jour, tous établissements
 * confondus. Dix est très au-delà d'un usage réel — on réserve un dîner,
 * pas dix — et très en deçà de ce qu'il faudrait pour saturer un service.
 */
export const DEMANDES_PAR_JOUR = 10;

/**
 * Et par établissement. C'est celle qui compte : saturer un service demande
 * des dizaines de demandes sur la même salle.
 */
export const DEMANDES_PAR_RESTAURANT = 3;

/**
 * Tests de présence par visiteur et par jour. Un restaurateur en fait un,
 * éventuellement deux s'il se trompe de ville. Pas un seul : en 4G comme
 * chez beaucoup de fournisseurs, des milliers d'abonnés partagent une même
 * adresse publique — à un par adresse, le deuxième restaurateur d'une ville
 * serait refusé sans comprendre pourquoi.
 */
export const AUDITS_PAR_JOUR = 5;

/**
 * Et pour tout le monde réuni. Chaque test consomme deux appels facturés à
 * Google Places : ce plafond est la seule chose qui borne la facture le jour
 * où quelqu'un décide de s'amuser.
 */
export const AUDITS_PAR_JOUR_GLOBAL = 200;

/**
 * Demandes d'aide par visiteur et par jour. Le formulaire envoie un
 * e-mail à l'équipe : sans plafond, il devient une adresse de spam
 * ouverte. Cinq laisse la place à quelqu'un qui bloque vraiment et
 * réécrit deux fois.
 */
export const AIDES_PAR_JOUR = 5;

/**
 * L'empreinte d'un visiteur : son adresse et son navigateur, hachés avec un
 * secret. On ne veut pas d'un journal d'adresses IP en base — ce compteur
 * sert à limiter, pas à ficher.
 */
export function empreinte(
  prefixe: string,
  ip: string,
  navigateur: string,
  secret: string,
): string {
  const brut = `${ip}|${navigateur}|${secret}`;
  return `${prefixe}:${createHash("sha256").update(brut).digest("hex").slice(0, 32)}`;
}

/** L'adresse du client derrière les relais de l'hébergeur. */
export function adresseIp(entetes: Headers): string {
  const transmise = entetes.get("x-forwarded-for");
  // « client, relais1, relais2 » : la première est celle du client.
  if (transmise) return transmise.split(",")[0]!.trim();
  return entetes.get("x-real-ip")?.trim() || "inconnue";
}

/**
 * Incrémente un compteur et dit s'il dépasse. Une panne de base laisse
 * passer : voir la règle en tête de fichier.
 */
export async function consommer(
  supabase: SupabaseClient,
  cle: string,
  plafond: number,
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("limite_consommer", {
      p_cle: cle,
      p_requetes: 1,
    });
    if (error) {
      console.error("[limites] compteur indisponible", cle, error.message);
      return true;
    }
    return typeof data === "number" ? data <= plafond : true;
  } catch (erreur) {
    console.error("[limites]", erreur);
    return true;
  }
}

/**
 * Le secret qui sale les empreintes. Sans lui, l'empreinte serait le simple
 * hachage d'une adresse IP, donc retrouvable par force brute — il n'y a que
 * quatre milliards d'adresses.
 */
export function secretEmpreinte(): string {
  return (
    process.env.KLARR_SECRET_EMPREINTE ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "klarr"
  );
}

/**
 * Compare un jeton en temps constant.
 *
 * Une comparaison ordinaire s'arrête au premier caractère qui diffère : le
 * temps de réponse trahit alors le nombre de caractères justes, et un jeton
 * se devine octet par octet. L'attaque est difficile à travers un réseau,
 * mais la parade tient en trois lignes.
 */
export function jetonValide(entete: string | null, secret: string): boolean {
  const attendu = Buffer.from(`Bearer ${secret}`);
  const recu = Buffer.from(entete ?? "");
  // timingSafeEqual exige deux tampons de même longueur : une longueur
  // différente est de toute façon un jeton faux.
  if (recu.length !== attendu.length) return false;
  return timingSafeEqual(recu, attendu);
}
