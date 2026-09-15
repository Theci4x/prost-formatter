import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { envoyerCourriel } from "@/lib/courriel/envoyer";
import {
  alerteRestaurateur,
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
  | "annulee";

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
