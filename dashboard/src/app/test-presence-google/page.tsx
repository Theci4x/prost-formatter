import { TestPresencePage } from "@/components/prospects/TestPresencePage";

import type { Metadata } from "next";

// Une page de connexion ou de formulaire technique n'a rien à faire dans
// un index : elle ne répond à aucune recherche et dilue le site.
export const metadata: Metadata = {
  title: "Test de présence Google",
  robots: { index: false, follow: false },
};


export default function TestPresenceGooglePage() {
  return <TestPresencePage />;
}
