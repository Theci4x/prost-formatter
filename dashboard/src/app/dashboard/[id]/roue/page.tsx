import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { LotForm, LotModifiable } from "@/components/roue/LotForm";
import { ReglagesRoue } from "@/components/roue/ReglagesRoue";
import { basculerRoue, supprimerLot } from "./actions";
import {
  LOTS_MAX,
  ROUE_PAR_DEFAUT,
  partEnPourcent,
  type LotRoue,
  type Roue,
} from "@/types/roue";
import type { Restaurant } from "@/types/restaurant";
import { siteUrl } from "@/lib/site-url";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";

function Puce({
  children,
  ton = "neutre",
}: {
  children: React.ReactNode;
  ton?: "neutre" | "chaud" | "eteint";
}) {
  const tons = {
    neutre: "bg-zinc-100 text-zinc-600",
    chaud: "bg-brand-orange-soft text-brand-navy",
    eteint: "bg-zinc-100 text-zinc-400 line-through",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${tons[ton]}`}
    >
      {children}
    </span>
  );
}

export default async function RouePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");
  await exigerModule(id, "visibilite");
  const supabase = await createClient();

  const [restaurantResult, roueResult, lotsResult, partiesResult] =
    await Promise.all([
      supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("restaurant_roue")
        .select("*")
        .eq("restaurant_id", id)
        .maybeSingle(),
      supabase
        .from("restaurant_roue_lots")
        .select("*")
        .eq("restaurant_id", id)
        .order("ordre")
        .order("created_at"),
      // De quoi décompter les stocks. Les parties se comptent par lot ;
      // à l'échelle d'un restaurant, les remonter coûte moins cher qu'une
      // vue à maintenir.
      supabase
        .from("restaurant_roue_parties")
        .select("lot_id, gagnant, utilise_le")
        .eq("restaurant_id", id),
    ]);

  const restaurant = restaurantResult.data as Restaurant | null;
  if (!restaurant) notFound();

  const roue = (roueResult.data as Roue | null) ?? {
    ...ROUE_PAR_DEFAUT,
    restaurant_id: id,
  };
  const lots = (lotsResult.data ?? []) as LotRoue[];

  const parties = (partiesResult.data ?? []) as {
    lot_id: string | null;
    gagnant: boolean;
    utilise_le: string | null;
  }[];
  const distribues: Record<string, number> = {};
  for (const partie of parties) {
    if (!partie.lot_id) continue;
    distribues[partie.lot_id] = (distribues[partie.lot_id] ?? 0) + 1;
  }
  const retires = parties.filter((p) => p.utilise_le !== null).length;

  const slug = (restaurant as Restaurant & { slug_reservation?: string | null })
    .slug_reservation;
  const gagnantes = lots.filter((lot) => lot.gagnant && lot.poids > 0).length;
  const prete = lots.length >= 2 && gagnantes >= 1;

  return (
    <div className="flex flex-1 flex-col gap-10 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.roue}
        title={`Roue de la fortune — ${restaurant.nom}`}
        backHref="/dashboard"
      />

      <p className="max-w-2xl text-sm text-zinc-500">
        Le client scanne le totem, on lui ouvre ta fiche Google, et au retour il
        tourne la roue. Son lot part par e-mail et se présente à la visite
        suivante — c&apos;est une raison de revenir autant qu&apos;un cadeau.
      </p>

      {/* Ce que le restaurateur doit savoir avant d'allumer. Il prend le
          risque sur sa fiche : il doit le lire, une fois, en clair. */}
      <div className="flex max-w-2xl flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm font-semibold text-amber-900">
          À lire avant d&apos;allumer
        </p>
        <p className="text-sm leading-relaxed text-amber-900">
          Google interdit d&apos;offrir quoi que ce soit en échange d&apos;un
          avis, quelle que soit la note. En cas de détection, les avis concernés
          sont supprimés — y compris ceux que tu as obtenus autrement — et la
          fiche peut être suspendue. Klarr ne trie jamais sur la note et ne
          prétend pas vérifier qu&apos;un avis a été écrit : personne ne le peut
          techniquement. La roue tourne pour tout le monde, une étoile comme
          cinq.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-zinc-900">Les cases</h2>
          <p className="text-sm text-zinc-500">
            Ce que la roue peut donner, et à quelle fréquence. Deux cases
            minimum, dont une gagnante.
          </p>
        </div>

        {lots.length > 0 && (
          <ul className="flex flex-col gap-3">
            {lots.map((lot) => {
              const part = partEnPourcent(lot, lots, distribues);
              const donnes = distribues[lot.id] ?? 0;
              const epuise = lot.stock !== null && donnes >= lot.stock;
              return (
                <li
                  key={lot.id}
                  className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
                >
                  <LotModifiable restaurantId={id} lot={lot}>
                    <div className="flex min-w-0 flex-col gap-2">
                      <span className="font-medium text-zinc-900">
                        {lot.libelle}
                      </span>
                      {lot.precision_interne && (
                        <span className="text-sm text-zinc-500">
                          {lot.precision_interne}
                        </span>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {lot.gagnant ? (
                          <Puce ton="chaud">Gagnante</Puce>
                        ) : (
                          <Puce>Perdante</Puce>
                        )}
                        {epuise ? (
                          <Puce ton="eteint">Stock épuisé</Puce>
                        ) : lot.poids === 0 ? (
                          <Puce ton="eteint">Retirée du tirage</Puce>
                        ) : (
                          <Puce>
                            {part.toFixed(part < 10 ? 1 : 0).replace(".", ",")}{" "}
                            % des parties
                          </Puce>
                        )}
                        {lot.stock !== null && (
                          <Puce>
                            {donnes} sur {lot.stock} distribué
                            {donnes > 1 ? "s" : ""}
                          </Puce>
                        )}
                      </div>
                    </div>
                  </LotModifiable>

                  <form action={supprimerLot}>
                    <input type="hidden" name="id" value={lot.id} />
                    <input type="hidden" name="restaurant_id" value={id} />
                    <button
                      type="submit"
                      className="text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}

        {lots.length < LOTS_MAX ? (
          <LotForm restaurantId={id} />
        ) : (
          <p className="text-sm text-zinc-500">
            Douze cases, c&apos;est le maximum : au-delà, la roue devient
            illisible sur un téléphone.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-zinc-900">
            Les réglages
          </h2>
          <p className="text-sm text-zinc-500">
            Ce que le client lit, et combien de temps son lot vaut.
          </p>
        </div>
        <ReglagesRoue restaurantId={id} roue={roue} />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-zinc-900">
            Mise en service
          </h2>
          <p className="text-sm text-zinc-500">
            Le seul réglage que tes clients voient. Tant qu&apos;il est éteint,
            le totem se comporte comme aujourd&apos;hui.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
          {roue.active ? (
            <>
              <p className="text-sm font-medium text-emerald-700">
                La roue tourne.
              </p>
              {slug && (
                <a
                  href={`/avis/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit break-all font-medium text-brand-orange hover:underline"
                >
                  {siteUrl()}/avis/{slug}
                </a>
              )}
              <form action={basculerRoue} className="pt-1">
                <input type="hidden" name="restaurant_id" value={id} />
                <input type="hidden" name="active" value="0" />
                <button
                  type="submit"
                  className="text-sm font-medium text-zinc-500 hover:text-red-600"
                >
                  Éteindre la roue
                </button>
              </form>
            </>
          ) : prete ? (
            <form action={basculerRoue} className="flex flex-col gap-3">
              <input type="hidden" name="restaurant_id" value={id} />
              <input type="hidden" name="active" value="1" />
              <p className="text-sm text-zinc-500">
                Tes cases sont prêtes. En allumant, la roue apparaît sur la page
                du totem.
              </p>
              <button
                type="submit"
                className="w-fit rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
              >
                Allumer la roue
              </button>
            </form>
          ) : (
            <p className="text-sm text-zinc-500">
              Il faut au moins deux cases, dont une gagnante, pour que la roue
              ait un sens. Ajoute-les plus haut.
            </p>
          )}

          {parties.length > 0 && (
            <p className="border-t border-zinc-100 pt-3 text-sm text-zinc-500">
              {parties.length} partie{parties.length > 1 ? "s" : ""} jouée
              {parties.length > 1 ? "s" : ""}, {retires} lot
              {retires > 1 ? "s" : ""} retiré{retires > 1 ? "s" : ""} en salle.{" "}
              <Link
                href={`/dashboard/${id}/roue/retirer`}
                className="font-medium text-brand-orange hover:underline"
              >
                Retirer un lot
              </Link>
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
