import assert from "node:assert/strict";
import test from "node:test";

import {
  buildMapTilerSearchUrl,
  normalizeMapTilerResults,
} from "../features/location-search/service";

test("US city search restricts and normalizes provider parameters", () => {
  const url = buildMapTilerSearchUrl({
    query: "New York",
    kind: "city",
  }, "test-key");

  assert.equal(url.hostname, "api.maptiler.com");
  assert.equal(url.pathname, "/geocoding/New%20York.json");
  assert.equal(url.searchParams.get("country"), "us");
  assert.equal(url.searchParams.get("types"), "place");
  assert.equal(url.searchParams.get("key"), "test-key");
});

test("destination search is biased toward the selected city", () => {
  const url = buildMapTilerSearchUrl({
    query: "university",
    kind: "destination",
    proximity: { latitude: 42.3601, longitude: -71.0589 },
  }, "test-key");

  assert.equal(url.searchParams.get("types"), "poi");
  assert.equal(url.searchParams.get("proximity"), "-71.0589,42.3601");
});

test("provider results expose only the normalized location contract", () => {
  const results = normalizeMapTilerResults({
    features: [{
      id: "place.123",
      text: "Boston",
      place_name: "Boston, Massachusetts, United States",
      place_type: ["place"],
      center: [-71.0589, 42.3601],
      bbox: [-71.1912, 42.2279, -70.986, 42.3973],
    }],
  });

  assert.deepEqual(results[0], {
    id: "place.123",
    label: "Boston, Massachusetts, United States",
    shortLabel: "Boston",
    type: "place",
    coordinates: { latitude: 42.3601, longitude: -71.0589 },
    boundingBox: [-71.1912, 42.2279, -70.986, 42.3973],
  });
});
