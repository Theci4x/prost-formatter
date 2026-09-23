import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  addKeyword,
  removeKeyword,
  analyzeKeywords,
  type Analyse,
} from "./actions";
import { KeywordAnalysis } from "@/components/seo/KeywordAnalysis";
import {
  AvantLesChiffres,
  SourceSuivie,
  TableauRequetes,
} from "@/components/seo/RequetesReelles";
import { Kpis } from "@/components/seo/Kpis";
import { GraphiqueRequetes } from "@/components/seo/GraphiqueRequetes";
import { GraphiquePositions } from "@/components/seo/GraphiquePositions";
import { EtatVide } from "@/components/seo/EtatVide";
import { etatSearchConsole } from "@/lib/google/requetes-restaurant";
import { aDessiner, synthese } from "@/lib/seo/synthese";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { Compteur } from "@/components/dashboard/Compteur";
import type { Restaurant } from "@/types/restaurant";
import type { RestaurantKeyword } from "@/types/keyword";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";

const SOMMAIRE = [
  { ancre: "constat", titre: "Ce que les gens tapent" },
  { ancre: "analyse", titre: "Analyse Klarr Tool" },
  { ancre: "mots-cles", titre: "Mots-clés ciblés" },
];

/** « 22 sept. » : la date d'une analyse, assez courte pour une tuile. */
function jourCourt(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Paris",
  });
}

/**
 * La page SEO d'un établissement.
 *
 * Trois étages, du constat au projet. En haut, ce que Search Console a
 * mesuré : les chiffres, puis deux graphiques qui se lisent comme un seul
 * tableau, puis le tableau lui-même, replié. C'est la seule partie qui ne
 * soit pas une supposition, et elle passe en premier pour ça.
 *
 * En bas, à gauche, l'analyse — longue, elle a besoin de largeur. À
 * droite, les mots-clés ciblés, qui sont son matériau : on les voit en
 * lisant ce qu'elle en dit, et on les corrige sans quitter la page.
 */
export default async function SeoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");
  await exigerModule(id, "visibilite");

  const supabase = await createClient();

  const { data: restaurantData } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const restaurant = restaurantData as Restaurant | null;
  if (!restaurant) {
    notFound();
  }

  const { data: keywordsData } = await supabase
    .from("restaurant_keywords")
    .select("*")
    .eq("restaurant_id", id)
    .order("created_at", { ascending: false });

  const keywords = (keywordsData ?? []) as RestaurantKeyword[];

  /**
   * La dernière analyse, telle qu'elle a été rangée.
   *
   * Les trois colonnes vont ensemble : une analyse sans sa date ne dit
   * pas si elle est encore d'actualité, et sans ses mots-clés l'écran ne
   * peut pas dire ce qui a bougé depuis. On ne la sert donc que
   * complète — une ligne à moitié remplie vaut une ligne absente.
   */
  const rangee = restaurant as Restaurant & {
    seo_analyse?: string | null;
    seo_analyse_le?: string | null;
    seo_analyse_mots_cles?: string[] | null;
    search_console_site?: string | null;
  };
  const precedente: Analyse | null =
    rangee.seo_analyse && rangee.seo_analyse_le
      ? {
          analysis: rangee.seo_analyse,
          analyseLe: rangee.seo_analyse_le,
          motsCles: rangee.seo_analyse_mots_cles ?? [],
        }
      : null;

  const mesure = await etatSearchConsole(
    supabase,
    id,
    rangee.search_console_site ?? null,
    restaurant.slug_reservation,
  );

  const aDesChiffres =
    mesure.connecte && !mesure.erreur && mesure.site !== null;
  const dessin = aDessiner(mesure.requetes);
  const avecTuiles = aDesChiffres && mesure.requetes.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-3">
        <PageHeader
          icon={dashboardIcons.seo}
          title={`SEO — ${restaurant.nom}`}
        />
        <p className="max-w-4xl text-sm text-zinc-600">
          Ce qui te fait sortir sur Google quand quelqu&apos;un cherche où
          manger. En haut, ce que Search Console a vraiment mesuré ; en dessous,
          l&apos;analyse de Klarr Tool et les mots-clés sur lesquels tu veux
          sortir.
        </p>
      </div>

      {/* Sans chiffres Google, les tuiles de Search Console ne s'affichent
          pas : ces trois-là disent où en est la page, et ce qui manque. */}
      {!avecTuiles && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <Compteur
            valeur={keywords.length}
            libelle={`mot${keywords.length > 1 ? "s" : ""}-clé${keywords.length > 1 ? "s" : ""} ciblé${keywords.length > 1 ? "s" : ""}`}
            accent={keywords.length === 0}
          />
          <Compteur
            valeur={precedente ? jourCourt(precedente.analyseLe) : "—"}
            libelle={precedente ? "dernière analyse" : "aucune analyse"}
            accent={!precedente}
          />
          <Compteur
            valeur={aDesChiffres ? "Relié" : "—"}
            libelle={
              aDesChiffres ? "Search Console" : "Search Console à relier"
            }
            accent={!aDesChiffres}
          />
        </div>
      )}

      <nav className="flex flex-wrap gap-2">
        {SOMMAIRE.map((entree) => (
          <a
            key={entree.ancre}
            href={`#${entree.ancre}`}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-ink hover:text-ink"
          >
            {entree.titre}
          </a>
        ))}
      </nav>

      {/* ── Le constat ─────────────────────────────────────────────── */}
      <section
        id="constat"
        className="flex scroll-mt-8 flex-col gap-5"
        aria-labelledby="constat-titre"
      >
        <div className="flex flex-col gap-1">
          <h2 id="constat-titre" className="font-serif text-2xl text-ink">
            Ce que les gens tapent vraiment
          </h2>
          <SourceSuivie etat={mesure} restaurantId={id} />
        </div>

        <AvantLesChiffres etat={mesure} restaurantId={id} />

        {aDesChiffres && mesure.requetes.length === 0 && (
          <EtatVide site={mesure.site!} />
        )}

        {aDesChiffres && mesure.requetes.length > 0 && (
          <>
            <Kpis s={synthese(mesure.requetes)} tuiles />

            {/* Les deux graphiques partagent leurs lignes : même ordre,
                même hauteur de ligne. Côte à côte sur un grand écran, ils
                se lisent comme un tableau à deux colonnes ; l'un sous
                l'autre sur un petit, l'ordre reste. */}
            <div className="grid gap-5 xl:grid-cols-5">
              <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm xl:col-span-3">
                <GraphiqueRequetes requetes={dessin} />
              </div>
              <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm xl:col-span-2">
                <GraphiquePositions requetes={dessin} />
              </div>
            </div>

            <TableauRequetes requetes={mesure.requetes} />
          </>
        )}
      </section>

      {/* ── Le projet ──────────────────────────────────────────────── */}
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <KeywordAnalysis
          analyzeAction={analyzeKeywords.bind(null, id)}
          precedente={precedente}
          motsClesActuels={keywords.map((k) => k.keyword)}
        />

        <aside
          id="mots-cles"
          className="flex scroll-mt-8 flex-col gap-4 xl:sticky xl:top-24"
          aria-labelledby="mots-cles-titre"
        >
          <div className="flex flex-col gap-0.5">
            <h2 id="mots-cles-titre" className="font-serif text-2xl text-ink">
              Mots-clés ciblés
            </h2>
            <p className="text-sm text-zinc-600">
              Ce sur quoi tu veux sortir. L&apos;analyse les commente.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
            <form action={addKeyword} className="flex gap-2">
              <input type="hidden" name="restaurant_id" value={id} />
              <input
                name="keyword"
                type="text"
                required
                placeholder="ex : restaurant italien Lyon"
                className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-navy focus:bg-white"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
              >
                Ajouter
              </button>
            </form>

            {keywords.length === 0 ? (
              <p className="text-sm text-ink-soft">
                Aucun mot-clé pour le moment.
              </p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {keywords.map((k) => (
                  <li
                    key={k.id}
                    className="flex items-center gap-1.5 rounded-full border border-line bg-brand-cream py-1 pl-3 pr-1.5 text-sm text-ink"
                  >
                    {k.keyword}
                    <form action={removeKeyword}>
                      <input type="hidden" name="id" value={k.id} />
                      <input type="hidden" name="restaurant_id" value={id} />
                      <button
                        type="submit"
                        aria-label={`Supprimer ${k.keyword}`}
                        className="flex h-5 w-5 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        ×
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
