import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createServiceClient } from "@/lib/supabase/service";
import { GalerieRestaurant } from "@/components/reservations/GalerieRestaurant";
import { BandePhotos } from "@/components/reservations/BandePhotos";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";
import { DonneesStructurees } from "@/components/seo/DonneesStructurees";
import { restaurantSchema } from "@/lib/seo/donnees-structurees";
import { reseauxPublics } from "@/lib/seo/reseaux";
import { cartePubliee } from "@/lib/menu/publication";
import { carteOrganisee, formatPrix } from "@/lib/menu/carte";
import {
  plagesHoraires,
  intitulePlage,
  heuresPlage,
  horairesRenseignes,
} from "@/lib/site/horaires";
import { siteUrl } from "@/lib/site-url";
import type { RestaurantPhoto } from "@/types/photo";
import type { Espace, Service } from "@/types/reservation";
import type { Horaires } from "@/types/restaurant";

type Params = { slug: string };

type Vitrine = {
  id: string;
  nom: string;
  adresse: string | null;
  telephone: string | null;
  description: string | null;
  logo_url: string | null;
  mentions_legales: string | null;
  site_web: string | null;
  horaires: Horaires;
  slug_reservation: string;
};

/**
 * La vitrine n'existe que publiée. Elle lit toutes les colonnes plutôt
 * qu'une liste nommée : réclamer une colonne que la base n'a pas encore
 * ferait échouer la requête entière, donc la page.
 */
async function chargerVitrine(slug: string): Promise<Vitrine | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug_reservation", slug)
    .maybeSingle();

  if (error) {
    console.error(`Vitrine « ${slug} » illisible :`, error.message);
    return null;
  }
  const restaurant = data as (Vitrine & { site_publie?: boolean }) | null;
  // Publier est un choix : tant qu'il n'est pas fait, l'adresse n'existe pas.
  if (!restaurant?.site_publie) return null;
  return restaurant;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await chargerVitrine(slug);
  if (!restaurant) return { title: "Restaurant" };

  const supabase = createServiceClient();
  const { data: photo } = await supabase
    .from("restaurant_photos")
    .select("url")
    .eq("restaurant_id", restaurant.id)
    .is("espace_id", null)
    .order("ordre")
    .limit(1)
    .maybeSingle();

  // Le titre porte la ville : « Prost — restaurant à Paris » répond à ce
  // qu'on tape, là où le seul nom ne répond qu'à ceux qui le connaissent
  // déjà — et ceux-là n'ont pas besoin de Google.
  const lieu = restaurant.adresse?.split(",").pop()?.trim();
  const titre = lieu
    ? `${restaurant.nom} — restaurant à ${lieu}`
    : `${restaurant.nom} — restaurant`;
  const description =
    restaurant.description?.slice(0, 155) ??
    (restaurant.adresse
      ? `${restaurant.nom}, ${restaurant.adresse}. Carte, horaires et réservation en ligne.`
      : `${restaurant.nom}. Carte, horaires et réservation en ligne.`);
  const image = (photo as { url: string } | null)?.url;

  return {
    title: titre,
    description,
    alternates: { canonical: `${siteUrl()}/restaurant/${slug}` },
    openGraph: {
      type: "website",
      title: titre,
      description,
      siteName: restaurant.nom,
      locale: "fr_FR",
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: titre,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

/**
 * Ce que l'établissement demandera en garantie, dit avant la demande.
 * Rien si aucune garantie n'est réclamée : une ligne « aucun acompte » ne
 * rassure pas, elle fait penser qu'il y en a parfois un.
 */
function garantieLisible(espace: Espace): string | null {
  const euros = (centimes: number) =>
    (centimes / 100).toLocaleString("fr-FR", {
      minimumFractionDigits: centimes % 100 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    });
  const seuil = espace.garantie_seuil_couverts
    ? ` à partir de ${espace.garantie_seuil_couverts} convives`
    : "";

  if (espace.acompte_centimes) {
    const par = espace.acompte_mode === "par_couvert" ? " par personne" : "";
    return `Acompte de ${euros(espace.acompte_centimes)} €${par}${seuil}, à verser pour confirmer.`;
  }
  if (espace.caution_centimes) {
    const par = espace.caution_mode === "par_couvert" ? " par personne" : "";
    return `Empreinte de carte de ${euros(espace.caution_centimes)} €${par}${seuil} — rien n'est prélevé, sauf si le groupe ne vient pas.`;
  }
  return null;
}

function Section({
  titre,
  children,
}: {
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-zinc-900">{titre}</h2>
      {children}
    </section>
  );
}

export default async function VitrinePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const restaurant = await chargerVitrine(slug);
  if (!restaurant) notFound();

  const supabase = createServiceClient();
  const [photosResult, espacesResult, servicesResult, reputationResult, carte, reseaux] =
    await Promise.all([
      supabase
        .from("restaurant_photos")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("ordre")
        .order("created_at"),
      supabase
        .from("restaurant_espaces")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("ordre"),
      supabase
        .from("restaurant_services")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("heure_debut"),
      supabase
        .from("restaurant_reputation_snapshots")
        .select("note, nombre_avis")
        .eq("restaurant_id", restaurant.id)
        .eq("plateforme", "google")
        .order("releve_le", { ascending: false })
        .limit(1)
        .maybeSingle(),
      cartePubliee(supabase, restaurant.id),
      reseauxPublics(supabase, restaurant.id, restaurant.site_web),
    ]);

  const photos = (photosResult.data ?? []) as RestaurantPhoto[];
  const espaces = (espacesResult.data ?? []) as Espace[];
  const services = (servicesResult.data ?? []) as Service[];
  const nomEspace = new Map(espaces.map((espace) => [espace.id, espace.nom]));
  const reputation = reputationResult.data as {
    note: number | null;
    nombre_avis: number | null;
  } | null;

  const photosEtablissement = photos.filter((photo) => !photo.espace_id);
  const galerie = (
    photosEtablissement.length > 0 ? photosEtablissement : photos
  ).map((photo) => ({
    ...photo,
    legende:
      photo.legende ??
      (photo.espace_id ? nomEspace.get(photo.espace_id) : null) ??
      null,
  }));

  const photosParEspace = new Map<string, RestaurantPhoto[]>();
  for (const photo of photos) {
    if (!photo.espace_id) continue;
    const liste = photosParEspace.get(photo.espace_id) ?? [];
    liste.push(photo);
    photosParEspace.set(photo.espace_id, liste);
  }

  const plages = plagesHoraires(restaurant.horaires ?? {});
  const privatisables = espaces.filter(
    (espace) => espace.privatisation_minimum !== null,
  );
  // Trois plats suffisent à donner envie ; la carte entière a sa page.
  const apercuCarte = carteOrganisee(carte.items).slice(0, 1);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F0]">
      <header className="border-b border-zinc-200/70 bg-white/90 px-6 py-4">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4">
          <span className="flex items-center gap-3">
            {restaurant.logo_url && (
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={restaurant.logo_url}
                  alt=""
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </span>
            )}
            <span className="text-lg font-semibold text-zinc-900">
              {restaurant.nom}
            </span>
          </span>
          <nav className="flex items-center gap-4 text-sm">
            {carte.publiee && (
              <Link
                href={`/carte/${slug}`}
                className="font-medium text-zinc-600 hover:text-zinc-900"
              >
                La carte
              </Link>
            )}
            <Link
              href={`/reserver/${slug}`}
              className="rounded-md bg-brand-navy px-4 py-2 font-medium text-white transition-colors hover:bg-brand-navy-hover"
            >
              Réserver
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-10">
        {/* Ce que Google et les moteurs de réponse lisent pour savoir qu'il
            s'agit d'un restaurant, où il est, quand il ouvre et à quel
            prix. C'est très exactement ce qui manquait aux établissements
            dont l'audit met le pilier Visibilité IA à zéro. */}
        <DonneesStructurees
          donnees={restaurantSchema({
            etablissement: {
              nom: restaurant.nom,
              adresse: restaurant.adresse,
              description: restaurant.description,
              logoUrl: restaurant.logo_url,
              telephone: restaurant.telephone,
            },
            services,
            espaces,
            carte: carte.items,
            url: `${siteUrl()}/restaurant/${slug}`,
            urlCarte: carte.publiee ? `${siteUrl()}/carte/${slug}` : null,
            note: reputation?.note ? Number(reputation.note) : null,
            nombreAvis: reputation?.nombre_avis ?? null,
            reseaux,
          })}
        />

        <GalerieRestaurant photos={galerie} nom={restaurant.nom} />

        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold text-zinc-900">
            {restaurant.nom}
          </h1>
          {restaurant.adresse && (
            <p className="text-zinc-500">{restaurant.adresse}</p>
          )}
          {reputation?.note && reputation.nombre_avis ? (
            <p className="text-sm text-zinc-600">
              <span className="font-medium text-zinc-900">
                {Number(reputation.note).toFixed(1)}
              </span>{" "}
              sur Google · {reputation.nombre_avis} avis
            </p>
          ) : null}
          {restaurant.description && (
            <p className="max-w-2xl whitespace-pre-line leading-relaxed text-zinc-700">
              {restaurant.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-3">
            <Link
              href={`/reserver/${slug}`}
              className="rounded-md bg-brand-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
            >
              Réserver une table
            </Link>
            {carte.publiee && (
              <Link
                href={`/carte/${slug}`}
                className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
              >
                Voir la carte
              </Link>
            )}
          </div>
        </div>

        {apercuCarte.length > 0 && (
          <Section titre="Un aperçu de la carte">
            <ul className="flex flex-col divide-y divide-zinc-200/70 rounded-2xl border border-zinc-200/70 bg-white px-5 shadow-sm">
              {apercuCarte[0].plats.slice(0, 3).map((plat) => (
                <li
                  key={plat.id}
                  className="flex items-baseline justify-between gap-4 py-3"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="font-medium text-zinc-900">
                      {plat.nom}
                    </span>
                    {plat.description && (
                      <span className="text-sm text-zinc-500">
                        {plat.description}
                      </span>
                    )}
                  </span>
                  {plat.prix_centimes !== null && (
                    <span className="shrink-0 text-sm text-zinc-600">
                      {formatPrix(plat.prix_centimes)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <Link
              href={`/carte/${slug}`}
              className="w-fit text-sm font-medium text-brand-orange hover:underline"
            >
              Voir toute la carte
            </Link>
          </Section>
        )}

        <Section titre="Infos pratiques">
          <div className="grid gap-5 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-zinc-900">
                Nous trouver
              </span>
              {restaurant.adresse ? (
                <>
                  <span className="text-sm text-zinc-600">
                    {restaurant.adresse}
                  </span>
                  {/* Un lien vers Maps plutôt qu'une carte intégrée : une
                      carte chargée sur chaque visite coûte du temps de
                      chargement à tout le monde pour servir les quelques-uns
                      qui cherchent l'itinéraire. */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.nom} ${restaurant.adresse}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit text-sm font-medium text-brand-orange hover:underline"
                  >
                    Itinéraire
                  </a>
                </>
              ) : (
                <span className="text-sm text-zinc-400">
                  Adresse non renseignée
                </span>
              )}
              {restaurant.telephone && (
                <a
                  href={`tel:${restaurant.telephone.replace(/\s/g, "")}`}
                  className="w-fit text-sm font-medium text-brand-orange hover:underline"
                >
                  {restaurant.telephone}
                </a>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-zinc-900">
                Horaires
              </span>
              {horairesRenseignes(restaurant.horaires ?? {}) ? (
                <ul className="flex flex-col gap-1 text-sm">
                  {plages.map((plage) => (
                    <li
                      key={plage.debut}
                      className="flex justify-between gap-4"
                    >
                      <span className="text-zinc-600">
                        {intitulePlage(plage)}
                      </span>
                      <span
                        className={
                          plage.ouverture ? "text-zinc-900" : "text-zinc-400"
                        }
                      >
                        {heuresPlage(plage)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-sm text-zinc-400">
                  Horaires non renseignés
                </span>
              )}
            </div>
          </div>
        </Section>

        {privatisables.length > 0 && (
          <Section titre="Privatiser un espace">
            <p className="text-sm text-zinc-600">
              Anniversaire, repas d&apos;équipe, séminaire : l&apos;espace est
              à vous seuls pendant tout le service.
            </p>

            {/* Une salle qu'on privatise se choisit sur photo. La lister en
                une ligne de noms, comme avant, revenait à demander au client
                de réserver une pièce qu'il n'a jamais vue. */}
            <ul className="flex flex-col gap-4">
              {privatisables.map((espace) => (
                <li
                  key={espace.id}
                  className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium text-zinc-900">
                      {espace.nom}
                    </span>
                    <span className="text-sm text-zinc-500">
                      {espace.privatisation_minimum
                        ? `De ${espace.privatisation_minimum} à ${espace.capacite} couverts`
                        : `Jusqu'à ${espace.capacite} couverts`}
                    </span>
                  </div>

                  {espace.description && (
                    <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                      {espace.description}
                    </p>
                  )}

                  <BandePhotos
                    photos={photosParEspace.get(espace.id) ?? []}
                    espaceNom={espace.nom}
                    restaurantNom={restaurant.nom}
                    hauteur="h-40 w-56"
                  />

                  {/* La garantie est annoncée avant la demande. Un groupe
                      qui l'apprend au moment de payer se sent piégé ; celui
                      qui la lit ici sait à quoi s'en tenir, et le
                      restaurateur ne perd plus son temps avec ceux que ça
                      rebute. */}
                  {garantieLisible(espace) && (
                    <p className="mt-3 text-xs text-zinc-500">
                      {garantieLisible(espace)}
                    </p>
                  )}

                  <Link
                    href={`/reserver/${slug}?espace=${espace.id}`}
                    className="mt-3 inline-block rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
                  >
                    Demander {espace.nom}
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </main>

      <footer className="border-t border-zinc-200/70 px-6 py-6">
        {restaurant.mentions_legales && (
          <div className="mx-auto mb-5 max-w-3xl">
            <p className="whitespace-pre-line text-xs leading-relaxed text-zinc-500">
              {restaurant.mentions_legales}
            </p>
          </div>
        )}
        <div className="mx-auto flex max-w-3xl items-center gap-2 text-sm text-zinc-400">
          <KlarrMark size={16} />
          <span>
            Site et réservations propulsés par{" "}
            <KlarrWordmark className="text-zinc-500" />
          </span>
        </div>
      </footer>
    </div>
  );
}
