import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { envoyerLot, LOT_MAX, type Message } from "@/lib/courriel/envoyer";
import { resoudreSegment, type Segment } from "@/lib/campagnes/segments";
import {
  composer,
  expediteur,
  lienDesabonnementUnClic,
  type Campagne as Contenu,
} from "@/lib/campagnes/message";

/**
 * L'envoi des campagnes dues.
 *
 * Trois principes, et ils se tiennent.
 *
 * **La liste se résout maintenant, pas à la programmation.** Quelqu'un
 * qui s'est désinscrit hier ne reçoit pas la campagne écrite avant-hier.
 *
 * **Une ligne de journal par destinataire, écrite avant l'envoi.** C'est
 * elle qui empêche le double envoi : l'index unique de la base refuse la
 * seconde, même si la tâche repart deux fois. Un client qui reçoit deux
 * fois le même message se désinscrit, et il a raison.
 *
 * **On s'arrête avant le plafond plutôt que de se faire couper.** Vercel
 * accorde une minute ; une campagne trop grosse reste « en cours » et
 * reprend au passage suivant, exactement là où elle s'était arrêtée,
 * puisque le journal dit qui a déjà reçu.
 */

export type Bilan = {
  campagnes: number;
  envoyes: number;
  echoues: number;
  /** Vrai si le temps a manqué : des campagnes restent en cours. */
  interrompu: boolean;
};

type Ligne = {
  id: string;
  restaurant_id: string;
  objet: string;
  texte: string;
  bouton_libelle: string | null;
  bouton_url: string | null;
  segment: Segment;
};

type Maison = {
  nom: string;
  adresse: string | null;
  slug_reservation: string | null;
  email_contact: string | null;
};

/**
 * Le temps qu'on s'autorise par défaut, quand la tâche n'a que ça à
 * faire. Quinze secondes de marge sous la minute de Vercel : un lot en
 * vol ne doit pas être tranché au milieu, sans quoi on ne saurait pas
 * s'il est parti.
 *
 * L'appelant le réduit quand il partage son passage avec autre chose —
 * c'est le cas aujourd'hui, les comptes Vercel Hobby ne tolérant que deux
 * tâches planifiées.
 */
export const BUDGET_MS = 45_000;

/** L'espacement entre deux lots : le fournisseur limite à deux appels par seconde. */
const PAUSE_MS = 600;

const dodo = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function envoyerLesCampagnes({
  supabase,
  maintenant = new Date(),
  budgetMs = BUDGET_MS,
}: {
  /** La clé de service : la tâche n'agit au nom de personne. */
  supabase: SupabaseClient;
  maintenant?: Date;
  budgetMs?: number;
}): Promise<Bilan> {
  const fin = Date.now() + budgetMs;
  const bilan: Bilan = {
    campagnes: 0,
    envoyes: 0,
    echoues: 0,
    interrompu: false,
  };

  const jour = maintenant.toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("restaurant_campagnes")
    .select(
      "id, restaurant_id, objet, texte, bouton_libelle, bouton_url, segment",
    )
    .in("statut", ["programmee", "en_cours"])
    .lte("envoyer_le", jour)
    // Les plus anciennes d'abord : une campagne en retard passe avant
    // celle du jour, sans quoi elle ne partirait jamais.
    .order("envoyer_le", { ascending: true });

  if (error) {
    console.error("[campagnes] lecture des dues", error.message);
    return bilan;
  }

  for (const brut of (data ?? []) as Ligne[]) {
    if (Date.now() > fin) {
      bilan.interrompu = true;
      break;
    }
    const resultat = await envoyerUne({
      supabase,
      campagne: brut,
      maintenant,
      fin,
    });
    bilan.campagnes += 1;
    bilan.envoyes += resultat.envoyes;
    bilan.echoues += resultat.echoues;
    if (resultat.interrompu) {
      bilan.interrompu = true;
      break;
    }
  }

  return bilan;
}

async function envoyerUne({
  supabase,
  campagne,
  maintenant,
  fin,
}: {
  supabase: SupabaseClient;
  campagne: Ligne;
  maintenant: Date;
  fin: number;
}): Promise<{ envoyes: number; echoues: number; interrompu: boolean }> {
  const compte = { envoyes: 0, echoues: 0, interrompu: false };

  const { data: maisonData, error: erreurMaison } = await supabase
    .from("restaurants")
    .select("nom, adresse, slug_reservation, email_contact")
    .eq("id", campagne.restaurant_id)
    .maybeSingle();

  const maison = maisonData as Maison | null;
  if (erreurMaison || !maison) {
    await echouer(supabase, campagne.id, "Établissement introuvable.");
    return compte;
  }

  let de: string;
  try {
    de = expediteur({ nom: maison.nom, slug: maison.slug_reservation });
  } catch (cause) {
    // Le domaine d'envoi n'est pas configuré. On ne marque pas la
    // campagne en échec : elle partira le jour où il le sera, et la
    // reprogrammer à la main serait absurde.
    console.error(
      "[campagnes]",
      cause instanceof Error ? cause.message : cause,
    );
    return compte;
  }

  await supabase
    .from("restaurant_campagnes")
    .update({
      statut: "en_cours",
      envoi_commence_le: maintenant.toISOString(),
      updated_at: maintenant.toISOString(),
    })
    .eq("id", campagne.id);

  // La liste, maintenant. Puis les jetons, que la vue ne porte pas
  // volontairement — elle sert aussi l'écran, et un lien de
  // désinscription n'a rien à y faire.
  let destinataires;
  try {
    destinataires = await resoudreSegment({
      supabase,
      restaurantId: campagne.restaurant_id,
      segment: campagne.segment,
      maintenant,
    });
  } catch (cause) {
    await echouer(
      supabase,
      campagne.id,
      cause instanceof Error ? cause.message : String(cause),
    );
    return compte;
  }

  if (destinataires.length > 0) {
    // `upsert` avec `ignoreDuplicates` : une reprise réécrit les mêmes
    // lignes sans les dupliquer ni écraser ce qui est déjà parti.
    const { error: erreurJournal } = await supabase
      .from("restaurant_campagne_envois")
      .upsert(
        destinataires.map((d) => ({
          campagne_id: campagne.id,
          contact_id: d.id,
          email: d.email,
        })),
        { onConflict: "campagne_id,contact_id", ignoreDuplicates: true },
      );
    if (erreurJournal) {
      await echouer(
        supabase,
        campagne.id,
        `Journal : ${erreurJournal.message}`,
      );
      return compte;
    }
  }

  const contenu: Contenu = {
    objet: campagne.objet,
    texte: campagne.texte,
    bouton_libelle: campagne.bouton_libelle,
    bouton_url: campagne.bouton_url,
  };

  // On boucle tant qu'il reste des lignes à envoyer : une campagne de
  // mille personnes fait dix tours.
  for (;;) {
    if (Date.now() > fin) {
      compte.interrompu = true;
      return compte;
    }

    const { data: restants, error: erreurRestants } = await supabase
      .from("restaurant_campagne_envois")
      .select("id, contact_id, email")
      .eq("campagne_id", campagne.id)
      .eq("statut", "a_envoyer")
      .limit(LOT_MAX);

    if (erreurRestants) {
      await echouer(supabase, campagne.id, `Reste : ${erreurRestants.message}`);
      return compte;
    }

    const lot = (restants ?? []) as {
      id: string;
      contact_id: string;
      email: string;
    }[];
    if (lot.length === 0) break;

    const { data: jetonsData } = await supabase
      .from("restaurant_contacts")
      .select("id, jeton")
      .in(
        "id",
        lot.map((l) => l.contact_id),
      );
    const jetons = new Map(
      ((jetonsData ?? []) as { id: string; jeton: string }[]).map((c) => [
        c.id,
        c.jeton,
      ]),
    );

    const messages: Message[] = [];
    const envoyesIds: string[] = [];
    const sansJeton: string[] = [];
    for (const ligne of lot) {
      const jeton = jetons.get(ligne.contact_id);
      if (!jeton) {
        // Sans jeton, pas de lien de désinscription — donc pas d'envoi.
        // Un message commercial sans porte de sortie est celui qu'on n'a
        // pas le droit d'envoyer.
        sansJeton.push(ligne.id);
        continue;
      }
      const pret = composer({ campagne: contenu, maison, jeton });
      messages.push({
        expediteur: de,
        destinataire: ligne.email,
        sujet: pret.sujet,
        texte: pret.texte,
        html: pret.html,
        repondreA: maison.email_contact ?? undefined,
        entetes: {
          "List-Unsubscribe": `<${lienDesabonnementUnClic(jeton)}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });
      envoyesIds.push(ligne.id);
    }

    if (sansJeton.length > 0) {
      await marquer(supabase, sansJeton, {
        statut: "echec",
        erreur: "Jeton de désinscription introuvable.",
      });
      compte.echoues += sansJeton.length;
    }

    if (messages.length === 0) continue;

    const resultat = await envoyerLot(messages);
    if (!resultat.ok) {
      // Tout le lot est en échec, et la campagne s'arrête là : si le
      // fournisseur refuse, insister sur les neuf lots suivants ne fera
      // qu'abîmer la réputation du domaine.
      await marquer(supabase, envoyesIds, {
        statut: "echec",
        erreur: resultat.erreur.slice(0, 300),
      });
      compte.echoues += envoyesIds.length;
      await echouer(supabase, campagne.id, resultat.erreur);
      return compte;
    }

    // Les identifiants arrivent dans l'ordre du lot ; on les repose un
    // par un plutôt qu'en une mise à jour groupée, faute de quoi ils se
    // mélangeraient.
    await Promise.all(
      envoyesIds.map((id, rang) =>
        marquer(supabase, [id], {
          statut: "envoye",
          fournisseur_id: resultat.identifiants[rang],
          envoye_le: new Date().toISOString(),
        }),
      ),
    );
    compte.envoyes += envoyesIds.length;

    await dodo(PAUSE_MS);
  }

  const { count } = await supabase
    .from("restaurant_campagne_envois")
    .select("id", { count: "exact", head: true })
    .eq("campagne_id", campagne.id)
    .eq("statut", "envoye");

  await supabase
    .from("restaurant_campagnes")
    .update({
      statut: "envoyee",
      envoyee_le: new Date().toISOString(),
      destinataires: count ?? compte.envoyes,
      derniere_erreur: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", campagne.id);

  return compte;
}

async function marquer(
  supabase: SupabaseClient,
  ids: string[],
  patch: Record<string, unknown>,
): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase
    .from("restaurant_campagne_envois")
    .update(patch)
    .in("id", ids);
  if (error) console.error("[campagnes] journal", error.message);
}

/**
 * Une campagne en échec reste en échec, et le dit.
 *
 * Elle n'est pas reprogrammée d'elle-même : ce qui a raté a une cause —
 * un domaine pas vérifié, un quota dépassé —, et réessayer chaque nuit
 * sans rien changer ne ferait qu'empiler les tentatives. Le restaurateur
 * voit l'erreur et relance quand elle est réglée.
 */
async function echouer(
  supabase: SupabaseClient,
  campagneId: string,
  erreur: string,
): Promise<void> {
  console.error("[campagnes]", campagneId, erreur);
  await supabase
    .from("restaurant_campagnes")
    .update({
      statut: "echec",
      derniere_erreur: erreur.slice(0, 500),
      updated_at: new Date().toISOString(),
    })
    .eq("id", campagneId);
}
