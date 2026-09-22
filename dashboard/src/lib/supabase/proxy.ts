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

  /**
   * Une redirection qui emporte la session avec elle.
   *
   * `NextResponse.redirect()` fabrique une réponse neuve : les cookies
   * posés sur `supabaseResponse` juste au-dessus n'y sont pas. Or
   * `getUser()` vient peut-être de faire tourner le jeton de
   * rafraîchissement — Supabase les fait tourner à chaque usage, et ne
   * rend l'ancien utilisable que quelques secondes.
   *
   * Sans ce report, le navigateur repart donc avec l'ancien jeton, déjà
   * consommé côté Supabase. Le prochain appel reçoit « Invalid Refresh
   * Token: Already Used » — une vraie erreur d'authentification, pas une
   * panne de réseau — et le restaurateur se retrouve à l'écran de
   * connexion sans avoir rien fait.
   *
   * C'est ce qui déconnectait tout seul, et la protection contre les
   * coupures réseau ne pouvait rien pour ça : de son point de vue, la
   * session était bel et bien perdue.
   */
  const rediriger = (chemin: string) => {
    const url = request.nextUrl.clone();
    url.pathname = chemin;
    const reponse = NextResponse.redirect(url);
    for (const cookie of supabaseResponse.cookies.getAll()) {
      reponse.cookies.set(cookie);
    }
    return reponse;
  };
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
    return rediriger("/login");
  }

  if (verdict.etat === "indecidable") {
    console.warn("[session] Supabase injoignable :", verdict.motif);
  }

  // Celle-ci était la coupable : un restaurateur déjà connecté qui ouvre
  // « / » ou « /login » — ce que fait l'application installée à chaque
  // démarrage à froid — se faisait renvoyer vers son tableau de bord en
  // perdant au passage les cookies tout juste rafraîchis.
  if (user && isAuthRoute) {
    return rediriger("/dashboard");
  }

  return supabaseResponse;
}
