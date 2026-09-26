import { NextResponse } from "next/server";

// TikTok (et potentiellement d'autres plateformes) demandent de placer un
// fichier de vérification de domaine sous cette URL, avec un nom qui change
// à chaque tentative (ex: tiktok<token>.txt). Plutôt que de committer un
// fichier statique par tentative, on génère la réponse dynamiquement à
// partir du nom demandé.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const filename = slug.filter(Boolean).pop() ?? "";
  const match = filename.match(/^tiktok([A-Za-z0-9]+)\.txt$/);

  if (!match) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(
    `tiktok-developers-site-verification=${match[1]}`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
