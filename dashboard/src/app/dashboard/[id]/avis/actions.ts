"use server";

import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exiger } from "@/lib/equipe/roles";
import {
  searchTripadvisorLocations,
  type TripadvisorLocation,
} from "@/lib/reviews/tripadvisor";

export type DraftState = {
  draft: string | null;
  error: string | null;
  // Incrémenté à chaque proposition : le champ de saisie s'en sert comme clé
  // React pour repartir du nouveau texte, y compris quand Claude renvoie mot
  // pour mot la proposition précédente.
  version: number;
};

/** La réponse est publique et signée : on la cadre une fois, ici. */
const CONSIGNES_REPONSE =
  "Tu écris la réponse publique d'un restaurant à un avis client, publiée " +
  "sous l'avis sur la plateforme indiquée.\n\n" +
  "- Réponds dans la langue de l'avis : un avis en anglais reçoit une " +
  "réponse en anglais, un avis en espagnol une réponse en espagnol. En " +
  "français, vouvoie le client.\n" +
  "- Parle au nom de l'équipe, à la première personne du pluriel.\n" +
  "- Trois à cinq phrases. Remercie, reprends un détail précis de l'avis " +
  "pour montrer qu'il a été lu.\n" +
  "- Sur un avis négatif ou mitigé, reconnais le problème sans te " +
  "justifier longuement et propose de poursuivre en privé par téléphone ou " +
  "par e-mail, sans inventer de coordonnées.\n" +
  "- Sans commentaire écrit, deux phrases de remerciement suffisent.\n" +
  "- N'invente aucun fait sur le restaurant, ne promets aucun geste " +
  "commercial, ne cite aucun prix.\n" +
  "- Termine par une signature au nom de l'équipe du restaurant, " +
  "correctement accordée et dans la langue de la réponse : « L'équipe du " +
  "Comptoir » pour Le Comptoir, « The Comptoir team » en anglais.\n\n" +
  "Réponds uniquement par le texte de la réponse, sans guillemets ni " +
  "commentaire.";

export async function draftReply(
  prevState: DraftState,
  formData: FormData,
): Promise<DraftState> {
  const version = prevState.version + 1;
  const restaurantId = formData.get("restaurant_id") as string;
  const author = String(formData.get("author") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 0);
  const text = String(formData.get("text") ?? "").trim();
  const plateforme = String(formData.get("plateforme") ?? "").trim();

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      draft: null,
      error:
        "La rédaction automatique nécessite une clé d'API Anthropic, pas encore configurée.",
      version,
    };
  }

  const supabase = await createClient();
  // La RLS garantit que ce restaurant appartient bien à l'utilisateur
  // connecté : sans ça, n'importe qui pourrait faire rédiger des réponses
  // au nom d'un établissement qui n'est pas le sien.
  const { data } = await supabase
    .from("restaurants")
    .select("nom, type_cuisine")
    .eq("id", restaurantId)
    .maybeSingle();

  const restaurant = data as {
    nom: string;
    type_cuisine: string | null;
  } | null;
  if (!restaurant) {
    return { draft: null, error: "Restaurant introuvable.", version };
  }

  try {
    const client = new Anthropic();
    // Une réponse courte : peu d'effort suffit. La réflexion, active par
    // défaut sur ce modèle, prend sur `max_tokens` : 600 risquait de
    // couper avant la réponse. Le repli côté serveur prend le relais si
    // le modèle décline, plutôt que de laisser le restaurateur sans rien.
    const requete = {
      model: "claude-opus-5",
      max_tokens: 4000,
      output_config: { effort: "low" as const },
      system: CONSIGNES_REPONSE,
      messages: [
        {
          role: "user" as const,
          content:
            `Restaurant : ${restaurant.nom}` +
            (restaurant.type_cuisine ? ` (${restaurant.type_cuisine})` : "") +
            `\nPlateforme : ${plateforme || "non précisée"}` +
            `\n\nAvis de ${author || "un client"}, noté ${rating}/5 :\n\n` +
            (text || "(note sans commentaire écrit)"),
        },
      ],
    };
    // Le repli est une fonction bêta : si l'API la refusait un jour, la
    // rédaction ne doit pas tomber avec elle. On relance alors sans.
    const response = await client.beta.messages
      .create({
        ...requete,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
      })
      .catch((erreur: unknown) => {
        if (erreur instanceof Anthropic.BadRequestError) {
          console.error(
            "[draftReply] repli refusé, appel simple",
            erreur.message,
          );
          return client.beta.messages.create(requete);
        }
        throw erreur;
      });

    if (response.stop_reason === "refusal") {
      return {
        draft: null,
        error:
          "Klarr n'a pas pu proposer de réponse à cet avis. Écris-la toi-même, ou réessaie.",
        version,
      };
    }

    const draft = response.content
      .filter(
        (block): block is Anthropic.Beta.BetaTextBlock => block.type === "text",
      )
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!draft) {
      return {
        draft: null,
        error: "La rédaction n'a rien donné. Réessaie dans un instant.",
        version,
      };
    }
    return { draft, error: null, version };
  } catch (err) {
    console.error("[draftReply]", err);
    return {
      draft: null,
      error: "La rédaction a échoué. Réessaie dans un instant.",
      version,
    };
  }
}

/**
 * Le restaurateur a publié la réponse sur la plateforme : on le retient.
 *
 * C'est ce qui sort l'avis de la liste « sans réponse ». Le texte est
 * gardé tel qu'il l'a publié, retouches comprises, pour qu'il le
 * retrouve — et, le jour où Klarr publiera lui-même, pour que
 * l'historique soit déjà là.
 */
export async function marquerRepondu(formData: FormData): Promise<void> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const cle = String(formData.get("cle") ?? "").slice(0, 300);
  const reponse = String(formData.get("reponse") ?? "").trim();
  if (!restaurantId || !cle || !reponse) return;

  await exiger(restaurantId, "gerant");

  const note = Number(formData.get("note") ?? 0);
  const supabase = await createClient();
  const { error } = await supabase.from("restaurant_avis_reponses").upsert({
    restaurant_id: restaurantId,
    cle,
    plateforme: String(formData.get("plateforme") ?? "").slice(0, 40),
    auteur: String(formData.get("auteur") ?? "").slice(0, 200) || null,
    note: note >= 1 && note <= 5 ? Math.round(note) : null,
    reponse,
    source: "manuel",
    repondu_le: new Date().toISOString(),
  });
  if (error) console.error("[avis/marquerRepondu]", error.message);

  revalidatePath(`/dashboard/${restaurantId}/avis`);
}

/** Défaire « répondu » : l'avis revient dans la liste à traiter. */
export async function annulerReponse(formData: FormData): Promise<void> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const cle = String(formData.get("cle") ?? "");
  if (!restaurantId || !cle) return;

  await exiger(restaurantId, "gerant");

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_avis_reponses")
    .delete()
    .eq("restaurant_id", restaurantId)
    .eq("cle", cle);
  if (error) console.error("[avis/annulerReponse]", error.message);

  revalidatePath(`/dashboard/${restaurantId}/avis`);
}

/**
 * La confirmation de l'établissement Tripadvisor.
 *
 * Klarr devine — nom plus adresse — et le restaurateur tranche. La
 * devinette suffit la plupart du temps et ne demande rien à personne ;
 * ces deux actions n'existent que pour le jour où elle se trompe. Ce
 * jour-là, sans elles, il n'y avait rien à faire : l'écran annonçait les
 * avis d'un homonyme, ou aucun, et c'était sans appel.
 */

export type RechercheState = {
  candidats: TripadvisorLocation[] | null;
  error: string | null;
};

export async function chercherSurTripadvisor(
  _prevState: RechercheState,
  formData: FormData,
): Promise<RechercheState> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const requete = String(formData.get("requete") ?? "").trim();

  if (!restaurantId)
    return { candidats: null, error: "Établissement inconnu." };
  if (requete.length < 3) {
    return { candidats: null, error: "Donne au moins trois caractères." };
  }

  await exiger(restaurantId, "gerant");

  try {
    const candidats = await searchTripadvisorLocations(requete);
    if (candidats.length === 0) {
      return {
        candidats: [],
        error: "Aucun établissement trouvé. Essaie en ajoutant la ville.",
      };
    }
    return { candidats, error: null };
  } catch (erreur) {
    console.error("[avis/chercherSurTripadvisor]", erreur);
    return {
      candidats: null,
      error: "Tripadvisor n'a pas répondu. Réessaie dans un instant.",
    };
  }
}

export async function epinglerTripadvisor(formData: FormData): Promise<void> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const locationId = String(formData.get("location_id") ?? "").trim();
  if (!restaurantId) return;

  await exiger(restaurantId, "gerant");

  const supabase = await createClient();
  await supabase
    .from("restaurants")
    // Une chaîne vide détache : le restaurateur revient à la recherche
    // automatique s'il s'est trompé en confirmant.
    // La date de relevé s'efface avec : la page Avis ne lit plus que le
    // relevé de nuit, et c'est ce qui fait passer cet établissement en
    // tête de la file dès la nuit suivante, au lieu d'attendre son tour.
    .update({
      tripadvisor_location_id: locationId || null,
      reputation_relevee_le: null,
    })
    .eq("id", restaurantId);
  // La devinette s'efface à part : la colonne n'existe qu'après la
  // migration 0078, et son absence ne doit pas faire échouer la
  // confirmation elle-même. Effacée, elle laisse la place à l'établissement
  // confirmé — ou à une nouvelle recherche si l'on revient en arrière.
  await supabase
    .from("restaurants")
    .update({ tripadvisor_location_devine: null })
    .eq("id", restaurantId);

  revalidatePath(`/dashboard/${restaurantId}/avis`);
}
