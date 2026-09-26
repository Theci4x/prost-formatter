"use client";

import { useActionState, useState } from "react";
import type { RestaurantFormState } from "@/app/dashboard/actions";
import { JOURS_SEMAINE, type JourSemaine } from "@/types/restaurant";
import type { Restaurant } from "@/types/restaurant";
import type { Langue } from "@/lib/i18n/langues";
import { nomJour } from "@/lib/i18n/jours";
import { COMMUN, traducteur } from "@/lib/i18n/t";
import { FICHE } from "@/lib/i18n/pages/fiche";

const initialState: RestaurantFormState = { error: null };

/** « Lundi », « Monday », « 星期一 » : le nom du jour, dans l'ordre de la semaine. */
function libelleJour(jour: JourSemaine, langue: Langue): string {
  const nom = nomJour(JOURS_SEMAINE.indexOf(jour) + 1, langue);
  return nom.charAt(0).toUpperCase() + nom.slice(1);
}

const CHAMP =
  "w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand-navy focus:bg-white";

const HEURE =
  "rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-2 text-sm tabular-nums text-ink outline-none transition-colors focus:border-brand-navy focus:bg-white disabled:opacity-40";

/**
 * Une description se lit en deux phrases sur Google et en un paragraphe
 * sur la vitrine : en dessous, elle ne dit rien ; bien au-dessus, plus
 * personne ne la finit.
 */
const DESCRIPTION_MIN = 200;
const DESCRIPTION_MAX = 700;

function Champ({
  id,
  libelle,
  aide,
  children,
}: {
  id: string;
  libelle: React.ReactNode;
  aide?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-zinc-700">
        {libelle}
      </label>
      {children}
      {aide && <p className="text-xs leading-relaxed text-zinc-500">{aide}</p>}
    </div>
  );
}

/** Une case à cocher qui se lit comme un interrupteur, pas comme un formulaire administratif. */
function Pastille({
  name,
  checked,
  disabled,
  onChange,
  children,
}: {
  name: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (valeur: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-40 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-navy/30 ${
        checked
          ? "border-brand-navy bg-brand-navy text-white"
          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
      }`}
    >
      <input
        type="checkbox"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      {children}
    </label>
  );
}

export function RestaurantForm({
  action,
  restaurant,
  submitLabel,
  langue,
}: {
  action: (
    prevState: RestaurantFormState,
    formData: FormData,
  ) => Promise<RestaurantFormState>;
  restaurant?: Restaurant;
  submitLabel: string;
  langue: Langue;
}) {
  const t = traducteur(langue, FICHE, COMMUN);
  const JOUR_LABELS = Object.fromEntries(
    JOURS_SEMAINE.map((jour) => [jour, libelleJour(jour, langue)]),
  ) as Record<JourSemaine, string>;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [fermes, setFermes] = useState<Record<JourSemaine, boolean>>(() => {
    const initial = {} as Record<JourSemaine, boolean>;
    for (const jour of JOURS_SEMAINE) {
      initial[jour] = restaurant?.horaires?.[jour]?.ferme ?? false;
    }
    return initial;
  });
  // La coupure se coche par jour : beaucoup de maisons servent midi et
  // soir en semaine, et en continu le samedi.
  const [coupures, setCoupures] = useState<Record<JourSemaine, boolean>>(() => {
    const initial = {} as Record<JourSemaine, boolean>;
    for (const jour of JOURS_SEMAINE) {
      initial[jour] = Boolean(restaurant?.horaires?.[jour]?.seconde);
    }
    return initial;
  });
  const [longueur, setLongueur] = useState(
    restaurant?.description?.length ?? 0,
  );
  const joursOuverts = JOURS_SEMAINE.filter((jour) => !fermes[jour]).length;

  return (
    <form
      action={formAction}
      className="grid w-full items-start gap-6 xl:grid-cols-2"
    >
      {restaurant && <input type="hidden" name="id" value={restaurant.id} />}

      {/* Deux cartes côte à côte : ce qui dit qui on est, et quand on
          ouvre. Empilées, les horaires tombaient sous le pli, et c'est
          pourtant ce qu'on vient corriger le plus souvent. */}
      <section className="flex flex-col gap-5 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-2xl text-ink">
            {t("L'établissement")}
          </h2>
          <p className="text-sm text-zinc-500">
            {t(
              "Ce que voient tes clients sur ton site vitrine et ta page de réservation.",
            )}
          </p>
        </div>

        <Champ id="nom" libelle={t("Nom")}>
          <input
            id="nom"
            name="nom"
            type="text"
            required
            defaultValue={restaurant?.nom}
            className={`${CHAMP} font-medium`}
          />
        </Champ>

        <Champ id="adresse" libelle={t("Adresse")}>
          <input
            id="adresse"
            name="adresse"
            type="text"
            autoComplete="street-address"
            defaultValue={restaurant?.adresse ?? ""}
            className={CHAMP}
          />
        </Champ>

        <div className="grid gap-5 sm:grid-cols-2">
          <Champ id="telephone" libelle={t("Téléphone")}>
            <input
              id="telephone"
              name="telephone"
              type="tel"
              defaultValue={restaurant?.telephone ?? ""}
              className={CHAMP}
            />
          </Champ>
          <Champ id="site_web" libelle={t("Site web")}>
            <input
              id="site_web"
              name="site_web"
              type="url"
              placeholder="https://..."
              defaultValue={restaurant?.site_web ?? ""}
              className={CHAMP}
            />
          </Champ>
        </div>

        <Champ
          id="type_cuisine"
          libelle={
            <>
              {t("Type de cuisine")}{" "}
              <span className="font-normal text-zinc-400">
                {t("(ce que cherchent Google et les assistants)")}
              </span>
            </>
          }
          aide={t(
            "Sépare par des virgules. C'est ce qui permet d'être proposé sur « restaurant allemand près de République ».",
          )}
        >
          <input
            id="type_cuisine"
            name="type_cuisine"
            type="text"
            placeholder={t("Allemande, brasserie")}
            defaultValue={restaurant?.type_cuisine ?? ""}
            className={CHAMP}
          />
        </Champ>

        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <div>
            <h3 className="text-sm font-semibold text-ink">Fiches d&apos;avis</h3>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              Colle les URLs publiques exactes de ta fiche Yelp et Tripadvisor.
              Klarr relèvera ensuite la note et le nombre d&apos;avis une fois par
              semaine, sans deviner un établissement homonyme.
            </p>
          </div>
          <Champ id="yelp_url" libelle="Fiche Yelp">
            <input
              id="yelp_url"
              name="yelp_url"
              type="url"
              placeholder="https://www.yelp.fr/biz/..."
              defaultValue={restaurant?.yelp_url ?? ""}
              className={CHAMP}
            />
          </Champ>
          <Champ id="tripadvisor_url" libelle="Fiche Tripadvisor">
            <input
              id="tripadvisor_url"
              name="tripadvisor_url"
              type="url"
              placeholder="https://www.tripadvisor.fr/Restaurant_Review-..."
              defaultValue={restaurant?.tripadvisor_url ?? ""}
              className={CHAMP}
            />
          </Champ>
        </div>

        <Champ
          id="description"
          libelle={t("Description")}
          aide={
            <span className="flex flex-wrap justify-between gap-2">
              <span>
                {t(
                  "Ta cuisine, ton ambiance, ce qui te distingue — en quelques phrases.",
                )}
              </span>
              <span
                className={`tabular-nums ${
                  longueur > 0 &&
                  (longueur < DESCRIPTION_MIN || longueur > DESCRIPTION_MAX)
                    ? "text-brand-orange-dark"
                    : "text-zinc-400"
                }`}
              >
                {t("{n} caractères · idéal {min} à {max}", {
                  n: longueur,
                  min: DESCRIPTION_MIN,
                  max: DESCRIPTION_MAX,
                })}
              </span>
            </span>
          }
        >
          <textarea
            id="description"
            name="description"
            rows={8}
            defaultValue={restaurant?.description ?? ""}
            onChange={(e) => setLongueur(e.target.value.length)}
            className={`${CHAMP} leading-relaxed`}
          />
        </Champ>
      </section>

      <section className="flex flex-col gap-5 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h2 className="font-serif text-2xl text-ink">
              {t("Horaires d'ouverture")}
            </h2>
            <p className="text-sm text-zinc-500">
              {t(
                "Ceux de ta devanture, pas tes créneaux de réservation. Active « Coupure » si tu fermes entre le déjeuner et le dîner.",
              )}
            </p>
          </div>
          <span className="text-xs text-zinc-500">
            {t(joursOuverts > 1 ? "{n} jours sur 7" : "{n} jour sur 7", {
              n: joursOuverts,
            })}
          </span>
        </div>

        <div className="flex flex-col divide-y divide-zinc-100">
          {JOURS_SEMAINE.map((jour) => (
            <div
              key={jour}
              className="grid gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-center"
            >
              <span
                className={`text-sm font-semibold ${
                  fermes[jour] ? "text-zinc-400" : "text-ink"
                }`}
              >
                {JOUR_LABELS[jour]}
              </span>

              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="time"
                    aria-label={t("{jour}, ouverture", {
                      jour: JOUR_LABELS[jour],
                    })}
                    name={`horaire_${jour}_ouverture`}
                    defaultValue={
                      restaurant?.horaires?.[jour]?.ouverture ?? "09:00"
                    }
                    disabled={fermes[jour]}
                    className={HEURE}
                  />
                  <span className="text-sm text-zinc-400">{t("à")}</span>
                  <input
                    type="time"
                    aria-label={t("{jour}, fermeture", {
                      jour: JOUR_LABELS[jour],
                    })}
                    name={`horaire_${jour}_fermeture`}
                    defaultValue={
                      restaurant?.horaires?.[jour]?.fermeture ?? "22:00"
                    }
                    disabled={fermes[jour]}
                    className={HEURE}
                  />
                  <span className="ml-auto flex items-center gap-2">
                    <Pastille
                      name={`horaire_${jour}_coupure`}
                      checked={coupures[jour]}
                      disabled={fermes[jour]}
                      onChange={(valeur) =>
                        setCoupures((prev) => ({ ...prev, [jour]: valeur }))
                      }
                    >
                      {t("Coupure")}
                    </Pastille>
                    <Pastille
                      name={`horaire_${jour}_ferme`}
                      checked={fermes[jour]}
                      onChange={(valeur) =>
                        setFermes((prev) => ({ ...prev, [jour]: valeur }))
                      }
                    >
                      {t("Fermé")}
                    </Pastille>
                  </span>
                </div>

                {/* La seconde plage sur sa propre ligne : six champs alignés
                    débordent d'un téléphone, et c'est là qu'un restaurateur
                    saisit sa fiche. */}
                {coupures[jour] && !fermes[jour] && (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="time"
                      aria-label={t("{jour}, réouverture", {
                        jour: JOUR_LABELS[jour],
                      })}
                      name={`horaire_${jour}_ouverture2`}
                      defaultValue={
                        restaurant?.horaires?.[jour]?.seconde?.ouverture ??
                        "19:00"
                      }
                      className={HEURE}
                    />
                    <span className="text-sm text-zinc-400">{t("à")}</span>
                    <input
                      type="time"
                      aria-label={t("{jour}, seconde fermeture", {
                        jour: JOUR_LABELS[jour],
                      })}
                      name={`horaire_${jour}_fermeture2`}
                      defaultValue={
                        restaurant?.horaires?.[jour]?.seconde?.fermeture ??
                        "23:00"
                      }
                      className={HEURE}
                    />
                    <span className="text-xs text-zinc-500">
                      {t("le soir")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* La barre d'enregistrement suit le défilement : le formulaire est
          long, et on ne doit pas descendre tout en bas pour valider une
          heure changée en haut. */}
      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-4 rounded-2xl border border-zinc-200/70 bg-white/95 px-4 py-3 sm:px-5 sm:py-4 shadow-lg backdrop-blur xl:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
        >
          {pending ? t("Enregistrement...") : submitLabel}
        </button>
        {state.error ? (
          <p className="text-sm text-red-600">{t(state.error)}</p>
        ) : (
          <p className="hidden text-sm text-zinc-500 sm:block">
            {t(
              "Une fois enregistré, tu reviens à l'accueil du tableau de bord.",
            )}
          </p>
        )}
      </div>
    </form>
  );
}
