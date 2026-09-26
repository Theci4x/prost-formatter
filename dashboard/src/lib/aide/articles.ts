import { CATEGORIES, type Article, type CategorieAide } from "@/types/aide";
import { mots, normaliser, racine } from "@/lib/aide/texte";

export { mots, normaliser, racine };

import { article as abonnement } from "@/contenu/aide/abonnement";
import { article as ceQueKlarrNeFaitPas } from "@/contenu/aide/ce-que-klarr-ne-fait-pas";
import { article as combienCaCoute } from "@/contenu/aide/combien-ca-coute";
import { article as klarrEtLesPlateformes } from "@/contenu/aide/klarr-et-les-plateformes";
import { article as questCeQueKlarr } from "@/contenu/aide/qu-est-ce-que-klarr";
import { article as acomptePrivatisation } from "@/contenu/aide/acompte-privatisation";
import { article as carteEnAnglais } from "@/contenu/aide/carte-en-anglais";
import { article as cautionCarte } from "@/contenu/aide/caution-carte";
import { article as comptesEquipe } from "@/contenu/aide/comptes-equipe";
import { article as connecterStripe } from "@/contenu/aide/connecter-stripe";
import { article as demandesReservation } from "@/contenu/aide/demandes-reservation";
import { article as ecranDeService } from "@/contenu/aide/ecran-de-service";
import { article as experiences } from "@/contenu/aide/experiences";
import { article as fermetures } from "@/contenu/aide/fermetures";
import { article as ficheGoogle } from "@/contenu/aide/fiche-google";
import { article as pageDeReservation } from "@/contenu/aide/page-de-reservation";
import { article as planDeSalle } from "@/contenu/aide/plan-de-salle";
import { article as premiersPas } from "@/contenu/aide/premiers-pas";
import { article as privatisation } from "@/contenu/aide/privatisation";
import { article as qrCodeCarte } from "@/contenu/aide/qr-code-carte";
import { article as reservationTelephone } from "@/contenu/aide/reservation-telephone";
import { article as saisirSaCarte } from "@/contenu/aide/saisir-sa-carte";
import { article as statistiques } from "@/contenu/aide/statistiques";

/**
 * Le mode d'emploi, au complet.
 *
 * Les articles sont importés un par un plutôt que lus sur le disque : le
 * contenu part alors dans le paquet construit, sans dépendre de fichiers
 * présents à l'exécution. Ajouter un article, c'est créer son fichier et
 * l'ajouter ici — la liste est volontairement visible, pour qu'on voie d'un
 * coup d'œil ce que Klarr documente.
 */
const TOUS: Article[] = [
  questCeQueKlarr,
  combienCaCoute,
  ceQueKlarrNeFaitPas,
  klarrEtLesPlateformes,
  premiersPas,
  pageDeReservation,
  demandesReservation,
  reservationTelephone,
  ecranDeService,
  statistiques,
  experiences,
  planDeSalle,
  fermetures,
  privatisation,
  saisirSaCarte,
  qrCodeCarte,
  carteEnAnglais,
  connecterStripe,
  acomptePrivatisation,
  cautionCarte,
  abonnement,
  comptesEquipe,
  ficheGoogle,
];

function parOrdre(a: Article, b: Article): number {
  if (a.ordre !== b.ordre) return a.ordre - b.ordre;
  return a.titre.localeCompare(b.titre, "fr");
}

export function tousLesArticles(): Article[] {
  return [...TOUS].sort(parOrdre);
}

export function articleParSlug(slug: string): Article | null {
  return TOUS.find((article) => article.slug === slug) ?? null;
}

export type Rubrique = {
  cle: CategorieAide;
  titre: string;
  resume: string;
  articles: Article[];
};

/** Les articles groupés par rubrique, dans l'ordre du parcours d'un débutant. */
export function rubriques(): Rubrique[] {
  return CATEGORIES.map((categorie) => ({
    ...categorie,
    articles: TOUS.filter((a) => a.categorie === categorie.cle).sort(parOrdre),
  })).filter((rubrique) => rubrique.articles.length > 0);
}

type Champ = { mots: Set<string>; racines: Set<string>; poids: number };
type Entree = { article: Article; champs: Champ[] };

function champ(texte: string, poids: number): Champ {
  const liste = mots(texte);
  return {
    mots: new Set(liste),
    racines: new Set(liste.map(racine)),
    poids,
  };
}

/**
 * L'index, construit une fois. Les articles ne changent qu'au déploiement :
 * re-découper trente-cinq mille caractères à chaque frappe serait du gâchis.
 *
 * On indexe des MOTS, pas des morceaux de texte. C'est ce qui évite que
 * « caisse » remonte sept articles parce qu'ils contiennent « encaisser ».
 */
const INDEX: Entree[] = TOUS.map((article) => ({
  article,
  champs: [
    champ(article.titre, 10),
    champ(article.questions.join(" "), 6),
    champ(article.resume, 3),
    champ(article.markdown, 1),
  ],
}));

/**
 * Une recherche simple, mais qui doit trouver.
 *
 * Le titre et les questions pèsent plus que le corps : quelqu'un qui tape
 * « no show » cherche l'article sur la caution, pas les trois articles qui
 * mentionnent le mot au passage. Chaque mot de la requête doit apparaître
 * quelque part — sinon « acompte terrasse » ramènerait toute la
 * documentation.
 */
export function rechercher(requete: string): Article[] {
  const demandes = mots(requete);
  if (demandes.length === 0) return [];

  const notes = INDEX.map(({ article, champs }) => {
    let note = 0;
    for (const mot of demandes) {
      const souche = racine(mot);
      let trouve = false;
      for (const c of champs) {
        // Le mot exact vaut plein tarif, sa racine la moitié.
        if (c.mots.has(mot)) {
          note += c.poids;
          trouve = true;
        } else if (c.racines.has(souche)) {
          note += c.poids / 2;
          trouve = true;
        }
      }
      if (!trouve) return { article, note: 0 };
    }
    return { article, note };
  });

  return notes
    .filter((entree) => entree.note > 0)
    .sort((a, b) => b.note - a.note || parOrdre(a.article, b.article))
    .map((entree) => entree.article);
}

/**
 * Tout le mode d'emploi en un seul texte. C'est ce que lira le Commis pour
 * répondre — et c'est la raison d'être de ce fichier : il ne pourra citer
 * que ce qui est écrit ici.
 */
export function corpusComplet(): string {
  return tousLesArticles()
    .map(
      (article) =>
        `# ${article.titre}\n\n` +
        `Questions : ${article.questions.join(" / ")}\n\n` +
        `${article.markdown.trim()}`,
    )
    .join("\n\n---\n\n");
}
