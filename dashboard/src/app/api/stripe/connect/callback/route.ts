import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { connecterCompte, lireEtat } from "@/lib/stripe/connect";

export async function GET(request: NextRequest) {
  const parametres = request.nextUrl.searchParams;
  const code = parametres.get("code");
  const etat = parametres.get("state");
  const cookie = request.cookies.get("stripe_connect_state")?.value;

  const restaurantId = lireEtat(etat, cookie);

  const rendre = (url: URL) => {
    const response = NextResponse.redirect(url);
    response.cookies.delete("stripe_connect_state");
    return response;
  };
  const echec = (motif: string) =>
    rendre(
      new URL(
        restaurantId
          ? `/dashboard/${restaurantId}/connexions?stripe_error=${motif}`
          : `/dashboard?stripe_error=${motif}`,
        request.url,
      ),
    );

  // L'état ne correspond pas au cookie : requête forgée, ou onglet resté
  // ouvert trop longtemps. Dans les deux cas on ne connecte rien.
  if (!restaurantId) return echec("etat");

  // Stripe renvoie une erreur quand le restaurateur annule sur leur écran.
  if (parametres.get("error")) return echec("annule");
  if (!code) return echec("code");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return rendre(new URL("/login", request.url));

  // L'identifiant vient de l'état : il est revérifié en base, la politique
  // RLS ne renvoyant que les restaurants de l'utilisateur connecté.
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("id", restaurantId)
    .maybeSingle();
  if (!restaurant) return echec("acces");

  try {
    const compte = await connecterCompte(code);

    const { error } = await supabase
      .from("restaurant_stripe_connexions")
      .upsert(
        {
          restaurant_id: restaurantId,
          stripe_account_id: compte.accountId,
          nom_affiche: compte.nomAffiche,
          paiements_actifs: compte.paiementsActifs,
          dossier_complet: compte.dossierComplet,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "restaurant_id" },
      );
    if (error) throw error;

    return rendre(
      new URL(
        `/dashboard/${restaurantId}/connexions?stripe_connecte=1`,
        request.url,
      ),
    );
  } catch (erreur) {
    console.error("[stripe/connect/callback]", erreur);
    return echec("echange");
  }
}
