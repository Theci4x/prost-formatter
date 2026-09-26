"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";
import { searchPlaces } from "@/lib/google/places";
import { trancher, type Candidat } from "@/lib/audit/correspondance";
import { mesurerEtablissement } from "@/lib/audit/mesure";
import { estLangue, type Lang } from "@/lib/i18n/testPresence";

export type EtatAuditProspection = {
  etat: "idle" | "choix" | "erreur";
  erreur?: string;
  candidats?: Candidat[];
  nom?: string;
  ville?: string;
  langue?: Lang;
};

/**
 * Audite un restaurant qu'on s'apprête à démarcher.
 *
 * Même recherche et même mesure que le test public ; rien n'est envoyé à
 * personne. Si le nom désigne plusieurs endroits, on rend la liste et on
 * choisit — un audit du voisin apporté au mauvais restaurateur ne se
 * rattrape pas.
 *
 * `requireAdmin` est rappelé ici : une action serveur est une adresse
 * publique, et celle-ci écrit avec la clé de service.
 */
export async function auditerPourProspection(
  _prev: EtatAuditProspection,
  formData: FormData,
): Promise<EtatAuditProspection> {
  await requireAdmin();

  const nom = String(formData.get("nom") ?? "").trim();
  const ville = String(formData.get("ville") ?? "").trim();
  const brut = String(formData.get("langue") ?? "").trim();
  const langue: Lang = estLangue(brut) ? brut : "fr";
  let placeId = String(formData.get("place_id") ?? "").trim();
  const valeurs = { nom, ville, langue };

  if (!nom || !ville) {
    return { etat: "erreur", erreur: "Nom et ville, les deux.", ...valeurs };
  }
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return {
      etat: "erreur",
      erreur: "GOOGLE_PLACES_API_KEY n'est pas configurée.",
      ...valeurs,
    };
  }

  if (!placeId) {
    let candidats;
    try {
      candidats = await searchPlaces(`${nom} ${ville}`);
    } catch (erreur) {
      console.error("[auditerPourProspection]", erreur);
      return {
        etat: "erreur",
        erreur: "Google Maps n'a pas répondu. Réessaie dans un instant.",
        ...valeurs,
      };
    }
    const verdict = trancher(
      candidats.map((place) => ({
        id: place.id,
        nom: place.displayName,
        adresse: place.formattedAddress,
      })),
      nom,
    );
    if ("aucun" in verdict) {
      return {
        etat: "erreur",
        erreur: "Introuvable sur Google Maps. Vérifie le nom et la ville.",
        ...valeurs,
      };
    }
    if ("choix" in verdict) {
      return { etat: "choix", candidats: verdict.choix, ...valeurs };
    }
    placeId = verdict.certain.id;
  }

  let id: string;
  try {
    const { audit, ligne } = await mesurerEtablissement(placeId, nom, ville);
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("visibility_audits")
      .insert({
        restaurant_name: audit.fiche?.nom ?? nom,
        ville,
        ...ligne,
        // Le rapport entier, tel qu'on le montre : la page publique le
        // relit sans refaire la mesure ni payer Google une seconde fois.
        raw_signals: { ...ligne.raw_signals, resultat: audit },
        origine: "prospection",
        jeton: randomBytes(18).toString("base64url"),
        langue,
      })
      .select("id")
      .single();
    if (error || !data) {
      console.error("[auditerPourProspection]", error);
      return {
        etat: "erreur",
        erreur:
          error?.code === "42703" || error?.code === "PGRST204"
            ? "La migration 0091_audits_prospection.sql n'est pas encore passée dans Supabase."
            : "L'audit n'a pas pu être enregistré.",
        ...valeurs,
      };
    }
    id = data.id as string;
  } catch (erreur) {
    console.error("[auditerPourProspection]", erreur);
    return {
      etat: "erreur",
      erreur: "L'audit a échoué. Réessaie dans un instant.",
      ...valeurs,
    };
  }

  revalidatePath("/admin");
  redirect(`/admin/audits/${id}`);
}
