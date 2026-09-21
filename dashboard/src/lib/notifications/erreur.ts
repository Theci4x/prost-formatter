import type { Notification } from "@/lib/notifications/interne";

/**
 * Ce qu'on se raconte quand un écran tombe en panne chez un client.
 *
 * Une erreur qui n'arrive qu'à un restaurateur, un vendredi à 20 h 40,
 * ne remonte jamais autrement : il n'appelle pas, il ferme
 * l'application. Le code affiché à l'écran ne dit rien à personne — il
 * faut le rapprocher des logs de l'hébergeur, au moment précis où l'on a
 * autre chose à faire. Ce fichier fait ce rapprochement à l'avance.
 *
 * Il est séparé du crochet Next qui l'appelle pour une raison simple :
 * ce qui se vérifie doit pouvoir s'appeler sans serveur.
 *
 * Deux règles tiennent tout le fichier :
 *
 * — **Rien de ce qui identifie ne sort.** Les en-têtes de la requête
 *   portent le cookie de session du restaurateur ; les envoyer par
 *   courriel reviendrait à poster sa clé de maison. On ne garde que le
 *   chemin, la méthode et la route.
 *
 * — **On ne hurle qu'une fois.** Une page cassée qui se recharge en
 *   boucle enverrait cent courriels en trois minutes, et la centième
 *   n'apprend rien que la première n'ait dit.
 */

/**
 * Les exceptions que Next lève pour se diriger lui-même. Ce ne sont pas
 * des pannes : `redirect()` et `notFound()` fonctionnent ainsi.
 */
const INTERNES = [
  "NEXT_REDIRECT",
  "NEXT_NOT_FOUND",
  "NEXT_HTTP_ERROR_FALLBACK",
  "DYNAMIC_SERVER_USAGE",
];

export type RequeteEnPanne = {
  path: string;
  method: string;
};

export type ContexteEnPanne = {
  routePath?: string;
  routeType?: string;
};

function digestDe(erreur: unknown): string | null {
  if (typeof erreur !== "object" || erreur === null) return null;
  if (!("digest" in erreur)) return null;
  const digest = (erreur as { digest?: unknown }).digest;
  return typeof digest === "string" || typeof digest === "number"
    ? String(digest)
    : null;
}

/** Vrai quand Next se sert de l'exception pour naviguer, pas pour signaler. */
export function estInterne(erreur: unknown): boolean {
  const digest = digestDe(erreur) ?? "";
  const message = erreur instanceof Error ? erreur.message : String(erreur);
  return INTERNES.some(
    (marque) => digest.startsWith(marque) || message.startsWith(marque),
  );
}

/**
 * Les premières lignes de la pile, sans le bruit du moteur.
 *
 * Six suffisent : au-delà on est dans React, et React n'a rien fait de
 * mal. Les chemins absolus de la machine de build sont raccourcis, ils
 * occupent la moitié de la ligne sans rien apprendre.
 */
function pileLisible(erreur: unknown): string[] {
  if (!(erreur instanceof Error) || !erreur.stack) return [];
  return (
    erreur.stack
      .split("\n")
      .slice(1)
      .map((ligne) => ligne.trim())
      .filter((ligne) => ligne.startsWith("at "))
      .filter((ligne) => !ligne.includes("node_modules/next/"))
      // Tout ce qui commence par « node: » est le moteur lui-même.
      .filter((ligne) => !/\bnode:/.test(ligne))
      .slice(0, 6)
      // Le préfixe du conteneur de l'hébergeur, qui occupe le tiers de la
      // ligne et n'apprend rien. Le reste des chemins est laissé intact.
      .map((ligne) => ligne.replace(/\/var\/task\//g, ""))
  );
}

/**
 * La note à s'envoyer, ou `null` quand il n'y a rien à dire.
 *
 * Le code est répété en tête : c'est le seul lien entre ce courriel et
 * la capture d'écran que le restaurateur vient d'envoyer.
 */
export function decrireErreur(
  erreur: unknown,
  requete: RequeteEnPanne,
  contexte: ContexteEnPanne = {},
): Notification | null {
  if (estInterne(erreur)) return null;

  const digest = digestDe(erreur);
  const message =
    erreur instanceof Error
      ? `${erreur.name} : ${erreur.message}`
      : String(erreur);

  // Le chemin peut porter une requête (« ?jour=… ») : elle aide à
  // reproduire, elle ne contient rien de secret.
  const lignes = [
    `Message : ${message}`,
    `Requête : ${requete.method} ${requete.path}`,
  ];
  if (contexte.routePath) {
    lignes.push(
      `Route : ${contexte.routePath}${
        contexte.routeType ? ` (${contexte.routeType})` : ""
      }`,
    );
  }
  if (digest) lignes.push(`Code affiché au restaurateur : ${digest}`);

  const pile = pileLisible(erreur);
  if (pile.length > 0) lignes.push("", ...pile);

  return {
    titre: `Erreur sur ${requete.path}`,
    lignes,
    // Une panne ne s'annonce pas dans le canal où l'on suit les
    // prospects : elle a le sien.
    canal: "bugs",
  };
}

/**
 * La clé sous laquelle une panne est « la même ».
 *
 * Le digest quand il existe — c'est exactement ce que Next considère
 * comme une même erreur —, sinon la route et le message.
 */
export function cleDErreur(
  erreur: unknown,
  requete: RequeteEnPanne,
  contexte: ContexteEnPanne = {},
): string {
  const digest = digestDe(erreur);
  if (digest) return `digest:${digest}`;
  const message = erreur instanceof Error ? erreur.message : String(erreur);
  return `${contexte.routePath ?? requete.path}|${message}`;
}

/** Dix minutes : assez pour éteindre une boucle, trop court pour cacher une rechute. */
export const FENETRE_SILENCE_MS = 10 * 60 * 1000;

/**
 * Le registre des pannes déjà signalées.
 *
 * En mémoire, donc propre à une instance : sur un hébergeur qui en
 * démarre plusieurs, quelques doublons passeront. C'est assumé — le but
 * est d'éviter les cent courriels, pas d'en garantir exactement un.
 */
const dernierEnvoi = new Map<string, number>();

export function aSignaler(
  cle: string,
  maintenant = Date.now(),
  fenetre = FENETRE_SILENCE_MS,
): boolean {
  const precedent = dernierEnvoi.get(cle);
  if (precedent !== undefined && maintenant - precedent < fenetre) return false;

  dernierEnvoi.set(cle, maintenant);
  // Le registre ne doit pas grossir indéfiniment dans un serveur qui vit
  // longtemps : on oublie ce qui est sorti de la fenêtre.
  for (const [ancienne, instant] of dernierEnvoi) {
    if (maintenant - instant >= fenetre) dernierEnvoi.delete(ancienne);
  }
  return true;
}

/** Pour les vérifications : repartir d'un registre vide. */
export function oublierTout(): void {
  dernierEnvoi.clear();
}
