"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import {
  enregistrerIdentitePublique,
  televerserLogo,
} from "@/app/dashboard/[id]/reservations/actions";
import type { Langue } from "@/lib/i18n/langues";
import { CONFIGURATION } from "@/lib/i18n/configuration";

// Même plafond que côté serveur : refuser ici évite d'envoyer quatre méga-
// octets pour rien sur la connexion du restaurateur.
const LOGO_MAX = 4 * 1024 * 1024;

/**
 * Ce qui fait que la page de réservation appartient au restaurant : son
 * logo en tête, ses mentions légales en pied. C'est lui qui contracte avec
 * le client, pas Klarr.
 */
export function IdentitePublique({
  restaurantId,
  logoUrl,
  mentions,
  langue,
}: {
  restaurantId: string;
  logoUrl: string | null;
  mentions: string | null;
  langue: Langue;
}) {
  const cfg = CONFIGURATION[langue];
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();
  const champ = useRef<HTMLInputElement>(null);

  function envoyer(donnees: FormData) {
    const fichier = donnees.get("logo") as File | null;
    if (fichier && fichier.size > LOGO_MAX) {
      setErreur(cfg.logoTropLourd);
      return;
    }
    setErreur(null);
    startTransition(async () => {
      const reponse = await televerserLogo(donnees);
      setErreur(reponse.error);
      if (!reponse.error && champ.current) champ.current.value = "";
    });
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
      <form action={envoyer} className="flex flex-wrap items-end gap-4">
        <input type="hidden" name="restaurant_id" value={restaurantId} />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700">
            {cfg.tonLogo}{" "}
            <span className="font-normal text-zinc-400">{cfg.logoAide}</span>
          </span>
          {logoUrl ? (
            <div className="relative h-16 w-40 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
              <Image
                src={logoUrl}
                alt={cfg.logoActuel}
                fill
                sizes="160px"
                className="object-contain p-2"
              />
            </div>
          ) : (
            <span className="text-sm text-zinc-400">{cfg.aucunLogo}</span>
          )}
        </div>
        <label className="text-sm text-zinc-600" htmlFor="logo">
          <span className="sr-only">{cfg.choisirLogo}</span>
          <input
            ref={champ}
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
          disabled={enCours}
          className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy disabled:opacity-50"
        >
          {enCours ? cfg.envoi : logoUrl ? cfg.remplacer : cfg.ajouterLogo}
        </button>

        {erreur && (
          <p className="w-full text-sm text-red-600" role="alert">
            {erreur}
          </p>
        )}
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
          {cfg.mentionsTitre}
          <span className="font-normal text-zinc-500">{cfg.mentionsAide}</span>
          <textarea
            id="mentions"
            name="mentions_legales"
            rows={5}
            defaultValue={mentions ?? ""}
            placeholder={cfg.mentionsPlaceholder}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-brand-navy"
          />
        </label>
        <button
          type="submit"
          className="w-fit rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
        >
          {cfg.enregistrer}
        </button>
      </form>
    </div>
  );
}
