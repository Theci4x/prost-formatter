"use client";

import { useState } from "react";
import { ReviewReplyDraft } from "@/components/reviews/ReviewReplyDraft";
import type { Langue } from "@/lib/i18n/langues";
import { traducteur } from "@/lib/i18n/t";
import { AVIS } from "@/lib/i18n/pages/avis";

const PLATEFORMES = [
  "Google",
  "Tripadvisor",
  "TheFork",
  "Yelp",
  "Facebook",
  "Autre",
];

/**
 * Répondre à un avis que Klarr ne voit pas.
 *
 * Les plateformes ne transmettent que quelques avis — cinq au plus chez
 * Google, et pas forcément les plus récents. Les autres se répondent
 * quand même : on colle l'avis, Klarr propose la réponse.
 */
export function RepondreAvisLibre({
  restaurantId,
  langue,
}: {
  restaurantId: string;
  langue: Langue;
}) {
  const t = traducteur(langue, AVIS);
  const [plateforme, setPlateforme] = useState("Google");
  const [note, setNote] = useState(5);
  const [auteur, setAuteur] = useState("");
  const [texte, setTexte] = useState("");

  const champ =
    "rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-navy focus:bg-white";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          {t("Plateforme")}
          <select
            value={plateforme}
            onChange={(e) => setPlateforme(e.target.value)}
            className={`${champ} font-normal`}
          >
            {PLATEFORMES.map((p) => (
              <option key={p} value={p}>
                {t(p)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          {t("Note")}
          <select
            value={note}
            onChange={(e) => setNote(Number(e.target.value))}
            className={`${champ} font-normal`}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {t(n > 1 ? "{n} étoiles" : "{n} étoile", { n })}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          {t("Prénom du client")}
          <input
            value={auteur}
            onChange={(e) => setAuteur(e.target.value)}
            placeholder={t("facultatif")}
            className={`${champ} font-normal`}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
        {t("L'avis")}
        <textarea
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          rows={4}
          placeholder={t("Colle ici le texte de l'avis")}
          className={`${champ} font-normal leading-relaxed`}
        />
      </label>
      <ReviewReplyDraft
        restaurantId={restaurantId}
        langue={langue}
        plateforme={plateforme}
        author={auteur}
        rating={note}
        text={texte}
        reviewUrl={null}
      />
    </div>
  );
}
