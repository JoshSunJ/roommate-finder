import assert from "node:assert/strict";
import test from "node:test";

import {
  compareCommuteModes,
  estimateCommute,
} from "../features/commute/service";
import {
  getOpenRouteServiceRoute,
  getRoadRoute,
  getValhallaRoute,
} from "../features/commute/routing";
import { isRoadRoutableMode } from "../features/commute/types";

const downtownSanJose = { latitude: 37.3352, longitude: -121.8811 };
const northSanJose = { latitude: 37.3746, longitude: -121.9227 };

function encodePolyline6(points: Array<[number, number]>) {
  let previousLatitude = 0;
  let previousLongitude = 0;

  function encodeValue(value: number) {
    let shifted = value < 0 ? ~(value << 1) : value << 1;
    let encoded = "";
    while (shifted >= 0x20) {
      encoded += String.fromCharCode((0x20 | (shifted & 0x1f)) + 63);
      shifted >>= 5;
    }
    return encoded + String.fromCharCode(shifted + 63);
  }

  return points.map(([longitude, latitude]) => {
    const scaledLatitude = Math.round(latitude * 1_000_000);
    const scaledLongitude = Math.round(longitude * 1_000_000);
    const encoded = encodeValue(scaledLatitude - previousLatitude)
      + encodeValue(scaledLongitude - previousLongitude);
    previousLatitude = scaledLatitude;
    previousLongitude = scaledLongitude;
    return encoded;
  }).join("");
}

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

test("OpenRouteService routes are normalized without exposing the key in the URL", async () => {
  let requestedUrl = "";
  let requestedOptions: RequestInit | undefined;
  const fetchMock: typeof fetch = async (input, options) => {
    requestedUrl = String(input);
    requestedOptions = options;
    return new Response(JSON.stringify({
      features: [{
        geometry: {
          type: "LineString",
          coordinates: [
            [-121.8811, 37.3352],
            [-121.9, 37.35],
            [-121.9227, 37.3746],
          ],
        },
        properties: { summary: { distance: 4828.032, duration: 900 } },
      }],
    }), { status: 200 });
  };

  const route = await getOpenRouteServiceRoute(
    downtownSanJose,
    northSanJose,
    "bike",
    "private-test-key",
    fetchMock,
  );

  assert.match(requestedUrl, /cycling-regular\/geojson$/);
  assert.doesNotMatch(requestedUrl, /private-test-key/);
  assert.equal((requestedOptions?.headers as Record<string, string>).Authorization, "private-test-key");
  assert.equal(route.provider, "openrouteservice");
  assert.equal(route.distanceMiles, 3);
  assert.equal(route.durationMinutes, 15);
  assert.equal(route.geometry.coordinates.length, 3);
});

test("Valhalla routes decode their polyline6 street geometry", async () => {
  const points: Array<[number, number]> = [
    [-121.8811, 37.3352],
    [-121.89, 37.34],
    [-121.9227, 37.3746],
  ];
  let requestBody = "";
  const fetchMock: typeof fetch = async (_input, options) => {
    requestBody = String(options?.body);
    return new Response(JSON.stringify({
      trip: {
        status: 0,
        summary: { length: 4.2, time: 1200 },
        legs: [{ shape: encodePolyline6(points) }],
      },
    }), { status: 200 });
  };

  const route = await getValhallaRoute(
    downtownSanJose,
    northSanJose,
    "bike",
    "https://routing.example.com",
    fetchMock,
  );

  assert.equal(JSON.parse(requestBody).costing, "bicycle");
  assert.equal(route.provider, "valhalla");
  assert.equal(route.distanceMiles, 4.2);
  assert.equal(route.durationMinutes, 20);
  assert.deepEqual(route.geometry.coordinates, points);
});
