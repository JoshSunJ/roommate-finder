"use client";

import { useEffect, useMemo, useState } from "react";
import { Layer, Source } from "react-map-gl/maplibre";
import type { Feature, LineString, Point } from "geojson";

import {
  sliceRouteAtProgress,
  type RouteCoordinate,
} from "@/features/commute/animation";

type Props = {
  route: Feature<LineString>;
  isEstimate: boolean;
};

const ANIMATION_DURATION_MS = 3200;

function easeOutCubic(progress: number) {
  return 1 - (1 - progress) ** 3;
}

export default function AnimatedCommuteRoute({ route, isEstimate }: Props) {
  const [progress, setProgress] = useState(0);
  const coordinates = route.geometry.coordinates as RouteCoordinate[];

  useEffect(() => {
    let frameId = 0;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
      setProgress(easeOutCubic(elapsedProgress));

      if (elapsedProgress < 1) {
        frameId = window.requestAnimationFrame(drawNextFrame);
      }
    };

    frameId = window.requestAnimationFrame(drawNextFrame);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const visibleCoordinates = useMemo(
    () => sliceRouteAtProgress(coordinates, progress),
    [coordinates, progress],
  );
  const progressStop = Math.min(0.999999, Math.max(0.000001, progress));
  const routeHead = useMemo<Feature<Point>>(() => ({
    type: "Feature",
    properties: {},
    geometry: {
      type: "Point",
      coordinates: visibleCoordinates.at(-1) ?? coordinates[0],
    },
  }), [coordinates, visibleCoordinates]);

  return (
    <>
      <Source id="commute-route" type="geojson" data={route} lineMetrics>
        <Layer
          id="commute-route-halo"
          type="line"
          layout={{ "line-cap": "round", "line-join": "round" }}
          paint={{
            "line-color": "#0b0b0a",
            "line-width": 11,
            "line-opacity": 0.72,
          }}
        />
        <Layer
          id="commute-route-base-line"
          type="line"
          layout={{ "line-cap": "round", "line-join": "round" }}
          paint={{
            "line-color": "#6f8cff",
            "line-width": 7,
            "line-opacity": 0.8,
            ...(isEstimate ? { "line-dasharray": [1.4, 1.2] } : {}),
          }}
        />
        <Layer
          id="commute-route-progress-line"
          type="line"
          layout={{ "line-cap": "round", "line-join": "round" }}
          paint={{
            "line-width": 5,
            "line-opacity": 0.95,
            "line-gradient": [
              "step",
              ["line-progress"],
              "#d5ff52",
              progressStop,
              "rgba(213, 255, 82, 0)",
            ],
          }}
        />
      </Source>

      <Source id="commute-route-head" type="geojson" data={routeHead}>
        <Layer
          id="commute-route-head-dot"
          type="circle"
          paint={{
            "circle-color": "#d5ff52",
            "circle-radius": 6,
            "circle-stroke-color": "#0b0b0a",
            "circle-stroke-width": 3,
          }}
        />
      </Source>
    </>
  );
}
