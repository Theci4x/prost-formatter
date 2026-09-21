import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { ChoixAvis } from "@/components/avis/ChoixAvis";
import { RouePublique } from "@/components/roue/RouePublique";
import { SignatureKlarr } from "@/components/brand/SignatureKlarr";
import { lienAvisGoogle } from "@/lib/avis/liens";
import { searchPlace } from "@/lib/google/places";

type Params = { slug: string };

type Maison = {
  id: string;
  nom: string;
  adresse: string | null;
  google_place_id: string | null;
};

type JeuOuvert = {
  titre: string;
  sousTitre: string | null;
  /** Les libellés dans l'ordre exact que le serveur indexe au tirage. */
  cases: string[];
};

/**
 * La roue de cette maison, si elle tourne.
 *
 * Les cases sont chargées ici, dans le même ordre que le tirage les
 * parcourt — c'est cet ordre qui permet à l'animation de se poser sur la
 * bonne case. Une roue sans case gagnante ne s'affiche pas : mieux vaut
 * pas de jeu du tout qu'un jeu qui ne donne rien.
 */
async function chargerJeu(maisonId: string): Promise<JeuOuvert | null> {
  const supabase = createServiceClient();
  const { data: roue } = await supabase
    .from("restaurant_roue")
    .select("active, titre, sous_titre")
    .eq("restaurant_id", maisonId)
    .maybeSingle();
  const reglage = roue as {
    active: boolean;
    titre: string;
    sous_titre: string | null;
  } | null;
  if (!reglage?.active) return null;

  const { data } = await supabase
    .from("restaurant_roue_lots")
    .select("libelle, gagnant, poids")
    .eq("restaurant_id", maisonId)
    .order("ordre")
    .order("created_at");
  const lots = (data ?? []) as {
    libelle: string;
    gagnant: boolean;
    poids: number;
  }[];
  if (lots.length < 2 || !lots.some((lot) => lot.gagnant && lot.poids > 0)) {
    return null;
  }

  return {
    titre: reglage.titre,
    sousTitre: reglage.sous_titre,
    cases: lots.map((lot) => lot.libelle),
  };
}

async function chargerMaison(slug: string): Promise<Maison | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("id, nom, adresse, google_place_id")
    .eq("slug_reservation", slug)
    .maybeSingle();

  // Une requête refusée renvoie elle aussi « aucune ligne », et la page
  // répond alors 404 comme si l'établissement n'existait pas. C'est
  // exactement ce qui est arrivé ici : sans cette trace, une colonne
  // manquante ressemble à un mauvais slug.
  if (error) console.error("[avis/slug]", slug, error);

  return (data as Maison | null) ?? null;
}

/**
 * L'identifiant de la fiche Google, résolu une fois puis gardé.
 *
 * Le totem est scanné par des clients, en série : une recherche Places
 * facturée à chaque scan se paie vite. La première visite la fait, les
 * suivantes lisent la colonne. Un échec ne coûte que le bouton Google —
 * la page vit sans lui.
 */
async function ficheGoogle(maison: Maison): Promise<string | null> {
  if (maison.google_place_id) return maison.google_place_id;
  if (!process.env.GOOGLE_PLACES_API_KEY) return null;

  try {
    const place = await searchPlace(
      [maison.nom, maison.adresse].filter(Boolean).join(" "),
    );
    if (!place) return null;

    await createServiceClient()
      .from("restaurants")
      .update({ google_place_id: place.id })
      .eq("id", maison.id);

    return place.id;
  } catch (cause) {
    console.error("[avis/slug] fiche Google introuvable", maison.nom, cause);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const maison = await chargerMaison(slug);
  return {
    title: maison ? `Votre avis — ${maison.nom}` : "Votre avis",
    // Une page atteinte par un totem sur la table n'a rien à faire dans les
    // résultats de recherche : elle ne s'adresse qu'à qui est déjà venu.
    robots: { index: false, follow: false },
  };
}

export default async function AvisPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const maison = await chargerMaison(slug);
  if (!maison) notFound();

  const [lienGoogle, jeu] = await Promise.all([
    ficheGoogle(maison).then(lienAvisGoogle),
    chargerJeu(maison.id),
  ]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-6 py-12">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-serif text-4xl text-ink">{maison.nom}</h1>
        <p className="text-base text-ink-soft">
          Merci d&apos;être venu. Deux minutes pour nous dire comment
          c&apos;était ?
        </p>
      </div>

      {/* La roue d'abord quand elle tourne : c'est ce que le totem
          promet. Les deux chemins restent en dessous, à égalité comme
          toujours, et le lot ne dépend d'aucun des deux. */}
      {jeu && (
        <RouePublique
          slug={slug}
          titre={jeu.titre}
          sousTitre={jeu.sousTitre}
          cases={jeu.cases}
          lienGoogle={lienGoogle}
        />
      )}

      <ChoixAvis slug={slug} nom={maison.nom} lienGoogle={lienGoogle} />

      {!lienGoogle && (
        <p className="text-center text-xs text-zinc-400">
          L&apos;avis public sera disponible bientôt.
        </p>
      )}

      <SignatureKlarr texte="Avis et retours propulsés par" />
    </main>
  );
}
