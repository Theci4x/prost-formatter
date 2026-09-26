import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { Compteur } from "@/components/dashboard/Compteur";
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
  const langue = await langueUtilisateur();
  const t = traducteur(langue, CAMPAGNES, COMMUN);

  const envoyees = campagnes.filter((c) => c.statut === "envoyee");
  const courrielsEnvoyes = envoyees.reduce(
    (somme, c) => somme + (c.destinataires ?? 0),
    0,
  );

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.avis}
        title={t("Campagnes e-mail — {nom}", { nom: restaurant.nom })}
        backHref="/dashboard"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-4xl text-sm text-zinc-600">
          {t(
            "Un message à ceux qui ont accepté d'en recevoir. Écris-le quand tu as le temps, choisis le jour, Klarr l'envoie le matin venu. Chaque message porte un lien de désinscription — c'est la loi, et c'est ce qui t'évite d'atterrir en indésirable.",
          )}
        </p>
        <Link
          href={`/dashboard/${id}/clients`}
          className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
        >
          {t("Fichier client")}
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Compteur
          valeur={compteurs.tous}
          libelle={t(
            compteurs.tous > 1 ? "personnes joignables" : "personne joignable",
          )}
          accent={compteurs.tous === 0}
        />
        <Compteur
          valeur={envoyees.length}
          libelle={t(
            envoyees.length > 1 ? "campagnes envoyées" : "campagne envoyée",
          )}
        />
        <Compteur
          valeur={courrielsEnvoyes}
          libelle={t(courrielsEnvoyes > 1 ? "e-mails partis" : "e-mail parti")}
        />
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="font-serif text-2xl text-ink">
            {t("Nouvelle campagne")}
          </h2>
          {/* L'heure d'envoi est approximative, et il vaut mieux le dire
              avant qu'après : c'est la même limite que pour les
              publications Google, et elle tient au forfait, pas à une
              panne. */}
          <p className="text-xs text-zinc-500">
            {(() => {
              const [avant, apres] = t(
                "Envoi {moment}, pas à l'heure près.",
              ).split("{moment}");
              return (
                <>
                  {avant}
                  <strong className="font-semibold text-zinc-700">
                    {t("le matin du jour choisi")}
                  </strong>
                  {apres}
                </>
              );
            })()}
          </p>
        </div>
        <FormulaireCampagne
          restaurantId={id}
          compteurs={compteurs}
          maison={restaurant.nom}
          langue={langue}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-2xl text-ink">{t("Tes campagnes")}</h2>
        {campagnes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
            <span className="text-sm font-semibold text-ink">
              {t("Aucune campagne pour l'instant.")}
            </span>
            <span className="max-w-md text-sm text-zinc-500">
              {t(
                "Écris la première au-dessus : elle reste en brouillon tant que tu ne choisis pas de jour d'envoi.",
              )}
            </span>
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {campagnes.map((campagne) => (
              <li key={campagne.id}>
                <Link
                  href={`/dashboard/${id}/campagnes/${campagne.id}`}
                  className="group flex h-full flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm transition-[border-color,transform,box-shadow] hover:-translate-y-px hover:border-ink hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TON[campagne.statut]}`}
                    >
                      {t(LIBELLE_STATUT[campagne.statut])}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {t("Créée le {date}", {
                        date: jourCourt(campagne.created_at, langue),
                      })}
                    </span>
                  </div>
                  <span className="font-serif text-xl leading-snug text-ink">
                    {campagne.objet}
                  </span>
                  <span className="line-clamp-2 text-sm leading-relaxed text-zinc-500">
                    {campagne.texte}
                  </span>
                  <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
                    <span>{t(LIBELLE_SEGMENT[campagne.segment])}</span>
                    {campagne.statut === "envoyee" &&
                    campagne.destinataires !== null ? (
                      <span>
                        {t(
                          campagne.destinataires > 1
                            ? "{n} envois le {date}"
                            : "{n} envoi le {date}",
                          {
                            n: campagne.destinataires,
                            date: jourLisible(campagne.envoyee_le, langue),
                          },
                        )}
                      </span>
                    ) : (
                      campagne.envoyer_le && (
                        <span>
                          {t("Part {date}", {
                            date: jourLisible(campagne.envoyer_le, langue),
                          })}
                        </span>
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

function jourCourt(iso: string, langue: Langue): string {
  return new Date(iso).toLocaleDateString(localeDe(langue), {
    day: "numeric",
    month: "short",
  });
}
