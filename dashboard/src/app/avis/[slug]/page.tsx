import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { ChoixAvis } from "@/components/avis/ChoixAvis";
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

  const lienGoogle = lienAvisGoogle(await ficheGoogle(maison));

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-6 py-12">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-serif text-4xl text-ink">{maison.nom}</h1>
        <p className="text-base text-ink-soft">
          Merci d&apos;être venu. Deux minutes pour nous dire comment
          c&apos;était ?
        </p>
      </div>

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
