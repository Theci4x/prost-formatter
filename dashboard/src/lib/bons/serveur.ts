import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe/client";
import { siteUrl } from "@/lib/site-url";
import { envoyerCourriel } from "@/lib/courriel/envoyer";
import {
  echapper,
  enveloppe,
  texteNu,
  type Bloc,
  type Message,
} from "@/lib/courriel/messages";
import { notifierEtablissement } from "@/lib/push/envoyer";
import { BONS } from "@/lib/i18n/bons";
import { dateLongue } from "@/lib/i18n/dates";
import { estLangue, type Langue } from "@/lib/i18n/langues";
import { echeance, prixBon } from "@/lib/bons/regles";

/**
 * Le bon cadeau, de la caisse Stripe à la boîte du bénéficiaire.
 *
 * Même montage que l'acompte : le paiement est créé SUR le compte du
 * restaurateur, sans frais d'application. Klarr n'encaisse rien ; il
 * tient le code, le solde et l'échéance.
 *
 * Deux chemins valident un bon — le retour du client sur notre page, et
 * le webhook quand il ferme l'onglet. `validerBon` écrit sous condition de
 * statut : un seul des deux gagne, et c'est lui qui envoie les e-mails.
 */

export type Bon = {
  id: string;
  restaurant_id: string;
  code: string;
  montant_centimes: number;
  solde_centimes: number;
  acheteur_nom: string;
  acheteur_email: string;
  beneficiaire_nom: string | null;
  beneficiaire_email: string | null;
  message: string | null;
  langue: string;
  statut: string;
  origine: string;
  paiement_token: string;
  stripe_session_id: string | null;
  paye_le: string | null;
  expire_le: string | null;
  created_at: string;
};

export function lienDuBon(token: string): string {
  return `${siteUrl()}/bon/${token}`;
}

export async function creerPaiementBon({
  compteStripe,
  bon,
  intitule,
}: {
  compteStripe: string;
  bon: Pick<
    Bon,
    "id" | "paiement_token" | "montant_centimes" | "acheteur_email"
  >;
  intitule: string;
}): Promise<{ url: string; sessionId: string }> {
  const retour = lienDuBon(bon.paiement_token);
  const session = await getStripe().checkout.sessions.create(
    {
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: bon.montant_centimes,
            product_data: { name: intitule },
          },
        },
      ],
      success_url: `${retour}?retour=1`,
      cancel_url: `${retour}?annule=1`,
      customer_email: bon.acheteur_email,
      // Le jeton, comme pour un acompte : c'est lui que le webhook suit.
      // L'identifiant du bon se lit dans le tableau de bord Stripe.
      metadata: { klarr_token: bon.paiement_token, bon_cadeau_id: bon.id },
      payment_intent_data: {
        metadata: { klarr_token: bon.paiement_token, bon_cadeau_id: bon.id },
      },
    },
    { stripeAccount: compteStripe },
  );
  if (!session.url) throw new Error("Stripe n'a pas renvoyé d'URL de paiement");
  return { url: session.url, sessionId: session.id };
}

function langueDe(bon: Pick<Bon, "langue">): Langue {
  return estLangue(bon.langue) ? bon.langue : "fr";
}

function surUneLigne(texte: string): string {
  return texte.replace(/[\r\n]+/g, " ").slice(0, 180);
}

/** Le mot de l'acheteur, cité tel quel : échappé, et ses retours gardés. */
function mot(message: string | null): Bloc {
  if (!message?.trim()) return "";
  return `<em>« ${echapper(message.trim()).replace(/\n/g, "<br />")} »</em>`;
}

export function messagesDuBon(
  bon: Bon,
  maison: string,
): { acheteur: Message; beneficiaire: Message | null } {
  const langue = langueDe(bon);
  const b = BONS[langue];
  const somme = prixBon(bon.montant_centimes, langue);
  const jusqua = bon.expire_le ? dateLongue(bon.expire_le, langue) : null;
  const nom = echapper(maison);
  const lien = lienDuBon(bon.paiement_token);

  const commun: Bloc[] = [
    { code: { libelle: b.votreCode, valeur: bon.code } },
    jusqua ? b.valableMail(jusqua) : "",
    b.commentUtiliser(nom),
    { bouton: { libelle: b.voirLeBon, url: lien } },
  ];

  const blocsAcheteur: Bloc[] = [
    b.merciAchat(somme, nom),
    ...commun,
    bon.beneficiaire_email
      ? b.aussiEnvoye(echapper(bon.beneficiaire_email))
      : b.aTransmettre,
  ];
  const acheteur: Message = {
    sujet: surUneLigne(b.sujetAcheteur(maison)),
    texte: texteNu(blocsAcheteur, maison, undefined, langue),
    html: enveloppe(blocsAcheteur, maison, undefined, langue),
  };

  if (!bon.beneficiaire_email) return { acheteur, beneficiaire: null };

  const blocsBeneficiaire: Bloc[] = [
    b.offertPar(echapper(bon.acheteur_nom), somme, nom),
    mot(bon.message),
    ...commun,
  ];
  return {
    acheteur,
    beneficiaire: {
      sujet: surUneLigne(b.sujetBeneficiaire(bon.acheteur_nom, maison)),
      texte: texteNu(blocsBeneficiaire, maison, undefined, langue),
      html: enveloppe(blocsBeneficiaire, maison, undefined, langue),
    },
  };
}

/**
 * Le bon payé devient valable : échéance posée, e-mails partis, maison
 * prévenue. Ne fait rien si quelqu'un l'a déjà validé.
 */
export async function validerBon(
  supabase: SupabaseClient,
  token: string,
  paymentIntentId: string | null,
): Promise<boolean> {
  const { data: enAttente } = await supabase
    .from("restaurant_bons_cadeaux")
    .select("id, restaurant_id")
    .eq("paiement_token", token)
    .eq("statut", "attente")
    .maybeSingle();
  if (!enAttente) return false;
  const { restaurant_id } = enAttente as { restaurant_id: string };

  const { data: maisonData } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", restaurant_id)
    .maybeSingle();
  const maison = maisonData as {
    nom: string;
    email_contact: string | null;
    bons_cadeaux_validite_mois?: number | null;
  } | null;
  const mois = maison?.bons_cadeaux_validite_mois ?? 12;

  const maintenant = new Date();
  const { data: valide, error } = await supabase
    .from("restaurant_bons_cadeaux")
    .update({
      statut: "valide",
      paye_le: maintenant.toISOString(),
      stripe_payment_intent_id: paymentIntentId,
      expire_le: echeance(maintenant, mois),
    })
    .eq("paiement_token", token)
    .eq("statut", "attente")
    .select("*")
    .maybeSingle();
  if (error) console.error("[bons/valider]", error.message);
  if (!valide) return false;

  const bon = valide as Bon;
  const nom = maison?.nom ?? "";
  const { acheteur, beneficiaire } = messagesDuBon(bon, nom);
  const repondreA = maison?.email_contact ?? undefined;

  const envois = [
    envoyerCourriel({
      destinataire: bon.acheteur_email,
      repondreA,
      ...acheteur,
    }),
  ];
  if (beneficiaire && bon.beneficiaire_email) {
    envois.push(
      envoyerCourriel({
        destinataire: bon.beneficiaire_email,
        repondreA,
        ...beneficiaire,
      }),
    );
  }
  await Promise.all(envois);

  await notifierEtablissement(supabase, bon.restaurant_id, {
    titre: `Bon cadeau vendu — ${prixBon(bon.montant_centimes)}`,
    corps: bon.beneficiaire_nom
      ? `${bon.acheteur_nom} l'offre à ${bon.beneficiaire_nom}. Code ${bon.code}.`
      : `Acheté par ${bon.acheteur_nom}. Code ${bon.code}.`,
    chemin: `/dashboard/${bon.restaurant_id}/bons-cadeaux`,
    etiquette: `bon-${bon.id}`,
  });

  return true;
}
