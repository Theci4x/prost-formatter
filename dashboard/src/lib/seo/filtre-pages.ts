/**
 * Ne compter que les requêtes qui ont mené aux pages d'un établissement.
 *
 * La vitrine d'un restaurant vit sur klarr.net. La propriété Search
 * Console est donc la nôtre, et elle couvre tout le site : la page
 * d'accueil, le journal, les outils gratuits. Sans filtre, l'écran SEO de
 * Prost afficherait « logiciel réservation restaurant sans commission »
 * comme une requête de Prost — un chiffre flatteur et faux, exactement ce
 * qu'on reproche aux autres.
 *
 * Un établissement a trois pages publiques, toutes sous son slug :
 * /restaurant/{slug}, /reserver/{slug}, /carte/{slug}.
 */

const PAGES = ["restaurant", "reserver", "carte"] as const;

/** Les caractères qui auraient un sens dans une expression régulière. */
function echapper(texte: string): string {
  return texte.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type FiltrePages = {
  /**
   * L'expression régulière, précise : les trois pages, et rien d'autre.
   * « /restaurant/bar » ne doit pas attraper « /restaurant/bar-a-vin ».
   */
  motif: string;
  /**
   * Le repli si Search Console refuse l'expression : un simple « contient ».
   * Plus large — il attraperait « bar-a-vin » —, mais il rend des chiffres
   * là où l'écran n'en aurait aucun. On préfère un peu trop à rien.
   */
  repli: string;
};

export function filtrePagesDe(slug: string): FiltrePages {
  return {
    motif: `/(${PAGES.join("|")})/${echapper(slug)}(/|$|\\?)`,
    repli: `/${slug}`,
  };
}

/** « www.klarr.net », « klarr.net », « sc-domain:klarr.net » → « klarr.net ». */
function domaineNu(adresse: string): string | null {
  const sansPrefixe = adresse.replace(/^sc-domain:/, "");
  try {
    const hote = /^https?:\/\//.test(sansPrefixe)
      ? new URL(sansPrefixe).host
      : sansPrefixe;
    return hote.replace(/^www\./, "").toLowerCase() || null;
  } catch {
    return null;
  }
}

/**
 * La propriété choisie est-elle notre propre site ?
 *
 * Si oui, il faut filtrer sur les pages de l'établissement. Si c'est le
 * site du restaurateur — « https://monresto.fr/ » —, tout lui appartient
 * et le filtre n'a pas lieu d'être : ses chemins ne sont pas les nôtres.
 */
export function estNotreSite(propriete: string, notreAdresse: string): boolean {
  const a = domaineNu(propriete);
  const b = domaineNu(notreAdresse);
  return a !== null && b !== null && a === b;
}
