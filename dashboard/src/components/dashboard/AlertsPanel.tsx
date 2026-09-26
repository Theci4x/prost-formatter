import Link from "next/link";
import { FENETRE_JOURS, type Alert } from "@/lib/reputation/alerts";
import type { Langue } from "@/lib/i18n/langues";
import { traducteur } from "@/lib/i18n/t";
import { CADRE } from "@/lib/i18n/pages/cadre";

const TON_STYLES: Record<Alert["ton"], string> = {
  negatif: "border-red-200 bg-red-50 text-red-800",
  positif: "border-emerald-200 bg-emerald-50 text-emerald-800",
  neutre: "border-zinc-200 bg-zinc-50 text-zinc-700",
};

export function AlertsPanel({
  alerts,
  restaurantNames,
  surveillanceActive,
  langue,
}: {
  alerts: Alert[];
  restaurantNames: Map<string, string>;
  // Faux tant qu'aucun relevé n'a encore été enregistré : sans ça, un
  // tableau vide voudrait dire aussi bien « tout va bien » que « on ne
  // surveille rien ».
  surveillanceActive: boolean;
  langue: Langue;
}) {
  const t = traducteur(langue, CADRE);
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-serif text-2xl text-ink">{t("Ce qui a changé")}</h2>
        <span className="text-xs text-zinc-400">
          {t("sur {n} jours", { n: FENETRE_JOURS })}
        </span>
      </div>

      {!surveillanceActive ? (
        <p className="text-sm text-zinc-500">
          {t(
            "La surveillance démarre dès le premier relevé, la nuit prochaine. Elle compare chaque jour ta note et ton nombre d'avis à ceux de la semaine précédente.",
          )}
        </p>
      ) : alerts.length === 0 ? (
        <p className="text-sm text-zinc-500">
          {t("Rien de neuf : ni nouvel avis, ni variation de note cette semaine.")}
        </p>
      ) : (
        <ul className="grid gap-2 xl:grid-cols-2">
          {alerts.map((alert, index) => (
            <li
              key={`${alert.restaurantId}-${alert.plateforme}-${index}`}
              className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-xl border px-4 py-3 text-sm ${TON_STYLES[alert.ton]}`}
            >
              <span>
                <span className="font-medium">
                  {restaurantNames.get(alert.restaurantId) ?? t("Établissement")}
                </span>
                {" — "}
                {alert.message}
              </span>
              <Link
                href={`/dashboard/${alert.restaurantId}/avis`}
                className="shrink-0 font-medium underline underline-offset-2"
              >
                {t("Voir les avis")}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
