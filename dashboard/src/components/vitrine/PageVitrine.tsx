import Image from "next/image";
import Link from "next/link";
import { HeroVitrine } from "@/components/reservations/HeroVitrine";
import { GalerieRestaurant } from "@/components/reservations/GalerieRestaurant";
import { FluxInstagram } from "@/components/reservations/FluxInstagram";
import { QuestionsFrequentes } from "@/components/seo/QuestionsFrequentes";
import { SignatureKlarr } from "@/components/brand/SignatureKlarr";
import { ChoixLangueSite } from "@/components/landing/ChoixLangueSite";
import { VITRINE } from "@/lib/i18n/vitrine";
import { montantLisible } from "@/lib/i18n/nombres";
import type { Langue } from "@/lib/i18n/langue";
import { formatPrix } from "@/lib/menu/carte";
import {
  heuresPlage,
  intitulePlage,
  horairesRenseignes,
  type PlageHoraire,
} from "@/lib/site/horaires";
import type { QuestionFrequente } from "@/lib/seo/donnees-structurees";
import type { MediaInstagram } from "@/lib/facebook/oauth";
import type { RestaurantPhoto } from "@/types/photo";
import type { Espace } from "@/types/reservation";
import type { Horaires } from "@/types/restaurant";

/**
 * Le site d'un restaurant, tel que ses clients le voient.
 *
 * Il tenait dans une colonne de 768 pixels, en cartes grises : une page
 * d'application, pas un site de restaurant. Un restaurateur le compare à
 * ce que font les autres — une grande photo, son nom en grand, et
 * « Réserver » toujours sous la main — et il a raison.
 *
 * L'ordre ne change pas, il s'élargit : la photo, la maison, les photos,
 * la carte, les espaces, les infos. Chaque section prend la largeur dont
 * elle a besoin et l'air qu'il lui faut, sans effet : ce sont les photos
 * qui doivent bouger le visiteur, pas la page.
 *
 * Ce composant ne lit rien : la page lui donne tout, ce qui permet de le
 * regarder avec des données d'exemple sans base derrière.
 */

export type Plat = {
  id: string;
  nom: string;
  description: string | null;
  prix_centimes: number | null;
};

export type DonneesVitrine = {
  slug: string;
  langue: Langue;
  restaurant: {
    nom: string;
    adresse: string | null;
    telephone: string | null;
    description: string | null;
    logo_url: string | null;
    mentions_legales: string | null;
    site_web: string | null;
    horaires: Horaires;
    type_cuisine?: string | null;
  };
  couverture: RestaurantPhoto | null;
  galerie: RestaurantPhoto[];
  note: { valeur: number; avis: number } | null;
  cartePubliee: boolean;
  plats: Plat[];
  instagram: { pseudo: string; medias: MediaInstagram[] } | null;
  plages: PlageHoraire[];
  privatisables: Espace[];
  photosParEspace: Map<string, RestaurantPhoto[]>;
  questions: QuestionFrequente[];
};

/** « Bistrot · Lyon 2e » : le genre, puis ce qui suit la dernière virgule. */
function sousTitre(
  typeCuisine: string | null | undefined,
  adresse: string | null,
) {
  const lieu = adresse?.split(",").pop()?.trim() ?? null;
  return [typeCuisine, lieu].filter(Boolean).join(" · ") || null;
}

/**
 * Ce que l'établissement demandera en garantie, dit avant la demande.
 * Rien si aucune garantie n'est réclamée : une ligne « aucun acompte » ne
 * rassure pas, elle fait penser qu'il y en a parfois un.
 */
function garantieLisible(espace: Espace, langue: Langue): string | null {
  const v = VITRINE[langue];
  const seuil = espace.garantie_seuil_couverts ?? null;
  if (espace.acompte_centimes) {
    return v.acompte(
      montantLisible(espace.acompte_centimes, langue),
      espace.acompte_mode === "par_couvert",
      seuil,
    );
  }
  if (espace.caution_centimes) {
    return v.caution(
      montantLisible(espace.caution_centimes, langue),
      espace.caution_mode === "par_couvert",
      seuil,
    );
  }
  return null;
}

function Titre({ enfant, sur }: { enfant: string; sur?: string }) {
  return (
    <div className="flex flex-col gap-2">
      {sur && (
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-orange-dark">
          {sur}
        </span>
      )}
      <h2 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">
        {enfant}
      </h2>
    </div>
  );
}

const CONTENEUR = "mx-auto w-full max-w-6xl px-6";

export function PageVitrine({ d }: { d: DonneesVitrine }) {
  const { restaurant, langue, slug } = d;
  const v = VITRINE[langue];
  const noteTexte = d.note
    ? v.noteSurGoogle(d.note.valeur.toFixed(1), d.note.avis)
    : null;

  const ancres = [
    d.cartePubliee ? { href: `/carte/${slug}`, libelle: v.laCarte } : null,
    d.galerie.length > 0 ? { href: "#photos", libelle: v.photos } : null,
    { href: "#infos", libelle: v.infos },
    d.privatisables.length > 0
      ? { href: "#privatiser", libelle: v.privatiser }
      : null,
  ].filter((a): a is { href: string; libelle: string } => a !== null);

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      {/* La barre reste : « Réserver » ne doit jamais demander de remonter.
          Translucide sur la photo, blanche ensuite — le flou fait les
          deux sans qu'on ait à choisir. */}
      <header className="sticky top-0 z-30 border-b border-line/60 bg-paper/85 backdrop-blur">
        <div
          className={`${CONTENEUR} flex h-16 items-center justify-between gap-4`}
        >
          <a href="#" className="flex min-w-0 items-center gap-3">
            {restaurant.logo_url && (
              <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={restaurant.logo_url}
                  alt=""
                  fill
                  sizes="36px"
                  className="object-contain"
                />
              </span>
            )}
            <span className="truncate font-serif text-xl text-ink">
              {restaurant.nom}
            </span>
          </a>
          <nav className="hidden items-center gap-7 md:flex">
            {ancres.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
              >
                {a.libelle}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href={`/reserver/${slug}`}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy"
            >
              {v.reserver}
            </Link>
            <ChoixLangueSite courante={langue} />
          </div>
        </div>
      </header>

      <HeroVitrine
        url={d.couverture?.url ?? null}
        legende={d.couverture?.legende ?? null}
        nom={restaurant.nom}
        sousTitre={sousTitre(restaurant.type_cuisine, restaurant.adresse)}
        adresse={restaurant.adresse}
        note={noteTexte}
        actions={[
          {
            href: `/reserver/${slug}`,
            libelle: v.reserverUneTable,
            principale: true,
          },
          ...(d.cartePubliee
            ? [{ href: `/carte/${slug}`, libelle: v.voirLaCarte }]
            : []),
        ]}
      />

      <main className="flex flex-1 flex-col">
        {/* La maison : le texte du restaurateur en grand, et à côté ce
            qu'on vérifie avant de réserver — la note, l'adresse, le
            téléphone. */}
        {(restaurant.description || noteTexte || restaurant.adresse) && (
          <section
            className={`${CONTENEUR} grid gap-10 py-16 sm:py-24 lg:grid-cols-12 lg:gap-16`}
          >
            <div className="flex flex-col gap-6 lg:col-span-7">
              <Titre enfant={restaurant.nom} sur={v.aPropos} />
              {restaurant.description && (
                <p className="max-w-2xl whitespace-pre-line text-lg leading-[1.7] text-ink sm:text-xl">
                  {restaurant.description}
                </p>
              )}
            </div>
            <aside className="flex flex-col divide-y divide-line border-y border-line lg:col-span-4 lg:col-start-9 lg:self-start">
              {d.note && (
                <div className="flex items-baseline justify-between gap-4 py-4">
                  <span className="font-serif text-4xl text-ink">
                    {d.note.valeur
                      .toFixed(1)
                      .replace(".", langue === "fr" ? "," : ".")}
                  </span>
                  <span className="text-right text-sm text-ink-soft">
                    {noteTexte}
                  </span>
                </div>
              )}
              {restaurant.adresse && (
                <div className="flex flex-col gap-1 py-4">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                    {v.nousTrouver}
                  </span>
                  <span className="text-sm text-ink">{restaurant.adresse}</span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.nom} ${restaurant.adresse}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit text-sm font-medium text-brand-orange-dark hover:underline"
                  >
                    {v.itineraire}
                  </a>
                </div>
              )}
              {restaurant.telephone && (
                <div className="flex flex-col gap-1 py-4">
                  <a
                    href={`tel:${restaurant.telephone.replace(/\s/g, "")}`}
                    className="w-fit text-sm font-medium text-ink hover:underline"
                  >
                    {restaurant.telephone}
                  </a>
                </div>
              )}
            </aside>
          </section>
        )}

        {d.galerie.length > 0 && (
          <section
            id="photos"
            className={`${CONTENEUR} scroll-mt-20 pb-16 sm:pb-24`}
          >
            <GalerieRestaurant
              photos={d.galerie}
              nom={restaurant.nom}
              langue={langue}
              hauteur="h-72 sm:h-[520px]"
            />
          </section>
        )}

        {d.plats.length > 0 && (
          <section
            id="carte"
            className="scroll-mt-20 border-y border-line bg-paper py-16 sm:py-24"
          >
            <div className={`${CONTENEUR} flex flex-col gap-10`}>
              <Titre enfant={v.apercuDeLaCarte} />
              <ul className="grid gap-x-16 md:grid-cols-2">
                {d.plats.slice(0, 6).map((plat) => (
                  <li
                    key={plat.id}
                    className="flex items-baseline justify-between gap-6 border-b border-line py-4"
                  >
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="font-medium text-ink">{plat.nom}</span>
                      {plat.description && (
                        <span className="text-sm leading-relaxed text-ink-soft">
                          {plat.description}
                        </span>
                      )}
                    </span>
                    {plat.prix_centimes !== null && (
                      <span className="shrink-0 tabular-nums text-ink">
                        {formatPrix(plat.prix_centimes)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              {d.cartePubliee && (
                <Link
                  href={`/carte/${slug}`}
                  className="w-fit rounded-full border border-ink px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
                >
                  {v.voirTouteLaCarte}
                </Link>
              )}
            </div>
          </section>
        )}

        {d.instagram && (
          <section className={`${CONTENEUR} py-16 sm:py-24`}>
            <FluxInstagram
              pseudo={d.instagram.pseudo}
              medias={d.instagram.medias}
              langue={langue}
            />
          </section>
        )}

        {d.privatisables.length > 0 && (
          <section
            id="privatiser"
            className={`${CONTENEUR} flex scroll-mt-20 flex-col gap-10 py-16 sm:py-24`}
          >
            <div className="flex max-w-2xl flex-col gap-4">
              <Titre enfant={v.privatiserUnEspace} />
              <p className="text-base leading-relaxed text-ink-soft">
                {v.privatisationChapo}
              </p>
            </div>
            {/* Une salle qu'on privatise se choisit sur photo : la première
                en grand, les autres dans la visionneuse. */}
            <ul className="grid gap-8 md:grid-cols-2">
              {d.privatisables.map((espace) => {
                const photos = d.photosParEspace.get(espace.id) ?? [];
                const garantie = garantieLisible(espace, langue);
                return (
                  <li
                    key={espace.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-line bg-paper"
                  >
                    {photos[0] && (
                      <div className="relative aspect-[4/3] bg-zinc-100">
                        <Image
                          src={photos[0].url}
                          alt={photos[0].legende ?? espace.nom}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                        {photos.length > 1 && (
                          <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
                            {photos.length} photos
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex flex-1 flex-col gap-3 p-6">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-serif text-2xl text-ink">
                          {espace.nom}
                        </span>
                        <span className="text-sm text-ink-soft">
                          {espace.privatisation_minimum
                            ? v.deAJusqua(
                                espace.privatisation_minimum,
                                espace.capacite,
                              )
                            : v.jusqua(espace.capacite)}
                        </span>
                      </div>
                      {espace.description && (
                        <p className="text-sm leading-relaxed text-ink-soft">
                          {espace.description}
                        </p>
                      )}
                      {garantie && (
                        <p className="text-xs leading-relaxed text-ink-soft">
                          {garantie}
                        </p>
                      )}
                      <Link
                        href={`/reserver/${slug}?espace=${espace.id}`}
                        className="mt-auto w-fit rounded-full border border-ink px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
                      >
                        {v.demander(espace.nom)}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Les infos pratiques sur fond sombre : la page se termine sur ce
            qu'on note — l'adresse, les heures, le numéro. */}
        <section
          id="infos"
          className="scroll-mt-20 bg-ink py-16 text-white sm:py-24"
        >
          <div className={`${CONTENEUR} grid gap-12 md:grid-cols-3`}>
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-orange">
                {v.nousTrouver}
              </span>
              {restaurant.adresse ? (
                <>
                  <p className="text-lg leading-snug">{restaurant.adresse}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.nom} ${restaurant.adresse}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit text-sm font-medium text-white/80 underline underline-offset-4 hover:text-white"
                  >
                    {v.itineraire}
                  </a>
                </>
              ) : (
                <p className="text-sm text-white/50">
                  {v.adresseNonRenseignee}
                </p>
              )}
              {restaurant.telephone && (
                <a
                  href={`tel:${restaurant.telephone.replace(/\s/g, "")}`}
                  className="w-fit text-lg hover:underline"
                >
                  {restaurant.telephone}
                </a>
              )}
              {restaurant.site_web && (
                <a
                  href={restaurant.site_web}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit text-sm text-white/70 underline underline-offset-4 hover:text-white"
                >
                  {restaurant.site_web
                    .replace(/^https?:\/\//, "")
                    .replace(/\/$/, "")}
                </a>
              )}
            </div>

            <div className="flex flex-col gap-3 md:col-span-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-orange">
                {v.horaires}
              </span>
              {horairesRenseignes(restaurant.horaires ?? {}) ? (
                <ul className="grid gap-x-12 gap-y-2 sm:grid-cols-2">
                  {d.plages.map((plage) => (
                    <li
                      key={plage.debut}
                      className="flex justify-between gap-6 border-b border-white/10 py-2 text-sm"
                    >
                      <span className="text-white/70">
                        {intitulePlage(plage, langue)}
                      </span>
                      <span
                        className={
                          plage.ouverture ? "text-white" : "text-white/40"
                        }
                      >
                        {heuresPlage(plage, langue)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-white/50">
                  {v.horairesNonRenseignes}
                </p>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className={`${CONTENEUR} flex flex-col gap-8 py-10`}>
        <QuestionsFrequentes questions={d.questions} langue={langue} />
        {restaurant.mentions_legales && (
          <p className="whitespace-pre-line text-xs leading-relaxed text-zinc-500">
            {restaurant.mentions_legales}
          </p>
        )}
        <SignatureKlarr texte={v.propulseePar} />
      </footer>
    </div>
  );
}
