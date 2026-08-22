import assert from "node:assert/strict";
import test from "node:test";

import {
  compareCommuteModes,
  estimateCommute,
} from "../features/commute/service";

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
