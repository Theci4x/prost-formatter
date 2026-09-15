import type { FormeTable, TypeRepere } from "@/types/plan";

/**
 * Le dessin d'un élément du plan. Partagé par l'éditeur et l'écran de
 * service : ce qu'on dessine en configurant doit être exactement ce qu'on
 * reconnaît en plein coup de feu.
 */

export function classesForme(forme: FormeTable): string {
  if (forme === "ronde" || forme === "haute") return "rounded-full";
  if (forme === "carree") return "rounded-md";
  if (forme === "banquette") return "rounded-sm";
  return "rounded-lg";
}

/**
 * Une banquette est adossée : le trait épais marque le dossier, sinon elle
 * se confond avec une table rectangulaire. Une table haute est cerclée de
 * pointillés, comme les tabourets autour.
 */
export function bordureForme(forme: FormeTable): string {
  if (forme === "banquette") return "border-2 border-b-[6px]";
  if (forme === "haute") return "border-2 border-dashed";
  return "border";
}

export function classesRepere(type: TypeRepere): string {
  if (type === "mur") return "rounded-none bg-zinc-400 border-zinc-500";
  if (type === "poteau") return "rounded-full bg-zinc-400 border-zinc-500";
  if (type === "bar") return "rounded-lg bg-amber-100 border-amber-300";
  if (type === "entree")
    return "rounded-none bg-emerald-100 border-emerald-300 border-dashed";
  return "rounded-md bg-zinc-100 border-zinc-300";
}
