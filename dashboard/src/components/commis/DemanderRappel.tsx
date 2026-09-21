"use client";

import { useState } from "react";

/**
 * Laisser ses coordonnées, depuis le Commis.
 *
 * Trois champs, dont deux obligatoires. Chaque champ de plus coûte des
 * prospects, et on n'a pas besoin de son prénom séparément pour le
 * rappeler dans le quart d'heure.
 *
 * Il dit ce qu'il envoie. Joindre la dernière question posée est ce qui
 * rend le rappel utile — on sait de quoi parler — mais ça ne se fait pas
 * dans le dos de quelqu'un : c'est écrit sous le bouton.
 */
export function DemanderRappel({
  question,
  onFait,
}: {
  /** La dernière question posée à l'assistant, jointe à la demande. */
  question: string | null;
  onFait: () => void;
}) {
  const [nom, setNom] = useState("");
  const [etablissement, setEtablissement] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const champ =
    "w-full rounded-md border border-zinc-300 px-3 py-2 text-base outline-none focus:border-brand-navy disabled:opacity-50";

  async function envoyer(event: React.FormEvent) {
    event.preventDefault();
    if (envoi) return;
    setEnvoi(true);
    setErreur(null);
    try {
      const reponse = await fetch("/api/commis/rappel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom,
          etablissement,
          email,
          telephone,
          question,
        }),
      });
      if (!reponse.ok) {
        setErreur(await reponse.text());
        return;
      }
      onFait();
    } catch {
      setErreur("L'envoi a échoué. Écrivez-nous à contact@klarr.net.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <form
      onSubmit={envoyer}
      className="flex flex-col gap-2.5 rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5"
    >
      <p className="text-sm font-medium text-zinc-900">On vous rappelle ?</p>
      <input
        value={nom}
        onChange={(e) => setNom(e.target.value)}
        required
        disabled={envoi}
        placeholder="Votre nom"
        aria-label="Votre nom"
        className={champ}
      />
      <input
        value={etablissement}
        onChange={(e) => setEtablissement(e.target.value)}
        disabled={envoi}
        placeholder="Votre restaurant"
        aria-label="Votre restaurant"
        className={champ}
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={envoi}
        placeholder="Votre e-mail"
        aria-label="Votre e-mail"
        className={champ}
      />
      <input
        value={telephone}
        onChange={(e) => setTelephone(e.target.value)}
        disabled={envoi}
        placeholder="Votre téléphone (facultatif)"
        aria-label="Votre téléphone, facultatif"
        className={champ}
      />

      {erreur && (
        <p className="text-sm text-red-600" role="alert">
          {erreur}
        </p>
      )}

      <button
        type="submit"
        disabled={envoi || !nom.trim() || !email.trim()}
        className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-40"
      >
        {envoi ? "Envoi…" : "Demander un rappel"}
      </button>
      <p className="text-xs text-zinc-500">
        {question
          ? "Votre dernière question est jointe, pour qu'on sache de quoi vous parler."
          : "Nous vous rappelons sous 24 h ouvrées."}
      </p>
    </form>
  );
}
