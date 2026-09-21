import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import { campagnesOuvertes } from "@/lib/campagnes/message";
import { FormulaireCampagne } from "@/components/campagnes/FormulaireCampagne";
import {
  compterLesSegments,
  LIBELLE_STATUT,
  type Campagne,
} from "@/lib/campagnes/lecture";
import { LIBELLE_SEGMENT } from "@/lib/campagnes/segments";
import type { Restaurant } from "@/types/restaurant";

function jourLisible(iso: string | null): string {
  if (!iso) return "—";
  return new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const TON: Record<Campagne["statut"], string> = {
  brouillon: "bg-zinc-100 text-zinc-600",
  programmee: "bg-brand-orange-soft text-amber-900",
  en_cours: "bg-blue-50 text-blue-800",
  envoyee: "bg-emerald-50 text-emerald-800",
  echec: "bg-red-50 text-red-700",
};

export default async function CampagnesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");
  await exigerModule(id, "reservations");

  // Masqué tant que le domaine d'envoi n'est pas vérifié chez le
  // fournisseur : une campagne programmée qui ne part jamais coûte plus
  // cher qu'un écran absent. Même règle que pour les publications Google.
  if (!campagnesOuvertes()) notFound();

  const supabase = await createClient();
  const [{ data: restaurantData }, { data: campagnesData }, compteurs] =
    await Promise.all([
      supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("restaurant_campagnes")
        .select("*")
        .eq("restaurant_id", id)
        .order("created_at", { ascending: false })
        .limit(50),
      compterLesSegments(supabase, id),
    ]);

  const restaurant = restaurantData as Restaurant | null;
  if (!restaurant) notFound();
  const campagnes = (campagnesData ?? []) as Campagne[];

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.avis}
        title={`Campagnes e-mail — ${restaurant.nom}`}
        backHref="/dashboard"
      />

      <p className="max-w-2xl text-sm text-zinc-600">
        Un message à ceux qui ont accepté d&apos;en recevoir. Écrivez-le quand
        vous avez le temps, choisissez le jour, Klarr l&apos;envoie le matin
        venu. Chaque message porte un lien de désinscription — c&apos;est la
        loi, et c&apos;est ce qui vous évite d&apos;atterrir en indésirable.
      </p>

      {/* L'heure d'envoi est approximative, et il vaut mieux le dire
          avant qu'après : c'est la même limite que pour les publications
          Google, et elle tient au forfait, pas à une panne. */}
      <p className="max-w-2xl rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs leading-relaxed text-zinc-600">
        La file est traitée une fois par jour, en milieu de matinée. Une
        campagne programmée part donc <strong>le matin du jour choisi</strong>,
        pas à l&apos;heure près.
      </p>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Nouvelle campagne
        </h2>
        <FormulaireCampagne restaurantId={id} compteurs={compteurs} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Vos campagnes
        </h2>
        {campagnes.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Aucune campagne pour l&apos;instant.
          </p>
        ) : (
          <ul className="flex max-w-2xl flex-col gap-3">
            {campagnes.map((campagne) => (
              <li key={campagne.id}>
                <Link
                  href={`/dashboard/${id}/campagnes/${campagne.id}`}
                  className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="font-medium text-zinc-800">
                      {campagne.objet}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TON[campagne.statut]}`}
                    >
                      {LIBELLE_STATUT[campagne.statut]}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {LIBELLE_SEGMENT[campagne.segment]}
                    {campagne.statut === "envoyee" &&
                    campagne.destinataires !== null
                      ? ` · ${campagne.destinataires} envoi${campagne.destinataires > 1 ? "s" : ""} le ${jourLisible(campagne.envoyee_le)}`
                      : campagne.envoyer_le
                        ? ` · ${jourLisible(campagne.envoyer_le)}`
                        : ""}
                  </span>
                  {campagne.derniere_erreur && (
                    <span className="text-xs text-red-700">
                      {campagne.derniere_erreur}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
