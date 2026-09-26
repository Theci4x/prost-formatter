import type { Illustration, Source } from "@/types/blog";

/**
 * Une actualité du secteur : une plateforme qui ferme, un rachat, une loi
 * qui passe.
 *
 * Ce n'est pas un billet du journal. Un billet répond à une question qu'on
 * se pose une fois (« faut-il un diagnostic amiante ») et reste vrai des
 * années ; une actualité répond à « qu'est-ce qui vient de se passer, et
 * qu'est-ce que je dois faire », et vieillit. D'où une rubrique à part,
 * et deux règles de plus :
 *
 * - **Sourcée, toujours.** On parle d'entreprises réelles, souvent de
 *   concurrents. Chaque fait renvoie à un communiqué ou à un article de
 *   presse ; ce qu'on ne sait pas, on l'écrit comme tel.
 * - **Datée, et tenue.** Quand la situation change (un rachat conclu, un
 *   texte voté), on met à jour `misAJourLe` et le texte, plutôt que de
 *   laisser dire une chose fausse sous une date ancienne.
 */
export type Actualite = {
  slug: string;
  titre: string;
  /** Une phrase : c'est elle qui s'affiche dans Google sous le titre. */
  resume: string;
  /** Format ISO. */
  publieLe: string;
  misAJourLe: string;
  /**
   * L'image d'en-tête. Une illustration, jamais une photo de l'événement :
   * pas de logo, pas de marque, et la légende le dit — une image générée
   * qu'on laisserait passer pour un reportage serait un mensonge de plus
   * dans un article qui parle d'entreprises réelles.
   */
  image: Illustration;
  /** Ce qu'il faut retenir, en trois ou quatre lignes, avant le texte. */
  essentiel: string[];
  sources: Source[];
  markdown: string;
};
