import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Compteur, TitreSection } from "@/components/dashboard/Compteur";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import { campagnesOuvertes } from "@/lib/campagnes/message";
import { FormulaireCampagne } from "@/components/campagnes/FormulaireCampagne";
import { EssaiCampagne } from "@/components/campagnes/EssaiCampagne";
import {
  compterLesEnvois,
  compterLesSegments,
  LIBELLE_STATUT,
  type Campagne,
} from "@/lib/campagnes/lecture";
import { LIBELLE_SEGMENT } from "@/lib/campagnes/segments";
import {
  programmerCampagne,
  deprogrammerCampagne,
  supprimerCampagne,
  relancerCampagne,
} from "../actions";
import { langueUtilisateur } from "@/lib/i18n/langue";
import type { Langue } from "@/lib/i18n/langues";
import { localeDe } from "@/lib/i18n/seo";
import { COMMUN, traducteur } from "@/lib/i18n/t";
import { CAMPAGNES } from "@/lib/i18n/pages/campagnes";

function jourLisible(iso: string | null, langue: Langue): string {
  if (!iso) return "—";
  return new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString(
    localeDe(langue),
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    },
  );
}

export default async function CampagnePage({
  params,
}: {
  params: Promise<{ id: string; campagne: string }>;
}) {
  const { id, campagne: campagneId } = await params;
  await exiger(id, "gerant");
  await exigerModule(id, "reservations");
  if (!campagnesOuvertes()) notFound();

  const supabase = await createClient();
  const [{ data }, compteurs, envois, { data: maison }] = await Promise.all([
    supabase
      .from("restaurant_campagnes")
      .select("*")
      .eq("id", campagneId)
      .eq("restaurant_id", id)
      .maybeSingle(),
    compterLesSegments(supabase, id),
    compterLesEnvois(supabase, campagneId),
    // Le nom qui signe le message, pour l'aperçu.
    supabase.from("restaurants").select("nom").eq("id", id).maybeSingle(),
  ]);

  const campagne = data as Campagne | null;
  if (!campagne) notFound();

  // Une campagne partie ou en train de partir ne se réécrit pas : le
  // journal dit ce qui a été envoyé, et le texte doit continuer d'y
  // correspondre.
  const modifiable =
    campagne.statut === "brouillon" || campagne.statut === "programmee";
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const langue = await langueUtilisateur();
  const t = traducteur(langue, CAMPAGNES, COMMUN);
  const jour = (iso: string | null) => jourLisible(iso, langue);
  const destinataires = compteurs[campagne.segment];

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-3">
        <PageHeader
          icon={dashboardIcons.avis}
          title={campagne.objet}
          backHref={`/dashboard/${id}/campagnes`}
        />
        <p className="max-w-4xl text-sm text-zinc-600">
          {modifiable
            ? t(
                "Relis le message, envoie-toi un essai, puis choisis le jour : la campagne part le matin venu, et seuls les clients qui ont accepté de recevoir tes nouvelles la reçoivent.",
              )
            : t(
                "Cette campagne est partie : le texte reste tel qu'il a été envoyé, pour que le journal corresponde à ce que tes clients ont reçu.",
              )}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Compteur
          valeur={t(LIBELLE_STATUT[campagne.statut])}
          libelle={
            campagne.statut === "programmee"
              ? t("part le {date}", { date: jour(campagne.envoyer_le) })
              : campagne.statut === "envoyee"
                ? t("le {date}", { date: jour(campagne.envoyee_le) })
                : t("état de la campagne")
          }
          accent={campagne.statut === "echec"}
        />
        <Compteur
          valeur={compteurs[campagne.segment]}
          libelle={t(
            destinataires > 1
              ? "destinataires · {segment}"
              : "destinataire · {segment}",
            { segment: t(LIBELLE_SEGMENT[campagne.segment]) },
          )}
        />
        <Compteur
          valeur={envois.envoyes}
          libelle={
            campagne.statut === "en_cours"
              ? t("partis, {n} en attente — la suite au prochain passage", {
                  n: envois.restants,
                })
              : envois.echoues > 0
                ? t("envoyés · {n} en échec", { n: envois.echoues })
                : t(envois.envoyes > 1 ? "e-mails envoyés" : "e-mail envoyé")
          }
        />
      </div>

      {campagne.derniere_erreur && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {campagne.derniere_erreur}
        </p>
      )}

      <FormulaireCampagne
        restaurantId={id}
        campagneId={campagne.id}
        modifiable={modifiable}
        compteurs={compteurs}
        maison={(maison as { nom: string } | null)?.nom}
        langue={langue}
        valeurs={{
          objet: campagne.objet,
          texte: campagne.texte,
          boutonLibelle: campagne.bouton_libelle ?? "",
          boutonUrl: campagne.bouton_url ?? "",
          segment: campagne.segment,
        }}
      />

      {modifiable && (
        <>
          {/* L'essai avant la programmation, dans cet ordre : personne
              n'envoie à cinq cents personnes un message qu'il n'a pas vu
              arriver dans une boîte. */}
          <div className="grid items-start gap-8 xl:grid-cols-2">
            <section className="flex flex-col gap-4">
              <TitreSection>{t("1. S'envoyer un essai")}</TitreSection>
              <EssaiCampagne
                restaurantId={id}
                campagneId={campagne.id}
                langue={langue}
              />
            </section>

            <section className="flex flex-col gap-4">
              <TitreSection>{t("2. Programmer l'envoi")}</TitreSection>
              <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
                <span className="text-sm font-semibold text-ink">
                  {campagne.statut === "programmee"
                    ? t("Programmée pour le {date}", {
                        date: jour(campagne.envoyer_le),
                      })
                    : t("Choisis le jour : elle part le matin venu.")}
                </span>
                <form
                  action={programmerCampagne}
                  className="flex flex-wrap items-end gap-3"
                >
                  <input type="hidden" name="restaurant_id" value={id} />
                  <input type="hidden" name="campagne_id" value={campagne.id} />
                  <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
                    {t("Le jour")}
                    <input
                      type="date"
                      name="envoyer_le"
                      min={aujourdhui}
                      defaultValue={campagne.envoyer_le ?? aujourdhui}
                      className="rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-normal outline-none transition-colors focus:border-brand-navy focus:bg-white"
                    />
                  </label>
                  <button
                    type="submit"
                    className="rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
                  >
                    {campagne.statut === "programmee"
                      ? t("Changer la date")
                      : t("Programmer")}
                  </button>
                </form>

                <div className="flex flex-wrap items-center gap-4 border-t border-zinc-100 pt-4">
                  {campagne.statut === "programmee" && (
                    <form action={deprogrammerCampagne}>
                      <input type="hidden" name="restaurant_id" value={id} />
                      <input
                        type="hidden"
                        name="campagne_id"
                        value={campagne.id}
                      />
                      <button
                        type="submit"
                        className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
                      >
                        {t("Annuler la programmation")}
                      </button>
                    </form>
                  )}
                  <form action={supprimerCampagne}>
                    <input type="hidden" name="restaurant_id" value={id} />
                    <input
                      type="hidden"
                      name="campagne_id"
                      value={campagne.id}
                    />
                    <button
                      type="submit"
                      className="text-sm font-medium text-zinc-500 transition-colors hover:text-red-600"
                    >
                      {t("Supprimer")}
                    </button>
                  </form>
                </div>
              </div>
            </section>
          </div>
        </>
      )}

      {campagne.statut === "echec" && (
        <form
          action={relancerCampagne}
          className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-6"
        >
          <input type="hidden" name="restaurant_id" value={id} />
          <input type="hidden" name="campagne_id" value={campagne.id} />
          <p className="text-sm leading-relaxed text-red-900">
            {t(
              envois.restants > 1
                ? "L'envoi s'est arrêté. Ceux qui ont déjà reçu ne recevront pas deux fois : la relance ne reprend que les {n} destinataires restants."
                : "L'envoi s'est arrêté. Ceux qui ont déjà reçu ne recevront pas deux fois : la relance ne reprend que les {n} destinataire restant.",
              { n: envois.restants },
            )}
          </p>
          <button
            type="submit"
            className="w-fit rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
          >
            {t("Relancer")}
          </button>
        </form>
      )}
    </div>
  );
}
