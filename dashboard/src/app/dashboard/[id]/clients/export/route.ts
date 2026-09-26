import { createClient } from "@/lib/supabase/server";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import { enCsv, type Fiche } from "@/lib/contacts/fiches";

/**
 * Le fichier client en CSV.
 *
 * Les mêmes verrous que l'écran : `exiger` et `exigerModule` d'abord,
 * puis la lecture avec la clé du visiteur — les politiques de la vue
 * refusent d'elles-mêmes un établissement qui n'est pas le sien. Une
 * route d'export qui se contenterait de l'identifiant dans l'adresse
 * serait une fuite de fichier client à la portée d'une URL devinée.
 *
 * Le fichier part en entier et non page par page : c'est ce qu'on attend
 * d'un export. Le plafond de cinq mille lignes n'est pas une limite de
 * produit mais de mémoire — au-delà, il faudra paginer le flux, et
 * personne n'y est encore.
 */
const PLAFOND = 5000;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await exiger(id, "gerant");
  await exigerModule(id, "reservations");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("restaurant_contacts_fiches")
    .select("*")
    .eq("restaurant_id", id)
    .order("derniere_venue", { ascending: false, nullsFirst: false })
    .limit(PLAFOND);

  if (error) {
    console.error("[export clients]", error.message);
    return new Response("Export indisponible.", { status: 500 });
  }

  const jour = new Date().toISOString().slice(0, 10);
  return new Response(enCsv((data ?? []) as Fiche[]), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="clients-${jour}.csv"`,
      // Un fichier client n'a rien à faire dans un cache partagé.
      "Cache-Control": "private, no-store",
    },
  });
}
