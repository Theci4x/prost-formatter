import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { marquerTraite } from "./actions";
import { siteUrl } from "@/lib/site-url";
import type { Restaurant } from "@/types/restaurant";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import { qrSvgDe } from "@/lib/menu/qr";

type Retour = {
  id: string;
  message: string;
  contact: string | null;
  traite: boolean;
  created_at: string;
};

function quand(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function RetoursPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");
  await exigerModule(id, "visibilite");

  const supabase = await createClient();
  const [{ data: restaurantData }, { data: retoursData }] = await Promise.all([
    supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("restaurant_retours")
      .select("*")
      .eq("restaurant_id", id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const restaurant = restaurantData as Restaurant | null;
  if (!restaurant) notFound();

  const retours = (retoursData ?? []) as Retour[];
  const adresse = restaurant.slug_reservation
    ? `${siteUrl()}/avis/${restaurant.slug_reservation}`
    : null;
  // L'adresse en toutes lettres ne sert qu'à celui qui la recopie dans un
  // outil de mise en page. Ce qu'on colle sur un totem, c'est le carré.
  const qr = adresse ? await qrSvgDe(adresse) : null;

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.avis}
        title={`Retours clients — ${restaurant.nom}`}
      />

      <div className="flex flex-col gap-3">
        <p className="text-sm text-zinc-600">
          Ce que des clients ont préféré vous dire en privé plutôt qu&apos;en
          public. Personne n&apos;a été trié : la page leur proposait
          l&apos;avis Google et ce message côte à côte, ils ont choisi.
        </p>

        {adresse ? (
          <div className="flex flex-wrap items-center gap-5 rounded-xl border border-zinc-200 bg-white px-4 py-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-xs font-medium text-zinc-500">
                L&apos;adresse à mettre sur votre totem ou QR code
              </p>
              <code className="break-all text-sm text-zinc-900">{adresse}</code>
            </div>
            {/* Le QR en vectoriel : un totem s'imprime, et un QR en pixels
                grossis ne se scanne plus. */}
            {qr && (
              <div
                className="w-32 shrink-0 [&>svg]:h-auto [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: qr }}
              />
            )}
          </div>
        ) : (
          <p className="text-sm text-amber-800">
            Ouvrez d&apos;abord votre page de réservation : c&apos;est son
            adresse qui sert aussi à celle des avis.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {retours.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Aucun retour pour l&apos;instant.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {retours.map((retour) => (
              <li
                key={retour.id}
                className={`flex flex-col gap-2 rounded-2xl border p-4 ${
                  retour.traite
                    ? "border-zinc-200 bg-zinc-50"
                    : "border-amber-200 bg-white"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="text-xs text-zinc-500">
                    {quand(retour.created_at)}
                  </span>
                  {retour.contact && (
                    <span className="text-xs font-medium text-zinc-700">
                      {retour.contact}
                    </span>
                  )}
                </div>

                <p className="whitespace-pre-wrap text-sm text-zinc-800">
                  {retour.message}
                </p>

                <form action={marquerTraite} className="w-fit">
                  <input type="hidden" name="restaurant_id" value={id} />
                  <input type="hidden" name="retour_id" value={retour.id} />
                  <input
                    type="hidden"
                    name="traite"
                    value={retour.traite ? "0" : "1"}
                  />
                  <button
                    type="submit"
                    className="text-xs font-medium text-zinc-500 underline underline-offset-2 hover:text-brand-navy"
                  >
                    {retour.traite ? "Rouvrir" : "Marquer comme traité"}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
