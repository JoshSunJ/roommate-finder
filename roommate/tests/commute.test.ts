import assert from "node:assert/strict";
import test from "node:test";

import {
  compareCommuteModes,
  estimateCommute,
} from "../features/commute/service";
import { getRoadRoute } from "../features/commute/routing";
import { isRoadRoutableMode } from "../features/commute/types";

const downtownSanJose = { latitude: 37.3352, longitude: -121.8811 };
const northSanJose = { latitude: 37.3746, longitude: -121.9227 };

test("commute estimates are deterministic and explain their assumptions", () => {
  const estimate = estimateCommute(
    downtownSanJose,
    northSanJose,
    "bike",
    30,
  );

  assert.equal(estimate.mode, "bike");
  assert.ok(estimate.distanceMiles > 0);
  assert.ok(estimate.durationMinutes > 0);
  assert.equal(estimate.withinLimit, true);
  assert.match(estimate.explanation, /cycling/);
});

test("mode comparison sorts the practical options by estimated duration", () => {
  const estimates = compareCommuteModes(
    downtownSanJose,
    northSanJose,
    ["walk", "drive", "bike"],
    30,
  );

  assert.deepEqual(estimates.map(({ mode }) => mode), ["drive", "bike", "walk"]);
  assert.equal(estimates.at(-1)?.withinLimit, false);
});

test("transit stays outside the road-routing provider contract", () => {
  assert.equal(isRoadRoutableMode("transit"), false);
  assert.equal(isRoadRoutableMode("teleport"), false);
  assert.equal(isRoadRoutableMode("bike"), true);
});

test("the routing adapter normalizes provider units and GeoJSON", async () => {
  const requestedUrls: string[] = [];
  const fetchMock: typeof fetch = async (input) => {
    requestedUrls.push(String(input));
    return new Response(JSON.stringify({
      code: "Ok",
      routes: [{
        distance: 3218.688,
        duration: 720,
        geometry: {
          type: "LineString",
          coordinates: [
            [-121.8811, 37.3352],
            [-121.9, 37.35],
            [-121.9227, 37.3746],
          ],
        },
      }],
    }), { status: 200 });
  };

  const route = await getRoadRoute(
    downtownSanJose,
    northSanJose,
    "bike",
    "test-token",
    fetchMock,
  );

  assert.equal(route.distanceMiles, 2);
  assert.equal(route.durationMinutes, 12);
  assert.equal(route.geometry.coordinates.length, 3);
  assert.match(requestedUrls[0], /mapbox\/cycling/);
});

test("ride-share routing adds pickup time to the driving route", async () => {
  const fetchMock: typeof fetch = async () => new Response(JSON.stringify({
    code: "Ok",
    routes: [{
      distance: 1609.344,
      duration: 300,
      geometry: {
        type: "LineString",
        coordinates: [
          [-121.8811, 37.3352],
          [-121.9227, 37.3746],
        ],
      },
    }],
  }), { status: 200 });

  const route = await getRoadRoute(
    downtownSanJose,
    northSanJose,
    "ride share",
    "test-token",
    fetchMock,
  );

  assert.equal(route.durationMinutes, 12);
});
