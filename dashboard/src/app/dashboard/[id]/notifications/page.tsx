import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TitreSection } from "@/components/dashboard/Compteur";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ActiverNotifications } from "@/components/dashboard/ActiverNotifications";
import { exiger } from "@/lib/equipe/roles";
import { langueUtilisateur } from "@/lib/i18n/langue";
import { localeDe } from "@/lib/i18n/seo";
import { COMMUN, traducteur } from "@/lib/i18n/t";
import { NOTIFICATIONS } from "@/lib/i18n/pages/notifications";

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
  const langue = await langueUtilisateur();
  const t = traducteur(langue, NOTIFICATIONS, COMMUN);

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <PageHeader
        icon={<Cloche />}
        title={t("Notifications — {nom}", {
          nom: (restaurant as { nom: string }).nom,
        })}
      />

      <p className="max-w-4xl text-sm leading-relaxed text-zinc-600">
        {t(
          "Une demande de réservation arrive à 19 h 40, en plein coup de feu. L'e-mail attendra la fermeture ; la notification, non. Active-la sur chaque appareil qui doit sonner — ton téléphone, celui de ton gérant.",
        )}
      </p>

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <TitreSection>{t("Sur cet appareil")}</TitreSection>
            <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
              <ActiverNotifications restaurantId={id} langue={langue} />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <TitreSection
              aside={t(
                appareils.length > 1 ? "{n} appareils" : "{n} appareil",
                {
                  n: appareils.length,
                },
              )}
            >
              {t("Tes appareils")}
            </TitreSection>
            {appareils.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-8 text-sm text-zinc-500">
                {t(
                  "Aucun appareil pour l'instant : active les notifications ci-dessus, depuis le téléphone qui doit sonner.",
                )}
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
                {appareils.map((appareil) => (
                  <li
                    key={appareil.id}
                    className="flex items-center justify-between gap-4 px-6 py-4 text-sm"
                  >
                    <span className="flex items-center gap-3 font-semibold text-ink">
                      <span
                        aria-hidden="true"
                        className="h-2 w-2 rounded-full bg-emerald-500"
                      />
                      {t(appareil.appareil ?? "Appareil")}
                    </span>
                    <span className="text-zinc-500">
                      {t("depuis le {date}", {
                        date: new Date(appareil.created_at).toLocaleDateString(
                          localeDe(langue),
                          { day: "2-digit", month: "2-digit", year: "numeric" },
                        ),
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs leading-relaxed text-zinc-500">
              {t(
                "Un appareil se retire depuis lui-même, avec le bouton ci-dessus. Un téléphone perdu cesse de recevoir dès que le navigateur est réinstallé.",
              )}
            </p>
          </section>
        </div>

        <section className="flex flex-col gap-3">
          <TitreSection>{t("Ce qui te réveillera")}</TitreSection>
          <ul className="grid gap-3">
            {[
              {
                titre: "Une nouvelle demande de réservation",
                texte: "Avec le nom, le nombre de couverts et l'heure.",
              },
              {
                titre: "Une annulation client",
                texte: "La table se libère : tu peux la revendre.",
              },
            ].map((n) => (
              <li
                key={n.titre}
                className="flex items-start gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange-soft text-brand-orange-dark">
                  <Cloche />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="font-semibold text-ink">{t(n.titre)}</span>
                  <span className="text-sm text-zinc-500">{t(n.texte)}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-zinc-500">
            {t(
              "Et rien d'autre. Pas de conseil du jour, pas de relance d'abonnement : une notification qui ne sert à rien est une notification qu'on coupe.",
            )}
          </p>
        </section>

        {/* Les messages que Klarr envoie de lui-même par e-mail : le
            bilan du mois, à toi, et la demande d'avis du lendemain, à
            tes clients. Chacun se règle sur sa propre page. */}
        <section className="flex flex-col gap-3">
          <TitreSection>{t("Par e-mail")}</TitreSection>
          <Link
            href={`/dashboard/${id}/rapport`}
            className="group flex items-start gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm transition-[border-color,transform,box-shadow] hover:-translate-y-px hover:border-ink hover:shadow-md"
          >
            <span className="flex flex-col gap-0.5">
              <span className="flex items-center gap-2 font-semibold text-ink">
                {t("Le bilan mensuel")}
                <span
                  aria-hidden="true"
                  className="text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
                >
                  →
                </span>
              </span>
              <span className="text-sm text-zinc-500">
                {t(
                  "Le 1er du mois : couverts, note Google, nouveaux clients, et ce qui t'attend. Aperçu, envoi d'essai et désinscription.",
                )}
              </span>
            </span>
          </Link>
          <Link
            href={`/dashboard/${id}/apres-visite`}
            className="group flex items-start gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm transition-[border-color,transform,box-shadow] hover:-translate-y-px hover:border-ink hover:shadow-md"
          >
            <span className="flex flex-col gap-0.5">
              <span className="flex items-center gap-2 font-semibold text-ink">
                {t("La demande d'avis, le lendemain")}
                <span
                  aria-hidden="true"
                  className="text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
                >
                  →
                </span>
              </span>
              <span className="text-sm text-zinc-500">
                {t(
                  "À tes clients venus la veille : un merci, un lien vers Google et un lien pour t'écrire. Aperçu et réglage.",
                )}
              </span>
            </span>
          </Link>
        </section>
      </div>
    </div>
  );
}
