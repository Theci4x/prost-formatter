"use server";

import { cookies } from "next/headers";
import { COOKIE_LANGUE, estLangue } from "@/lib/i18n/langue";

/**
 * La langue demandée arrive par `bind`, et non par un champ de
 * formulaire. Ce n'est pas un détail de style : React se sert du `name`
 * et du `value` d'un bouton portant `formAction` pour y coder l'identité
 * de l'action — la doc de Next le signale au détour d'une note sur les
 * clés « $ACTION_ ». Un `name="langue"` y est donc écrasé, `formData.get`
 * rend `null`, et le sélecteur ne fait rien du tout, sans la moindre
 * erreur. C'est ce qui s'est passé. `bind` est la façon documentée de
 * passer un argument, et elle fonctionne sans JavaScript.
 */

/**
 * Le choix de langue d'un visiteur, avant qu'il ait un compte.
 *
 * Un an de conservation : quelqu'un qui revient trois mois plus tard ne
 * doit pas avoir à rechoisir. Pas de donnée personnelle dedans — c'est
 * une préférence d'affichage, au même titre qu'un contraste.
 */
export async function choisirLangueVisiteur(demandee: string): Promise<void> {
  if (!estLangue(demandee)) return;

  (await cookies()).set(COOKIE_LANGUE, demandee, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    path: "/",
  });

  // Pas de `revalidatePath` ici, et c'est délibéré.
  //
  // Il y en avait un — « / », type « layout » —, qui invalidait bien plus
  // que la page d'accueil : la documentation précise qu'un layout
  // invalide « tous les layouts imbriqués en dessous et toutes les pages
  // en dessous d'eux », c'est-à-dire le site entier. Les articles du
  // journal, pré-générés, étaient donc jetés à chaque clic sur un
  // drapeau, et se reconstruisaient à la visite suivante.
  //
  // Rien ne le remplace parce que rien n'en a besoin : les pages qui
  // lisent ce témoin sont toutes rendues à la demande, et l'action
  // renvoie de toute façon la page recalculée à celui qui vient de
  // cliquer.
}
