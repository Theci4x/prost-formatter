import { SqueletteEcran } from "@/components/dashboard/SqueletteEcran";

/**
 * Ce que Next affiche pendant qu'un écran du tableau de bord se fabrique.
 *
 * Posé à la racine de `/dashboard`, il couvre tout ce qui est en dessous :
 * l'en-tête et le bandeau restent en place — ils vivent dans le `layout`,
 * que ce fichier n'enveloppe pas — et seule la zone de travail passe au
 * squelette.
 *
 * Il a un deuxième effet, moins visible et plus important : un écran
 * dynamique sans `loading` ne se précharge pas. Avec lui, le navigateur
 * a déjà la coquille en main quand le doigt arrive, et la bascule est
 * immédiate au lieu d'attendre l'aller-retour jusqu'à la base.
 */
export default function ChargementDashboard() {
  return <SqueletteEcran />;
}
