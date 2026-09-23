import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { Compteur, TitreSection } from "@/components/dashboard/Compteur";
import { BoutonCopier } from "@/components/dashboard/BoutonCopier";
import {
  EncaisserBon,
  OffrirBon,
  ReglagesBons,
} from "@/components/bons/GestionBons";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import { siteUrl } from "@/lib/site-url";
import {
  MONTANTS_PAR_DEFAUT,
  etatDuBon,
  normaliserCode,
  prixBon,
  type EtatBon,
} from "@/lib/bons/regles";
import type { Bon } from "@/lib/bons/serveur";
import { annulerBon, prolongerBon } from "./actions";

/**
 * Les bons cadeaux, côté maison : la page à partager, les réglages, et
 * surtout la caisse — taper un code, voir ce qu'il reste, déduire.
 */

const LIBELLE_ETAT: Record<EtatBon, string> = {
  attente: "Paiement en cours",
  valide: "Valable",
  epuise: "Utilisé",
  expire: "Expiré",
  annule: "Annulé",
};

const COULEUR_ETAT: Record<EtatBon, string> = {
  attente: "border-zinc-200 bg-zinc-50 text-zinc-500",
  valide: "border-emerald-200 bg-emerald-50 text-emerald-800",
  epuise: "border-zinc-200 bg-zinc-100 text-zinc-600",
  expire: "border-brand-orange/30 bg-brand-orange-soft text-ink",
  annule: "border-zinc-200 bg-zinc-100 text-zinc-500",
};

function aujourdhuiParis(): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Le jour ISO dans `n` jours : lu hors du rendu, comme toute horloge. */
function dansJours(n: number): string {
  return new Date(Date.now() + n * 24 * 3600 * 1000).toISOString().slice(0, 10);
}

const jour = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).toLocaleDateString(
    "fr-FR",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Europe/Paris",
    },
  );

const enEuros = (centimes: number) =>
  (centimes / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: centimes % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

export default async function BonsCadeauxPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { id } = await params;
  const { code: codeCherche } = await searchParams;
  await exiger(id, "gerant");
  await exigerModule(id, "reservations");

  const supabase = await createClient();
  const [{ data: restaurantData }, { data: connexion }, bonsResult] =
    await Promise.all([
      supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("restaurant_stripe_connexions")
        .select("stripe_account_id, paiements_actifs")
        .eq("restaurant_id", id)
        .maybeSingle(),
      supabase
        .from("restaurant_bons_cadeaux")
        .select("*")
        .eq("restaurant_id", id)
        .neq("statut", "attente")
        .order("created_at", { ascending: false })
        .limit(300),
    ]);

  const restaurant = restaurantData as {
    id: string;
    nom: string;
    slug_reservation: string | null;
    bons_cadeaux_actifs?: boolean | null;
    bons_cadeaux_montants?: number[] | null;
    bons_cadeaux_validite_mois?: number | null;
    bons_cadeaux_texte?: string | null;
  } | null;
  if (!restaurant) notFound();

  const migrationManquante =
    bonsResult.error?.code === "42P01" ||
    bonsResult.error?.code === "PGRST205" ||
    restaurant.bons_cadeaux_actifs === undefined;
  const stripe = connexion as {
    stripe_account_id: string;
    paiements_actifs: boolean;
  } | null;
  const stripePret = Boolean(
    stripe?.stripe_account_id && stripe.paiements_actifs,
  );

  const aujourdhui = aujourdhuiParis();
  const bons = (bonsResult.data ?? []) as Bon[];
  const avecEtat = bons.map((bon) => ({
    bon,
    etat: etatDuBon(bon, aujourdhui),
  }));
  const vendus = bons.filter((b) => b.origine === "vente");
  const encaisse = vendus.reduce((t, b) => t + b.montant_centimes, 0);
  const aHonorer = avecEtat
    .filter((x) => x.etat === "valide")
    .reduce((t, x) => t + x.bon.solde_centimes, 0);
  const dansUnMois = dansJours(30);
  const bientotExpires = avecEtat.filter(
    (x) =>
      x.etat === "valide" && x.bon.expire_le && x.bon.expire_le <= dansUnMois,
  ).length;

  // La caisse : un code tapé, retrouvé parmi les bons de cette maison
  // seulement — la politique d'accès le garantit, le filtre le redit.
  const code = codeCherche ? normaliserCode(codeCherche) : null;
  let trouve: { bon: Bon; etat: EtatBon } | null = null;
  let utilisations: { montant_centimes: number; utilise_le: string }[] = [];
  if (code) {
    const { data } = await supabase
      .from("restaurant_bons_cadeaux")
      .select("*")
      .eq("restaurant_id", id)
      .eq("code", code)
      .maybeSingle();
    if (data) {
      const bon = data as Bon;
      trouve = { bon, etat: etatDuBon(bon, aujourdhui) };
      const { data: passages } = await supabase
        .from("restaurant_bons_utilisations")
        .select("montant_centimes, utilise_le")
        .eq("bon_id", bon.id)
        .order("utilise_le", { ascending: false });
      utilisations = (passages ?? []) as typeof utilisations;
    }
  }

  const lienPublic = restaurant.slug_reservation
    ? `${siteUrl()}/cadeau/${restaurant.slug_reservation}`
    : null;
  const enVente = Boolean(restaurant.bons_cadeaux_actifs) && stripePret;

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-3">
        <PageHeader
          icon={dashboardIcons.cadeau}
          title={`Bons cadeaux — ${restaurant.nom}`}
        />
        <p className="max-w-4xl text-sm text-zinc-600">
          Tes clients offrent un repas chez toi depuis une page à ton nom. Le
          paiement arrive sur ton compte Stripe, sans commission Klarr. Le
          bénéficiaire montre son code à l&apos;addition : tu le tapes ici et tu
          déduis ce qu&apos;il consomme, en une ou plusieurs fois.
        </p>
      </div>

      {migrationManquante && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900">
          <strong>Migration à passer :</strong>{" "}
          supabase/migrations/0085_bons_cadeaux.sql n&apos;est pas encore en
          place. La page s&apos;ouvrira une fois la migration passée.
        </p>
      )}

      {!migrationManquante && !stripePret && (
        <p className="max-w-4xl rounded-2xl border border-brand-orange/30 bg-brand-orange-soft px-5 py-4 text-sm text-ink">
          Pour vendre des bons, relie d&apos;abord ton compte Stripe :
          c&apos;est lui qui reçoit l&apos;argent.{" "}
          <Link
            href={`/dashboard/${id}/connexions`}
            className="font-semibold underline"
          >
            Aller aux connexions
          </Link>
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Compteur valeur={vendus.length} libelle="bons vendus" />
        <Compteur valeur={prixBon(encaisse)} libelle="encaissés au total" />
        <Compteur
          valeur={prixBon(aHonorer)}
          libelle="encore à servir sur les bons valables"
        />
        <Compteur
          valeur={bientotExpires}
          libelle="expirent dans les 30 jours"
          accent={bientotExpires > 0}
        />
      </div>

      <section
        id="encaisser"
        className="flex scroll-mt-8 flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm"
      >
        <TitreSection>Encaisser un bon</TitreSection>
        <form
          action={`/dashboard/${id}/bons-cadeaux#encaisser`}
          className="flex flex-wrap items-end gap-3"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">Code du bon</span>
            <input
              name="code"
              defaultValue={code ?? ""}
              placeholder="ABCD-EFGH"
              autoComplete="off"
              className="w-48 rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 font-mono text-sm uppercase tracking-[0.12em] outline-none transition-colors focus:border-brand-navy focus:bg-white"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
          >
            Chercher
          </button>
        </form>

        {code && !trouve && (
          <p className="text-sm text-zinc-600">
            Aucun bon <span className="font-mono">{code}</span> chez toi.
            Vérifie les lettres : le code n&apos;a ni 0, ni O, ni 1, ni I, ni L.
          </p>
        )}

        {trouve && (
          <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/60 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-lg font-bold tracking-[0.14em] text-brand-navy">
                  {trouve.bon.code}
                </span>
                <span className="text-sm text-zinc-600">
                  {trouve.bon.beneficiaire_nom
                    ? `Pour ${trouve.bon.beneficiaire_nom}`
                    : "Sans nom"}
                  {trouve.bon.origine === "vente"
                    ? ` · offert par ${trouve.bon.acheteur_nom}`
                    : " · offert par la maison"}
                </span>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${COULEUR_ETAT[trouve.etat]}`}
              >
                {LIBELLE_ETAT[trouve.etat]}
              </span>
            </div>
            <dl className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <dt className="text-zinc-500">Valeur</dt>
                <dd className="font-semibold text-ink">
                  {prixBon(trouve.bon.montant_centimes)}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Reste</dt>
                <dd className="font-semibold text-ink">
                  {prixBon(trouve.bon.solde_centimes)}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Jusqu&apos;au</dt>
                <dd className="font-semibold text-ink">
                  {trouve.bon.expire_le ? jour(trouve.bon.expire_le) : "—"}
                </dd>
              </div>
            </dl>
            {trouve.etat === "valide" ? (
              <EncaisserBon
                restaurantId={id}
                bonId={trouve.bon.id}
                soldeEuros={enEuros(trouve.bon.solde_centimes)}
              />
            ) : trouve.etat === "expire" ? (
              <form
                action={prolongerBon}
                className="flex flex-wrap items-center gap-3"
              >
                <input type="hidden" name="restaurant_id" value={id} />
                <input type="hidden" name="bon_id" value={trouve.bon.id} />
                <span className="text-sm text-zinc-600">
                  Expiré. Tu peux lui accorder trois mois de plus.
                </span>
                <button
                  type="submit"
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
                >
                  Prolonger de 3 mois
                </button>
              </form>
            ) : null}
            {utilisations.length > 0 && (
              <ul className="flex flex-col gap-1 border-t border-zinc-200 pt-3 text-sm text-zinc-600">
                {utilisations.map((u) => (
                  <li key={u.utilise_le}>
                    {prixBon(u.montant_centimes)} déduits le{" "}
                    {jour(u.utilise_le)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
        <TitreSection
          aside={
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                enVente
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-zinc-200 bg-zinc-50 text-zinc-500"
              }`}
            >
              {enVente ? "En vente" : "Pas en vente"}
            </span>
          }
        >
          Ta page de bons cadeaux
        </TitreSection>
        {lienPublic ? (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <code className="min-w-0 break-all rounded-lg bg-zinc-50 px-3 py-2 text-sm text-ink">
                {lienPublic}
              </code>
              <BoutonCopier texte={lienPublic} />
              <a
                href={lienPublic}
                target="_blank"
                rel="noopener"
                className="text-sm font-semibold text-brand-navy hover:underline"
              >
                Voir la page →
              </a>
            </div>
            <p className="text-sm text-zinc-600">
              Colle-la dans ta bio Instagram, sur ta vitrine et dans ta fiche
              Google, et parles-en avant les fêtes : c&apos;est en novembre et
              décembre que les bons se vendent.
            </p>
          </>
        ) : (
          <p className="text-sm text-zinc-600">
            Ta page de réservation n&apos;a pas encore d&apos;adresse : la page
            de bons cadeaux utilisera la même.
          </p>
        )}
        {!migrationManquante && (
          <div className="border-t border-zinc-100 pt-5">
            <ReglagesBons
              restaurantId={id}
              actifs={Boolean(restaurant.bons_cadeaux_actifs)}
              montants={(restaurant.bons_cadeaux_montants?.length
                ? restaurant.bons_cadeaux_montants
                : MONTANTS_PAR_DEFAUT
              )
                .map(enEuros)
                .join(", ")}
              validite={restaurant.bons_cadeaux_validite_mois ?? 12}
              texte={restaurant.bons_cadeaux_texte ?? ""}
            />
          </div>
        )}
      </section>

      {!migrationManquante && (
        <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
          <TitreSection>Offrir un bon</TitreSection>
          <p className="max-w-3xl text-sm text-zinc-600">
            Un geste pour un client, un lot de concours, un partenaire : le bon
            est créé tout de suite, sans paiement, et envoyé par e-mail si tu
            donnes une adresse.
          </p>
          <OffrirBon restaurantId={id} />
        </section>
      )}

      <section className="flex flex-col gap-4">
        <TitreSection
          aside={bons.length > 0 ? `${bons.length} bons` : undefined}
        >
          Tous les bons
        </TitreSection>
        {bons.length === 0 ? (
          <p className="rounded-2xl border border-zinc-200/70 bg-white p-6 text-sm text-zinc-600 shadow-sm">
            Aucun bon pour l&apos;instant. Les bons vendus et offerts
            apparaîtront ici.
          </p>
        ) : (
          <ul className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
            {avecEtat.map(({ bon, etat }, rang) => (
              <li
                key={bon.id}
                className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4 text-sm ${
                  rang > 0 ? "border-t border-zinc-100" : ""
                }`}
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/dashboard/${id}/bons-cadeaux?code=${bon.code}#encaisser`}
                      className="font-mono font-bold tracking-[0.1em] text-brand-navy hover:underline"
                    >
                      {bon.code}
                    </Link>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${COULEUR_ETAT[etat]}`}
                    >
                      {LIBELLE_ETAT[etat]}
                    </span>
                  </span>
                  <span className="truncate text-zinc-600">
                    {bon.origine === "vente" ? bon.acheteur_nom : "La maison"}
                    {bon.beneficiaire_nom ? ` → ${bon.beneficiaire_nom}` : ""}
                    {" · "}
                    {jour(bon.paye_le ?? bon.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-5">
                  <span className="text-right">
                    <span className="block font-semibold text-ink">
                      {prixBon(bon.solde_centimes)}
                      <span className="font-normal text-zinc-500">
                        {" "}
                        / {prixBon(bon.montant_centimes)}
                      </span>
                    </span>
                    {bon.expire_le && (
                      <span className="block text-xs text-zinc-500">
                        jusqu&apos;au {jour(bon.expire_le)}
                      </span>
                    )}
                  </span>
                  <a
                    href={`/bon/${bon.paiement_token}`}
                    target="_blank"
                    rel="noopener"
                    className="text-sm font-semibold text-brand-navy hover:underline"
                  >
                    Voir
                  </a>
                  {etat === "valide" && (
                    // Deux gestes, pas un : un bon annulé par erreur est
                    // un client refusé en caisse.
                    <details className="relative">
                      <summary className="cursor-pointer list-none text-sm text-zinc-500 hover:text-red-600">
                        Annuler
                      </summary>
                      <form
                        action={annulerBon}
                        className="absolute right-0 z-10 mt-2 flex w-64 flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-lg"
                      >
                        <input type="hidden" name="restaurant_id" value={id} />
                        <input type="hidden" name="bon_id" value={bon.id} />
                        <span className="text-xs text-zinc-600">
                          Rembourse-le d&apos;abord dans Stripe si le client
                          l&apos;a payé. Le bon ne sera plus accepté.
                        </span>
                        <button
                          type="submit"
                          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Annuler ce bon
                        </button>
                      </form>
                    </details>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="max-w-3xl text-xs text-zinc-500">
          Rembourser un bon se fait dans ton tableau de bord Stripe ; annule-le
          ensuite ici pour qu&apos;il ne soit plus accepté. Côté TVA, un bon
          utilisable sur toute ta carte se déclare quand il est utilisé, pas à
          l&apos;achat — ton comptable te le confirmera.
        </p>
      </section>
    </div>
  );
}
