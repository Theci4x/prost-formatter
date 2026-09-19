import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import type { Restaurant } from "@/types/restaurant";
import type { RestaurantSubscription } from "@/types/subscription";
import { exiger } from "@/lib/equipe/roles";
import { chargerAcces } from "@/lib/abonnement/acces";
import {
  LIBELLE_MODULE,
  MODULES,
  PRIX_MODULE,
  PRIX_MODULE_TTC,
  LIBELLE_PACK,
  PRIX_PACK,
  PRIX_PACK_TTC,
  RESUME_PACK,
  essaiLePlusLong,
  RESUME_MODULE,
  abonnementOuvrant,
  type Module,
} from "@/lib/abonnement/modules";

const STATUS_LABELS: Record<string, string> = {
  active: "Actif",
  trialing: "Période d'essai",
  past_due: "Paiement en retard",
  canceled: "Résilié",
  incomplete: "Paiement incomplet",
  incomplete_expired: "Paiement expiré",
  unpaid: "Impayé",
};

export default async function AbonnementPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ stripe_error?: string; checkout?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  await exiger(id, "proprietaire");

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

  const { data: subscriptionsData } = await supabase
    .from("restaurant_subscriptions")
    .select("*")
    .eq("restaurant_id", id);

  const abonnements = new Map(
    (
      (subscriptionsData ?? []) as (RestaurantSubscription & {
        module?: string;
      })[]
    ).map((abonnement) => [
      (abonnement.module ?? "visibilite") as Module,
      abonnement,
    ]),
  );
  const acces = await chargerAcces(id, supabase);

  const payes = MODULES.filter((cle) => {
    const abonnement = abonnements.get(cle);
    return Boolean(abonnement && abonnementOuvrant(abonnement.status));
  });

  // Rien de payé nulle part : on peut proposer le pack d'emblée.
  const aucunAbonnement = payes.length === 0;

  // Un seul module payé, et les deux lignes ne pendent pas déjà au même
  // abonnement : c'est le cas de la bascule. Prendre l'autre module
  // séparément coûterait 66,50 € HT là où le pack en vaut 59 — le client
  // fidèle paierait 90 € de plus par an que le nouveau venu.
  const abonnementsOuverts = new Set(
    payes.map((cle) => abonnements.get(cle)?.stripe_subscription_id),
  );
  const basculePossible = payes.length === 1 && abonnementsOuverts.size === 1;
  const manquant = basculePossible
    ? MODULES.find((cle) => !payes.includes(cle))
    : undefined;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.abonnement}
        title={`Abonnement — ${restaurant.nom}`}
      />

      {/* Ce que Stripe a répondu quand la souscription n'a pas pu
          s'ouvrir. Le message est le sien, en anglais et technique — mais
          un message technique se cherche, alors qu'une page qui ne fait
          rien ne se cherche pas. */}
      {query.stripe_error && (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900"
          role="alert"
        >
          <p className="font-medium">
            La souscription n&apos;a pas pu s&apos;ouvrir.
          </p>
          <p className="mt-1 font-mono text-xs leading-relaxed">
            {query.stripe_error === "configuration"
              ? "Aucun tarif n'est configuré pour ce module (STRIPE_PRICE_ID_…)."
              : query.stripe_error === "deja_abonne"
                ? "Ce module est déjà payé. Utilisez « Gérer » pour changer de carte ou résilier — souscrire une seconde fois vous ferait payer deux fois."
                : query.stripe_error}
          </p>
        </div>
      )}

      {query.checkout === "cancel" && (
        <p className="text-sm text-ink-soft">
          Souscription abandonnée. Rien n&apos;a été prélevé.
        </p>
      )}

      {/* La bascule ne passe pas par une page de paiement : sans ce mot,
          le restaurateur revient sur un écran qui a changé tout seul et
          se demande s'il a été débité. */}
      {query.checkout === "pack" && (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
          C&apos;est fait : ton abonnement couvre maintenant les deux modules.
          Seule la différence au prorata t&apos;a été facturée, et ta date de
          renouvellement n&apos;a pas changé.
        </p>
      )}

      {/* Les deux essais ne finissent pas le même jour : le bandeau
          annonce le plus long — la date à laquelle tout se referme — et
          chaque carte porte le sien. */}
      {acces.enEssai && essaiLePlusLong(acces) && (
        <p className="rounded-2xl border border-brand-orange/30 bg-brand-orange-soft px-5 py-4 text-sm text-brand-navy">
          <span className="font-medium">
            Essai gratuit — {essaiLePlusLong(acces)!.joursRestants} jour
            {essaiLePlusLong(acces)!.joursRestants > 1 ? "s" : ""} restant
            {essaiLePlusLong(acces)!.joursRestants > 1 ? "s" : ""}.
          </span>{" "}
          Chaque module a sa propre période, indiquée ci-dessous. Ensuite ils se
          paient séparément, et ta page de réservation comme ton site vitrine
          restent en ligne tant que le module correspondant l&apos;est.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {MODULES.map((cle) => {
          const abonnement = abonnements.get(cle);
          const paye = abonnement
            ? abonnementOuvrant(abonnement.status)
            : false;
          const ouvert = acces.ouvert[cle];

          return (
            <div
              key={cle}
              className={`flex flex-col gap-3 rounded-2xl border p-6 shadow-sm ${
                paye
                  ? "border-emerald-200/70 bg-white"
                  : "border-zinc-200/70 bg-white"
              }`}
            >
              <div className="flex flex-col gap-1">
                <span className="text-base font-semibold text-zinc-900">
                  {LIBELLE_MODULE[cle]}
                </span>
                <span className="text-sm font-medium text-brand-navy">
                  {PRIX_MODULE[cle]}{" "}
                  {/* Le HT pour comparer, le TTC pour ne pas être surpris
                      au débit : c'est le second qui est prélevé. */}
                  <span className="font-normal text-zinc-500">
                    ({PRIX_MODULE_TTC[cle]})
                  </span>
                </span>
                {acces.essai[cle] && (
                  <span className="text-sm text-brand-navy">
                    Essai en cours — {acces.essai[cle]!.joursRestants} jour
                    {acces.essai[cle]!.joursRestants > 1 ? "s" : ""} restant
                    {acces.essai[cle]!.joursRestants > 1 ? "s" : ""}.
                  </span>
                )}
                <span className="text-sm leading-relaxed text-zinc-500">
                  {RESUME_MODULE[cle]}
                </span>
              </div>

              {abonnement ? (
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-zinc-900">
                    Statut :{" "}
                    <span
                      className={paye ? "text-emerald-700" : "text-orange-600"}
                    >
                      {STATUS_LABELS[abonnement.status] ?? abonnement.status}
                    </span>
                    {/* Résilié à échéance : le statut reste « actif » chez
                        Stripe, et il l'est — mais ne pas le dire ferait
                        croire à une reconduction. */}
                    {abonnement.cancel_at_period_end && (
                      <span className="text-orange-600">
                        {" "}
                        — résiliation demandée
                      </span>
                    )}
                  </p>
                  {abonnement.current_period_end && (
                    <p className="text-sm text-zinc-500">
                      {abonnement.cancel_at_period_end
                        ? "Prend fin le "
                        : "Prochain renouvellement : "}
                      {new Date(
                        abonnement.current_period_end,
                      ).toLocaleDateString("fr-FR")}
                      {abonnement.cancel_at_period_end &&
                        " — le module se fermera ce jour-là."}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  {ouvert
                    ? "Ouvert pendant l'essai. Souscris pour le garder."
                    : "Ce module est fermé."}
                </p>
              )}

              <a
                href={
                  abonnement
                    ? `/api/stripe/portal?restaurant_id=${id}`
                    : `/api/stripe/checkout?restaurant_id=${id}&module=${cle}`
                }
                className={`mt-auto w-fit rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-colors ${
                  paye
                    ? "border border-zinc-300 text-zinc-700 hover:border-brand-navy hover:text-brand-navy"
                    : "bg-brand-navy text-white hover:bg-brand-navy-hover"
                }`}
              >
                {abonnement ? "Gérer" : "S'abonner"}
              </a>
            </div>
          );
        })}
      </div>

      {/* Le pack ne se propose qu'à qui ne paie encore rien. Le proposer
          à un restaurateur déjà abonné à un module l'enverrait vers un
          second abonnement au lieu d'une bascule : deux prélèvements pour
          une chose payée en double. Ce cas-là se règle au portail Stripe,
          ou par un message. */}
      {aucunAbonnement && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-brand-navy/20 bg-brand-orange-soft p-6 shadow-sm">
          <div className="flex min-w-0 flex-1 basis-64 flex-col gap-1">
            <span className="text-base font-semibold text-zinc-900">
              {LIBELLE_PACK}
            </span>
            <span className="text-sm font-medium text-brand-navy">
              {PRIX_PACK}{" "}
              <span className="font-normal text-zinc-500">
                ({PRIX_PACK_TTC})
              </span>
            </span>
            <span className="text-sm leading-relaxed text-zinc-600">
              {RESUME_PACK}
            </span>
          </div>
          <a
            href={`/api/stripe/checkout?restaurant_id=${id}&module=pack`}
            className="w-fit rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-navy-hover"
          >
            Prendre les deux
          </a>
        </div>
      )}

      {/* Ajouter le second module, c'est passer au pack — jamais souscrire
          une seconde fois. On le dit avec les chiffres, parce que c'est là
          que le restaurateur comprend qu'on ne cherche pas à lui vendre
          deux abonnements. */}
      {basculePossible && manquant && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-brand-navy/20 bg-brand-orange-soft p-6 shadow-sm">
          <div className="flex min-w-0 flex-1 basis-64 flex-col gap-1">
            <span className="text-base font-semibold text-zinc-900">
              Ajouter {LIBELLE_MODULE[manquant]}
            </span>
            <span className="text-sm font-medium text-brand-navy">
              {PRIX_PACK}{" "}
              <span className="font-normal text-zinc-500">
                ({PRIX_PACK_TTC})
              </span>
            </span>
            <span className="text-sm leading-relaxed text-zinc-600">
              Ton abonnement passe au pack, qui ouvre les deux modules pour
              moins cher que les deux pris séparément. Tu ne paies
              aujourd&apos;hui que la différence au prorata des jours restants,
              et ta date de renouvellement ne change pas.
            </span>
          </div>
          <a
            href={`/api/stripe/pack?restaurant_id=${id}`}
            className="w-fit rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-navy-hover"
          >
            Passer au pack
          </a>
        </div>
      )}

      <p className="text-sm text-zinc-500">
        Les deux modules s&apos;achètent séparément : tu peux prendre la
        visibilité sans les réservations, ou l&apos;inverse. Un abonnement vaut
        pour cet établissement — un second restaurant a son propre carnet, sa
        propre fiche Google et sa propre clientèle, donc ses propres
        abonnements. Aucune commission par couvert, jamais.
      </p>
    </div>
  );
}
