import Link from "next/link";
import Image from "next/image";
import type { Pouls } from "@/lib/dashboard/pouls";
import { publicationsGoogleOuvertes } from "@/lib/google/business";
import { campagnesOuvertes } from "@/lib/campagnes/message";
import type { ClesAccueil } from "@/lib/i18n/accueil";
import {
  DETAILS,
  dateCourte,
  type DetailsAccueil,
} from "@/lib/i18n/detailsAccueil";
import type { Langue } from "@/lib/i18n/langue";
import { peutGerer, type Role } from "@/lib/equipe/roles";
import {
  type Acces,
  LIBELLE_MODULE,
  moduleDeLaSection,
  sectionOuverte,
  PRIX_MODULE,
} from "@/lib/abonnement/modules";
import { DeleteRestaurantButton } from "@/components/restaurants/DeleteRestaurantButton";

/**
 * Un établissement sur l'accueil du tableau de bord.
 *
 * Avant : seize cases identiques, même taille, même poids, aucun chiffre.
 * Un plan du site. Ici, l'écran est rangé comme la journée d'un
 * restaurateur : ce qui se passe aujourd'hui en haut et en gros, puis sa
 * maison, puis sa visibilité, et les réglages en petit tout en bas —
 * personne n'ouvre « Abonnement » tous les matins.
 *
 * Chaque case porte un fait (« 2 à lire », « publiée · 42 plats ») et un
 * point orange quand il y a quelque chose à faire : le regard va tout
 * seul là où il y a du travail.
 */

type Minimum = "gerant" | "proprietaire" | undefined;

type Entree = {
  href: string;
  label: string;
  resume: string;
  icone: React.ReactNode;
  minimum?: Minimum;
  /** Le fait du jour, calculé sur le pouls. Null : la phrase par défaut. */
  detail?: (p: Pouls) => string | null;
  /** Vrai quand il y a quelque chose à faire. */
  attention?: (p: Pouls) => boolean;
};

type Groupe = { titre: string; entrees: Entree[]; compact?: boolean };

function Icone({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// Une icône par idée, et jamais deux fois la même : l'ancien écran
// donnait l'étoile aux avis et aux retours, la fourchette à la carte et
// aux expériences, le maillon aux connexions et à l'équipe.
const ICONES = {
  roue: (
    <Icone>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3.8 7.5l16.4 9M3.8 16.5l16.4-9" />
    </Icone>
  ),
  reservations: (
    <Icone>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M8 2v4M16 2v4M3 10h18" />
    </Icone>
  ),
  campagnes: (
    <Icone>
      <path d="M4 4h16v16H4z" />
      <path d="m4 6 8 6 8-6" />
    </Icone>
  ),
  clients: (
    <Icone>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    </Icone>
  ),
  service: (
    <Icone>
      <path d="M4 20h16" />
      <path d="M6 20V10a6 6 0 0 1 12 0v10" />
      <path d="M12 4v0" />
    </Icone>
  ),
  vitrine: (
    <Icone>
      <path d="M3 9l1.5-5h15L21 9" />
      <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
      <path d="M5 11v9h14v-9" />
      <path d="M10 20v-5h4v5" />
    </Icone>
  ),
  menu: (
    <Icone>
      <path d="M7 3v6a2 2 0 0 0 2 2v10M7 3v6M4 3v6" />
      <path d="M17 3c-1.5 1-2 3-2 5s.5 3 2 4v9" />
    </Icone>
  ),
  photos: (
    <Icone>
      <path d="M4 8h3l2-3h6l2 3h3v12H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </Icone>
  ),
  faq: (
    <Icone>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7" />
      <path d="M12 17h.01" />
    </Icone>
  ),
  experiences: (
    <Icone>
      <path d="M3 9a2 2 0 0 0 0 6v3h18v-3a2 2 0 0 0 0-6V6H3z" />
      <path d="M13 6v12" strokeDasharray="2 3" />
    </Icone>
  ),
  avis: (
    <Icone>
      <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z" />
    </Icone>
  ),
  retours: (
    <Icone>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" />
    </Icone>
  ),
  seo: (
    <Icone>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </Icone>
  ),
  posts: (
    <Icone>
      <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </Icone>
  ),
  ia: (
    <Icone>
      <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
      <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
    </Icone>
  ),
  connexions: (
    <Icone>
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </Icone>
  ),
  paiements: (
    <Icone>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M6 15h4" />
    </Icone>
  ),
  equipe: (
    <Icone>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
    </Icone>
  ),
  abonnement: (
    <Icone>
      <path d="M4 4h16v16H4z" />
      <path d="M8 9h8M8 13h5" />
    </Icone>
  ),
  notifications: (
    <Icone>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </Icone>
  ),
};

function groupes(t: ClesAccueil, d: DetailsAccueil, langue: Langue): Groupe[] {
  return [
    {
      titre: t.groupes.service,
      entrees: [
        {
          href: "reservations",
          label: t.entrees.reservations.label,
          resume: t.entrees.reservations.resume,
          icone: ICONES.reservations,
          detail: (p) =>
            p.aConfirmer > 0 ? d.aConfirmer(p.aConfirmer) : d.rienEnAttente,
          attention: (p) => p.aConfirmer > 0,
        },
        {
          href: "clients",
          label: t.entrees.clients.label,
          resume: t.entrees.clients.resume,
          icone: ICONES.clients,
          minimum: "gerant",
          // L'écart entre les deux chiffres est ce qu'on veut lui
          // montrer : il dit combien de clients sont passés sans cocher
          // la case, donc ce que vaut le fichier aujourd'hui.
          detail: (p) =>
            p.contacts.total > 0
              ? d.clients(p.contacts.total, p.contacts.joignables)
              : d.aucunClient,
        },
        // Masquées tant que le domaine d'envoi n'est pas vérifié : une
        // campagne programmée qui ne part jamais coûte plus cher qu'une
        // entrée de menu absente.
        ...(campagnesOuvertes()
          ? [
              {
                href: "campagnes",
                label: t.entrees.campagnes.label,
                resume: t.entrees.campagnes.resume,
                icone: ICONES.campagnes,
                minimum: "gerant" as const,
                detail: (p: Pouls) =>
                  p.contacts.joignables > 0
                    ? d.destinataires(p.contacts.joignables)
                    : d.personneAcceptee,
              },
            ]
          : []),
        {
          href: "service",
          label: t.entrees.service.label,
          resume: t.entrees.service.resume,
          icone: ICONES.service,
          detail: (p) => {
            const total = p.couvertsMidi + p.couvertsSoir;
            return total > 0 ? d.couvertsAujourdhui(total) : d.aucunCouvert;
          },
        },
      ],
    },
    {
      titre: t.groupes.maison,
      entrees: [
        {
          href: "vitrine",
          label: t.entrees.vitrine.label,
          resume: t.entrees.vitrine.resume,
          icone: ICONES.vitrine,
          minimum: "gerant",
          detail: (p) => (p.sitePublie ? d.enLigne : d.pasPublie),
          attention: (p) => !p.sitePublie,
        },
        {
          href: "menu",
          label: t.entrees.carte.label,
          resume: t.entrees.carte.resume,
          icone: ICONES.menu,
          minimum: "gerant",
          detail: (p) =>
            p.cartePubliee
              ? d.cartePubliee(p.nombrePlats)
              : p.nombrePlats > 0
                ? d.carteNonPubliee(p.nombrePlats)
                : d.carteVide,
        },
        {
          href: "photos",
          label: t.entrees.photos.label,
          resume: t.entrees.photos.resume,
          icone: ICONES.photos,
          minimum: "gerant",
          detail: (p) =>
            p.nombrePhotos > 0
              ? d.photos(p.nombrePhotos, Boolean(p.couvertureUrl))
              : d.aucunePhoto,
          attention: (p) => p.nombrePhotos === 0,
        },
        {
          href: "faq",
          label: t.entrees.faq.label,
          resume: t.entrees.faq.resume,
          icone: ICONES.faq,
          minimum: "gerant",
          // Un avancement plutôt qu'un total : « 7 questions » se lit
          // comme un travail fini, « 3 sur 7 » dit qu'il en reste. Et la
          // case s'allume tant que ce n'est pas le cas — ces réponses
          // sont ce qui épargne les appels en plein service.
          detail: (p) =>
            d.avancement(
              p.questionsSuggerees.repondues,
              p.questionsSuggerees.attendues,
            ),
          attention: (p) =>
            p.questionsSuggerees.repondues < p.questionsSuggerees.attendues,
        },
        {
          href: "experiences",
          label: t.entrees.experiences.label,
          resume: t.entrees.experiences.resume,
          icone: ICONES.experiences,
          minimum: "gerant",
        },
      ],
    },
    {
      titre: t.groupes.visibilite,
      entrees: [
        {
          href: "avis",
          label: t.entrees.avis.label,
          resume: t.entrees.avis.resume,
          icone: ICONES.avis,
          minimum: "gerant",
          detail: (p) =>
            p.note != null
              ? d.note(
                  p.note.toFixed(1).replace(".", ","),
                  p.nombreAvis ?? 0,
                  p.avisCetteSemaine ?? null,
                )
              : d.premierReleve,
        },
        {
          href: "retours",
          label: t.entrees.retours.label,
          resume: t.entrees.retours.resume,
          icone: ICONES.retours,
          minimum: "gerant",
          detail: (p) =>
            p.retoursALire > 0 ? d.aLire(p.retoursALire) : d.rienDeNouveau,
          attention: (p) => p.retoursALire > 0,
        },
        {
          href: "roue",
          label: t.entrees.roue.label,
          resume: t.entrees.roue.resume,
          icone: ICONES.roue,
          minimum: "gerant",
        },
        {
          href: "seo",
          label: t.entrees.seo.label,
          resume: t.entrees.seo.resume,
          icone: ICONES.seo,
          minimum: "gerant",
        },
        // Masquée tant que Google n'a pas ouvert la publication : elle
        // revient d'elle-même le jour où l'accès est accordé, sans toucher
        // au code.
        ...(publicationsGoogleOuvertes()
          ? [
              {
                href: "posts",
                label: t.entrees.posts.label,
                resume: t.entrees.posts.resume,
                icone: ICONES.posts,
                minimum: "gerant" as const,
                detail: (p: Pouls) =>
                  p.prochainPost
                    ? d.prochainePublication(dateCourte(p.prochainPost, langue))
                    : d.aucuneProgrammee,
              },
            ]
          : []),
        {
          href: "visibilite-ia",
          label: t.entrees.visibiliteIa.label,
          resume: t.entrees.visibiliteIa.resume,
          icone: ICONES.ia,
          minimum: "gerant",
          detail: (p) =>
            p.ia ? d.citeSur(p.ia.citees, p.ia.total) : d.pasEncoreVerifie,
        },
      ],
    },
    {
      titre: t.groupes.reglages,
      compact: true,
      entrees: [
        {
          href: "notifications",
          label: t.entrees.notifications.label,
          resume: t.entrees.notifications.resume,
          icone: ICONES.notifications,
          minimum: "gerant",
        },
        {
          href: "connexions",
          label: t.entrees.connexions.label,
          resume: t.entrees.connexions.resume,
          icone: ICONES.connexions,
          minimum: "gerant",
          detail: (p) => {
            const liees = [
              p.connexions.google && "Google",
              p.connexions.facebook && "Facebook",
              p.connexions.instagram && "Instagram",
              p.connexions.tiktok && "TikTok",
            ].filter(Boolean);
            return liees.length > 0 ? liees.join(" · ") : d.rienDeRelie;
          },
          attention: (p) => !p.connexions.google,
        },
        {
          href: "paiements",
          label: t.entrees.paiements.label,
          resume: t.entrees.paiements.resume,
          icone: ICONES.paiements,
          minimum: "gerant",
        },
        {
          href: "equipe",
          label: t.entrees.equipe.label,
          resume: t.entrees.equipe.resume,
          icone: ICONES.equipe,
          minimum: "proprietaire",
        },
        {
          href: "abonnement",
          label: t.entrees.abonnement.label,
          resume: t.entrees.abonnement.resume,
          icone: ICONES.abonnement,
          minimum: "proprietaire",
        },
      ],
    },
  ];
}

/**
 * Sur grand écran, autant de colonnes que de cases (cinq au plus) : une
 * rangée pleine plutôt qu'une case orpheline sur la ligne du dessous.
 * Les classes sont écrites en entier pour que Tailwind les trouve.
 */
const COLONNES_LARGES: Record<number, string> = {
  1: "2xl:grid-cols-3",
  2: "2xl:grid-cols-3",
  3: "2xl:grid-cols-3",
  4: "2xl:grid-cols-4",
  5: "2xl:grid-cols-5",
};

function accessible(minimum: Minimum, role: Role | null): boolean {
  if (!minimum) return true;
  if (minimum === "proprietaire") return role === "proprietaire";
  return peutGerer(role);
}

/**
 * Un grand chiffre du jour, au format des compteurs des autres écrans —
 * mais cliquable : il mène à l'écran qui le détaille.
 */
function Chiffre({
  valeur,
  libelle,
  href,
  attention = false,
}: {
  valeur: string;
  libelle: string;
  href: string;
  attention?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex min-w-0 flex-col gap-1 rounded-2xl border px-4 py-4 transition-[border-color,transform,box-shadow] hover:-translate-y-px sm:px-6 sm:py-5 ${
        attention
          ? "border-brand-orange/60 bg-brand-orange-soft hover:border-brand-orange"
          : "border-zinc-200/70 bg-white shadow-sm hover:border-ink hover:shadow-md"
      }`}
    >
      <span className="font-serif text-3xl leading-none text-ink sm:text-5xl">
        {valeur}
      </span>
      <span className="text-xs leading-snug text-zinc-600 group-hover:text-ink sm:text-sm">
        {libelle}
      </span>
    </Link>
  );
}

export function CarteRestaurant({
  restaurant,
  role,
  acces,
  pouls,
  t,
  langue,
}: {
  restaurant: { id: string; nom: string; adresse: string | null };
  role: Role | null;
  acces: Acces;
  pouls: Pouls;
  /** Les phrases de l'écran, dans la langue du compte. */
  t: ClesAccueil;
  langue: Langue;
}) {
  const base = `/dashboard/${restaurant.id}`;
  const couverts = pouls.couvertsMidi + pouls.couvertsSoir;
  // Les phrases qui comptent quelque chose. Voir `detailsAccueil.ts` :
  // elles ne peuvent pas vivre dans le même dictionnaire que les autres.
  const d = DETAILS[langue];
  const photo = Boolean(pouls.couvertureUrl);

  return (
    <li className="flex flex-col overflow-hidden rounded-3xl border border-zinc-200/70 bg-white shadow-sm">
      {/* L'en-tête : la maison, pas une initiale dans un rond. Avec la
          photo de couverture quand il y en a une, un dégradé crème sinon. */}
      <div className="relative flex min-h-[180px] flex-col justify-end overflow-hidden px-5 pb-6 pt-12 sm:px-8 lg:min-h-[240px]">
        {pouls.couvertureUrl ? (
          <>
            <Image
              src={pouls.couvertureUrl}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              priority={false}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[oklch(19%_0.012_60/85%)] via-[oklch(19%_0.012_60/35%)] to-transparent"
            />
          </>
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_oklch(85%_0.09_60/45%),_transparent_55%),linear-gradient(to_bottom,_oklch(98%_0.006_80),_oklch(95.5%_0.012_75))]"
          />
        )}
        <div
          className={`relative flex flex-wrap items-end justify-between gap-4 ${
            photo ? "text-white" : "text-ink"
          }`}
        >
          <div className="flex min-w-0 flex-col gap-2">
            <h2 className="font-serif text-4xl leading-none sm:text-6xl">
              {restaurant.nom}
            </h2>
            {restaurant.adresse && (
              <p
                className={`text-sm sm:text-base ${photo ? "text-white/80" : "text-ink-soft"}`}
              >
                {restaurant.adresse}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {pouls.note != null && (
              <span
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                  photo
                    ? "bg-white/15 text-white backdrop-blur"
                    : "bg-white text-ink shadow-sm"
                }`}
              >
                <span className="text-brand-orange">★</span>
                {pouls.note.toFixed(1).replace(".", ",")}
                <span className="font-normal opacity-75">
                  · {d.nombreAvis(pouls.nombreAvis ?? 0)}
                </span>
              </span>
            )}
            {peutGerer(role) && (
              <Link
                href={`${base}/edit`}
                className={`rounded-lg border px-4 py-2 font-semibold transition-colors ${
                  photo
                    ? "border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20"
                    : "border-zinc-200 bg-white text-ink hover:border-ink"
                }`}
              >
                {d.modifier}
              </Link>
            )}
            {role === "proprietaire" && (
              <DeleteRestaurantButton id={restaurant.id} />
            )}
          </div>
        </div>
      </div>

      {/* Ce qui casse en silence passe avant les chiffres : une alerte
          qui ne part pas ne se remarque jamais toute seule. */}
      {pouls.sansEmailContact && (
        <Link
          href={`${base}/reservations/configuration`}
          className="flex items-start gap-3 border-b border-brand-orange/30 bg-brand-orange-soft px-5 py-4 transition-colors hover:bg-brand-orange-soft/70 active:bg-brand-orange-soft/70 sm:px-8"
        >
          <span
            aria-hidden="true"
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-orange"
          />
          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-ink">
              {d.sansEmailTitre}
            </span>
            <span className="text-sm leading-relaxed text-ink-soft">
              {d.sansEmailTexte}
            </span>
          </span>
        </Link>
      )}

      <div className="flex flex-col gap-10 px-5 py-7 sm:px-8 sm:py-8">
        {/* Aujourd'hui : les quatre chiffres qui changent chaque jour. */}
        <section className="flex flex-col gap-4">
          <h3 className="font-serif text-2xl text-ink">{d.aujourdhui}</h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <Chiffre
              valeur={
                couverts > 0
                  ? `${pouls.couvertsMidi} · ${pouls.couvertsSoir}`
                  : "—"
              }
              libelle={
                couverts > 0 ? d.couvertsMidiSoir : d.aucunCouvertConfirme
              }
              href={`${base}/service`}
            />
            <Chiffre
              valeur={String(pouls.aConfirmer)}
              libelle={d.demandesAConfirmer(pouls.aConfirmer)}
              href={`${base}/reservations`}
              attention={pouls.aConfirmer > 0}
            />
            <Chiffre
              valeur={String(pouls.retoursALire)}
              libelle={d.retoursClientsALire(pouls.retoursALire)}
              href={`${base}/retours`}
              attention={pouls.retoursALire > 0}
            />
            <Chiffre
              valeur={
                pouls.note != null
                  ? pouls.note.toFixed(1).replace(".", ",")
                  : "—"
              }
              libelle={
                pouls.note != null
                  ? pouls.avisCetteSemaine
                    ? d.surGoogleSemaine(pouls.avisCetteSemaine)
                    : d.surGoogleAvis(pouls.nombreAvis ?? 0)
                  : d.noteEnAttente
              }
              href={`${base}/avis`}
            />
          </div>
        </section>

        {groupes(t, d, langue).map((groupe) => {
          const entrees = groupe.entrees.filter((entree) =>
            accessible(entree.minimum, role),
          );
          if (entrees.length === 0) return null;

          return (
            <section key={groupe.titre} className="flex flex-col gap-4">
              <h3 className="font-serif text-2xl text-ink">{groupe.titre}</h3>
              <div
                className={`grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 ${
                  groupe.compact ? "grid-cols-2" : ""
                } ${COLONNES_LARGES[Math.min(entrees.length, 5)]}`}
              >
                {entrees.map((entree) => {
                  // Une section ouverte par deux modules reste accessible
                  // dès que l'un des deux est pris ; `requis` ne sert plus
                  // qu'à nommer celui qu'on propose d'acheter.
                  const requis = moduleDeLaSection(entree.href);
                  const ferme = !sectionOuverte(acces, entree.href);
                  const detail = entree.detail?.(pouls) ?? null;
                  const alerte = entree.attention?.(pouls) ?? false;

                  // Fermée, la case n'est plus un lien : elle se voit,
                  // elle dit pourquoi, et elle ne mène nulle part.
                  if (ferme) {
                    return (
                      <div
                        key={entree.href}
                        aria-disabled="true"
                        title={`Inclus dans ${LIBELLE_MODULE[requis!]} — ${PRIX_MODULE[requis!]}`}
                        className={`flex cursor-not-allowed items-start gap-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 ${
                          groupe.compact ? "p-4" : "p-5"
                        }`}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
                          {entree.icone}
                        </span>
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="text-[15px] font-semibold text-zinc-500">
                            {entree.label}
                          </span>
                          <span className="text-sm text-zinc-500">
                            {LIBELLE_MODULE[requis!]} — {PRIX_MODULE[requis!]}
                          </span>
                        </span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={entree.href}
                      href={`${base}/${entree.href}`}
                      className={`group relative flex rounded-2xl border bg-white shadow-sm transition-[border-color,transform,box-shadow,background-color] hover:-translate-y-px hover:border-ink hover:shadow-md active:bg-brand-sand ${
                        alerte ? "border-brand-orange/60" : "border-zinc-200/70"
                      } ${groupe.compact ? "items-center gap-2.5 p-3 sm:items-start sm:gap-3.5 sm:p-4" : "items-start gap-3.5 p-5"}`}
                    >
                      <span
                        className={`flex shrink-0 items-center justify-center rounded-xl bg-brand-orange-soft text-brand-navy transition-colors group-hover:bg-ink group-hover:text-white ${
                          groupe.compact
                            ? "h-9 w-9 sm:h-10 sm:w-10"
                            : "h-11 w-11"
                        }`}
                      >
                        {entree.icone}
                      </span>
                      <span className="flex min-w-0 flex-col gap-1">
                        <span
                          className={`flex items-center gap-2 font-semibold text-ink ${
                            groupe.compact
                              ? "text-sm sm:text-base"
                              : "text-base"
                          }`}
                        >
                          {entree.label}
                          {alerte && (
                            <span
                              aria-hidden="true"
                              className="h-2 w-2 rounded-full bg-brand-orange"
                            />
                          )}
                        </span>
                        {/* Sur téléphone, les réglages tiennent à deux par
                            rangée : leur nom suffit, le détail attendra. */}
                        <span
                          className={`text-sm leading-relaxed ${
                            detail
                              ? "font-medium text-ink-soft"
                              : "text-ink-soft/80"
                          } ${groupe.compact ? "hidden sm:block" : ""}`}
                        >
                          {detail ?? entree.resume}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </li>
  );
}
