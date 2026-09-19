import { teinteBillet } from "@/lib/blog/teintes";
import type { Illustration } from "@/types/blog";

/**
 * La couverture d'un billet, telle qu'elle s'affiche sur le site.
 *
 * Elle ne porte pas le titre : sur la page de l'article il est déjà juste
 * au-dessus, et sur une carte il est juste en dessous. Une image qui
 * répète le texte qu'elle accompagne n'ajoute rien et fait bavard.
 *
 * Elle reste volontairement basse. Un grand aplat de couleur sans photo ne
 * se lit pas comme un parti pris graphique : il se lit comme une image qui
 * n'a pas fini de charger. En bandeau, la même couleur devient un repère.
 *
 * Dessinée en SVG : rien à télécharger, net à toutes les tailles, et elle
 * suit la palette au lieu de vieillir dans un dossier d'images. Le libellé
 * est en HTML par-dessus, pas dans le SVG : le SVG est étiré pour remplir
 * la largeur, et du texte étiré se voit tout de suite.
 */
export function Couverture({
  slug,
  rubrique,
  image,
  ratio = 3.4,
  ratioPhoto = 1.9,
}: {
  slug: string;
  rubrique: string;
  /** Quand elle existe, la photo remplace le motif. */
  image?: Illustration;
  ratio?: number;
  /**
   * Une photo ne se recadre pas comme un aplat : le bandeau très plat qui
   * va bien à un motif décapiterait le sujet. D'où deux proportions.
   */
  ratioPhoto?: number;
}) {
  const { fond, trait } = teinteBillet(slug);

  if (image) {
    return (
      <figure
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: String(ratioPhoto),
          background: fond,
          margin: 0,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- photo
            servie telle quelle depuis /public : la faire passer par
            l'optimiseur ajouterait un aller-retour sans rien gagner sur
            une image déjà dimensionnée à la main. */}
        <img
          src={image.fichier}
          alt={image.alt}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        {/* Le même trait de couleur que les couvertures dessinées : c'est
            lui qui fait tenir la série ensemble quand les deux se
            côtoient sur le sommaire. */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 3,
            background: trait,
          }}
        />
      </figure>
    );
  }

  const hachures = `hachures-${slug}`;
  const halo = `halo-${slug}`;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: String(ratio),
        background: fond,
      }}
    >
      <svg
        viewBox="0 0 320 96"
        preserveAspectRatio="none"
        role="presentation"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <defs>
          <pattern
            id={hachures}
            width="9"
            height="9"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(35)"
          >
            <line x1="0" y1="0" x2="0" y2="9" stroke={trait} strokeWidth="1" />
          </pattern>
          <radialGradient id={halo} cx="84%" cy="22%" r="78%">
            <stop offset="0%" stopColor={trait} stopOpacity="0.4" />
            <stop offset="100%" stopColor={trait} stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect
          width="320"
          height="96"
          fill={`url(#${hachures})`}
          opacity="0.12"
        />
        <rect width="320" height="96" fill={`url(#${halo})`} />
        <rect width="320" height="2.5" fill={trait} />
      </svg>

      <span
        style={{
          position: "absolute",
          left: "1.25rem",
          bottom: "0.85rem",
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.72)",
        }}
      >
        {rubrique}
      </span>
    </div>
  );
}
