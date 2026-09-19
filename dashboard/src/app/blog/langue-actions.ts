"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_LANGUE, estLangue } from "@/lib/i18n/langue";
import { adressePour } from "@/lib/blog/traductions";
import { cheminJournal } from "@/types/blog";

/**
 * Changer de langue dans le journal, c'est changer de page.
 *
 * Ailleurs sur le site, une langue est un dictionnaire : la même adresse
 * se recalcule dans l'autre langue, et poser le témoin suffit. Le journal
 * ne marche pas comme ça — chaque traduction est un article à son adresse,
 * indexé pour lui-même. Y poser le témoin sans bouger laissait le lecteur
 * devant le même texte chinois, persuadé que le bouton était cassé.
 *
 * La destination se calcule ici, à partir du slug français. On aurait pu
 * la faire passer par le formulaire : c'est précisément ce qu'il ne faut
 * pas faire. Tout ce qui vient d'un formulaire vient du visiteur, et une
 * redirection vers une adresse fournie par le visiteur est une porte
 * ouverte — on la lui tend, il y met l'adresse qu'il veut, et notre nom
 * de domaine sert d'escorte vers ailleurs. Le slug, lui, est vérifié :
 * s'il ne correspond à rien, il ne redirige nulle part.
 *
 * `redirect` depuis une action est ce que la documentation prévoit pour
 * ce cas : navigation côté client quand JavaScript est là, réponse 303
 * quand il ne l'est pas. Le menu fonctionne donc aussi sans script.
 */
export async function choisirLangueJournal(
  /** Le slug français de l'article ouvert, ou `null` sur un index. */
  article: string | null,
  demandee: string,
): Promise<void> {
  if (!estLangue(demandee)) return;

  (await cookies()).set(COOKIE_LANGUE, demandee, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    path: "/",
  });

  // L'article dans la langue demandée quand il y existe ; sinon l'index
  // de cette langue. Renvoyer vers la version française d'un article non
  // traduit reviendrait à répondre « non » à quelqu'un qui vient de
  // demander à lire autre chose que du français.
  const destination =
    (article ? adressePour(article, demandee) : null) ??
    cheminJournal(demandee);

  // Hors de tout `try` : `redirect` passe par une exception, et un `catch`
  // l'avalerait (la documentation le signale).
  redirect(destination);
}
