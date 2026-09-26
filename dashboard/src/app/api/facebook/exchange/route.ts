import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  exchangeForLongLivedToken,
  getUserPages,
  getPageDetails,
  getPermissions,
} from "@/lib/facebook/oauth";

// Appelé côté client une fois que FB.login() (SDK JavaScript, "Facebook
// Login for Business") a renvoyé un token utilisateur (flux implicite).
// Le secret d'app ne pouvant pas vivre côté navigateur, l'échange en token
// longue durée et les appels Graph API se font ici, côté serveur.
export async function POST(request: Request) {
  const { accessToken, restaurantId, pageId } = (await request.json()) as {
    accessToken?: string;
    restaurantId?: string;
    pageId?: string;
  };

  if (!accessToken || !restaurantId) {
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
    const userToken = await exchangeForLongLivedToken(accessToken);

    const pages = await getUserPages(userToken);
    if (pages.length === 0) {
      // Meta ne signale pas une autorisation manquante : il répond « rien »
      // avec un aplomb parfait. Le message dit donc ce qui a été accordé,
      // parce que c'est la seule chose qui distingue « pas de Page » de
      // « pas le droit de voir les Pages ».
      const { accordees, refusees } = await getPermissions(userToken);
      console.log(
        "[facebook] autorisations accordées :",
        accordees.join(", ") || "aucune",
        "| refusées :",
        refusees.join(", ") || "aucune",
      );

      if (!accordees.includes("pages_show_list")) {
        throw new Error(
          "Facebook n'a pas accordé l'accès aux Pages. Relance la connexion, " +
            "choisis « Modifier les paramètres », et coche la Page du " +
            `restaurant dans l'écran « Pages ». (Accordé : ${
              accordees.join(", ") || "rien"
            }.)`,
        );
      }

      throw new Error(
        "Aucune Page Facebook accessible avec ce compte. Vérifie que tu es " +
          "bien administrateur de la Page du restaurant, et que tu l'as " +
          `cochée dans l'écran d'autorisations. (Accordé : ${accordees.join(", ")}.)`,
      );
    }

    // Plusieurs Pages disponibles et aucune n'a encore été choisie : on
    // renvoie la liste pour que l'utilisateur sélectionne la bonne, plutôt
    // que de connecter arbitrairement la première (peu fiable dès qu'un
    // restaurateur gère plus d'une Page).
    let page = pages[0];
    if (pages.length > 1) {
      if (!pageId) {
        return NextResponse.json({
          pages: pages.map((p) => ({ id: p.id, name: p.name })),
        });
      }
      const selected = pages.find((p) => p.id === pageId);
      if (!selected) {
        return NextResponse.json({ error: "Page introuvable" }, { status: 400 });
      }
      page = selected;
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
    const message = err instanceof Error ? err.message : "La connexion a échoué. Réessaie.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
