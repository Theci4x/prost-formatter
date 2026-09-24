import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { Compteur, TitreSection } from "@/components/dashboard/Compteur";
import { FacebookConnectButton } from "@/components/connections/FacebookConnectButton";
import { platformIcons } from "@/components/connections/platformIcons";
import type { Restaurant } from "@/types/restaurant";
import { exiger } from "@/lib/equipe/roles";
import { tiktokDisponible } from "@/lib/tiktok/oauth";

type Platform = {
  key: string;
  name: string;
  // Ce que la connexion débloque, en langage de restaurateur.
  purpose: string;
  /** Le détail, en deux ou trois mots par ligne. */
  debloque: string[];
  icon: React.ReactNode;
  color: string;
  tint: string;
  connected: boolean;
  /** Relié, mais pas encore utilisable : un dossier Stripe à terminer. */
  aTerminer?: boolean;
  // Le compte réellement relié, pour que le restaurateur vérifie d'un coup
  // d'œil qu'il n'a pas connecté la page d'un autre établissement.
  detail: string | null;
  managePath: string;
  connectHref?: string;
  connectButton?: React.ReactNode;
};

function StatusDot({ connected }: { connected: boolean }) {
  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${
        connected ? "bg-emerald-500" : "bg-zinc-300"
      }`}
      aria-hidden="true"
    />
  );
}

function PlatformCard({ platform }: { platform: Platform }) {
  return (
    <li
      className={`flex flex-col gap-5 rounded-2xl border bg-white p-6 shadow-sm ${
        platform.aTerminer
          ? "border-brand-orange/60"
          : platform.connected
            ? "border-emerald-200"
            : "border-zinc-200/70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl [&_svg]:h-7 [&_svg]:w-7"
          style={{ color: platform.color, backgroundColor: platform.tint }}
        >
          {platform.icon}
        </div>
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            platform.aTerminer
              ? "bg-brand-orange-soft text-brand-orange-dark"
              : platform.connected
                ? "bg-emerald-50 text-emerald-700"
                : "bg-zinc-100 text-zinc-500"
          }`}
        >
          {platform.aTerminer ? (
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 shrink-0 rounded-full bg-brand-orange"
            />
          ) : (
            <StatusDot connected={platform.connected} />
          )}
          {platform.aTerminer
            ? "À terminer"
            : platform.connected
              ? "Connecté"
              : "Non connecté"}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="font-serif text-2xl text-ink">{platform.name}</span>
        <span className="text-sm text-zinc-600">{platform.purpose}</span>
      </div>

      {/* Le compte réellement relié : c'est ce qui permet de voir qu'on a
          connecté la page d'un autre établissement. */}
      {platform.connected && (
        <span className="truncate rounded-lg bg-zinc-50 px-3 py-2 text-sm text-ink">
          {platform.detail ?? "Connecté"}
        </span>
      )}

      <ul className="flex flex-col gap-1.5 text-sm text-zinc-600">
        {platform.debloque.map((ligne) => (
          <li key={ligne} className="flex items-start gap-2">
            <span
              aria-hidden="true"
              className={`mt-0.5 font-bold ${
                platform.connected ? "text-emerald-600" : "text-zinc-300"
              }`}
            >
              ✓
            </span>
            {ligne}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-1">
        {platform.aTerminer ? (
          <Link
            href={platform.managePath}
            className="block w-full rounded-lg bg-brand-navy px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
          >
            Terminer le dossier
          </Link>
        ) : platform.connected ? (
          <Link
            href={platform.managePath}
            className="block w-full rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-center text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
          >
            Gérer
          </Link>
        ) : platform.connectButton ? (
          platform.connectButton
        ) : (
          <a
            href={platform.connectHref}
            className="block w-full rounded-lg bg-brand-navy px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
          >
            Connecter
          </a>
        )}
      </div>
    </li>
  );
}

export default async function ConnexionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ connected?: string; stripe_error?: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");
  const { connected, stripe_error: stripeError } = await searchParams;
  const supabase = await createClient();

  const [
    restaurantResult,
    googleResult,
    socialResult,
    tiktokResult,
    stripeResult,
  ] = await Promise.all([
    supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("google_business_connections")
      .select("google_email, location_title")
      .eq("restaurant_id", id)
      .maybeSingle(),
    supabase
      .from("social_connections")
      .select("facebook_page_name, instagram_username")
      .eq("restaurant_id", id)
      .maybeSingle(),
    supabase
      .from("tiktok_connections")
      .select("display_name, tiktok_username")
      .eq("restaurant_id", id)
      .maybeSingle(),
    supabase
      .from("restaurant_stripe_connexions")
      .select("nom_affiche, stripe_account_id, paiements_actifs")
      .eq("restaurant_id", id)
      .maybeSingle(),
  ]);

  const restaurant = restaurantResult.data as Restaurant | null;
  if (!restaurant) {
    notFound();
  }

  const google = googleResult.data as {
    google_email: string;
    location_title: string | null;
  } | null;
  const social = socialResult.data as {
    facebook_page_name: string | null;
    instagram_username: string | null;
  } | null;
  const tiktok = tiktokResult.data as {
    display_name: string | null;
    tiktok_username: string | null;
  } | null;
  const stripe = stripeResult.data as {
    nom_affiche: string | null;
    stripe_account_id: string;
    paiements_actifs: boolean;
  } | null;

  // TikTok n'apparaît que le jour où l'application est validée chez eux :
  // proposer un bouton qui mène à une erreur coûte plus de confiance que
  // l'absence du bouton n'en fait perdre.
  const platforms: Platform[] = [
    {
      key: "google",
      name: "Google",
      purpose: "Ta fiche établissement, tes avis, tes horaires.",
      debloque: [
        "Ta note et tes avis",
        "Ta fiche et tes horaires",
        "Tes statistiques : apparitions, appels, itinéraires",
        "Tes recherches Google (Search Console)",
      ],
      icon: platformIcons.google,
      color: "#1a73e8",
      tint: "#e8f0fe",
      connected: Boolean(google),
      detail: google?.location_title ?? google?.google_email ?? null,
      managePath: `/dashboard/${id}/google`,
      connectHref: `/api/google/authorize?restaurant_id=${id}`,
    },
    {
      key: "facebook",
      name: "Facebook",
      purpose: "Ta page, tes publications, tes abonnés.",
      debloque: ["Ta page et ses publications", "Tes abonnés"],
      icon: platformIcons.facebook,
      color: "#1877f2",
      tint: "#e7f0fe",
      connected: Boolean(social),
      detail: social?.facebook_page_name ?? null,
      managePath: `/dashboard/${id}/social`,
      connectButton: (
        <FacebookConnectButton
          restaurantId={id}
          returnTo="connexions"
          label="Connecter"
        />
      ),
    },
    {
      key: "instagram",
      name: "Instagram",
      // Instagram n'a pas de connexion propre : Meta le rattache au compte
      // professionnel lié à la page Facebook.
      purpose: "Se connecte en même temps que ta page Facebook.",
      debloque: ["Ton flux sur ton site vitrine", "Tes publications"],
      icon: platformIcons.instagram,
      color: "#c13584",
      tint: "#fce8f3",
      connected: Boolean(social?.instagram_username),
      detail: social?.instagram_username
        ? `@${social.instagram_username}`
        : null,
      managePath: `/dashboard/${id}/social`,
      connectButton: (
        <FacebookConnectButton
          restaurantId={id}
          returnTo="connexions"
          label="Connecter via Facebook"
        />
      ),
    },
    {
      key: "stripe",
      name: "Stripe",
      purpose: "Acomptes, cautions et expériences payées d'avance.",
      debloque: [
        "Acomptes sur les privatisations",
        "Empreintes de carte",
        "Expériences payées d'avance",
      ],
      icon: platformIcons.stripe,
      color: "#635bff",
      tint: "#eeedff",
      connected: Boolean(stripe),
      aTerminer: Boolean(stripe) && !stripe?.paiements_actifs,
      // Un compte relié mais au dossier incomplet n'encaisse rien : mieux
      // vaut le dire ici que de le laisser découvrir à la première demande
      // d'acompte.
      detail: stripe
        ? `${stripe.nom_affiche ?? stripe.stripe_account_id}${
            stripe.paiements_actifs ? "" : " — dossier à terminer"
          }`
        : null,
      managePath: `/dashboard/${id}/paiements`,
      connectHref: `/dashboard/${id}/paiements`,
    },
  ];

  if (tiktokDisponible()) {
    platforms.splice(2, 0, {
      key: "tiktok",
      name: "TikTok",
      purpose: "Ton compte, tes vidéos, tes vues.",
      debloque: ["Tes vidéos et tes vues"],
      icon: platformIcons.tiktok,
      color: "#111827",
      tint: "#f1f2f4",
      connected: Boolean(tiktok),
      detail: tiktok?.tiktok_username
        ? `@${tiktok.tiktok_username}`
        : (tiktok?.display_name ?? null),
      managePath: `/dashboard/${id}/tiktok`,
      connectHref: `/api/tiktok/authorize?restaurant_id=${id}`,
    });
  }

  const connectedCount = platforms.filter((p) => p.connected).length;
  const restants = platforms.filter((p) => !p.connected);

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-3">
        <PageHeader
          icon={dashboardIcons.connexions}
          title={`Connexions — ${restaurant.nom}`}
        />
        <p className="max-w-4xl text-sm text-zinc-600">
          Relie tes comptes à Klarr pour qu&apos;il puisse lire tes avis, tes
          publications et tes statistiques, et encaisser tes acomptes. Tu restes
          propriétaire de tes comptes : la connexion se retire quand tu veux,
          depuis « Gérer ».
        </p>
      </div>

      {connected && (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          Compte connecté avec succès.
        </p>
      )}

      {stripeError && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          La connexion Stripe n&apos;a pas abouti.{" "}
          <Link
            href={`/dashboard/${id}/paiements`}
            className="font-medium underline"
          >
            Voir le détail et réessayer
          </Link>
          .
        </p>
      )}

      {/* L'avancement, puis ce qui reste : c'est la seule question qu'on
          se pose en ouvrant cet écran. Les paiements ont leur propre case,
          parce qu'un dossier Stripe à moitié rempli n'encaisse rien. */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Compteur
          valeur={`${connectedCount}/${platforms.length}`}
          libelle={`compte${connectedCount > 1 ? "s" : ""} relié${connectedCount > 1 ? "s" : ""}`}
        />
        <a href="#comptes" className="block [&>div]:h-full">
          <Compteur
            valeur={restants.length}
            libelle={
              restants.length === 0
                ? "tout est relié"
                : `à relier : ${restants.map((p) => p.name).join(", ")}`
            }
            accent={restants.length > 0}
          />
        </a>
        <Compteur
          valeur={
            !stripe ? "—" : stripe.paiements_actifs ? "Actifs" : "À finir"
          }
          libelle={
            !stripe
              ? "paiements en ligne"
              : stripe.paiements_actifs
                ? "paiements en ligne"
                : "dossier Stripe à terminer"
          }
          accent={Boolean(stripe) && !stripe?.paiements_actifs}
        />
      </div>

      <section id="comptes" className="flex scroll-mt-8 flex-col gap-4">
        <TitreSection
          aside={`${connectedCount} relié${connectedCount > 1 ? "s" : ""} sur ${platforms.length}`}
        >
          Tes comptes
        </TitreSection>
        <ul
          className={`grid gap-4 sm:grid-cols-2 ${
            platforms.length > 4
              ? "xl:grid-cols-3 2xl:grid-cols-5"
              : "xl:grid-cols-4"
          }`}
        >
          {platforms.map((platform) => (
            <PlatformCard key={platform.key} platform={platform} />
          ))}
        </ul>
      </section>
    </div>
  );
}
