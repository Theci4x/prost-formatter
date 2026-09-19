import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { jetonValide } from "@/lib/limites/publiques";
import { envoyerLesCampagnes } from "@/lib/campagnes/envoi";

export const maxDuration = 60;

// L'envoi des campagnes dues. Il tourne aussi depuis la tâche de
// réputation — les comptes Vercel Hobby ne tolèrent que deux tâches
// planifiées, et les deux sont prises —, mais il garde sa propre
// adresse : pour le déclencher à la main quand une campagne est en
// retard, et pour le jour où le forfait permettra de le programmer seul,
// à une heure choisie.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/campagnes] CRON_SECRET manquant");
    return NextResponse.json({ error: "non configuré" }, { status: 500 });
  }
  if (!jetonValide(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }

  const bilan = await envoyerLesCampagnes({ supabase: createServiceClient() });

  console.log(
    `[cron/campagnes] ${bilan.campagnes} campagne(s), ${bilan.envoyes} envoyé(s), ` +
      `${bilan.echoues} en échec${bilan.interrompu ? " — interrompu, reprise au prochain passage" : ""}`,
  );
  return NextResponse.json(bilan);
}
