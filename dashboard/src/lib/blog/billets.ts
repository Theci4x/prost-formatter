import {
  CATEGORIES_BLOG,
  type Billet,
  type CategorieBillet,
} from "@/types/blog";

import { billet as ouvrirChecklist } from "@/contenu/blog/ouvrir-un-restaurant-checklist";
import { billet as avantTravaux } from "@/contenu/blog/avant-travaux-diagnostics";
import { billet as chantier } from "@/contenu/blog/chantier-obligations-employeur";
import { billet as declarationSanitaire } from "@/contenu/blog/declaration-sanitaire-ddpp";
import { billet as impactSonore } from "@/contenu/blog/etude-impact-sonore";
import { billet as permisLicence } from "@/contenu/blog/permis-exploitation-licence";
import { billet as menuOuCarte } from "@/contenu/blog/menu-ou-carte";
import { billet as livraison } from "@/contenu/blog/livraison-plateformes";
import { billet as noShow } from "@/contenu/blog/no-show";
import { billet as avisGoogle } from "@/contenu/blog/avis-google";
import { billet as erp } from "@/contenu/blog/erp-commission-securite";
import { billet as tvaMenuVin } from "@/contenu/blog/tva-menu-vin";
import { billet as sacemSpre } from "@/contenu/blog/sacem-spre";
import { billet as haccp } from "@/contenu/blog/haccp-pms";
import { billet as terrasse } from "@/contenu/blog/terrasse";
import { billet as organisationSalle } from "@/contenu/blog/organisation-salle";
import { billet as sansCommission } from "@/contenu/blog/reservations-sans-commission";
import { billet as visibiliteIa } from "@/contenu/blog/visibilite-ia-chatgpt";
import { billet as ficheGoogle } from "@/contenu/blog/fiche-google-ligne-par-ligne";

/**
 * Les billets, importés un par un plutôt que lus sur le disque.
 *
 * Même raison que pour le mode d'emploi : un import explicite se voit dans
 * une revue de code, et un billet qu'on oublie de brancher se remarque
 * ici, pas six mois plus tard en constatant qu'il n'a jamais été indexé.
 */
const TOUS: Billet[] = [
  ouvrirChecklist,
  avantTravaux,
  chantier,
  declarationSanitaire,
  impactSonore,
  permisLicence,
  menuOuCarte,
  livraison,
  noShow,
  avisGoogle,
  erp,
  tvaMenuVin,
  sacemSpre,
  haccp,
  terrasse,
  organisationSalle,
  sansCommission,
  visibiliteIa,
  ficheGoogle,
];

/** Du plus récent au plus ancien : c'est l'ordre d'un blog. */
export function tousLesBillets(): Billet[] {
  return [...TOUS].sort((a, b) => b.publieLe.localeCompare(a.publieLe));
}

export function billetParSlug(slug: string): Billet | null {
  return TOUS.find((billet) => billet.slug === slug) ?? null;
}

/** Les catégories qui ont au moins un billet, avec les leurs. */
export function rubriquesBlog(): {
  cle: CategorieBillet;
  titre: string;
  resume: string;
  billets: Billet[];
}[] {
  return CATEGORIES_BLOG.map((categorie) => ({
    ...categorie,
    billets: tousLesBillets().filter(
      (billet) => billet.categorie === categorie.cle,
    ),
  })).filter((rubrique) => rubrique.billets.length > 0);
}

/**
 * Les billets voisins d'un billet donné : même rubrique, lui excepté.
 * Quelqu'un arrivé par une recherche lit un article et repart ; ces liens
 * sont la seule chance de lui en montrer un deuxième.
 */
export function memeRubrique(billet: Billet, combien = 3): Billet[] {
  return tousLesBillets()
    .filter(
      (autre) =>
        autre.categorie === billet.categorie && autre.slug !== billet.slug,
    )
    .slice(0, combien);
}

/**
 * Ce qu'on propose de lire après, dans l'ordre choisi par l'article
 * lui-même. À défaut, ses voisins de rubrique.
 */
export function aLireEnsuite(
  billet: Billet,
): { billet: Billet; pourquoi: string }[] {
  if (!billet.suite?.length) {
    return memeRubrique(billet).map((autre) => ({
      billet: autre,
      pourquoi: "",
    }));
  }
  return billet.suite.flatMap(({ slug, pourquoi }) => {
    const autre = billetParSlug(slug);
    // Un slug qui ne répond plus est une erreur de saisie : on ne casse
    // pas la page pour autant, mais la liaison manquante se voit ici.
    if (!autre) {
      console.warn(`[blog] suite introuvable depuis ${billet.slug} : ${slug}`);
      return [];
    }
    return [{ billet: autre, pourquoi }];
  });
}

/** « 14 septembre 2026 », pour l'affichage. */
export function dateLisible(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
