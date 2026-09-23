import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Compteur, TitreSection } from "@/components/dashboard/Compteur";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { ExperienceForm } from "@/components/experiences/ExperienceForm";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import { chargerFermetures } from "@/lib/reservations/fermetures";
import { formatEuros } from "@/lib/reservations/acompte";
import { prochainesSeances } from "@/lib/experiences/seances";
import { formatHeure, formatJours } from "@/types/reservation";
import { annulerPlace, basculerExperience } from "./actions";
import type { Experience, PlaceReservee } from "@/types/experience";
import type { Restaurant } from "@/types/restaurant";

type Place = PlaceReservee & {
  client_nom: string;
  client_email: string;
  client_telephone: string | null;
  montant_centimes: number;
};

function formatJour(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", {
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
        title={`Expériences — ${restaurant.nom}`}
        backHref={`/dashboard/${id}/reservations`}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-4xl text-sm text-zinc-600">
          Un cours, un atelier, une dégustation : une séance à places limitées
          qui revient selon le rythme que tu choisis. Elle apparaît sur ta page
          de réservation, et le client paie sur ton compte Stripe — sans
          commission.
        </p>
        {slug && (
          <a
            href={`/reserver/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
          >
            Voir sur ma page de réservation ↗
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Compteur
          valeur={actives}
          libelle={`expérience${actives > 1 ? "s" : ""} en cours`}
        />
        <Compteur
          valeur={inscrits}
          libelle={`place${inscrits > 1 ? "s" : ""} réservée${inscrits > 1 ? "s" : ""}`}
        />
        <Compteur
          valeur={formatEuros(encaisse)}
          libelle="déjà payés pour les séances à venir"
        />
        <Compteur
          valeur={placesLibres}
          libelle={`place${placesLibres > 1 ? "s" : ""} encore libre${placesLibres > 1 ? "s" : ""} sur 4 semaines`}
        />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="flex min-w-0 flex-col gap-3">
          <TitreSection>Tes expériences</TitreSection>
          {experiences.length === 0 && (
            <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-sm text-zinc-500">
              Aucune expérience pour l&apos;instant. Crée la première à côté :
              une dégustation, un atelier, une soirée à thème.
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
                              arrêtée
                            </span>
                          )}
                        </span>
                        <span className="text-sm text-zinc-500">
                          {formatEuros(experience.prix_centimes)} par personne ·{" "}
                          {experience.places} places ·{" "}
                          {formatHeure(experience.heure)}
                          {experience.duree_minutes &&
                            ` · ${experience.duree_minutes} min`}
                        </span>
                        <span className="text-sm text-zinc-500 first-letter:capitalize">
                          {formatJours(experience.jours)}
                          {!experience.prepaiement && " · paiement sur place"}
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
                          {experience.actif ? "Arrêter" : "Relancer"}
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
                              {formatJour(seance.date)}
                            </span>{" "}
                            —{" "}
                            {seance.raison ??
                              (seance.placesRestantes === 0
                                ? "complet"
                                : `${seance.placesRestantes} place${seance.placesRestantes > 1 ? "s" : ""} libre${seance.placesRestantes > 1 ? "s" : ""}`)}
                          </span>
                        ))}
                        {seances.length === 0 && (
                          <span className="text-sm text-zinc-400">
                            Aucune séance dans les quatre prochaines semaines.
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
                                    {place.places} place
                                    {place.places > 1 ? "s" : ""}
                                  </span>
                                </span>
                                <span className="text-sm text-zinc-500 first-letter:capitalize">
                                  {formatJour(place.date_seance)} ·{" "}
                                  {place.statut === "confirmee"
                                    ? `${formatEuros(place.montant_centimes)} encaissés`
                                    : "en attente de paiement"}
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
                                    Annuler
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
          <TitreSection>Nouvelle expérience</TitreSection>
          <ExperienceForm restaurantId={id} />
        </section>
      </div>
    </div>
  );
}
