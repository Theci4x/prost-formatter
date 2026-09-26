"use client";

/**
 * Le filet du tableau de bord.
 *
 * Sans lui, une erreur de rendu donne l'écran par défaut de Next — « This
 * page couldn't load », en anglais, sans rien de saisissable. Le
 * restaurateur ne peut ni revenir ni dire ce qui s'est passé, et nous ne
 * pouvons pas relier son appel à une ligne de journal.
 *
 * Ce qui est montré ici tient en deux choses. **Le digest**, que Next
 * calcule pour chaque erreur et qui est la seule information que la
 * production laisse passer — le message, lui, est masqué exprès, pour
 * qu'une requête SQL en échec ne raconte pas la base à un visiteur. C'est
 * ce code qu'on retrouve dans les journaux de l'hébergeur. **Une sortie**,
 * ensuite : réessayer sans recharger, et sinon revenir à la liste des
 * établissements plutôt que de rester coincé sur une page morte.
 */
export default function ErreurDashboard({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-start gap-4 px-6 py-12">
      <h1 className="font-serif text-2xl text-ink">
        Cette page n&apos;a pas pu s&apos;afficher.
      </h1>
      <p className="max-w-4xl text-sm text-zinc-600">
        Rien n&apos;est perdu : tes réservations et ta carte sont en base, et
        cet écran ne les a pas touchées. Réessaie — si ça recommence,
        envoie-nous le code ci-dessous, c&apos;est lui qui nous mène directement
        à la cause.
      </p>

      {error.digest && (
        <p className="rounded-md border border-zinc-200 bg-white px-3 py-2 font-mono text-xs text-zinc-700">
          {error.digest}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
        >
          Réessayer
        </button>
        {/* Un vrai lien, pas <Link> : on sort d'un arbre React en erreur,
            et une navigation côté client le reconstruirait à partir du même
            état. Recharger la page est précisément ce qu'on veut ici. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/dashboard"
          className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
        >
          Revenir à mes établissements
        </a>
        <a
          href="mailto:contact@klarr.net"
          className="text-sm text-brand-navy underline-offset-2 hover:underline"
        >
          Nous écrire
        </a>
      </div>
    </div>
  );
}
