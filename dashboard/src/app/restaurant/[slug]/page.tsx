import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { langueVisiteur } from "@/lib/i18n/langue";
import { VITRINE } from "@/lib/i18n/vitrine";
import { DonneesStructurees } from "@/components/seo/DonneesStructurees";
import {
  PageVitrine,
  type DonneesVitrine,
} from "@/components/vitrine/PageVitrine";
import {
  restaurantSchema,
  faqSchema,
  type QuestionFrequente,
} from "@/lib/seo/donnees-structurees";
import { reseauxPublics } from "@/lib/seo/reseaux";
import { fluxInstagram } from "@/lib/vitrine/instagram";
import { cartePubliee } from "@/lib/menu/publication";
import { carteOrganisee } from "@/lib/menu/carte";
import { plagesHoraires } from "@/lib/site/horaires";
import { siteUrl } from "@/lib/site-url";
import { chargerAcces } from "@/lib/abonnement/acces";
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
  /** Ce que sert la maison. Colonne récente, donc facultative. */
  type_cuisine?: string | null;
  /** La photo qui ouvre la page. Colonne récente, donc facultative. */
  photo_couverture_id?: string | null;
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

  // Le site vitrine fait partie du module visibilité : sans lui, l'adresse
  // ne répond plus.
  const acces = await chargerAcces(restaurant.id, supabase);
  if (!acces.ouvert.visibilite) return null;

  return restaurant;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const v = VITRINE[await langueVisiteur()];
  const restaurant = await chargerVitrine(slug);
  if (!restaurant) return { title: v.restaurant };

  // L'image de partage est la couverture : c'est elle qu'on a choisie
  // pour représenter la maison, elle doit l'être aussi sur WhatsApp et
  // sur Facebook. À défaut, la première photo, comme avant.
  const supabase = createServiceClient();
  const { data: photo } = restaurant.photo_couverture_id
    ? await supabase
        .from("restaurant_photos")
        .select("url")
        .eq("id", restaurant.photo_couverture_id)
        .maybeSingle()
    : await supabase
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
    ? v.titreLieu(restaurant.nom, lieu)
    : v.titreSeul(restaurant.nom);
  const description =
    restaurant.description?.slice(0, 155) ??
    (restaurant.adresse
      ? v.descriptionAvecAdresse(restaurant.nom, restaurant.adresse)
      : v.descriptionSeule(restaurant.nom));
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
      locale: v.localeOg,
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

export default async function VitrinePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const restaurant = await chargerVitrine(slug);
  if (!restaurant) notFound();

  // La vitrine suit la langue du navigateur, contrairement aux pages de
  // Klarr lui-même.
  //
  // La règle de `langueIndexable` — français pour tout le monde, une autre
  // langue seulement pour qui clique — vaut pour les pages que Klarr écrit
  // pour des restaurateurs français. Celle-ci n'est pas à nous : c'est la
  // vitrine du restaurant, et son lecteur est un client, parfois un
  // touriste, qui n'est pas passé par l'accueil et n'a donc jamais eu
  // l'occasion de choisir. Le laisser sur une page française parce qu'il
  // n'a pas trouvé le globe, c'est perdre le couvert.
  //
  // Le référencement ne souffre pas : Googlebot n'envoie pas d'en-tête
  // « Accept-Language » par défaut, et sans en-tête `langueVisiteur` rend
  // le français. Le balisage structuré suit la langue affichée, donc ne la
  // contredit jamais, et `Vary: Accept-Language` prévient les caches (voir
  // `next.config.ts`). Un choix explicite, lui, passe toujours devant :
  // le témoin est lu en premier.
  const langue = await langueVisiteur();

  const supabase = createServiceClient();
  const [
    photosResult,
    espacesResult,
    servicesResult,
    reputationResult,
    carte,
    reseaux,
    instagram,
    faqResult,
  ] = await Promise.all([
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
    fluxInstagram(supabase, restaurant.id),
    supabase
      .from("restaurant_faq")
      .select("question, reponse")
      .eq("restaurant_id", restaurant.id)
      .order("ordre")
      .order("created_at"),
  ]);

  const photos = (photosResult.data ?? []) as RestaurantPhoto[];
  const questions = (faqResult.data ?? []) as QuestionFrequente[];
  const espaces = (espacesResult.data ?? []) as Espace[];
  const services = (servicesResult.data ?? []) as Service[];
  const nomEspace = new Map(espaces.map((espace) => [espace.id, espace.nom]));
  const reputation = reputationResult.data as {
    note: number | null;
    nombre_avis: number | null;
  } | null;

  const photosEtablissement = photos.filter((photo) => !photo.espace_id);

  // La couverture choisie par le restaurateur ; à défaut, la première
  // photo de l'établissement — mieux vaut une image que pas d'image, et
  // la page reste correcte tant qu'aucun choix n'a été fait.
  const couverture =
    photosEtablissement.find(
      (photo) => photo.id === restaurant.photo_couverture_id,
    ) ??
    photosEtablissement[0] ??
    null;

  const galerie = (
    photosEtablissement.length > 0 ? photosEtablissement : photos
  )
    // La couverture est déjà en haut de la page : la remontrer dans la
    // grille juste en dessous donnerait l'impression d'un bug.
    .filter((photo) => photo.id !== couverture?.id)
    .map((photo) => ({
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

  const donnees: DonneesVitrine = {
    slug,
    langue,
    restaurant: {
      nom: restaurant.nom,
      adresse: restaurant.adresse,
      telephone: restaurant.telephone,
      description: restaurant.description,
      logo_url: restaurant.logo_url,
      mentions_legales: restaurant.mentions_legales,
      site_web: restaurant.site_web,
      horaires: restaurant.horaires ?? {},
      type_cuisine: restaurant.type_cuisine,
    },
    couverture,
    galerie,
    note:
      reputation?.note && reputation.nombre_avis
        ? { valeur: Number(reputation.note), avis: reputation.nombre_avis }
        : null,
    cartePubliee: carte.publiee,
    plats: apercuCarte[0]?.plats ?? [],
    instagram,
    plages,
    privatisables,
    photosParEspace,
    questions,
  };

  return (
    <>
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
            typeCuisine: restaurant.type_cuisine,
          },
          accepteReservations: true,
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
      {/* Un second bloc plutôt qu'une propriété du premier : une FAQPage
          est une page à part entière aux yeux de schema.org, et
          l'imbriquer dans le Restaurant la rendrait invisible. */}
      <DonneesStructurees
        donnees={faqSchema({
          questions,
          url: `${siteUrl()}/restaurant/${slug}`,
        })}
      />
      <PageVitrine d={donnees} />
    </>
  );
}
