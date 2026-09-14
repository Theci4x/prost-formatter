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
import { TraduireCarte } from "@/components/menu/TraduireCarte";
import { carteOrganisee, formatPrix } from "@/lib/menu/carte";
import { aTraduire, traductionCaduque } from "@/lib/menu/traduction";
import { qrSvg, urlCarte } from "@/lib/menu/qr";
import { exiger } from "@/lib/equipe/roles";
import type { MenuItem } from "@/types/menu";
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

  const supabase = await createClient();
  const [restaurantResult, itemsResult] = await Promise.all([
    supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("restaurant_menu_items")
      .select("*")
      .eq("restaurant_id", id),
  ]);

  const restaurant = restaurantResult.data as Restaurant | null;
  if (!restaurant) notFound();

  const items = (itemsResult.data ?? []) as MenuItem[];
  const blocs = carteOrganisee(items);
  const categories = blocs.map((bloc) => bloc.categorie);
  const publique = restaurant.carte_publique === true;
  const visibles = items.filter((plat) => plat.actif).length;
  const slug = restaurant.slug_reservation;
  const restantATraduire = aTraduire(items, "en").length;
  // Le QR n'est calculé que s'il mène quelque part.
  const qr = publique && slug ? await qrSvg(slug) : null;

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.menu}
        title={`Carte — ${restaurant.nom}`}
      />

      <p className="max-w-2xl text-sm text-zinc-500">
        Ta carte s&apos;affiche sur ta page de réservation, sous les
        disponibilités : le client sait ce qu&apos;il vient manger avant de
        demander une table. Les catégories apparaissent dans l&apos;ordre où
        tu les ranges ici, pas par ordre alphabétique. Le carré à gauche de
        chaque plat ajoute sa photo : un carpaccio photographié se commande
        plus qu&apos;un carpaccio décrit.
      </p>

      {/* Publier est un choix explicite : une carte saisie pour essayer n'a
          rien à faire sur une adresse publique. */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-900">
            {publique
              ? "Ta carte est visible par tes clients."
              : "Ta carte n'est visible que par toi."}
          </span>
          <span className="text-sm text-zinc-500">
            {visibles} plat{visibles > 1 ? "s" : ""} à la carte
            {items.length > visibles &&
              ` · ${items.length - visibles} décroché${
                items.length - visibles > 1 ? "s" : ""
              }`}
            {publique && restaurant.slug_reservation && (
              <>
                {" · "}
                <Link
                  href={`/reserver/${restaurant.slug_reservation}`}
                  className="text-brand-navy underline-offset-2 hover:underline"
                >
                  voir ma page
                </Link>
              </>
            )}
          </span>
        </div>
        <Action
          action={basculerCartePublique}
          champs={{ restaurant_id: id, publique: publique ? "0" : "1" }}
          libelle={publique ? "Retirer la carte" : "Publier la carte"}
          classe={
            publique
              ? "rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
              : "rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
          }
        >
          {publique ? "Retirer de ma page" : "Publier sur ma page"}
        </Action>
      </div>

      {items.length > 0 && (
        <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-900">
              Ta carte en anglais
            </span>
            <span className="max-w-md text-sm text-zinc-500">
              Le client choisit sa langue en haut de ta carte. Un plat que tu
              corriges en français repasse en français tant qu&apos;il
              n&apos;est pas retraduit — mieux vaut ça qu&apos;une carte
              anglaise qui ment sur ce qu&apos;il y a dans l&apos;assiette.
            </span>
          </div>
          <TraduireCarte restaurantId={id} aTraduire={restantATraduire} />
        </div>
      )}

      {/* Le QR : ce qu'on pose sur les tables et au comptoir. */}
      {qr && slug ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
          <div
            className="h-36 w-36 shrink-0 [&>svg]:h-full [&>svg]:w-full"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: qr }}
          />
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-zinc-900">
                Le QR code de ta carte
              </span>
              <span className="text-sm text-zinc-500">
                Imprime-le et pose-le sur tes tables : le client scanne et lit
                ta carte sur son téléphone, sans rien installer.
              </span>
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
                Télécharger (PNG)
              </a>
              <a
                href={`/api/carte/${slug}/qr?format=svg`}
                className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
              >
                Version imprimeur (SVG)
              </a>
            </div>
          </div>
        </div>
      ) : (
        items.length > 0 && (
          <p className="rounded-2xl border border-zinc-200/70 bg-white p-5 text-sm text-zinc-500 shadow-sm">
            {slug
              ? "Publie ta carte pour obtenir son QR code : un QR posé sur trente tables qui mène à une page vide est pire que pas de QR du tout."
              : "Ouvre d'abord ta page de réservation dans la configuration : c'est elle qui donne l'adresse que le QR code encodera."}
          </p>
        )
      )}

      <PlatForm restaurantId={id} categories={categories} />

      {blocs.length === 0 ? (
        <p className="rounded-2xl border border-zinc-200/70 bg-white p-5 text-sm text-zinc-500 shadow-sm">
          Aucun plat pour l&apos;instant. Commence par tes entrées : les
          catégories s&apos;afficheront dans l&apos;ordre où tu les ajoutes.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {blocs.map((bloc, rang) => (
            <section
              key={bloc.categorie}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-navy">
                  {bloc.categorie}
                </h2>
                <div className="flex items-center gap-1">
                  {rang > 0 && (
                    <Action
                      action={monterCategorie}
                      champs={{
                        restaurant_id: id,
                        categorie: bloc.categorie,
                        sens: "haut",
                      }}
                      libelle={`Monter ${bloc.categorie}`}
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
                      libelle={`Descendre ${bloc.categorie}`}
                    >
                      ↓
                    </Action>
                  )}
                </div>
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
                    />
                    <span
                      className={`flex min-w-0 flex-1 flex-col ${
                        plat.actif ? "" : "opacity-50"
                      }`}
                    >
                      <span className="text-sm font-medium text-zinc-900">
                        {plat.nom}
                        {!plat.actif && (
                          <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
                            décroché
                          </span>
                        )}
                        {traductionCaduque(plat, "en") && (
                          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                            anglais à refaire
                          </span>
                        )}
                      </span>
                      {plat.description && (
                        <span className="text-sm text-zinc-500">
                          {plat.description}
                        </span>
                      )}
                    </span>

                    <span className="flex items-center gap-3">
                      <span className="text-sm font-medium tabular-nums text-zinc-700">
                        {plat.prix_centimes === null
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
                            libelle={`Monter ${plat.nom}`}
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
                            libelle={`Descendre ${plat.nom}`}
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
                            ? `Décrocher ${plat.nom}`
                            : `Remettre ${plat.nom}`
                        }
                      >
                        {plat.actif ? "Décrocher" : "Remettre"}
                      </Action>
                      <Action
                        action={supprimerPlat}
                        champs={{ restaurant_id: id, id: plat.id }}
                        libelle={`Supprimer ${plat.nom}`}
                        classe="text-xs text-zinc-400 transition-colors hover:text-red-600"
                      >
                        Supprimer
                      </Action>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
