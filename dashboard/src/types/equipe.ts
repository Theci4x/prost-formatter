/**
 * Les rôles et leurs libellés, sans dépendance serveur : cette partie est
 * lue aussi par les formulaires, qui tournent dans le navigateur.
 */
export type Role = "proprietaire" | "gerant" | "service";

export const LIBELLES_ROLE: Record<Role, string> = {
  proprietaire: "Propriétaire",
  gerant: "Gérant",
  service: "Service",
};

export const DESCRIPTIONS_ROLE: Record<Role, string> = {
  proprietaire: "Tout, y compris l'abonnement et l'équipe.",
  gerant: "Tout le quotidien, sauf l'abonnement, Stripe et l'équipe.",
  service: "Les réservations et l'écran de salle, rien d'autre.",
};

export function peutGerer(role: Role | null): boolean {
  return role === "proprietaire" || role === "gerant";
}

export function estProprietaire(role: Role | null): boolean {
  return role === "proprietaire";
}
