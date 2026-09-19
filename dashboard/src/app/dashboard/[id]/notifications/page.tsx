import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ActiverNotifications } from "@/components/dashboard/ActiverNotifications";
import { exiger } from "@/lib/equipe/roles";

export const metadata: Metadata = {
  title: "Notifications",
  robots: { index: false, follow: false },
};

type Appareil = {
  id: string;
  appareil: string | null;
  created_at: string;
};

function Cloche() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");

  const supabase = await createClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("nom")
    .eq("id", id)
    .maybeSingle();
  if (!restaurant) notFound();

  // Les siens seulement : la RLS filtre sur l'utilisateur connecté.
  const { data } = await supabase
    .from("push_abonnements")
    .select("id, appareil, created_at")
    .eq("restaurant_id", id)
    .order("created_at", { ascending: false });
  const appareils = (data ?? []) as Appareil[];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-8">
      <PageHeader
        icon={<Cloche />}
        title={`Notifications — ${(restaurant as { nom: string }).nom}`}
      />

      <p className="text-[15px] leading-relaxed text-ink-soft">
        Une demande de réservation arrive à 19 h 40, en plein coup de feu.
        L&apos;e-mail attendra la fermeture ; la notification, non. Activez-la
        sur chaque appareil qui doit sonner — votre téléphone, celui de votre
        gérant.
      </p>

      <ActiverNotifications restaurantId={id} />

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-2xl text-ink">Ce qui vous réveillera</h2>
        <ul className="flex flex-col gap-2 text-[15px] text-ink-soft">
          <li>
            <strong className="font-semibold text-ink">
              Une nouvelle demande de réservation
            </strong>{" "}
            — avec le nom, le nombre de couverts et l&apos;heure.
          </li>
          <li>
            <strong className="font-semibold text-ink">
              Une annulation client
            </strong>{" "}
            — la table se libère, vous pouvez la revendre.
          </li>
        </ul>
        <p className="text-sm text-ink-soft">
          Et rien d&apos;autre. Pas de conseil du jour, pas de relance
          d&apos;abonnement : une notification qui ne sert à rien est une
          notification qu&apos;on coupe.
        </p>
      </section>

      {appareils.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-2xl text-ink">Vos appareils</h2>
          <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line bg-paper">
            {appareils.map((appareil) => (
              <li
                key={appareil.id}
                className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
              >
                <span className="font-medium text-ink">
                  {appareil.appareil ?? "Appareil"}
                </span>
                <span className="text-ink-soft">
                  depuis le{" "}
                  {new Date(appareil.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-ink-soft">
            Un appareil se retire depuis lui-même, avec le bouton ci-dessus. Un
            téléphone perdu cesse de recevoir dès que le navigateur est
            réinstallé.
          </p>
        </section>
      )}
    </div>
  );
}
