import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

function jourLisible(iso: string | null): string {
  if (!iso) return "—";
  return new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
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

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.avis}
        title={campagne.objet}
        backHref={`/dashboard/${id}/campagnes`}
      />

      <div className="flex flex-col gap-1">
        <span className="text-sm text-zinc-600">
          {LIBELLE_STATUT[campagne.statut]} ·{" "}
          {LIBELLE_SEGMENT[campagne.segment]}
        </span>
        {campagne.statut === "envoyee" && (
          <span className="text-sm text-zinc-500">
            {envois.envoyes} envoi{envois.envoyes > 1 ? "s" : ""} le{" "}
            {jourLisible(campagne.envoyee_le)}
            {envois.echoues > 0 && ` · ${envois.echoues} en échec`}
          </span>
        )}
        {campagne.statut === "en_cours" && (
          <span className="text-sm text-zinc-500">
            {envois.envoyes} parti{envois.envoyes > 1 ? "s" : ""},{" "}
            {envois.restants} en attente — la suite au prochain passage.
          </span>
        )}
        {campagne.derniere_erreur && (
          <span className="text-sm text-red-700">
            {campagne.derniere_erreur}
          </span>
        )}
      </div>

      <FormulaireCampagne
        restaurantId={id}
        campagneId={campagne.id}
        modifiable={modifiable}
        compteurs={compteurs}
        maison={(maison as { nom: string } | null)?.nom}
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
          <EssaiCampagne restaurantId={id} campagneId={campagne.id} />

          <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5">
            <span className="text-sm font-medium text-zinc-700">
              {campagne.statut === "programmee"
                ? `Programmée pour le ${jourLisible(campagne.envoyer_le)}`
                : "Programmer l'envoi"}
            </span>
            <form
              action={programmerCampagne}
              className="flex flex-wrap items-end gap-3"
            >
              <input type="hidden" name="restaurant_id" value={id} />
              <input type="hidden" name="campagne_id" value={campagne.id} />
              <label className="flex flex-col gap-1 text-sm text-zinc-600">
                Le jour
                <input
                  type="date"
                  name="envoyer_le"
                  min={aujourdhui}
                  defaultValue={campagne.envoyer_le ?? aujourdhui}
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy"
                />
              </label>
              <button
                type="submit"
                className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
              >
                {campagne.statut === "programmee"
                  ? "Changer la date"
                  : "Programmer"}
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-4">
              {campagne.statut === "programmee" && (
                <form action={deprogrammerCampagne}>
                  <input type="hidden" name="restaurant_id" value={id} />
                  <input type="hidden" name="campagne_id" value={campagne.id} />
                  <button
                    type="submit"
                    className="text-xs font-medium text-zinc-500 underline underline-offset-2 hover:text-zinc-800"
                  >
                    Annuler la programmation
                  </button>
                </form>
              )}
              <form action={supprimerCampagne}>
                <input type="hidden" name="restaurant_id" value={id} />
                <input type="hidden" name="campagne_id" value={campagne.id} />
                <button
                  type="submit"
                  className="text-xs font-medium text-zinc-500 underline underline-offset-2 hover:text-red-600"
                >
                  Supprimer
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {campagne.statut === "echec" && (
        <form
          action={relancerCampagne}
          className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-5"
        >
          <input type="hidden" name="restaurant_id" value={id} />
          <input type="hidden" name="campagne_id" value={campagne.id} />
          <p className="text-sm leading-relaxed text-red-900">
            L&apos;envoi s&apos;est arrêté. Ceux qui ont déjà reçu ne recevront
            pas deux fois : la relance ne reprend que les {envois.restants}{" "}
            destinataire
            {envois.restants > 1 ? "s" : ""} restant
            {envois.restants > 1 ? "s" : ""}.
          </p>
          <button
            type="submit"
            className="w-fit rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
          >
            Relancer
          </button>
        </form>
      )}
    </div>
  );
}
