import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { ChoixAvis } from "@/components/avis/ChoixAvis";
import { SignatureKlarr } from "@/components/brand/SignatureKlarr";
import { lienAvisGoogle } from "@/lib/avis/liens";

type Params = { slug: string };

type Maison = {
  nom: string;
  google_place_id: string | null;
};

async function chargerMaison(slug: string): Promise<Maison | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("restaurants")
    .select("nom, google_place_id")
    .eq("slug_reservation", slug)
    .maybeSingle();
  return (data as Maison | null) ?? null;
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

  const lienGoogle = lienAvisGoogle(maison.google_place_id);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-6 py-12">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">{maison.nom}</h1>
        <p className="text-base text-zinc-600">
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
