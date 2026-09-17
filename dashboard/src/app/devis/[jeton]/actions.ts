"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { calculer, decidable, type StatutDevis } from "@/lib/devis/calcul";
import { prevenirReponseDevis } from "@/lib/courriel/devis";
import { notifierEtablissement } from "@/lib/push/envoyer";
import { OCTETS_JETON } from "@/lib/reservations/acompte";
import { siteUrl } from "@/lib/site-url";

/**
 * La réponse du client à un devis.
 *
 * Tout passe par la clé de service : celui qui répond n'a pas de compte,
 * il n'a qu'un jeton. C'est donc ce code, et lui seul, qui décide de ce
 * qu'un porteur de jeton peut faire — accepter ou refuser le sien, rien
 * d'autre.
 */

export type ReponseState = { erreur: string | null; fait: boolean };

type Ligne = {
  quantite: number;
  prix_unitaire_centimes: number;
  libelle: string;
  tva_taux: number;
};

type DevisComplet = {
  id: string;
  restaurant_id: string;
  reservation_id: string;
  numero: string;
  statut: StatutDevis;
  tva_taux: number;
  acompte_centimes: number | null;
  valide_jusquau: string;
};

async function charger(jeton: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("devis")
    .select(
      "id, restaurant_id, reservation_id, numero, statut, tva_taux, acompte_centimes, valide_jusquau",
    )
    .eq("jeton", jeton)
    .maybeSingle();
  return { supabase, devis: data as DevisComplet | null };
}

export async function accepterDevis(
  _prevState: ReponseState,
  formData: FormData,
): Promise<ReponseState> {
  const jeton = (formData.get("jeton") as string)?.trim();
  if (!jeton) return { erreur: "Devis introuvable.", fait: false };

  const { supabase, devis } = await charger(jeton);
  if (!devis) return { erreur: "Devis introuvable.", fait: false };

  const verdict = decidable(devis, new Date());
  if (!verdict.possible) return { erreur: verdict.motif, fait: false };

  const { data: lignesData } = await supabase
    .from("devis_lignes")
    .select("libelle, quantite, prix_unitaire_centimes, tva_taux")
    .eq("devis_id", devis.id);
  const lignes = (lignesData ?? []) as Ligne[];
  const totaux = calculer(
    lignes.map((ligne) => ({
      libelle: ligne.libelle,
      quantite: Number(ligne.quantite),
      prixUnitaireCentimes: ligne.prix_unitaire_centimes,
      tauxTva: Number(ligne.tva_taux),
    })),
  );

  // La condition sur le statut rejoue la vérification en base : deux clics
  // simultanés sur « Accepter » n'acceptent qu'une fois, et le second
  // ressort sans avoir rien fait.
  const { data: accepte, error } = await supabase
    .from("devis")
    .update({ statut: "accepte", accepte_le: new Date().toISOString() })
    .eq("id", devis.id)
    .eq("statut", "envoye")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[accepterDevis]", error);
    return { erreur: "L'acceptation a échoué. Réessayez dans un instant.", fait: false };
  }
  if (!accepte) return { erreur: "Ce devis a déjà reçu une réponse.", fait: false };

  // Ce que le client vient d'accepter commande la suite : un acompte à
  // régler, ou une table ferme. Le montant est recopié sur la réservation
  // plutôt que relu dans le devis — ce qui a été accepté ne doit pas
  // bouger si quelqu'un modifie le devis ensuite.
  const { data: resaData } = await supabase
    .from("restaurant_reservations")
    .select("paiement_token, client_nom, client_email")
    .eq("id", devis.reservation_id)
    .maybeSingle();
  const resa = resaData as {
    paiement_token: string | null;
    client_nom: string | null;
    client_email: string | null;
  } | null;

  const jetonPaiement =
    resa?.paiement_token ?? randomBytes(OCTETS_JETON).toString("base64url");

  await supabase
    .from("restaurant_reservations")
    .update(
      devis.acompte_centimes
        ? {
            acompte_centimes: devis.acompte_centimes,
            acompte_statut: "attendu",
            paiement_token: jetonPaiement,
            statut: "demande",
          }
        : { statut: "confirmee", option_expire_le: null },
    )
    .eq("id", devis.reservation_id);

  const { data: maison } = await supabase
    .from("restaurants")
    .select("nom, email_contact")
    .eq("id", devis.restaurant_id)
    .maybeSingle();
  const restaurant = maison as { nom: string; email_contact: string | null } | null;

  const carnet = `${siteUrl()}/dashboard/${devis.restaurant_id}/reservations`;
  await Promise.all([
    restaurant?.email_contact
      ? prevenirReponseDevis({
          destinataire: restaurant.email_contact,
          clientNom: resa?.client_nom ?? "Le client",
          numero: devis.numero,
          accepte: true,
          motif: null,
          totalTtcCentimes: totaux.ttcCentimes,
          lien: carnet,
        })
      : Promise.resolve(),
    notifierEtablissement(supabase, devis.restaurant_id, {
      titre: `Devis accepté — ${resa?.client_nom ?? "un client"}`,
      corps: `${devis.numero} · ${(totaux.ttcCentimes / 100).toLocaleString("fr-FR")} € TTC.${
        devis.acompte_centimes ? " Acompte réclamé." : " La table est confirmée."
      }`,
      chemin: `/dashboard/${devis.restaurant_id}/reservations`,
      etiquette: `devis-${devis.id}`,
    }),
  ]);

  revalidatePath(`/devis/${jeton}`);

  // Un acompte réclamé mène droit au paiement : demander au client de
  // retrouver un second lien dans un second e-mail, c'est le perdre.
  if (devis.acompte_centimes) redirect(`/paiement/${jetonPaiement}`);
  return { erreur: null, fait: true };
}

export async function refuserDevis(
  _prevState: ReponseState,
  formData: FormData,
): Promise<ReponseState> {
  const jeton = (formData.get("jeton") as string)?.trim();
  const motif = ((formData.get("motif") as string) ?? "").trim().slice(0, 500);
  if (!jeton) return { erreur: "Devis introuvable.", fait: false };

  const { supabase, devis } = await charger(jeton);
  if (!devis) return { erreur: "Devis introuvable.", fait: false };

  const verdict = decidable(devis, new Date());
  if (!verdict.possible) return { erreur: verdict.motif, fait: false };

  const { data: refuse, error } = await supabase
    .from("devis")
    .update({
      statut: "refuse",
      refuse_le: new Date().toISOString(),
      refus_motif: motif || null,
    })
    .eq("id", devis.id)
    .eq("statut", "envoye")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[refuserDevis]", error);
    return { erreur: "Le refus n'a pas pu être enregistré.", fait: false };
  }
  if (!refuse) return { erreur: "Ce devis a déjà reçu une réponse.", fait: false };

  const { data: resaData } = await supabase
    .from("restaurant_reservations")
    .select("client_nom")
    .eq("id", devis.reservation_id)
    .maybeSingle();

  const { data: maison } = await supabase
    .from("restaurants")
    .select("nom, email_contact")
    .eq("id", devis.restaurant_id)
    .maybeSingle();
  const restaurant = maison as { nom: string; email_contact: string | null } | null;
  const clientNom =
    (resaData as { client_nom: string | null } | null)?.client_nom ?? "Le client";
  const carnet = `${siteUrl()}/dashboard/${devis.restaurant_id}/reservations`;

  await Promise.all([
    restaurant?.email_contact
      ? prevenirReponseDevis({
          destinataire: restaurant.email_contact,
          clientNom,
          numero: devis.numero,
          accepte: false,
          motif: motif || null,
          totalTtcCentimes: 0,
          lien: carnet,
        })
      : Promise.resolve(),
    // Une salle qu'on croyait vendue se remet en vente : ça vaut une
    // notification autant qu'une acceptation.
    notifierEtablissement(supabase, devis.restaurant_id, {
      titre: `Devis refusé — ${clientNom}`,
      corps: motif
        ? `${devis.numero} · « ${motif} »`
        : `${devis.numero} · la salle redevient disponible.`,
      chemin: `/dashboard/${devis.restaurant_id}/reservations`,
      etiquette: `devis-${devis.id}`,
    }),
  ]);

  revalidatePath(`/devis/${jeton}`);
  return { erreur: null, fait: true };
}
