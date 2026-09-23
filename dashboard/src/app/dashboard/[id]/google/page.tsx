import Link from "next/link";
import { publicationsGoogleOuvertes } from "@/lib/google/business";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken } from "@/lib/google/connection";
import { expliquerBusinessProfile } from "@/lib/google/erreurs";
import {
  listAccounts,
  listLocations,
  type GoogleLocation,
} from "@/lib/google/business";
import { disconnectGoogle, selectGoogleLocation } from "./actions";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import type { Restaurant } from "@/types/restaurant";
import type { GoogleBusinessConnection } from "@/types/google";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";

export default async function GoogleConnectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");
  await exigerModule(id, "visibilite");
  const { connected, error } = await searchParams;

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

  const { data: connectionData } = await supabase
    .from("google_business_connections")
    .select(
      "id, restaurant_id, google_email, location_name, location_title, access_token, refresh_token, token_expires_at, created_at, updated_at",
    )
    .eq("restaurant_id", id)
    .maybeSingle();

  const connection = connectionData as
    | (GoogleBusinessConnection & {
        access_token: string;
        refresh_token: string;
      })
    | null;

  const locations: (GoogleLocation & { accountName: string })[] = [];
  let locationsError: string | null = null;
  if (connection && !connection.location_name) {
    try {
      const accessToken = await getValidAccessToken(supabase, connection);
      const accounts = await listAccounts(accessToken);
      for (const account of accounts) {
        // Le compte voyage avec sa fiche : la liste en agrège plusieurs, et
        // publier demande le chemin complet, compte compris.
        for (const fiche of await listLocations(accessToken, account.name)) {
          locations.push({ ...fiche, accountName: account.name });
        }
      }
      if (locations.length === 0) {
        locationsError =
          "Aucune fiche établissement trouvée sur ce compte Google.";
      }
    } catch (err) {
      console.error("[google/page] fetch locations", err);
      // Le message disait « peut-être encore en cours d'activation ».
      // Deviner à voix haute fait attendre une chose qui n'arrivera
      // jamais seule : le quota de cette API reste à zéro tant que
      // Google n'a pas accordé le dossier d'accès.
      locationsError = expliquerBusinessProfile(err);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.google}
        title={`Google Business Profile — ${restaurant.nom}`}
        backHref={`/dashboard/${id}/connexions`}
      />

      {connected && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Compte Google connecté avec succès.
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          La connexion à Google a échoué. Réessaie.
        </p>
      )}

      {!connection ? (
        <div className="flex flex-col items-start gap-5 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-3 w-3 rounded-full bg-zinc-300"
            />
            <span className="font-serif text-3xl text-ink">
              Aucun compte relié
            </span>
          </div>
          <p className="text-sm leading-relaxed text-zinc-600">
            Relie le compte Google qui gère ta fiche établissement : Klarr y
            lira ta note, tes avis, tes horaires et les recherches qui
            t&apos;amènent des clients.
          </p>
          <a
            href={`/api/google/authorize?restaurant_id=${id}`}
            className="w-fit rounded-lg bg-brand-navy px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
          >
            Connecter mon compte Google Business Profile
          </a>
        </div>
      ) : connection.location_name ? (
        <div className="flex flex-col gap-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-3 w-3 rounded-full bg-emerald-500"
            />
            <span className="font-serif text-3xl text-ink">Fiche reliée</span>
          </div>
          <div className="flex flex-col gap-1 rounded-xl bg-white px-4 py-3">
            <span className="text-lg font-semibold text-ink">
              {connection.location_title}
            </span>
            <span className="text-sm text-zinc-500">
              via {connection.google_email}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link
              href={`/dashboard/${id}/avis`}
              className="rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
            >
              Voir mes avis
            </Link>
            {/* Tant que Google n'a pas ouvert l'accès, l'écran répond 404 :
                pas de lien vers une page absente. */}
            {publicationsGoogleOuvertes() && (
              <Link
                href={`/dashboard/${id}/posts`}
                className="text-sm font-semibold text-brand-orange-dark hover:underline"
              >
                Publications Google
              </Link>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-200/70 pt-4">
            <form action={selectGoogleLocation}>
              <input type="hidden" name="restaurant_id" value={id} />
              <input type="hidden" name="location_name" value="" />
              <input type="hidden" name="location_title" value="" />
              <button
                type="submit"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
              >
                Changer de fiche
              </button>
            </form>
            <form action={disconnectGoogle}>
              <input type="hidden" name="restaurant_id" value={id} />
              <button
                type="submit"
                className="text-sm font-medium text-red-600 hover:text-red-800"
              >
                Déconnecter ce compte
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5 rounded-2xl border border-brand-orange/50 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="font-serif text-3xl text-ink">
              Quelle fiche est la tienne ?
            </span>
            <span className="text-sm text-zinc-500">
              Connecté en tant que{" "}
              <span className="font-medium text-ink">
                {connection.google_email}
              </span>
              . Choisis la fiche établissement de ce restaurant :
            </span>
          </div>

          {locationsError && (
            <p className="text-sm text-red-600">{locationsError}</p>
          )}

          {locations.length > 0 && (
            <ul className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {locations.map((location) => (
                <li key={location.name}>
                  <form action={selectGoogleLocation}>
                    <input type="hidden" name="restaurant_id" value={id} />
                    <input
                      type="hidden"
                      name="location_name"
                      value={location.name}
                    />
                    <input
                      type="hidden"
                      name="location_title"
                      value={location.title}
                    />
                    <input
                      type="hidden"
                      name="account_name"
                      value={location.accountName}
                    />
                    <button
                      type="submit"
                      className="flex h-full w-full flex-col items-start gap-1 rounded-xl border border-zinc-200 px-4 py-3 text-left transition-colors hover:border-brand-orange hover:bg-brand-orange-soft"
                    >
                      <span className="text-[15px] font-semibold text-ink">
                        {location.title}
                      </span>
                      {location.address && (
                        <span className="text-xs text-zinc-500">
                          {location.address}
                        </span>
                      )}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          <form action={disconnectGoogle}>
            <input type="hidden" name="restaurant_id" value={id} />
            <button
              type="submit"
              className="text-sm font-medium text-red-600 hover:text-red-800"
            >
              Déconnecter ce compte
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
