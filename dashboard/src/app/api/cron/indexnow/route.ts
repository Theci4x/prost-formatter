import { NextResponse } from "next/server";
import sitemap from "@/app/sitemap";
import { jetonValide } from "@/lib/limites/publiques";
import { prevenirIndexNow } from "@/lib/seo/indexnow";
import { siteUrl } from "@/lib/site-url";

/**
 * Chaque matin, les pages qui ont changé ces derniers jours sont signalées
 * à IndexNow.
 *
 * La liste vient du plan du site lui-même : une page qu'on y ajoute, ou
 * dont on avance la date, part toute seule le lendemain, sans que personne
 * ait à s'en souvenir. Trois jours plutôt qu'un, pour qu'un déploiement du
 * soir ou une tâche qui échoue une fois ne fasse rien manquer.
 *
 * On ne renvoie pas tout le site chaque jour : le protocole demande de ne
 * signaler que ce qui a changé, et un moteur qui reçoit cent adresses
 * inchangées tous les matins cesse de les prendre au sérieux. `?tout=1`
 * envoie malgré tout l'ensemble — pour le premier envoi, à la main.
 */
const JOURS = 3;

/**
 * La semaine de lancement : jusqu'à cette date, tout le plan du site part
 * chaque matin. Les articles publiés avant la mise en place d'IndexNow
 * sont plus vieux que la fenêtre de trois jours ; sans ce délai, ils ne
 * seraient jamais signalés. Passé la date, la ligne ne sert plus à rien.
 */
const LANCEMENT_JUSQU_AU = "2026-10-04";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/indexnow] CRON_SECRET manquant");
    return NextResponse.json({ error: "non configuré" }, { status: 500 });
  }
  if (!jetonValide(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }

  // Une préversion ou un poste de développement ne parle pas au nom de
  // klarr.net : seul le site public prévient les moteurs.
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return NextResponse.json({ ignore: "hors production" });
  }

  const tout =
    new URL(request.url).searchParams.get("tout") === "1" ||
    new Date().toISOString().slice(0, 10) < LANCEMENT_JUSQU_AU;
  const depuis = Date.now() - JOURS * 24 * 3600 * 1000;
  const entrees = await sitemap();
  const adresses = entrees
    .filter((entree) => {
      if (tout) return true;
      const quand = entree.lastModified
        ? new Date(entree.lastModified).getTime()
        : 0;
      return quand >= depuis;
    })
    .map((entree) => entree.url);

  if (adresses.length === 0) {
    return NextResponse.json({ envoyees: 0 });
  }

  try {
    const bilan = await prevenirIndexNow(siteUrl(), adresses);
    console.log(
      `[cron/indexnow] ${bilan.envoyees} adresse(s), statuts ${bilan.statuts.join(", ")}`,
    );
    return NextResponse.json(bilan);
  } catch (erreur) {
    console.error("[cron/indexnow]", erreur);
    return NextResponse.json({ error: "envoi impossible" }, { status: 502 });
  }
}
