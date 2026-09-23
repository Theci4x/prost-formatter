import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  basculerCartePublique,
  basculerPlat,
  monterCategorie,
  monterPlat,
  supprimerPlat,
} from "./actions";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { PlatForm } from "@/components/menu/PlatForm";
import { PhotoPlat } from "@/components/menu/PhotoPlat";
import { AllergenesPlat } from "@/components/menu/AllergenesPlat";
import { FormatsPlat } from "@/components/menu/FormatsPlat";
import { TraduireCarte } from "@/components/menu/TraduireCarte";
import {
  carteOrganisee,
  formatPrix,
  formatsDe,
  formatsLisibles,
} from "@/lib/menu/carte";
import { aTraduire, traductionCaduque } from "@/lib/menu/traduction";
import { qrSvg, urlCarte } from "@/lib/menu/qr";
import { exiger } from "@/lib/equipe/roles";
import { exigerSection } from "@/lib/abonnement/acces";
import { LIBELLE_MODULE, PRIX_MODULE } from "@/lib/abonnement/modules";
import { langueUtilisateur } from "@/lib/i18n/langue";
import { CARTE } from "@/lib/i18n/carte";
import { LANGUES_TRADUITES, type Langue, type MenuItem } from "@/types/menu";
import type { Restaurant } from "@/types/restaurant";

const bouton =
  "rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-500 transition-colors hover:border-brand-navy hover:text-brand-navy disabled:opacity-30";

/** Un bouton qui ne fait que poster : rien à retenir côté navigateur. */
function Action({
  action,
  champs,
  children,
  libelle,
  classe = bouton,
}: {
  action: (formData: FormData) => Promise<void>;
  champs: Record<string, string>;
  children: React.ReactNode;
  libelle: string;
  classe?: string;
}) {
  return (
    <form action={action}>
      {Object.entries(champs).map(([nom, valeur]) => (
        <input key={nom} type="hidden" name={nom} value={valeur} />
      ))}
      <button type="submit" aria-label={libelle} className={classe}>
        {children}
      </button>
    </form>
  );
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");
  // La section, pas le module : la carte s'affiche sur la page de
  // réservation, donc elle se saisit avec le carnet seul. Ce qui en fait
  // un produit de visibilité est réservé plus bas.
  const acces = await exigerSection(id, "menu");
  const langue = await langueUtilisateur();
  const c = CARTE[langue];
  const visibilite = acces.ouvert.visibilite;

  const supabase = await createClient();
  const [restaurantResult, itemsResult] = await Promise.all([
    supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
    supabase.from("restaurant_menu_items").select("*").eq("restaurant_id", id),
  ]);

  const restaurant = restaurantResult.data as Restaurant | null;
  if (!restaurant) notFound();

  const items = (itemsResult.data ?? []) as MenuItem[];
  const blocs = carteOrganisee(items);
  const categories = blocs.map((bloc) => bloc.categorie);
  const publique = restaurant.carte_publique === true;
  const visibles = items.filter((plat) => plat.actif).length;
  const slug = restaurant.slug_reservation;
  // Un compte par langue : les traductions sont indépendantes, et une
  // carte à jour en anglais peut n'avoir jamais vu le chinois.
  const restantATraduire = Object.fromEntries(
    LANGUES_TRADUITES.map((langue) => [
      langue,
      aTraduire(items, langue).length,
    ]),
  ) as Record<Exclude<Langue, "fr">, number>;
  // Un plat à la carte dont personne n'a examiné la composition. Les plats
  // décrochés ne comptent pas : ils ne sont servis à personne.
  const sansAllergenes = items.filter(
    (plat) => plat.actif && plat.allergenes === null,
  ).length;
  // Le QR n'est calculé que s'il mène quelque part — et il ne mène nulle
  // part sans la visibilité, puisque la page qu'il ouvre exige le module.
  const qr = visibilite && publique && slug ? await qrSvg(slug) : null;

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader icon={dashboardIcons.menu} title={c.titre(restaurant.nom)} />

      <p className="max-w-4xl text-sm text-zinc-500">{c.chapo}</p>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Compteur valeur={visibles} libelle={c.compteurALaCarte(visibles)} />
        <Compteur
          valeur={items.length - visibles}
          libelle={c.compteurDecroches(items.length - visibles)}
        />
        <Compteur
          valeur={sansAllergenes}
          libelle={c.compteurSansAllergenes(sansAllergenes)}
          accent={sansAllergenes > 0}
        />
      </div>

      {/* La déclaration des allergènes n'est pas un confort : pour un plat
          non préemballé, l'information doit être écrite et lisible sans que
          le client ait à la demander. On le dit là où se corrige le
          manque, avec le compte exact — « c'est obligatoire » fait hausser
          les épaules, « il t'en reste sept » fait ouvrir la carte. */}
      {sansAllergenes > 0 && (
        <div className="flex flex-col gap-1 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <span className="text-sm font-medium text-amber-900">
            {c.allergenesManquants(sansAllergenes)}
          </span>
          <span className="text-sm text-amber-800">{c.allergenesRappel}</span>
        </div>
      )}

      {/* Publication, traduction et QR côte à côte : trois réglages
          qu'on fait une fois, qui n'ont pas à pousser la carte elle-même
          trois écrans plus bas. */}
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {/* Publier est un choix explicite : une carte saisie pour essayer n'a
          rien à faire sur une adresse publique. */}
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-900">
              {publique ? c.visible : c.privee}
            </span>
            <span className="text-sm text-zinc-500">
              {c.platsALaCarte(visibles)}
              {items.length > visibles && c.decroches(items.length - visibles)}
              {publique && restaurant.slug_reservation && (
                <>
                  {" · "}
                  <Link
                    href={`/reserver/${restaurant.slug_reservation}`}
                    className="text-brand-navy underline-offset-2 hover:underline"
                  >
                    {c.voirMaPage}
                  </Link>
                </>
              )}
            </span>
          </div>
          <Action
            action={basculerCartePublique}
            champs={{ restaurant_id: id, publique: publique ? "0" : "1" }}
            libelle={publique ? c.retirerCarte : c.publierCarte}
            classe={
              publique
                ? "rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
                : "rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
            }
          >
            {publique ? c.retirerDeMaPage : c.publierSurMaPage}
          </Action>
        </div>

        {visibilite && items.length > 0 && (
          <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-zinc-900">
                {c.traductionTitre}
              </span>
              <span className="text-sm text-zinc-500">{c.traductionChapo}</span>
            </div>
            <TraduireCarte
              restaurantId={id}
              aTraduire={restantATraduire}
              langue={langue}
            />
          </div>
        )}

        {/* Le QR : ce qu'on pose sur les tables et au comptoir. */}
        {/* Le QR et la traduction sont les produits de visibilité de la
          carte : ils mènent à la page « la carte de X », qui est référencée
          et qui exige le module. La saisie, elle, sert la page de
          réservation et reste ouverte au carnet seul. */}
        {!visibilite ? (
          items.length > 0 && (
            <p className="rounded-2xl border border-dashed border-zinc-200 bg-brand-cream p-5 text-sm text-zinc-600 shadow-sm">
              {c.qrReserve(LIBELLE_MODULE.visibilite, PRIX_MODULE.visibilite)}
            </p>
          )
        ) : qr && slug ? (
          <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
            <div
              className="h-36 w-36 shrink-0 [&>svg]:h-full [&>svg]:w-full"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: qr }}
            />
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-zinc-900">
                  {c.qrTitre}
                </span>
                <span className="text-sm text-zinc-500">{c.qrChapo}</span>
                <a
                  href={urlCarte(slug)}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-sm text-brand-navy underline-offset-2 hover:underline"
                >
                  {urlCarte(slug)}
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`/api/carte/${slug}/qr`}
                  className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
                >
                  {c.qrPng}
                </a>
                <a
                  href={`/api/carte/${slug}/qr?format=svg`}
                  className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
                >
                  {c.qrSvg}
                </a>
              </div>
            </div>
          </div>
        ) : (
          items.length > 0 && (
            <p className="rounded-2xl border border-zinc-200/70 bg-white p-5 text-sm text-zinc-500 shadow-sm">
              {slug ? c.qrPublieDabord : c.qrPasDeSlug}
            </p>
          )
        )}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-2xl text-ink">{c.titreAjouter}</h2>
        <PlatForm restaurantId={id} categories={categories} langue={langue} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-2xl text-ink">{c.titrePlats}</h2>
        {blocs.length === 0 ? (
          <p className="rounded-2xl border border-zinc-200/70 bg-white p-5 text-sm text-zinc-500 shadow-sm">
            {c.aucunPlat}
          </p>
        ) : (
          <div className="grid items-start gap-6 2xl:grid-cols-2">
            {blocs.map((bloc, rang) => (
              <section
                key={bloc.categorie}
                className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                  <h3 className="flex items-baseline gap-3">
                    <span className="font-serif text-2xl text-ink">
                      {bloc.categorie}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {c.nombrePlats(bloc.plats.length)}
                    </span>
                  </h3>
                  {/* Deux flèches nues à côté d'un titre ne disent pas ce
                    qu'elles déplacent : on les lit comme le tri d'une
                    colonne, ou on ne les voit pas du tout. Le mot dit que
                    c'est le bloc entier qui bouge, plats compris — et il
                    n'apparaît que s'il y a quelque chose à réordonner. */}
                  {blocs.length > 1 && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-zinc-400">
                        {c.deplacerCategorie}
                      </span>
                      {rang > 0 && (
                        <Action
                          action={monterCategorie}
                          champs={{
                            restaurant_id: id,
                            categorie: bloc.categorie,
                            sens: "haut",
                          }}
                          libelle={c.monter(bloc.categorie)}
                        >
                          ↑
                        </Action>
                      )}
                      {rang < blocs.length - 1 && (
                        <Action
                          action={monterCategorie}
                          champs={{
                            restaurant_id: id,
                            categorie: bloc.categorie,
                            sens: "bas",
                          }}
                          libelle={c.descendre(bloc.categorie)}
                        >
                          ↓
                        </Action>
                      )}
                    </div>
                  )}
                </div>

                <ul className="flex flex-col divide-y divide-zinc-100">
                  {bloc.plats.map((plat, index) => (
                    <li
                      key={plat.id}
                      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 first:pt-0 last:pb-0"
                    >
                      <PhotoPlat
                        restaurantId={id}
                        platId={plat.id}
                        nom={plat.nom}
                        photoUrl={plat.photo_url}
                        langue={langue}
                      />
                      <span
                        className={`flex min-w-0 flex-1 flex-col ${
                          plat.actif ? "" : "opacity-50"
                        }`}
                      >
                        <span className="text-[15px] font-semibold text-ink">
                          {plat.nom}
                          {!plat.actif && (
                            <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
                              {c.decroche}
                            </span>
                          )}
                          {traductionCaduque(plat, "en") && (
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                              {c.anglaisARefaire}
                            </span>
                          )}
                        </span>
                        {plat.description && (
                          <span className="text-sm text-zinc-500">
                            {plat.description}
                          </span>
                        )}
                        <AllergenesPlat restaurantId={id} plat={plat} c={c} />
                        <FormatsPlat
                          restaurantId={id}
                          plat={plat}
                          langue={langue}
                        />
                      </span>

                      <span className="flex items-center gap-3">
                        {/* Les formats l'emportent sur le prix unique :
                          c'est ce que le client verra, donc c'est ce que
                          le restaurateur doit relire ici. */}
                        <span className="text-base font-semibold tabular-nums text-ink">
                          {formatsDe(plat)
                            ? formatsLisibles(formatsDe(plat)!)
                            : plat.prix_centimes === null
                              ? "—"
                              : formatPrix(plat.prix_centimes)}
                        </span>
                        <span className="flex items-center gap-1">
                          {index > 0 && (
                            <Action
                              action={monterPlat}
                              champs={{
                                restaurant_id: id,
                                id: plat.id,
                                sens: "haut",
                              }}
                              libelle={c.monter(plat.nom)}
                            >
                              ↑
                            </Action>
                          )}
                          {index < bloc.plats.length - 1 && (
                            <Action
                              action={monterPlat}
                              champs={{
                                restaurant_id: id,
                                id: plat.id,
                                sens: "bas",
                              }}
                              libelle={c.descendre(plat.nom)}
                            >
                              ↓
                            </Action>
                          )}
                        </span>
                        <Action
                          action={basculerPlat}
                          champs={{
                            restaurant_id: id,
                            id: plat.id,
                            actif: plat.actif ? "0" : "1",
                          }}
                          libelle={
                            plat.actif
                              ? c.decrocherPlat(plat.nom)
                              : c.remettrePlat(plat.nom)
                          }
                        >
                          {plat.actif ? c.decrocher : c.remettre}
                        </Action>
                        <Action
                          action={supprimerPlat}
                          champs={{ restaurant_id: id, id: plat.id }}
                          libelle={c.supprimerPlat(plat.nom)}
                          classe="text-xs text-zinc-400 transition-colors hover:text-red-600"
                        >
                          {c.supprimer}
                        </Action>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Compteur({
  valeur,
  libelle,
  accent = false,
}: {
  valeur: number;
  libelle: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-2xl border px-4 py-4 sm:px-6 sm:py-5 ${
        accent
          ? "border-brand-orange/60 bg-brand-orange-soft"
          : "border-zinc-200/70 bg-white shadow-sm"
      }`}
    >
      <span className="font-serif text-3xl leading-none text-ink sm:text-5xl">
        {valeur}
      </span>
      <span className="text-xs leading-snug text-zinc-600 sm:text-sm">
        {libelle}
      </span>
    </div>
  );
}
