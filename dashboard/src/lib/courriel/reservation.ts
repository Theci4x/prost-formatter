import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { envoyerCourriel } from "@/lib/courriel/envoyer";
import {
  alerteAnnulationClient,
  alerteRestaurateur,
  lienDePaiement,
  demandeRecue,
  reservationConfirmee,
  reservationRefusee,
  type Contexte,
} from "@/lib/courriel/messages";

/**
 * Les envois liés à une réservation, et leur trace.
 *
 * Un genre ne part qu'une fois par réservation : la contrainte d'unicité
 * en base est la vraie garde-fou, pas un test en JavaScript. Un double
 * clic, un renvoi de page ou deux requêtes simultanées se heurtent à elle,
 * et le second envoi n'a pas lieu.
 *
 * Rien ici ne lève : un e-mail qui échoue ne doit pas défaire une
 * réservation qui, elle, est bien enregistrée.
 */

export type Genre =
  | "recue"
  | "confirmee"
  | "alerte_restaurateur"
  | "refusee"
  | "annulee"
  /** Le client a rendu sa table : on prévient la maison. */
  | "alerte_annulation"
  /** Le rappel de la veille, envoyé au client. */
  | "rappel"
  /** Le lien qui confirmera la réservation : acompte ou empreinte. */
  | "paiement"
  /** La relance automatique, avant que l'option n'expire. */
  | "relance_paiement";

/**
 * Pose la trace AVANT d'envoyer. Dans l'autre sens, deux requêtes
 * simultanées enverraient toutes les deux avant que l'une n'écrive.
 * Si l'insertion échoue pour cause de doublon, c'est que quelqu'un d'autre
 * s'en charge : on s'arrête là.
 */
async function reserverLEnvoi(
  supabase: SupabaseClient,
  reservationId: string,
  genre: Genre,
  destinataire: string,
): Promise<boolean> {
  const { error } = await supabase.from("reservation_courriels").insert({
    reservation_id: reservationId,
    genre,
    destinataire,
  });
  if (error) {
    // 23505 : doublon. Ce n'est pas une panne, c'est la garde qui joue.
    if (error.code !== "23505") {
      console.error("[courriel/trace]", genre, error.message);
    }
    return false;
  }
  return true;
}

async function noterLEchec(
  supabase: SupabaseClient,
  reservationId: string,
  genre: Genre,
  erreur: string,
): Promise<void> {
  const { error } = await supabase
    .from("reservation_courriels")
    .update({ erreur })
    .eq("reservation_id", reservationId)
    .eq("genre", genre);
  if (error) console.error("[courriel/echec]", genre, error.message);
}

/** Prévient le client. `confirmee` décide duquel des deux messages part. */
export async function prevenirClient({
  supabase,
  reservationId,
  contexte,
  destinataire,
  repondreA,
  confirmee,
}: {
  supabase: SupabaseClient;
  reservationId: string;
  contexte: Contexte;
  destinataire: string;
  repondreA?: string;
  confirmee: boolean;
}): Promise<void> {
  const genre: Genre = confirmee ? "confirmee" : "recue";
  if (!(await reserverLEnvoi(supabase, reservationId, genre, destinataire))) {
    return;
  }

  const message = confirmee
    ? reservationConfirmee(contexte)
    : demandeRecue(contexte);
  const resultat = await envoyerCourriel({
    destinataire,
    repondreA,
    ...message,
  });
  if (!resultat.envoye) {
    await noterLEchec(
      supabase,
      reservationId,
      genre,
      resultat.erreur ?? "inconnue",
    );
  }
}

/** Prévient le restaurateur qu'une réservation est entrée. */
export async function prevenirRestaurateur({
  supabase,
  reservationId,
  contexte,
  destinataire,
  lien,
  confirmee,
}: {
  supabase: SupabaseClient;
  reservationId: string;
  contexte: Contexte;
  destinataire: string | null;
  lien: string;
  confirmee: boolean;
}): Promise<void> {
  if (!destinataire) return;
  const genre: Genre = "alerte_restaurateur";
  if (!(await reserverLEnvoi(supabase, reservationId, genre, destinataire))) {
    return;
  }

  const resultat = await envoyerCourriel({
    destinataire,
    ...alerteRestaurateur(contexte, confirmee, lien),
  });
  if (!resultat.envoye) {
    await noterLEchec(
      supabase,
      reservationId,
      genre,
      resultat.erreur ?? "inconnue",
    );
  }
}

/**
 * Prévient le client d'un refus ou d'une annulation décidés au tableau de
 * bord. Sans ce message, le client d'une demande en attente n'apprend
 * jamais qu'elle n'a pas été retenue — il se présente.
 */
export async function prevenirRefus({
  supabase,
  reservationId,
  contexte,
  destinataire,
  repondreA,
  motif,
}: {
  supabase: SupabaseClient;
  reservationId: string;
  contexte: Contexte;
  destinataire: string;
  repondreA?: string;
  motif: "refusee" | "annulee";
}): Promise<void> {
  if (!(await reserverLEnvoi(supabase, reservationId, motif, destinataire))) {
    return;
  }

  const resultat = await envoyerCourriel({
    destinataire,
    repondreA,
    ...reservationRefusee(contexte, motif),
  });
  if (!resultat.envoye) {
    await noterLEchec(
      supabase,
      reservationId,
      motif,
      resultat.erreur ?? "inconnue",
    );
  }
}

/**
 * Prévient le restaurateur qu'un client a rendu sa table. Sans ce
 * message, une table libérée le reste sur l'écran mais pas dans la tête
 * du chef de rang, qui continue de la tenir.
 */
export async function prevenirAnnulationClient({
  supabase,
  reservationId,
  contexte,
  destinataire,
  lien,
}: {
  supabase: SupabaseClient;
  reservationId: string;
  contexte: Contexte;
  destinataire: string | null;
  lien: string;
}): Promise<void> {
  if (!destinataire) return;
  const genre: Genre = "alerte_annulation";
  if (!(await reserverLEnvoi(supabase, reservationId, genre, destinataire))) {
    return;
  }

  const resultat = await envoyerCourriel({
    destinataire,
    ...alerteAnnulationClient(contexte, lien),
  });
  if (!resultat.envoye) {
    await noterLEchec(
      supabase,
      reservationId,
      genre,
      resultat.erreur ?? "inconnue",
    );
  }
}

/**
 * Envoie au client le lien qui confirmera sa réservation.
 *
 * Deux usages, et le second explique le paramètre `unique`.
 *
 * À l'acceptation, le message part une fois : la trace et sa contrainte
 * d'unicité s'en portent garantes. Mais le restaurateur doit aussi
 * pouvoir relancer depuis son carnet — un client qui n'a pas payé au bout
 * de deux jours n'a souvent rien vu passer. Une relance est un geste
 * délibéré : elle ne se heurte pas au garde-fou du premier envoi.
 */
export async function envoyerLienDePaiement({
  supabase,
  reservationId,
  contexte,
  destinataire,
  repondreA,
  lien,
  garantie,
  unique,
}: {
  supabase: SupabaseClient;
  reservationId: string;
  contexte: Contexte;
  destinataire: string;
  repondreA?: string;
  lien: string;
  garantie: { montant: string; caution: boolean; echeance: string | null };
  /** Vrai au premier envoi, faux pour une relance demandée à la main. */
  unique: boolean;
}): Promise<{ envoye: boolean; erreur: string | null }> {
  const genre: Genre = "paiement";

  if (unique) {
    if (!(await reserverLEnvoi(supabase, reservationId, genre, destinataire))) {
      return { envoye: false, erreur: null };
    }
  }

  const resultat = await envoyerCourriel({
    destinataire,
    repondreA,
    ...lienDePaiement(contexte, lien, garantie),
  });

  if (!resultat.envoye && unique) {
    await noterLEchec(
      supabase,
      reservationId,
      genre,
      resultat.erreur ?? "inconnue",
    );
  }
  return resultat;
}
