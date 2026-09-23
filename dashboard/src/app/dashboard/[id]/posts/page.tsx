import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Compteur, TitreSection } from "@/components/dashboard/Compteur";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { FormulairePost } from "@/components/posts/FormulairePost";
import { publicationsGoogleOuvertes } from "@/lib/google/business";
import {
  suggestions,
  type EspaceSuggerable,
  type PlatSuggerable,
} from "@/lib/posts/suggestions";
import { annulerPost } from "./actions";
import { LIBELLE_BOUTON, type Bouton } from "@/lib/posts/regles";
import type { Restaurant } from "@/types/restaurant";
import type { RestaurantPhoto } from "@/types/photo";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";

type Post = {
  id: string;
  texte: string;
  bouton: Bouton | null;
  publier_le: string;
  publie_le: string | null;
  statut: string;
  tentatives: number;
  derniere_erreur: string | null;
};

/** « 12 oct. » : la date de la prochaine publication, pour une tuile. */
function jourCourt(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Paris",
  });
}

function quand(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
}

export default async function PostsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");
  await exigerModule(id, "visibilite");

  // Masqué tant que Google n'a pas accordé l'API de publication : une
  // publication programmée qui ne part jamais coûte plus qu'un écran
  // absent.
  if (!publicationsGoogleOuvertes()) notFound();

  const supabase = await createClient();
  const [
    { data: restaurantData },
    { data: postsData },
    { data: photosData },
    { data: platsData },
    { data: espacesData },
  ] = await Promise.all([
    supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("restaurant_posts")
      .select("*")
      .eq("restaurant_id", id)
      .order("publier_le", { ascending: false })
      .limit(30),
    supabase
      .from("restaurant_photos")
      .select("*")
      .eq("restaurant_id", id)
      .order("ordre")
      .order("created_at"),
    // La carte et les espaces alimentent les suggestions : une
    // publication se compose à partir de ce qui est déjà saisi, pas
    // d'une page blanche.
    supabase
      .from("restaurant_menu_items")
      .select("id, nom, description, prix_centimes")
      .eq("restaurant_id", id)
      .eq("actif", true)
      .order("ordre", { ascending: true }),
    supabase
      .from("restaurant_espaces")
      .select("id, nom, description, capacite, privatisation_minimum")
      .eq("restaurant_id", id)
      .order("ordre", { ascending: true }),
  ]);

  const restaurant = restaurantData as Restaurant | null;
  if (!restaurant) notFound();

  const posts = (postsData ?? []) as Post[];
  const photos = (photosData ?? []) as RestaurantPhoto[];
  const pistes = suggestions(
    (platsData ?? []) as PlatSuggerable[],
    (espacesData ?? []) as EspaceSuggerable[],
  );

  const programmees = posts.filter((p) => p.statut === "programme").length;
  const publiees = posts.filter((p) => p.statut === "publie").length;
  // La file part dans l'ordre des dates : la plus proche est la suivante.
  const prochaine = posts
    .filter((p) => p.statut === "programme")
    .map((p) => p.publier_le)
    .sort()[0];
  const enEchec = posts.filter(
    (p) => p.statut === "programme" && p.derniere_erreur,
  ).length;

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-3">
        <PageHeader
          icon={dashboardIcons.google}
          title={`Publications Google — ${restaurant.nom}`}
          backHref={`/dashboard/${id}/google`}
        />
        <p className="max-w-4xl text-sm text-zinc-600">
          Une publication vit une semaine sur ta fiche Google, puis disparaît.
          L&apos;intérêt est d&apos;en avoir toujours une : écris-les à
          l&apos;avance, Klarr les publie le jour venu.
        </p>
      </div>

      {/* Dit avant qu'on s'en aperçoive : l'attente vient de Google, pas
          d'une panne, et l'imprécision de l'heure vient du plan Vercel. */}
      <p className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900">
        <strong>L&apos;envoi vers Google n&apos;est pas encore ouvert.</strong>{" "}
        Google accorde l&apos;accès à son API de publication sur dossier ; la
        demande est en cours. Tes publications sont enregistrées et partiront
        toutes seules le jour où l&apos;accès arrive — rien à ressaisir. Une
        publication paraît au premier passage de la nuit suivant la date
        choisie, pas à la minute près.
      </p>

      {/* Une fiche sans publication à venir redevient muette dans la
          semaine : c'est la case à surveiller, d'où l'orange à zéro. */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Compteur
          valeur={programmees}
          libelle={`publication${programmees > 1 ? "s" : ""} programmée${programmees > 1 ? "s" : ""}`}
          accent={programmees === 0}
        />
        <Compteur
          valeur={prochaine ? jourCourt(prochaine) : "—"}
          libelle={prochaine ? "prochaine publication" : "rien de prévu"}
        />
        <Compteur
          valeur={publiees}
          libelle={`publiée${publiees > 1 ? "s" : ""} sur ta fiche`}
        />
        <Compteur
          valeur={enEchec}
          libelle="en échec, à revoir"
          accent={enEchec > 0}
        />
      </div>

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <section className="flex min-w-0 flex-col gap-4">
          <TitreSection>Nouvelle publication</TitreSection>
          <FormulairePost
            restaurantId={id}
            photos={photos}
            suggestions={pistes}
          />
        </section>

        <section className="flex min-w-0 flex-col gap-4">
          <TitreSection
            aside={posts.length > 0 ? `${posts.length} au total` : undefined}
          >
            Tes publications
          </TitreSection>
          {posts.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-300 bg-white/60 px-6 py-12 text-center text-sm text-zinc-600">
              Aucune publication pour l&apos;instant.
              {pistes.length > 0 &&
                " Pars d'un plat ou d'un espace dans « Partir de… » : le texte s'écrit presque seul."}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        post.statut === "publie"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-brand-orange-soft text-brand-orange-dark"
                      }`}
                    >
                      {post.statut === "publie"
                        ? `Publiée ${post.publie_le ? quand(post.publie_le) : ""}`
                        : `Programmée ${quand(post.publier_le)}`}
                    </span>
                    {post.bouton && (
                      <span className="text-xs text-zinc-500">
                        Bouton : {LIBELLE_BOUTON[post.bouton]}
                      </span>
                    )}
                  </div>

                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
                    {post.texte}
                  </p>

                  {post.derniere_erreur && (
                    <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      Dernier essai : {post.derniere_erreur}
                    </p>
                  )}

                  {post.statut === "programme" && (
                    <form
                      action={annulerPost}
                      className="border-t border-zinc-100 pt-3"
                    >
                      <input type="hidden" name="restaurant_id" value={id} />
                      <input type="hidden" name="post_id" value={post.id} />
                      <button
                        type="submit"
                        className="text-sm font-medium text-zinc-500 transition-colors hover:text-red-600"
                      >
                        Annuler cette publication
                      </button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
