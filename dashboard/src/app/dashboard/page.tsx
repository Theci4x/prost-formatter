import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteRestaurantButton } from "@/components/restaurants/DeleteRestaurantButton";
import { dashboardIcons } from "@/components/dashboard/PageHeader";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { fetchAlerts } from "@/lib/reputation/alerts";
import { peutGerer, roleSur, type Role } from "@/lib/equipe/roles";
import type { Restaurant } from "@/types/restaurant";
import { chargerAcces } from "@/lib/abonnement/acces";
import {
  ACCES_COMPLET,
  LIBELLE_MODULE,
  moduleDeLaSection,
  PRIX_MODULE,
} from "@/lib/abonnement/modules";

// Ce que chaque rôle peut ouvrir. La base refuse déjà le reste ; ceci évite
// de proposer une porte fermée, qu'un serveur prendrait pour une panne.
/**
 * Les pages d'un établissement.
 *
 * Chacune porte une phrase : douze pastilles nues se ressemblent toutes, et
 * un restaurateur qui cherche « son site » ne devine pas qu'il s'appelle
 * « Vitrine ». La phrase dit ce qu'on y fait, pas ce que ça contient.
 */
const FEATURE_LINKS: {
  href: string;
  label: string;
  resume: string;
  icon: React.ReactNode;
  minimum?: "gerant" | "proprietaire";
}[] = [
  {
    href: "vitrine",
    label: "Site vitrine",
    resume: "Le site de ton restaurant, fait de ce que tu as déjà rempli.",
    icon: dashboardIcons.edit,
    minimum: "gerant",
  },
  {
    href: "reservations",
    label: "Réservations",
    resume: "Le carnet, tes salles, tes services et ton plan de salle.",
    icon: dashboardIcons.reservations,
  },
  // Raccourci assumé : en plein service, personne n'a le temps de passer par
  // le carnet pour arriver à l'écran de salle.
  {
    href: "service",
    label: "Service",
    resume: "L'écran de salle, pour le coup de feu.",
    icon: dashboardIcons.service,
  },
  {
    href: "menu",
    label: "Carte",
    resume: "Tes plats, leurs prix, leurs photos, et le QR code à poser.",
    icon: dashboardIcons.menu,
    minimum: "gerant",
  },
  {
    href: "photos",
    label: "Photos",
    resume: "Ce que voit un client avant de choisir de venir.",
    icon: dashboardIcons.photos,
    minimum: "gerant",
  },
  {
    href: "avis",
    label: "Avis",
    resume: "Tes avis Google, et des réponses prêtes à relire.",
    icon: dashboardIcons.avis,
    minimum: "gerant",
  },
  {
    href: "retours",
    label: "Retours clients",
    resume: "Ce qu'on préfère te dire en privé. Totem ou QR code.",
    icon: dashboardIcons.avis,
    minimum: "gerant",
  },
  {
    href: "seo",
    label: "Référencement",
    resume: "Ce que Google sait de toi, et ce qui lui manque.",
    icon: dashboardIcons.seo,
    minimum: "gerant",
  },
  {
    href: "posts",
    label: "Publications Google",
    resume: "Écris tes posts à l'avance, Klarr les publie.",
    icon: dashboardIcons.google,
    minimum: "gerant",
  },
  {
    href: "faq",
    label: "Questions fréquentes",
    resume: "Ce qu'on te demande au téléphone, répondu une fois pour toutes.",
    icon: dashboardIcons.visibiliteIa,
    minimum: "gerant",
  },
  {
    href: "visibilite-ia",
    label: "Visibilité IA",
    resume: "Es-tu cité quand on demande à une IA où dîner ?",
    icon: dashboardIcons.visibiliteIa,
    minimum: "gerant",
  },
  {
    href: "experiences",
    label: "Expériences",
    resume: "Ateliers, dégustations, soirées à places comptées.",
    icon: dashboardIcons.menu,
    minimum: "gerant",
  },
  // Google, Facebook, Instagram et TikTok sont regroupés derrière une seule
  // entrée : le restaurateur relie ses comptes une fois, au même endroit.
  {
    href: "connexions",
    label: "Connexions",
    resume: "Relier Google, Facebook, Instagram et TikTok.",
    icon: dashboardIcons.connexions,
    minimum: "gerant",
  },
  {
    href: "paiements",
    label: "Paiements",
    resume: "Acomptes, cautions, et ton compte Stripe.",
    icon: dashboardIcons.abonnement,
    minimum: "gerant",
  },
  {
    href: "equipe",
    label: "Équipe",
    resume: "Qui accède à quoi, et qui décide.",
    icon: dashboardIcons.connexions,
    minimum: "proprietaire",
  },
  {
    href: "abonnement",
    label: "Abonnement",
    resume: "Ta formule, tes factures.",
    icon: dashboardIcons.abonnement,
    minimum: "proprietaire",
  },
];

function accessible(
  minimum: "gerant" | "proprietaire" | undefined,
  role: Role | null,
): boolean {
  if (!minimum) return true;
  if (minimum === "proprietaire") return role === "proprietaire";
  return peutGerer(role);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("restaurants")
    .select("*")
    .order("created_at", { ascending: false });

  const restaurants = (data ?? []) as Restaurant[];

  const { alerts, surveillanceActive } = await fetchAlerts(supabase);
  const restaurantNames = new Map(restaurants.map((r) => [r.id, r.nom]));

  // Le rôle peut différer d'un établissement à l'autre : propriétaire du
  // sien, serveur chez un confrère.
  const roles = new Map(
    await Promise.all(
      restaurants.map(
        async (restaurant) =>
          [restaurant.id, await roleSur(restaurant.id)] as const,
      ),
    ),
  );

  // Ce que chaque établissement a payé. Un abonnement ne couvre jamais
  // deux maisons : chacune a son carnet, sa fiche Google et sa clientèle.
  const acces = new Map(
    await Promise.all(
      restaurants.map(
        async (restaurant) =>
          [restaurant.id, await chargerAcces(restaurant.id, supabase)] as const,
      ),
    ),
  );

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Mes restaurants
          </h1>
          <p className="text-sm text-zinc-500">
            Gère la présence en ligne de tes établissements.
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-navy-hover hover:shadow"
        >
          Ajouter un restaurant
        </Link>
      </div>

      {restaurants.length > 0 && (
        <AlertsPanel
          alerts={alerts}
          restaurantNames={restaurantNames}
          surveillanceActive={surveillanceActive}
        />
      )}

      {restaurants.length === 0 ? (
        <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange-soft to-white text-brand-navy shadow-sm">
            {dashboardIcons.menu}
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-zinc-900">
              Aucun restaurant pour le moment.
            </p>
            <p className="text-sm text-zinc-500">
              Ajoute ton premier restaurant pour commencer à gérer sa présence
              en ligne.
            </p>
          </div>
          <Link
            href="/dashboard/new"
            className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-navy-hover hover:shadow"
          >
            Ajouter un restaurant
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {restaurants.map((restaurant) => (
            <li
              key={restaurant.id}
              className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-semibold text-white">
                    {restaurant.nom.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {restaurant.nom}
                    </p>
                    {restaurant.adresse && (
                      <p className="text-sm text-zinc-500">
                        {restaurant.adresse}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {peutGerer(roles.get(restaurant.id) ?? null) && (
                    <Link
                      href={`/dashboard/${restaurant.id}/edit`}
                      className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
                    >
                      Modifier
                    </Link>
                  )}
                  {roles.get(restaurant.id) === "proprietaire" && (
                    <DeleteRestaurantButton id={restaurant.id} />
                  )}
                </div>
              </div>
              {/* Des cases plutôt qu'une rangée de pastilles : à douze
                  entrées, elles se ressemblent toutes et l'œil n'en
                  distingue aucune. Une phrase par case, et on trouve. */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {FEATURE_LINKS.filter((feature) =>
                  accessible(feature.minimum, roles.get(restaurant.id) ?? null),
                ).map((feature) => {
                  const requis = moduleDeLaSection(feature.href);
                  const ferme = requis
                    ? !(acces.get(restaurant.id) ?? ACCES_COMPLET).ouvert[
                        requis
                      ]
                    : false;

                  // Fermée, la case n'est plus un lien : elle se voit,
                  // elle dit pourquoi, et elle ne mène nulle part. Un
                  // lien grisé qu'on peut quand même suivre est pire
                  // qu'un lien barré — on clique, et on tombe.
                  if (ferme) {
                    return (
                      <div
                        key={feature.href}
                        aria-disabled="true"
                        title={`Inclus dans ${LIBELLE_MODULE[requis!]} — ${PRIX_MODULE[requis!]}`}
                        className="flex cursor-not-allowed items-start gap-3 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-200 text-zinc-400">
                          {feature.icon}
                        </span>
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="text-sm font-medium text-zinc-400">
                            {feature.label}
                          </span>
                          <span className="text-xs text-zinc-400">
                            {LIBELLE_MODULE[requis!]} — {PRIX_MODULE[requis!]}
                          </span>
                        </span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={feature.href}
                      href={`/dashboard/${restaurant.id}/${feature.href}`}
                      className="group flex items-start gap-3 rounded-xl border border-zinc-200/70 bg-white p-4 transition-colors hover:border-brand-navy"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-orange-soft text-brand-navy transition-colors group-hover:bg-brand-navy group-hover:text-white">
                        {feature.icon}
                      </span>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-sm font-medium text-zinc-900">
                          {feature.label}
                        </span>
                        <span className="text-xs leading-relaxed text-zinc-500">
                          {feature.resume}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
