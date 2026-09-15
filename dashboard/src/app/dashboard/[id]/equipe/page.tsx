import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { MembreForm } from "@/components/equipe/MembreForm";
import {
  DESCRIPTIONS_ROLE,
  LIBELLES_ROLE,
  estProprietaire,
  roleSur,
  type Role,
} from "@/lib/equipe/roles";
import { retirerMembre } from "./actions";
import type { Restaurant } from "@/types/restaurant";

type Membre = {
  id: string;
  email: string;
  role: Role;
  user_id: string | null;
  created_at: string;
};

export default async function EquipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [restaurantResult, membresResult, role] = await Promise.all([
    supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("restaurant_membres")
      .select("id, email, role, user_id, created_at")
      .eq("restaurant_id", id)
      .order("created_at"),
    roleSur(id),
  ]);

  const restaurant = restaurantResult.data as Restaurant | null;
  if (!restaurant) notFound();

  const membres = (membresResult.data ?? []) as Membre[];
  const patron = estProprietaire(role);

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.connexions}
        title={`Équipe — ${restaurant.nom}`}
      />

      <p className="max-w-2xl text-sm text-zinc-500">
        Chacun se connecte avec son propre compte. Un serveur voit les
        réservations et l&apos;écran de salle ; il ne voit ni ta fiche Google,
        ni tes réseaux, ni ton abonnement.
      </p>

      <ul className="flex max-w-2xl flex-col gap-3">
        <li className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm">
          <span className="flex flex-col">
            <span className="font-medium text-zinc-900">Toi</span>
            <span className="text-sm text-zinc-500">
              {DESCRIPTIONS_ROLE[role ?? "service"]}
            </span>
          </span>
          <span className="rounded-full bg-brand-orange-soft px-3 py-1 text-xs font-medium text-brand-navy">
            {LIBELLES_ROLE[role ?? "service"]}
          </span>
        </li>

        {membres.map((membre) => (
          <li
            key={membre.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm"
          >
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-medium text-zinc-900">
                {membre.email}
              </span>
              <span className="text-sm text-zinc-500">
                {DESCRIPTIONS_ROLE[membre.role]}
                {/* Sans cette nuance, le propriétaire croit l'accès en panne
                    alors que le compte n'existe simplement pas encore. */}
                {!membre.user_id && " · compte pas encore créé"}
              </span>
            </span>
            <span className="flex items-center gap-4">
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                {LIBELLES_ROLE[membre.role]}
              </span>
              {patron && (
                <form action={retirerMembre}>
                  <input type="hidden" name="membre_id" value={membre.id} />
                  <input type="hidden" name="restaurant_id" value={id} />
                  <button
                    type="submit"
                    className="text-sm font-medium text-zinc-500 hover:text-red-600"
                  >
                    Retirer
                  </button>
                </form>
              )}
            </span>
          </li>
        ))}
      </ul>

      {patron ? (
        <div className="max-w-2xl">
          <MembreForm restaurantId={id} />
        </div>
      ) : (
        <p className="max-w-2xl text-sm text-zinc-500">
          Seul le propriétaire de l&apos;établissement peut ajouter ou retirer
          quelqu&apos;un.
        </p>
      )}

      <Link
        href="/dashboard"
        className="text-sm text-zinc-500 hover:text-zinc-900"
      >
        ← Mes restaurants
      </Link>
    </div>
  );
}
