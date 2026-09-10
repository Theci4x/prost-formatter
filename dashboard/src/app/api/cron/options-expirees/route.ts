import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

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
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
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
  return NextResponse.json({ expirees });
}
