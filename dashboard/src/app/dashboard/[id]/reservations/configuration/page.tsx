import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { Compteur } from "@/components/dashboard/Compteur";
import { Depliable } from "@/components/dashboard/Depliable";
import {
  EspaceForm,
  EspaceModifiable,
} from "@/components/reservations/EspaceForm";
import { PhotosEspace } from "@/components/reservations/PhotosEspace";
import { IdentitePublique } from "@/components/reservations/IdentitePublique";
import { ServiceForm } from "@/components/reservations/ServiceForm";
import { ServiceModifiable } from "@/components/reservations/ServiceModifiable";
import { FermetureForm } from "@/components/reservations/FermetureForm";
import { ReglesConfirmation } from "@/components/reservations/ReglesConfirmation";
import {
  activerPageReservation,
  removeEspace,
  removeService,
  supprimerFermeture,
} from "../actions";
import { type Espace, type Fermeture, type Service } from "@/types/reservation";
import type { Restaurant } from "@/types/restaurant";
import type { RestaurantPhoto } from "@/types/photo";
import { siteUrl } from "@/lib/site-url";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import { langueUtilisateur } from "@/lib/i18n/langue";
import {
  CONFIGURATION,
  type ClesConfiguration,
} from "@/lib/i18n/configuration";
import { dateComplete } from "@/lib/i18n/dates";
import { montantLisible } from "@/lib/i18n/nombres";
import type { Langue } from "@/lib/i18n/langues";

function Supprimer({
  id,
  restaurantId,
  action,
  libelle,
}: {
  id: string;
  restaurantId: string;
  action: (formData: FormData) => Promise<void>;
  libelle: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      <button
        type="submit"
        className="text-sm font-medium text-red-600 hover:text-red-800"
      >
        {libelle}
      </button>
    </form>
  );
}

function Puce({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
      {children}
    </span>
  );
}

/**
 * La garantie d'un espace, en une phrase. Le restaurateur doit relire son
 * réglage sans rouvrir le formulaire : c'est ce qui sera réclamé à son
 * client, il ne doit pas avoir à le deviner.
 *
 * Le montant est formaté dans sa langue — « 1 500 » en français, « 1,500 »
 * en anglais —, et c'est le dictionnaire qui place le symbole, parce que
 * le chinois ne le met pas où nous le mettons.
 */
function garantieLisible(
  espace: Espace,
  cfg: ClesConfiguration,
  langue: Langue,
): string | null {
  const euros = (centimes: number) => montantLisible(centimes, langue);
  const seuil = espace.garantie_seuil_couverts ?? null;

  if (espace.acompte_centimes) {
    return cfg.acompteLisible(
      euros(espace.acompte_centimes),
      espace.acompte_mode === "par_couvert",
      seuil,
    );
  }
  if (espace.caution_centimes) {
    return cfg.cautionLisible(
      euros(espace.caution_centimes),
      espace.caution_mode === "par_couvert",
      seuil,
    );
  }
  return null;
}

/** Un seul jour se dit « le 14 juillet », pas « du 14 au 14 ». */
function formatPeriode(
  debut: string,
  fin: string,
  cfg: ClesConfiguration,
  langue: Langue,
): string {
  return debut === fin
    ? cfg.unSeulJour(dateComplete(debut, langue))
    : cfg.duAu(dateComplete(debut, langue), dateComplete(fin, langue));
}

export default async function ConfigurationReservationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");
  await exigerModule(id, "reservations");
  const langue = await langueUtilisateur();
  const cfg = CONFIGURATION[langue];
  const supabase = await createClient();

  const [
    restaurantResult,
    espacesResult,
    servicesResult,
    photosResult,
    fermeturesResult,
  ] = await Promise.all([
    supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("restaurant_espaces")
      .select("*")
      .eq("restaurant_id", id)
      .order("ordre")
      .order("created_at"),
    supabase
      .from("restaurant_services")
      .select("*")
      .eq("restaurant_id", id)
      .order("ordre")
      .order("heure_debut"),
    supabase
      .from("restaurant_photos")
      .select("*")
      .eq("restaurant_id", id)
      .not("espace_id", "is", null)
      .order("created_at"),
    // Les fermetures passées ne servent plus à rien : on ne garde à l'écran
    // que ce qui bloque encore quelque chose.
    supabase
      .from("restaurant_fermetures")
      .select("*")
      .eq("restaurant_id", id)
      .gte("date_fin", new Date().toISOString().slice(0, 10))
      .order("date_debut"),
  ]);

  const restaurant = restaurantResult.data as Restaurant | null;
  if (!restaurant) {
    notFound();
  }

  const espaces = (espacesResult.data ?? []) as Espace[];
  const services = (servicesResult.data ?? []) as Service[];
  const fermetures = (fermeturesResult.data ?? []) as Fermeture[];
  const nomEspace = new Map(espaces.map((espace) => [espace.id, espace.nom]));

  const photosParEspace = new Map<string, RestaurantPhoto[]>();
  for (const photo of (photosResult.data ?? []) as RestaurantPhoto[]) {
    if (!photo.espace_id) continue;
    const liste = photosParEspace.get(photo.espace_id) ?? [];
    liste.push(photo);
    photosParEspace.set(photo.espace_id, liste);
  }
  const publique = restaurant as Restaurant & {
    slug_reservation?: string | null;
    logo_url?: string | null;
    mentions_legales?: string | null;
    site_publie?: boolean | null;
    // Colonnes de la migration 0038 : lues avec un défaut, pour qu'un
    // déploiement en avance sur la base n'efface pas cet écran.
    confirmation_auto?: boolean | null;
    confirmation_auto_delai_heures?: number | null;
    email_contact?: string | null;
  };
  const slug = publique.slug_reservation;
  const site = siteUrl();
  const capaciteTotale = espaces.reduce((t, e) => t + e.capacite, 0);
  const enLigne = Boolean(slug) && espaces.length > 0 && services.length > 0;
  // Le sommaire : cinq réglages sur une page longue, chacun à un clic.
  const sommaire = [
    { ancre: "espaces", titre: cfg.espacesTitre },
    { ancre: "services", titre: cfg.servicesTitre },
    { ancre: "confirmations", titre: cfg.confirmationsCourt },
    { ancre: "fermetures", titre: cfg.fermeturesTitre },
    { ancre: "page", titre: cfg.pageTitre },
  ];

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.reservations}
        title={cfg.titre(restaurant.nom)}
        backHref={`/dashboard/${id}/reservations`}
      />

      <p className="max-w-4xl text-sm text-zinc-600">{cfg.chapo}</p>

      {/* L'état de la page d'abord : c'est la question qu'on se pose en
          arrivant ici — mes clients peuvent-ils réserver ? */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <a href="#page" className="block">
          <Compteur
            valeur={enLigne ? cfg.pageEnLigneCourt : cfg.pageFermeeCourt}
            libelle={cfg.compteurPage}
            accent={!enLigne}
          />
        </a>
        <a href="#espaces" className="block">
          <Compteur
            valeur={espaces.length}
            libelle={cfg.compteurEspaces(espaces.length, capaciteTotale)}
            accent={espaces.length === 0}
          />
        </a>
        <a href="#services" className="block">
          <Compteur
            valeur={services.length}
            libelle={cfg.compteurServices(services.length)}
            accent={services.length === 0}
          />
        </a>
        <a href="#fermetures" className="block">
          <Compteur
            valeur={fermetures.length}
            libelle={cfg.compteurFermetures(fermetures.length)}
          />
        </a>
      </div>

      <nav className="flex flex-wrap gap-2">
        {sommaire.map((entree) => (
          <a
            key={entree.ancre}
            href={`#${entree.ancre}`}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-ink hover:text-ink"
          >
            {entree.titre}
          </a>
        ))}
      </nav>

      <section id="espaces" className="flex scroll-mt-8 flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-2xl text-ink">{cfg.espacesTitre}</h2>
          <p className="text-sm text-zinc-600">{cfg.espacesChapo}</p>
        </div>

        {espaces.length > 0 && (
          <ul className="grid items-start gap-3 2xl:grid-cols-2">
            {espaces.map((espace) => {
              const garantie = garantieLisible(espace, cfg, langue);
              return (
                <li
                  key={espace.id}
                  className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
                >
                  <EspaceModifiable
                    restaurantId={id}
                    espace={espace}
                    langue={langue}
                  >
                    <div className="flex min-w-0 flex-col gap-2">
                      <span className="font-serif text-xl text-ink">
                        {espace.nom}
                      </span>
                      {espace.description && (
                        <span className="text-sm text-zinc-500">
                          {espace.description}
                        </span>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Puce>{cfg.couverts(espace.capacite)}</Puce>
                        {espace.accepte_table && (
                          <Puce>{cfg.reservationsIndividuelles}</Puce>
                        )}
                        {espace.privatisation_minimum !== null && (
                          <Puce>
                            {cfg.privatisationDes(espace.privatisation_minimum)}
                          </Puce>
                        )}
                        {garantie && <Puce>{garantie}</Puce>}
                      </div>
                    </div>
                  </EspaceModifiable>
                  <Supprimer
                    id={espace.id}
                    restaurantId={id}
                    action={removeEspace}
                    libelle={cfg.supprimer}
                  />

                  <div className="w-full border-t border-zinc-100 pt-4">
                    <p className="mb-3 text-sm font-medium text-zinc-700">
                      {cfg.photosDeCetEspace}{" "}
                      <span className="font-normal text-zinc-400">
                        {cfg.photosChapo}
                      </span>
                    </p>
                    <PhotosEspace
                      restaurantId={id}
                      espaceId={espace.id}
                      photos={photosParEspace.get(espace.id) ?? []}
                      langue={langue}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <Depliable
          libelle={cfg.nouvelEspace}
          fermer={cfg.fermer}
          ouvertParDefaut={espaces.length === 0}
        >
          <EspaceForm restaurantId={id} langue={langue} />
        </Depliable>
      </section>

      {/* Les réglages qu'on fait une fois, deux par deux sur grand écran :
          empilés, la page demandait six écrans de défilement. */}
      <div className="grid items-start gap-8 xl:grid-cols-2">
        <section id="services" className="flex scroll-mt-8 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-serif text-2xl text-ink">
              {cfg.servicesTitre}
            </h2>
            <p className="text-sm text-zinc-500">{cfg.servicesChapo}</p>
          </div>

          {services.length > 0 && (
            <ul className="flex flex-col gap-3">
              {services.map((service) => (
                <li
                  key={service.id}
                  className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
                >
                  <ServiceModifiable
                    restaurantId={id}
                    service={service}
                    langue={langue}
                  />
                  <Supprimer
                    id={service.id}
                    restaurantId={id}
                    action={removeService}
                    libelle={cfg.supprimer}
                  />
                </li>
              ))}
            </ul>
          )}

          <Depliable
            libelle={cfg.nouveauService}
            fermer={cfg.fermer}
            ouvertParDefaut={services.length === 0}
          >
            <ServiceForm restaurantId={id} langue={langue} />
          </Depliable>
        </section>

        <section id="confirmations" className="flex scroll-mt-8 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-serif text-2xl text-ink">
              {cfg.confirmationsTitre}
            </h2>
            <p className="text-sm text-zinc-500">{cfg.confirmationsChapo}</p>
          </div>

          <ReglesConfirmation
            restaurantId={id}
            auto={publique.confirmation_auto ?? true}
            delaiHeures={publique.confirmation_auto_delai_heures ?? 24}
            emailContact={publique.email_contact ?? null}
            langue={langue}
          />
        </section>

        <section id="fermetures" className="flex scroll-mt-8 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-serif text-2xl text-ink">
              {cfg.fermeturesTitre}
            </h2>
            <p className="text-sm text-zinc-500">{cfg.fermeturesChapo}</p>
          </div>

          {fermetures.length > 0 && (
            <ul className="flex flex-col gap-3">
              {fermetures.map((fermeture) => (
                <li
                  key={fermeture.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm"
                >
                  <span className="flex flex-col">
                    <span className="font-medium text-zinc-900">
                      {formatPeriode(
                        fermeture.date_debut,
                        fermeture.date_fin,
                        cfg,
                        langue,
                      )}
                    </span>
                    <span className="text-sm text-zinc-500">
                      {fermeture.espace_id
                        ? cfg.espaceSeulement(
                            nomEspace.get(fermeture.espace_id) ??
                              cfg.espaceSupprime,
                          )
                        : cfg.toutEtablissement}
                      {fermeture.motif && ` · ${fermeture.motif}`}
                    </span>
                  </span>
                  <form action={supprimerFermeture}>
                    <input type="hidden" name="id" value={fermeture.id} />
                    <input type="hidden" name="restaurant_id" value={id} />
                    <button
                      type="submit"
                      className="text-sm font-medium text-zinc-500 hover:text-red-600"
                    >
                      {cfg.rouvrir}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          <Depliable libelle={cfg.nouvelleFermeture} fermer={cfg.fermer}>
            <FermetureForm
              restaurantId={id}
              espaces={espaces}
              langue={langue}
            />
          </Depliable>
        </section>

        <section id="page" className="flex scroll-mt-8 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-serif text-2xl text-ink">{cfg.pageTitre}</h2>
            <p className="text-sm text-zinc-500">{cfg.pageChapo}</p>
          </div>

          <IdentitePublique
            restaurantId={id}
            logoUrl={publique.logo_url ?? null}
            mentions={publique.mentions_legales ?? null}
            langue={langue}
          />

          <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
            {slug ? (
              <>
                {/* Une page déjà en ligne a une adresse : on ne la cache jamais,
                  même s'il manque une salle ou un service. C'est elle que le
                  restaurateur colle sur sa fiche Google. */}
                <a
                  href={`/reserver/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit break-all font-medium text-brand-orange hover:underline"
                >
                  {site}/reserver/{slug}
                </a>
                {espaces.length === 0 || services.length === 0 ? (
                  <p className="text-sm text-amber-700">
                    {cfg.adresseEnLigneMais(
                      espaces.length === 0 && services.length === 0
                        ? cfg.manqueSalleEtService
                        : espaces.length === 0
                          ? cfg.manqueSalle
                          : cfg.manqueService,
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-zinc-500">{cfg.elleEstEnLigne}</p>
                )}

                {/* La vitrine se règle sur la fiche de l'établissement, une
                  page qu'on n'ouvre presque jamais. C'est ici qu'on vient
                  chercher ses adresses publiques : autant qu'elle s'y
                  trouve aussi. */}
                <div className="mt-2 border-t border-zinc-100 pt-4">
                  {publique.site_publie ? (
                    <>
                      <p className="mb-1 text-sm font-medium text-zinc-900">
                        {cfg.siteVitrine}
                      </p>
                      <a
                        href={`/restaurant/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-fit break-all font-medium text-brand-orange hover:underline"
                      >
                        {site}/restaurant/{slug}
                      </a>
                    </>
                  ) : (
                    <p className="text-sm text-zinc-500">
                      {cfg.vitrineProposition}{" "}
                      <Link
                        href={`/dashboard/${id}/vitrine`}
                        className="font-medium text-brand-orange hover:underline"
                      >
                        {cfg.laPageSiteVitrine}
                      </Link>
                      .
                    </p>
                  )}
                </div>
              </>
            ) : espaces.length === 0 || services.length === 0 ? (
              <p className="text-sm text-zinc-500">
                {cfg.ajouteEspaceEtService}
              </p>
            ) : (
              <form
                action={activerPageReservation}
                className="flex flex-col gap-3"
              >
                <input type="hidden" name="restaurant_id" value={id} />
                <p className="text-sm text-zinc-500">{cfg.pasEncoreOuverte}</p>
                <button
                  type="submit"
                  className="w-fit rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
                >
                  {cfg.ouvrirMaPage}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
