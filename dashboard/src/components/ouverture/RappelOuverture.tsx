"use client";

import { useState } from "react";

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
 */
export function RappelOuverture({ source }: { source: string }) {
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
        setErreur(await reponse.text());
        return;
      }
      setFait(true);
    } catch {
      setErreur("L'envoi a échoué. Écrivez-nous à contact@klarr.net.");
    } finally {
      setEnvoi(false);
    }
  }

  if (fait) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="text-sm font-semibold text-emerald-900">
          C&apos;est noté. On vous rappelle le mois venu.
        </p>
        <p className="mt-1.5 text-base text-emerald-800">
          D&apos;ici là, vous n&apos;entendrez pas parler de nous. Si votre date
          bouge, revenez remplir le même formulaire : elle se corrige.
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
          On vous rappelle le mois de votre ouverture ?
        </p>
        <p className="text-base text-zinc-600">
          Votre carnet de réservation, votre fiche Google et vos premiers
          couverts se décident dans les semaines qui précèdent l&apos;ouverture.
          C&apos;est là qu&apos;on vous est utile, pas aujourd&apos;hui.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-base font-medium text-zinc-700">
          Votre e-mail
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
          Votre date d&apos;ouverture
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
          Votre nom{" "}
          <span className="font-normal text-zinc-400">(facultatif)</span>
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            disabled={envoi}
            className={champ}
          />
        </label>
        <label className="flex flex-col gap-1 text-base font-medium text-zinc-700">
          Le restaurant{" "}
          <span className="font-normal text-zinc-400">(facultatif)</span>
          <input
            value={etablissement}
            onChange={(e) => setEtablissement(e.target.value)}
            disabled={envoi}
            placeholder="Nom, ou « pas encore décidé »"
            className={champ}
          />
        </label>
        <label className="flex flex-col gap-1 text-base font-medium text-zinc-700 sm:col-span-2">
          La ville{" "}
          <span className="font-normal text-zinc-400">(facultatif)</span>
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
        {envoi ? "Enregistrement…" : "Me rappeler le moment venu"}
      </button>

      <p className="text-sm text-zinc-500">
        Votre adresse ne sert qu&apos;à ça : un appel ou un message, une fois,
        le mois de votre ouverture. Pas de lettre d&apos;information, pas de
        revente, rien entre-temps. Pour être retiré de la liste avant ou après,
        un mot à contact@klarr.net suffit.
      </p>
    </form>
  );
}
