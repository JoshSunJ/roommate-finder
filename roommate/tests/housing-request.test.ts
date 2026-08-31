import assert from "node:assert/strict";
import test from "node:test";

import { housingRequestInputSchema } from "../features/housing-requests/schema";

const validRequest = {
  title: "Summer room near campus",
  maxRent: 1_600,
  preferredLocation: "Chicago, IL",
  description: "Looking for a furnished room close to public transportation.",
  moveInDate: "2026-06-01",
  moveOutDate: "2026-08-31",
  bedroomsNeeded: 1,
};

test("housing request input accepts a complete, practical request", () => {
  assert.equal(housingRequestInputSchema.safeParse(validRequest).success, true);
});

test("housing request input rejects an inverted date range", () => {
  const result = housingRequestInputSchema.safeParse({
    ...validRequest,
    moveInDate: "2026-09-01",
    moveOutDate: "2026-08-31",
  });

  if (result.success) assert.fail("Expected the inverted date range to fail.");
  assert.equal(result.error.issues[0]?.path[0], "moveOutDate");
});

test("housing request input rejects impossible marketplace values", () => {
  const result = housingRequestInputSchema.safeParse({
    ...validRequest,
    maxRent: -1,
    bedroomsNeeded: 11,
  });

  if (result.success) assert.fail("Expected invalid marketplace values to fail.");
  assert.deepEqual(
    new Set(result.error.issues.map((issue) => issue.path[0])),
    new Set(["maxRent", "bedroomsNeeded"]),
  );
});
