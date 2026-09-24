import type { RequeteMesuree } from "@/lib/google/search-console";
import { nombre, plafond } from "@/lib/seo/synthese";

/**
 * Combien de fois on a été vu, et combien de fois choisi — par requête.
 *
 * Deux séries sur la même barre, l'une posée sur l'autre depuis la même
 * origine : la longue et claire dit « vu », la courte et foncée dit
 * « cliqué ». Le rapport des deux se lit sans calcul, et c'est lui qui
 * compte — une requête très vue et jamais cliquée est un titre qui ne
 * donne pas envie, pas un problème de position.
 *
 * En HTML et en CSS, pas en SVG : une barre est une boîte dont la largeur
 * est un pourcentage, et le texte à côté garde sa taille quelle que soit
 * celle de l'écran. Un SVG étiré en largeur déforme ses chiffres ; on l'a
 * vu, on ne le refait pas. L'infobulle est le `title` natif, posé sur la
 * ligne entière — une cible bien plus large que la barre.
 */

/** La barre la plus longue s'arrête là : le reste est pour la valeur. */
const LARGEUR_MAX = 84;

export type LibellesGraphique = {
  titre: string;
  vu: string;
  clique: string;
};

/** Le français par défaut ; la page d'accueil injecte les siens. */
const FRANCAIS: LibellesGraphique = {
  titre: "Les requêtes les plus vues",
  vu: "vu",
  clique: "cliqué",
};

export function GraphiqueRequetes({
  requetes,
  id = "graphique-requetes",
  libelles = FRANCAIS,
  /** Sans infobulle ni survol : une maquette n'a rien à répondre. */
  statique = false,
  infobulle,
}: {
  requetes: RequeteMesuree[];
  id?: string;
  libelles?: LibellesGraphique;
  statique?: boolean;
  /** Le détail au survol, dans la langue de l'écran ; français sinon. */
  infobulle?: (
    vus: string,
    clics: string,
    n: number,
    ctr: number,
    position: number,
  ) => string;
}) {
  const max = plafond(Math.max(0, ...requetes.map((r) => r.impressions)));

  return (
    <figure className="flex flex-col gap-3" aria-labelledby={`${id}-titre`}>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span id={`${id}-titre`} className="text-sm font-medium text-ink">
          {libelles.titre}
        </span>
        <span className="flex items-center gap-4 text-xs text-ink-soft">
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-4 rounded-sm bg-brand-orange/25"
            />
            {libelles.vu}
          </span>
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-4 rounded-sm bg-brand-orange-dark"
            />
            {libelles.clique}
          </span>
        </span>
      </figcaption>

      <ol className="m-0 flex list-none flex-col p-0">
        {requetes.map((r) => {
          const vu = (r.impressions / max) * LARGEUR_MAX;
          // Le clic se mesure par rapport à la barre « vu » : même origine,
          // même échelle, et la proportion se lit d'un coup d'œil.
          const clic = r.impressions > 0 ? (r.clics / r.impressions) * 100 : 0;
          const detail = infobulle
            ? infobulle(
                nombre(r.impressions),
                nombre(r.clics),
                r.clics,
                r.ctr,
                r.position,
              )
            : `${nombre(r.impressions)} fois vu · ${nombre(r.clics)} clic${r.clics > 1 ? "s" : ""} · ${r.ctr} % · position ${r.position}`;
          const bulle = `${r.requete}\n${detail}`;
          return (
            <li
              key={r.requete}
              title={statique ? undefined : bulle}
              className="group flex flex-col gap-1 py-1.5 sm:grid sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] sm:items-center sm:gap-x-3 sm:py-0"
            >
              <span className="truncate text-[13px] text-ink sm:h-[34px] sm:leading-[34px]">
                {r.requete}
              </span>
              {/* L'origine est un filet vertical : la barre en part, elle
                  n'y est pas posée. Carrée à l'origine, arrondie au bout. */}
              <div className="flex h-[26px] items-center border-l border-line sm:h-[34px]">
                <div
                  className="relative h-[22px] shrink-0"
                  style={{ width: `${vu}%` }}
                >
                  <div className="absolute inset-0 rounded-r-[4px] bg-brand-orange/25 transition-colors group-hover:bg-brand-orange/40" />
                  {clic > 0 && (
                    <div
                      className="absolute inset-y-0 left-0 rounded-r-[4px] bg-brand-orange-dark transition group-hover:brightness-110"
                      style={{ width: `${clic}%` }}
                    />
                  )}
                </div>
                {/* La valeur au bout, en encre. Les clics sont dans
                    l'infobulle et dans le tableau : un second chiffre par
                    ligne ferait du bruit. */}
                <span className="ml-2 shrink-0 text-xs tabular-nums text-ink-soft">
                  {nombre(r.impressions)}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
