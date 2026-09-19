/**
 * Le blog de Klarr.
 *
 * Deux différences avec le mode d'emploi, et elles commandent la forme :
 *
 * Un article d'aide explique Klarr à quelqu'un qui l'utilise déjà. Un billet
 * s'adresse à quelqu'un qui ne nous connaît pas, arrivé par une recherche.
 * Il doit donc répondre entièrement à sa question, même si la réponse ne
 * mène à aucun produit.
 *
 * Et un billet parle de règles qui changent. D'où la date de mise à jour et
 * les sources : un texte réglementaire non daté et non sourcé ne vaut rien,
 * ni pour le lecteur qui doit savoir à quand il remonte, ni pour nous qui
 * devrons le relire.
 */

export type CategorieBillet = "ouvrir" | "remplir" | "gerer";

export const CATEGORIES_BLOG: {
  cle: CategorieBillet;
  titre: string;
  resume: string;
}[] = [
  {
    cle: "ouvrir",
    titre: "Ouvrir un restaurant",
    resume:
      "Les démarches, les diagnostics et les autorisations, dans l'ordre où elles se présentent.",
  },
  {
    cle: "remplir",
    titre: "Remplir sa salle",
    resume:
      "Se faire trouver, se faire choisir, et transformer une recherche en réservation.",
  },
  {
    cle: "gerer",
    titre: "Tenir la maison",
    resume:
      "Marges, canaux de vente, réservations, no-shows : ce qui se joue entre la demande et l'encaissement.",
  },
];

export type Illustration = {
  /** Chemin sous /public, par exemple « /blog/ouvrir-paperasse.jpg ». */
  fichier: string;
  /**
   * La description pour qui ne voit pas l'image. Décrire ce qu'elle
   * montre, pas répéter le titre : un lecteur d'écran qui énonce deux
   * fois la même phrase fait perdre du temps au lieu d'en donner.
   */
  alt: string;
  /** L'auteur ou la provenance, affiché sous l'image quand il est fourni. */
  credit?: string;
};

export type Source = {
  /** Ce qu'on cite : « Code du travail, article R4412-97 ». */
  intitule: string;
  url: string;
};

export type Billet = {
  slug: string;
  titre: string;
  /** Une phrase : c'est elle qui s'affiche dans Google sous le titre. */
  resume: string;
  categorie: CategorieBillet;
  /** Format ISO. La publication ne bouge pas, la mise à jour si. */
  publieLe: string;
  misAJourLe: string;
  /**
   * Les textes sur lesquels l'article s'appuie. Obligatoires dès qu'on
   * affirme une obligation légale : sans eux, le lecteur ne peut pas
   * vérifier, et nous ne pouvons pas relire.
   */
  sources: Source[];
  /**
   * Trois ou quatre phrases en tête d'article : ce qu'on retient si on ne
   * lit que ça. La moitié des gens ne liront que ça — autant que ce soit
   * écrit pour eux plutôt que subi.
   */
  essentiel?: string[];
  /**
   * La photo d'en-tête, quand il y en a une. Sans elle, le billet reçoit
   * une couverture dessinée : c'est un repli correct, pas un équivalent.
   * Une photo prise sur place dit au lecteur que l'article vient de
   * quelqu'un qui y était, ce qu'aucun aplat de couleur ne dira jamais.
   */
  image?: Illustration;
  /**
   * Ce qu'il faut lire ensuite, choisi à la main et sans se limiter à la
   * rubrique.
   *
   * « Dans la même rubrique » n'emmène nulle part : dix articles sur
   * l'ouverture renvoient à neuf autres articles sur l'ouverture, et le
   * lecteur tourne en rond dans la partie du journal qui ne lui vendra
   * rien. Or celui qui lit le HACCP aujourd'hui ouvrira dans six mois et
   * cherchera alors comment remplir sa salle : autant le lui dire
   * maintenant.
   *
   * Chaque lien porte sa raison. Un titre seul ne se clique pas ; « vous
   * ouvrez dans six mois, voilà comment on vous trouvera », si.
   */
  suite?: { slug: string; pourquoi: string }[];
  markdown: string;
};

export function titreCategorieBillet(cle: CategorieBillet): string {
  return CATEGORIES_BLOG.find((c) => c.cle === cle)?.titre ?? "Blog";
}

/**
 * Le temps de lecture, en minutes. Deux cent trente mots à la minute : la
 * moyenne d'un lecteur français sur écran, arrondie à la minute supérieure
 * parce que personne n'a jamais lu quoi que ce soit en « 4,3 minutes ».
 */
export function tempsDeLecture(markdown: string): number {
  // Le chinois ne sépare pas ses mots par des espaces : compter les
  // groupes séparés par des blancs donnait « 1 minute » pour un article
  // entier. On compte donc les idéogrammes, à quatre cents la minute —
  // le rythme couramment retenu pour une lecture à l'écran —, et les
  // mots pour le reste.
  const texte = markdown.trim();
  const ideogrammes = (texte.match(/[\u4e00-\u9fff]/g) ?? []).length;
  if (ideogrammes > 50) return Math.max(1, Math.ceil(ideogrammes / 400));

  const mots = texte.split(/\s+/).length;
  return Math.max(1, Math.ceil(mots / 230));
}

/**
 * Les langues du journal.
 *
 * Le français fait foi : c'est lui qui porte la catégorie, les dates, les
 * sources et les liens de suite. Une traduction n'est pas une variante
 * d'affichage — c'est un article, avec sa propre adresse, qui se référence
 * et s'indexe pour lui-même. D'où le slug dans chaque langue.
 */
export type LangueJournal = "fr" | "en" | "zh";

export const LANGUES_JOURNAL: LangueJournal[] = ["fr", "en", "zh"];

export type TraductionBillet = {
  /**
   * L'adresse dans cette langue, sans préfixe : « opening-a-restaurant-in-
   * france-checklist ». Traduite plutôt que recopiée du français — c'est
   * la moitié du bénéfice qu'on attend d'une page traduite.
   */
  slug: string;
  titre: string;
  resume: string;
  essentiel?: string[];
  markdown: string;
  /**
   * Les sources restent en français, et ce n'est pas un oubli : ce sont
   * les intitulés exacts de textes de loi français, et les traduire
   * empêcherait le lecteur de les retrouver. Ce champ ne sert qu'à en
   * ajouter une propre à la version traduite — un guide officiel en
   * anglais, par exemple.
   */
  sources?: Source[];
};

/** Le préfixe d'adresse d'une langue. Le français n'en a pas : ses URL sont déjà indexées. */
export function cheminJournal(langue: LangueJournal): string {
  return langue === "fr" ? "/blog" : `/blog/${langue}`;
}
