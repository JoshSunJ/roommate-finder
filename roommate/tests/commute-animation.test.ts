import assert from "node:assert/strict";
import test from "node:test";

import { sliceRouteAtProgress } from "../features/commute/animation";

const route = [
  [-122, 37] as [number, number],
  [-121.99, 37] as [number, number],
  [-121.97, 37] as [number, number],
];

test("route animation starts with a valid zero-length GeoJSON line", () => {
  assert.deepEqual(sliceRouteAtProgress(route, 0), [route[0], route[0]]);
});

test("route animation reveals geometry by traveled distance", () => {
  const halfway = sliceRouteAtProgress(route, 0.5);

  assert.deepEqual(halfway.slice(0, 2), route.slice(0, 2));
  assert.ok(Math.abs(halfway.at(-1)![0] - -121.985) < 0.000001);
  assert.equal(halfway.at(-1)![1], 37);
});

test("route animation clamps progress and preserves the final route", () => {
  assert.deepEqual(sliceRouteAtProgress(route, 2), route);
  assert.deepEqual(sliceRouteAtProgress(route, -1), [route[0], route[0]]);
});
