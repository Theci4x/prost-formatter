"use client";

import { useActionState, useState } from "react";
import type { Langue } from "@/lib/i18n/langues";
import { BONS } from "@/lib/i18n/bons";
import { MONTANT_MAX, MONTANT_MIN, prixBon } from "@/lib/bons/regles";
import { acheterBon, type AchatState } from "@/app/cadeau/[slug]/actions";

const initial: AchatState = { erreur: null };

const CHAMP =
  "w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-base outline-none transition-colors focus:border-brand-navy focus:bg-white";
const LIBELLE = "text-sm font-medium text-ink";
const AIDE = "text-xs text-zinc-500";

/**
 * Le formulaire d'achat. Le montant choisi s'affiche sur le bouton : on
 * sait ce qu'on paie avant de partir chez Stripe.
 */
export function FormulaireBon({
  slug,
  montants,
  langue,
}: {
  slug: string;
  montants: number[];
  langue: Langue;
}) {
  const b = BONS[langue];
  const [state, action, pending] = useActionState(acheterBon, initial);
  const [choix, setChoix] = useState<string>(
    String(montants[Math.min(1, montants.length - 1)] ?? "autre"),
  );
  const [libre, setLibre] = useState("");
  const [envoyer, setEnvoyer] = useState(false);

  const centimesLibre = Math.round(
    Number.parseFloat(libre.replace(",", ".")) * 100,
  );
  const somme =
    choix === "autre"
      ? Number.isFinite(centimesLibre) && centimesLibre > 0
        ? prixBon(centimesLibre, langue)
        : null
      : prixBon(Number(choix), langue);

  return (
    <form action={action} className="flex flex-col gap-7">
      <input type="hidden" name="slug" value={slug} />

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-base font-semibold text-ink">
          {b.montantLabel}
        </legend>
        <div className="flex flex-wrap gap-2">
          {[...montants.map(String), "autre"].map((valeur) => (
            <label
              key={valeur}
              className={`cursor-pointer rounded-full border px-5 py-2.5 text-base font-semibold transition-colors ${
                choix === valeur
                  ? "border-brand-navy bg-brand-navy text-white"
                  : "border-zinc-200 bg-white text-ink hover:border-brand-navy"
              }`}
            >
              <input
                type="radio"
                name="montant"
                value={valeur}
                checked={choix === valeur}
                onChange={() => setChoix(valeur)}
                className="sr-only"
              />
              {valeur === "autre"
                ? b.autreMontant
                : prixBon(Number(valeur), langue)}
            </label>
          ))}
        </div>
        {choix === "autre" && (
          <div className="flex max-w-xs flex-col gap-1.5">
            <input
              name="montant_libre"
              inputMode="decimal"
              autoFocus
              value={libre}
              onChange={(e) => setLibre(e.target.value)}
              placeholder="60"
              aria-label={b.autreMontant}
              className={CHAMP}
            />
            <span className={AIDE}>
              {b.autreMontantAide(
                prixBon(MONTANT_MIN, langue),
                prixBon(MONTANT_MAX, langue),
              )}
            </span>
          </div>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-3 text-base font-semibold text-ink">
          {b.pourQui}
        </legend>
        <label className="flex flex-col gap-1.5">
          <span className={LIBELLE}>{b.nomBeneficiaire}</span>
          <input
            name="beneficiaire_nom"
            required
            maxLength={120}
            className={CHAMP}
          />
          <span className={AIDE}>{b.nomBeneficiaireAide}</span>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={LIBELLE}>{b.message}</span>
          <textarea name="message" rows={3} maxLength={300} className={CHAMP} />
          <span className={AIDE}>{b.messageAide}</span>
        </label>
        <label className="flex items-start gap-3 text-sm text-ink">
          <input
            type="checkbox"
            name="envoyer_beneficiaire"
            checked={envoyer}
            onChange={(e) => setEnvoyer(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-brand-navy"
          />
          {b.envoyerDirectement}
        </label>
        {envoyer && (
          <label className="flex flex-col gap-1.5">
            <span className={LIBELLE}>{b.emailBeneficiaire}</span>
            <input
              name="beneficiaire_email"
              type="email"
              required
              maxLength={200}
              className={CHAMP}
            />
            <span className={AIDE}>{b.emailBeneficiaireAide}</span>
          </label>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-3 text-base font-semibold text-ink">
          {b.vous}
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className={LIBELLE}>{b.votreNom}</span>
            <input
              name="acheteur_nom"
              required
              maxLength={120}
              autoComplete="name"
              className={CHAMP}
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className={LIBELLE}>{b.votreEmail}</span>
            <input
              name="acheteur_email"
              type="email"
              required
              maxLength={200}
              autoComplete="email"
              className={CHAMP}
            />
          </label>
        </div>
        <span className={AIDE}>{b.votreEmailAide}</span>
      </fieldset>

      {state.erreur && (
        <p role="alert" className="text-sm text-red-600">
          {state.erreur}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-navy px-5 py-3.5 text-base font-semibold text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-60"
      >
        {pending ? b.enCours : somme ? b.payer(somme) : b.montantLabel}
      </button>
    </form>
  );
}
