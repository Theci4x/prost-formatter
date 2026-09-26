"use client";

import { useState } from "react";
import { RAPPEL, t } from "@/lib/i18n/outils";
import type { Langue } from "@/lib/i18n/langues";

/**
 * « On vous recontacte le mois de votre ouverture. »
 *
 * La pièce que la série d'outils d'ouverture n'avait pas, et sans
 * laquelle elle est de la charité : un projet de restaurant met six à
 * dix-huit mois à s'ouvrir, et personne ne se souvient en septembre d'un
 * site consulté en janvier.
 *
 * Quatre champs dont deux obligatoires. Chaque champ de plus coûte des
 * inscriptions, et on n'a pas besoin de la forme juridique de la société
 * pour appeler quelqu'un.
 *
 * Le formulaire dit ce qu'il fait et ce qu'il ne fait pas, juste sous le
 * bouton — pas dans une politique de confidentialité que personne
 * n'ouvre. Le texte est court parce qu'il est vrai : une adresse, une
 * date, un appel. Si la promesse demandait un paragraphe pour être
 * expliquée, c'est qu'elle serait à revoir.
 *
 * Le refus vient du serveur, qui répond en français et pose son motif
 * dans l'en-tête `X-Klarr-Motif`. C'est ce code qu'on traduit, pas la
 * phrase : un motif inconnu retombe sur le texte du serveur plutôt que
 * de laisser le formulaire muet.
 */
export function RappelOuverture({
  source,
  langue,
}: {
  source: string;
  langue: Langue;
}) {
  const [email, setEmail] = useState("");
  const [nom, setNom] = useState("");
  const [etablissement, setEtablissement] = useState("");
  const [ville, setVille] = useState("");
  const [date, setDate] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [fait, setFait] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const champ =
    "w-full rounded-md border border-zinc-300 px-3 py-2 text-base outline-none focus:border-brand-navy disabled:opacity-50";

  async function envoyer(event: React.FormEvent) {
    event.preventDefault();
    if (envoi) return;
    setEnvoi(true);
    setErreur(null);
    try {
      const reponse = await fetch("/api/ouverture/rappel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          nom,
          etablissement,
          ville,
          date_ouverture: date,
          source,
        }),
      });
      if (!reponse.ok) {
        const motif = reponse.headers.get("X-Klarr-Motif") ?? "";
        const connu = motif in RAPPEL.motifs;
        setErreur(
          connu
            ? t(RAPPEL.motifs[motif as keyof typeof RAPPEL.motifs], langue)
            : await reponse.text(),
        );
        return;
      }
      setFait(true);
    } catch {
      setErreur(t(RAPPEL.motifs.reseau, langue));
    } finally {
      setEnvoi(false);
    }
  }

  if (fait) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="text-sm font-semibold text-emerald-900">
          {t(RAPPEL.faitTitre, langue)}
        </p>
        <p className="mt-1.5 text-base text-emerald-800">
          {t(RAPPEL.faitTexte, langue)}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={envoyer}
      className="flex flex-col gap-4 rounded-2xl border border-zinc-300 bg-white p-6"
    >
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-zinc-900">
          {t(RAPPEL.titre, langue)}
        </p>
        <p className="text-base text-zinc-600">{t(RAPPEL.chapo, langue)}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-base font-medium text-zinc-700">
          {t(RAPPEL.email, langue)}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={envoi}
            placeholder="vous@exemple.fr"
            className={champ}
          />
        </label>
        <label className="flex flex-col gap-1 text-base font-medium text-zinc-700">
          {t(RAPPEL.date, langue)}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            disabled={envoi}
            className={champ}
          />
        </label>
        <label className="flex flex-col gap-1 text-base font-medium text-zinc-700">
          {t(RAPPEL.nom, langue)}{" "}
          <span className="font-normal text-zinc-400">
            {t(RAPPEL.facultatif, langue)}
          </span>
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            disabled={envoi}
            className={champ}
          />
        </label>
        <label className="flex flex-col gap-1 text-base font-medium text-zinc-700">
          {t(RAPPEL.etablissement, langue)}{" "}
          <span className="font-normal text-zinc-400">
            {t(RAPPEL.facultatif, langue)}
          </span>
          <input
            value={etablissement}
            onChange={(e) => setEtablissement(e.target.value)}
            disabled={envoi}
            placeholder={t(RAPPEL.placeholderEtablissement, langue)}
            className={champ}
          />
        </label>
        <label className="flex flex-col gap-1 text-base font-medium text-zinc-700 sm:col-span-2">
          {t(RAPPEL.ville, langue)}{" "}
          <span className="font-normal text-zinc-400">
            {t(RAPPEL.facultatif, langue)}
          </span>
          <input
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            disabled={envoi}
            className={champ}
          />
        </label>
      </div>

      {erreur && (
        <p className="text-base text-red-600" role="alert">
          {erreur}
        </p>
      )}

      <button
        type="submit"
        disabled={envoi || !email.trim() || !date}
        className="w-fit rounded-md bg-brand-navy px-5 py-2.5 text-base font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-40"
      >
        {envoi ? t(RAPPEL.enCours, langue) : t(RAPPEL.bouton, langue)}
      </button>

      <p className="text-sm text-zinc-500">{t(RAPPEL.promesse, langue)}</p>
    </form>
  );
}
