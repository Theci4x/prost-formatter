import { Fragment } from "react";
import Link from "next/link";
import { Markdown } from "@/components/texte/Markdown";
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
  evolution,
  partDeVoix,
  positionMoyenne,
  scoreGlobal,
  tauxParAssistant,
  tauxParIntention,
  type Mesure,
} from "@/lib/ai-visibility/score";
import { PartDeVoix } from "@/components/visibilite-ia/PartDeVoix";
import { langueUtilisateur } from "@/lib/i18n/langue";
import type { Langue } from "@/lib/i18n/langues";
import { localeDe } from "@/lib/i18n/seo";
import { COMMUN, traducteur, type T } from "@/lib/i18n/t";
import { VISIBILITE_IA } from "@/lib/i18n/pages/visibiliteIa";

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

  const langue = await langueUtilisateur();
  const t = traducteur(langue, VISIBILITE_IA, COMMUN);
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
  // Agréger tous les concurrents dans un seul tableau les dilue : Moonshiner
  // te bat sur « speakeasy », La Fine Mousse sur « bière », et mélangés ils
  // ne disent plus rien. On sépare donc ce qui remplit la salle du reste.
  const reponsesOu = (garde: (intention: Intention) => boolean) =>
    [...dernieres.values()].flatMap((c) => {
      const intention = intentionDe.get(c.question_id);
      if (!intention || !garde(intention)) return [];
      return [{ estCite: c.est_cite, concurrents: c.concurrents }];
    });

  const toutes = reponsesOu(() => true);
  const reservation = reponsesOu((intention) => intention === "reservation");
  const podium = classement(restaurant.nom, toutes);
  const podiumReservation = classement(restaurant.nom, reservation);

  // La courbe et la part de voix se lisent sur tout l'historique, pas sur
  // la dernière analyse : c'est leur seul intérêt.
  const releves = checks.flatMap((check) =>
    intentionDe.has(check.question_id)
      ? [
          {
            jour: check.created_at.slice(0, 10),
            estCite: check.est_cite,
            concurrents: check.concurrents,
          },
        ]
      : [],
  );
  const series = evolution(releves, restaurant.nom);
  const voix = partDeVoix(releves, restaurant.nom);

  const latestByQuestion = new Map<string, AiVisibilityCheck[]>();
  for (const check of dernieres.values()) {
    const liste = latestByQuestion.get(check.question_id) ?? [];
    liste.push(check);
    latestByQuestion.set(check.question_id, liste);
  }

  const actifs = configuredProviders().map((provider) => provider.label);
  const aDesAnalyses = actuelles.length > 0;

  const sommaire = [
    { ancre: "plan", titre: t("Ce que tu peux faire") },
    ...(podium.lignes.length > 1
      ? [{ ancre: "classement", titre: t("Qui l'IA cite à ta place") }]
      : []),
    ...(voix !== null
      ? [{ ancre: "part-de-voix", titre: t("Ta part de voix") }]
      : []),
    {
      ancre: "questions",
      titre: t("Tes questions ({n})", { n: questions.length }),
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-3">
        <PageHeader
          icon={dashboardIcons.visibiliteIa}
          title={t("Visibilité IA — {nom}", { nom: restaurant.nom })}
        />
        <p className="max-w-4xl text-sm text-zinc-600">
          {t(
            "De plus en plus de clients demandent à ChatGPT, Claude ou Gemini où aller manger. Pose les questions qu'ils poseraient : Klarr regarde si les assistants te citent, qui ils citent à ta place, et te dit quoi corriger.",
          )}
        </p>
      </div>

      {actifs.length === 0 && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
          <p className="text-sm font-medium text-orange-900">
            {t("Aucun assistant n'est configuré.")}
          </p>
          <p className="mt-1 text-sm text-orange-800">
            {t(
              "Les analyses ne peuvent pas être lancées tant qu'aucune clé d'API n'est renseignée. Tu peux déjà enregistrer tes questions : elles seront analysables dès qu'une clé sera en place.",
            )}
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
                {t("Score de visibilité IA")}
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
                      ? t("= stable")
                      : `${delta > 0 ? "▲ +" : "▼ "}${delta}`}{" "}
                    {deltaPartiel
                      ? t("sur les questions réanalysées")
                      : t("depuis la dernière analyse")}
                  </p>
                )}
                <p className="text-xs text-white/50">
                  {t(actuelles.length > 1 ? "{n} réponses" : "{n} réponse", {
                    n: actuelles.length,
                  })}{" "}
                  ·{" "}
                  {t(
                    parAssistant.length > 1
                      ? "{n} assistants"
                      : "{n} assistant",
                    { n: parAssistant.length },
                  )}
                </p>
              </div>
            </div>

            {/* Les trois intentions */}
            <div className="flex flex-col justify-center gap-4">
              <div className="flex flex-col gap-4">
                {INTENTIONS.map((intention) => {
                  const taux = parIntention[intention];
                  return (
                    <div key={intention} className="flex flex-col gap-1.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-medium">
                            {t(LIBELLE_INTENTION[intention])}
                          </span>
                          <span className="rounded-full border border-white/15 px-1.5 py-px font-mono text-[10px] text-white/60">
                            ×{POIDS[intention].toFixed(1)}
                          </span>
                        </div>
                        <span className="font-mono text-sm tabular-nums text-white/80">
                          {taux.part === null
                            ? "—"
                            : `${Math.round(taux.part * 100)} %`}
                          <span className="ml-2 text-xs text-white/40">
                            {taux.analysees > 0 &&
                              `${taux.citees}/${taux.analysees}`}
                          </span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-brand-orange transition-[width]"
                          style={{
                            width: `${Math.round((taux.part ?? 0) * 100)}%`,
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
                  libelle={t("Rang parmi les noms cités")}
                  valeur={podium.rang !== null ? `#${podium.rang}` : "—"}
                  detail={
                    podium.rang !== null
                      ? t("sur {n}", { n: podium.total })
                      : undefined
                  }
                />
                <Indicateur
                  libelle={t("Position moyenne quand cité")}
                  valeur={position !== null ? `${position}` : "—"}
                  detail={
                    position !== null ? t("dans la réponse") : t("jamais cité")
                  }
                />
                <Indicateur
                  libelle={t("Questions suivies")}
                  valeur={`${questions.length}`}
                  detail={t(
                    latestByQuestion.size > 1
                      ? "{n} analysées"
                      : "{n} analysée",
                    { n: latestByQuestion.size },
                  )}
                />
              </div>

              {/* Par assistant */}
              {parAssistant.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-white/50">
                    {t("Par assistant")}
                  </span>
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
              {t("Comment lire ce score")}
            </summary>
            <p className="mt-2 max-w-4xl leading-relaxed">
              {t(
                "Pour chaque intention, on compte la part des réponses où tu es cité. Le score les pondère : « on me réserve » compte pour la moitié, « on me compare » pour trois dixièmes, « on me découvre » pour deux. Une intention sans analyse est simplement ignorée, elle ne te pénalise pas. Le rang te compte parmi tous les noms que les assistants ont cités sur tes questions.",
              )}
            </p>
          </details>
        </section>
      ) : (
        <Demarrage pretes={questions.length} t={t} />
      )}

      {/* Le sommaire : quatre blocs l'un sous l'autre, dont le dernier —
          les questions — est le plus long. On y saute sans défiler. */}
      {aDesAnalyses && (
        <nav className="flex flex-wrap gap-2">
          {sommaire.map((entree) => (
            <a
              key={entree.ancre}
              href={`#${entree.ancre}`}
              className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-ink hover:text-ink"
            >
              {entree.titre}
            </a>
          ))}
        </nav>
      )}

      {aDesAnalyses && (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {/* ——— Le plan d'action ————————————————————————————————— */}
          <section id="plan" className="flex scroll-mt-8 flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <Titre numero="01">{t("Ce que tu peux faire")}</Titre>
              {plan && (
                <span className="font-mono text-xs text-zinc-400">
                  {t("écrit le {date}", {
                    date: new Date(plan.genere_le).toLocaleDateString(
                      localeDe(langue),
                    ),
                  })}
                </span>
              )}
            </div>

            {plan && plan.actions.length > 0 ? (
              <ol className="flex flex-col gap-2">
                {plan.actions.map((action, rang) => (
                  <li
                    key={`${rang}-${action.titre}`}
                    className="group flex gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-navy font-mono text-xs font-semibold text-white">
                      {rang + 1}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <p className="text-base font-semibold text-ink">
                          {action.titre}
                        </p>
                        {rang === 0 && (
                          <span className="rounded-full bg-brand-orange-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-orange-dark">
                            {t("Priorité")}
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
                          className="mt-1 w-fit text-sm font-semibold text-brand-orange-dark hover:underline"
                        >
                          {t("Ouvrir « {ecran} » →", {
                            ecran: t(ECRANS[action.ecran].libelle),
                          })}
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-ink-soft">
                {t(
                  "Pas encore de plan. Il se déduit de tes analyses et de ta fiche — carte, photos, questions fréquentes, espaces privatisables.",
                )}
              </p>
            )}

            <BoutonLent
              action={genererPlan}
              champs={{ restaurant_id: id }}
              langue={langue}
              libelle={
                plan ? t("Réécrire le plan") : t("Écrire mon plan d'action")
              }
              enCours={t("Claude lit tes analyses et ta fiche…")}
              className={
                plan
                  ? "rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
                  : "rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
              }
            />
          </section>

          {/* ——— Le classement ————————————————————————————————————— */}
          {podium.lignes.length > 1 && (
            <section
              id="classement"
              className="flex scroll-mt-8 flex-col gap-3"
            >
              <Titre numero="02">{t("Qui l'IA cite à ta place")}</Titre>

              {/* Ceux qui te battent quand le client veut réserver sont tes
                  vrais concurrents commerciaux ; les autres partagent
                  seulement un mot-clé avec toi. */}
              {podiumReservation.lignes.length > 1 ? (
                <>
                  <Palmares
                    t={t}
                    titre={t("Quand le client veut réserver")}
                    podium={podiumReservation}
                    analysees={reservation.length}
                  />
                  <details className="flex flex-col gap-2">
                    <summary className="cursor-pointer text-xs text-ink-soft hover:text-ink">
                      {t("Voir aussi toutes questions confondues")}
                    </summary>
                    <div className="mt-2">
                      <Palmares
                        t={t}
                        podium={podium}
                        analysees={toutes.length}
                      />
                    </div>
                  </details>
                </>
              ) : (
                <>
                  <Palmares t={t} podium={podium} analysees={toutes.length} />
                  <p className="text-xs leading-relaxed text-ink-soft">
                    {t(
                      "Analyse une question « On me réserve » et ce tableau se dédoublera : tes vrais concurrents ne sont pas ceux qui partagent un mot-clé avec toi, ce sont ceux qu'on cite quand un client cherche où réserver.",
                    )}
                  </p>
                </>
              )}
            </section>
          )}
        </div>
      )}

      {/* ——— L'évolution ——————————————————————————————————————— */}
      {aDesAnalyses && voix !== null && (
        <section id="part-de-voix" className="flex scroll-mt-8 flex-col gap-3">
          <Titre numero="03">{t("Ta part de voix")}</Titre>
          <PartDeVoix
            series={series}
            voix={voix}
            reponses={releves.length}
            langue={langue}
          />
        </section>
      )}

      {/* ——— Les questions suivies ————————————————————————————— */}
      <section id="questions" className="flex scroll-mt-8 flex-col gap-4">
        <Titre numero={aDesAnalyses ? "04" : "01"}>{t("Tes questions")}</Titre>

        <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
          <form action={addQuestion} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="restaurant_id" value={id} />
            <div className="flex flex-1 basis-56 flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700">
                {t("Une question que poserait un client")}
              </label>
              <input
                name="question"
                type="text"
                required
                placeholder={t(
                  "ex : où réserver pour un anniversaire dans le 11e ?",
                )}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-navy focus:bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700">
                {t("Ce que le client cherche")}
              </label>
              <select
                name="intention"
                defaultValue="reservation"
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-navy focus:bg-white"
              >
                {INTENTIONS.map((intention) => (
                  <option key={intention} value={intention}>
                    {t(LIBELLE_INTENTION[intention])}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
            >
              {t("Ajouter")}
            </button>
          </form>

          <BoutonLent
            action={suggestQuestions}
            champs={{ restaurant_id: id }}
            langue={langue}
            libelle={
              questions.length === 0
                ? t("Commencer : proposer six questions")
                : t("Proposer d'autres questions")
            }
            enCours={t("Le modèle écrit tes questions…")}
            className={
              questions.length === 0
                ? "rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
                : "rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
            }
          />

          <p className="text-xs leading-relaxed text-ink-soft">
            {t(
              "Les propositions partent de tes mots-clés et, si ton compte Google est relié, des requêtes réellement tapées par ceux qui t'ont trouvé.",
            )}
          </p>
        </div>

        {INTENTIONS.map((intention) => {
          const liste = questions.filter(
            (q) => intentionDe.get(q.id) === intention,
          );
          if (liste.length === 0) return null;
          const taux = parIntention[intention];
          return (
            <div key={intention} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-serif text-xl text-ink">
                    {t(LIBELLE_INTENTION[intention])}
                  </h3>
                  <p className="text-xs leading-relaxed text-ink-soft">
                    {t(RESUME_INTENTION[intention])}
                  </p>
                </div>
                {taux.part !== null && (
                  <span className="font-mono text-xs tabular-nums text-ink-soft">
                    {t("cité {part} % · {citees}/{analysees}", {
                      part: Math.round(taux.part * 100),
                      citees: taux.citees,
                      analysees: taux.analysees,
                    })}
                  </span>
                )}
              </div>
              <ul className="grid gap-2 xl:grid-cols-2">
                {liste.map((question) => (
                  <CarteQuestion
                    key={question.id}
                    restaurantId={id}
                    restaurantNom={restaurant.nom}
                    question={question}
                    results={latestByQuestion.get(question.id) ?? []}
                    analysable={actifs.length > 0}
                    t={t}
                    langue={langue}
                  />
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <p className="max-w-4xl text-xs leading-relaxed text-zinc-400">
        {t(
          "Assistants interrogés aujourd'hui : {liste}. Les autres s'activeront automatiquement dès que leur clé d'API sera renseignée. Les analyses portent sur les connaissances propres de chaque assistant ; les réponses affichées dans les applications grand public (qui vont chercher sur le web en direct) demanderaient un accès supplémentaire.",
          { liste: actifs.length > 0 ? actifs.join(", ") : t("aucun") },
        )}
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
    <h2 className="flex items-baseline gap-3 font-serif text-2xl text-ink">
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
function Demarrage({ pretes, t }: { pretes: number; t: T }) {
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
            {t("Score de visibilité IA")}
          </p>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-white/80">
            {t(
              "Trois pas pour obtenir ton premier score. Compte cinq minutes, dont une à attendre les assistants.",
            )}
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
              <p className="text-sm font-semibold">{t(etape.titre)}</p>
              <p className="text-xs leading-relaxed text-white/60">
                {t(etape.texte)}
              </p>
            </li>
          ))}
        </ol>
        <p className="text-xs text-white/50">
          {pretes === 0
            ? t(
                "Commence par « Proposer six questions », juste en dessous : six questions prêtes en un clic.",
              )
            : t(
                pretes > 1
                  ? "{n} questions prêtes — lance une analyse ci-dessous."
                  : "{n} question prête — lance une analyse ci-dessous.",
                { n: pretes },
              )}
        </p>
      </div>
    </section>
  );
}

/**
 * Un classement de noms cités, l'établissement surligné dedans.
 *
 * Se compter parmi les autres est ce qui transforme une liste de
 * concurrents en rang : « #4 sur 9 » se retient, « La Fine Mousse : 7 » non.
 */
function Palmares({
  t,
  titre,
  podium,
  analysees,
  compact = false,
}: {
  t: T;
  titre?: string;
  podium: ReturnType<typeof classement>;
  analysees: number;
  compact?: boolean;
}) {
  const max = podium.lignes[0]?.fois || 1;
  return (
    <div className="flex flex-col gap-2">
      {titre && (
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-ink">{titre}</h3>
          {podium.rang !== null && (
            <span className="font-mono text-xs tabular-nums text-ink-soft">
              {t("tu es #{rang} sur {total}", {
                rang: podium.rang,
                total: podium.total,
              })}
            </span>
          )}
        </div>
      )}
      {!compact && (
        <p className="text-xs leading-relaxed text-ink-soft">
          {t(
            "Nombre de réponses où chaque nom apparaît, sur les {n} analysées. Toi compris.",
            { n: analysees },
          )}
        </p>
      )}
      <ol
        className={`flex flex-col overflow-hidden rounded-2xl border border-zinc-200/70 ${
          compact ? "bg-brand-cream" : "bg-white shadow-sm"
        }`}
      >
        {podium.lignes.map((ligne, index) => {
          // Quand l'établissement est loin derrière, on saute des noms pour
          // le garder visible : le dire évite de croire la liste continue.
          const saut = podium.omis > 0 && index === podium.lignes.length - 1;
          return (
            <Fragment key={ligne.nom}>
              {saut && (
                <li className="border-t border-line px-4 py-1.5 text-center text-xs text-zinc-400">
                  {t(
                    podium.omis > 1
                      ? "… {n} autres noms cités"
                      : "… {n} autre nom cité",
                    { n: podium.omis },
                  )}
                </li>
              )}
              <li
                className={`grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-4 ${
                  compact ? "py-2" : "py-3"
                } ${index > 0 ? "border-t border-line" : ""} ${
                  ligne.toi ? "bg-brand-orange-soft/60" : ""
                }`}
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
                      className={`truncate text-sm text-ink ${
                        ligne.toi ? "font-semibold" : ""
                      }`}
                    >
                      {ligne.nom}
                    </span>
                    {ligne.toi && (
                      <span className="rounded-full bg-brand-orange px-1.5 py-px text-[10px] font-semibold uppercase tracking-wider text-white">
                        {t("toi")}
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
    </div>
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
  restaurantNom,
  question,
  results,
  analysable,
  t,
  langue,
}: {
  restaurantId: string;
  restaurantNom: string;
  question: AiVisibilityQuestion;
  results: AiVisibilityCheck[];
  analysable: boolean;
  t: T;
  langue: Langue;
}) {
  // Le classement propre à cette question. C'est le plus actionnable :
  // « sur celle-ci, ces trois-là passent devant » se corrige, alors qu'un
  // tableau qui mélange toutes les questions ne désigne personne.
  const podium = classement(
    restaurantNom,
    results.map((c) => ({ estCite: c.est_cite, concurrents: c.concurrents })),
    5,
  );

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-ink">{question.question}</p>
        <form action={removeQuestion}>
          <input type="hidden" name="restaurant_id" value={restaurantId} />
          <input type="hidden" name="question_id" value={question.id} />
          <button
            type="submit"
            aria-label={t("Supprimer la question")}
            className="shrink-0 text-xs text-zinc-400 transition-colors hover:text-red-600"
          >
            {t("Supprimer")}
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
                    ? check.rang
                      ? t("cité #{rang}", { rang: check.rang })
                      : t("cité")
                    : t("non cité")}
                </span>
              </span>
            ))}
          </div>

          {podium.lignes.length > 1 && (
            <Palmares
              t={t}
              podium={podium}
              analysees={results.length}
              compact
            />
          )}

          <details className="text-sm text-ink-soft">
            <summary className="cursor-pointer text-xs text-ink-soft hover:text-ink">
              {t("Voir les réponses complètes")}
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
                      {new Date(check.created_at).toLocaleDateString(
                        localeDe(langue),
                      )}
                    </span>
                  </div>
                  {check.concurrents.length > 0 && (
                    <p className="text-sm leading-relaxed">
                      {t("Cités à ta place : {liste}", {
                        liste: check.concurrents.join(", "),
                      })}
                    </p>
                  )}
                  {/* La réponse telle que le modèle l'a rendue. Elle
                      arrive en markdown : l'afficher tel quel donnait un
                      mur de « ## » et de « ** ». Les mots ne changent
                      pas, seule leur mise en forme apparaît. */}
                  <div className="text-sm leading-relaxed">
                    <Markdown texte={check.reponse} />
                  </div>
                </div>
              ))}
            </div>
          </details>
        </>
      ) : (
        <p className="text-sm text-ink-soft">{t("Pas encore analysée.")}</p>
      )}

      {analysable ? (
        <BoutonLent
          action={analyzeQuestion}
          champs={{ restaurant_id: restaurantId, question_id: question.id }}
          langue={langue}
          libelle={results.length > 0 ? t("Relancer l'analyse") : t("Analyser")}
          // Une demi-minute sans rien à l'écran passe pour une panne. Dire
          // qui travaille, et à quoi s'attendre, suffit à faire patienter.
          enCours={t("Les assistants répondent… (30 s à 1 min)")}
          className="w-fit rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
        />
      ) : (
        <button
          type="button"
          disabled
          className="w-fit cursor-not-allowed rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 opacity-40"
        >
          {t("Analyser")}
        </button>
      )}
    </li>
  );
}
