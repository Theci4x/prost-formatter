import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { carteOrganisee, carteVisible } from "@/lib/menu/carte";
import {
  langueDisponible,
  lireLangue,
  platAffiche,
} from "@/lib/menu/traduction";
import { cartePubliee } from "@/lib/menu/publication";
import { chargerAcces } from "@/lib/abonnement/acces";
import { SignatureKlarr } from "@/components/brand/SignatureKlarr";
import { ALLERGENES, libelleAllergene } from "@/types/allergenes";
import { ETIQUETTES, t } from "@/lib/menu/etiquettes";
import {
  MENTION_ALLERGENES,
  MENTION_PRIX,
  TITRE_ALLERGENES,
} from "@/lib/menu/mentions";

/**
 * Le tableau des allergènes — ce qu'un restaurant appelle « le classeur ».
 *
 * Il ne se saisit pas : il se déduit de la carte, plat par plat, et il est
 * donc juste par construction. C'est tout l'intérêt. Un classeur tenu à
 * part est faux au troisième changement de carte, et c'est toujours le
 * jour d'un contrôle — ou d'un incident — qu'on s'en aperçoit.
 *
 * Pourquoi une page à part alors que la carte affiche déjà les allergènes
 * sous chaque plat : parce que les deux lecteurs ne cherchent pas la même
 * chose. Le client qui a une allergie veut balayer une colonne et voir
 * d'un coup ce qu'il peut manger ; l'agent de la DDPP veut le document.
 * Servir la carte à l'un et le tableau à l'autre coûte une page.
 *
 * Un plat non déclaré y figure quand même, marqué comme tel. Le faire
 * disparaître donnerait un document complet à l'œil et faux en fait —
 * exactement l'inverse de ce qu'on veut d'un support qui engage la santé
 * de quelqu'un.
 */

type Params = { slug: string };
type Query = { lang?: string };

async function charger(slug: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("restaurants")
    .select("id, nom, adresse, slug_reservation")
    .eq("slug_reservation", slug)
    .maybeSingle();

  const restaurant = data as {
    id: string;
    nom: string;
    adresse: string | null;
    slug_reservation: string;
  } | null;
  if (!restaurant) return null;

  // Les mêmes conditions que la carte : ce tableau en est une vue, il ne
  // peut pas être public quand elle ne l'est pas.
  const carte = await cartePubliee(supabase, restaurant.id);
  if (!carte.publiee) return null;
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
  const charge = await charger(slug);
  if (!charge) return { title: "Allergènes" };

  return {
    title: `Allergènes — ${charge.restaurant.nom}`,
    description: `La liste des allergènes plat par plat, à la carte de ${charge.restaurant.nom}.`,
    alternates: { canonical: `/carte/${slug}/allergenes` },
    robots: { index: true, follow: true },
  };
}

export default async function AllergenesPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Query>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const charge = await charger(slug);
  if (!charge) notFound();

  const { restaurant, items } = charge;
  const visibles = carteVisible(items);
  // Même règle que sur la carte : une langue n'est offerte que si la
  // carte y est réellement traduite.
  const demandee = lireLangue(query.lang);
  const langue =
    demandee !== "fr" && langueDisponible(items, demandee) ? demandee : "fr";
  const blocs = carteOrganisee(visibles);

  // Rien de déclaré nulle part : on le dit franchement plutôt que de
  // dresser un tableau dont chaque ligne serait « demandez-nous ».
  const rienDeclare = visibles.every((plat) => plat.allergenes === null);

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <header className="border-b border-zinc-200/70 bg-white px-5 py-4">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
          <span className="text-base font-semibold text-zinc-900">
            {restaurant.nom}
          </span>
          <Link
            href={`/carte/${slug}${langue === "fr" ? "" : `?lang=${langue}`}`}
            className="text-sm text-brand-navy underline-offset-2 hover:underline"
          >
            {t(ETIQUETTES.retourCarte, langue)}
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-5 py-8">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-4xl text-ink">
            {TITRE_ALLERGENES[langue]}
          </h1>
          {restaurant.adresse && (
            <p className="text-sm text-zinc-500">{restaurant.adresse}</p>
          )}
          <p className="max-w-2xl text-sm text-zinc-600">
            {MENTION_ALLERGENES[langue]}
          </p>
        </div>

        {rienDeclare ? (
          <p className="rounded-2xl border border-zinc-200/70 bg-white p-5 text-sm text-zinc-500 shadow-sm">
            {t(ETIQUETTES.tableauEnCours, langue)}
          </p>
        ) : (
          blocs.map((bloc) => {
            const titre =
              platAffiche(bloc.plats[0], langue).categorie ?? bloc.categorie;
            return (
              <section key={bloc.categorie} className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-navy">
                  {titre}
                </h2>
                <ul className="flex flex-col divide-y divide-zinc-100 rounded-2xl border border-zinc-200/70 bg-white px-5 shadow-sm">
                  {bloc.plats.map((plat) => {
                    const affiche = platAffiche(plat, langue);
                    const declares = plat.allergenes;
                    return (
                      <li
                        key={plat.id}
                        className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3"
                      >
                        <span className="text-sm font-medium text-zinc-900">
                          {affiche.nom}
                        </span>
                        {declares === null ? (
                          <span className="text-sm text-amber-700">
                            {t(ETIQUETTES.demandezNous, langue)}
                          </span>
                        ) : declares.length === 0 ? (
                          <span className="text-sm text-zinc-500">
                            {t(ETIQUETTES.aucunDesQuatorze, langue)}
                          </span>
                        ) : (
                          <span className="flex flex-wrap gap-1.5">
                            {ALLERGENES.filter((a) =>
                              declares.includes(a.code),
                            ).map((a) => (
                              <span
                                key={a.code}
                                className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700"
                              >
                                {libelleAllergene(a.code, langue)}
                              </span>
                            ))}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })
        )}

        <div className="flex flex-col gap-2 border-t border-zinc-200/70 pt-5 text-xs text-zinc-400">
          <p>{MENTION_PRIX[langue]}</p>
          <p>{t(ETIQUETTES.sourceAnnexe, langue)}</p>
        </div>
      </main>

      <footer className="border-t border-zinc-200/70 px-5 py-6">
        <SignatureKlarr
          texte={t(ETIQUETTES.signature, langue)}
          className="mx-auto max-w-3xl"
        />
      </footer>
    </div>
  );
}
