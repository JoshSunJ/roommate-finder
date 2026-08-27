import "dotenv/config";

import assert from "node:assert/strict";
import test from "node:test";

import {
  rateLimitKey,
  rateLimitResponse,
  requestNetworkIdentifier,
} from "../features/security/rate-limit";

test("rate-limit keys never persist the raw identifier", () => {
  const key = rateLimitKey("sign-in", "Student@Example.com");

  assert.match(key, /^sign-in:[a-f0-9]{64}$/);
  assert.doesNotMatch(key, /student|example/i);
  assert.equal(key, rateLimitKey("sign-in", " student@example.COM "));
});

test("network identity prefers the first proxy-provided address", () => {
  const request = new Request("https://unitern.example/sign-in", {
    headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.4" },
  });

  assert.equal(requestNetworkIdentifier(request), "203.0.113.10");
});

test("rate-limit responses are non-cacheable and tell clients when to retry", async () => {
  const response = rateLimitResponse({
    allowed: false,
    remaining: 0,
    retryAfterSeconds: 42,
  });

  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "42");
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { error: "Too many requests. Try again later." });
});
