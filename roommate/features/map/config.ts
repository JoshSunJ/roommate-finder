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

// NEXT_PUBLIC_ is intentional: the browser must know which public map style
// to request. Never put a secret provider credential in this value.
export const mapStyle: string | StyleSpecification =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL?.trim() || developmentRasterStyle;
