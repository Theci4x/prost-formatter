import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { FacebookConnectButton } from "@/components/connections/FacebookConnectButton";
import { platformIcons } from "@/components/connections/platformIcons";
import type { Restaurant } from "@/types/restaurant";

type Platform = {
  key: string;
  name: string;
  // Ce que la connexion débloque, en langage de restaurateur.
  purpose: string;
  icon: React.ReactNode;
  color: string;
  tint: string;
  connected: boolean;
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
    <li className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ color: platform.color, backgroundColor: platform.tint }}
        >
          {platform.icon}
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="font-medium text-zinc-900">{platform.name}</span>
          <span className="text-sm text-zinc-500">{platform.purpose}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <StatusDot connected={platform.connected} />
        {platform.connected ? (
          <span className="min-w-0 truncate text-zinc-700">
            {platform.detail ?? "Connecté"}
          </span>
        ) : (
          <span className="text-zinc-400">Non connecté</span>
        )}
      </div>

      <div className="mt-auto">
        {platform.connected ? (
          <Link
            href={platform.managePath}
            className="block w-full rounded-md border border-zinc-200 px-4 py-2 text-center text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
          >
            Gérer
          </Link>
        ) : platform.connectButton ? (
          platform.connectButton
        ) : (
          <a
            href={platform.connectHref}
            className="block w-full rounded-md bg-brand-navy px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
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

  const platforms: Platform[] = [
    {
      key: "google",
      name: "Google",
      purpose: "Ta fiche établissement, tes avis, tes horaires.",
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
      icon: platformIcons.instagram,
      color: "#c13584",
      tint: "#fce8f3",
      connected: Boolean(social?.instagram_username),
      detail: social?.instagram_username ? `@${social.instagram_username}` : null,
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
      key: "tiktok",
      name: "TikTok",
      purpose: "Ton compte, tes vidéos, tes vues.",
      icon: platformIcons.tiktok,
      color: "#111827",
      tint: "#f1f2f4",
      connected: Boolean(tiktok),
      detail: tiktok?.tiktok_username
        ? `@${tiktok.tiktok_username}`
        : (tiktok?.display_name ?? null),
      managePath: `/dashboard/${id}/tiktok`,
      connectHref: `/api/tiktok/authorize?restaurant_id=${id}`,
    },
    {
      key: "stripe",
      name: "Stripe",
      purpose: "Acomptes, cautions et expériences payées d'avance.",
      icon: platformIcons.stripe,
      color: "#635bff",
      tint: "#eeedff",
      connected: Boolean(stripe),
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

  const connectedCount = platforms.filter((p) => p.connected).length;

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.connexions}
        title={`Connexions — ${restaurant.nom}`}
      />

      {connected && (
        <p className="max-w-md rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Compte connecté avec succès.
        </p>
      )}

      {stripeError && (
        <p className="max-w-2xl rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
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

      <p className="max-w-2xl text-sm text-zinc-500">
        Relie tes comptes à Klarr pour qu&apos;il puisse lire tes avis, tes
        publications et tes statistiques. Tu restes propriétaire de tes
        comptes : la connexion se retire quand tu veux, depuis « Gérer ».
      </p>

      <p className="text-sm font-medium text-zinc-700">
        {connectedCount} compte{connectedCount > 1 ? "s" : ""} connecté
        {connectedCount > 1 ? "s" : ""} sur {platforms.length}
      </p>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {platforms.map((platform) => (
          <PlatformCard key={platform.key} platform={platform} />
        ))}
      </ul>
    </div>
  );
}
