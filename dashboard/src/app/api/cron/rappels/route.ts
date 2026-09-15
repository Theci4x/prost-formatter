import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { jetonValide } from "@/lib/limites/publiques";
import { rappelerLesReservations } from "@/lib/courriel/rappel";

// Le rappel de la veille. Il tourne aussi depuis la tâche des options
// échues — les comptes Vercel Hobby ne tolèrent que deux tâches
// planifiées —, mais il garde sa propre adresse : pour le déclencher à la
// main, et pour le jour où le forfait permettra de le programmer seul, à
// une heure choisie plutôt qu'à quatre heures du matin.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/rappels] CRON_SECRET manquant");
    return NextResponse.json({ error: "non configuré" }, { status: 500 });
  }
  if (!jetonValide(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }

  const bilan = await rappelerLesReservations({
    supabase: createServiceClient(),
    maintenant: new Date(),
  });

  console.log(
    `[cron/rappels] ${bilan.envoyes} envoyé(s), ${bilan.echoues} en échec, ` +
      `${bilan.ignorees} ignoré(s) sur ${bilan.concernees} table(s)`,
  );
  return NextResponse.json(bilan);
}
