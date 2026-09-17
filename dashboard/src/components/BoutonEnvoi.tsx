"use client";

import { useFormStatus } from "react-dom";

/**
 * Un bouton d'envoi qui dit qu'il a compris.
 *
 * Une action serveur qui ouvre un écran peut prendre deux secondes : le
 * temps de lire la base, d'écrire, puis de rendre la page suivante. Sans
 * signal, ces deux secondes ressemblent à une panne — on clique, rien ne
 * bouge, on conclut que le bouton ne marche pas. C'est arrivé.
 *
 * `useFormStatus` ne lit l'état que du formulaire qui l'entoure, et
 * seulement depuis un composant enfant : d'où ce composant séparé plutôt
 * qu'un `pending` remonté à la main.
 */
export function BoutonEnvoi({
  libelle,
  enCours,
  className,
}: {
  libelle: string;
  /** Le texte pendant l'envoi. */
  enCours: string;
  className: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} disabled:opacity-60`}
    >
      {pending ? enCours : libelle}
    </button>
  );
}
