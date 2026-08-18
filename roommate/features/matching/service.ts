import type { HousingRequest } from "@/features/housing-requests/types";
import type { Listing } from "@/features/listings/types";
import type {
  ListingRecommendation,
  MatchBand,
  MatchCriterion,
  MatchCriterionStatus,
} from "@/features/matching/types";

const DAY_IN_MS = 24 * 60 * 60 * 1_000;

function criterion(
  key: MatchCriterion["key"],
  label: string,
  points: number,
  maxPoints: number,
  explanation: string,
): MatchCriterion {
  const ratio = points / maxPoints;
  const status: MatchCriterionStatus = ratio >= 0.75
    ? "strong"
    : ratio >= 0.35
      ? "tradeoff"
      : "weak";

  return { key, label, points, maxPoints, status, explanation };
}

function scoreBudget(request: HousingRequest, listing: Listing): MatchCriterion {
  const difference = request.maxRent - listing.rent;
  if (difference >= 0) {
    return criterion(
      "budget",
      "Monthly budget",
      40,
      40,
      difference === 0
        ? "At the stated monthly budget."
        : `$${difference.toLocaleString()} below the stated monthly budget.`,
    );
  }

  const amountOver = Math.abs(difference);
  // Budget is important but intentionally soft. A listing gradually loses its
  // budget points and reaches zero at 50% over budget instead of disappearing.
  const points = Math.max(0, Math.round(40 * (1 - amountOver / (request.maxRent * 0.5))));
  return criterion(
    "budget",
    "Monthly budget",
    points,
    40,
    `$${amountOver.toLocaleString()} above the stated monthly budget.`,
  );
}

const LOCATION_STOP_WORDS = new Set(["ca", "california", "near", "the", "area"]);

function locationTokens(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 0 && !LOCATION_STOP_WORDS.has(token));
}

function scoreLocation(request: HousingRequest, listing: Listing): MatchCriterion {
  const preferredTokens = locationTokens(request.preferredLocation);
  const listingTokenSet = new Set(locationTokens(listing.location));
  const sharedTokens = preferredTokens.filter((token) => listingTokenSet.has(token));
  const overlap = preferredTokens.length === 0 ? 0 : sharedTokens.length / preferredTokens.length;
  const points = Math.round(25 * overlap);

  return criterion(
    "location",
    "Preferred area",
    points,
    25,
    overlap === 1
      ? `Located in the requested ${request.preferredLocation} area.`
      : sharedTokens.length > 0
        ? `Partially matches the requested area through “${sharedTokens.join(", ")}”.`
        : `Located in ${listing.location}, outside the stated ${request.preferredLocation} area.`,
  );
}

function parseDate(value: string): number | null {
  // New forms store ISO calendar dates, while older seed records may contain
  // human-readable dates. Supporting both keeps matching compatible during the
  // transition without leaking storage-format concerns into the UI.
  const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T00:00:00Z`
    : value;
  const timestamp = Date.parse(normalizedValue);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function scoreAvailability(request: HousingRequest, listing: Listing): MatchCriterion {
  const requestedStart = parseDate(request.moveInDate);
  const requestedEnd = parseDate(request.moveOutDate);
  const availableStart = parseDate(listing.availableFrom);
  const availableEnd = listing.availableUntil ? parseDate(listing.availableUntil) : null;

  if (requestedStart === null || requestedEnd === null || availableStart === null) {
    return criterion(
      "availability",
      "Date fit",
      0,
      25,
      "The available dates could not be compared.",
    );
  }

  const effectiveEnd = availableEnd ?? Number.POSITIVE_INFINITY;
  if (availableStart <= requestedStart && effectiveEnd >= requestedEnd) {
    return criterion(
      "availability",
      "Date fit",
      25,
      25,
      "Available for the full requested stay.",
    );
  }

  const overlapStart = Math.max(requestedStart, availableStart);
  const overlapEnd = Math.min(requestedEnd, effectiveEnd);
  if (overlapEnd < overlapStart) {
    const gapDays = Math.round(Math.min(
      Math.abs(availableStart - requestedEnd),
      Math.abs(requestedStart - effectiveEnd),
    ) / DAY_IN_MS);
    return criterion(
      "availability",
      "Date fit",
      0,
      25,
      `The available window misses the requested stay by about ${gapDays} days.`,
    );
  }

  const requestedDays = Math.max(1, (requestedEnd - requestedStart) / DAY_IN_MS);
  const overlapDays = Math.max(0, (overlapEnd - overlapStart) / DAY_IN_MS);
  const points = Math.round(25 * Math.min(1, overlapDays / requestedDays));
  return criterion(
    "availability",
    "Date fit",
    points,
    25,
    `Available for about ${Math.round(overlapDays)} of ${Math.round(requestedDays)} requested days.`,
  );
}

function scoreBedrooms(request: HousingRequest, listing: Listing): MatchCriterion {
  const difference = listing.bedrooms - request.bedroomsNeeded;
  const points = difference >= 0
    ? 10
    : Math.max(0, Math.round(10 * (listing.bedrooms / request.bedroomsNeeded)));

  return criterion(
    "bedrooms",
    "Bedroom capacity",
    points,
    10,
    difference >= 0
      ? `Meets the request for ${request.bedroomsNeeded} bedroom${request.bedroomsNeeded === 1 ? "" : "s"}.`
      : `Has ${listing.bedrooms}; the request asks for ${request.bedroomsNeeded}.`,
  );
}

function bandForScore(score: number): MatchBand {
  if (score >= 80) return "strong";
  if (score >= 60) return "promising";
  return "stretch";
}

export function scoreListingForRequest(
  request: HousingRequest,
  listing: Listing,
): ListingRecommendation {
  const criteria = [
    scoreBudget(request, listing),
    scoreLocation(request, listing),
    scoreAvailability(request, listing),
    scoreBedrooms(request, listing),
  ];
  const score = criteria.reduce((total, item) => total + item.points, 0);

  return { listing, score, band: bandForScore(score), criteria };
}

export function rankListingsForRequest(
  request: HousingRequest,
  listings: Listing[],
): ListingRecommendation[] {
  return listings
    .filter((listing) => listing.status === "active" && listing.ownerId !== request.ownerId)
    .map((listing) => scoreListingForRequest(request, listing))
    .sort((left, right) => right.score - left.score || left.listing.rent - right.listing.rent);
}
