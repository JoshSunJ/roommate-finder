"use client";

import { useEffect, useMemo, useState } from "react";
import { Marker } from "react-map-gl/maplibre";
import type { Feature, LineString } from "geojson";
import type { Map as MapLibreMap } from "maplibre-gl";

import {
  sliceRouteAtProgress,
  type RouteCoordinate,
} from "@/features/commute/animation";
import type { CommuteMode } from "@/features/preferences/types";

type Props = {
  map: MapLibreMap;
  route: Feature<LineString>;
  isEstimate: boolean;
  mode: CommuteMode;
  replayRequested: boolean;
};

const ANIMATION_DURATION_MS = 3200;

function easeOutCubic(progress: number) {
  return 1 - (1 - progress) ** 3;
}

const modeIcon: Record<CommuteMode, string> = {
  transit: "🚌",
  drive: "🚗",
  bike: "🚲",
  walk: "🚶",
  "ride share": "🚕",
};

export default function AnimatedCommuteRoute({ map, route, isEstimate, mode, replayRequested }: Props) {
  const [progress, setProgress] = useState(0);
  const [, setProjectionRevision] = useState(0);
  const coordinates = route.geometry.coordinates as RouteCoordinate[];

  useEffect(() => {
    let frameId = 0;

    if (!replayRequested && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frameId = window.requestAnimationFrame(() => setProgress(1));
      return () => window.cancelAnimationFrame(frameId);
    }

    let startedAt: number | null = null;
    const drawNextFrame = (timestamp: number) => {
      startedAt ??= timestamp;
      const elapsedProgress = Math.min(
        1,
        (timestamp - startedAt) / ANIMATION_DURATION_MS,
      );
      const easedProgress = easeOutCubic(elapsedProgress);
      setProgress(easedProgress);

      if (elapsedProgress < 1) {
        frameId = window.requestAnimationFrame(drawNextFrame);
      }
    };

    frameId = window.requestAnimationFrame(drawNextFrame);
    return () => window.cancelAnimationFrame(frameId);
  }, [coordinates, map, replayRequested]);

  useEffect(() => {
    const refreshProjection = () => setProjectionRevision((revision) => revision + 1);
    map.on("move", refreshProjection);
    map.on("resize", refreshProjection);
    return () => {
      map.off("move", refreshProjection);
      map.off("resize", refreshProjection);
    };
  }, [map]);

  const visibleCoordinates = useMemo(
    () => sliceRouteAtProgress(coordinates, progress),
    [coordinates, progress],
  );
  const routeHead = visibleCoordinates.at(-1) ?? coordinates[0];
  const projectedRoute = visibleCoordinates
    .map(([longitude, latitude]) => map.project([longitude, latitude]))
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return (
    <>
      <svg className="commute-route-overlay" aria-hidden="true">
        <polyline className="commute-route-overlay__halo" points={projectedRoute} />
        <polyline
          className={`commute-route-overlay__line${isEstimate ? " is-estimate" : ""}`}
          points={projectedRoute}
        />
      </svg>

      <Marker longitude={routeHead[0]} latitude={routeHead[1]} anchor="center">
        <span className="route-traveler" aria-hidden="true">{modeIcon[mode]}</span>
      </Marker>
    </>
  );
}
