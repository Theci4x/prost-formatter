import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

/**
 * Tout ce qui lit une session — et rien d'autre.
 *
 * Le filtre garde volontairement les pages : plusieurs d'entre elles
 * lisent la session pendant leur rendu (`/`, `/admin`, `/aide/contact`,
 * `/nouveau-mot-de-passe`, tout `/dashboard`), et un composant serveur ne
 * peut pas écrire de cookie. C'est donc ici, et seulement ici, que la
 * session se rafraîchit : retirer une de ces pages du filtre, c'est la
 * condamner à rafraîchir un jeton qu'elle ne pourra pas ranger.
 *
 * Ce qui sort, en revanche, n'a jamais eu de session à tenir :
 *
 * - **`/api/*`** — un gestionnaire de route écrit ses cookies par
 *   `cookies()` de next/headers, que Next applique à la réponse quelle
 *   qu'elle soit : il se rafraîchit tout seul, correctement. Et les
 *   webhooks de Stripe comme les tâches de nuit n'ont pas d'utilisateur
 *   du tout — ils déclenchaient pourtant un appel à Supabase chacun.
 * - **`/sw.js` et `/manifest.webmanifest`** — demandés par le navigateur,
 *   jamais par quelqu'un.
 * - **`/widget.js`** — le module de réservation, chargé par les sites des
 *   restaurants : leurs visiteurs n'ont pas de session chez nous.
 *
 * Ce n'est pas qu'une économie. Supabase fait tourner le jeton de
 * rafraîchissement à chaque usage : au démarrage à froid de l'application
 * installée, le téléphone demande le document, le manifeste, le service
 * worker et une route d'API *en même temps*. Quatre passages ici, quatre
 * rafraîchissements concurrents avec le même jeton — le premier gagne,
 * les autres reçoivent « Already Used ». Si le perdant est le document du
 * tableau de bord, on atterrit sur l'écran de connexion sans avoir rien
 * fait.
 */
export const config = {
  matcher: [
    "/((?!api|sw\\.js|widget\\.js|manifest\\.webmanifest|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json)$).*)",
  ],
};
