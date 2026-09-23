import type { PlatformReviews } from "@/lib/reviews/aggregate";
import { ReviewReplyDraft } from "@/components/reviews/ReviewReplyDraft";

const PLATFORM_LABELS: Record<PlatformReviews["platform"], string> = {
  yelp: "Yelp",
  tripadvisor: "Tripadvisor",
  google: "Google",
};

export function PlatformReviewsCard({
  data,
  restaurantId,
  pied,
}: {
  data: PlatformReviews;
  restaurantId: string;
  /** Ce qui se règle plateforme par plateforme, sous les avis. */
  pied?: React.ReactNode;
}) {
  const label = PLATFORM_LABELS[data.platform];

  return (
    <div className="flex flex-col gap-4 rounded-md border border-zinc-200 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900">{label}</h3>
        {data.found && data.rating != null && (
          <span className="text-sm text-zinc-500">
            {data.rating}/5 · {data.reviewCount} avis
          </span>
        )}
      </div>

      {!data.configured && (
        <p className="text-sm text-zinc-500">
          Non configuré — ajoute une clé API {label} pour activer.
        </p>
      )}

      {data.configured && !data.found && (
        <p className="text-sm text-zinc-500">
          Établissement introuvable sur {label}.
        </p>
      )}

      {/* Deux silences différents. Aucun avis du tout : il n'y a rien à
          dire. Des centaines de notes et aucun avis transmis : c'est la
          plateforme qui retient quelque chose, et « aucun avis récupéré »
          à côté de « 1 228 avis » se lisait comme une panne de Klarr. */}
      {data.found && data.reviews.length === 0 && (
        <p className="text-sm text-zinc-500">
          {(data.reviewCount ?? 0) > 0
            ? `${label} affiche ${data.reviewCount} avis mais n'en transmet aucun pour le moment. Ils restent lisibles directement sur la fiche.`
            : `Aucun avis sur ${label} pour le moment.`}
        </p>
      )}

      {data.found && data.reviews.length > 0 && (
        <ul className="flex flex-col gap-3">
          {data.reviews.map((review, i) => (
            <li
              key={i}
              className="flex flex-col gap-1 border-t border-zinc-100 pt-3 first:border-0 first:pt-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-800">
                  {review.author}
                </span>
                <span className="text-sm text-zinc-500">{review.rating}/5</span>
              </div>
              <p className="text-sm text-zinc-600">{review.text}</p>
              <ReviewReplyDraft
                restaurantId={restaurantId}
                author={review.author}
                rating={review.rating}
                text={review.text}
                reviewUrl={review.url ?? data.businessUrl ?? null}
              />
            </li>
          ))}
        </ul>
      )}

      {data.found && data.businessUrl && (
        <a
          href={data.businessUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          Voir la fiche {label} →
        </a>
      )}

      {pied}
    </div>
  );
}
