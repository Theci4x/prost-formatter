import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { lireSession } from "@/lib/supabase/session";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Ne pas retirer : cet appel revalide le jeton auprès de Supabase et
  // rafraîchit les cookies de session avant qu'ils n'expirent.
  const verdict = await lireSession(supabase);
  const user = verdict.etat === "connecte" ? verdict.user : null;

  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/auth");

  // « Injoignable » n'est pas « déconnecté ». On laisse passer : la mise
  // en page du tableau de bord sait le dire proprement, et renvoyer ici
  // vers l'écran de connexion ferait croire à une session perdue alors
  // qu'elle est intacte.
  if (
    verdict.etat === "deconnecte" &&
    request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (verdict.etat === "indecidable") {
    console.warn("[session] Supabase injoignable :", verdict.motif);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
