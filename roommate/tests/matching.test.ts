import assert from "node:assert/strict";
import test from "node:test";

import { rankListingsForRequest, scoreListingForRequest } from "../features/matching/service";
import type { HousingRequest } from "../features/housing-requests/types";
import type { Listing } from "../features/listings/types";

const request: HousingRequest = {
  id: 1,
  ownerId: 10,
  title: "Summer room near SJSU",
  maxRent: 1_200,
  preferredLocation: "Downtown San Jose",
  description: "Looking for a practical summer room.",
  moveInDate: "2026-06-01",
  moveOutDate: "2026-08-31",
  bedroomsNeeded: 1,
  status: "active",
  requestedBy: "Student",
};

function listing(overrides: Partial<Listing>): Listing {
  return {
    id: 1,
    ownerId: 20,
    title: "Downtown room",
    rent: 1_100,
    location: "Downtown San Jose, CA",
    description: "A room for the summer.",
    bedrooms: 1,
    bathroomType: "Shared",
    availableFrom: "2026-05-20",
    availableUntil: "2026-09-10",
    roomType: "private",
    leaseType: "sublet",
    furnished: true,
    utilitiesIncluded: true,
    utilitiesEstimate: null,
    securityDeposit: 500,
    parkingAvailable: false,
    petsAllowed: false,
    postedBy: "Poster",
    status: "active",
    photos: [],
    ...overrides,
  };
}

test("a full practical fit receives a strong, fully explained score", () => {
  const result = scoreListingForRequest(request, listing({}));

  assert.equal(result.score, 100);
  assert.equal(result.band, "strong");
  assert.deepEqual(result.criteria.map((item) => item.key), [
    "budget",
    "location",
    "availability",
    "bedrooms",
  ]);
});

test("over-budget options remain visible as lower-ranked tradeoffs", () => {
  const practical = listing({ id: 1 });
  const stretch = listing({
    id: 2,
    rent: 1_450,
    location: "Santa Clara, CA",
    availableFrom: "2026-07-01",
  });

  const results = rankListingsForRequest(request, [stretch, practical]);

  assert.equal(results.length, 2);
  assert.equal(results[0].listing.id, practical.id);
  assert.equal(results[1].listing.id, stretch.id);
  assert.ok(results[1].score > 0);
  assert.match(results[1].criteria[0].explanation, /above/);
});

test("inactive and self-owned listings do not become recommendations", () => {
  const results = rankListingsForRequest(request, [
    listing({ id: 1, status: "filled" }),
    listing({ id: 2, ownerId: request.ownerId }),
    listing({ id: 3 }),
  ]);

  assert.deepEqual(results.map((result) => result.listing.id), [3]);
});

test("legacy human-readable availability dates remain matchable", () => {
  const result = scoreListingForRequest(request, listing({
    availableFrom: "May 20, 2026",
    availableUntil: "September 10, 2026",
  }));

  const availability = result.criteria.find((item) => item.key === "availability");
  assert.equal(availability?.points, 25);
  assert.match(availability?.explanation ?? "", /full requested stay/);
});
