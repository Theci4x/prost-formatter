"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { exiger } from "@/lib/equipe/roles";
import { envoyerDevisAuClient } from "@/lib/courriel/devis";
import {
  calculer,
  enCentimes,
  enQuantite,
  numeroSuivant,
  validiteParDefaut,
  type Ligne,
} from "@/lib/devis/calcul";
import { siteUrl } from "@/lib/site-url";

/**
 * Les actions du devis, côté restaurateur.
 *
 * Le jeton fait trente-deux octets, comme celui du lien de paiement : le
 * connaître suffit à lire le devis, il ne doit donc pas se deviner.
 */
const OCTETS_JETON = 32;

export type DevisState = { erreur: string | null; enregistre: boolean };

/**
 * Ouvre le devis d'une demande : celui qui existe, ou un brouillon neuf.
 * Deux clics sur « Établir un devis » ne doivent pas faire deux devis.
 */
export async function ouvrirDevis(formData: FormData): Promise<void> {
  const restaurantId = (formData.get("restaurant_id") as string)?.trim();
  const reservationId = (formData.get("reservation_id") as string)?.trim();
  if (!restaurantId || !reservationId) return;

  await exiger(restaurantId, "gerant");
  const supabase = await createClient();

  const { data: existant } = await supabase
    .from("devis")
    .select("id")
    .eq("reservation_id", reservationId)
    .maybeSingle();

  if (!existant) {
    // Le numéro se calcule sur les devis déjà émis par cette maison. Deux
    // créations à la même seconde pourraient viser le même numéro : la
    // contrainte d'unicité les départage, et la seconde ressort en erreur
    // plutôt qu'en doublon silencieux.
    const { data: numeros } = await supabase
      .from("devis")
      .select("numero")
      .eq("restaurant_id", restaurantId);

    const { error } = await supabase.from("devis").insert({
      restaurant_id: restaurantId,
      reservation_id: reservationId,
      numero: numeroSuivant(
        ((numeros ?? []) as { numero: string }[]).map((l) => l.numero),
        new Date(),
      ),
      jeton: randomBytes(OCTETS_JETON).toString("base64url"),
      valide_jusquau: validiteParDefaut(new Date()),
    });
    if (error) console.error("[ouvrirDevis]", error);
  }

  redirect(`/dashboard/${restaurantId}/devis/${reservationId}`);
}

type Saisie = {
  devisId: string;
  restaurantId: string;
  lignes: Ligne[];
  tauxTva: number;
  acompteCentimes: number | null;
  valideJusquau: string;
  message: string | null;
};

/** Lit et vérifie ce que l'écran a envoyé. */
function lire(formData: FormData): Saisie | string {
  const devisId = (formData.get("devis_id") as string)?.trim();
  const restaurantId = (formData.get("restaurant_id") as string)?.trim();
  if (!devisId || !restaurantId) return "Devis introuvable.";

  // Les lignes voyagent en JSON : un tableau de champs indexés se perd dès
  // qu'on en supprime une au milieu.
  let brutes: unknown;
  try {
    brutes = JSON.parse((formData.get("lignes") as string) ?? "[]");
  } catch {
    return "Les lignes n'ont pas pu être lues.";
  }
  if (!Array.isArray(brutes)) return "Les lignes n'ont pas pu être lues.";

  const lignes: Ligne[] = [];
  for (const brute of brutes) {
    const ligne = brute as {
      libelle?: string;
      quantite?: string;
      prix?: string;
    };
    const libelle = (ligne.libelle ?? "").trim();
    // Une ligne entièrement vide est un reste de saisie, pas une erreur :
    // on la laisse tomber sans rien dire.
    if (!libelle && !ligne.quantite?.trim() && !ligne.prix?.trim()) continue;

    if (!libelle) return "Une ligne n'a pas de libellé.";
    const quantite = enQuantite(ligne.quantite ?? "");
    if (quantite === undefined) {
      return `Quantité illisible pour « ${libelle} ».`;
    }
    const prix = enCentimes(ligne.prix ?? "");
    if (prix === undefined) return `Prix illisible pour « ${libelle} ».`;
    lignes.push({ libelle, quantite, prixUnitaireCentimes: prix });
  }

  const tauxTva = Number(formData.get("tva") ?? 10);
  if (!Number.isFinite(tauxTva) || tauxTva < 0 || tauxTva > 100) {
    return "Taux de TVA invalide.";
  }

  const acompteBrut = ((formData.get("acompte") as string) ?? "").trim();
  const acompteCentimes = acompteBrut ? enCentimes(acompteBrut) : null;
  if (acompteCentimes === undefined) return "Montant d'acompte illisible.";

  const valideJusquau = ((formData.get("valide_jusquau") as string) ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valideJusquau)) {
    return "Date de validité invalide.";
  }

  const message = ((formData.get("message") as string) ?? "").trim();

  return {
    devisId,
    restaurantId,
    lignes,
    tauxTva,
    acompteCentimes: acompteCentimes ?? null,
    valideJusquau,
    message: message || null,
  };
}

/** Écrit l'en-tête et remplace les lignes. */
async function ecrire(saisie: Saisie): Promise<string | null> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("devis")
    .update({
      tva_taux: saisie.tauxTva,
      acompte_centimes: saisie.acompteCentimes,
      valide_jusquau: saisie.valideJusquau,
      message: saisie.message,
      updated_at: new Date().toISOString(),
    })
    .eq("id", saisie.devisId);
  if (error) {
    console.error("[devis/entete]", error);
    return "L'enregistrement a échoué.";
  }

  // Remplacer plutôt que rapprocher : une ligne supprimée au milieu, une
  // autre insérée, et toute tentative de faire correspondre les anciennes
  // aux nouvelles se trompe un jour. Elles n'ont pas d'histoire propre.
  const { error: purge } = await supabase
    .from("devis_lignes")
    .delete()
    .eq("devis_id", saisie.devisId);
  if (purge) {
    console.error("[devis/purge]", purge);
    return "L'enregistrement a échoué.";
  }

  if (saisie.lignes.length > 0) {
    const { error: insertion } = await supabase.from("devis_lignes").insert(
      saisie.lignes.map((ligne, rang) => ({
        devis_id: saisie.devisId,
        libelle: ligne.libelle,
        quantite: ligne.quantite,
        prix_unitaire_centimes: ligne.prixUnitaireCentimes,
        ordre: rang,
      })),
    );
    if (insertion) {
      console.error("[devis/lignes]", insertion);
      return "L'enregistrement des lignes a échoué.";
    }
  }
  return null;
}

export async function enregistrerDevis(
  _prevState: DevisState,
  formData: FormData,
): Promise<DevisState> {
  const saisie = lire(formData);
  if (typeof saisie === "string") return { erreur: saisie, enregistre: false };

  await exiger(saisie.restaurantId, "gerant");
  const erreur = await ecrire(saisie);
  if (erreur) return { erreur, enregistre: false };

  revalidatePath(`/dashboard/${saisie.restaurantId}/devis`);
  return { erreur: null, enregistre: true };
}

/**
 * Enregistre, puis envoie. Les deux ensemble : personne n'envoie un devis
 * sans l'avoir écrit, et un bouton « enregistrer » suivi d'un bouton
 * « envoyer » laisse toujours quelqu'un envoyer la version d'avant.
 */
export async function envoyerDevis(
  _prevState: DevisState,
  formData: FormData,
): Promise<DevisState> {
  const saisie = lire(formData);
  if (typeof saisie === "string") return { erreur: saisie, enregistre: false };
  if (saisie.lignes.length === 0) {
    return { erreur: "Ajoutez au moins une ligne avant d'envoyer.", enregistre: false };
  }

  await exiger(saisie.restaurantId, "gerant");
  const erreurEcriture = await ecrire(saisie);
  if (erreurEcriture) return { erreur: erreurEcriture, enregistre: false };

  const supabase = await createClient();
  const { data } = await supabase
    .from("devis")
    .select("id, numero, jeton, reservation_id")
    .eq("id", saisie.devisId)
    .maybeSingle();
  const devis = data as {
    numero: string;
    jeton: string;
    reservation_id: string;
  } | null;
  if (!devis) return { erreur: "Devis introuvable.", enregistre: false };

  const { data: ligneResa } = await supabase
    .from("restaurant_reservations")
    .select("client_nom, client_email")
    .eq("id", devis.reservation_id)
    .maybeSingle();
  const client = ligneResa as {
    client_nom: string | null;
    client_email: string | null;
  } | null;

  if (!client?.client_email) {
    return {
      erreur:
        "Ce client n'a pas laissé d'adresse e-mail. Copiez le lien du devis et envoyez-le vous-même.",
      enregistre: true,
    };
  }

  const { data: maison } = await supabase
    .from("restaurants")
    .select("nom, email_contact")
    .eq("id", saisie.restaurantId)
    .maybeSingle();
  const restaurant = maison as {
    nom: string;
    email_contact: string | null;
  } | null;

  const totaux = calculer(saisie.lignes, saisie.tauxTva);
  const envoi = await envoyerDevisAuClient({
    destinataire: client.client_email,
    repondreA: restaurant?.email_contact ?? undefined,
    restaurantNom: restaurant?.nom ?? "Votre restaurant",
    clientNom: client.client_nom ?? "",
    numero: devis.numero,
    totalTtcCentimes: totaux.ttcCentimes,
    acompteCentimes: saisie.acompteCentimes,
    valideJusquau: saisie.valideJusquau,
    message: saisie.message,
    lien: `${siteUrl()}/devis/${devis.jeton}`,
  });

  if (!envoi.envoye) {
    return {
      erreur: `Le devis est enregistré, mais l'e-mail n'est pas parti (${envoi.erreur ?? "raison inconnue"}). Copiez le lien et envoyez-le vous-même.`,
      enregistre: true,
    };
  }

  // Le statut ne passe à « envoyé » qu'une fois l'e-mail parti : sinon on
  // afficherait « envoyé » à un restaurateur dont le client n'a rien reçu.
  // La clé de service écrit ce dernier point, la RLS n'ayant pas à juger
  // d'un état que le serveur constate.
  await createServiceClient()
    .from("devis")
    .update({ statut: "envoye", envoye_le: new Date().toISOString() })
    .eq("id", saisie.devisId);

  revalidatePath(`/dashboard/${saisie.restaurantId}/devis`);
  return { erreur: null, enregistre: true };
}
