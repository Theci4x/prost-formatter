import type { Instrumentation } from "next";

/**
 * Le crochet que Next appelle quand le serveur attrape une erreur.
 *
 * Il ne contient aucune logique : tout ce qui se décide — faut-il le
 * dire, quoi dire, l'a-t-on déjà dit — vit dans `lib/notifications/
 * erreur.ts`, où ça se vérifie sans serveur.
 *
 * Deux précautions valent la peine d'être dites ici :
 *
 * — **Le chargement est tardif.** Ce fichier est compilé pour les deux
 *   moteurs d'exécution, celui de Node et celui de la bordure ; le canal
 *   d'alerte, lui, est marqué `server-only`. L'importer en haut de
 *   fichier ferait entrer un module serveur dans un paquet qui n'en veut
 *   pas. On ne va le chercher qu'au moment où l'on en a besoin, et
 *   seulement sous Node.
 *
 * — **Rien ne remonte.** Une panne dans le signalement d'une panne ne
 *   doit pas devenir la panne. Tout est sous `try`.
 */
export const onRequestError: Instrumentation.onRequestError = async (
  erreur,
  requete,
  contexte,
) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  try {
    const { aSignaler, cleDErreur, decrireErreur } =
      await import("@/lib/notifications/erreur");

    const note = decrireErreur(erreur, requete, contexte);
    // `null` : Next se sert de l'exception pour naviguer — une
    // redirection, une page absente. Ce n'est pas une panne.
    if (!note) return;

    if (!aSignaler(cleDErreur(erreur, requete, contexte))) return;

    const { notifierInterne } = await import("@/lib/notifications/interne");
    await notifierInterne(note);
  } catch (cause) {
    console.error("[instrumentation] signalement impossible", cause);
  }
};
