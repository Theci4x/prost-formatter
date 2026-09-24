import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { BoutonCopier } from "@/components/dashboard/BoutonCopier";
import { FicheACopier, texteFiche } from "@/components/presence/FicheACopier";
import { Etapes } from "@/components/presence/Etapes";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import { PLATEFORMES, estPlateforme } from "@/lib/presence/plateformes";
import {
  chargerPresence,
  estReglee,
  etatDe,
  fileGuidee,
} from "@/lib/presence/etat";
import { langueUtilisateur } from "@/lib/i18n/langue";
import { PRESENCE, plateformeEn } from "@/lib/i18n/presence";
import { localeDe } from "@/lib/i18n/seo";
import { majPresence } from "../actions";

/**
 * Le mode guidé : une plateforme à la fois, la fiche à copier à côté.
 *
 * Vingt cartes sur une page disent tout et n'indiquent pas par où
 * commencer ; c'est là qu'un restaurateur abandonne. Ici, une seule
 * chose à faire, dans l'ordre où ça rapporte : ce qui est devenu faux,
 * puis les essentielles, puis les annuaires.
 *
 * « Passer » ne change rien en base : la plateforme reviendra au
 * prochain passage. La liste des passées voyage dans l'adresse, pour
 * qu'un rechargement ne ramène pas celle qu'on vient d'écarter.
 */

function jourCourt(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Paris",
  });
}

const BOUTON_PRIMAIRE =
  "rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover";
const BOUTON_SECONDAIRE =
  "rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy";

export default async function GuidePresencePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ passees?: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");
  await exigerModule(id, "visibilite");
  const langue = await langueUtilisateur();
  const t = PRESENCE[langue];
  const locale = localeDe(langue);
  const { passees: brut } = await searchParams;
  const passees = (brut ?? "").split(",").filter(estPlateforme);

  const supabase = await createClient();
  const etat = await chargerPresence(supabase, id);
  if (!etat) notFound();
  const { restaurant, relies } = etat;
  const champs = etat.champs.map((c) => ({
    ...c,
    libelle: t.champs[c.libelle] ?? c.libelle,
  }));

  const file = fileGuidee(etat, passees).map((p) => plateformeEn(p, langue));
  const toutesAFaire = fileGuidee(etat);
  const courante = file[0] ?? null;
  const reglees = PLATEFORMES.filter((p) => estReglee(etatDe(p, etat))).length;
  const retour = `/dashboard/${id}/presence`;
  const passer = courante
    ? `/dashboard/${id}/presence/guide?passees=${[...passees, courante.cle].join(",")}`
    : retour;

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-3">
        <PageHeader
          icon={dashboardIcons.presence}
          title={t.guideTitre(restaurant.nom)}
          backHref={retour}
        />
        <div className="flex max-w-4xl flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3 text-sm text-zinc-600">
            <span>{t.reglees(reglees, PLATEFORMES.length)}</span>
            {courante && (
              <span>
                {t.encore(
                  file.length,
                  file.reduce((total, p) => total + p.minutes, 0),
                )}
              </span>
            )}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${(reglees / PLATEFORMES.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {!courante ? (
        <section className="flex max-w-3xl flex-col items-start gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6">
          <span className="font-serif text-3xl text-ink">
            {toutesAFaire.length === 0 ? t.finTout : t.finAujourdhui}
          </span>
          <p className="text-sm leading-relaxed text-zinc-700">
            {toutesAFaire.length === 0
              ? t.finToutTexte
              : t.finPassees(toutesAFaire.length)}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={retour} className={BOUTON_PRIMAIRE}>
              {t.revenir}
            </Link>
            {toutesAFaire.length > 0 && (
              <Link
                href={`/dashboard/${id}/presence/guide`}
                className={BOUTON_SECONDAIRE}
              >
                {t.reprendre}
              </Link>
            )}
          </div>
        </section>
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
          <section className="flex min-w-0 flex-col gap-5 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm sm:p-8">
            {(() => {
              const e = etatDe(courante, etat);
              const relie = relies[courante.cle] ?? null;
              return (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
                        {courante.niveau === 1 ? t.essentielle : t.plusLoin}
                        {t.environ(courante.minutes)}
                      </span>
                      <h2 className="font-serif text-4xl leading-tight text-ink">
                        {courante.nom}
                      </h2>
                    </div>
                    {e === "a_revoir" && (
                      <span className="rounded-full bg-brand-orange-soft px-3 py-1 text-xs font-semibold text-brand-orange-dark">
                        {t.aMettreAJour}
                      </span>
                    )}
                  </div>

                  <p className="text-base leading-relaxed text-zinc-700">
                    {courante.pourquoi}
                  </p>

                  {/* Sur téléphone, la fiche tombe sous les étapes : un
                      raccourci évite de la chercher en défilant. */}
                  <a
                    href="#fiche"
                    className="w-fit text-sm font-semibold text-brand-orange-dark hover:underline lg:hidden"
                  >
                    {t.ficheACopierBas}
                  </a>

                  {e === "a_revoir" && restaurant.fiche_modifiee_le && (
                    <p className="rounded-xl bg-brand-orange-soft px-4 py-3 text-sm leading-relaxed text-ink">
                      {t.ficheAChangeGuide(
                        jourCourt(restaurant.fiche_modifiee_le, locale),
                        courante.nom,
                      )}
                    </p>
                  )}
                  {courante.conseil && e !== "a_revoir" && (
                    <p className="rounded-xl bg-zinc-50 px-4 py-3 text-sm leading-relaxed text-ink">
                      {courante.conseil}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {courante.verifier && (
                      <a
                        href={courante.verifier(
                          restaurant.nom,
                          restaurant.adresse ?? "",
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={BOUTON_SECONDAIRE}
                      >
                        {t.verifier}
                      </a>
                    )}
                    {courante.creer && (
                      <a
                        href={courante.creer}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={BOUTON_SECONDAIRE}
                      >
                        {relie ? t.modifier : t.creer}
                      </a>
                    )}
                    {courante.ecranKlarr && !relie && (
                      <Link
                        href={`/dashboard/${id}/${courante.ecranKlarr}`}
                        className={BOUTON_SECONDAIRE}
                      >
                        {t.relier}
                      </Link>
                    )}
                  </div>

                  {(e === "a_revoir" || (courante.etapes?.length ?? 0) > 0) && (
                    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50/60 p-5">
                      <span className="text-sm font-semibold text-ink">
                        {t.pasAPasSeul}
                      </span>
                      <Etapes
                        etapes={
                          e === "a_revoir"
                            ? t.miseAJour
                            : (courante.etapes ?? [])
                        }
                      />
                    </div>
                  )}

                  <form
                    action={majPresence}
                    className="flex flex-col gap-3 border-t border-zinc-100 pt-5"
                  >
                    <input type="hidden" name="restaurant_id" value={id} />
                    <input
                      type="hidden"
                      name="plateforme"
                      value={courante.cle}
                    />
                    <input type="hidden" name="retour" value="guide" />
                    <input
                      type="hidden"
                      name="passees"
                      value={passees.join(",")}
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="submit"
                        name="statut"
                        value="a_jour"
                        className={BOUTON_PRIMAIRE}
                      >
                        {t.cestFait}
                      </button>
                      <button
                        type="submit"
                        name="statut"
                        value="a_corriger"
                        className={BOUTON_SECONDAIRE}
                      >
                        {t.plusTard}
                      </button>
                      <Link
                        href={passer}
                        className="px-2 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:text-ink"
                      >
                        {t.passer}
                      </Link>
                    </div>
                    <span className="text-xs text-zinc-500">
                      {t.plusTardAide}
                    </span>
                  </form>
                </>
              );
            })()}
          </section>

          <aside
            id="fiche"
            className="flex min-w-0 scroll-mt-8 flex-col gap-3 lg:sticky lg:top-8"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-serif text-2xl text-ink">
                {t.ficheACopier}
              </span>
              <BoutonCopier
                texte={texteFiche(champs)}
                libelle={t.toutCopier}
                copie={t.copiee}
              />
            </div>
            <FicheACopier restaurantId={id} champs={champs} compact t={t} />
          </aside>
        </div>
      )}
    </div>
  );
}
