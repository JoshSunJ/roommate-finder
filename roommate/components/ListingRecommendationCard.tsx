import Link from "next/link";

import type { ListingRecommendation } from "@/features/matching/types";

type Props = { recommendation: ListingRecommendation };

export default function ListingRecommendationCard({ recommendation }: Props) {
  const { listing, score, band, criteria } = recommendation;

  return (
    <article className="match-card">
      <header className="match-card__header">
        <div>
          <p className="eyebrow">{band} match</p>
          <h3>{listing.title}</h3>
        </div>
        <div className={`match-score match-score--${band}`} aria-label={`${score} percent match`}>
          <strong>{score}</strong>
          <span>/100</span>
        </div>
      </header>

      <p className="match-card__summary">${listing.rent}/month · {listing.location}</p>
      <ul className="match-reasons">
        {criteria.map((item) => (
          <li className={`match-reason match-reason--${item.status}`} key={item.key}>
            <span aria-hidden="true" />
            <div>
              <strong>{item.label} · {item.points}/{item.maxPoints}</strong>
              <p>{item.explanation}</p>
            </div>
          </li>
        ))}
      </ul>
      <Link href={`/listings/${listing.id}`}>Inspect this home ↗</Link>
    </article>
  );
}
