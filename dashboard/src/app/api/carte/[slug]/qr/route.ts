import { createServiceClient } from "@/lib/supabase/service";
import { qrPng, qrSvg } from "@/lib/menu/qr";
import { chargerAcces } from "@/lib/abonnement/acces";

/**
 * Le QR code de la carte, à télécharger pour l'imprimer. PNG par défaut —
 * c'est ce qu'attendent les imprimeurs et les outils de mise en page ;
 * `?format=svg` pour du vectoriel.
 *
 * Servi seulement si la carte est publiée : un QR qui mène à une page
 * inexistante, collé sur trente tables, est pire qu'un QR absent.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const format =
    new URL(request.url).searchParams.get("format") === "svg" ? "svg" : "png";

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("restaurants")
    .select("id, nom, carte_publique")
    .eq("slug_reservation", slug)
    .maybeSingle();

  const restaurant = data as {
    id: string;
    nom: string;
    carte_publique: boolean;
  } | null;
  if (!restaurant?.carte_publique) {
    return new Response("Carte non publiée", { status: 404 });
  }

  // Le QR mène à « la carte de X », qui exige le module de visibilité.
  // Masquer le bouton n'y suffirait pas : cette adresse se devine à partir
  // du slug, et un QR imprimé qui ouvre une 404 vit sur trente tables.
  const acces = await chargerAcces(restaurant.id, supabase);
  if (!acces.ouvert.visibilite) {
    return new Response("Carte non publiée", { status: 404 });
  }

  const nomFichier = `qr-carte-${slug}.${format}`;
  const entetes = {
    "Content-Disposition": `attachment; filename="${nomFichier}"`,
    // Le QR ne dépend que du slug : il ne change jamais pour une carte
    // donnée. Inutile de le recalculer à chaque impression.
    "Cache-Control": "public, max-age=86400",
  };

  if (format === "svg") {
    return new Response(await qrSvg(slug), {
      headers: { ...entetes, "Content-Type": "image/svg+xml" },
    });
  }

  const png = await qrPng(slug);
  return new Response(new Uint8Array(png), {
    headers: { ...entetes, "Content-Type": "image/png" },
  });
}
