"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exiger } from "@/lib/equipe/roles";
import { envoyerCourriel } from "@/lib/courriel/envoyer";
import { OCTETS_JETON } from "@/lib/reservations/acompte";
import {
  VALIDITES,
  echeance,
  genererCode,
  lireMontantLibre,
  lireMontants,
} from "@/lib/bons/regles";
import { messagesDuBon, type Bon } from "@/lib/bons/serveur";
import { langueUtilisateur } from "@/lib/i18n/langue";
import { BONS_CAISSE } from "@/lib/i18n/bonsCaisse";

/** Les messages dans la langue de l'écran. */
async function textes() {
  return BONS_CAISSE[await langueUtilisateur()];
}

const chemin = (id: string) => `/dashboard/${id}/bons-cadeaux`;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type BonState = { erreur: string | null; succes: string | null };

/** Ouvrir la vente, choisir les montants, la durée, le mot d'accueil. */
export async function enregistrerReglagesBons(
  _prev: BonState,
  formData: FormData,
): Promise<BonState> {
  const t = await textes();
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  if (!restaurantId) return { erreur: t.inconnu, succes: null };
  await exiger(restaurantId, "gerant");

  const montants = lireMontants(String(formData.get("montants") ?? ""));
  if (montants.length === 0) {
    return {
      erreur: t.montantsInvalides,
      succes: null,
    };
  }
  const validite = Number(formData.get("validite"));
  const texte = String(formData.get("texte") ?? "")
    .trim()
    .slice(0, 600);

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurants")
    .update({
      bons_cadeaux_actifs: formData.get("actifs") === "on",
      bons_cadeaux_montants: montants,
      bons_cadeaux_validite_mois: (VALIDITES as readonly number[]).includes(
        validite,
      )
        ? validite
        : 12,
      bons_cadeaux_texte: texte || null,
    })
    .eq("id", restaurantId);
  if (error) {
    console.error("[bons/reglages]", error.message);
    return {
      erreur:
        error.code === "42703" || error.code === "PGRST204"
          ? t.migration85
          : t.impossible,
      succes: null,
    };
  }
  revalidatePath(chemin(restaurantId));
  return { erreur: null, succes: t.enregistre };
}

/** Déduire un montant d'un bon, au moment de l'addition. */
export async function utiliserBon(
  _prev: BonState,
  formData: FormData,
): Promise<BonState> {
  const t = await textes();
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const bonId = String(formData.get("bon_id") ?? "");
  if (!restaurantId || !bonId) return { erreur: t.bonInconnu, succes: null };
  await exiger(restaurantId, "gerant");

  const centimes = Math.round(
    Number.parseFloat(String(formData.get("montant") ?? "").replace(",", ".")) *
      100,
  );
  if (!Number.isFinite(centimes) || centimes <= 0) {
    return { erreur: t.montantManquant, succes: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("utiliser_bon_cadeau", {
    p_bon_id: bonId,
    p_montant: centimes,
  });
  if (error) {
    return {
      erreur: error.message.includes("non utilisable")
        ? t.depasse
        : t.encaissementImpossible,
      succes: null,
    };
  }
  revalidatePath(chemin(restaurantId));
  const reste = Number(data ?? 0);
  return {
    erreur: null,
    succes:
      reste > 0
        ? t.noteReste(`${(reste / 100).toLocaleString("fr-FR")} €`)
        : t.noteEpuise,
  };
}

/** Un bon offert par la maison : un geste, un concours, un client à qui l'on doit bien ça. */
export async function creerBonOffert(
  _prev: BonState,
  formData: FormData,
): Promise<BonState> {
  const t = await textes();
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  if (!restaurantId) return { erreur: t.inconnu, succes: null };
  await exiger(restaurantId, "gerant");

  const centimes = lireMontantLibre(String(formData.get("montant") ?? ""));
  const beneficiaire = String(formData.get("beneficiaire_nom") ?? "")
    .trim()
    .slice(0, 120);
  const email = String(formData.get("beneficiaire_email") ?? "")
    .trim()
    .toLowerCase()
    .slice(0, 200);
  const message = String(formData.get("message") ?? "")
    .trim()
    .slice(0, 300);
  if (!centimes) {
    return { erreur: t.montantLibre, succes: null };
  }
  if (!beneficiaire) {
    return { erreur: t.nomManquant, succes: null };
  }
  if (email && !EMAIL.test(email)) {
    return {
      erreur: t.emailInvalide,
      succes: null,
    };
  }

  const supabase = await createClient();
  const { data: maisonData } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", restaurantId)
    .maybeSingle();
  const maison = maisonData as {
    nom: string;
    email_contact: string | null;
    bons_cadeaux_validite_mois?: number | null;
  } | null;
  if (!maison) return { erreur: t.inconnu, succes: null };

  const maintenant = new Date();
  let bon: Bon | null = null;
  for (let essai = 0; essai < 3 && !bon; essai++) {
    const { data, error } = await supabase
      .from("restaurant_bons_cadeaux")
      .insert({
        restaurant_id: restaurantId,
        code: genererCode(randomBytes(8)),
        montant_centimes: centimes,
        solde_centimes: centimes,
        acheteur_nom: maison.nom,
        acheteur_email: maison.email_contact ?? "",
        beneficiaire_nom: beneficiaire,
        beneficiaire_email: email || null,
        message: message || null,
        statut: "valide",
        origine: "offert",
        paiement_token: randomBytes(OCTETS_JETON).toString("base64url"),
        paye_le: maintenant.toISOString(),
        expire_le: echeance(
          maintenant,
          maison.bons_cadeaux_validite_mois ?? 12,
        ),
      })
      .select("*")
      .single();
    if (error && error.code !== "23505") {
      console.error("[bons/offert]", error.message);
      return { erreur: t.creationImpossible, succes: null };
    }
    bon = (data as Bon | null) ?? null;
  }
  if (!bon) return { erreur: t.creationImpossible, succes: null };

  if (email) {
    const { beneficiaire: courriel } = messagesDuBon(bon, maison.nom);
    if (courriel) {
      await envoyerCourriel({
        destinataire: email,
        repondreA: maison.email_contact ?? undefined,
        ...courriel,
      });
    }
  }

  revalidatePath(chemin(restaurantId));
  return {
    erreur: null,
    succes: email ? t.creeEnvoye(bon.code, email) : t.cree(bon.code),
  };
}

/** Trois mois de plus, pour un client qui n'a pas pu venir à temps. */
export async function prolongerBon(formData: FormData): Promise<void> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const bonId = String(formData.get("bon_id") ?? "");
  if (!restaurantId || !bonId) return;
  await exiger(restaurantId, "gerant");

  const supabase = await createClient();
  const { data } = await supabase
    .from("restaurant_bons_cadeaux")
    .select("expire_le")
    .eq("id", bonId)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();
  const actuelle = (data as { expire_le: string | null } | null)?.expire_le;
  const aujourdhui = new Date();
  const depart =
    actuelle && new Date(`${actuelle}T12:00:00Z`) > aujourdhui
      ? new Date(`${actuelle}T12:00:00Z`)
      : aujourdhui;
  await supabase
    .from("restaurant_bons_cadeaux")
    .update({ expire_le: echeance(depart, 3) })
    .eq("id", bonId)
    .eq("restaurant_id", restaurantId);
  revalidatePath(chemin(restaurantId));
}

/**
 * Annuler un bon — après l'avoir remboursé dans Stripe. Klarr ne
 * rembourse pas lui-même : l'argent est sur le compte du restaurant.
 */
export async function annulerBon(formData: FormData): Promise<void> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const bonId = String(formData.get("bon_id") ?? "");
  if (!restaurantId || !bonId) return;
  await exiger(restaurantId, "gerant");

  const supabase = await createClient();
  await supabase
    .from("restaurant_bons_cadeaux")
    .update({ statut: "annule" })
    .eq("id", bonId)
    .eq("restaurant_id", restaurantId);
  revalidatePath(chemin(restaurantId));
}
