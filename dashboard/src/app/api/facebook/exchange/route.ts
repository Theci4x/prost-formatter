import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  getUserPages,
  getPageDetails,
} from "@/lib/facebook/oauth";

// Appelé côté client une fois que FB.login() (SDK JavaScript, "Facebook
// Login for Business") a renvoyé un code d'autorisation. Le secret d'app
// ne pouvant pas vivre côté navigateur, l'échange du code contre un token
// et les appels Graph API se font ici, côté serveur.
export async function POST(request: Request) {
  const { code, restaurantId } = (await request.json()) as {
    code?: string;
    restaurantId?: string;
  };

  if (!code || !restaurantId) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("id", restaurantId)
    .maybeSingle();
  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant introuvable" }, { status: 404 });
  }

  try {
    const shortLivedToken = await exchangeCodeForToken(code);
    const userToken = await exchangeForLongLivedToken(shortLivedToken);

    const pages = await getUserPages(userToken);
    const page = pages[0];
    if (!page) {
      throw new Error("Aucune page Facebook trouvée pour cet utilisateur");
    }

    const details = await getPageDetails(page.id, page.accessToken);

    const { error } = await supabase.from("social_connections").upsert(
      {
        restaurant_id: restaurantId,
        facebook_page_id: page.id,
        facebook_page_name: page.name,
        facebook_page_access_token: page.accessToken,
        instagram_business_account_id: details.instagramBusinessAccountId,
        instagram_username: details.instagramUsername,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "restaurant_id" },
    );
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[facebook/exchange]", err);
    return NextResponse.json(
      { error: "La connexion a échoué. Réessaie." },
      { status: 500 },
    );
  }
}
