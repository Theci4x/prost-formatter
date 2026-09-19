import type { Metadata } from "next";
import { PageBillet } from "@/components/blog/PageBillet";
import {
  billetsPour,
  slugFrancaisDepuis,
  alternatives,
  billetPour,
} from "@/lib/blog/traductions";
import { cheminJournal } from "@/types/blog";

const LANGUE = "zh" as const;

type Params = { slug: string };

// Les billets ne changent qu'avec un déploiement : autant les construire
// une fois pour toutes.
export function generateStaticParams() {
  return billetsPour(LANGUE).map((billet) => ({ slug: billet.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const slugFr = slugFrancaisDepuis(slug, LANGUE);
  const billet = slugFr ? billetPour(slugFr, LANGUE) : null;
  if (!billet || !slugFr) return { title: "Klarr" };

  return {
    title: billet.titre,
    description: billet.resume,
    alternates: {
      canonical: `${cheminJournal(LANGUE)}/${billet.slug}`,
      // Sans « hreflang », Google traite deux traductions comme deux
      // pages sans rapport, et n'en montre qu'une.
      languages: alternatives(slugFr),
    },
    openGraph: {
      type: "article",
      title: billet.titre,
      description: billet.resume,
      publishedTime: billet.publieLe,
      modifiedTime: billet.misAJourLe,
    },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const slugFr = slugFrancaisDepuis(slug, LANGUE);
  return <PageBillet slug={slugFr ?? slug} langue={LANGUE} />;
}
