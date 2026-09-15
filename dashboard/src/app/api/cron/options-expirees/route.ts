import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { jetonValide } from "@/lib/limites/publiques";
import { rattraperCourriels } from "@/lib/courriel/rattrapage";
import { rappelerLesReservations } from "@/lib/courriel/rappel";

// Les options échues ne bloquent déjà plus la jauge — le moteur de
// disponibilité les ignore. Cette tâche ne fait que le dire : sans elle, une
// demande morte reste affichée « en attente » et le restaurateur croit avoir
// une décision à prendre.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/options-expirees] CRON_SECRET manquant");
    return NextResponse.json({ error: "non configuré" }, { status: 500 });
  }
  if (!jetonValide(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("restaurant_reservations")
    .update({ statut: "expiree" })
    .eq("statut", "demande")
    .lt("option_expire_le", new Date().toISOString())
    .select("id");

  if (error) {
    console.error("[cron/options-expirees]", error);
    return NextResponse.json({ error: "mise à jour impossible" }, { status: 500 });
  }

  const expirees = data?.length ?? 0;
  console.log(`[cron/options-expirees] ${expirees} option(s) échue(s)`);

  // Le rattrapage des e-mails voyage avec cette tâche plutôt que dans la
  // sienne : les comptes Vercel Hobby ne tolèrent que deux tâches
  // planifiées, une fois par jour chacune. Les deux traitements sont
  // indépendants — celui-ci ne peut pas empêcher l'autre d'avoir eu lieu,
  // puisqu'il vient après — et `/api/cron/courriels-en-echec` reste
  // appelable seul, pour un rattrapage à la demande ou le jour où l'on
  // passe à un forfait qui autorise l'heure.
  const courriels = await rattraperCourriels({ supabase, maintenant: new Date() });
  console.log(
    `[cron/options-expirees] courriels : ${courriels.renvoyes} renvoyé(s), ` +
      `${courriels.echoues} en échec, ${courriels.abandonnes} abandonné(s)`,
  );

  // Les rappels viennent après le rattrapage, et non l'inverse : un
  // rappel qui échoue ce soir doit pouvoir être repris demain, pas
  // retenté dans la seconde alors que la panne dure encore.
  const rappels = await rappelerLesReservations({
    supabase,
    maintenant: new Date(),
  });
  console.log(
    `[cron/options-expirees] rappels : ${rappels.envoyes} envoyé(s), ` +
      `${rappels.echoues} en échec, ${rappels.ignorees} ignoré(s) ` +
      `sur ${rappels.concernees} table(s) de demain`,
  );

  return NextResponse.json({ expirees, courriels, rappels });
}
