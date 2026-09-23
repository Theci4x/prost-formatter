import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { Compteur } from "@/components/dashboard/Compteur";
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

  const enAttente = membres.filter((m) => !m.user_id).length;
  const gerants = membres.filter((m) => m.role === "gerant").length;
  const service = membres.filter((m) => m.role === "service").length;

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.connexions}
        title={`Équipe — ${restaurant.nom}`}
      />

      <p className="max-w-4xl text-sm text-zinc-500">
        Chacun se connecte avec son propre compte. Un serveur voit les
        réservations et l&apos;écran de salle ; il ne voit ni ta fiche Google,
        ni tes réseaux, ni ton abonnement.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Compteur
          valeur={membres.length + 1}
          libelle={`personne${membres.length + 1 > 1 ? "s" : ""} dans l'équipe`}
        />
        <Compteur
          valeur={gerants}
          libelle={`gérant${gerants > 1 ? "s" : ""}`}
        />
        <Compteur valeur={service} libelle="en service" />
        <Compteur
          valeur={enAttente}
          libelle={`compte${enAttente > 1 ? "s" : ""} pas encore créé${enAttente > 1 ? "s" : ""}`}
          accent={enAttente > 0}
        />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-2xl text-ink">Ton équipe</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            <li className="flex flex-col gap-3 rounded-2xl border border-brand-orange/40 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <Initiale texte="Toi" accent />
                  <span className="font-semibold text-ink">Toi</span>
                </span>
                <PastilleRole role={role ?? "service"} />
              </div>
              <span className="text-sm text-zinc-500">
                {DESCRIPTIONS_ROLE[role ?? "service"]}
              </span>
            </li>

            {membres.map((membre) => (
              <li
                key={membre.id}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-3">
                    <Initiale texte={membre.email} />
                    <span className="truncate font-semibold text-ink">
                      {membre.email}
                    </span>
                  </span>
                  <PastilleRole role={membre.role} />
                </div>
                <span className="text-sm text-zinc-500">
                  {DESCRIPTIONS_ROLE[membre.role]}
                </span>
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-zinc-100 pt-3">
                  {/* Sans cette nuance, le propriétaire croit l'accès en
                      panne alors que le compte n'existe simplement pas
                      encore. */}
                  {membre.user_id ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                      />
                      Compte actif
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-amber-800">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-amber-500"
                      />
                      Doit créer son compte avec cette adresse
                    </span>
                  )}
                  {patron && (
                    <form action={retirerMembre}>
                      <input type="hidden" name="membre_id" value={membre.id} />
                      <input type="hidden" name="restaurant_id" value={id} />
                      <button
                        type="submit"
                        className="rounded-lg px-2 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        Retirer
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <h2 className="font-serif text-2xl text-ink">
              Ajouter quelqu&apos;un
            </h2>
            {patron ? (
              <MembreForm restaurantId={id} />
            ) : (
              <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-8 text-sm text-zinc-500">
                Seul le propriétaire de l&apos;établissement peut ajouter ou
                retirer quelqu&apos;un.
              </p>
            )}
          </section>

          {/* Qui voit quoi, d'un coup d'œil : la question qu'on se pose
              avant de donner un accès. */}
          <section className="flex flex-col gap-3">
            <h2 className="font-serif text-2xl text-ink">Qui voit quoi</h2>
            <div className="overflow-x-auto rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50/80 text-left text-[10px] font-semibold uppercase tracking-[0.06em] text-zinc-500 sm:text-[11px] sm:tracking-[0.08em]">
                    <th className="px-4 py-3 font-semibold sm:px-5">Accès</th>
                    <th className="px-1.5 py-3 text-center font-semibold sm:px-3">
                      {LIBELLES_ROLE.proprietaire}
                    </th>
                    <th className="px-1.5 py-3 text-center font-semibold sm:px-3">
                      {LIBELLES_ROLE.gerant}
                    </th>
                    <th className="px-1.5 py-3 text-center font-semibold sm:px-3">
                      {LIBELLES_ROLE.service}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ACCES.map((ligne) => (
                    <tr key={ligne.quoi} className="border-t border-zinc-100">
                      <td className="px-4 py-3 text-ink sm:px-5">
                        {ligne.quoi}
                      </td>
                      {ligne.qui.map((oui, i) => (
                        <td key={i} className="px-1.5 py-3 text-center sm:px-3">
                          {oui ? (
                            <span className="font-bold text-emerald-600">
                              ✓
                            </span>
                          ) : (
                            <span className="text-zinc-300">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      <Link
        href="/dashboard"
        className="text-sm text-zinc-500 hover:text-zinc-900"
      >
        ← Mes restaurants
      </Link>
    </div>
  );
}

/** Propriétaire, gérant, service — dans cet ordre, comme la table. */
const ACCES: { quoi: string; qui: [boolean, boolean, boolean] }[] = [
  { quoi: "Réservations et écran de salle", qui: [true, true, true] },
  { quoi: "Carte, photos, site, avis, visibilité", qui: [true, true, false] },
  { quoi: "Fichier client et campagnes", qui: [true, true, false] },
  { quoi: "Abonnement, Stripe et équipe", qui: [true, false, false] },
];

function PastilleRole({ role }: { role: Role }) {
  const ton =
    role === "proprietaire"
      ? "bg-brand-navy text-white"
      : role === "gerant"
        ? "bg-brand-orange-soft text-brand-orange-dark"
        : "bg-zinc-100 text-zinc-600";
  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${ton}`}
    >
      {LIBELLES_ROLE[role]}
    </span>
  );
}

function Initiale({
  texte,
  accent = false,
}: {
  texte: string;
  accent?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-lg ${
        accent
          ? "bg-brand-navy text-white"
          : "bg-brand-orange-soft text-brand-orange-dark"
      }`}
    >
      {texte.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
