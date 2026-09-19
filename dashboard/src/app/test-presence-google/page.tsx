import { TestPresencePage } from "@/components/prospects/TestPresencePage";
import { langueIndexable } from "@/lib/i18n/langue";
import type { Lang } from "@/lib/i18n/testPresence";

import type { Metadata } from "next";

// Une page de connexion ou de formulaire technique n'a rien à faire dans
// un index : elle ne répond à aucune recherche et dilue le site.
export const metadata: Metadata = {
  title: "Test de présence Google",
  robots: { index: false, follow: false },
};

/**
 * Cette page avait son propre sélecteur, en état local, qui repartait du
 * français à chaque visite. Quelqu'un qui choisissait 中文 sur l'accueil
 * puis cliquait « 免费检测我的 Google 曝光 » atterrissait en français.
 *
 * Le témoin du site donne donc la langue de départ. Le sélecteur de la
 * page reste — il est instantané, là où celui de l'accueil fait un
 * aller-retour — et reporte son choix dans le témoin, pour que la suite
 * de la visite s'en souvienne.
 */
export default async function TestPresenceGooglePage() {
  const langue = (await langueIndexable()) as Lang;
  return <TestPresencePage initiale={langue} />;
}
