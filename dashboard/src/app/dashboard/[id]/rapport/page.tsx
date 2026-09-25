import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { TitreSection } from "@/components/dashboard/Compteur";
import { EssaiRapport } from "@/components/rapport/EssaiRapport";
import { exiger } from "@/lib/equipe/roles";
import {
  calculerRapport,
  deMois,
  periodeDuRapport,
  rendreRapport,
} from "@/lib/rapport/mensuel";
import { basculerRapport } from "./actions";
import { langueUtilisateur } from "@/lib/i18n/langue";
import type { Langue } from "@/lib/i18n/langues";
import { localeDe } from "@/lib/i18n/seo";
import { COMMUN, traducteur } from "@/lib/i18n/t";
import { RAPPORT } from "@/lib/i18n/pages/rapport";

/**
 * Le bilan mensuel, tel qu'il arrive par e-mail.
 *
 * C'est aussi là que mène « Ne plus le recevoir », en pied du message :
 * un restaurateur connecté coupe d'un clic, sans lien de désinscription
 * à sécuriser à part — ce n'est pas un envoi à un tiers, c'est un bilan
 * de son propre compte.
 */

function jourLong(iso: string, langue: Langue): string {
  return new Date(iso).toLocaleDateString(localeDe(langue), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  });
}

export default async function RapportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");

  const supabase = await createClient();
  const [{ data: restaurantData }, { data: historiqueData }] =
    await Promise.all([
      supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("restaurant_rapports")
        .select("mois, envoye_le, destinataire")
        .eq("restaurant_id", id)
        .order("mois", { ascending: false })
        .limit(12),
    ]);

  const restaurant = restaurantData as {
    id: string;
    nom: string;
    rapport_mensuel?: boolean | null;
  } | null;
  if (!restaurant) notFound();

  const langue = await langueUtilisateur();
  const t = traducteur(langue, RAPPORT, COMMUN);
  const actif = restaurant.rapport_mensuel !== false;
  const periode = periodeDuRapport(new Date());
  // « de septembre 2026 », « d'août 2026 » : l'élision n'est que française.
  const moisLisible = (aaaamm: string) =>
    new Date(`${aaaamm}-15T12:00:00Z`).toLocaleDateString(localeDe(langue), {
      month: "long",
      year: "numeric",
    });
  const titreBilan =
    langue === "fr"
      ? `Le bilan ${deMois(periode.libelle)}`
      : t("Le bilan de {mois}", { mois: moisLisible(periode.mois) });
  const message = rendreRapport(
    await calculerRapport(supabase, restaurant, periode),
  );
  const historique = (historiqueData ?? []) as {
    mois: string;
    envoye_le: string;
    destinataire: string | null;
  }[];

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-3">
        <PageHeader
          icon={dashboardIcons.abonnement}
          title={t("Bilan mensuel — {nom}", { nom: restaurant.nom })}
          backHref={`/dashboard/${id}/notifications`}
        />
        <p className="max-w-4xl text-sm text-zinc-600">
          {t(
            "Le 1er de chaque mois, Klarr t'envoie le bilan du mois écoulé : couverts, note Google, nouveaux clients, et ce qui t'attend. Il part à l'adresse de ton compte Klarr.",
          )}
        </p>
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-2 font-serif text-2xl text-ink">
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${
                actif ? "bg-emerald-500" : "bg-zinc-300"
              }`}
            />
            {actif ? t("Tu le reçois chaque mois") : t("Tu ne le reçois plus")}
          </span>
          <span className="text-sm text-zinc-600">
            {actif
              ? t("Prochain envoi le 1er du mois prochain, dans la matinée.")
              : t("Tu peux le réactiver quand tu veux.")}
          </span>
        </div>
        <div className="flex flex-wrap items-start gap-3">
          <form action={basculerRapport}>
            <input type="hidden" name="restaurant_id" value={id} />
            <input type="hidden" name="actif" value={actif ? "0" : "1"} />
            <button
              type="submit"
              className={
                actif
                  ? "rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
                  : "rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
              }
            >
              {actif ? t("Ne plus le recevoir") : t("Le recevoir à nouveau")}
            </button>
          </form>
          <EssaiRapport restaurantId={id} langue={langue} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <TitreSection aside={message.sujet}>{titreBilan}</TitreSection>
        {/* L'e-mail lui-même, dans un cadre isolé : ce qu'on voit ici est
            exactement ce qui arrive dans la boîte, styles compris. */}
        <iframe
          title={titreBilan}
          srcDoc={message.html}
          sandbox="allow-popups allow-popups-to-escape-sandbox"
          className="h-[900px] w-full max-w-3xl rounded-2xl border border-zinc-200/70 bg-white shadow-sm"
        />
      </section>

      {historique.length > 0 && (
        <section className="flex flex-col gap-4">
          <TitreSection>{t("Déjà envoyés")}</TitreSection>
          <ul className="flex max-w-3xl flex-col overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
            {historique.map((ligne, index) => (
              <li
                key={ligne.mois}
                className={`flex flex-wrap items-baseline justify-between gap-2 px-5 py-3 text-sm ${
                  index > 0 ? "border-t border-zinc-100" : ""
                }`}
              >
                <span className="font-semibold text-ink">
                  {moisLisible(ligne.mois)}
                </span>
                <span className="text-zinc-500">
                  {t("le {date}", { date: jourLong(ligne.envoye_le, langue) })}
                  {ligne.destinataire
                    ? t(" à {email}", { email: ligne.destinataire })
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href="/dashboard"
        className="w-fit text-sm font-semibold text-brand-orange-dark hover:underline"
      >
        {t("← Retour à l'accueil")}
      </Link>
    </div>
  );
}
