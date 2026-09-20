import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { jetonValide } from "@/lib/limites/publiques";
import { rattraperCourriels } from "@/lib/courriel/rattrapage";
import { rappelerLesReservations } from "@/lib/courriel/rappel";
import { relancerLesPaiements } from "@/lib/courriel/relances";
import { publierLesPosts } from "@/lib/posts/publication";
import { prevenirDesEssaisQuiFinissent } from "@/lib/notifications/essais";
import { purgerLesDonneesExpirees } from "@/lib/donnees/purge";

// Les options échues ne bloquent déjà plus la jauge — le moteur de
// disponibilité les ignore. Cette tâche ne fait que le dire : sans elle, une
// demande morte reste affichée « en attente » et le restaurateur croit avoir
// une décision à prendre.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/options-expirees] CRON_SECRET manquant");
    return NextResponse.json({ error: "non configuré" }, { status: 500 });
  }
  if (!jetonValide(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("restaurant_reservations")
    .update({ statut: "expiree" })
    .eq("statut", "demande")
    .lt("option_expire_le", new Date().toISOString())
    .select("id");

  if (error) {
    console.error("[cron/options-expirees]", error);
    return NextResponse.json(
      { error: "mise à jour impossible" },
      { status: 500 },
    );
  }

  const expirees = data?.length ?? 0;
  console.log(`[cron/options-expirees] ${expirees} option(s) échue(s)`);

  // Le rattrapage des e-mails voyage avec cette tâche plutôt que dans la
  // sienne : les comptes Vercel Hobby ne tolèrent que deux tâches
  // planifiées, une fois par jour chacune. Les deux traitements sont
  // indépendants — celui-ci ne peut pas empêcher l'autre d'avoir eu lieu,
  // puisqu'il vient après — et `/api/cron/courriels-en-echec` reste
  // appelable seul, pour un rattrapage à la demande ou le jour où l'on
  // passe à un forfait qui autorise l'heure.
  const courriels = await rattraperCourriels({
    supabase,
    maintenant: new Date(),
  });
  console.log(
    `[cron/options-expirees] courriels : ${courriels.renvoyes} renvoyé(s), ` +
      `${courriels.echoues} en échec, ${courriels.abandonnes} abandonné(s)`,
  );

  // Les rappels viennent après le rattrapage, et non l'inverse : un
  // rappel qui échoue ce soir doit pouvoir être repris demain, pas
  // retenté dans la seconde alors que la panne dure encore.
  const rappels = await rappelerLesReservations({
    supabase,
    maintenant: new Date(),
  });
  console.log(
    `[cron/options-expirees] rappels : ${rappels.envoyes} envoyé(s), ` +
      `${rappels.echoues} en échec, ${rappels.ignorees} ignoré(s) ` +
      `sur ${rappels.concernees} table(s) de demain`,
  );

  // Les relances viennent après l'expiration des options : celles qui
  // viennent de tomber ne doivent pas recevoir un rappel de payer une
  // salle qu'elles n'ont plus.
  const relances = await relancerLesPaiements({
    supabase,
    maintenant: new Date(),
  });
  console.log(
    `[cron/options-expirees] relances : ${relances.envoyees} envoyée(s), ` +
      `${relances.ignorees} ignorée(s) sur ${relances.concernees} option(s) ` +
      `proche(s) de l'échéance`,
  );

  // Les publications en dernier : elles ne dépendent d'aucun des
  // balayages précédents, et un échec chez Google ne doit pas retarder
  // des courriels dont dépendent des réservations.
  const posts = await publierLesPosts({ supabase, maintenant: new Date() });
  console.log(
    `[cron/options-expirees] posts : ${posts.publies} publié(s), ` +
      `${posts.reportes} reporté(s) sur ${posts.echus} échu(s)`,
  );

  // Les essais qui se terminent en tout dernier : cette alerte ne
  // s'adresse pas aux restaurateurs mais à nous, et rien de ce qui leur
  // est dû ne doit attendre derrière elle.
  const essais = await prevenirDesEssaisQuiFinissent({
    supabase,
    maintenant: new Date(),
  });
  console.log(
    `[cron/options-expirees] essais : ${essais.prevenus} alerte(s) ` +
      `sur ${essais.examines} établissement(s)`,
  );

  // La purge en dernier, et c'est délibéré. Elle n'a aucune urgence —
  // une journée de plus ne change rien à une donnée de trois ans — là où
  // tout ce qui précède se compte en heures pour quelqu'un qui attend une
  // confirmation. Et si elle échoue, elle échoue seule.
  const purge = await purgerLesDonneesExpirees({
    supabase,
    maintenant: new Date(),
  });
  console.log(
    `[cron/options-expirees] purge : ${purge.prospects} prospect(s), ` +
      `${purge.audits} audit(s), ${purge.suivis} note(s) de suivi, ` +
      `${purge.compteurs} compteur(s)`,
  );

  return NextResponse.json({
    expirees,
    courriels,
    rappels,
    relances,
    posts,
    essais,
    purge,
  });
}
