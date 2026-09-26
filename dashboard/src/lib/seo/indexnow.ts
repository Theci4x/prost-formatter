import "server-only";

/**
 * IndexNow : prévenir les moteurs qu'une page vient de changer.
 *
 * Sans lui, une page publiée attend que le robot repasse — des jours, des
 * semaines pour un domaine jeune. Avec lui, Bing (et Yandex, Seznam,
 * Naver) sont prévenus le jour même. Bing compte plus qu'il n'y paraît :
 * c'est son index que lisent la recherche de ChatGPT, Copilot et
 * DuckDuckGo — les assistants dont Klarr mesure justement les réponses.
 * Google n'utilise pas IndexNow ; pour lui, le plan du site suffit.
 *
 * La clé n'est pas un secret : le protocole exige qu'elle soit publiée,
 * dans `public/<clé>.txt`, pour prouver que le domaine est le nôtre.
 */
export const CLE_INDEXNOW = "4b8a8c0772818c0177759a6ffd86a59b";

const POINT_D_ENTREE = "https://api.indexnow.org/indexnow";

/** Le protocole accepte jusqu'à 10 000 adresses par envoi. */
const PAR_ENVOI = 10_000;

export type BilanIndexNow = { envoyees: number; statuts: number[] };

export async function prevenirIndexNow(
  site: string,
  adresses: string[],
): Promise<BilanIndexNow> {
  const hote = new URL(site).host;
  // Une adresse d'un autre domaine ferait refuser tout l'envoi.
  const propres = [
    ...new Set(adresses.filter((a) => new URL(a).host === hote)),
  ];
  const statuts: number[] = [];

  for (let i = 0; i < propres.length; i += PAR_ENVOI) {
    const lot = propres.slice(i, i + PAR_ENVOI);
    const reponse = await fetch(POINT_D_ENTREE, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: hote,
        key: CLE_INDEXNOW,
        keyLocation: `${site}/${CLE_INDEXNOW}.txt`,
        urlList: lot,
      }),
    });
    // 200 et 202 : reçu. 422 : adresses hors domaine ou clé introuvable —
    // ce qui arrive tant que le fichier de clé n'est pas encore en ligne.
    statuts.push(reponse.status);
  }

  return { envoyees: propres.length, statuts };
}
