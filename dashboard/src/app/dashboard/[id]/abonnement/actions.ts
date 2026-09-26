"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { exiger } from "@/lib/equipe/roles";
import { getStripe } from "@/lib/stripe/client";
import { langueUtilisateur } from "@/lib/i18n/langue";
import { CHAMP_SIRET, clientDuRestaurant } from "@/lib/stripe/facturation";

const texte = (formData: FormData, cle: string, max = 200) =>
  String(formData.get(cle) ?? "")
    .trim()
    .slice(0, max);

/**
 * Les coordonnées de facturation, écrites sur le client Stripe.
 *
 * Les factures déjà émises ne bougent pas — Stripe ne réécrit pas une
 * facture finalisée ; la page le dit. Un restaurateur encore en essai n'a
 * pas de client : on le crée, et la page de paiement le reprendra.
 */
export async function enregistrerFacturation(formData: FormData) {
  const restaurantId = texte(formData, "restaurant_id", 64);
  if (!restaurantId) return;
  await exiger(restaurantId, "proprietaire");
  const retour = (etat: string) =>
    redirect(
      `/dashboard/${restaurantId}/abonnement?facturation=${etat}#facturation`,
    );

  const nom = texte(formData, "nom");
  const email = texte(formData, "email", 200);
  const ligne1 = texte(formData, "ligne1");
  const ligne2 = texte(formData, "ligne2");
  const codePostal = texte(formData, "code_postal", 20);
  const ville = texte(formData, "ville", 100);
  const pays = texte(formData, "pays", 2).toUpperCase() || "FR";
  const siret = texte(formData, "siret", 40).replace(/\s+/g, "");
  const tva = texte(formData, "tva", 40)
    .replace(/[\s.-]+/g, "")
    .toUpperCase();

  if (!nom || !email.includes("@") || !ligne1 || !codePostal || !ville) {
    retour("incomplet");
  }
  // Un SIREN (9 chiffres) ou un SIRET (14) : rien d'autre ne s'y ressemble.
  if (siret && !/^(\d{9}|\d{14})$/.test(siret)) retour("siret");

  const supabase = await createClient();
  const stripe = getStripe();
  const langue = await langueUtilisateur();
  const coordonnees = {
    name: nom,
    email,
    address: {
      line1: ligne1,
      line2: ligne2 || "",
      postal_code: codePostal,
      city: ville,
      country: pays,
    },
    preferred_locales: [langue === "zh" ? "zh" : langue === "en" ? "en" : "fr"],
    invoice_settings: {
      custom_fields: siret
        ? [{ name: CHAMP_SIRET, value: siret }]
        : ("" as const),
    },
  };

  // `redirect` lève une exception : il reste hors des blocs try.
  const existant = await clientDuRestaurant(supabase, restaurantId);
  let client: string | null = null;
  try {
    if (existant) {
      await stripe.customers.update(existant, coordonnees);
      client = existant;
    } else {
      const cree = await stripe.customers.create({
        ...coordonnees,
        metadata: { restaurant_id: restaurantId },
      });
      client = cree.id;
    }
  } catch (erreur) {
    console.error("[abonnement/facturation]", erreur);
  }
  if (!client) retour("erreur");

  if (!existant) {
    const { error } = await createServiceClient()
      .from("restaurants")
      .update({ stripe_client_id: client })
      .eq("id", restaurantId);
    if (error) {
      console.error("[abonnement/facturation] client", error.message);
      retour(error.code === "42703" ? "migration" : "erreur");
    }
  }

  // Le numéro de TVA : Stripe en vérifie la forme, et on n'en garde qu'un.
  let tvaRefusee = true;
  try {
    const existants = await stripe.customers.listTaxIds(client!, {
      limit: 10,
    });
    const tvaActuelles = existants.data.filter((t) => t.type === "eu_vat");
    const dejaLa = tvaActuelles.some((t) => t.value === tva);
    for (const t of tvaActuelles) {
      if (t.value !== tva) await stripe.customers.deleteTaxId(client!, t.id);
    }
    if (tva && !dejaLa) {
      await stripe.customers.createTaxId(client!, {
        type: "eu_vat",
        value: tva,
      });
    }
    tvaRefusee = false;
  } catch (erreur) {
    console.error("[abonnement/facturation] tva", erreur);
  }
  if (tvaRefusee) retour("tva");

  revalidatePath(`/dashboard/${restaurantId}/abonnement`);
  retour("ok");
}
