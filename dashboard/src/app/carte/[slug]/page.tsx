import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { carteOrganisee, carteVisible, formatPrix } from "@/lib/menu/carte";
import { langueDisponible, lireLangue, platAffiche } from "@/lib/menu/traduction";
import { SignatureKlarr } from "@/components/brand/SignatureKlarr";
import { cartePubliee } from "@/lib/menu/publication";
import { listeAllergenes } from "@/types/allergenes";
import {
  MENTION_ALLERGENES,
  MENTION_ALLERGENES_ABSENTS,
  MENTION_PRIX,
} from "@/lib/menu/mentions";
import { chargerAcces } from "@/lib/abonnement/acces";
import { DonneesStructurees } from "@/components/seo/DonneesStructurees";
import { filAriane, menuSchema } from "@/lib/seo/donnees-structurees";
import { siteUrl } from "@/lib/site-url";

type Params = { slug: string };
type Query = { lang?: string };

async function chargerCarte(slug: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("restaurants")
    .select("id, nom, adresse, logo_url, slug_reservation")
    .eq("slug_reservation", slug)
    .maybeSingle();

  const restaurant = data as {
    id: string;
    nom: string;
    adresse: string | null;
    logo_url: string | null;
    slug_reservation: string;
  } | null;

  if (!restaurant) return null;

  // Cette page est servie avec la clé de service, qui passe outre les règles
  // d'accès : c'est donc ici que se vérifie le droit de publier. Une carte
  // illisible vaut carte non publiée — la page n'existe alors pas, ce qui
  // est le bon comportement pour celle-ci.
  const carte = await cartePubliee(supabase, restaurant.id);
  if (!carte.publiee) return null;

  // Et le module, car la carte se saisit désormais avec le carnet seul.
  // Publier sert alors la page de réservation ; cette page-ci est un
  // produit de visibilité — référencée, autonome, faite pour être trouvée
  // sur « la carte de X ». Le plan du site applique la même règle, sans
  // quoi il annoncerait des adresses qui répondent 404.
  const acces = await chargerAcces(restaurant.id, supabase);
  if (!acces.ouvert.visibilite) return null;

  return { restaurant, items: carte.items };
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
  // Un seul plat déclaré suffit à ouvrir le tableau : il vaut mieux un
  // document partiel, qui dit ce qu'on sait, qu'un lien absent.
  const quelquesAllergenes = carteVisible(items).some(
    (plat) => plat.allergenes !== null,
  );

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
          <h1 className="font-serif text-4xl text-ink">
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
                          {plat.allergenes !== null &&
                            plat.allergenes.length > 0 && (
                              <span className="text-xs text-zinc-400">
                                {anglais ? "Allergens" : "Allergènes"} :{" "}
                                {listeAllergenes(plat.allergenes, anglais)}
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

        {/* Les mentions obligatoires, ensemble et lisibles. Le prix d'abord
            parce qu'il répond à une question qu'on se pose en lisant la
            carte ; les allergènes ensuite, avec la réserve sur les traces
            — une cuisine de restaurant n'est pas cloisonnée, et laisser
            croire le contraire serait pire que se taire. */}
        <div className="flex flex-col gap-2 border-t border-zinc-200/70 pt-5 text-xs text-zinc-400">
          <p>
            {anglais
              ? "Menu given for information only: it may change with the season and daily deliveries."
              : "Carte donnée à titre indicatif : elle peut changer selon l'arrivage et la saison."}
          </p>
          <p>{anglais ? MENTION_PRIX.en : MENTION_PRIX.fr}</p>
          <p>
            {quelquesAllergenes
              ? anglais
                ? MENTION_ALLERGENES.en
                : MENTION_ALLERGENES.fr
              : anglais
                ? MENTION_ALLERGENES_ABSENTS.en
                : MENTION_ALLERGENES_ABSENTS.fr}
          </p>
          {quelquesAllergenes && (
            <Link
              href={`/carte/${slug}/allergenes${anglais ? "?lang=en" : ""}`}
              className="w-fit text-brand-navy underline-offset-2 hover:underline"
            >
              {anglais
                ? "See the full allergen table →"
                : "Voir le tableau des allergènes →"}
            </Link>
          )}
        </div>

        <Link
          href={`/reserver/${restaurant.slug_reservation}`}
          className="w-fit rounded-md bg-brand-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
        >
          {anglais ? "Book a table" : "Réserver une table"}
        </Link>
      </main>

      <footer className="border-t border-zinc-200/70 px-5 py-6">
        <SignatureKlarr
          texte={anglais ? "Menu powered by" : "Carte propulsée par"}
          className="mx-auto max-w-2xl"
        />
      </footer>
    </div>
  );
}
