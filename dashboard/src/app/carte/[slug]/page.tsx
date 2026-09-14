import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { carteOrganisee, carteVisible, formatPrix } from "@/lib/menu/carte";
import { langueDisponible, lireLangue, platAffiche } from "@/lib/menu/traduction";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";
import type { MenuItem } from "@/types/menu";
import { DonneesStructurees } from "@/components/seo/DonneesStructurees";
import { filAriane, menuSchema } from "@/lib/seo/donnees-structurees";
import { siteUrl } from "@/lib/site-url";

type Params = { slug: string };
type Query = { lang?: string };

async function chargerCarte(slug: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("restaurants")
    .select("id, nom, adresse, logo_url, carte_publique, slug_reservation")
    .eq("slug_reservation", slug)
    .maybeSingle();

  const restaurant = data as {
    id: string;
    nom: string;
    adresse: string | null;
    logo_url: string | null;
    carte_publique: boolean;
    slug_reservation: string;
  } | null;

  // Cette page est servie avec la clé de service, qui passe outre les règles
  // d'accès : c'est donc ici que se vérifie le droit de publier.
  if (!restaurant?.carte_publique) return null;

  const { data: plats } = await supabase
    .from("restaurant_menu_items")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .eq("actif", true);

  return { restaurant, items: (plats ?? []) as MenuItem[] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const charge = await chargerCarte(slug);
  if (!charge) return { title: "Carte" };

  // Une description qui nomme quelques plats répond mieux à « carte du
  // restaurant X » qu'une phrase générique.
  const apercu = charge.items
    .filter((plat) => plat.actif)
    .slice(0, 4)
    .map((plat) => plat.nom)
    .join(", ");

  return {
    alternates: { canonical: `/carte/${slug}` },
    title: `La carte — ${charge.restaurant.nom}`,
    description: apercu
      ? `La carte de ${charge.restaurant.nom} : ${apercu}…`
      : `La carte de ${charge.restaurant.nom}.`,
    // Une carte change ; on ne veut pas qu'un moteur serve la version de
    // l'an dernier, mais on veut bien qu'elle soit trouvable.
    robots: { index: true, follow: true },
  };
}

export default async function CartePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Query>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const charge = await chargerCarte(slug);
  if (!charge) notFound();

  const { restaurant, items } = charge;
  const anglaisPossible = langueDisponible(items, "en");
  const langue = anglaisPossible ? lireLangue(query.lang) : "fr";
  const blocs = carteOrganisee(carteVisible(items));
  const anglais = langue === "en";

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <header className="border-b border-zinc-200/70 bg-white px-5 py-4">
        <div className="mx-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {restaurant.logo_url ? (
              <Image
                src={restaurant.logo_url}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : null}
            <span className="text-base font-semibold text-zinc-900">
              {restaurant.nom}
            </span>
          </div>

          {/* De simples liens : la page doit fonctionner sans JavaScript,
              sur le téléphone d'un client au réseau incertain. */}
          {anglaisPossible && (
            <nav aria-label="Langue" className="flex items-center gap-1">
              <Link
                href={`/carte/${slug}`}
                aria-current={anglais ? undefined : "true"}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  anglais
                    ? "text-zinc-500 hover:text-zinc-900"
                    : "bg-brand-navy text-white"
                }`}
              >
                Français
              </Link>
              <Link
                href={`/carte/${slug}?lang=en`}
                aria-current={anglais ? "true" : undefined}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  anglais
                    ? "bg-brand-navy text-white"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                English
              </Link>
            </nav>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 py-8">
        {/* La carte en schema.org : sections, plats, prix. C'est ce qui
            permet à Google de répondre « la carte du restaurant X » avec le
            contenu, et pas seulement avec un lien. */}
        <DonneesStructurees
          donnees={menuSchema({
            nom: restaurant.nom,
            url: `${siteUrl()}/carte/${slug}`,
            carte: items,
          })}
        />
        <DonneesStructurees
          donnees={filAriane([
            {
              nom: restaurant.nom,
              url: `${siteUrl()}/reserver/${restaurant.slug_reservation}`,
            },
            { nom: "La carte", url: `${siteUrl()}/carte/${slug}` },
          ])}
        />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-zinc-900">
            {anglais ? "Menu" : "La carte"}
          </h1>
          {restaurant.adresse && (
            <p className="text-sm text-zinc-500">{restaurant.adresse}</p>
          )}
        </div>

        {blocs.length === 0 ? (
          <p className="rounded-2xl border border-zinc-200/70 bg-white p-5 text-sm text-zinc-500 shadow-sm">
            {anglais
              ? "The menu is being updated."
              : "La carte est en cours de mise à jour."}
          </p>
        ) : (
          blocs.map((bloc) => {
            // Le titre du bloc suit la langue du premier plat traduit ; si
            // aucun ne l'est, il reste en français, comme les plats.
            const titre =
              platAffiche(bloc.plats[0], langue).categorie ?? bloc.categorie;
            return (
              <section key={bloc.categorie} className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-navy">
                  {titre}
                </h2>
                <ul className="flex flex-col gap-4">
                  {bloc.plats.map((plat) => {
                    const affiche = platAffiche(plat, langue);
                    return (
                      <li
                        key={plat.id}
                        className="flex items-start gap-4 rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm"
                      >
                        {plat.photo_url && (
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:h-24 sm:w-24">
                            <Image
                              src={plat.photo_url}
                              alt={affiche.nom}
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <span className="flex min-w-0 flex-1 flex-col gap-1">
                          <span className="flex items-baseline justify-between gap-3">
                            <span className="text-sm font-medium text-zinc-900">
                              {affiche.nom}
                            </span>
                            {plat.prix_centimes !== null && (
                              <span className="shrink-0 text-sm font-medium tabular-nums text-zinc-700">
                                {formatPrix(plat.prix_centimes)}
                              </span>
                            )}
                          </span>
                          {affiche.description && (
                            <span className="text-sm text-zinc-500">
                              {affiche.description}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })
        )}

        <p className="text-xs text-zinc-400">
          {anglais
            ? "Menu given for information only: it may change with the season and daily deliveries."
            : "Carte donnée à titre indicatif : elle peut changer selon l'arrivage et la saison."}
        </p>

        <Link
          href={`/reserver/${restaurant.slug_reservation}`}
          className="w-fit rounded-md bg-brand-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
        >
          {anglais ? "Book a table" : "Réserver une table"}
        </Link>
      </main>

      <footer className="border-t border-zinc-200/70 px-5 py-6">
        <div className="mx-auto flex max-w-2xl items-center gap-2 text-sm text-zinc-400">
          <KlarrMark size={16} />
          <span>
            {anglais ? "Menu powered by " : "Carte propulsée par "}
            <KlarrWordmark className="text-zinc-500" />
          </span>
        </div>
      </footer>
    </div>
  );
}
