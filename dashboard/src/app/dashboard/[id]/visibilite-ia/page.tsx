import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import {
  addQuestion,
  analyzeQuestion,
  genererPlan,
  removeQuestion,
  suggestQuestions,
} from "./actions";
import { BoutonLent } from "@/components/visibilite-ia/BoutonLent";
import { configuredProviders } from "@/lib/ai-visibility/providers";
import type { Restaurant } from "@/types/restaurant";
import type {
  AiVisibilityCheck,
  AiVisibilityQuestion,
} from "@/types/ai-visibility";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import {
  INTENTIONS,
  LIBELLE_INTENTION,
  RESUME_INTENTION,
  estIntention,
  type Intention,
} from "@/lib/ai-visibility/intentions";
import { ECRANS, type ActionPlan } from "@/lib/ai-visibility/plan";
import {
  POIDS,
  classement,
  positionMoyenne,
  scoreGlobal,
  tauxParAssistant,
  tauxParIntention,
  type Mesure,
} from "@/lib/ai-visibility/score";

// Interroger un assistant puis en extraire les noms cités dépasse largement
// la durée par défaut d'une fonction serveur. Posée sur la page, la valeur
// s'applique à toutes ses actions serveur.
export const maxDuration = 60;

export default async function VisibiliteIaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");
  await exigerModule(id, "visibilite");

  const supabase = await createClient();

  const { data: restaurantData } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const restaurant = restaurantData as Restaurant | null;
  if (!restaurant) {
    notFound();
  }

  const [questionsResult, checksResult, planResult] = await Promise.all([
    supabase
      .from("ai_visibility_questions")
      .select("*")
      .eq("restaurant_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("ai_visibility_checks")
      .select("*")
      .eq("restaurant_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("ai_visibility_plans")
      .select("actions, genere_le")
      .eq("restaurant_id", id)
      .maybeSingle(),
  ]);

  const questions = (questionsResult.data ?? []) as AiVisibilityQuestion[];
  const checks = (checksResult.data ?? []) as AiVisibilityCheck[];
  const plan = planResult.data as {
    actions: ActionPlan[];
    genere_le: string;
  } | null;

  const intentionDe = new Map<string, Intention>(
    questions.map((q) => [
      q.id,
      estIntention(q.intention) ? q.intention : "decouverte",
    ]),
  );

  // Les analyses arrivent de la plus récente à la plus ancienne. Pour chaque
  // couple (question, assistant), la première est l'état actuel ; la
  // deuxième, l'état précédent — c'est elle qui donne la tendance.
  const dernieres = new Map<string, AiVisibilityCheck>();
  const precedentes = new Map<string, AiVisibilityCheck>();
  for (const check of checks) {
    const cle = `${check.question_id}:${check.fournisseur}`;
    if (!dernieres.has(cle)) dernieres.set(cle, check);
    else if (!precedentes.has(cle)) precedentes.set(cle, check);
  }

  const versMesure = (check: AiVisibilityCheck): Mesure | null => {
    const intention = intentionDe.get(check.question_id);
    if (!intention) return null; // question supprimée depuis
    return {
      questionId: check.question_id,
      intention,
      fournisseur: check.modele,
      estCite: check.est_cite,
      rang: check.rang,
    };
  };

  const actuelles = [...dernieres.values()].flatMap((c) => {
    const m = versMesure(c);
    return m ? [m] : [];
  });
  const score = scoreGlobal(actuelles);

  // La tendance ne se compare qu'à périmètre égal : seulement les couples
  // (question, assistant) analysés deux fois. Rapporter le score du jour,
  // calculé sur trois questions, à celui d'hier calculé sur une seule,
  // produisait un « stable » qui ne voulait rien dire.
  const reanalyses = [...precedentes.keys()].filter((cle) =>
    dernieres.has(cle),
  );
  const mesuresDe = (source: Map<string, AiVisibilityCheck>) =>
    reanalyses.flatMap((cle) => {
      const m = versMesure(source.get(cle)!);
      return m ? [m] : [];
    });
  const avant =
    reanalyses.length > 0 ? scoreGlobal(mesuresDe(precedentes)) : null;
  const apres =
    reanalyses.length > 0 ? scoreGlobal(mesuresDe(dernieres)) : null;
  const delta = avant !== null && apres !== null ? apres - avant : null;
  // Le delta ne porte que sur une partie des questions : on le dit.
  const deltaPartiel = reanalyses.length < dernieres.size;
  const parIntention = tauxParIntention(actuelles);
  const parAssistant = tauxParAssistant(actuelles);
  const position = positionMoyenne(actuelles);
  const podium = classement(
    restaurant.nom,
    [...dernieres.values()]
      .filter((c) => intentionDe.has(c.question_id))
      .map((c) => ({ estCite: c.est_cite, concurrents: c.concurrents })),
  );

  const latestByQuestion = new Map<string, AiVisibilityCheck[]>();
  for (const check of dernieres.values()) {
    const liste = latestByQuestion.get(check.question_id) ?? [];
    liste.push(check);
    latestByQuestion.set(check.question_id, liste);
  }

  const actifs = configuredProviders().map((provider) => provider.label);
  const aDesAnalyses = actuelles.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.visibiliteIa}
        title={`Visibilité IA — ${restaurant.nom}`}
      />

      {actifs.length === 0 && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
          <p className="text-sm font-medium text-orange-900">
            Aucun assistant n&apos;est configuré.
          </p>
          <p className="mt-1 text-sm text-orange-800">
            Les analyses ne peuvent pas être lancées tant qu&apos;aucune clé
            d&apos;API n&apos;est renseignée. Tu peux déjà enregistrer tes
            questions : elles seront analysables dès qu&apos;une clé sera en
            place.
          </p>
        </div>
      )}

      {/* ——— Le cockpit ————————————————————————————————————————— */}
      {aDesAnalyses ? (
        <section className="relative overflow-hidden rounded-3xl bg-brand-navy p-6 text-white shadow-xl sm:p-8">
          {/* Une lueur, pas un décor : elle donne de la profondeur au bloc
              sans concurrencer les chiffres. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-orange/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl"
          />

          <div className="relative grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)] xl:grid-cols-[auto_minmax(0,1fr)_minmax(0,24rem)]">
            {/* Le score */}
            <div className="flex flex-col items-center gap-3 lg:items-start">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
                Score de visibilité IA
              </p>
              <Anneau valeur={score ?? 0} />
              <div className="flex flex-col items-center gap-1 lg:items-start">
                {delta !== null && (
                  <p
                    className={`font-mono text-sm tabular-nums ${
                      delta > 0
                        ? "text-emerald-300"
                        : delta < 0
                          ? "text-orange-300"
                          : "text-white/50"
                    }`}
                  >
                    {delta === 0
                      ? "= stable"
                      : `${delta > 0 ? "▲ +" : "▼ "}${delta}`}{" "}
                    {deltaPartiel
                      ? "sur les questions réanalysées"
                      : "depuis la dernière analyse"}
                  </p>
                )}
                <p className="text-xs text-white/50">
                  {actuelles.length} réponse{actuelles.length > 1 ? "s" : ""} ·{" "}
                  {parAssistant.length} assistant
                  {parAssistant.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Les trois intentions */}
            <div className="flex flex-col justify-center gap-4">
              <div className="flex flex-col gap-4">
                {INTENTIONS.map((intention) => {
                  const t = parIntention[intention];
                  return (
                    <div key={intention} className="flex flex-col gap-1.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-medium">
                            {LIBELLE_INTENTION[intention]}
                          </span>
                          <span className="rounded-full border border-white/15 px-1.5 py-px font-mono text-[10px] text-white/60">
                            ×{POIDS[intention].toFixed(1)}
                          </span>
                        </div>
                        <span className="font-mono text-sm tabular-nums text-white/80">
                          {t.part === null
                            ? "—"
                            : `${Math.round(t.part * 100)} %`}
                          <span className="ml-2 text-xs text-white/40">
                            {t.analysees > 0 && `${t.citees}/${t.analysees}`}
                          </span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-brand-orange transition-[width]"
                          style={{
                            width: `${Math.round((t.part ?? 0) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Les chiffres qui se lisent d'un coup */}
            <div className="flex flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <Indicateur
                  libelle="Rang parmi les noms cités"
                  valeur={podium.rang !== null ? `#${podium.rang}` : "—"}
                  detail={
                    podium.rang !== null ? `sur ${podium.total}` : undefined
                  }
                />
                <Indicateur
                  libelle="Position moyenne quand cité"
                  valeur={position !== null ? `${position}` : "—"}
                  detail={position !== null ? "dans la réponse" : "jamais cité"}
                />
                <Indicateur
                  libelle="Questions suivies"
                  valeur={`${questions.length}`}
                  detail={`${latestByQuestion.size} analysée${
                    latestByQuestion.size > 1 ? "s" : ""
                  }`}
                />
              </div>

              {/* Par assistant */}
              {parAssistant.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-white/50">Par assistant</span>
                  {parAssistant.map(({ fournisseur, taux }) => (
                    <span
                      key={fournisseur}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs"
                    >
                      <span className="font-medium">{fournisseur}</span>
                      <span className="font-mono tabular-nums text-white/70">
                        {taux.part === null
                          ? "—"
                          : `${Math.round(taux.part * 100)} %`}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <details className="relative mt-6 text-xs text-white/60">
            <summary className="cursor-pointer select-none hover:text-white">
              Comment lire ce score
            </summary>
            <p className="mt-2 max-w-2xl leading-relaxed">
              Pour chaque intention, on compte la part des réponses où tu es
              cité. Le score les pondère : « on me réserve » compte pour la
              moitié, « on me compare » pour trois dixièmes, « on me découvre »
              pour deux. Une intention sans analyse est simplement ignorée, elle
              ne te pénalise pas. Le rang te compte parmi tous les noms que les
              assistants ont cités sur tes questions.
            </p>
          </details>
        </section>
      ) : (
        <Demarrage pretes={questions.length} />
      )}

      {aDesAnalyses && (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {/* ——— Le plan d'action ————————————————————————————————— */}
          <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <Titre numero="01">Ce que tu peux faire</Titre>
              {plan && (
                <span className="font-mono text-xs text-zinc-400">
                  écrit le{" "}
                  {new Date(plan.genere_le).toLocaleDateString("fr-FR")}
                </span>
              )}
            </div>

            {plan && plan.actions.length > 0 ? (
              <ol className="flex flex-col gap-2">
                {plan.actions.map((action, rang) => (
                  <li
                    key={`${rang}-${action.titre}`}
                    className="group flex gap-4 rounded-2xl border border-line bg-paper p-4 shadow-sm transition-colors hover:border-brand-navy/30"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-navy font-mono text-xs font-semibold text-white">
                      {rang + 1}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <p className="text-sm font-semibold text-ink">
                          {action.titre}
                        </p>
                        {rang === 0 && (
                          <span className="rounded-full bg-brand-orange-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-orange-dark">
                            Priorité
                          </span>
                        )}
                      </div>
                      {action.pourquoi && (
                        <p className="text-sm leading-relaxed text-ink-soft">
                          {action.pourquoi}
                        </p>
                      )}
                      {action.ecran && (
                        <Link
                          href={`/dashboard/${id}/${ECRANS[action.ecran].chemin}`}
                          className="mt-1 w-fit text-xs font-semibold text-brand-orange hover:underline"
                        >
                          Ouvrir « {ECRANS[action.ecran].libelle} » →
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-ink-soft">
                Pas encore de plan. Il se déduit de tes analyses et de ta fiche
                — carte, photos, questions fréquentes, espaces privatisables.
              </p>
            )}

            <BoutonLent
              action={genererPlan}
              champs={{ restaurant_id: id }}
              libelle={plan ? "Réécrire le plan" : "Écrire mon plan d'action"}
              enCours="Claude lit tes analyses et ta fiche…"
              className={
                plan
                  ? "text-sm font-medium text-brand-orange hover:underline"
                  : "rounded-md bg-brand-orange px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:brightness-95"
              }
            />
          </section>

          {/* ——— Le classement ————————————————————————————————————— */}
          {podium.lignes.length > 1 && (
            <section className="flex flex-col gap-3">
              <Titre numero="02">Qui l&apos;IA cite à ta place</Titre>
              <p className="text-xs leading-relaxed text-ink-soft">
                Nombre de réponses où chaque nom apparaît, sur les{" "}
                {actuelles.length} analysées. Toi compris.
              </p>
              <ol className="flex flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-sm">
                {podium.lignes.map((ligne, index) => {
                  const max = podium.lignes[0]?.fois || 1;
                  // Quand l'établissement est loin derrière, on saute des
                  // noms pour le garder visible : le dire évite de croire
                  // que la liste est continue.
                  const saut =
                    podium.omis > 0 && index === podium.lignes.length - 1;
                  return (
                    <Fragment key={ligne.nom}>
                      {saut && (
                        <li className="border-t border-line px-4 py-2 text-center text-xs text-zinc-400">
                          … {podium.omis} autre{podium.omis > 1 ? "s" : ""} nom
                          {podium.omis > 1 ? "s" : ""} cité
                          {podium.omis > 1 ? "s" : ""}
                        </li>
                      )}
                      <li
                        className={`grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-4 py-3 ${
                          index > 0 ? "border-t border-line" : ""
                        } ${ligne.toi ? "bg-brand-orange-soft/60" : ""}`}
                      >
                        <span
                          className={`font-mono text-sm tabular-nums ${
                            ligne.toi
                              ? "font-semibold text-brand-orange-dark"
                              : "text-zinc-400"
                          }`}
                        >
                          #{ligne.rang}
                        </span>
                        <div className="flex min-w-0 flex-col gap-1.5">
                          <div className="flex items-baseline gap-2">
                            <span
                              className={`truncate text-sm ${
                                ligne.toi
                                  ? "font-semibold text-ink"
                                  : "text-ink"
                              }`}
                            >
                              {ligne.nom}
                            </span>
                            {ligne.toi && (
                              <span className="rounded-full bg-brand-orange px-1.5 py-px text-[10px] font-semibold uppercase tracking-wider text-white">
                                toi
                              </span>
                            )}
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-zinc-100">
                            <div
                              className={`h-1.5 rounded-full ${
                                ligne.toi ? "bg-brand-orange" : "bg-brand-navy"
                              }`}
                              style={{
                                width: `${Math.max(3, (ligne.fois / max) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                        <span className="font-mono text-sm tabular-nums text-ink-soft">
                          {ligne.fois}
                        </span>
                      </li>
                    </Fragment>
                  );
                })}
              </ol>
            </section>
          )}
        </div>
      )}

      {/* ——— Les questions suivies ————————————————————————————— */}
      <section className="flex flex-col gap-4">
        <Titre numero={aDesAnalyses ? "03" : "01"}>Tes questions</Titre>

        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-5 shadow-sm">
          <form action={addQuestion} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="restaurant_id" value={id} />
            <div className="flex flex-1 basis-56 flex-col gap-1">
              <label className="text-xs font-medium text-ink-soft">
                Une question que poserait un client
              </label>
              <input
                name="question"
                type="text"
                required
                placeholder="ex : où réserver pour un anniversaire dans le 11e ?"
                className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-navy"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-ink-soft">
                Ce que le client cherche
              </label>
              <select
                name="intention"
                defaultValue="reservation"
                className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-navy"
              >
                {INTENTIONS.map((intention) => (
                  <option key={intention} value={intention}>
                    {LIBELLE_INTENTION[intention]}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-navy-hover"
            >
              Ajouter
            </button>
          </form>

          <BoutonLent
            action={suggestQuestions}
            champs={{ restaurant_id: id }}
            libelle={
              questions.length === 0
                ? "Commencer : proposer six questions"
                : "Proposer d'autres questions"
            }
            enCours="Le modèle écrit tes questions…"
            className={
              questions.length === 0
                ? "rounded-md bg-brand-orange px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:brightness-95"
                : "text-sm font-medium text-brand-orange hover:underline"
            }
          />

          <p className="text-xs leading-relaxed text-ink-soft">
            Les propositions partent de tes mots-clés et, si ton compte Google
            est relié, des requêtes réellement tapées par ceux qui t&apos;ont
            trouvé.
          </p>
        </div>

        {INTENTIONS.map((intention) => {
          const liste = questions.filter(
            (q) => intentionDe.get(q.id) === intention,
          );
          if (liste.length === 0) return null;
          const t = parIntention[intention];
          return (
            <div key={intention} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm font-semibold text-ink">
                    {LIBELLE_INTENTION[intention]}
                  </h3>
                  <p className="text-xs leading-relaxed text-ink-soft">
                    {RESUME_INTENTION[intention]}
                  </p>
                </div>
                {t.part !== null && (
                  <span className="font-mono text-xs tabular-nums text-ink-soft">
                    cité {Math.round(t.part * 100)} % · {t.citees}/{t.analysees}
                  </span>
                )}
              </div>
              <ul className="grid gap-2 xl:grid-cols-2">
                {liste.map((question) => (
                  <CarteQuestion
                    key={question.id}
                    restaurantId={id}
                    question={question}
                    results={latestByQuestion.get(question.id) ?? []}
                    analysable={actifs.length > 0}
                  />
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <p className="max-w-3xl text-xs leading-relaxed text-zinc-400">
        Assistants interrogés aujourd&apos;hui :{" "}
        {actifs.length > 0 ? actifs.join(", ") : "aucun"}. Les autres
        s&apos;activeront automatiquement dès que leur clé d&apos;API sera
        renseignée. Les analyses portent sur les connaissances propres de chaque
        assistant ; les réponses affichées dans les applications grand public
        (qui vont chercher sur le web en direct) demanderaient un accès
        supplémentaire.
      </p>
    </div>
  );
}

/* ——— Pièces ———————————————————————————————————————————————————— */

/** Un titre de section numéroté, à la manière d'un tableau de bord. */
function Titre({
  numero,
  children,
}: {
  numero: string;
  children: React.ReactNode;
}) {
  return (
    <h2 className="flex items-baseline gap-3 text-sm font-semibold text-ink">
      <span className="font-mono text-xs text-brand-orange">{numero}</span>
      {children}
    </h2>
  );
}

/** Un chiffre secondaire dans le cockpit. */
function Indicateur({
  libelle,
  valeur,
  detail,
}: {
  libelle: string;
  valeur: string;
  detail?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-[11px] uppercase tracking-wider text-white/50">
        {libelle}
      </p>
      <p className="font-mono text-2xl font-semibold tabular-nums">
        {valeur}
        {detail && (
          <span className="ml-2 font-sans text-xs font-normal text-white/50">
            {detail}
          </span>
        )}
      </p>
    </div>
  );
}

/**
 * L'anneau du score.
 *
 * Un SVG pur, rendu côté serveur : pas de bibliothèque, pas de script.
 * La circonférence est calculée pour que le trait d'avancement soit exact.
 */
function Anneau({ valeur }: { valeur: number }) {
  const rayon = 56;
  const circonference = 2 * Math.PI * rayon;
  const avance = (Math.max(0, Math.min(100, valeur)) / 100) * circonference;
  return (
    <div className="relative h-40 w-40">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle
          cx="70"
          cy="70"
          r={rayon}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="10"
        />
        <circle
          cx="70"
          cy="70"
          r={rayon}
          fill="none"
          stroke="var(--color-brand-orange)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${avance} ${circonference - avance}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-5xl font-semibold tabular-nums leading-none">
          {valeur}
        </span>
        <span className="mt-1 text-xs text-white/50">/ 100</span>
      </div>
    </div>
  );
}

/** Ce qu'on voit avant la première analyse : trois pas, pas un vide. */
function Demarrage({ pretes }: { pretes: number }) {
  const etapes = [
    {
      titre: "Pose les questions de tes clients",
      texte:
        "Six sont proposées d'un clic, à partir de tes mots-clés et de ce que tes clients tapent sur Google.",
      faite: pretes > 0,
    },
    {
      titre: "Lance une analyse",
      texte:
        "Chaque assistant configuré répond comme il le ferait à un client. On note si tu es cité, à quelle place, et qui l'est à ta place.",
      faite: false,
    },
    {
      titre: "Applique ton plan",
      texte:
        "Claude croise les réponses et ta fiche Klarr pour te dire quoi corriger, et où.",
      faite: false,
    },
  ];
  return (
    <section className="relative overflow-hidden rounded-3xl bg-brand-navy p-6 text-white shadow-xl sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-orange/25 blur-3xl"
      />
      <div className="relative flex flex-col gap-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
            Score de visibilité IA
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/80">
            De plus en plus de clients demandent à une IA où aller manger. Cette
            page mesure si ton restaurant fait partie des réponses — et te dit
            quoi faire pour y entrer.
          </p>
        </div>
        <ol className="grid gap-3 sm:grid-cols-3">
          {etapes.map((etape, i) => (
            <li
              key={etape.titre}
              className={`flex flex-col gap-2 rounded-2xl border p-4 ${
                etape.faite
                  ? "border-emerald-400/40 bg-emerald-400/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <span className="font-mono text-xs text-brand-orange">
                0{i + 1} {etape.faite && "✓"}
              </span>
              <p className="text-sm font-semibold">{etape.titre}</p>
              <p className="text-xs leading-relaxed text-white/60">
                {etape.texte}
              </p>
            </li>
          ))}
        </ol>
        <p className="text-xs text-white/50">
          {pretes === 0
            ? "Commence par le bouton orange ci-dessous."
            : `${pretes} question${pretes > 1 ? "s" : ""} prête${pretes > 1 ? "s" : ""} — lance une analyse ci-dessous.`}
        </p>
      </div>
    </section>
  );
}

/**
 * Une question suivie, et ce que chaque assistant en a dit.
 *
 * Sortie de la page parce que la liste se regroupe par intention : la même
 * carte se rend dans trois sections.
 */
function CarteQuestion({
  restaurantId,
  question,
  results,
  analysable,
}: {
  restaurantId: string;
  question: AiVisibilityQuestion;
  results: AiVisibilityCheck[];
  analysable: boolean;
}) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-ink">{question.question}</p>
        <form action={removeQuestion}>
          <input type="hidden" name="restaurant_id" value={restaurantId} />
          <input type="hidden" name="question_id" value={question.id} />
          <button
            type="submit"
            aria-label="Supprimer la question"
            className="shrink-0 text-xs text-zinc-400 transition-colors hover:text-red-600"
          >
            Supprimer
          </button>
        </form>
      </div>

      {results.length > 0 ? (
        <>
          {/* Le verdict par assistant, lisible d'un coup d'œil. */}
          <div className="flex flex-wrap gap-2">
            {results.map((check) => (
              <span
                key={check.id}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
                  check.est_cite
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-line bg-zinc-50 text-ink-soft"
                }`}
              >
                <span className="font-medium">{check.modele}</span>
                <span className="font-mono tabular-nums">
                  {check.est_cite
                    ? `cité${check.rang ? ` #${check.rang}` : ""}`
                    : "non cité"}
                </span>
              </span>
            ))}
          </div>

          <details className="text-sm text-ink-soft">
            <summary className="cursor-pointer text-xs text-ink-soft hover:text-ink">
              Voir les réponses et les concurrents cités
            </summary>
            <div className="mt-3 flex flex-col gap-3">
              {results.map((check) => (
                <div
                  key={check.id}
                  className="flex flex-col gap-2 border-t border-line pt-3"
                >
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-sm font-medium text-ink">
                      {check.modele}
                    </span>
                    <span className="font-mono text-xs text-zinc-400">
                      {new Date(check.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  {check.concurrents.length > 0 && (
                    <p className="text-sm leading-relaxed">
                      Cités à ta place : {check.concurrents.join(", ")}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {check.reponse}
                  </p>
                </div>
              ))}
            </div>
          </details>
        </>
      ) : (
        <p className="text-sm text-ink-soft">Pas encore analysée.</p>
      )}

      {analysable ? (
        <BoutonLent
          action={analyzeQuestion}
          champs={{ restaurant_id: restaurantId, question_id: question.id }}
          libelle={results.length > 0 ? "Relancer l'analyse" : "Analyser"}
          // Une demi-minute sans rien à l'écran passe pour une panne. Dire
          // qui travaille, et à quoi s'attendre, suffit à faire patienter.
          enCours="Les assistants répondent… (30 s à 1 min)"
          className="w-fit rounded-md border border-line px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
        />
      ) : (
        <button
          type="button"
          disabled
          className="w-fit cursor-not-allowed rounded-md border border-line px-3 py-1.5 text-xs font-medium text-zinc-700 opacity-40"
        >
          Analyser
        </button>
      )}
    </li>
  );
}
