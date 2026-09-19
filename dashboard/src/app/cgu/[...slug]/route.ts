import { NextResponse } from "next/server";

// Voir dashboard/src/app/confidentialite/[...slug]/route.ts — même besoin
// pour l'URL des CGU.
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
