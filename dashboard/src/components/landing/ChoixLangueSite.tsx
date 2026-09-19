import { choisirLangueVisiteur } from "@/app/langue-actions";
import { CODE_LANGUE, LANGUES, type Langue } from "@/lib/i18n/langue";

/**
 * Le choix de langue dans la barre de la page d'accueil.
 *
 * Il double celui du tableau de bord (`components/dashboard/ChoixLangue`)
 * parce que les deux écrans ne partagent pas leurs couleurs : le tableau
 * de bord est en zinc et bleu, la page d'accueil en crème et orange, avec
 * des variables CSS posées par la page elle-même. Un composant commun
 * demanderait autant de conditions qu'il économise de lignes.
 *
 * Deux caractères par langue, sans étiquette : la barre porte déjà quatre
 * liens et un bouton, et « 中文 » se reconnaît sans qu'on explique ce
 * qu'est le champ — c'est précisément le but.
 */
export function ChoixLangueSite({ courante }: { courante: Langue }) {
  return (
    <form
      style={{ display: "flex", alignItems: "center", gap: 2 }}
      aria-label="Langue / Language / 语言"
    >
      {LANGUES.map((langue) => (
        <button
          key={langue}
          type="submit"
          // La langue par `bind` : le `name` d'un bouton qui porte une
          // action sert à React, pas à nous (voir `langue-actions.ts`).
          formAction={choisirLangueVisiteur.bind(null, langue)}
          aria-current={langue === courante ? "true" : undefined}
          style={{
            fontSize: 13,
            fontWeight: 600,
            padding: "4px 8px",
            borderRadius: 7,
            color: langue === courante ? "var(--ink)" : "var(--ink-soft)",
            background:
              langue === courante ? "var(--accent-soft)" : "transparent",
          }}
        >
          {CODE_LANGUE[langue]}
        </button>
      ))}
    </form>
  );
}
