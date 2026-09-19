import Link from "next/link";
import Image from "next/image";
import type { Pouls } from "@/lib/dashboard/pouls";
import { publicationsGoogleOuvertes } from "@/lib/google/business";
import { peutGerer, type Role } from "@/lib/equipe/roles";
import {
  type Acces,
  LIBELLE_MODULE,
  moduleDeLaSection,
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
  reservations: (
    <Icone>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M8 2v4M16 2v4M3 10h18" />
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

function dateCourte(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const GROUPES: Groupe[] = [
  {
    titre: "Le service",
    entrees: [
      {
        href: "reservations",
        label: "Réservations",
        resume: "Le carnet, tes salles, tes services et ton plan de salle.",
        icone: ICONES.reservations,
        detail: (p) =>
          p.aConfirmer > 0
            ? `${p.aConfirmer} demande${p.aConfirmer > 1 ? "s" : ""} à confirmer`
            : "Rien en attente",
        attention: (p) => p.aConfirmer > 0,
      },
      {
        href: "service",
        label: "Service",
        resume: "L'écran de salle, pour le coup de feu.",
        icone: ICONES.service,
        detail: (p) => {
          const total = p.couvertsMidi + p.couvertsSoir;
          return total > 0
            ? `${total} couvert${total > 1 ? "s" : ""} aujourd'hui`
            : "Aucun couvert confirmé aujourd'hui";
        },
      },
    ],
  },
  {
    titre: "Votre maison",
    entrees: [
      {
        href: "vitrine",
        label: "Site vitrine",
        resume: "Le site de ton restaurant, fait de ce que tu as déjà rempli.",
        icone: ICONES.vitrine,
        minimum: "gerant",
        detail: (p) => (p.sitePublie ? "En ligne" : "Pas encore publié"),
        attention: (p) => !p.sitePublie,
      },
      {
        href: "menu",
        label: "Carte",
        resume: "Tes plats, leurs prix, leurs photos, et le QR code à poser.",
        icone: ICONES.menu,
        minimum: "gerant",
        detail: (p) =>
          p.cartePubliee
            ? `Publiée · ${p.nombrePlats} plat${p.nombrePlats > 1 ? "s" : ""}`
            : p.nombrePlats > 0
              ? `${p.nombrePlats} plat${p.nombrePlats > 1 ? "s" : ""}, pas encore publiée`
              : "Pas encore saisie",
      },
      {
        href: "photos",
        label: "Photos",
        resume: "Ce que voit un client avant de choisir de venir.",
        icone: ICONES.photos,
        minimum: "gerant",
        detail: (p) =>
          p.nombrePhotos > 0
            ? `${p.nombrePhotos} photo${p.nombrePhotos > 1 ? "s" : ""}${p.couvertureUrl ? " · couverture choisie" : ""}`
            : "Aucune photo",
        attention: (p) => p.nombrePhotos === 0,
      },
      {
        href: "faq",
        label: "Questions fréquentes",
        resume:
          "Ce qu'on te demande au téléphone, répondu une fois pour toutes.",
        icone: ICONES.faq,
        minimum: "gerant",
        detail: (p) =>
          p.nombreQuestions > 0
            ? `${p.nombreQuestions} question${p.nombreQuestions > 1 ? "s" : ""}`
            : null,
      },
      {
        href: "experiences",
        label: "Expériences",
        resume: "Ateliers, dégustations, soirées à places comptées.",
        icone: ICONES.experiences,
        minimum: "gerant",
      },
    ],
  },
  {
    titre: "Votre visibilité",
    entrees: [
      {
        href: "avis",
        label: "Avis",
        resume: "Tes avis Google, et des réponses prêtes à relire.",
        icone: ICONES.avis,
        minimum: "gerant",
        detail: (p) =>
          p.note != null
            ? `${p.note.toFixed(1).replace(".", ",")} ★ · ${p.nombreAvis ?? 0} avis${
                p.avisCetteSemaine
                  ? ` · ${p.avisCetteSemaine > 0 ? "+" : ""}${p.avisCetteSemaine} cette semaine`
                  : ""
              }`
            : "Premier relevé la nuit prochaine",
      },
      {
        href: "retours",
        label: "Retours clients",
        resume: "Ce qu'on préfère te dire en privé. Totem ou QR code.",
        icone: ICONES.retours,
        minimum: "gerant",
        detail: (p) =>
          p.retoursALire > 0 ? `${p.retoursALire} à lire` : "Rien de nouveau",
        attention: (p) => p.retoursALire > 0,
      },
      {
        href: "seo",
        label: "Référencement",
        resume: "Ce que Google sait de toi, et ce qui lui manque.",
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
              label: "Publications Google",
              resume: "Écris tes posts à l'avance, Klarr les publie.",
              icone: ICONES.posts,
              minimum: "gerant" as const,
              detail: (p: Pouls) =>
                p.prochainPost
                  ? `Prochaine : ${dateCourte(p.prochainPost)}`
                  : "Aucune programmée",
            },
          ]
        : []),
      {
        href: "visibilite-ia",
        label: "Visibilité IA",
        resume: "Es-tu cité quand on demande à une IA où dîner ?",
        icone: ICONES.ia,
        minimum: "gerant",
        detail: (p) =>
          p.ia
            ? `Cité sur ${p.ia.citees} question${p.ia.citees > 1 ? "s" : ""} sur ${p.ia.total}`
            : "Pas encore vérifié",
      },
    ],
  },
  {
    titre: "Réglages",
    compact: true,
    entrees: [
      {
        href: "notifications",
        label: "Notifications",
        resume: "Être prévenu sur ton téléphone.",
        icone: ICONES.notifications,
        minimum: "gerant",
      },
      {
        href: "connexions",
        label: "Connexions",
        resume: "Google, Facebook, Instagram, TikTok.",
        icone: ICONES.connexions,
        minimum: "gerant",
        detail: (p) => {
          const liees = [
            p.connexions.google && "Google",
            p.connexions.facebook && "Facebook",
            p.connexions.instagram && "Instagram",
            p.connexions.tiktok && "TikTok",
          ].filter(Boolean);
          return liees.length > 0 ? liees.join(" · ") : "Rien de relié";
        },
        attention: (p) => !p.connexions.google,
      },
      {
        href: "paiements",
        label: "Paiements",
        resume: "Acomptes, cautions, compte Stripe.",
        icone: ICONES.paiements,
        minimum: "gerant",
      },
      {
        href: "equipe",
        label: "Équipe",
        resume: "Qui accède à quoi.",
        icone: ICONES.equipe,
        minimum: "proprietaire",
      },
      {
        href: "abonnement",
        label: "Abonnement",
        resume: "Ta formule, tes factures.",
        icone: ICONES.abonnement,
        minimum: "proprietaire",
      },
    ],
  },
];

function accessible(minimum: Minimum, role: Role | null): boolean {
  if (!minimum) return true;
  if (minimum === "proprietaire") return role === "proprietaire";
  return peutGerer(role);
}

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
      className="group flex min-w-0 flex-col gap-1 rounded-xl px-4 py-3 transition-colors hover:bg-brand-sand"
    >
      <span className="flex items-baseline gap-2">
        <span className="font-serif text-[2.1rem] leading-none text-ink">
          {valeur}
        </span>
        {attention && (
          <span
            aria-hidden="true"
            className="h-2 w-2 shrink-0 rounded-full bg-brand-orange"
          />
        )}
      </span>
      <span className="text-[13px] leading-snug text-ink-soft group-hover:text-ink">
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
}: {
  restaurant: { id: string; nom: string; adresse: string | null };
  role: Role | null;
  acces: Acces;
  pouls: Pouls;
}) {
  const base = `/dashboard/${restaurant.id}`;
  const couverts = pouls.couvertsMidi + pouls.couvertsSoir;

  return (
    <li className="flex flex-col overflow-hidden rounded-3xl border border-line bg-paper shadow-[0_24px_60px_-40px_oklch(20%_0.02_60/35%)]">
      {/* L'en-tête : la maison, pas une initiale dans un rond. Avec la
          photo de couverture quand il y en a une, un dégradé crème sinon. */}
      <div className="relative flex min-h-[150px] flex-col justify-end overflow-hidden px-6 pb-5 pt-10 sm:px-8">
        {pouls.couvertureUrl ? (
          <>
            <Image
              src={pouls.couvertureUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 1100px, 100vw"
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
            pouls.couvertureUrl ? "text-white" : "text-ink"
          }`}
        >
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="font-serif text-4xl leading-none sm:text-5xl">
              {restaurant.nom}
            </h2>
            {restaurant.adresse && (
              <p
                className={`text-sm ${pouls.couvertureUrl ? "text-white/80" : "text-ink-soft"}`}
              >
                {restaurant.adresse}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm">
            {pouls.note != null && (
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold ${
                  pouls.couvertureUrl
                    ? "bg-white/15 text-white backdrop-blur"
                    : "bg-paper text-ink shadow-sm"
                }`}
              >
                <span className="text-brand-orange">★</span>
                {pouls.note.toFixed(1).replace(".", ",")}
                <span className="font-normal opacity-75">
                  · {pouls.nombreAvis ?? 0} avis
                </span>
              </span>
            )}
            {peutGerer(role) && (
              <Link
                href={`${base}/edit`}
                className={`font-medium ${
                  pouls.couvertureUrl
                    ? "text-white/85 hover:text-white"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                Modifier
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
          className="flex items-start gap-3 border-b border-line bg-brand-orange-soft px-6 py-3 transition-colors hover:bg-brand-orange-soft/70 sm:px-8"
        >
          <span
            aria-hidden="true"
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-orange"
          />
          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-ink">
              Aucune adresse e-mail de contact
            </span>
            <span className="text-[13px] leading-relaxed text-ink-soft">
              Vous ne recevez pas les alertes de réservation par e-mail, et un
              client qui répond à sa confirmation écrit dans le vide.
              Renseignez-la en deux minutes.
            </span>
          </span>
        </Link>
      )}

      {/* Aujourd'hui : les quatre chiffres qui changent chaque jour. */}
      <div className="border-b border-line px-4 py-3 sm:px-6">
        <p className="px-4 pb-1 pt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-brand-orange-dark">
          Aujourd&apos;hui
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4">
          <Chiffre
            valeur={
              couverts > 0
                ? `${pouls.couvertsMidi} · ${pouls.couvertsSoir}`
                : "—"
            }
            libelle={
              couverts > 0 ? "couverts midi · soir" : "aucun couvert confirmé"
            }
            href={`${base}/service`}
          />
          <Chiffre
            valeur={String(pouls.aConfirmer)}
            libelle={
              pouls.aConfirmer > 1
                ? "demandes à confirmer"
                : "demande à confirmer"
            }
            href={`${base}/reservations`}
            attention={pouls.aConfirmer > 0}
          />
          <Chiffre
            valeur={String(pouls.retoursALire)}
            libelle={
              pouls.retoursALire > 1
                ? "retours clients à lire"
                : "retour client à lire"
            }
            href={`${base}/retours`}
            attention={pouls.retoursALire > 0}
          />
          <Chiffre
            valeur={
              pouls.note != null ? pouls.note.toFixed(1).replace(".", ",") : "—"
            }
            libelle={
              pouls.note != null
                ? pouls.avisCetteSemaine
                  ? `sur Google · ${pouls.avisCetteSemaine > 0 ? "+" : ""}${pouls.avisCetteSemaine} avis cette semaine`
                  : `sur Google · ${pouls.nombreAvis ?? 0} avis`
                : "note Google, premier relevé cette nuit"
            }
            href={`${base}/avis`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-7 px-6 py-6 sm:px-8">
        {GROUPES.map((groupe) => {
          const entrees = groupe.entrees.filter((entree) =>
            accessible(entree.minimum, role),
          );
          if (entrees.length === 0) return null;

          return (
            <section key={groupe.titre} className="flex flex-col gap-3">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-soft">
                {groupe.titre}
              </h3>
              <div
                className={
                  groupe.compact
                    ? "flex flex-wrap gap-2"
                    : groupe.entrees.length === 2
                      ? "grid gap-3 sm:grid-cols-2"
                      : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                }
              >
                {entrees.map((entree) => {
                  const requis = moduleDeLaSection(entree.href);
                  const ferme = requis ? !acces.ouvert[requis] : false;
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
                        className={`flex cursor-not-allowed items-start gap-3 rounded-2xl border border-dashed border-line bg-brand-cream ${
                          groupe.compact ? "px-3 py-2" : "p-4"
                        }`}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-sand text-ink-soft/60">
                          {entree.icone}
                        </span>
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="text-sm font-medium text-ink-soft/70">
                            {entree.label}
                          </span>
                          <span className="text-xs text-ink-soft/70">
                            {LIBELLE_MODULE[requis!]} — {PRIX_MODULE[requis!]}
                          </span>
                        </span>
                      </div>
                    );
                  }

                  if (groupe.compact) {
                    return (
                      <Link
                        key={entree.href}
                        href={`${base}/${entree.href}`}
                        className="group flex items-center gap-2.5 rounded-full border border-line bg-paper py-1.5 pl-1.5 pr-4 text-sm transition-colors hover:border-ink"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-sand text-ink [&_svg]:h-4 [&_svg]:w-4">
                          {entree.icone}
                        </span>
                        <span className="font-medium text-ink">
                          {entree.label}
                        </span>
                        {detail && (
                          <span className="hidden text-ink-soft sm:inline">
                            · {detail}
                          </span>
                        )}
                        {alerte && (
                          <span
                            aria-hidden="true"
                            className="h-2 w-2 rounded-full bg-brand-orange"
                          />
                        )}
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={entree.href}
                      href={`${base}/${entree.href}`}
                      className="group relative flex items-start gap-3 rounded-2xl border border-line bg-paper p-4 transition-[border-color,transform,box-shadow] hover:-translate-y-px hover:border-ink hover:shadow-[0_14px_30px_-20px_oklch(20%_0.02_60/50%)]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange-soft text-brand-navy transition-colors group-hover:bg-ink group-hover:text-white">
                        {entree.icone}
                      </span>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                          {entree.label}
                          {alerte && (
                            <span
                              aria-hidden="true"
                              className="h-2 w-2 rounded-full bg-brand-orange"
                            />
                          )}
                        </span>
                        <span
                          className={`text-[13px] leading-relaxed ${
                            detail
                              ? "font-medium text-ink-soft"
                              : "text-ink-soft/80"
                          }`}
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
