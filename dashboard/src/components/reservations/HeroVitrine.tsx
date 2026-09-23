import Image from "next/image";
import Link from "next/link";

/**
 * La photo qui ouvre le site d'un restaurant, sur toute la largeur.
 *
 * Un site de restaurant se juge avant d'être lu. La couverture tenait
 * jusqu'ici dans une colonne de 768 pixels, comme une vignette d'article ;
 * ici elle prend l'écran, et le nom est posé dessus, en grand. C'est ce
 * que font les sites qu'un restaurateur montre à ses amis, et il n'y a
 * pas de raison que le sien ait l'air d'une page d'application.
 *
 * Le dégradé ne décore pas : il garantit la lisibilité du titre sur une
 * photo qu'on ne choisit pas, salle claire ou cave sombre.
 *
 * Sans photo, le même bloc en crème : la page ne doit pas se retrouver
 * sans nom parce qu'il manque une image.
 */
export function HeroVitrine({
  url,
  legende,
  nom,
  sousTitre,
  adresse,
  note,
  actions,
}: {
  url: string | null;
  legende: string | null;
  nom: string;
  /** « Bistrot · Lyon 2e » — le genre, puis le lieu. */
  sousTitre: string | null;
  adresse: string | null;
  /** « 4,6 sur Google · 412 avis », déjà formé dans la langue. */
  note: string | null;
  actions: { href: string; libelle: string; principale?: boolean }[];
}) {
  const clair = !url;
  return (
    <section
      // `shrink-0` : la section vit dans une colonne flex, et `overflow-hidden`
      // l'autorisait à s'écraser sous son contenu — le titre passait sous la
      // barre.
      className={`relative flex shrink-0 items-end ${
        clair
          ? "bg-brand-cream pt-20 sm:pt-28"
          : "min-h-[560px] h-[74vh] max-h-[820px] overflow-hidden"
      }`}
    >
      {url && (
        <>
          <Image
            src={url}
            alt={legende ?? ""}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />
        </>
      )}

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 sm:pb-16">
        <div className="flex flex-col gap-3">
          {sousTitre && (
            <span
              className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
                clair ? "text-brand-orange-dark" : "text-white/80"
              }`}
            >
              {sousTitre}
            </span>
          )}
          <h1
            className={`max-w-4xl font-serif text-5xl leading-[0.95] sm:text-7xl ${
              clair ? "text-ink" : "text-white"
            }`}
          >
            {nom}
          </h1>
          {adresse && (
            <p
              className={`text-base ${clair ? "text-ink-soft" : "text-white/80"}`}
            >
              {adresse}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {actions.map((a) =>
            a.principale ? (
              <Link
                key={a.href}
                href={a.href}
                className={`rounded-full px-6 py-3 text-sm font-semibold transition-colors ${
                  clair
                    ? "bg-ink text-white hover:bg-brand-navy"
                    : "bg-paper text-ink hover:bg-brand-cream"
                }`}
              >
                {a.libelle}
              </Link>
            ) : (
              <Link
                key={a.href}
                href={a.href}
                className={`rounded-full border px-6 py-3 text-sm font-semibold transition-colors ${
                  clair
                    ? "border-line text-ink hover:border-ink"
                    : "border-white/60 text-white hover:bg-white/10"
                }`}
              >
                {a.libelle}
              </Link>
            ),
          )}
          {note && (
            <span
              className={`ml-auto hidden rounded-full border px-4 py-2 text-sm sm:inline-flex ${
                clair
                  ? "border-line bg-paper text-ink"
                  : "border-white/30 bg-white/10 text-white backdrop-blur"
              }`}
            >
              {note}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
