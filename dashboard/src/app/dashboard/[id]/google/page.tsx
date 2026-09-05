import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { disconnectGoogle } from "./actions";
import type { Restaurant } from "@/types/restaurant";
import type { GoogleBusinessConnection } from "@/types/google";

export default async function GoogleConnectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const { id } = await params;
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
    .select("id, restaurant_id, google_email, token_expires_at, created_at, updated_at")
    .eq("restaurant_id", id)
    .maybeSingle();

  const connection = connectionData as GoogleBusinessConnection | null;

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <Link
        href="/dashboard"
        className="text-sm text-zinc-500 hover:text-zinc-900"
      >
        ← Retour
      </Link>
      <h1 className="text-lg font-semibold text-zinc-900">
        Google Business Profile — {restaurant.nom}
      </h1>

      {connected && (
        <p className="max-w-md rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Compte Google connecté avec succès.
        </p>
      )}
      {error && (
        <p className="max-w-md rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          La connexion à Google a échoué. Réessaie.
        </p>
      )}

      {connection ? (
        <div className="flex max-w-sm flex-col gap-4 rounded-md border border-zinc-200 p-4">
          <p className="text-sm text-zinc-700">
            Connecté en tant que{" "}
            <span className="font-medium">{connection.google_email}</span>
          </p>
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
      ) : (
        <div className="flex max-w-sm flex-col gap-4 rounded-md border border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">
            Aucun compte Google connecté pour ce restaurant.
          </p>
          <a
            href={`/api/google/authorize?restaurant_id=${id}`}
            className="rounded-md bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Connecter mon compte Google Business Profile
          </a>
        </div>
      )}
    </div>
  );
}
