"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { exiger } from "@/lib/equipe/roles";
import { validerContenu, validerDate } from "@/lib/campagnes/regles";
import { estSegment } from "@/lib/campagnes/segments";
import {
  campagnesOuvertes,
  composer,
  expediteur,
} from "@/lib/campagnes/message";
import { envoyerCourriel } from "@/lib/courriel/envoyer";
import { langueUtilisateur } from "@/lib/i18n/langue";
import { traducteur } from "@/lib/i18n/t";
import { CAMPAGNES } from "@/lib/i18n/pages/campagnes";

export type CampagneState = {
  error: string | null;
  message: string | null;
};

/** Les champs communs à la création et à la modification. */
function lire(formData: FormData) {
  const segmentBrut = String(formData.get("segment") ?? "tous");
  return {
    objet: String(formData.get("objet") ?? "").trim(),
    texte: String(formData.get("texte") ?? "").trim(),
    boutonLibelle: String(formData.get("bouton_libelle") ?? "").trim() || null,
    boutonUrl: String(formData.get("bouton_url") ?? "").trim() || null,
    segment: estSegment(segmentBrut) ? segmentBrut : "tous",
  };
}

/**
 * Le verrou, en tête de chaque action.
 *
 * L'écran est masqué tant que le domaine d'envoi n'est pas configuré,
 * mais une action serveur reste une adresse : la masquer ne la ferme pas.
 */
async function garder(restaurantId: string): Promise<string | null> {
  if (!restaurantId) return "Établissement inconnu.";
  if (!campagnesOuvertes()) {
    return "Les campagnes ne sont pas encore ouvertes.";
  }
  await exiger(restaurantId, "gerant");
  return null;
}

export async function creerCampagne(
  _prevState: CampagneState,
  formData: FormData,
): Promise<CampagneState> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const refus = await garder(restaurantId);
  if (refus) return { error: refus, message: null };

  const champs = lire(formData);
  const erreur = validerContenu(champs);
  if (erreur) return { error: erreur, message: null };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("restaurant_campagnes")
    .insert({
      restaurant_id: restaurantId,
      objet: champs.objet,
      texte: champs.texte,
      bouton_libelle: champs.boutonLibelle,
      bouton_url: champs.boutonUrl,
      segment: champs.segment,
    })
    // Le `select` après l'insertion demande une politique de lecture, que
    // la table a : sans lui, on ne saurait pas où rediriger.
    .select("id")
    .single();

  if (error) {
    console.error("[creerCampagne]", error.message);
    return { error: "L'enregistrement a échoué.", message: null };
  }

  revalidatePath(`/dashboard/${restaurantId}/campagnes`);
  redirect(
    `/dashboard/${restaurantId}/campagnes/${(data as { id: string }).id}`,
  );
}

export async function enregistrerCampagne(
  _prevState: CampagneState,
  formData: FormData,
): Promise<CampagneState> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const campagneId = String(formData.get("campagne_id") ?? "");
  const refus = await garder(restaurantId);
  if (refus) return { error: refus, message: null };

  const champs = lire(formData);
  const erreur = validerContenu(champs);
  if (erreur) return { error: erreur, message: null };

  const supabase = await createClient();
  // `eq("statut", "brouillon")` n'est pas une précaution de confort :
  // modifier le texte d'une campagne partie changerait ce que dit
  // l'historique, et modifier celui d'une campagne en cours d'envoi
  // enverrait deux messages différents sous le même objet.
  const { data, error } = await supabase
    .from("restaurant_campagnes")
    .update({
      objet: champs.objet,
      texte: champs.texte,
      bouton_libelle: champs.boutonLibelle,
      bouton_url: champs.boutonUrl,
      segment: champs.segment,
      updated_at: new Date().toISOString(),
    })
    .eq("id", campagneId)
    .eq("restaurant_id", restaurantId)
    .in("statut", ["brouillon", "programmee"])
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[enregistrerCampagne]", error.message);
    return { error: "L'enregistrement a échoué.", message: null };
  }
  if (!data) {
    return {
      error: "Cette campagne est partie : elle ne se modifie plus.",
      message: null,
    };
  }

  revalidatePath(`/dashboard/${restaurantId}/campagnes/${campagneId}`);
  return { error: null, message: "Enregistré." };
}

export async function programmerCampagne(formData: FormData): Promise<void> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const campagneId = String(formData.get("campagne_id") ?? "");
  if (await garder(restaurantId)) return;

  const jour = String(formData.get("envoyer_le") ?? "").trim();
  if (validerDate(jour, new Date().toISOString().slice(0, 10))) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_campagnes")
    .update({
      statut: "programmee",
      envoyer_le: jour,
      derniere_erreur: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", campagneId)
    .eq("restaurant_id", restaurantId)
    // Une campagne en cours ou partie ne se reprogramme pas.
    .in("statut", ["brouillon", "programmee", "echec"]);

  if (error) console.error("[programmerCampagne]", error.message);
  revalidatePath(`/dashboard/${restaurantId}/campagnes`);
  revalidatePath(`/dashboard/${restaurantId}/campagnes/${campagneId}`);
}

export async function deprogrammerCampagne(formData: FormData): Promise<void> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const campagneId = String(formData.get("campagne_id") ?? "");
  if (await garder(restaurantId)) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_campagnes")
    .update({ statut: "brouillon", updated_at: new Date().toISOString() })
    .eq("id", campagneId)
    .eq("restaurant_id", restaurantId)
    // Seulement ce qui n'est pas encore parti. Une campagne « en cours »
    // a déjà des messages dans la nature : l'arrêter ne les rattrape pas.
    .eq("statut", "programmee");

  if (error) console.error("[deprogrammerCampagne]", error.message);
  revalidatePath(`/dashboard/${restaurantId}/campagnes`);
  revalidatePath(`/dashboard/${restaurantId}/campagnes/${campagneId}`);
}

export async function supprimerCampagne(formData: FormData): Promise<void> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const campagneId = String(formData.get("campagne_id") ?? "");
  if (await garder(restaurantId)) return;

  const supabase = await createClient();
  // Une campagne envoyée ne s'efface pas : son journal dit à qui on a
  // écrit et quand, et c'est ce qu'on produit le jour où quelqu'un le
  // demande. Seuls les brouillons et les échecs s'en vont.
  const { error } = await supabase
    .from("restaurant_campagnes")
    .delete()
    .eq("id", campagneId)
    .eq("restaurant_id", restaurantId)
    .in("statut", ["brouillon", "echec"]);

  if (error) console.error("[supprimerCampagne]", error.message);
  revalidatePath(`/dashboard/${restaurantId}/campagnes`);
  redirect(`/dashboard/${restaurantId}/campagnes`);
}

/**
 * L'essai, vers sa propre adresse.
 *
 * Indispensable : personne n'envoie à cinq cents personnes un message
 * qu'il n'a pas vu arriver dans une boîte. Le message est composé
 * exactement comme le vrai, pied de désinscription compris — c'est
 * justement ce qu'on veut vérifier.
 *
 * Le jeton utilisé est celui d'un contact fictif, jamais celui d'un
 * client : un restaurateur qui cliquerait sur « me désinscrire » depuis
 * son essai désinscrirait quelqu'un d'autre.
 */
export async function envoyerTest(
  _prevState: CampagneState,
  formData: FormData,
): Promise<CampagneState> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const campagneId = String(formData.get("campagne_id") ?? "");
  const refus = await garder(restaurantId);
  if (refus) return { error: refus, message: null };

  const destinataire = String(formData.get("destinataire") ?? "").trim();
  if (!destinataire) return { error: "Indiquez une adresse.", message: null };

  const supabase = await createClient();
  const [{ data: campagneData }, { data: maisonData }] = await Promise.all([
    supabase
      .from("restaurant_campagnes")
      .select("objet, texte, bouton_libelle, bouton_url")
      .eq("id", campagneId)
      .eq("restaurant_id", restaurantId)
      .maybeSingle(),
    supabase
      .from("restaurants")
      .select("nom, adresse, slug_reservation, email_contact")
      .eq("id", restaurantId)
      .maybeSingle(),
  ]);

  const campagne = campagneData as {
    objet: string;
    texte: string;
    bouton_libelle: string | null;
    bouton_url: string | null;
  } | null;
  const maison = maisonData as {
    nom: string;
    adresse: string | null;
    slug_reservation: string | null;
    email_contact: string | null;
  } | null;
  if (!campagne || !maison) {
    return { error: "Campagne introuvable.", message: null };
  }

  const pret = composer({
    campagne,
    maison,
    // Un jeton qui ne désigne personne : la page dira « lien non valide »,
    // ce qui est la bonne réponse pour un essai.
    jeton: "essai",
  });

  const resultat = await envoyerCourriel({
    destinataire,
    sujet: `[Essai] ${pret.sujet}`,
    texte: pret.texte,
    html: pret.html,
    repondreA: maison.email_contact ?? undefined,
    expediteur: expediteur({
      nom: maison.nom,
      slug: maison.slug_reservation,
    }),
  });

  if (!resultat.envoye) {
    return { error: resultat.erreur ?? "L'envoi a échoué.", message: null };
  }
  const t = traducteur(await langueUtilisateur(), CAMPAGNES);
  return {
    error: null,
    message: t("Essai envoyé à {email}.", { email: destinataire }),
  };
}

/** Relance à la main une campagne en échec, sans attendre la nuit. */
export async function relancerCampagne(formData: FormData): Promise<void> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const campagneId = String(formData.get("campagne_id") ?? "");
  if (await garder(restaurantId)) return;

  // Le journal garde trace de ce qui est déjà parti : remettre la
  // campagne en file ne réécrit qu'aux lignes restées « à envoyer ».
  const service = createServiceClient();
  const { error } = await service
    .from("restaurant_campagnes")
    .update({
      statut: "programmee",
      envoyer_le: new Date().toISOString().slice(0, 10),
      derniere_erreur: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", campagneId)
    .eq("restaurant_id", restaurantId)
    .eq("statut", "echec");

  if (error) console.error("[relancerCampagne]", error.message);
  revalidatePath(`/dashboard/${restaurantId}/campagnes/${campagneId}`);
}
