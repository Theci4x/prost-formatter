import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Le désabonnement en un clic, celui du bouton natif des messageries.
 *
 * Gmail et Outlook affichent leur propre bouton « Se désabonner » quand
 * le message porte les deux en-têtes `List-Unsubscribe` et
 * `List-Unsubscribe-Post`. Ils appellent alors cette adresse en POST,
 * sans ouvrir de page. C'est le chemin que prend la majorité des gens —
 * et surtout : celui qu'ils prennent à la place du bouton « Courrier
 * indésirable », qui, lui, abîme la réputation du domaine pour tous les
 * restaurants qui le partagent.
 *
 * POST seulement, et c'est délibéré. Les antivirus et les aperçus de
 * messagerie visitent les liens en GET ; une désinscription déclenchée
 * par un robot couperait quelqu'un qui n'a rien demandé. La page
 * `/desabonnement/[jeton]`, elle, reste là pour les humains.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ jeton: string }> },
) {
  const { jeton } = await params;

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("restaurant_contacts")
    .update({ desabonne_le: new Date().toISOString() })
    .eq("jeton", jeton);

  if (error) {
    console.error("[api/desabonnement]", error.message);
    return new NextResponse("Erreur", { status: 500 });
  }

  // Deux-cents dans tous les cas où la base a répondu, y compris pour un
  // jeton inconnu : la messagerie n'a pas à savoir si l'adresse figurait
  // dans un fichier, et un 404 le lui dirait.
  return new NextResponse(null, { status: 200 });
}
