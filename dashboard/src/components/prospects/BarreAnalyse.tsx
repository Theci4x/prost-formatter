/**
 * La barre qui accompagne l'attente.
 *
 * L'audit interroge Google, va chercher le site du restaurant puis pose la
 * question à une IA : une dizaine de secondes, parfois trente. Sans rien à
 * l'écran, on croit que le bouton n'a pas marché — c'est exactement ce
 * qu'on s'est dit la première fois.
 *
 * Elle avance sans jamais afficher de pourcentage : nous ne savons pas où
 * nous en sommes, et une barre qui prétend le savoir puis reste bloquée à
 * 90 % inquiète davantage qu'une barre qui ne promet rien. Les étapes
 * défilent en revanche dans leur ordre réel.
 */
export function BarreAnalyse({ libelle }: { libelle: string }) {
  return (
    <div className="flex flex-col gap-2" role="status" aria-live="polite">
      <div className="h-1 w-full overflow-hidden rounded-full bg-brand-sand">
        <div className="klarr-attente h-full w-1/3 rounded-full bg-brand-orange" />
      </div>
      <p className="text-sm text-ink-soft">{libelle}</p>
    </div>
  );
}
