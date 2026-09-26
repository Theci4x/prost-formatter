import type { Langue } from "@/lib/i18n/langues";
import { RESERVER } from "@/lib/i18n/reserver";
import { InscriptionForm } from "./InscriptionForm";
import { sommeEuros } from "@/lib/i18n/nombres";
import { heure as heureTraduite } from "@/lib/i18n/jours";
import { dateJour } from "@/lib/i18n/dates";
import type { Seance } from "@/lib/experiences/seances";
import type { Experience } from "@/types/experience";

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
  nomMaison,
}: {
  slug: string;
  experiences: Experience[];
  seancesParExperience: Map<string, Seance[]>;
  langue: Langue;
  nomMaison: string;
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
                {sommeEuros(experience.prix_centimes, langue)} {r.parPersonne}
              </span>
            </div>

            <span className="text-sm text-zinc-500">
              {heureTraduite(experience.heure, langue)}
              {experience.duree_minutes && ` · ${experience.duree_minutes} min`}
              {` · ${r.placesEnTout(experience.places)}`}
              {!experience.prepaiement && ` · ${r.paiementSurPlace}`}
            </span>

            {experience.description && (
              <p className="text-sm text-zinc-600">{experience.description}</p>
            )}

            <ul className="flex flex-col divide-y divide-zinc-100">
              {seances.map((seance) => (
                <li key={seance.date} className="flex flex-col py-3 first:pt-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-zinc-900 first-letter:capitalize">
                      {dateJour(seance.date, langue)}
                    </span>
                    <span className="text-sm text-zinc-500">
                      {/* Le motif est dit plutôt que la séance masquée :
                          « complet » et « trop tard » ne se corrigent pas de
                          la même façon. */}
                      {seance.raison ??
                        r.placesRestantes(seance.placesRestantes)}
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
                      langue={langue}
                      nomMaison={nomMaison}
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
