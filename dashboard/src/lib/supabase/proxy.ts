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
    // Chaque renvoi à l'écran de connexion laisse une ligne dans les
    // journaux, avec sa cause. « Je suis encore déconnecté » ne se
    // diagnostique pas à l'aveugle : sans cookie de session, c'est le
    // téléphone qui a tout oublié ; avec, c'est Supabase qui a refusé le
    // jeton, et le motif dit pourquoi. Rien de secret ici — ni jeton, ni
    // adresse, seulement le nom des cookies et la réponse de Supabase.
    const cookiesSession = request.cookies
      .getAll()
      .filter((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"))
      .map((c) => c.name);
    console.warn("[session] renvoyé à la connexion", {
      chemin: request.nextUrl.pathname,
      motif: verdict.motif ?? "aucune erreur (pas de session)",
      cookies: cookiesSession.length > 0 ? cookiesSession : "aucun",
      appli: request.headers.get("sec-fetch-dest") ?? null,
      navigateur: (request.headers.get("user-agent") ?? "").slice(0, 120),
    });
    // La cause voyage aussi avec la redirection, et l'écran de connexion
    // l'affiche en petit. Les journaux Vercel ne gardent les lignes
    // qu'une heure sur l'offre gratuite : « je me suis fait déconnecter ce
    // matin » n'y laisse plus rien. Une capture d'écran, si. Seulement un
    // code, jamais le jeton.
    const motif =
      cookiesSession.length === 0
        ? "sans_cookie"
        : verdict.code
          ? verdict.code.replace(/[^a-z_]/gi, "").slice(0, 40)
          : "sans_session";
    const url = request.nextUrl.clone();
    const suite = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("motif", motif);
    url.searchParams.set("suite", suite);
    const reponse = NextResponse.redirect(url);
    for (const cookie of supabaseResponse.cookies.getAll()) {
      reponse.cookies.set(cookie);
    }
    return reponse;
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
