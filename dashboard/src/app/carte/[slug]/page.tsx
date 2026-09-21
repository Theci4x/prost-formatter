import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { carteOrganisee, carteVisible } from "@/lib/menu/carte";
import {
  langueDisponible,
  lireLangue,
  platAffiche,
} from "@/lib/menu/traduction";
import { LANGUES_TRADUITES, type Langue } from "@/types/menu";
import { NOM_LANGUE } from "@/lib/i18n/langues";
import {
  ETIQUETTES,
  resumeFiltre,
  t,
  type Etiquette,
} from "@/lib/menu/etiquettes";
import { SignatureKlarr } from "@/components/brand/SignatureKlarr";
import { cartePubliee } from "@/lib/menu/publication";
import { PlatCarte } from "@/components/menu/PlatCarte";
import { OngletsCategories } from "@/components/menu/OngletsCategories";
import { ancre } from "@/lib/texte/ancre";
import { FiltreAllergenes } from "@/components/menu/FiltreAllergenes";
import { allergiesDemandees, filtrerCarte } from "@/lib/menu/filtre-allergenes";
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

/** La signature de bas de page : de l'interface, pas de la loi. */
const SIGNATURE: Etiquette = {
  fr: "Carte propulsée par",
  en: "Menu powered by",
  zh: "菜单技术支持",
};

type Params = { slug: string };
type Query = { lang?: string; sans?: string | string[] };

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
  // Une langue n'est proposée que si la carte y est réellement traduite :
  // un sélecteur qui renvoie du français est une déception, pas une
  // fonctionnalité.
  const disponibles = LANGUES_TRADUITES.filter((code) =>
    langueDisponible(items, code),
  );
  const demandee = lireLangue(query.lang);
  const langue =
    demandee !== "fr" && disponibles.includes(demandee) ? demandee : "fr";
  const allergies = allergiesDemandees(query.sans);
  const filtre = allergies.length > 0;
  const { compatibles, ecartes, indetermines } = filtrerCarte(
    carteVisible(items),
    allergies,
  );
  const blocs = carteOrganisee(compatibles);
  // Les onglets et les titres tirent leur ancre du même endroit : deux
  // calculs séparés finiraient par diverger sur un accent.
  const sections = blocs.map((bloc) => ({
    bloc,
    titre: platAffiche(bloc.plats[0], langue).categorie ?? bloc.categorie,
    ancre: ancre(bloc.categorie),
  }));
  // Un seul plat déclaré suffit à ouvrir le tableau : il vaut mieux un
  // document partiel, qui dit ce qu'on sait, qu'un lien absent.
  const quelquesAllergenes = carteVisible(items).some(
    (plat) => plat.allergenes !== null,
  );
  const resume = resumeFiltre(
    compatibles.length,
    ecartes.length,
    listeAllergenes(allergies, langue),
    langue,
  );

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <header className="border-b border-zinc-200/70 bg-white px-5 py-4">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3">
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
          {disponibles.length > 0 && (
            <nav aria-label="Langue" className="flex items-center gap-1">
              {(["fr", ...disponibles] as Langue[]).map((code) => {
                const sansFiltre = filtre ? `sans=${allergies.join(",")}` : "";
                const params = [
                  code === "fr" ? "" : `lang=${code}`,
                  sansFiltre,
                ].filter(Boolean);
                return (
                  <Link
                    key={code}
                    href={`/carte/${slug}${params.length ? `?${params.join("&")}` : ""}`}
                    aria-current={code === langue ? "true" : undefined}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      code === langue
                        ? "bg-brand-navy text-white"
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    {NOM_LANGUE[code]}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-5 py-8">
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
            {t(ETIQUETTES.titre, langue)}
          </h1>
          {restaurant.adresse && (
            <p className="text-sm text-zinc-500">{restaurant.adresse}</p>
          )}
        </div>

        <FiltreAllergenes slug={slug} langue={langue} choisis={allergies} />

        <OngletsCategories
          sections={sections.map(({ ancre, titre }) => ({ ancre, titre }))}
        />

        {filtre && (
          <p className="rounded-2xl border border-zinc-200/70 bg-white p-4 text-sm text-zinc-600 shadow-sm">
            {resume.principal}
            {resume.reste && (
              <span className="text-zinc-400">{resume.reste}</span>
            )}
          </p>
        )}

        {blocs.length === 0 ? (
          <p className="rounded-2xl border border-zinc-200/70 bg-white p-5 text-sm text-zinc-500 shadow-sm">
            {t(filtre ? ETIQUETTES.rienSans : ETIQUETTES.enMaj, langue)}
          </p>
        ) : (
          sections.map(({ bloc, titre, ancre: id }) => (
            /* `scroll-mt` tient compte des onglets collants : sans lui,
               le saut d'ancre met le titre exactement dessous, et on
               croit avoir atterri sur la mauvaise section. */
            <section
              key={bloc.categorie}
              id={id}
              className="flex scroll-mt-20 flex-col gap-4"
            >
              {/* Le titre du bloc suit la langue du premier plat traduit ;
                  si aucun ne l'est, il reste en français, comme les
                  plats. */}
              <h2 className="border-l-4 border-brand-orange pl-3 font-serif text-2xl text-ink">
                {titre}
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {bloc.plats.map((plat) => (
                  <PlatCarte key={plat.id} plat={plat} langue={langue} />
                ))}
              </ul>
            </section>
          ))
        )}

        {/* Les plats que le restaurant n'a pas encore déclarés. Ils ne
            peuvent aller ni avec les compatibles — rien ne dit qu'ils le
            sont — ni avec les écartés, qui accuserait à tort. Les faire
            disparaître serait pire : le client croirait avoir vu toute la
            carte. Ils sortent donc à part, avec la seule réponse honnête
            dont on dispose, qui est d'aller demander. */}
        {indetermines.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-700">
                {t(ETIQUETTES.aDemander, langue)}
              </h2>
              <p className="text-sm text-zinc-500">
                {t(ETIQUETTES.aDemanderTexte, langue)}
              </p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {indetermines.map((plat) => (
                <PlatCarte key={plat.id} plat={plat} langue={langue} />
              ))}
            </ul>
          </section>
        )}

        {/* Les mentions obligatoires, ensemble et lisibles. Le prix d'abord
            parce qu'il répond à une question qu'on se pose en lisant la
            carte ; les allergènes ensuite, avec la réserve sur les traces
            — une cuisine de restaurant n'est pas cloisonnée, et laisser
            croire le contraire serait pire que se taire. */}
        <div className="flex flex-col gap-2 border-t border-zinc-200/70 pt-5 text-xs text-zinc-400">
          <p>{t(ETIQUETTES.indicative, langue)}</p>
          <p>{MENTION_PRIX[langue]}</p>
          <p>
            {quelquesAllergenes
              ? MENTION_ALLERGENES[langue]
              : MENTION_ALLERGENES_ABSENTS[langue]}
          </p>
          {quelquesAllergenes && (
            <Link
              href={`/carte/${slug}/allergenes${langue === "fr" ? "" : `?lang=${langue}`}`}
              className="w-fit text-brand-navy underline-offset-2 hover:underline"
            >
              {t(ETIQUETTES.tableauAllergenes, langue)}
            </Link>
          )}
        </div>

        <Link
          href={`/reserver/${restaurant.slug_reservation}`}
          className="w-fit rounded-md bg-brand-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
        >
          {t(ETIQUETTES.reserver, langue)}
        </Link>
      </main>

      <footer className="border-t border-zinc-200/70 px-5 py-6">
        <SignatureKlarr
          texte={t(SIGNATURE, langue)}
          className="mx-auto max-w-5xl"
        />
      </footer>
    </div>
  );
}
