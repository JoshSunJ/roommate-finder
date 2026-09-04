import assert from "node:assert/strict";
import test from "node:test";

import {
  addMapTilerKey,
  createMapTilerStyleUrl,
} from "../features/map/config";

test("creates MapTiler's MapLibre vector-style URL", () => {
  const url = new URL(createMapTilerStyleUrl("public browser key"));

  assert.equal(url.origin, "https://api.maptiler.com");
  assert.equal(url.pathname, "/maps/streets-v4/style.json");
  assert.equal(url.searchParams.get("key"), "public browser key");
});

test("adds the public key to a configured MapTiler style", () => {
  const url = new URL(addMapTilerKey(
    "https://api.maptiler.com/maps/dataviz/style.json",
    "browser-key",
  ));

  assert.equal(url.searchParams.get("key"), "browser-key");
});

test("does not leak the MapTiler key to another provider", () => {
  const styleUrl = "https://maps.example.com/style.json";

  assert.equal(addMapTilerKey(styleUrl, "browser-key"), styleUrl);
});

test("preserves a key already present in a configured style URL", () => {
  const styleUrl = "https://api.maptiler.com/maps/streets-v4/style.json?key=existing";

  assert.equal(addMapTilerKey(styleUrl, "replacement"), styleUrl);
});
