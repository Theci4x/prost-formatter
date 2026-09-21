import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BoutonImprimer } from "@/components/roue/BoutonImprimer";
import { KlarrMark } from "@/components/brand/KlarrMark";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import { qrSvgDe } from "@/lib/menu/qr";
import { siteUrl } from "@/lib/site-url";
import type { Restaurant } from "@/types/restaurant";

/**
 * Le panneau de table, prêt à imprimer.
 *
 * Deux QR sur un seul carton, et c'est le point délicat : un client qui
 * hésite entre deux carrés noirs ne scanne ni l'un ni l'autre. D'où la
 * hiérarchie — le jeu occupe le haut et le double en taille, l'avis tient
 * le bas. On ne propose pas deux choix à égalité, on propose une porte
 * d'entrée et une porte de service.
 *
 * Rien n'est traduit : ce carton est posé chez un restaurant français et
 * imprimé une fois. Le jour où un restaurateur étranger en veut un, la
 * question se posera pour de bon — pas avant.
 */

function Bloc({
  qr,
  titre,
  sous,
  taille,
  corpsTitre,
  corpsSous,
}: {
  qr: string;
  titre: string;
  sous: string;
  /** La largeur du carré, en millimètres : un carton s'imprime. */
  taille: number;
  /** En points. Déduire la taille du texte de celle du QR donnait des
      légendes de quatre points, illisibles sur le papier. */
  corpsTitre: number;
  corpsSous: number;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p
        className="font-serif text-ink"
        style={{ fontSize: `${corpsTitre}pt` }}
      >
        {titre}
      </p>
      <div
        className="[&>svg]:h-full [&>svg]:w-full"
        style={{ width: `${taille}mm`, height: `${taille}mm` }}
        dangerouslySetInnerHTML={{ __html: qr }}
      />
      <p
        className="max-w-[80mm] leading-snug text-ink-soft"
        style={{ fontSize: `${corpsSous}pt` }}
      >
        {sous}
      </p>
    </div>
  );
}

export default async function PanneauPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");
  await exigerModule(id, "visibilite");

  const supabase = await createClient();
  const { data } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const restaurant = data as Restaurant | null;
  if (!restaurant) notFound();

  const slug = (restaurant as Restaurant & { slug_reservation?: string | null })
    .slug_reservation;
  if (!slug) {
    return (
      <div className="flex flex-1 flex-col gap-4 px-6 py-8">
        <h1 className="text-xl font-semibold text-zinc-900">
          Panneau à imprimer
        </h1>
        <p className="max-w-xl text-sm text-zinc-500">
          Ouvre d&apos;abord ta page de réservation : c&apos;est son adresse qui
          sert au jeu comme aux avis.{" "}
          <Link
            href={`/dashboard/${id}/reservations/configuration`}
            className="font-medium text-brand-orange hover:underline"
          >
            Réglages des réservations
          </Link>
        </p>
      </div>
    );
  }

  const [qrJeu, qrAvis] = await Promise.all([
    qrSvgDe(`${siteUrl()}/jeu/${slug}`),
    qrSvgDe(`${siteUrl()}/avis/${slug}`),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <div className="sans-impression flex flex-col gap-3">
        <Link
          href={`/dashboard/${id}/roue`}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← Roue de la fortune
        </Link>
        <h1 className="text-xl font-semibold text-zinc-900">
          Panneau à imprimer
        </h1>
        <p className="max-w-xl text-sm text-zinc-500">
          Imprime en A5, ou en A4 puis plie en deux. Vérifie les deux QR avec
          ton propre téléphone avant d&apos;en faire cinquante : un carton
          imprimé de travers se paie en papier.
        </p>
        <BoutonImprimer />
      </div>

      {/* Le carton lui-même. Bordure et coins visibles à l'écran pour qu'on
          sache où couper ; à l'impression, seul le contenu sort. */}
      <div className="panneau mx-auto flex w-full max-w-[148mm] flex-col items-center justify-between gap-8 rounded-2xl border border-zinc-200 bg-white px-8 py-10 print:rounded-none print:border-0 print:shadow-none">
        <p className="text-center font-serif text-3xl text-ink">
          {restaurant.nom}
        </p>

        <Bloc
          qr={qrJeu}
          titre="Tentez votre chance"
          sous="Scannez, tournez la roue, repartez avec un lot"
          taille={58}
          corpsTitre={19}
          corpsSous={10.5}
        />

        <div className="flex w-full items-center gap-4">
          <span className="h-px flex-1 bg-zinc-200" />
          <span
            className="uppercase tracking-[0.14em] text-ink-soft"
            style={{ fontSize: "9pt" }}
          >
            ou
          </span>
          <span className="h-px flex-1 bg-zinc-200" />
        </div>

        <Bloc
          qr={qrAvis}
          titre="Donnez-nous votre avis"
          sous="Un mot en public, ou en privé à la maison"
          taille={32}
          corpsTitre={13}
          corpsSous={9}
        />

        <span className="flex items-center gap-1.5 text-[10px] text-ink-soft">
          <KlarrMark size={11} />
          Klarr
        </span>
      </div>
    </div>
  );
}
