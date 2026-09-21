import { redirect } from "next/navigation";

/**
 * `/dashboard/<id>` n'a jamais eu de page.
 *
 * L'accueil du tableau de bord est `/dashboard` : il liste les
 * établissements, et la carte de chacun porte ses entrées. Cette adresse-ci
 * est pourtant celle qu'on obtient en effaçant la fin d'une URL — ce que
 * tout le monde fait pour « remonter d'un cran » —, et elle répondait 404
 * sur son propre tableau de bord.
 *
 * Une redirection plutôt qu'une page : il n'y a rien à montrer ici qui ne
 * soit déjà sur l'accueil, et deux écrans qui disent la même chose finissent
 * par diverger.
 */
export default async function EtablissementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  redirect("/dashboard");
}
