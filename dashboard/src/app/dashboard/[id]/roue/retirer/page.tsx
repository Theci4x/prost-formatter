import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { RetirerLot } from "@/components/roue/RetirerLot";
import { roleSur } from "@/lib/equipe/roles";
import { aujourdhui } from "@/lib/roue/retrait";
import type { Restaurant } from "@/types/restaurant";
import { langueUtilisateur } from "@/lib/i18n/langue";
import { COMMUN, traducteur } from "@/lib/i18n/t";
import { ROUE } from "@/lib/i18n/pages/roue";

/**
 * L'écran de retrait, en salle.
 *
 * Volontairement ouvert à toute l'équipe, service compris : c'est le
 * serveur qui a le téléphone en main quand le client montre son écran.
 * Régler les lots reste un geste de gérant, en remettre un ne l'est pas.
 */
export default async function RetirerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if ((await roleSur(id)) === null) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("restaurants")
    .select("id, nom")
    .eq("id", id)
    .maybeSingle();
  const restaurant = data as Pick<Restaurant, "id" | "nom"> | null;
  if (!restaurant) notFound();
  const langue = await langueUtilisateur();
  const t = traducteur(langue, ROUE, COMMUN);

  return (
    <div className="flex w-full flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.roue}
        title={t("Retirer un lot")}
        backHref={`/dashboard/${id}/service`}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        {/* Les trois gestes au comptoir, dans l'ordre : on les lit une fois,
            puis on n'a plus besoin de les lire. */}
        <ol className="flex flex-col gap-3">
          {[
            ["Le client montre son code", "Dans son e-mail, ou sur son écran."],
            [
              "Tu vérifies le lot",
              "Ce qu'il a gagné et jusqu'à quand il vaut.",
            ],
            [
              "Tu confirmes la remise",
              "Une fois le lot donné — le code ne resservira pas.",
            ],
          ].map(([titre, texte], i) => (
            <li
              key={titre}
              className="flex items-start gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white">
                {i + 1}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="font-semibold text-ink">{t(titre)}</span>
                <span className="text-sm text-zinc-500">{t(texte)}</span>
              </span>
            </li>
          ))}
        </ol>

        <RetirerLot
          restaurantId={id}
          aujourdhui={aujourdhui()}
          langue={langue}
        />
      </div>
    </div>
  );
}
