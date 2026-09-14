import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";
import { siteUrl } from "@/lib/site-url";

/**
 * La signature de Klarr au bas des pages vues par les clients du
 * restaurant : page de réservation, carte, vitrine, confirmation.
 *
 * Le nom mène à Klarr. C'est la seule publicité qu'on s'accorde sur la page
 * d'un client, et elle vaut mieux qu'une mention morte : un restaurateur
 * qui dîne ailleurs, voit cette page et se demande d'où elle sort doit
 * pouvoir le découvrir d'un clic.
 *
 * Nouvel onglet : le lecteur était en train de réserver une table. Le
 * sortir de la page du restaurant pour lui montrer la nôtre serait un
 * mauvais service rendu à celui qui nous paie.
 */
export function SignatureKlarr({
  texte,
  className = "",
}: {
  /** Ce qui précède le nom : « Réservations propulsées par ». */
  texte: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 text-sm text-zinc-400 ${className}`}>
      <KlarrMark size={16} />
      <span>
        {texte}{" "}
        <a
          href={siteUrl()}
          target="_blank"
          rel="noopener"
          className="transition-colors hover:text-brand-orange"
        >
          <KlarrWordmark className="text-zinc-500" />
        </a>
      </span>
    </div>
  );
}
