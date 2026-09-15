import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { jetonValide } from "@/lib/limites/publiques";
import { rattraperCourriels } from "@/lib/courriel/rattrapage";

// Un e-mail refusé au moment de la réservation ne repartait jamais. La
// table était prise, le carnet juste, et seul le client restait dans le
// noir — le genre de panne que personne ne remarque avant qu'un couvert
// se présente sans confirmation.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/courriels-en-echec] CRON_SECRET manquant");
    return NextResponse.json({ error: "non configuré" }, { status: 500 });
  }
  if (!jetonValide(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }

  const bilan = await rattraperCourriels({
    supabase: createServiceClient(),
    maintenant: new Date(),
  });

  console.log(
    `[cron/courriels-en-echec] ${bilan.examines} examiné(s), ` +
      `${bilan.renvoyes} renvoyé(s), ${bilan.echoues} en échec, ` +
      `${bilan.abandonnes} abandonné(s)`,
  );
  return NextResponse.json(bilan);
}
