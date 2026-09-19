/**
 * Les langues de Klarr : leurs codes et leurs noms.
 *
 * Séparées de `langue.ts` parce que le sélecteur de la page d'accueil est
 * un composant client, et qu'il a besoin des noms. `langue.ts`, lui, lit
 * le témoin et le compte — il porte « server-only », et rien de ce qui
 * touche aux en-têtes d'une requête ne doit pouvoir partir dans un
 * navigateur.
 */

export const LANGUES = ["fr", "en", "zh"] as const;
export type Langue = (typeof LANGUES)[number];

export const NOM_LANGUE: Record<Langue, string> = {
  fr: "Français",
  en: "English",
  zh: "中文",
};

export function estLangue(valeur: unknown): valeur is Langue {
  return (LANGUES as readonly unknown[]).includes(valeur);
}

/** Deux caractères, pour un sélecteur qui doit tenir dans une barre de nav. */
export const CODE_LANGUE: Record<Langue, string> = {
  fr: "FR",
  en: "EN",
  zh: "中文",
};
