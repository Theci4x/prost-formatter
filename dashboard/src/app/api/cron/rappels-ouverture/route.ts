import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { jetonValide } from "@/lib/limites/publiques";
import { notifierInterne } from "@/lib/notifications/interne";

/**
 * Le rappel promis, le mois venu.
 *
 * **Cette tâche n'écrit à personne d'autre qu'à nous.** Elle prévient
 * l'équipe qu'untel ouvre ce mois-ci ; c'est un humain qui décroche. Un
 * envoi automatique à quelqu'un qui a laissé son adresse il y a huit
 * mois arriverait comme un message de robot — exactement ce que Klarr
 * reproche aux plateformes — et le formulaire promet qu'« on vous
 * recontacte », pas qu'« un automate vous écrira ».
 *
 * Elle ratisse un peu large, trente jours devant : une ouverture se
 * décale toujours, et il vaut mieux appeler trois semaines trop tôt —
 * c'est le moment où le carnet se choisit — que trois jours trop tard,
 * quand il l'est déjà.
 *
 * `rappele_le` est posé même si la notification échoue en partie, mais
 * seulement si quelque chose est parti : sans cette nuance, une panne de
 * Slack ferait perdre silencieusement le seul rappel qu'on ait promis.
 */
export const dynamic = "force-dynamic";

/** Combien de jours devant on regarde. */
const FENETRE_JOURS = 30;
/** Un garde-fou : au-delà, c'est qu'une requête a mal tourné. */
const PLAFOND = 50;

type Ligne = {
  id: string;
  email: string;
  nom: string | null;
  etablissement: string | null;
  ville: string | null;
  date_ouverture: string;
  source: string | null;
};

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/rappels-ouverture] CRON_SECRET manquant");
    return NextResponse.json({ error: "non configuré" }, { status: 500 });
  }
  if (!jetonValide(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const limite = new Date(Date.now() + FENETRE_JOURS * 86400000)
    .toISOString()
    .slice(0, 10);

  const { data, error } = await supabase
    .from("rappels_ouverture")
    .select("id, email, nom, etablissement, ville, date_ouverture, source")
    .is("rappele_le", null)
    .is("retire_le", null)
    .lte("date_ouverture", limite)
    .order("date_ouverture")
    .limit(PLAFOND);

  if (error) {
    console.error("[cron/rappels-ouverture]", error);
    return NextResponse.json({ error: "lecture impossible" }, { status: 500 });
  }

  const lignes = (data ?? []) as Ligne[];
  if (lignes.length === 0) {
    return NextResponse.json({ concernes: 0, prevenus: 0 });
  }

  let prevenus = 0;
  for (const ligne of lignes) {
    const bilan = await notifierInterne({
      titre: `Ouverture proche — ${ligne.etablissement || ligne.nom || ligne.email}`,
      lignes: [
        `Ouverture annoncée le ${ligne.date_ouverture}.`,
        "",
        ligne.nom || "Nom non précisé.",
        ligne.email,
        ligne.etablissement
          ? `Établissement : ${ligne.etablissement}`
          : "Établissement non précisé.",
        ligne.ville ? `Ville : ${ligne.ville}` : "Ville non précisée.",
        "",
        `Il avait demandé à être recontacté, depuis « ${ligne.source ?? "inconnue"} ».`,
        "C'est le moment où le carnet se choisit.",
      ],
      repondreA: ligne.email,
    });

    // Rien n'est parti : on laisse la ligne en attente pour la prochaine
    // exécution. La promesse ne se perd pas sur une panne.
    if (bilan.courriels === 0 && !bilan.slack) continue;

    prevenus++;
    const { error: marque } = await supabase
      .from("rappels_ouverture")
      .update({ rappele_le: new Date().toISOString() })
      .eq("id", ligne.id);
    if (marque) console.error("[cron/rappels-ouverture] marque", marque);
  }

  return NextResponse.json({ concernes: lignes.length, prevenus });
}
