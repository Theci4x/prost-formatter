import type { MediaInstagram } from "@/lib/facebook/oauth";
import type { Langue } from "@/lib/i18n/langues";
import { VITRINE } from "@/lib/i18n/vitrine";

/**
 * La bande Instagram de la vitrine.
 *
 * Volontairement muette : pas de légendes, pas de compteurs, pas de dates.
 * Ce qu'un visiteur vient chercher ici, ce sont les assiettes et la salle
 * — le texte qui les entoure appartient à Instagram, et l'y renvoyer est
 * précisément le but.
 *
 * Les images ne passent pas par `next/image`, et c'est délibéré : les
 * adresses fournies par Meta sont signées et expirent au bout de quelques
 * jours. Les faire optimiser reviendrait à re-générer chaque vignette à
 * chaque rotation de signature — un coût permanent pour un bénéfice nul,
 * Instagram servant déjà des images calibrées.
 */
/** Faute de pseudo, on nomme l'établissement plutôt que de laisser un trou. */
const SANS_PSEUDO: Record<Langue, string> = {
  fr: "l’établissement",
  en: "the restaurant",
  zh: "本店",
};

export function FluxInstagram({
  pseudo,
  medias,
  langue = "fr",
}: {
  pseudo: string;
  medias: MediaInstagram[];
  langue?: Langue;
}) {
  const v = VITRINE[langue];
  const nomParDefaut = SANS_PSEUDO[langue] ?? SANS_PSEUDO.fr;
  if (medias.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-lg font-semibold text-zinc-900">
          {v.enCeMomentSurInstagram}
        </h2>
        {pseudo && (
          <a
            href={`https://www.instagram.com/${pseudo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-zinc-500 transition-colors hover:text-brand-navy"
          >
            @{pseudo}
          </a>
        )}
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {medias.map((media) => (
          <li key={media.id}>
            <a
              href={media.permalien}
              target="_blank"
              rel="noopener noreferrer"
              className="group block overflow-hidden rounded-xl bg-zinc-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element --
                  choix assumé, expliqué en tête de fichier : les adresses
                  de Meta sont signées et expirent. */}
              <img
                src={media.image}
                // La légende décrit rarement l'image ; annoncer « photo
                // publiée par le restaurant » est plus honnête qu'un texte
                // alternatif inventé, et moins bavard qu'une légende
                // entière lue à voix haute.
                alt={v.publicationInstagram(pseudo || nomParDefaut)}
                loading="lazy"
                decoding="async"
                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
