import assert from "node:assert/strict";
import test from "node:test";

import { toListingFeatureCollection } from "@/features/map/listing-geojson";
import type { Listing } from "@/features/listings/types";

const listing: Listing = {
  id: 42,
  ownerId: 7,
  title: "Room near campus",
  rent: 1250,
  location: "Downtown San Jose",
  description: "A practical test listing",
  bedrooms: 2,
  bathroomType: "Shared",
  availableFrom: "2026-09-01",
  availableUntil: "2027-05-31",
  roomType: "private",
  leaseType: "fixed_term",
  furnished: true,
  utilitiesIncluded: false,
  utilitiesEstimate: 100,
  securityDeposit: 1250,
  parkingAvailable: false,
  petsAllowed: false,
  postedBy: "Test User",
  coordinates: { latitude: 37.3352, longitude: -121.8811 },
  status: "active",
  photos: [],
};

test("converts listings into GeoJSON longitude-latitude points", () => {
  const collection = toListingFeatureCollection([listing], []);

  assert.deepEqual(collection.features[0].geometry.coordinates, [-121.8811, 37.3352]);
  assert.equal(collection.features[0].properties.id, 42);
  assert.equal(collection.features[0].properties.isSaved, false);
});

test("marks saved listings and omits listings without coordinates", () => {
  const withoutCoordinates = { ...listing, id: 43, coordinates: undefined };
  const collection = toListingFeatureCollection([listing, withoutCoordinates], [42]);

  assert.equal(collection.features.length, 1);
  assert.equal(collection.features[0].properties.isSaved, true);
});
