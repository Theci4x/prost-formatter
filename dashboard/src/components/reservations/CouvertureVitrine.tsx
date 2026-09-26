import Image from "next/image";

/**
 * L'image qui ouvre la vitrine.
 *
 * Un site de restaurant se juge avant d'être lu. La grille de vignettes
 * qui ouvrait la page donnait à voir six photos et n'en montrait aucune :
 * une seule, en grand, fait le travail que six petites ne font pas.
 *
 * Le nom est posé dessus, en bas, sur un dégradé. Deux raisons : le
 * visiteur sait où il est sans descendre, et le titre reste lisible quelle
 * que soit la photo — une salle claire ou une cave sombre.
 */
export function CouvertureVitrine({
  url,
  nom,
  legende,
  adresse,
}: {
  url: string;
  nom: string;
  legende: string | null;
  adresse: string | null;
}) {
  return (
    <div className="relative -mx-6 aspect-[4/5] overflow-hidden sm:mx-0 sm:aspect-[16/9] sm:rounded-2xl">
      <Image
        src={url}
        // La couverture illustre l'établissement : la décrire une
        // deuxième fois après le titre qui la surmonte n'apporte rien à
        // un lecteur d'écran. La légende, elle, dit quelque chose.
        alt={legende ?? ""}
        fill
        // Pleine largeur sur téléphone, bornée par la colonne ensuite :
        // sans ça le navigateur télécharge une image de 1 500 pixels pour
        // en afficher 350.
        sizes="(max-width: 640px) 100vw, 768px"
        priority
        className="object-cover"
      />

      {/* Le dégradé ne sert pas à décorer : il garantit le contraste du
          titre sur une photo qu'on ne choisit pas. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-6">
        <h1 className="text-3xl font-semibold text-white drop-shadow-sm sm:text-4xl">
          {nom}
        </h1>
        {adresse && (
          <p className="text-sm text-white/90 drop-shadow-sm">{adresse}</p>
        )}
      </div>
    </div>
  );
}
