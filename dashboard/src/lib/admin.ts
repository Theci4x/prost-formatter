import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Liste blanche d'adresses, séparées par des virgules. Vide = personne n'est
// admin : en cas de variable oubliée à un déploiement, l'espace se ferme au
// lieu de s'ouvrir à tous.
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

// Un utilisateur connecté qui n'est pas admin reçoit un 404 plutôt qu'une
// redirection : inutile de lui signaler qu'une page d'administration
// existe.
//
// Personne de connecté, en revanche, et la page le demande : on l'envoie
// se connecter, avec de quoi revenir. Devoir passer par la connexion,
// atterrir sur le tableau de bord puis retaper /admin, c'était trois
// étapes pour en faire une. Le 404 ne cachait rien à ce visiteur-là —
// la page de connexion est la même pour tout le monde.
export async function requireAdmin(
  /** Le chemin où revenir une fois connecté ; absent, un 404. */
  versConnexion?: string,
): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && versConnexion) {
    redirect(`/login?suite=${encodeURIComponent(versConnexion)}`);
  }

  const email = user?.email?.toLowerCase();
  if (!email || !adminEmails().includes(email)) {
    notFound();
  }

  return email;
}
