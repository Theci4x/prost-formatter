/**
 * L'écran d'attente du tableau de bord.
 *
 * Il ne dit rien d'utile, et c'est exactement son travail : il dit
 * « c'est parti » au doigt qui vient de toucher. Sans lui, le carnet —
 * une dizaine de requêtes — laissait une seconde de silence complet, et
 * une seconde de silence se lit comme un bouton cassé : on retouche, on
 * retouche encore, on finit par croire que l'application est en panne.
 *
 * Il imite la forme d'un écran, pas son contenu : un titre, deux ou trois
 * cartes. Promettre plus — des chiffres en gris, de fausses lignes de
 * réservation — ferait croire une demi-seconde à des données qui ne sont
 * pas encore là.
 */

function Bloc({ className }: { className: string }) {
  return (
    <div className={`klarr-squelette rounded-xl bg-zinc-200 ${className}`} />
  );
}

export function SqueletteEcran() {
  return (
    <div
      className="flex flex-1 flex-col gap-10 px-6 py-8"
      // L'écran change sous les yeux sans que personne l'ait demandé :
      // une liseuse doit l'annoncer, poliment, sans interrompre.
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Chargement…</span>

      {/* L'en-tête : la pastille de l'icône et le titre. */}
      <div className="flex items-center gap-3" aria-hidden="true">
        <Bloc className="h-10 w-10 rounded-2xl" />
        <Bloc className="h-7 w-52" />
      </div>

      <div className="flex flex-col gap-4" aria-hidden="true">
        <Bloc className="h-4 w-full max-w-2xl" />
        <Bloc className="h-4 w-4/5 max-w-xl" />
      </div>

      <div className="flex flex-col gap-3" aria-hidden="true">
        <Bloc className="h-28 rounded-2xl" />
        <Bloc className="h-28 rounded-2xl" />
        <Bloc className="h-28 rounded-2xl" />
      </div>
    </div>
  );
}
