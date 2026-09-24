import { notFound } from "next/navigation";
import { langueUtilisateur } from "@/lib/i18n/langue";
import { ABONNEMENT } from "@/lib/i18n/abonnement";
import { dateBreve } from "@/lib/i18n/dates";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { Compteur } from "@/components/dashboard/Compteur";
import { ACCUEIL, type ClesAccueil } from "@/lib/i18n/accueil";
import type { Restaurant } from "@/types/restaurant";
import type { RestaurantSubscription } from "@/types/subscription";
import { exiger } from "@/lib/equipe/roles";
import { chargerAcces } from "@/lib/abonnement/acces";
import { factureEnAttente } from "@/lib/stripe/factures";
import {
  INFOS_VIDES,
  clientDuRestaurant,
  lireFacturation,
  listerFactures,
  type Facture,
} from "@/lib/stripe/facturation";
import { FACTURATION } from "@/lib/i18n/facturation";
import { enregistrerFacturation } from "./actions";
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

/**
 * Ce que chaque module ouvre, pour la liste de sa carte. Les libellés
 * sont ceux de l'accueil du tableau de bord : on reconnaît les cases
 * qu'on voit tous les jours.
 */
const INCLUS: Record<Module, (keyof ClesAccueil["entrees"])[]> = {
  visibilite: [
    "vitrine",
    "carte",
    "photos",
    "avis",
    "retours",
    "seo",
    "visibiliteIa",
    "faq",
  ],
  reservations: [
    "reservations",
    "service",
    "clients",
    "experiences",
    "paiements",
    "carte",
    "faq",
  ],
};

export default async function AbonnementPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    stripe_error?: string;
    checkout?: string;
    facturation?: string;
  }>;
}) {
  const { id } = await params;
  const langue = await langueUtilisateur();
  const a = ABONNEMENT[langue];
  const f = FACTURATION[langue];
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

  // Toutes les lignes d'un établissement portent le même client Stripe.
  const clientStripe = payes
    .map((cle) => abonnements.get(cle)?.stripe_customer_id)
    .find(Boolean);
  // Le client de facturation peut exister sans abonnement payé : un
  // ancien abonnement, ou des informations remplies pendant l'essai.
  const clientFacturation =
    clientStripe ?? (await clientDuRestaurant(supabase, id));
  const [facture, infos, factures] = await Promise.all([
    clientStripe ? factureEnAttente(clientStripe) : null,
    clientFacturation ? lireFacturation(clientFacturation) : null,
    clientFacturation
      ? listerFactures(clientFacturation)
      : Promise.resolve([] as Facture[]),
  ]);
  const valeurs = infos ?? INFOS_VIDES;
  const retourFacturation =
    query.facturation && query.facturation in f.retours
      ? (query.facturation as keyof typeof f.retours)
      : null;
  const locale =
    langue === "zh" ? "zh-CN" : langue === "en" ? "en-GB" : "fr-FR";
  const nomsPays = new Intl.DisplayNames([locale], { type: "region" });
  const PAYS = ["FR", "BE", "LU", "CH", "MC", "DE", "ES", "IT", "NL", "PT"];
  const dateFacture = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Europe/Paris",
    });
  const montantFacture = (x: Facture) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: x.devise,
    }).format(x.montantCentimes / 100);
  const COULEUR_STATUT: Record<Facture["statut"], string> = {
    payee: "border-emerald-200 bg-emerald-50 text-emerald-800",
    a_regler: "border-amber-300 bg-amber-50 text-amber-900",
    annulee: "border-zinc-200 bg-zinc-100 text-zinc-500",
    autre: "border-zinc-200 bg-zinc-50 text-zinc-600",
  };

  // Les trois chiffres que l'on vient chercher ici : ce qui est payé,
  // combien de jours d'essai il reste, et quand part le prochain débit.
  const essai = essaiLePlusLong(acces);
  const prochain = payes
    .map((cle) => abonnements.get(cle))
    .filter(
      (abonnement) =>
        abonnement?.current_period_end && !abonnement.cancel_at_period_end,
    )
    .map((abonnement) => abonnement!.current_period_end!)
    .sort()[0];
  const entrees = ACCUEIL[langue].entrees;
  // Le pack se range à côté des deux modules quand il a quelque chose à
  // proposer : trois cartes côte à côte se comparent d'un regard.
  const offrePack = aucunAbonnement || (basculePossible && manquant);

  return (
    <div className="flex w-full flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-3">
        <PageHeader
          icon={dashboardIcons.abonnement}
          title={a.titre(restaurant.nom)}
        />
        <p className="max-w-4xl text-sm text-zinc-600">{a.chapo}</p>
      </div>

      {/* Ce que Stripe a répondu quand la souscription n'a pas pu
          s'ouvrir. Le message est le sien, en anglais et technique — mais
          un message technique se cherche, alors qu'une page qui ne fait
          rien ne se cherche pas. */}
      {query.stripe_error && (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900"
          role="alert"
        >
          <p className="font-medium">{a.erreurTitre}</p>
          <p className="mt-1 font-mono text-xs leading-relaxed">
            {query.stripe_error === "configuration"
              ? a.erreurConfiguration
              : query.stripe_error === "deja_abonne"
                ? a.erreurDejaAbonne
                : query.stripe_error}
          </p>
        </div>
      )}

      {/* Une facture ouverte prime sur le reste de l'écran : le module
          tourne encore, mais il se fermera si personne ne fait ce geste.
          Le restaurateur doit le voir avant les tarifs. */}
      {facture && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4">
          <div className="flex min-w-0 flex-1 basis-64 flex-col gap-1">
            <span className="text-sm font-semibold text-amber-900">
              {facture.authentification
                ? a.banqueAttend(facture.montant)
                : a.factureAttend(facture.montant)}
            </span>
            <span className="text-sm leading-relaxed text-amber-800">
              {facture.authentification
                ? a.authentificationTexte
                : a.relancesTexte}
            </span>
          </div>
          <a
            href={facture.url}
            target="_blank"
            rel="noreferrer"
            className="w-fit rounded-lg bg-amber-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-800"
          >
            {facture.authentification ? a.confirmerPaiement : a.regler}
          </a>
        </div>
      )}

      {query.checkout === "cancel" && (
        <p className="text-sm text-ink-soft">{a.souscriptionAbandonnee}</p>
      )}

      {/* La bascule ne passe pas par une page de paiement : sans ce mot,
          le restaurateur revient sur un écran qui a changé tout seul et
          se demande s'il a été débité. */}
      {query.checkout === "pack" && (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
          {a.basculePack}
        </p>
      )}

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Compteur
          valeur={`${payes.length}/${MODULES.length}`}
          libelle={a.compteurModules}
        />
        <Compteur
          valeur={essai ? essai.joursRestants : "—"}
          libelle={essai ? a.compteurEssai : a.compteurSansEssai}
          accent={Boolean(essai && essai.joursRestants <= 5)}
        />
        <Compteur
          valeur={prochain ? dateBreve(prochain, langue) : "—"}
          libelle={prochain ? a.compteurProchain : a.compteurSansPrelevement}
        />
      </div>

      {/* Les deux essais ne finissent pas le même jour : le bandeau
          annonce le plus long — la date à laquelle tout se referme — et
          chaque carte porte le sien. */}
      {acces.enEssai && essai && (
        <p className="rounded-2xl border border-brand-orange/30 bg-brand-orange-soft px-5 py-4 text-sm text-brand-navy">
          <span className="font-medium">
            {a.essaiBandeau(essai.joursRestants)}
          </span>{" "}
          {a.essaiChapo}
        </p>
      )}

      <div
        className={`grid items-stretch gap-4 lg:grid-cols-2 ${
          offrePack ? "2xl:grid-cols-3" : ""
        }`}
      >
        {MODULES.map((cle) => {
          const abonnement = abonnements.get(cle);
          const paye = abonnement
            ? abonnementOuvrant(abonnement.status)
            : false;
          const ouvert = acces.ouvert[cle];

          return (
            <div
              key={cle}
              className={`flex flex-col gap-6 rounded-2xl border bg-white p-6 shadow-sm sm:p-8 ${
                paye ? "border-emerald-300/70" : "border-zinc-200/70"
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-serif text-3xl text-ink">
                    {LIBELLE_MODULE[cle]}
                  </span>
                  {abonnement ? (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        paye
                          ? "bg-emerald-50 text-emerald-800"
                          : "bg-orange-50 text-orange-700"
                      }`}
                    >
                      {a.statuts[abonnement.status as keyof typeof a.statuts] ??
                        abonnement.status}
                    </span>
                  ) : (
                    acces.essai[cle] && (
                      <span className="rounded-full bg-brand-orange-soft px-3 py-1 text-xs font-semibold text-brand-navy">
                        {a.statuts.trialing}
                      </span>
                    )
                  )}
                </div>
                <span className="text-2xl font-semibold text-brand-navy">
                  {PRIX_MODULE[cle]}{" "}
                  {/* Le HT pour comparer, le TTC pour ne pas être surpris
                      au débit : c'est le second qui est prélevé. */}
                  <span className="text-base font-normal text-zinc-500">
                    ({PRIX_MODULE_TTC[cle]})
                  </span>
                </span>
                {acces.essai[cle] && (
                  <span className="text-sm text-brand-navy">
                    {a.essaiEnCours(acces.essai[cle]!.joursRestants)}
                  </span>
                )}
                <span className="text-sm leading-relaxed text-zinc-600">
                  {RESUME_MODULE[cle]}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                  {a.inclus}
                </span>
                <ul className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
                  {INCLUS[cle].map((entree) => (
                    <li
                      key={entree}
                      className="flex items-center gap-2 text-sm text-ink"
                    >
                      <span aria-hidden="true" className="text-emerald-600">
                        ✓
                      </span>
                      {entrees[entree].label}
                    </li>
                  ))}
                </ul>
              </div>

              {abonnement ? (
                <div className="flex flex-col gap-1 border-t border-zinc-100 pt-4">
                  {/* Résilié à échéance : le statut reste « actif » chez
                      Stripe, et il l'est — mais ne pas le dire ferait
                      croire à une reconduction. */}
                  {abonnement.cancel_at_period_end && (
                    <p className="text-sm font-medium text-orange-600">
                      {a.resiliationDemandee.replace(/^\s*—\s*/, "")}
                    </p>
                  )}
                  {abonnement.current_period_end && (
                    <p className="text-sm text-zinc-500">
                      {abonnement.cancel_at_period_end
                        ? a.prendFinLe(
                            dateBreve(abonnement.current_period_end, langue),
                          )
                        : a.prochainRenouvellement(
                            dateBreve(abonnement.current_period_end, langue),
                          )}
                      {abonnement.cancel_at_period_end && a.fermeraCeJourLa}
                    </p>
                  )}
                </div>
              ) : (
                <p className="border-t border-zinc-100 pt-4 text-sm text-zinc-500">
                  {ouvert ? a.ouvertPendantEssai : a.moduleFerme}
                </p>
              )}

              <a
                href={
                  abonnement
                    ? `/api/stripe/portal?restaurant_id=${id}`
                    : `/api/stripe/checkout?restaurant_id=${id}&module=${cle}`
                }
                className={`mt-auto w-fit rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors ${
                  paye
                    ? "border border-zinc-300 text-zinc-700 hover:border-brand-navy hover:text-brand-navy"
                    : "bg-brand-navy text-white hover:bg-brand-navy-hover"
                }`}
              >
                {abonnement ? a.gerer : a.sabonner}
              </a>
            </div>
          );
        })}

        {/* Le pack ne se propose qu'à qui ne paie encore rien. Le proposer
            à un restaurateur déjà abonné à un module l'enverrait vers un
            second abonnement au lieu d'une bascule : deux prélèvements pour
            une chose payée en double. Ce cas-là se règle au portail Stripe,
            ou par un message. */}
        {aucunAbonnement && (
          <div className="relative flex flex-col gap-6 rounded-2xl border-2 border-brand-navy bg-brand-orange-soft p-6 shadow-sm sm:p-8 lg:col-span-2 2xl:col-span-1">
            <span className="w-fit rounded-full bg-brand-navy px-3 py-1 text-xs font-semibold text-white">
              {a.plusAvantageux}
            </span>
            <div className="flex flex-col gap-2">
              <span className="font-serif text-3xl text-ink">
                {LIBELLE_PACK}
              </span>
              <span className="text-2xl font-semibold text-brand-navy">
                {PRIX_PACK}{" "}
                <span className="text-base font-normal text-zinc-500">
                  ({PRIX_PACK_TTC})
                </span>
              </span>
              <span className="text-sm leading-relaxed text-zinc-700">
                {RESUME_PACK}
              </span>
            </div>
            <a
              href={`/api/stripe/checkout?restaurant_id=${id}&module=pack`}
              className="mt-auto w-fit rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-navy-hover"
            >
              {a.prendreLesDeux}
            </a>
          </div>
        )}

        {/* Ajouter le second module, c'est passer au pack — jamais souscrire
            une seconde fois. On le dit avec les chiffres, parce que c'est là
            que le restaurateur comprend qu'on ne cherche pas à lui vendre
            deux abonnements. */}
        {basculePossible && manquant && (
          <div className="flex flex-col gap-6 rounded-2xl border-2 border-brand-navy bg-brand-orange-soft p-6 shadow-sm sm:p-8 lg:col-span-2 2xl:col-span-1">
            <span className="w-fit rounded-full bg-brand-navy px-3 py-1 text-xs font-semibold text-white">
              {a.plusAvantageux}
            </span>
            <div className="flex flex-col gap-2">
              <span className="font-serif text-3xl text-ink">
                {a.ajouterModule(LIBELLE_MODULE[manquant])}
              </span>
              <span className="text-2xl font-semibold text-brand-navy">
                {PRIX_PACK}{" "}
                <span className="text-base font-normal text-zinc-500">
                  ({PRIX_PACK_TTC})
                </span>
              </span>
              <span className="text-sm leading-relaxed text-zinc-700">
                {a.packExplication}
              </span>
            </div>
            <a
              href={`/api/stripe/pack?restaurant_id=${id}`}
              className="mt-auto w-fit rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-navy-hover"
            >
              {a.passerAuPack}
            </a>
          </div>
        )}
      </div>

      {/* ── Les factures, et ce qu'elles portent ──────────────────────── */}
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <section className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2 className="font-serif text-2xl text-ink">{f.facturesTitre}</h2>
            {factures.length > 0 && (
              <span className="text-xs text-zinc-500">
                {f.facturesAside(factures.length)}
              </span>
            )}
          </div>
          {factures.length > 0 ? (
            <ul className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
              {factures.map((x) => (
                <li
                  key={x.id}
                  className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-zinc-500"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 3h7l5 5v13H7z" />
                      <path d="M14 3v5h5M10 13h6M10 17h6" />
                    </svg>
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-ink">
                        {dateFacture(x.date)}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${COULEUR_STATUT[x.statut]}`}
                      >
                        {f.statuts[x.statut]}
                      </span>
                    </span>
                    {x.numero && (
                      <span className="font-mono text-xs text-zinc-500">
                        {x.numero}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-ink tabular-nums">
                    {montantFacture(x)}
                  </span>
                  <span className="flex items-center gap-3">
                    {x.statut === "a_regler" && x.page && (
                      <a
                        href={x.page}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-amber-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800"
                      >
                        {f.regler}
                      </a>
                    )}
                    {x.pdf && (
                      <a
                        href={x.pdf}
                        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
                      >
                        {f.telecharger} ↓
                      </a>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-dashed border-zinc-300 bg-white/60 px-5 py-8 text-center text-sm text-zinc-600">
              {acces.enEssai ? f.facturesVideEssai : f.facturesVide}
            </p>
          )}
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
            <span>{f.facturesPied}</span>
            {clientStripe && (
              <a
                href={`/api/stripe/portal?restaurant_id=${id}`}
                className="font-semibold text-brand-navy hover:underline"
              >
                {f.moyenDePaiement} →
              </a>
            )}
          </p>
        </section>

        <section
          id="facturation"
          className="flex scroll-mt-8 flex-col gap-5 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm lg:sticky lg:top-6"
        >
          <div className="flex flex-col gap-1">
            <h2 className="font-serif text-2xl text-ink">{f.infosTitre}</h2>
            <span className="text-sm text-zinc-600">{f.infosChapo}</span>
          </div>

          {retourFacturation && (
            <p
              role="status"
              className={`rounded-xl border px-4 py-3 text-sm ${
                retourFacturation === "ok"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-amber-300 bg-amber-50 text-amber-900"
              }`}
            >
              {f.retours[retourFacturation]}
            </p>
          )}

          <form action={enregistrerFacturation} className="flex flex-col gap-4">
            <input type="hidden" name="restaurant_id" value={id} />
            {(
              [
                ["nom", f.nom, valeurs.nom, f.nomAide, "organization", true],
                ["email", f.email, valeurs.email, f.emailAide, "email", true],
                [
                  "ligne1",
                  f.ligne1,
                  valeurs.ligne1,
                  null,
                  "address-line1",
                  true,
                ],
                [
                  "ligne2",
                  f.ligne2,
                  valeurs.ligne2,
                  null,
                  "address-line2",
                  false,
                ],
              ] as const
            ).map(([nom, libelle, valeur, aide, auto, requis]) => (
              <label key={nom} className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink">{libelle}</span>
                <input
                  name={nom}
                  type={nom === "email" ? "email" : "text"}
                  defaultValue={valeur}
                  autoComplete={auto}
                  required={requis}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-brand-navy focus:outline-none"
                />
                {aide && <span className="text-xs text-zinc-500">{aide}</span>}
              </label>
            ))}
            <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink">
                  {f.codePostal}
                </span>
                <input
                  name="code_postal"
                  defaultValue={valeurs.codePostal}
                  autoComplete="postal-code"
                  required
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-brand-navy focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink">{f.ville}</span>
                <input
                  name="ville"
                  defaultValue={valeurs.ville}
                  autoComplete="address-level2"
                  required
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-brand-navy focus:outline-none"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink">{f.pays}</span>
              <select
                name="pays"
                defaultValue={valeurs.pays}
                autoComplete="country"
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-brand-navy focus:outline-none"
              >
                {(PAYS.includes(valeurs.pays)
                  ? PAYS
                  : [...PAYS, valeurs.pays]
                ).map((code) => (
                  <option key={code} value={code}>
                    {nomsPays.of(code) ?? code}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-col gap-4 border-t border-zinc-100 pt-4">
              {(
                [
                  ["siret", f.siret, valeurs.siret, f.siretAide],
                  ["tva", f.tva, valeurs.tva, f.tvaAide],
                ] as const
              ).map(([nom, libelle, valeur, aide]) => (
                <label key={nom} className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-ink">
                    {libelle}
                  </span>
                  <input
                    name={nom}
                    defaultValue={valeur}
                    inputMode={nom === "siret" ? "numeric" : "text"}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-mono text-sm tracking-wide text-ink focus:border-brand-navy focus:outline-none"
                  />
                  <span className="text-xs text-zinc-500">{aide}</span>
                </label>
              ))}
            </div>
            <button
              type="submit"
              className="w-fit rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-navy-hover"
            >
              {f.enregistrer}
            </button>
            <span className="text-xs leading-relaxed text-zinc-500">
              {f.prochainesFactures}
            </span>
          </form>
        </section>
      </div>

      <p className="max-w-4xl text-sm leading-relaxed text-zinc-500">
        {a.pied}
      </p>
    </div>
  );
}
