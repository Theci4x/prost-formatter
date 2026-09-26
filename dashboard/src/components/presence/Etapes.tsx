/** Les étapes d'une plateforme, numérotées. */
export function Etapes({ etapes }: { etapes: string[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {etapes.map((etape, index) => (
        <li key={index} className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-semibold text-white">
            {index + 1}
          </span>
          <span className="text-sm leading-relaxed text-zinc-700">{etape}</span>
        </li>
      ))}
    </ol>
  );
}
