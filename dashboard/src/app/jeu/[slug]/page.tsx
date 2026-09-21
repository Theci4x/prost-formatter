import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { RouePublique } from "@/components/roue/RouePublique";
import { SignatureKlarr } from "@/components/brand/SignatureKlarr";
import { lienAvisGoogle } from "@/lib/avis/liens";
import { langueVisiteur } from "@/lib/i18n/langue";
import { AVIS } from "@/lib/i18n/avis";

/**
 * Le jeu, à sa propre adresse.
 *
 * Séparé du totem, et c'est le but : ce ne sont pas les mêmes gestes. Le
 * totem demande un retour à quelqu'un qui part ; le panneau du jeu attire
 * quelqu'un qui est encore à table. Deux supports, deux QR, et l'un peut
 * s'arrêter sans toucher à l'autre.
 *
 * Le lien vers l'avis n'apparaît qu'après le tirage, et le lot ne dépend
 * pas de ce qu'on en fait.
 */

type Params = { slug: string };

type Jeu = {
  nom: string;
  placeId: string | null;
  actif: boolean;
  titre: string;
  sousTitre: string | null;
  cases: string[];
};

async function chargerJeu(slug: string): Promise<Jeu | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("restaurants")
    .select("id, nom, google_place_id")
    .eq("slug_reservation", slug)
    .maybeSingle();
  if (error) console.error("[jeu/slug]", slug, error.message);
  const maison = data as {
    id: string;
    nom: string;
    google_place_id: string | null;
  } | null;
  if (!maison) return null;

  const [{ data: roueData }, { data: lotsData }] = await Promise.all([
    supabase
      .from("restaurant_roue")
      .select("active, titre, sous_titre")
      .eq("restaurant_id", maison.id)
      .maybeSingle(),
    supabase
      .from("restaurant_roue_lots")
      .select("libelle, gagnant, poids")
      .eq("restaurant_id", maison.id)
      .order("ordre")
      .order("created_at"),
  ]);

  const roue = roueData as {
    active: boolean;
    titre: string;
    sous_titre: string | null;
  } | null;
  const lots = (lotsData ?? []) as {
    libelle: string;
    gagnant: boolean;
    poids: number;
  }[];

  // Une roue sans case gagnante ne tourne pas, même allumée : mieux vaut
  // dire que le jeu est fermé que faire jouer pour rien.
  const jouable =
    Boolean(roue?.active) &&
    lots.length >= 2 &&
    lots.some((lot) => lot.gagnant && lot.poids > 0);

  return {
    nom: maison.nom,
    placeId: maison.google_place_id,
    actif: jouable,
    titre: roue?.titre ?? "",
    sousTitre: roue?.sous_titre ?? null,
    cases: lots.map((lot) => lot.libelle),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = AVIS[await langueVisiteur()];
  const jeu = await chargerJeu(slug);
  return {
    title: jeu ? a.tentezVotreChanceChez(jeu.nom) : a.tentezVotreChance,
    // Une page atteinte par un panneau sur la table n'a rien à faire dans
    // les résultats de recherche : elle ne s'adresse qu'à qui est déjà là.
    robots: { index: false, follow: false },
  };
}

export default async function JeuPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  // Comme le totem : « noindex », donc libre de suivre le téléphone.
  const langue = await langueVisiteur();
  const a = AVIS[langue];
  const jeu = await chargerJeu(slug);
  if (!jeu) notFound();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-6 py-12">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-serif text-4xl text-ink">{jeu.nom}</h1>
      </div>

      {/* Le panneau reste sur la table quand le jeu s'arrête : une page
          polie vaut mieux qu'une page introuvable. */}
      {jeu.actif ? (
        <RouePublique
          slug={slug}
          titre={jeu.titre}
          sousTitre={jeu.sousTitre}
          cases={jeu.cases}
          lienGoogle={lienAvisGoogle(jeu.placeId)}
          langue={langue}
        />
      ) : (
        <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200/70 bg-white p-6 text-center">
          <p className="text-base font-medium text-ink">{a.jeuFerme}</p>
          <p className="text-sm text-ink-soft">{a.jeuFermeDetail}</p>
        </div>
      )}

      <SignatureKlarr texte={a.signatureJeu} />
    </main>
  );
}
