import type { StyleSpecification } from "maplibre-gl";

const developmentRasterStyle: StyleSpecification = {
  version: 8,
  sources: {
    "open-street-map": {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
      maxzoom: 19,
    },
  },
  layers: [{
    id: "open-street-map",
    type: "raster",
    source: "open-street-map",
  }],
};

function createMapTilerRasterStyle(apiKey: string): StyleSpecification {
  return {
    version: 8,
    sources: {
      "maptiler-streets": {
        type: "raster",
        tiles: [
          `https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}.png?key=${apiKey}`,
        ],
        tileSize: 256,
        attribution: "© MapTiler © OpenStreetMap contributors",
        maxzoom: 20,
      },
    },
    layers: [{
      id: "maptiler-streets",
      type: "raster",
      source: "maptiler-streets",
    }],
  };
}

// NEXT_PUBLIC_ is intentional: the browser must know which public map style
// to request. Never put a secret provider credential in this value.
const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY?.trim();

export const mapStyle: string | StyleSpecification =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL?.trim() ||
  (mapTilerKey
    ? createMapTilerRasterStyle(mapTilerKey)
    : developmentRasterStyle);
