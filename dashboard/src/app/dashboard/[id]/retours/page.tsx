import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { Compteur, TitreSection } from "@/components/dashboard/Compteur";
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

  const aTraiter = retours.filter((r) => !r.traite).length;

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.avis}
        title={`Retours clients — ${restaurant.nom}`}
      />

      <p className="max-w-4xl text-sm text-zinc-600">
        Ce que des clients ont préféré vous dire en privé plutôt qu&apos;en
        public. Personne n&apos;a été trié : la page leur proposait l&apos;avis
        Google et ce message côte à côte, ils ont choisi.
      </p>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Compteur
          valeur={aTraiter}
          libelle={`retour${aTraiter > 1 ? "s" : ""} à traiter`}
          accent={aTraiter > 0}
        />
        <Compteur
          valeur={retours.length - aTraiter}
          libelle={`traité${retours.length - aTraiter > 1 ? "s" : ""}`}
        />
        <Compteur
          valeur={retours.length}
          libelle={`retour${retours.length > 1 ? "s" : ""} en tout`}
        />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="flex min-w-0 flex-col gap-3">
          <TitreSection>Les messages</TitreSection>
          {retours.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-sm text-zinc-500">
              Aucun retour pour l&apos;instant. Posez le QR code à côté : ils
              arriveront ici, et nulle part ailleurs.
            </p>
          ) : (
            <ul className="grid items-start gap-4 2xl:grid-cols-2">
              {retours.map((retour) => (
                <li
                  key={retour.id}
                  className={`flex flex-col gap-3 rounded-2xl border p-6 shadow-sm ${
                    retour.traite
                      ? "border-zinc-200/70 bg-zinc-50"
                      : "border-brand-orange/50 bg-white"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <span className="text-xs text-zinc-500 first-letter:capitalize">
                      {quand(retour.created_at)}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        retour.traite
                          ? "bg-zinc-100 text-zinc-500"
                          : "bg-brand-orange-soft text-brand-orange-dark"
                      }`}
                    >
                      {retour.traite ? "Traité" : "À traiter"}
                    </span>
                  </div>

                  <p
                    className={`whitespace-pre-wrap text-[15px] leading-relaxed ${
                      retour.traite ? "text-zinc-500" : "text-ink"
                    }`}
                  >
                    {retour.message}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-3">
                    {retour.contact ? (
                      retour.contact.includes("@") ? (
                        <a
                          href={`mailto:${retour.contact}`}
                          className="text-sm font-semibold text-brand-orange-dark hover:underline"
                        >
                          Répondre à {retour.contact}
                        </a>
                      ) : (
                        <a
                          href={`tel:${retour.contact.replace(/\s/g, "")}`}
                          className="text-sm font-semibold text-brand-orange-dark hover:underline"
                        >
                          Rappeler le {retour.contact}
                        </a>
                      )
                    ) : (
                      <span className="text-xs text-zinc-400">
                        Aucun contact laissé
                      </span>
                    )}
                    <form action={marquerTraite}>
                      <input type="hidden" name="restaurant_id" value={id} />
                      <input type="hidden" name="retour_id" value={retour.id} />
                      <input
                        type="hidden"
                        name="traite"
                        value={retour.traite ? "0" : "1"}
                      />
                      <button
                        type="submit"
                        className={
                          retour.traite
                            ? "text-xs font-medium text-zinc-400 hover:text-brand-navy"
                            : "rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-brand-navy hover:text-brand-navy"
                        }
                      >
                        {retour.traite ? "Rouvrir" : "Marquer comme traité"}
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Le QR à côté des messages : c'est lui qui les fait venir. */}
        <aside className="flex flex-col gap-3 xl:sticky xl:top-24">
          <TitreSection>Le QR code</TitreSection>
          {adresse ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 text-center shadow-sm">
              {/* Le QR en vectoriel : un totem s'imprime, et un QR en pixels
                  grossis ne se scanne plus. */}
              {qr && (
                <div
                  className="w-48 [&>svg]:h-auto [&>svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: qr }}
                />
              )}
              <p className="text-sm text-zinc-600">
                À poser sur les tables, le totem ou l&apos;addition.
              </p>
              <code className="w-full break-all rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-700">
                {adresse}
              </code>
            </div>
          ) : (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
              Ouvrez d&apos;abord votre page de réservation : c&apos;est son
              adresse qui sert aussi à celle des avis.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
