import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Compteur, TitreSection } from "@/components/dashboard/Compteur";
import { Depliable } from "@/components/dashboard/Depliable";
import { BoutonCopier } from "@/components/dashboard/BoutonCopier";
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
import { qrSvgDe } from "@/lib/menu/qr";
import { langueUtilisateur } from "@/lib/i18n/langue";
import { localeDe } from "@/lib/i18n/seo";
import { COMMUN, traducteur } from "@/lib/i18n/t";
import { ROUE } from "@/lib/i18n/pages/roue";

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
  const langue = await langueUtilisateur();
  const t = traducteur(langue, ROUE, COMMUN);

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
  const gagnees = parties.filter((p) => p.gagnant).length;

  const slug = (restaurant as Restaurant & { slug_reservation?: string | null })
    .slug_reservation;
  const gagnantes = lots.filter((lot) => lot.gagnant && lot.poids > 0).length;
  const prete = lots.length >= 2 && gagnantes >= 1;

  // Le jeu a sa propre adresse, distincte du totem : ce ne sont pas les
  // mêmes gestes. Le totem demande un retour à quelqu'un qui part, le
  // panneau du jeu attire quelqu'un qui est encore à table.
  const adresseJeu = slug ? `${siteUrl()}/jeu/${slug}` : null;
  const qr = adresseJeu ? await qrSvgDe(adresseJeu) : null;

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.roue}
        title={t("Roue de la fortune — {nom}", { nom: restaurant.nom })}
        backHref="/dashboard"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-4xl text-sm text-zinc-600">
          {t(
            "Un panneau sur la table, avec son propre QR code : le client scanne, tourne la roue, et son lot part par e-mail pour la visite suivante — c'est une raison de revenir autant qu'un cadeau. Le totem des avis reste à part, il ne change pas.",
          )}
        </p>
        {/* Pendant le service, c'est le seul geste qu'on vient faire ici :
          il passe en tête dès que la roue tourne. */}
        {roue.active && (
          <Link
            href={`/dashboard/${id}/roue/retirer`}
            className="rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
          >
            {t("Retirer un lot")}
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Compteur
          valeur={roue.active ? t("Allumée") : t("Éteinte")}
          libelle={
            roue.active
              ? t("la roue tourne en salle")
              : t("rien ne change pour tes clients")
          }
          accent={!roue.active && prete}
        />
        <Compteur
          valeur={parties.length}
          libelle={t(parties.length > 1 ? "parties jouées" : "partie jouée")}
        />
        <Compteur
          valeur={gagnees}
          libelle={t(gagnees > 1 ? "lots gagnés" : "lot gagné")}
        />
        <Compteur
          valeur={retires}
          libelle={t(retires > 1 ? "retirés en salle" : "retiré en salle")}
        />
      </div>

      {/* Ce que le restaurateur doit savoir avant d'allumer. Il prend le
          risque sur sa fiche : il doit le lire, une fois, en clair. */}
      <div className="flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm font-semibold text-amber-900">
          {t("À lire avant d'allumer")}
        </p>
        <p className="text-sm leading-relaxed text-amber-900">
          {t(
            "Google interdit d'offrir quoi que ce soit en échange d'un avis, quelle que soit la note. En cas de détection, les avis concernés sont supprimés — y compris ceux que tu as obtenus autrement — et la fiche peut être suspendue. Klarr ne trie jamais sur la note et ne prétend pas vérifier qu'un avis a été écrit : personne ne le peut techniquement. La roue tourne pour tout le monde, une étoile comme cinq.",
          )}
        </p>
      </div>

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <TitreSection>{t("Les cases")}</TitreSection>
            <p className="text-sm text-zinc-600">
              {t(
                "Ce que la roue peut donner, et à quelle fréquence. Deux cases minimum, dont une gagnante.",
              )}
            </p>
          </div>

          {lots.length > 0 && (
            <ul className="grid items-start gap-3 2xl:grid-cols-2">
              {lots.map((lot) => {
                const part = partEnPourcent(lot, lots, distribues);
                const donnes = distribues[lot.id] ?? 0;
                const epuise = lot.stock !== null && donnes >= lot.stock;
                return (
                  <li
                    key={lot.id}
                    className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
                  >
                    <LotModifiable restaurantId={id} lot={lot} langue={langue}>
                      <div className="flex min-w-0 flex-col gap-2">
                        <span className="font-serif text-xl text-ink">
                          {lot.libelle}
                        </span>
                        {lot.precision_interne && (
                          <span className="text-sm text-zinc-500">
                            {lot.precision_interne}
                          </span>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {lot.gagnant ? (
                            <Puce ton="chaud">{t("Gagnante")}</Puce>
                          ) : (
                            <Puce>{t("Perdante")}</Puce>
                          )}
                          {epuise ? (
                            <Puce ton="eteint">{t("Stock épuisé")}</Puce>
                          ) : lot.poids === 0 ? (
                            <Puce ton="eteint">{t("Retirée du tirage")}</Puce>
                          ) : (
                            <Puce>
                              {t("{part} % des parties", {
                                part: part.toLocaleString(localeDe(langue), {
                                  maximumFractionDigits: part < 10 ? 1 : 0,
                                }),
                              })}
                            </Puce>
                          )}
                          {lot.stock !== null && (
                            <Puce>
                              {t(
                                donnes > 1
                                  ? "{n} sur {stock} distribués"
                                  : "{n} sur {stock} distribué",
                                { n: donnes, stock: lot.stock },
                              )}
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
                        {t("Supprimer")}
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          )}

          {lots.length < LOTS_MAX ? (
            <Depliable
              libelle={t("Ajouter une case")}
              fermer={t("Fermer")}
              ouvertParDefaut={lots.length < 2}
            >
              <LotForm restaurantId={id} langue={langue} />
            </Depliable>
          ) : (
            <p className="text-sm text-zinc-500">
              {t(
                "Douze cases, c'est le maximum : au-delà, la roue devient illisible sur un téléphone.",
              )}
            </p>
          )}
        </section>

        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <TitreSection>{t("Mise en service")}</TitreSection>
              <p className="text-sm text-zinc-500">
                {t(
                  "Le seul réglage que tes clients voient. Tant qu'il est éteint, le totem se comporte comme aujourd'hui.",
                )}
              </p>
            </div>

            <div
              className={`flex flex-col gap-3 rounded-2xl border p-6 shadow-sm ${
                roue.active
                  ? "border-emerald-200 bg-emerald-50/60"
                  : "border-zinc-200/70 bg-white"
              }`}
            >
              {roue.active ? (
                <>
                  <p className="flex items-center gap-3 font-serif text-3xl text-ink">
                    <span
                      aria-hidden="true"
                      className="h-3 w-3 rounded-full bg-emerald-500"
                    />
                    {t("La roue tourne")}
                  </p>
                  {adresseJeu && (
                    <>
                      <p className="text-sm text-zinc-500">
                        {t(
                          "L'adresse à mettre sur le panneau du jeu. Ce n'est pas celle du totem des avis.",
                        )}
                      </p>
                      <a
                        href={`/jeu/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-fit break-all font-medium text-brand-orange-dark hover:underline"
                      >
                        {adresseJeu}
                      </a>
                      <div className="w-fit">
                        <BoutonCopier
                          texte={adresseJeu}
                          libelle={t("Copier l'adresse")}
                          copie={t("Adresse copiée ✓")}
                        />
                      </div>
                      {/* Le QR en vectoriel : un panneau s'imprime, et un QR en
                      pixels grossis ne se scanne plus. */}
                      {qr && (
                        <div
                          className="w-44 rounded-xl border border-zinc-200 bg-white p-2 [&>svg]:h-auto [&>svg]:w-full"
                          dangerouslySetInnerHTML={{ __html: qr }}
                        />
                      )}
                      <Link
                        href={`/dashboard/${id}/roue/panneau`}
                        className="w-fit rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy active:border-brand-navy"
                      >
                        {t("Le panneau à imprimer, avec les avis")}
                      </Link>
                    </>
                  )}
                  <form action={basculerRoue} className="pt-1">
                    <input type="hidden" name="restaurant_id" value={id} />
                    <input type="hidden" name="active" value="0" />
                    <button
                      type="submit"
                      className="text-sm font-medium text-zinc-500 hover:text-red-600"
                    >
                      {t("Éteindre la roue")}
                    </button>
                  </form>
                </>
              ) : prete ? (
                <form action={basculerRoue} className="flex flex-col gap-3">
                  <input type="hidden" name="restaurant_id" value={id} />
                  <input type="hidden" name="active" value="1" />
                  <p className="text-sm text-zinc-500">
                    {t(
                      "Tes cases sont prêtes. En allumant, la roue apparaît sur la page du totem.",
                    )}
                  </p>
                  <button
                    type="submit"
                    className="w-fit rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
                  >
                    {t("Allumer la roue")}
                  </button>
                </form>
              ) : (
                <p className="text-sm text-zinc-500">
                  {t(
                    "Il faut au moins deux cases, dont une gagnante, pour que la roue ait un sens. Ajoute-les dans « Les cases ».",
                  )}
                </p>
              )}

              {parties.length > 0 && (
                <p className="border-t border-zinc-100 pt-3 text-sm text-zinc-500">
                  {t(
                    parties.length > 1
                      ? "{n} parties jouées"
                      : "{n} partie jouée",
                    { n: parties.length },
                  )}
                  {t(
                    retires > 1
                      ? ", {n} lots retirés en salle."
                      : ", {n} lot retiré en salle.",
                    { n: retires },
                  )}{" "}
                  <Link
                    href={`/dashboard/${id}/roue/retirer`}
                    className="font-medium text-brand-orange-dark hover:underline"
                  >
                    {t("Retirer un lot")}
                  </Link>
                </p>
              )}
            </div>
          </section>
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <TitreSection>{t("Les réglages")}</TitreSection>
              <p className="text-sm text-zinc-500">
                {t("Ce que le client lit, et combien de temps son lot vaut.")}
              </p>
            </div>
            <ReglagesRoue restaurantId={id} roue={roue} langue={langue} />
          </section>
        </div>
      </div>
    </div>
  );
}
