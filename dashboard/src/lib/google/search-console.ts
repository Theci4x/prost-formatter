const SC_BASE_URL = "https://searchconsole.googleapis.com/webmasters/v3";

/**
 * Google Search Console — en lecture seule.
 *
 * C'est la seule source qui dise ce que les gens tapent *réellement* pour
 * trouver un établissement. Tout le reste — le choix des mots-clés, le
 * conseil d'une IA, l'intuition du restaurateur — relève de la supposition
 * tant que ces chiffres ne sont pas là.
 *
 * Deux cas. Le restaurateur a un site à lui, donc une propriété vérifiée
 * à son nom : tout ce qu'elle contient est à lui. Ou sa vitrine vit sur
 * klarr.net, et la propriété est la nôtre : elle couvre aussi la page
 * d'accueil de Klarr et le journal, et il faut ne compter que ses pages
 * à lui — voir `filtrePagesDe`, et l'endroit où `etatSearchConsole` le
 * décide.
 */

export type ProprieteSearchConsole = {
  /** « https://monresto.fr/ » ou « sc-domain:monresto.fr ». */
  site: string;
  /** « siteOwner », « siteFullUser »… Ce que Google accorde au compte. */
  droit: string;
};

export type RequeteMesuree = {
  requete: string;
  clics: number;
  impressions: number;
  /** Part des impressions qui ont produit un clic, en pourcentage. */
  ctr: number;
  /** Position moyenne dans les résultats. Plus c'est bas, mieux c'est. */
  position: number;
};

export async function listerProprietes(
  accessToken: string,
): Promise<ProprieteSearchConsole[]> {
  const res = await fetch(`${SC_BASE_URL}/sites`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(
      `Search Console /sites a échoué : ${res.status} ${await res.text()}`,
    );
  }

  const data = (await res.json()) as {
    siteEntry?: { siteUrl: string; permissionLevel: string }[];
  };

  return (
    (data.siteEntry ?? [])
      // Une propriété où le compte n'est que « restreint » ne donne accès à
      // aucune statistique : la proposer serait promettre un écran vide.
      .filter((entree) => entree.permissionLevel !== "siteUnverifiedUser")
      .map((entree) => ({
        site: entree.siteUrl,
        droit: entree.permissionLevel,
      }))
  );
}

/** Le format que Search Console attend : « 2026-09-16 ». */
function jour(decalageJours: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - decalageJours);
  return date.toISOString().slice(0, 10);
}

/**
 * Restreindre aux pages d'un établissement.
 *
 * Deux formes, essayées dans l'ordre. L'expression régulière est précise
 * — « /restaurant/bar » n'attrape pas « /restaurant/bar-a-vin ». Le
 * « contient » est plus large, mais il rend des chiffres là où l'écran
 * n'en aurait aucun si Search Console refusait l'expression. On ne
 * vérifie pas ce refus d'ici : un essai puis un repli valent mieux qu'un
 * pari sur la grammaire de Google.
 */
export type FiltrePage = { motif: string; repli: string };

function filtre(operator: string, expression: string) {
  return [{ filters: [{ dimension: "page", operator, expression }] }];
}

export async function requetesDeLaPeriode({
  accessToken,
  site,
  jours = 28,
  combien = 25,
  pages,
}: {
  accessToken: string;
  site: string;
  jours?: number;
  combien?: number;
  /** Ne compter que ces pages. Facultatif : sans, c'est tout le site. */
  pages?: FiltrePage | null;
}): Promise<RequeteMesuree[]> {
  const corps: Record<string, unknown> = {
    // Search Console accuse trois jours de retard sur les données : partir
    // d'aujourd'hui donnerait une dernière journée toujours vide, qu'on
    // lirait comme un effondrement du trafic.
    startDate: jour(jours + 3),
    endDate: jour(3),
    dimensions: ["query"],
    rowLimit: combien,
  };

  const interroger = async (groupes?: unknown[]) => {
    const res = await fetch(
      `${SC_BASE_URL}/sites/${encodeURIComponent(site)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          groupes ? { ...corps, dimensionFilterGroups: groupes } : corps,
        ),
      },
    );
    return res;
  };

  let res = pages
    ? await interroger(filtre("includingRegex", pages.motif))
    : await interroger();

  // Un 400 sur l'expression, et seulement sur elle : on retombe sur le
  // « contient ». Toute autre erreur — droits, quota — remonte telle
  // quelle, le repli ne la changerait pas.
  if (pages && res.status === 400) {
    console.warn(
      "[search-console] expression refusée, repli sur « contient »",
      pages.motif,
    );
    res = await interroger(filtre("contains", pages.repli));
  }

  if (!res.ok) {
    throw new Error(
      `Search Console searchAnalytics a échoué : ${res.status} ${await res.text()}`,
    );
  }

  const data = (await res.json()) as {
    rows?: {
      keys?: string[];
      clicks?: number;
      impressions?: number;
      ctr?: number;
      position?: number;
    }[];
  };

  return (data.rows ?? [])
    .map((ligne) => ({
      requete: ligne.keys?.[0] ?? "",
      clics: ligne.clicks ?? 0,
      impressions: ligne.impressions ?? 0,
      ctr: Math.round((ligne.ctr ?? 0) * 1000) / 10,
      position: Math.round((ligne.position ?? 0) * 10) / 10,
    }))
    .filter((ligne) => ligne.requete.length > 0);
}
