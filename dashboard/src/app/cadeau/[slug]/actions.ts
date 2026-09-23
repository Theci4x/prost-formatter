"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { langueVisiteur } from "@/lib/i18n/langue";
import { BONS } from "@/lib/i18n/bons";
import { OCTETS_JETON } from "@/lib/reservations/acompte";
import {
  MONTANT_MAX,
  MONTANT_MIN,
  genererCode,
  lireMontantLibre,
  prixBon,
} from "@/lib/bons/regles";
import { creerPaiementBon } from "@/lib/bons/serveur";
import { chargerMaisonCadeau } from "@/lib/bons/maison";

export type AchatState = { erreur: string | null };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const court = (valeur: FormDataEntryValue | null, max: number) =>
  String(valeur ?? "")
    .trim()
    .slice(0, max);

/**
 * L'achat d'un bon, depuis la page publique.
 *
 * Tout est revérifié ici : le montant vient d'un formulaire, et un
 * montant fabriqué à la main ne doit pas produire un bon de 10 000 €
 * payé 1 €. Le bon est créé « en attente », puis le client part chez
 * Stripe ; il ne devient valable qu'au paiement confirmé.
 */
export async function acheterBon(
  _prev: AchatState,
  formData: FormData,
): Promise<AchatState> {
  const langue = await langueVisiteur();
  const b = BONS[langue];
  const slug = court(formData.get("slug"), 120);

  const maison = await chargerMaisonCadeau(slug);
  if (!maison?.ouvert)
    return { erreur: b.indisponibleTexte(maison?.nom ?? "") };

  const choix = String(formData.get("montant") ?? "");
  const centimes =
    choix === "autre"
      ? lireMontantLibre(String(formData.get("montant_libre") ?? ""))
      : maison.montants.includes(Number(choix))
        ? Number(choix)
        : null;
  if (!centimes) {
    return {
      erreur: b.erreurMontant(
        prixBon(MONTANT_MIN, langue),
        prixBon(MONTANT_MAX, langue),
      ),
    };
  }

  const acheteurNom = court(formData.get("acheteur_nom"), 120);
  const acheteurEmail = court(
    formData.get("acheteur_email"),
    200,
  ).toLowerCase();
  const beneficiaireNom = court(formData.get("beneficiaire_nom"), 120);
  const message = court(formData.get("message"), 300) || null;
  const envoyer = formData.get("envoyer_beneficiaire") === "on";
  const beneficiaireEmail = envoyer
    ? court(formData.get("beneficiaire_email"), 200).toLowerCase()
    : "";

  if (!acheteurNom || !acheteurEmail || !beneficiaireNom) {
    return { erreur: b.erreurChamps };
  }
  if (!EMAIL.test(acheteurEmail)) return { erreur: b.erreurEmail };
  if (envoyer && !EMAIL.test(beneficiaireEmail)) {
    return { erreur: b.erreurEmailBeneficiaire };
  }

  const supabase = createServiceClient();
  const token = randomBytes(OCTETS_JETON).toString("base64url");
  // Un code déjà pris est rarissime, pas impossible : on retente.
  let bon: { id: string } | null = null;
  for (let essai = 0; essai < 3 && !bon; essai++) {
    const { data, error } = await supabase
      .from("restaurant_bons_cadeaux")
      .insert({
        restaurant_id: maison.id,
        code: genererCode(randomBytes(8)),
        montant_centimes: centimes,
        solde_centimes: centimes,
        acheteur_nom: acheteurNom,
        acheteur_email: acheteurEmail,
        beneficiaire_nom: beneficiaireNom,
        beneficiaire_email: beneficiaireEmail || null,
        message,
        langue,
        paiement_token: token,
      })
      .select("id")
      .single();
    if (error && error.code !== "23505") {
      console.error("[cadeau/acheter]", error.message);
      return { erreur: b.erreurPaiement };
    }
    bon = (data as { id: string } | null) ?? null;
  }
  if (!bon) return { erreur: b.erreurPaiement };

  let url: string;
  try {
    const paiement = await creerPaiementBon({
      compteStripe: maison.compteStripe,
      bon: {
        id: bon.id,
        paiement_token: token,
        montant_centimes: centimes,
        acheteur_email: acheteurEmail,
      },
      intitule: `${b.bonCadeau} — ${maison.nom}`,
    });
    url = paiement.url;
    await supabase
      .from("restaurant_bons_cadeaux")
      .update({ stripe_session_id: paiement.sessionId })
      .eq("id", bon.id);
  } catch (cause) {
    console.error("[cadeau/stripe]", cause);
    return { erreur: b.erreurPaiement };
  }

  redirect(url);
}
