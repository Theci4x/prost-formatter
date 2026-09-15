import { notFound } from "next/navigation";
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

// Renvoie un 404 plutôt qu'une redirection : inutile de signaler à un
// utilisateur connecté qu'une page d'administration existe.
export async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email?.toLowerCase();
  if (!email || !adminEmails().includes(email)) {
    notFound();
  }

  return email;
}
