"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { estLangue } from "@/lib/i18n/langue";

/**
 * Change la langue du compte.
 *
 * La langue arrive par `bind` — voir la note dans `app/langue-actions.ts`,
 * qui explique pourquoi un champ de formulaire ne peut pas la porter.
 *
 * Rangée dans les métadonnées de l'utilisateur : elle le suit d'un
 * établissement à l'autre, et ne demande aucune migration. Un échec ne
 * dit rien à l'écran — au pire la langue ne change pas, ce qui se voit
 * tout seul et ne mérite pas une page d'erreur.
 */
export async function choisirLangue(demandee: string): Promise<void> {
  if (!estLangue(demandee)) return;

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { langue: demandee },
  });
  if (error) {
    console.error("[choisirLangue]", error.message);
    return;
  }
  revalidatePath("/dashboard");
}
