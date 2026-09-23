import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { BoutonCopier } from "@/components/dashboard/BoutonCopier";
import { FicheACopier, texteFiche } from "@/components/presence/FicheACopier";
import { Etapes } from "@/components/presence/Etapes";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import {
  ETAPES_MISE_A_JOUR,
  PLATEFORMES,
  estPlateforme,
} from "@/lib/presence/plateformes";
import {
  chargerPresence,
  estReglee,
  etatDe,
  fileGuidee,
} from "@/lib/presence/etat";
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

function jourCourt(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
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
  const { passees: brut } = await searchParams;
  const passees = (brut ?? "").split(",").filter(estPlateforme);

  const supabase = await createClient();
  const etat = await chargerPresence(supabase, id);
  if (!etat) notFound();
  const { restaurant, relies, champs } = etat;

  const file = fileGuidee(etat, passees);
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
          title={`Mode guidé — ${restaurant.nom}`}
          backHref={retour}
        />
        <div className="flex max-w-4xl flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3 text-sm text-zinc-600">
            <span>
              {reglees} plateforme{reglees > 1 ? "s" : ""} réglée
              {reglees > 1 ? "s" : ""} sur {PLATEFORMES.length}
            </span>
            {courante && (
              <span>
                encore {file.length} · environ{" "}
                {file.reduce((total, p) => total + p.minutes, 0)} min
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
            {toutesAFaire.length === 0
              ? "Tout est en ordre"
              : "Fin du parcours pour aujourd'hui"}
          </span>
          <p className="text-sm leading-relaxed text-zinc-700">
            {toutesAFaire.length === 0
              ? "Chaque plateforme est reliée ou vérifiée. Si tu modifies ton nom, ton adresse, ton téléphone ou tes horaires dans Klarr, Klarr te dira lesquelles reprendre."
              : `Tu as passé ${toutesAFaire.length} plateforme${toutesAFaire.length > 1 ? "s" : ""}. Elles t'attendent pour la prochaine fois.`}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={retour} className={BOUTON_PRIMAIRE}>
              Revenir à la présence en ligne
            </Link>
            {toutesAFaire.length > 0 && (
              <Link
                href={`/dashboard/${id}/presence/guide`}
                className={BOUTON_SECONDAIRE}
              >
                Reprendre les plateformes passées
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
                        {courante.niveau === 1
                          ? "Essentielle"
                          : "Pour aller plus loin"}{" "}
                        · environ {courante.minutes} min
                      </span>
                      <h2 className="font-serif text-4xl leading-tight text-ink">
                        {courante.nom}
                      </h2>
                    </div>
                    {e === "a_revoir" && (
                      <span className="rounded-full bg-brand-orange-soft px-3 py-1 text-xs font-semibold text-brand-orange-dark">
                        À mettre à jour
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
                    Ta fiche à copier ↓
                  </a>

                  {e === "a_revoir" && restaurant.fiche_modifiee_le && (
                    <p className="rounded-xl bg-brand-orange-soft px-4 py-3 text-sm leading-relaxed text-ink">
                      Ta fiche a changé le{" "}
                      {jourCourt(restaurant.fiche_modifiee_le)} dans Klarr :
                      ouvre ta fiche {courante.nom} et reporte-y les
                      changements.
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
                        Vérifier ma fiche ↗
                      </a>
                    )}
                    {courante.creer && (
                      <a
                        href={courante.creer}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={BOUTON_SECONDAIRE}
                      >
                        {relie
                          ? "Modifier ma fiche ↗"
                          : "Créer ou revendiquer ↗"}
                      </a>
                    )}
                    {courante.ecranKlarr && !relie && (
                      <Link
                        href={`/dashboard/${id}/${courante.ecranKlarr}`}
                        className={BOUTON_SECONDAIRE}
                      >
                        Relier dans Klarr →
                      </Link>
                    )}
                  </div>

                  {(e === "a_revoir" || (courante.etapes?.length ?? 0) > 0) && (
                    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50/60 p-5">
                      <span className="text-sm font-semibold text-ink">
                        Pas à pas
                      </span>
                      <Etapes
                        etapes={
                          e === "a_revoir"
                            ? ETAPES_MISE_A_JOUR
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
                        C&apos;est fait : ma fiche est à jour
                      </button>
                      <button
                        type="submit"
                        name="statut"
                        value="a_corriger"
                        className={BOUTON_SECONDAIRE}
                      >
                        À terminer plus tard
                      </button>
                      <Link
                        href={passer}
                        className="px-2 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:text-ink"
                      >
                        Passer pour l&apos;instant
                      </Link>
                    </div>
                    <span className="text-xs text-zinc-500">
                      « À terminer plus tard » garde une trace : la plateforme
                      reviendra au prochain passage du guide.
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
                Ta fiche à copier
              </span>
              <BoutonCopier
                texte={texteFiche(champs)}
                libelle="Tout copier"
                copie="Copiée ✓"
              />
            </div>
            <FicheACopier restaurantId={id} champs={champs} compact />
          </aside>
        </div>
      )}
    </div>
  );
}
