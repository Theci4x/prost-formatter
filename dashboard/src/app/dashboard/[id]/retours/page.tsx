import Link from "next/link";
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
import { BoutonCopier } from "@/components/dashboard/BoutonCopier";
import { langueUtilisateur } from "@/lib/i18n/langue";
import type { Langue } from "@/lib/i18n/langues";
import { localeDe } from "@/lib/i18n/seo";
import { COMMUN, traducteur } from "@/lib/i18n/t";
import { RETOURS } from "@/lib/i18n/pages/retours";

type Retour = {
  id: string;
  message: string;
  contact: string | null;
  traite: boolean;
  created_at: string;
};

function quand(iso: string, langue: Langue): string {
  return new Date(iso).toLocaleString(localeDe(langue), {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Reçu dans les `jours` derniers jours. */
function recent(iso: string, jours: number): boolean {
  return new Date(iso).getTime() >= Date.now() - jours * 24 * 3600 * 1000;
}

export default async function RetoursPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filtre?: string }>;
}) {
  const { id } = await params;
  const { filtre } = await searchParams;
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

  const langue = await langueUtilisateur();
  const t = traducteur(langue, RETOURS, COMMUN);
  const retours = (retoursData ?? []) as Retour[];
  const adresse = restaurant.slug_reservation
    ? `${siteUrl()}/avis/${restaurant.slug_reservation}`
    : null;
  // L'adresse en toutes lettres ne sert qu'à celui qui la recopie dans un
  // outil de mise en page. Ce qu'on colle sur un totem, c'est le carré.
  const qr = adresse ? await qrSvgDe(adresse) : null;

  const aTraiter = retours.filter((r) => !r.traite).length;
  const recents = retours.filter((r) => recent(r.created_at, 30)).length;
  const filtres = [
    { cle: "", libelle: t("Tous · {n}", { n: retours.length }) },
    { cle: "a-traiter", libelle: t("À traiter · {n}", { n: aTraiter }) },
    {
      cle: "traites",
      libelle: t("Traités · {n}", { n: retours.length - aTraiter }),
    },
  ];
  const actif = filtres.some((f) => f.cle === filtre) ? (filtre ?? "") : "";
  const affiches = retours.filter((r) =>
    actif === "a-traiter" ? !r.traite : actif === "traites" ? r.traite : true,
  );

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.avis}
        title={t("Retours clients — {nom}", { nom: restaurant.nom })}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-4xl text-sm text-zinc-600">
          {t(
            "Ce que des clients ont préféré te dire en privé plutôt qu'en public. Personne n'a été trié : la page leur proposait l'avis Google et ce message côte à côte, ils ont choisi.",
          )}
        </p>
        <Link
          href={`/dashboard/${id}/avis`}
          className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
        >
          {t("Avis publics")}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Link
          href={`/dashboard/${id}/retours?filtre=a-traiter#messages`}
          scroll={false}
          className="block"
        >
          <Compteur
            valeur={aTraiter}
            libelle={t(aTraiter > 1 ? "retours à traiter" : "retour à traiter")}
            accent={aTraiter > 0}
          />
        </Link>
        <Compteur
          valeur={retours.length - aTraiter}
          libelle={t(retours.length - aTraiter > 1 ? "traités" : "traité")}
        />
        <Compteur
          valeur={retours.length}
          libelle={t(retours.length > 1 ? "retours en tout" : "retour en tout")}
        />
        <Compteur
          valeur={recents}
          libelle={t(
            recents > 1
              ? "reçus ces 30 derniers jours"
              : "reçu ces 30 derniers jours",
          )}
        />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section
          id="messages"
          className="flex min-w-0 scroll-mt-8 flex-col gap-4"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <TitreSection>{t("Les messages")}</TitreSection>
            {retours.length > 0 && (
              <nav className="flex flex-wrap gap-2">
                {filtres.map((f) => (
                  <Link
                    key={f.cle || "tous"}
                    href={`/dashboard/${id}/retours${f.cle ? `?filtre=${f.cle}` : ""}#messages`}
                    scroll={false}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      actif === f.cle
                        ? "border-brand-navy bg-brand-navy text-white"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-ink hover:text-ink"
                    }`}
                  >
                    {f.libelle}
                  </Link>
                ))}
              </nav>
            )}
          </div>
          {retours.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-sm text-zinc-500">
              {t(
                "Aucun retour pour l'instant. Pose le QR code à côté : ils arriveront ici, et nulle part ailleurs.",
              )}
            </p>
          ) : affiches.length === 0 ? (
            <p className="rounded-2xl border border-zinc-200/70 bg-white p-6 text-sm text-zinc-500 shadow-sm">
              {t("Rien dans cette catégorie.")}
            </p>
          ) : (
            <ul className="grid items-start gap-4 2xl:grid-cols-2">
              {affiches.map((retour) => (
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
                      {quand(retour.created_at, langue)}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        retour.traite
                          ? "bg-zinc-100 text-zinc-500"
                          : "bg-brand-orange-soft text-brand-orange-dark"
                      }`}
                    >
                      {retour.traite ? t("Traité") : t("À traiter")}
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
                          {t("Répondre à {contact}", {
                            contact: retour.contact,
                          })}
                        </a>
                      ) : (
                        <a
                          href={`tel:${retour.contact.replace(/\s/g, "")}`}
                          className="text-sm font-semibold text-brand-orange-dark hover:underline"
                        >
                          {t("Rappeler le {contact}", {
                            contact: retour.contact,
                          })}
                        </a>
                      )
                    ) : (
                      <span className="text-xs text-zinc-400">
                        {t("Aucun contact laissé")}
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
                            : "rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand-navy hover:text-brand-navy"
                        }
                      >
                        {retour.traite
                          ? t("Rouvrir")
                          : t("Marquer comme traité")}
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
          <TitreSection>{t("Le QR code")}</TitreSection>
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
                {t("À poser sur les tables, le totem ou l'addition.")}
              </p>
              <code className="w-full break-all rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-700">
                {adresse}
              </code>
              <div className="flex flex-wrap justify-center gap-2">
                <BoutonCopier
                  texte={adresse}
                  libelle={t("Copier l'adresse")}
                  copie={t("Adresse copiée ✓")}
                />
                <a
                  href={adresse}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
                >
                  {t("Voir la page ↗")}
                </a>
              </div>
            </div>
          ) : (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
              {t(
                "Ouvre d'abord ta page de réservation : c'est son adresse qui sert aussi à celle des avis.",
              )}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
