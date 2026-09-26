import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Compteur, TitreSection } from "@/components/dashboard/Compteur";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { ExperienceForm } from "@/components/experiences/ExperienceForm";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import { chargerFermetures } from "@/lib/reservations/fermetures";
import { prochainesSeances } from "@/lib/experiences/seances";
import { langueUtilisateur } from "@/lib/i18n/langue";
import type { Langue } from "@/lib/i18n/langues";
import { localeDe } from "@/lib/i18n/seo";
import { heure, listeJours } from "@/lib/i18n/jours";
import { COMMUN, traducteur } from "@/lib/i18n/t";
import { EXPERIENCES } from "@/lib/i18n/pages/experiences";
import { annulerPlace, basculerExperience } from "./actions";
import type { Experience, PlaceReservee } from "@/types/experience";
import type { Restaurant } from "@/types/restaurant";

type Place = PlaceReservee & {
  client_nom: string;
  client_email: string;
  client_telephone: string | null;
  montant_centimes: number;
};

function formatJour(date: string, langue: Langue): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(localeDe(langue), {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default async function ExperiencesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");
  await exigerModule(id, "reservations");
  const supabase = await createClient();
  const aujourdhui = new Date().toISOString().slice(0, 10);

  const [restaurantResult, experiencesResult, placesResult, fermetures] =
    await Promise.all([
      supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("restaurant_experiences")
        .select("*")
        .eq("restaurant_id", id)
        .order("ordre")
        .order("created_at"),
      // Les séances passées ne se gèrent plus : on ne charge que l'à-venir.
      supabase
        .from("restaurant_experience_reservations")
        .select(
          "id, experience_id, date_seance, places, statut, client_nom, client_email, client_telephone, montant_centimes",
        )
        .eq("restaurant_id", id)
        .gte("date_seance", aujourdhui)
        .order("date_seance"),
      chargerFermetures(supabase, id, aujourdhui),
    ]);

  const restaurant = restaurantResult.data as Restaurant | null;
  if (!restaurant) notFound();

  const langue = await langueUtilisateur();
  const t = traducteur(langue, EXPERIENCES, COMMUN);
  // Les montants gardent l'euro, écrit à la manière de la langue.
  const euros = (centimes: number) =>
    new Intl.NumberFormat(localeDe(langue), {
      style: "currency",
      currency: "EUR",
    }).format(centimes / 100);
  const experiences = (experiencesResult.data ?? []) as Experience[];
  const places = (placesResult.data ?? []) as Place[];
  const actives = experiences.filter((e) => e.actif).length;
  const tenues = places.filter((p) => p.statut !== "annulee");
  const inscrits = tenues.reduce((somme, p) => somme + p.places, 0);
  // Seules les expériences payées d'avance encaissent quelque chose : une
  // place « confirmée » payable sur place n'a encore rien rapporté.
  const prepayees = new Set(
    experiences.filter((e) => e.prepaiement).map((e) => e.id),
  );
  const encaisse = places
    .filter((p) => p.statut === "confirmee" && prepayees.has(p.experience_id))
    .reduce((somme, p) => somme + (p.montant_centimes ?? 0), 0);
  const maintenant = new Date();
  // Les séances des quatre prochaines semaines, calculées une fois : elles
  // servent aux cartes et au compteur des places encore à vendre.
  const seancesParExperience = new Map(
    experiences.map((experience) => [
      experience.id,
      prochainesSeances({
        experience,
        depuis: aujourdhui,
        jours: 28,
        places: 1,
        reservations: places.filter(
          (place) => place.experience_id === experience.id,
        ),
        fermetures,
        maintenant,
        langue,
      }),
    ]),
  );
  const placesLibres = experiences
    .filter((experience) => experience.actif)
    .flatMap((experience) => seancesParExperience.get(experience.id) ?? [])
    .filter((seance) => !seance.raison)
    .reduce((somme, seance) => somme + seance.placesRestantes, 0);
  const slug = (restaurant as Restaurant & { slug_reservation?: string | null })
    .slug_reservation;

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.menu}
        title={t("Expériences — {nom}", { nom: restaurant.nom })}
        backHref={`/dashboard/${id}/reservations`}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-4xl text-sm text-zinc-600">
          {t(
            "Un cours, un atelier, une dégustation : une séance à places limitées qui revient selon le rythme que tu choisis. Elle apparaît sur ta page de réservation, et le client paie sur ton compte Stripe — sans commission.",
          )}
        </p>
        {slug && (
          <a
            href={`/reserver/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
          >
            {t("Voir sur ma page de réservation ↗")}
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Compteur
          valeur={actives}
          libelle={t(
            actives > 1 ? "expériences en cours" : "expérience en cours",
          )}
        />
        <Compteur
          valeur={inscrits}
          libelle={t(inscrits > 1 ? "places réservées" : "place réservée")}
        />
        <Compteur
          valeur={euros(encaisse)}
          libelle={t("déjà payés pour les séances à venir")}
        />
        <Compteur
          valeur={placesLibres}
          libelle={t(
            placesLibres > 1
              ? "places encore libres sur 4 semaines"
              : "place encore libre sur 4 semaines",
          )}
        />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="flex min-w-0 flex-col gap-3">
          <TitreSection>{t("Tes expériences")}</TitreSection>
          {experiences.length === 0 && (
            <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-sm text-zinc-500">
              {t(
                "Aucune expérience pour l'instant. Crée la première à côté : une dégustation, un atelier, une soirée à thème.",
              )}
            </p>
          )}
          {experiences.length > 0 && (
            <ul className="flex flex-col gap-4">
              {experiences.map((experience) => {
                const siennes = places.filter(
                  (place) => place.experience_id === experience.id,
                );
                const seances = seancesParExperience.get(experience.id) ?? [];

                return (
                  <li
                    key={experience.id}
                    className={`flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm ${
                      experience.actif
                        ? "border-zinc-200/70"
                        : "border-zinc-200/70 opacity-70"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="font-serif text-2xl text-ink">
                          {experience.nom}
                          {!experience.actif && (
                            <span className="ml-2 rounded-full bg-zinc-100 px-2.5 py-0.5 align-middle font-sans text-xs font-medium text-zinc-500">
                              {t("arrêtée")}
                            </span>
                          )}
                        </span>
                        <span className="text-sm text-zinc-500">
                          {t("{prix} par personne", {
                            prix: euros(experience.prix_centimes),
                          })}{" "}
                          · {t("{n} places", { n: experience.places })} ·{" "}
                          {heure(experience.heure, langue)}
                          {experience.duree_minutes &&
                            ` · ${experience.duree_minutes} min`}
                        </span>
                        <span className="text-sm text-zinc-500 first-letter:capitalize">
                          {listeJours(experience.jours, langue)}
                          {!experience.prepaiement &&
                            t(" · paiement sur place")}
                        </span>
                      </div>

                      <form action={basculerExperience}>
                        <input
                          type="hidden"
                          name="experience_id"
                          value={experience.id}
                        />
                        <input type="hidden" name="restaurant_id" value={id} />
                        <input
                          type="hidden"
                          name="actif"
                          value={experience.actif ? "0" : "1"}
                        />
                        <button
                          type="submit"
                          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
                        >
                          {experience.actif ? t("Arrêter") : t("Relancer")}
                        </button>
                      </form>
                    </div>

                    {experience.description && (
                      <p className="text-sm text-zinc-600">
                        {experience.description}
                      </p>
                    )}

                    {/* Les quatre prochaines séances : de quoi vérifier d'un coup
                    d'œil que le rythme configuré est bien celui qu'on voulait. */}
                    {experience.actif && (
                      <div className="flex flex-wrap gap-2">
                        {seances.slice(0, 4).map((seance) => (
                          <span
                            key={seance.date}
                            className={`rounded-lg px-3 py-2 text-sm ${
                              seance.raison
                                ? "bg-zinc-100 text-zinc-500"
                                : seance.placesRestantes === 0
                                  ? "bg-emerald-50 font-medium text-emerald-800"
                                  : "bg-brand-orange-soft text-brand-navy"
                            }`}
                          >
                            <span className="first-letter:capitalize">
                              {formatJour(seance.date, langue)}
                            </span>{" "}
                            —{" "}
                            {seance.raison ??
                              (seance.placesRestantes === 0
                                ? t("complet")
                                : t(
                                    seance.placesRestantes > 1
                                      ? "{n} places libres"
                                      : "{n} place libre",
                                    { n: seance.placesRestantes },
                                  ))}
                          </span>
                        ))}
                        {seances.length === 0 && (
                          <span className="text-sm text-zinc-400">
                            {t(
                              "Aucune séance dans les quatre prochaines semaines.",
                            )}
                          </span>
                        )}
                      </div>
                    )}

                    {siennes.filter((place) => place.statut !== "annulee")
                      .length > 0 && (
                      <ul className="flex flex-col divide-y divide-zinc-100 border-t border-zinc-100 pt-2">
                        {siennes
                          .filter((place) => place.statut !== "annulee")
                          .map((place) => (
                            <li
                              key={place.id}
                              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5"
                            >
                              <span className="flex flex-col">
                                <span className="text-sm font-medium text-zinc-900">
                                  {place.client_nom}
                                  <span className="ml-2 font-normal text-zinc-500">
                                    {t(
                                      place.places > 1
                                        ? "{n} places"
                                        : "{n} place",
                                      { n: place.places },
                                    )}
                                  </span>
                                </span>
                                <span className="text-sm text-zinc-500 first-letter:capitalize">
                                  {formatJour(place.date_seance, langue)} ·{" "}
                                  {place.statut === "confirmee"
                                    ? t("{montant} encaissés", {
                                        montant: euros(place.montant_centimes),
                                      })
                                    : t("en attente de paiement")}
                                </span>
                              </span>
                              <span className="flex items-baseline gap-4 text-sm">
                                <a
                                  href={`mailto:${place.client_email}`}
                                  className="text-brand-orange hover:underline"
                                >
                                  {place.client_email}
                                </a>
                                <form action={annulerPlace}>
                                  <input
                                    type="hidden"
                                    name="reservation_id"
                                    value={place.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="restaurant_id"
                                    value={id}
                                  />
                                  <button
                                    type="submit"
                                    className="font-medium text-zinc-500 hover:text-red-600"
                                  >
                                    {t("Annuler")}
                                  </button>
                                </form>
                              </span>
                            </li>
                          ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-3 xl:sticky xl:top-24">
          <TitreSection>{t("Nouvelle expérience")}</TitreSection>
          <ExperienceForm restaurantId={id} langue={langue} />
        </section>
      </div>
    </div>
  );
}
