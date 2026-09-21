import type { Langue } from "@/lib/i18n/langues";
import { RESERVER } from "@/lib/i18n/reserver";
import { InscriptionForm } from "./InscriptionForm";
import { formatEuros } from "@/lib/reservations/acompte";
import { formatHeure } from "@/types/reservation";
import type { Seance } from "@/lib/experiences/seances";
import type { Experience } from "@/types/experience";

function formatJour(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/**
 * Les ateliers et cours proposés par l'établissement. Séparés des créneaux
 * de table : on ne vient pas dîner, on vient apprendre à faire un cocktail,
 * et les mélanger brouillerait les deux.
 */
export function SectionExperiences({
  slug,
  experiences,
  seancesParExperience,
  langue,
}: {
  slug: string;
  experiences: Experience[];
  seancesParExperience: Map<string, Seance[]>;
  langue: Langue;
}) {
  const r = RESERVER[langue];
  const avecSeances = experiences.filter(
    (experience) => (seancesParExperience.get(experience.id) ?? []).length > 0,
  );
  if (avecSeances.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-zinc-900">
          {r.ateliersTitre}
        </h2>
        <p className="text-sm text-zinc-500">{r.ateliersChapo}</p>
      </div>

      {avecSeances.map((experience) => {
        const seances = seancesParExperience.get(experience.id) ?? [];
        return (
          <div
            key={experience.id}
            className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-medium text-zinc-900">
                {experience.nom}
              </span>
              <span className="text-sm text-zinc-600">
                {formatEuros(experience.prix_centimes)} par personne
              </span>
            </div>

            <span className="text-sm text-zinc-500">
              {formatHeure(experience.heure)}
              {experience.duree_minutes && ` · ${experience.duree_minutes} min`}
              {` · ${experience.places} places`}
              {!experience.prepaiement && " · paiement sur place"}
            </span>

            {experience.description && (
              <p className="text-sm text-zinc-600">{experience.description}</p>
            )}

            <ul className="flex flex-col divide-y divide-zinc-100">
              {seances.map((seance) => (
                <li key={seance.date} className="flex flex-col py-3 first:pt-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-zinc-900 first-letter:capitalize">
                      {formatJour(seance.date)}
                    </span>
                    <span className="text-sm text-zinc-500">
                      {/* Le motif est dit plutôt que la séance masquée :
                          « complet » et « trop tard » ne se corrigent pas de
                          la même façon. */}
                      {seance.raison ??
                        `${seance.placesRestantes} place${seance.placesRestantes > 1 ? "s" : ""} restante${seance.placesRestantes > 1 ? "s" : ""}`}
                    </span>
                  </div>

                  {!seance.raison && (
                    <InscriptionForm
                      slug={slug}
                      experienceId={experience.id}
                      date={seance.date}
                      prixCentimes={experience.prix_centimes}
                      placesRestantes={seance.placesRestantes}
                      prepaiement={experience.prepaiement}
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
