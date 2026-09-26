"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { COOKIE_LANGUE, estLangue } from "@/lib/i18n/langue";

/**
 * Change la langue du tableau de bord.
 *
 * La langue arrive par `bind` — voir la note dans `app/langue-actions.ts`,
 * qui explique pourquoi un champ de formulaire ne peut pas la porter.
 *
 * **Deux écritures, et la première est celle qui compte pour l'écran.**
 * Le témoin du navigateur est posé d'abord : il ne dépend d'aucun
 * service extérieur, il est relu au rendu suivant, et l'écran change
 * donc toujours. Le compte est mis à jour ensuite, pour que le choix
 * suive la personne sur un autre appareil — mais un appel à
 * l'authentification qui échoue ne doit pas laisser un restaurateur
 * cliquer trois fois sur « 中文 » sans que rien ne se passe. C'est
 * exactement ce qui arrivait : l'unique écriture allait dans les
 * métadonnées du compte, et son échec était avalé en silence.
 *
 * Le témoin est le même que celui du site public. Un restaurateur qui
 * lit le site en chinois retrouve donc son tableau de bord en chinois,
 * ce qui était déjà l'intention affichée de `langueVisiteur` — elle
 * n'était simplement branchée nulle part.
 */
export async function choisirLangue(demandee: string): Promise<void> {
  if (!estLangue(demandee)) return;

  (await cookies()).set(COOKIE_LANGUE, demandee, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    path: "/",
  });

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { langue: demandee },
  });
  // On journalise sans interrompre : l'écran a déjà changé grâce au
  // témoin, et seule la reprise sur un autre appareil est perdue.
  if (error) console.error("[choisirLangue]", error.message);

  revalidatePath("/dashboard");
}
