import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { jetonValide } from "@/lib/limites/publiques";
import { demanderLesAvis } from "@/lib/courriel/apresVisite";

export const maxDuration = 300;

/**
 * La demande d'avis du lendemain, en fin de matinée : assez tard pour ne
 * pas arriver au réveil, assez tôt pour que le repas soit encore frais.
 * La tâche tourne à 9 h UTC, soit 11 h à Paris l'été et 10 h l'hiver.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/avis-apres-visite] CRON_SECRET manquant");
    return NextResponse.json({ error: "non configuré" }, { status: 500 });
  }
  if (!jetonValide(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }

  const bilan = await demanderLesAvis({
    supabase: createServiceClient(),
    maintenant: new Date(),
  });
  console.log(
    `[cron/avis-apres-visite] ${bilan.envoyes} envoyé(s), ${bilan.echoues} en échec, ` +
      `${bilan.ignorees} ignoré(s) sur ${bilan.concernees} table(s) d'hier`,
  );
  return NextResponse.json(bilan);
}
