"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { COOKIE_LANGUE, estLangue } from "@/lib/i18n/langue";

/**
 * Le choix de langue d'un visiteur, avant qu'il ait un compte.
 *
 * Un an de conservation : quelqu'un qui revient trois mois plus tard ne
 * doit pas avoir à rechoisir. Pas de donnée personnelle dedans — c'est
 * une préférence d'affichage, au même titre qu'un contraste.
 */
export async function choisirLangueVisiteur(formData: FormData): Promise<void> {
  const demandee = formData.get("langue");
  if (!estLangue(demandee)) return;

  (await cookies()).set(COOKIE_LANGUE, demandee, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    path: "/",
  });
  revalidatePath("/", "layout");
}
