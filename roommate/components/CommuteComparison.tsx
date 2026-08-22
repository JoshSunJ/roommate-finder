import type {
  CommuteEstimate,
  CommuteRoute,
} from "@/features/commute/types";

type Props = {
  estimates: CommuteEstimate[];
  roadRoutes: CommuteRoute[];
  hasHome: boolean;
  hasDestination: boolean;
  maxCommuteMinutes: number;
  routesLoading: boolean;
  routesUnavailable: boolean;
};

export default function CommuteComparison({
  estimates,
  roadRoutes,
  hasHome,
  hasDestination,
  maxCommuteMinutes,
  routesLoading,
  routesUnavailable,
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
        {estimates.map((estimate) => {
          const roadRoute = roadRoutes.find((route) => route.mode === estimate.mode);
          const distanceMiles = roadRoute?.distanceMiles ?? estimate.distanceMiles;
          const durationMinutes = roadRoute?.durationMinutes ?? estimate.durationMinutes;
          const withinLimit = durationMinutes <= maxCommuteMinutes;

          return (
            <article
              key={estimate.mode}
              className={withinLimit ? "is-within-limit" : "is-over-limit"}
            >
              <div>
                <strong>{estimate.mode}</strong>
                <span>{distanceMiles.toFixed(1)} {roadRoute ? "road" : "estimated"} miles</span>
              </div>
              <b>{durationMinutes} min</b>
              <small>{withinLimit ? "Within your limit" : "Over your limit"}</small>
              <em>{roadRoute ? "Road route" : "Planning estimate"}</em>
            </article>
          );
        })}
      </div>

      <p className="commute-comparison__status" aria-live="polite">
        {routesLoading
          ? "Calculating road routes…"
          : routesUnavailable
            ? "Road routing is unavailable; estimates remain visible."
            : roadRoutes.length > 0
              ? "Road geometry is active for supported modes."
              : "Transit currently uses a planning estimate."}
      </p>

      <p className="commute-comparison__disclaimer">
        Road routes use the provider network but not live traffic. Transit remains an estimate until a schedule-aware provider is added.
      </p>
    </section>
  );
}
