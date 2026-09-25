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
import { annulerPost, marquerPublie } from "./actions";
import { BoutonCopier } from "@/components/dashboard/BoutonCopier";
import { LIBELLE_BOUTON, type Bouton } from "@/lib/posts/regles";
import type { Restaurant } from "@/types/restaurant";
import type { RestaurantPhoto } from "@/types/photo";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";

type Post = {
  id: string;
  texte: string;
  photo_id: string | null;
  bouton: Bouton | null;
  bouton_url: string | null;
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

/** L'instant présent, lu hors du rendu comme toute horloge. */
function maintenantIso(): string {
  return new Date().toISOString();
}

export default async function PostsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");
  await exigerModule(id, "visibilite");

  // Sans l'accès de Google, la page reste ouverte en publication
  // assistée : Klarr prépare et prévient, le restaurateur colle et publie.
  const assiste = !publicationsGoogleOuvertes();

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
  const maintenant = maintenantIso();
  // Arrivées à leur date : en mode assisté, c'est au restaurateur de jouer.
  const aPublier = assiste
    ? posts
        .filter((p) => p.statut === "programme" && p.publier_le <= maintenant)
        .sort((a, b) => a.publier_le.localeCompare(b.publier_le))
    : [];
  const urlPhoto = new Map(photos.map((ph) => [ph.id, ph.url]));

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
          l&apos;avance, le lundi matin par exemple.
        </p>
      </div>

      {assiste ? (
        <div className="flex flex-col gap-2 rounded-2xl border border-brand-orange/30 bg-brand-orange-soft px-5 py-4 text-sm leading-relaxed text-ink">
          <strong>
            Publication assistée : Klarr prépare, tu publies en 30 secondes.
          </strong>
          <span>
            Écris et programme tes publications ici. Le jour venu, Klarr te
            prévient sur ton téléphone (vers 11 h) : tu copies le texte, tu
            ouvres ta fiche Google, tu colles, c&apos;est publié. Le jour où
            Google ouvre la publication automatique à Klarr, elles partiront
            toutes seules — rien à ressaisir.
          </span>
        </div>
      ) : (
        <p className="rounded-2xl border border-zinc-200/70 bg-white px-5 py-4 text-sm leading-relaxed text-zinc-600">
          Une publication paraît au premier passage de la nuit suivant la date
          choisie, pas à la minute près.
        </p>
      )}

      {/* ── À publier maintenant (mode assisté) ───────────────────── */}
      {aPublier.length > 0 && (
        <section className="flex flex-col gap-4" id="a-publier">
          <TitreSection
            aside={`${aPublier.length} publication${aPublier.length > 1 ? "s" : ""}`}
          >
            À publier maintenant
          </TitreSection>
          <ol className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-600">
            <li>
              <strong className="text-ink">1.</strong> Copie le texte
            </li>
            <li>
              <strong className="text-ink">2.</strong> Ouvre ta fiche Google,
              puis « Ajouter une mise à jour »
            </li>
            <li>
              <strong className="text-ink">3.</strong> Colle, ajoute la photo,
              publie
            </li>
            <li>
              <strong className="text-ink">4.</strong> Reviens cliquer «
              C&apos;est publié »
            </li>
          </ol>
          <ul className="flex flex-col gap-4">
            {aPublier.map((post) => {
              const photo = post.photo_id ? urlPhoto.get(post.photo_id) : null;
              return (
                <li
                  key={post.id}
                  className="grid gap-5 rounded-2xl border border-brand-orange/40 bg-white p-6 shadow-sm md:grid-cols-[minmax(0,1fr)_16rem]"
                >
                  <div className="flex min-w-0 flex-col gap-3">
                    <span className="w-fit rounded-full bg-brand-orange-soft px-2.5 py-0.5 text-xs font-semibold text-brand-orange-dark">
                      Prévue {quand(post.publier_le)}
                    </span>
                    <p className="whitespace-pre-wrap rounded-xl bg-zinc-50 px-4 py-3 text-[15px] leading-relaxed text-ink">
                      {post.texte}
                    </p>
                    {post.bouton && (
                      <p className="text-sm text-zinc-600">
                        Bouton à ajouter : «{" "}
                        <strong className="text-ink">
                          {LIBELLE_BOUTON[post.bouton]}
                        </strong>{" "}
                        »
                        {post.bouton_url && (
                          <>
                            {" "}
                            avec le lien{" "}
                            <span className="break-all font-mono text-xs text-ink">
                              {post.bouton_url}
                            </span>
                          </>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    {photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo}
                        alt=""
                        className="aspect-[4/3] w-full rounded-xl object-cover"
                      />
                    )}
                    <BoutonCopier
                      texte={post.texte}
                      libelle="Copier le texte"
                      copie="Texte copié ✓"
                    />
                    <a
                      href="https://business.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-center text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
                    >
                      Ouvrir ma fiche Google ↗
                    </a>
                    {photo && (
                      <a
                        href={photo}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center text-xs font-medium text-zinc-500 hover:text-brand-navy"
                      >
                        Télécharger la photo
                      </a>
                    )}
                    <form action={marquerPublie}>
                      <input type="hidden" name="restaurant_id" value={id} />
                      <input type="hidden" name="post_id" value={post.id} />
                      <button
                        type="submit"
                        className="w-full rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
                      >
                        C&apos;est publié ✓
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

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
          valeur={assiste ? aPublier.length : enEchec}
          libelle={assiste ? "à publier maintenant" : "en échec, à revoir"}
          accent={assiste ? aPublier.length > 0 : enEchec > 0}
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
                        : assiste && post.publier_le <= maintenant
                          ? `À publier — prévue ${quand(post.publier_le)}`
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

                  {!assiste && post.derniere_erreur && (
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
