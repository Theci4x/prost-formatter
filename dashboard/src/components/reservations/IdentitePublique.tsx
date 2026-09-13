import Image from "next/image";
import {
  enregistrerIdentitePublique,
  televerserLogo,
} from "@/app/dashboard/[id]/reservations/actions";

/**
 * Ce qui fait que la page de réservation appartient au restaurant : son
 * logo en tête, ses mentions légales en pied. C'est lui qui contracte avec
 * le client, pas Klarr.
 */
export function IdentitePublique({
  restaurantId,
  logoUrl,
  mentions,
}: {
  restaurantId: string;
  logoUrl: string | null;
  mentions: string | null;
}) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
      <form
        action={televerserLogo}
        className="flex flex-wrap items-end gap-4"
      >
        <input type="hidden" name="restaurant_id" value={restaurantId} />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700">
            Ton logo{" "}
            <span className="font-normal text-zinc-400">
              — affiché en haut de ta page
            </span>
          </span>
          {logoUrl ? (
            <div className="relative h-16 w-40 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
              <Image
                src={logoUrl}
                alt="Logo actuel"
                fill
                sizes="160px"
                className="object-contain p-2"
              />
            </div>
          ) : (
            <span className="text-sm text-zinc-400">
              Aucun logo — le nom de l&apos;établissement s&apos;affiche seul.
            </span>
          )}
        </div>
        <label className="text-sm text-zinc-600" htmlFor="logo">
          <span className="sr-only">Choisir un logo</span>
          <input
            id="logo"
            type="file"
            name="logo"
            accept="image/*"
            required
            className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
          />
        </label>
        <button
          type="submit"
          className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
        >
          {logoUrl ? "Remplacer" : "Ajouter le logo"}
        </button>
      </form>

      <form
        action={enregistrerIdentitePublique}
        className="flex flex-col gap-3 border-t border-zinc-100 pt-5"
      >
        <input type="hidden" name="restaurant_id" value={restaurantId} />
        <label
          className="flex flex-col gap-1 text-sm font-medium text-zinc-700"
          htmlFor="mentions"
        >
          Tes mentions légales
          <span className="font-normal text-zinc-500">
            Affichées en bas de ta page de réservation. C&apos;est toi qui
            contractes avec le client : raison sociale, SIRET, adresse,
            conditions d&apos;annulation.
          </span>
          <textarea
            id="mentions"
            name="mentions_legales"
            rows={5}
            defaultValue={mentions ?? ""}
            placeholder={
              "SARL Le Bistrot — SIRET 000 000 000 00000\n12 rue des Lilas, 75011 Paris\nAnnulation gratuite jusqu'à 48 h avant."
            }
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-brand-navy"
          />
        </label>
        <button
          type="submit"
          className="w-fit rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
}
