import type { PlatformReviews } from "@/lib/reviews/aggregate";
import { ReviewReplyDraft } from "@/components/reviews/ReviewReplyDraft";
import type { Langue } from "@/lib/i18n/langues";
import { localeDe } from "@/lib/i18n/seo";
import { COMMUN, traducteur, type T } from "@/lib/i18n/t";
import { AVIS } from "@/lib/i18n/pages/avis";

/**
 * L'écran Avis en deux pièces.
 *
 * Il affichait trois colonnes étroites, une par plateforme, chacune avec
 * sa note en petit et ses avis empilés dessous : sur un grand écran, trois
 * bandes de texte serré et beaucoup de vide autour. Maintenant, une tuile
 * par plateforme dit la note en grand, et les avis viennent ensuite,
 * toutes plateformes confondues, du plus récent au plus ancien — c'est
 * l'ordre dans lequel on y répond.
 */

export const LIBELLE_PLATEFORME: Record<PlatformReviews["platform"], string> = {
  yelp: "Yelp",
  tripadvisor: "Tripadvisor",
  google: "Google",
};

/** Cinq étoiles, remplies jusqu'à la note arrondie à la demie. */
export function Etoiles({
  note,
  taille = 16,
  langue = "fr",
}: {
  note: number;
  taille?: number;
  langue?: Langue;
}) {
  const t = traducteur(langue, AVIS);
  const arrondie = Math.round(note * 2) / 2;
  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={t("{note} sur 5", {
        note: note.toLocaleString(localeDe(langue)),
      })}
    >
      {[1, 2, 3, 4, 5].map((rang) => {
        const plein = arrondie >= rang;
        const demi = !plein && arrondie >= rang - 0.5;
        return (
          <svg
            key={rang}
            width={taille}
            height={taille}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`demi-${rang}-${taille}`}>
                <stop offset="50%" stopColor="var(--accent)" />
                <stop offset="50%" stopColor="#e4ddd2" />
              </linearGradient>
            </defs>
            <path
              d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z"
              fill={
                plein
                  ? "var(--accent)"
                  : demi
                    ? `url(#demi-${rang}-${taille})`
                    : "#e4ddd2"
              }
            />
          </svg>
        );
      })}
    </span>
  );
}

/** Pourquoi il n'y a rien à montrer, quand il n'y a rien. */
function silence(
  data: PlatformReviews,
  label: string,
  t: T,
  langue: Langue,
): string | null {
  if (!data.configured) {
    return t("Non configuré — ajoutez une clé API {label} pour l'activer.", {
      label,
    });
  }
  if (!data.found) {
    return data.releveAttendu
      ? t("Premier relevé {label} la nuit prochaine.", { label })
      : t("Établissement introuvable sur {label}.", { label });
  }
  // Une note lue dans le relevé de nuit : on donne sa date, et on dit
  // quand elle sera rafraîchie si l'établissement vient d'être confirmé.
  if (data.releveLe && data.reviews.length === 0) {
    const date = new Date(data.releveLe).toLocaleDateString(localeDe(langue), {
      day: "numeric",
      month: "long",
    });
    return data.releveAttendu
      ? t("Relevé le {date} — mise à jour la nuit prochaine.", { date })
      : t("Relevé le {date}. Klarr relève {label} une fois par semaine.", {
          date,
          label,
        });
  }
  if (data.reviews.length > 0) return null;
  // Deux silences différents. Aucun avis du tout : il n'y a rien à dire.
  // Des centaines de notes et aucun avis transmis : c'est la plateforme
  // qui retient quelque chose, et « aucun avis récupéré » à côté de
  // « 1 228 avis » se lisait comme une panne de Klarr.
  if (data.businessStatus === "CLOSED_TEMPORARILY") {
    // Vérifié le 23 septembre 2026 : une fiche marquée « fermée
    // temporairement » garde sa note, mais Google cesse d'en transmettre
    // les avis, les photos et les horaires. Ça revient seul à la
    // réouverture.
    return t(
      "Votre fiche {label} est marquée « fermée temporairement ». Tant que c'est le cas, {label} ne transmet plus vos avis — ils reviendront d'eux-mêmes à la réouverture.",
      { label },
    );
  }
  if ((data.reviewCount ?? 0) > 0) {
    return t(
      "{label} affiche {n} avis mais n'en transmet aucun pour le moment. Ils restent lisibles sur la fiche.",
      { label, n: data.reviewCount ?? 0 },
    );
  }
  return t("Aucun avis sur {label} pour le moment.", { label });
}

export function TuilePlateforme({
  data,
  pied,
  langue,
}: {
  data: PlatformReviews;
  /** Ce qui se règle plateforme par plateforme, sous la note. */
  pied?: React.ReactNode;
  langue: Langue;
}) {
  const t = traducteur(langue, AVIS);
  const locale = localeDe(langue);
  const label = LIBELLE_PLATEFORME[data.platform];
  const note = data.found ? (data.rating ?? null) : null;
  const message = silence(data, label, t, langue);
  const actif = data.configured && data.found;

  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border p-6 ${
        actif
          ? "border-zinc-200/70 bg-white shadow-sm"
          : "border-dashed border-zinc-300 bg-white/60"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          {label}
        </span>
        {data.found && data.reviews.length > 0 && (
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
            {t("{n} à lire", { n: data.reviews.length })}
          </span>
        )}
      </div>

      {note != null ? (
        <div className="flex flex-col gap-2">
          <span className="flex items-baseline gap-2">
            <span className="font-serif text-6xl leading-none text-ink">
              {note.toLocaleString(locale, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
            </span>
            <span className="font-serif text-2xl text-zinc-400">/5</span>
          </span>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Etoiles note={note} taille={18} langue={langue} />
            {data.reviewCount != null && (
              <span className="text-sm text-zinc-600">
                {t("{n} avis", { n: data.reviewCount.toLocaleString(locale) })}
              </span>
            )}
          </span>
        </div>
      ) : (
        <span className="font-serif text-6xl leading-none text-zinc-300">
          —
        </span>
      )}

      {message && (
        <p className="text-sm leading-relaxed text-zinc-500">{message}</p>
      )}

      {data.found && data.businessUrl && (
        <a
          href={data.businessUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto w-fit text-sm font-semibold text-brand-orange-dark hover:underline"
        >
          {t("Voir la fiche {label} →", { label })}
        </a>
      )}

      {pied}
    </div>
  );
}

export type AvisAffiche = PlatformReviews["reviews"][number] & {
  platform: PlatformReviews["platform"];
  ficheUrl: string | null;
};

function quand(iso: string | null, langue: Langue): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(localeDe(langue), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function CarteAvis({
  avis,
  restaurantId,
  cle,
  enregistree,
  langue,
}: {
  avis: AvisAffiche;
  restaurantId: string;
  langue: Langue;
  /** L'identifiant de l'avis pour les réponses ; voir `cleAvis`. */
  cle: string;
  enregistree: { reponse: string; reponduLe: string } | null;
}) {
  const initiale = avis.author.trim().charAt(0).toUpperCase() || "?";
  // Une note basse se voit avant d'être lue : c'est à elle qu'on répond
  // en premier.
  const basse = avis.rating > 0 && avis.rating <= 3 && !enregistree;
  const date = quand(avis.publishedAt, langue);
  const t = traducteur(langue, AVIS, COMMUN);

  return (
    <li
      className={`flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm ${
        basse ? "border-brand-orange/50" : "border-zinc-200/70"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-orange-soft font-serif text-lg text-brand-orange-dark"
        >
          {initiale}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="truncate font-semibold text-ink">
              {avis.author}
            </span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-600">
              {LIBELLE_PLATEFORME[avis.platform]}
            </span>
            {basse && (
              <span className="rounded-full bg-brand-orange-soft px-2 py-0.5 text-[11px] font-semibold text-brand-orange-dark">
                {t("À traiter en premier")}
              </span>
            )}
          </span>
          <span className="flex flex-wrap items-center gap-x-3 text-xs text-zinc-500">
            <Etoiles note={avis.rating} taille={14} langue={langue} />
            {date && <span>{date}</span>}
          </span>
        </div>
      </div>

      {avis.text ? (
        <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink">
          {avis.text}
        </p>
      ) : (
        <p className="text-sm italic text-zinc-400">
          {t("Note sans commentaire.")}
        </p>
      )}

      <div className="border-t border-zinc-100 pt-4">
        <ReviewReplyDraft
          restaurantId={restaurantId}
          langue={langue}
          cle={cle}
          plateforme={LIBELLE_PLATEFORME[avis.platform]}
          enregistree={enregistree}
          author={avis.author}
          rating={avis.rating}
          text={avis.text}
          reviewUrl={avis.url ?? avis.ficheUrl}
        />
      </div>
    </li>
  );
}
