"use server";

import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";
import { envoyerCourriel } from "@/lib/courriel/envoyer";
import { echapper, enveloppe, type Bloc } from "@/lib/courriel/messages";
import {
  adresseIp,
  consommer,
  empreinte,
  secretEmpreinte,
} from "@/lib/limites/publiques";
import { langueVisiteur } from "@/lib/i18n/langue";
import { AVIS } from "@/lib/i18n/avis";

export type RetourState = { error: string | null; envoye: boolean };

/**
 * Deux par visiteur et par jour, un par établissement.
 *
 * On dit une fois ce qu'on a sur le cœur. Au-delà, ce n'est plus un
 * client qui parle — et la boîte du restaurateur doit rester lisible,
 * sans quoi il cessera de l'ouvrir.
 */
const RETOURS_PAR_JOUR = 2;
const RETOURS_PAR_RESTAURANT = 1;

export async function envoyerRetour(
  _prevState: RetourState,
  formData: FormData,
): Promise<RetourState> {
  const slug = String(formData.get("slug") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();

  // Le formulaire était traduit, ses refus non : le client lisait tout
  // dans sa langue sauf la phrase qui lui demandait de recommencer.
  const a = AVIS[await langueVisiteur()];

  if (!message) return { error: a.ditNousQuoi, envoye: false };
  if (message.length > 4000) {
    return { error: a.messageTropLong, envoye: false };
  }

  // La clé de service : la table n'est pas ouverte en écriture au public,
  // le compteur de limites est le seul portier.
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("restaurants")
    .select("id, nom, email_contact")
    .eq("slug_reservation", slug)
    .maybeSingle();

  const restaurant = data as {
    id: string;
    nom: string;
    email_contact: string | null;
  } | null;

  // Message volontairement identique à celui d'un envoi réussi : dire
  // « cet établissement n'existe pas » renseignerait qui tape au hasard.
  if (!restaurant) return { error: null, envoye: true };

  const entetes = await headers();
  const visiteur = empreinte(
    "retour",
    adresseIp(entetes),
    entetes.get("user-agent") ?? "",
    secretEmpreinte(),
  );
  const [sousPlafond, sousPlafondMaison] = await Promise.all([
    consommer(supabase, visiteur, RETOURS_PAR_JOUR),
    consommer(supabase, `${visiteur}:${restaurant.id}`, RETOURS_PAR_RESTAURANT),
  ]);
  if (!sousPlafond || !sousPlafondMaison) {
    return {
      error:
        "Ton message a déjà été transmis. Le restaurant te répondra si tu as laissé un moyen de te joindre.",
      envoye: false,
    };
  }

  const { error } = await supabase.from("restaurant_retours").insert({
    restaurant_id: restaurant.id,
    message,
    contact: contact || null,
  });

  if (error) {
    console.error("[avis/retour]", error.message);
    return { error: a.envoiImpossible, envoye: false };
  }

  // Prévenir tout de suite : un retour lu trois jours plus tard ne rattrape
  // plus rien, et c'est justement ce qu'on cherchait à rattraper.
  if (restaurant.email_contact) {
    const suite = contact
      ? `Il laisse ce contact : ${contact}`
      : "Il n'a pas laissé de contact.";
    // Le message du client dans l'encadré, tel quel, ligne par ligne :
    // c'est lui qu'on vient lire, le reste n'est que le cadre.
    const blocs: Bloc[] = [
      `<strong>Un client de ${echapper(restaurant.nom)} vous écrit.</strong>`,
      { encadre: message.split(/\r?\n/).filter(Boolean) },
      echapper(suite),
    ];
    await envoyerCourriel({
      destinataire: restaurant.email_contact,
      repondreA: contact.includes("@") ? contact : undefined,
      sujet: `Un client vous écrit — ${restaurant.nom}`,
      texte: `${message}\n\n${suite}`,
      html: enveloppe(blocs, "Klarr"),
    });
  }

  return { error: null, envoye: true };
}
