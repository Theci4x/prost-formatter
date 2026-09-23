import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

function quand(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
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
      .from("menu_items")
      .select("id, nom, description, prix_centimes")
      .eq("restaurant_id", id)
      .eq("actif", true)
      .order("ordre", { ascending: true }),
    supabase
      .from("espaces")
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

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
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

      <div className="flex flex-col gap-4">
        <FormulairePost
          restaurantId={id}
          photos={photos}
          suggestions={pistes}
        />

        {/* Dit avant qu'on s'en aperçoive : l'attente vient de Google, pas
            d'une panne, et l'imprécision de l'heure vient du plan Vercel. */}
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
          <strong>
            L&apos;envoi vers Google n&apos;est pas encore ouvert.
          </strong>{" "}
          Google accorde l&apos;accès à son API de publication sur dossier ; la
          demande est en cours. Tes publications sont enregistrées et partiront
          toutes seules le jour où l&apos;accès arrive — rien à ressaisir. En
          attendant, elles restent « programmées ».
          <br />
          Précision de l&apos;heure : la file est traitée une fois par nuit,
          donc une publication paraît au premier passage suivant la date
          choisie, pas à la minute près.
        </p>

        {posts.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Aucune publication pour l&apos;instant.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {posts.map((post) => (
              <li
                key={post.id}
                className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
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

                <p className="whitespace-pre-wrap text-sm text-zinc-800">
                  {post.texte}
                </p>

                {post.derniere_erreur && (
                  <p className="text-xs text-amber-800">
                    Dernier essai : {post.derniere_erreur}
                  </p>
                )}

                {post.statut === "programme" && (
                  <form action={annulerPost} className="w-fit">
                    <input type="hidden" name="restaurant_id" value={id} />
                    <input type="hidden" name="post_id" value={post.id} />
                    <button
                      type="submit"
                      className="text-xs font-medium text-zinc-500 underline underline-offset-2 hover:text-red-600"
                    >
                      Annuler
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
