import type { CommuteEstimate } from "@/features/commute/types";

type Props = {
  estimates: CommuteEstimate[];
  hasHome: boolean;
  hasDestination: boolean;
};

export default function CommuteComparison({
  estimates,
  hasHome,
  hasDestination,
}: Props) {
  if (!hasHome || !hasDestination) {
    return (
      <div className="commute-comparison commute-comparison--empty">
        <p className="eyebrow">Commute preview</p>
        <strong>
          {!hasHome
            ? "Choose a saved home to compare."
            : "Search for a campus or workplace to compare."}
        </strong>
      </div>
    );
  }

  return (
    <section className="commute-comparison" aria-labelledby="commute-comparison-title">
      <div className="commute-comparison__heading">
        <div>
          <p className="eyebrow">Commute preview</p>
          <h3 id="commute-comparison-title">Compare your selected modes</h3>
        </div>
        <span>Planning estimate</span>
      </div>

      <div className="commute-estimate-list">
        {estimates.map((estimate) => (
          <article
            key={estimate.mode}
            className={estimate.withinLimit ? "is-within-limit" : "is-over-limit"}
          >
            <div>
              <strong>{estimate.mode}</strong>
              <span>{estimate.distanceMiles.toFixed(1)} estimated miles</span>
            </div>
            <b>{estimate.durationMinutes} min</b>
            <small>{estimate.withinLimit ? "Within your limit" : "Over your limit"}</small>
          </article>
        ))}
      </div>

      <p className="commute-comparison__disclaimer">
        Early estimate based on straight-line distance and documented mode assumptions—not live traffic or a transit schedule yet.
      </p>
    </section>
  );
}
