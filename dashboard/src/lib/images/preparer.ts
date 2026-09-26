/**
 * Préparer une photo dans le navigateur, avant de l'envoyer.
 *
 * Deux échecs opposés arrivaient au même endroit, et le second est le
 * plus vicieux parce qu'il ne dit rien.
 *
 * **Trop lourd.** Une photo sortie d'un téléphone pèse 3 à 8 Mo pour une
 * vignette affichée à 96 pixels de côté. On refusait au-delà de 4 Mo, ce
 * qui était juste mais peu aimable : le restaurateur devait aller
 * redimensionner ailleurs.
 *
 * **Trop petit.** Une image récupérée sur une page web fait souvent 250
 * pixels de large et 30 Ko. Elle passait tous les contrôles, elle
 * s'enregistrait, et elle ressortait floue sur la carte. Rien ne
 * l'avait signalé, parce que rien ne regardait ses dimensions — et
 * personne ne devine qu'un fichier accepté est inutilisable.
 *
 * Ici on ouvre l'image, on mesure, et on tranche — mais en **deux**
 * seuils, pas un seul, et c'est la leçon de la première version. Un
 * plancher unique calé sur l'affichage idéal (800 px de côté pour une
 * carte en pleine largeur à trois points par pixel) refusait la plupart
 * des photos qu'on trouve sur le web, qui font 600 à 800 px : le
 * restaurateur en essayait vingt pour en faire passer une. Un outil qui
 * refuse vingt fois n'est pas exigeant, il est cassé.
 *
 * Donc : **on refuse** ce qui est franchement inutilisable, et **on
 * prévient** pour ce qui passera en étant un peu mou. Dans les deux cas
 * on donne les dimensions trouvées — « trop petite » sans chiffre laisse
 * essayer trois fois la même chose. Au-dessus, on réduit et on réencode,
 * donc la question du poids ne se pose plus jamais.
 *
 * Le recadrage, lui, n'a pas lieu ici. L'affichage est carré aujourd'hui
 * (`object-cover`), mais découper au moment de l'envoi détruirait
 * l'original : le jour où la carte montre des photos plus larges, il n'y
 * aurait plus rien à reprendre.
 */

export type PhotoPreparee = {
  ok: true;
  fichier: File;
  largeur: number;
  hauteur: number;
  /** Vrai si l'image a été réduite ou réencodée. */
  retravaillee: boolean;
  /**
   * Acceptée, mais en dessous du confortable : elle s'affichera, un peu
   * molle sur un grand écran. On le dit sans bloquer — voir le commentaire
   * du fichier.
   */
  juste: boolean;
};

export type PhotoRefusee = {
  ok: false;
  motif: "illisible" | "trop-petite";
  largeur?: number;
  hauteur?: number;
};

export type Options = {
  /** En dessous, on refuse : l'image est inutilisable, pas seulement juste. */
  minCote: number;
  /** En dessous, on accepte mais on prévient. */
  conseilCote: number;
  /** Plafond sur le plus grand côté, en pixels. */
  maxCote: number;
  /** Qualité JPEG, de 0 à 1. */
  qualite?: number;
};

/** Les dimensions d'un fichier image, ou rien s'il ne s'ouvre pas. */
async function mesurer(fichier: File): Promise<{
  source: ImageBitmap | HTMLImageElement;
  l: number;
  h: number;
} | null> {
  // `createImageBitmap` applique l'orientation EXIF : sans elle, une
  // photo prise à la verticale repartirait couchée.
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(fichier, {
        imageOrientation: "from-image",
      });
      return { source: bitmap, l: bitmap.width, h: bitmap.height };
    } catch {
      // Un navigateur qui ne connaît pas l'option la refuse en bloc :
      // on retente sans elle plutôt que d'abandonner.
      try {
        const bitmap = await createImageBitmap(fichier);
        return { source: bitmap, l: bitmap.width, h: bitmap.height };
      } catch {
        /* on tombe sur la méthode suivante */
      }
    }
  }

  const url = URL.createObjectURL(fichier);
  try {
    const image = await new Promise<HTMLImageElement>((resoudre, rejeter) => {
      const element = new Image();
      element.onload = () => resoudre(element);
      element.onerror = () => rejeter(new Error("illisible"));
      element.src = url;
    });
    return { source: image, l: image.naturalWidth, h: image.naturalHeight };
  } catch {
    return null;
  } finally {
    // L'URL n'est révoquée qu'après le chargement : la révoquer avant
    // ferait échouer l'image sur les navigateurs lents.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

export async function preparerPhoto(
  fichier: File,
  { minCote, conseilCote, maxCote, qualite = 0.85 }: Options,
): Promise<PhotoPreparee | PhotoRefusee> {
  const mesure = await mesurer(fichier);
  if (!mesure) return { ok: false, motif: "illisible" };

  const { source, l, h } = mesure;
  const petitCote = Math.min(l, h);
  const grandCote = Math.max(l, h);

  if (petitCote < minCote) {
    if ("close" in source) source.close();
    return { ok: false, motif: "trop-petite", largeur: l, hauteur: h };
  }

  const juste = petitCote < conseilCote;

  // Assez petite et déjà légère : on n'y touche pas. Réencoder une image
  // correcte ne fait que lui enlever de la qualité.
  const dejaBonne = grandCote <= maxCote && fichier.size <= 600 * 1024;
  if (dejaBonne) {
    if ("close" in source) source.close();
    return {
      ok: true,
      fichier,
      largeur: l,
      hauteur: h,
      retravaillee: false,
      juste,
    };
  }

  const facteur = Math.min(1, maxCote / grandCote);
  const largeur = Math.round(l * facteur);
  const hauteur = Math.round(h * facteur);

  try {
    const toile = document.createElement("canvas");
    toile.width = largeur;
    toile.height = hauteur;
    const pinceau = toile.getContext("2d");
    if (!pinceau) throw new Error("pas de contexte");
    pinceau.drawImage(source, 0, 0, largeur, hauteur);

    const blob = await new Promise<Blob | null>((resoudre) =>
      toile.toBlob(resoudre, "image/jpeg", qualite),
    );
    if (!blob) throw new Error("pas de blob");

    return {
      ok: true,
      fichier: new File([blob], "photo.jpg", { type: "image/jpeg" }),
      largeur,
      hauteur,
      retravaillee: true,
      juste,
    };
  } catch {
    // Le navigateur ne sait pas réencoder : l'original a déjà passé le
    // contrôle de dimensions, on le laisse partir tel quel. Le plafond
    // de poids du serveur reste là pour le cas extrême.
    return {
      ok: true,
      fichier,
      largeur: l,
      hauteur: h,
      retravaillee: false,
      juste,
    };
  } finally {
    if ("close" in source) source.close();
  }
}

/** Un poids lisible, pour dire ce qu'on vient de faire. */
export function poidsLisible(octets: number): string {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}
