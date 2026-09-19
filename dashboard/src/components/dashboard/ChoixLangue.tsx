import { choisirLangue } from "@/app/dashboard/langue-actions";
import { LANGUES, NOM_LANGUE, type Langue } from "@/lib/i18n/langue";

/**
 * Le choix de la langue, en trois boutons plutôt qu'en liste déroulante.
 *
 * Quelqu'un qui ne lit pas le français doit pouvoir en sortir sans
 * comprendre l'étiquette qui surmonte le champ : « 中文 » se reconnaît
 * même quand tout le reste de l'écran est illisible. Une liste déroulante
 * cacherait les options derrière un clic et un mot français.
 */
export function ChoixLangue({
  courante,
  libelle,
  action = choisirLangue,
}: {
  courante: Langue;
  libelle: string;
  /** Le compte pour un inscrit, un témoin pour un visiteur. */
  action?: (formData: FormData) => Promise<void>;
}) {
  return (
    <form className="flex items-center gap-2">
      <span className="text-xs text-zinc-500">{libelle}</span>
      {LANGUES.map((langue) => (
        <button
          key={langue}
          type="submit"
          formAction={action}
          name="langue"
          value={langue}
          aria-current={langue === courante ? "true" : undefined}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            langue === courante
              ? "bg-brand-navy text-white"
              : "text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          {NOM_LANGUE[langue]}
        </button>
      ))}
    </form>
  );
}
