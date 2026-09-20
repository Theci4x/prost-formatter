import { createServiceClient } from "@/lib/supabase/service";
import {
  adresseIp,
  consommer,
  empreinte,
  RAPPELS_PAR_JOUR,
  secretEmpreinte,
} from "@/lib/limites/publiques";

/**
 * « Recontactez-moi le mois de mon ouverture. »
 *
 * Contrairement au rappel du Commis, qui part directement vers la
 * messagerie de l'équipe sans rien garder, celui-ci **doit** être
 * enregistré : la personne demande à être recontactée dans six ou douze
 * mois, et aucune boîte de réception ne se souvient d'une demande vieille
 * d'un an. Un message Slack de janvier ne rappellera personne en
 * septembre.
 *
 * Trois règles tiennent ce fichier.
 *
 * **Une personne, une ligne.** Re-remplir le formulaire corrige la date
 * au lieu d'empiler des doublons qu'on rappellerait trois fois. C'est
 * l'index unique sur l'adresse, et le `upsert` ici.
 *
 * **Une date d'ouverture crédible.** Dans le passé, elle n'a plus de
 * sens ; à dix ans, c'est une saisie en l'air ou un robot. On refuse
 * poliment plutôt que de remplir la table de lignes qu'on ne rappellera
 * jamais.
 *
 * **Qui s'est retiré reste retiré.** Le `upsert` ne réveille pas une
 * ligne portant `retire_le` : c'est précisément pour ça qu'on garde la
 * ligne au lieu de l'effacer.
 */
export const dynamic = "force-dynamic";

function texte(brut: unknown, max = 120): string {
  return typeof brut === "string" ? brut.trim().slice(0, max) : "";
}

function reponse(message: string, statut = 200): Response {
  return new Response(message, {
    status: statut,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

/** Ni hier, ni dans dix ans. */
const JOURS_MAX = 365 * 3;

export async function POST(request: Request) {
  let corps: unknown;
  try {
    corps = await request.json();
  } catch {
    return reponse("Requête illisible.", 400);
  }

  const c = corps as Record<string, unknown>;
  const email = texte(c?.email).toLowerCase();
  const nom = texte(c?.nom);
  const etablissement = texte(c?.etablissement);
  const ville = texte(c?.ville, 80);
  const source = texte(c?.source, 40) || "inconnue";
  const dateBrute = texte(c?.date_ouverture, 10);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return reponse("Cette adresse e-mail ne semble pas valide.", 400);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateBrute)) {
    return reponse("Indiquez une date d'ouverture, même approximative.", 400);
  }

  const ouverture = new Date(`${dateBrute}T12:00:00`);
  if (Number.isNaN(ouverture.getTime())) {
    return reponse("Cette date ne se lit pas.", 400);
  }
  const jours = (ouverture.getTime() - Date.now()) / 86400000;
  if (jours < -1) {
    return reponse(
      "Cette date est passée. Si vous êtes déjà ouvert, écrivez-nous plutôt à contact@klarr.net.",
      400,
    );
  }
  if (jours > JOURS_MAX) {
    return reponse(
      "Au-delà de trois ans, revenez nous voir quand le projet se précisera.",
      400,
    );
  }

  const entetes = request.headers;
  const visiteur = empreinte(
    "ouverture",
    adresseIp(entetes),
    entetes.get("user-agent") ?? "",
    secretEmpreinte(),
  );
  const supabase = createServiceClient();
  if (!(await consommer(supabase, visiteur, RAPPELS_PAR_JOUR))) {
    return reponse("Nous avons déjà votre demande.", 429);
  }

  // Qui s'est retiré reste retiré : on ne réveille pas sa ligne.
  const { data: existante } = await supabase
    .from("rappels_ouverture")
    .select("id, retire_le")
    .eq("email", email)
    .maybeSingle();

  if (existante && (existante as { retire_le: string | null }).retire_le) {
    // On répond comme si c'était fait. Dire « vous vous êtes désinscrit »
    // à quelqu'un qui tape l'adresse d'un tiers révélerait qu'elle est
    // chez nous.
    return reponse("ok");
  }

  const { error } = await supabase.from("rappels_ouverture").upsert(
    {
      email,
      nom: nom || null,
      etablissement: etablissement || null,
      ville: ville || null,
      date_ouverture: dateBrute,
      consentement_le: new Date().toISOString(),
      source,
      // Une date corrigée rouvre le droit au rappel : quelqu'un qui
      // repousse son ouverture de mars à septembre doit être rappelé en
      // septembre, pas considéré comme traité.
      rappele_le: null,
    },
    { onConflict: "email" },
  );

  if (error) {
    console.error("[ouverture/rappel]", error);
    return reponse(
      "L'enregistrement a échoué. Écrivez-nous à contact@klarr.net.",
      502,
    );
  }

  return reponse("ok");
}
