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

  const envoyees = campagnes.filter((c) => c.statut === "envoyee");
  const courrielsEnvoyes = envoyees.reduce(
    (somme, c) => somme + (c.destinataires ?? 0),
    0,
  );

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.avis}
        title={`Campagnes e-mail — ${restaurant.nom}`}
        backHref="/dashboard"
      />

      <p className="max-w-4xl text-sm text-zinc-600">
        Un message à ceux qui ont accepté d&apos;en recevoir. Écrivez-le quand
        vous avez le temps, choisissez le jour, Klarr l&apos;envoie le matin
        venu. Chaque message porte un lien de désinscription — c&apos;est la
        loi, et c&apos;est ce qui vous évite d&apos;atterrir en indésirable.
      </p>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Compteur
          valeur={compteurs.tous}
          libelle="personnes joignables"
          accent={compteurs.tous > 0}
        />
        <Compteur
          valeur={envoyees.length}
          libelle={`campagne${envoyees.length > 1 ? "s" : ""} envoyée${envoyees.length > 1 ? "s" : ""}`}
        />
        <Compteur
          valeur={courrielsEnvoyes}
          libelle={`e-mail${courrielsEnvoyes > 1 ? "s" : ""} parti${courrielsEnvoyes > 1 ? "s" : ""}`}
        />
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="font-serif text-2xl text-ink">Nouvelle campagne</h2>
          {/* L'heure d'envoi est approximative, et il vaut mieux le dire
              avant qu'après : c'est la même limite que pour les
              publications Google, et elle tient au forfait, pas à une
              panne. */}
          <p className="text-xs text-zinc-500">
            Envoi <strong className="font-semibold text-zinc-700">le matin du
            jour choisi</strong>, pas à l&apos;heure près.
          </p>
        </div>
        <FormulaireCampagne
          restaurantId={id}
          compteurs={compteurs}
          maison={restaurant.nom}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-2xl text-ink">Vos campagnes</h2>
        {campagnes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
            <span className="text-sm font-semibold text-ink">
              Aucune campagne pour l&apos;instant.
            </span>
            <span className="max-w-md text-sm text-zinc-500">
              Écrivez la première au-dessus : elle reste en brouillon tant que
              vous ne choisissez pas de jour d&apos;envoi.
            </span>
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {campagnes.map((campagne) => (
              <li key={campagne.id}>
                <Link
                  href={`/dashboard/${id}/campagnes/${campagne.id}`}
                  className="group flex h-full flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TON[campagne.statut]}`}
                    >
                      {LIBELLE_STATUT[campagne.statut]}
                    </span>
                    <span className="text-xs text-zinc-400">
                      Créée le {jourCourt(campagne.created_at)}
                    </span>
                  </div>
                  <span className="text-base font-semibold leading-snug text-ink group-hover:underline">
                    {campagne.objet}
                  </span>
                  <span className="line-clamp-2 text-sm leading-relaxed text-zinc-500">
                    {campagne.texte}
                  </span>
                  <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
                    <span>{LIBELLE_SEGMENT[campagne.segment]}</span>
                    {campagne.statut === "envoyee" &&
                    campagne.destinataires !== null ? (
                      <span>
                        <strong className="font-semibold text-ink">
                          {campagne.destinataires}
                        </strong>{" "}
                        envoi{campagne.destinataires > 1 ? "s" : ""} le{" "}
                        {jourLisible(campagne.envoyee_le)}
                      </span>
                    ) : (
                      campagne.envoyer_le && (
                        <span>Part {jourLisible(campagne.envoyer_le)}</span>
                      )
                    )}
                  </div>
                  {campagne.derniere_erreur && (
                    <span className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                      {campagne.derniere_erreur}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function jourCourt(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function Compteur({
  valeur,
  libelle,
  accent = false,
}: {
  valeur: number;
  libelle: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-2xl border px-4 py-4 sm:px-6 sm:py-5 ${
        accent
          ? "border-brand-orange/60 bg-brand-orange-soft"
          : "border-zinc-200/70 bg-white shadow-sm"
      }`}
    >
      <span className="font-serif text-3xl leading-none text-ink sm:text-5xl">
        {valeur}
      </span>
      <span className="text-xs leading-snug text-zinc-600 sm:text-sm">
        {libelle}
      </span>
    </div>
  );
}
