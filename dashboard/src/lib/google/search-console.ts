const SC_BASE_URL = "https://searchconsole.googleapis.com/webmasters/v3";

/**
 * Google Search Console — en lecture seule.
 *
 * C'est la seule source qui dise ce que les gens tapent *réellement* pour
 * trouver un établissement. Tout le reste — le choix des mots-clés, le
 * conseil d'une IA, l'intuition du restaurateur — relève de la supposition
 * tant que ces chiffres ne sont pas là.
 *
 * Nécessite que le restaurateur possède une propriété vérifiée, donc un
 * site à lui. La vitrine Klarr vit sur klarr.net, qu'il ne peut pas
 * vérifier : ce cas-là se traitera un jour côté plateforme, pas ici.
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

export async function requetesDeLaPeriode({
  accessToken,
  site,
  jours = 28,
  combien = 25,
  cheminContient,
}: {
  accessToken: string;
  site: string;
  jours?: number;
  combien?: number;
  /** Restreint à une page : la vitrine, la carte… Facultatif. */
  cheminContient?: string | null;
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

  if (cheminContient) {
    corps.dimensionFilterGroups = [
      {
        filters: [
          {
            dimension: "page",
            operator: "contains",
            expression: cheminContient,
          },
        ],
      },
    ];
  }

  const res = await fetch(
    `${SC_BASE_URL}/sites/${encodeURIComponent(site)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(corps),
    },
  );

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
