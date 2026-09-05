import type { PlatformReviews } from "@/lib/reviews/aggregate";

const PLATFORM_LABELS: Record<PlatformReviews["platform"], string> = {
  yelp: "Yelp",
  tripadvisor: "Tripadvisor",
};

export function PlatformReviewsCard({ data }: { data: PlatformReviews }) {
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

      {data.found && data.reviews.length === 0 && (
        <p className="text-sm text-zinc-500">Aucun avis récupéré.</p>
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
                <span className="text-sm text-zinc-500">
                  {review.rating}/5
                </span>
              </div>
              <p className="line-clamp-3 text-sm text-zinc-600">
                {review.text}
              </p>
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
    </div>
  );
}
