import assert from "node:assert/strict";
import test from "node:test";

import {
  defaultCity,
  deserializeCityPreference,
  isInCityArea,
  parseCityPreference,
  serializeCityPreference,
} from "../features/location-search/city-preference";

test("a valid selected city survives cookie serialization", () => {
  const encoded = serializeCityPreference(defaultCity);
  assert.deepEqual(deserializeCityPreference(encoded), defaultCity);
});

test("invalid external city data is rejected", () => {
  assert.equal(parseCityPreference({
    id: "invalid",
    label: "Invalid",
    shortLabel: "Invalid",
    coordinates: { latitude: 250, longitude: -121 },
  }), null);
});

test("city filtering uses the provider bounding box", () => {
  assert.equal(isInCityArea({ latitude: 37.3352, longitude: -121.8811 }, defaultCity), true);
  assert.equal(isInCityArea({ latitude: 41.8756, longitude: -87.6244 }, defaultCity), false);
  assert.equal(isInCityArea(undefined, defaultCity), false);
});
