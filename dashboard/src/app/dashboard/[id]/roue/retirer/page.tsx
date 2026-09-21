import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { RetirerLot } from "@/components/roue/RetirerLot";
import { roleSur } from "@/lib/equipe/roles";
import { aujourdhui } from "@/lib/roue/retrait";
import type { Restaurant } from "@/types/restaurant";

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

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.roue}
        title="Retirer un lot"
        backHref={`/dashboard/${id}/service`}
      />

      <p className="text-sm text-zinc-500">
        Le client montre son e-mail ou son écran. Saisis le code, vérifie ce
        qu&apos;il a gagné, puis confirme une fois le lot remis.
      </p>

      <RetirerLot restaurantId={id} aujourdhui={aujourdhui()} />
    </div>
  );
}
