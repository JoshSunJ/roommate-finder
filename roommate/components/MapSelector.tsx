"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import CommuteComparison from "@/components/CommuteComparison";
import LocationMap from "@/components/LocationMap";
import LocationSearch from "@/components/LocationSearch";
import { requestRoadRoutes } from "@/features/commute/client";
import { compareCommuteModes } from "@/features/commute/service";
import type { CommuteRoute } from "@/features/commute/types";
import type { Listing } from "@/features/listings/types";
import {
  defaultCity,
  isInCityArea,
  type CityPreference,
} from "@/features/location-search/city-preference";
import type { LocationSearchResult } from "@/features/location-search/types";
import type { Place, PlaceCategory } from "@/features/places/types";
import type { CommuteMode } from "@/features/preferences/types";

type Props = {
  places: Place[];
  savedListings: Listing[];
  city: CityPreference;
};

type RoadRouteResult = {
  requestKey: string;
  routes: CommuteRoute[];
  unavailable: boolean;
};

const commuteModes: CommuteMode[] = ["transit", "drive", "bike", "walk", "ride share"];

function placeAsSearchResult(place: Place): LocationSearchResult {
  return {
    id: place.id,
    label: `${place.name} · ${place.description}`,
    shortLabel: place.name,
    type: "poi",
    coordinates: place.coordinates,
  };
}

export default function MapSelector({ places, savedListings, city }: Props) {
  const initialCampus = places.find((place) => place.category === "Campus") ?? places[0];
  const [audience, setAudience] = useState<"student" | "intern">("student");
  const [selectedDestination, setSelectedDestination] = useState<LocationSearchResult | null>(
    city.id === defaultCity.id && initialCampus ? placeAsSearchResult(initialCampus) : null,
  );
  const [selectedModes, setSelectedModes] = useState<CommuteMode[]>(["transit", "bike"]);
  const [displayedMode, setDisplayedMode] = useState<CommuteMode>("bike");
  const [maxCommuteMinutes, setMaxCommuteMinutes] = useState(30);
  const [roadRouteResult, setRoadRouteResult] = useState<RoadRouteResult>({
    requestKey: "",
    routes: [],
    unavailable: false,
  });

  const isStarterCity = city.id === defaultCity.id;
  const localDestinations = useMemo(
    () => places.filter((place) =>
      audience === "student" ? place.category === "Campus" : place.category === "Company",
    ),
    [audience, places],
  );
  const mapPlaces = useMemo(() => {
    const basePlaces = isStarterCity ? places : [];
    if (!selectedDestination || basePlaces.some((place) => place.id === selectedDestination.id)) {
      return basePlaces;
    }

    const category: PlaceCategory = audience === "student" ? "Campus" : "Company";
    return [...basePlaces, {
      id: selectedDestination.id,
      name: selectedDestination.shortLabel,
      category,
      coordinates: selectedDestination.coordinates,
      description: selectedDestination.label,
    }];
  }, [audience, isStarterCity, places, selectedDestination]);
  const visibleSavedListings = useMemo(
    () => savedListings.filter((listing) => isInCityArea(listing.coordinates, city)),
    [city, savedListings],
  );
  const [selectedHomeId, setSelectedHomeId] = useState<number | null>(
    visibleSavedListings[0]?.id ?? null,
  );
  const selectedHome = visibleSavedListings.find((listing) => listing.id === selectedHomeId) ?? null;
  const commuteEstimates = useMemo(
    () => selectedHome?.coordinates && selectedDestination
      ? compareCommuteModes(
        selectedHome.coordinates,
        selectedDestination.coordinates,
        selectedModes,
        maxCommuteMinutes,
      )
      : [],
    [maxCommuteMinutes, selectedDestination, selectedHome, selectedModes],
  );
  const routeRequestKey = selectedHome?.coordinates && selectedDestination
    ? [
      selectedHome.coordinates.longitude,
      selectedHome.coordinates.latitude,
      selectedDestination.coordinates.longitude,
      selectedDestination.coordinates.latitude,
      selectedModes.join(","),
    ].join("|")
    : null;
  const roadRoutes = routeRequestKey === roadRouteResult.requestKey
    ? roadRouteResult.routes
    : [];
  const routesLoading = Boolean(routeRequestKey)
    && routeRequestKey !== roadRouteResult.requestKey;
  const routesUnavailable = routeRequestKey === roadRouteResult.requestKey
    && roadRouteResult.unavailable;
  const displayedRoadRoute = roadRoutes.find((route) => route.mode === displayedMode) ?? null;

  useEffect(() => {
    if (!routeRequestKey || !selectedHome?.coordinates || !selectedDestination) return;

    const abortController = new AbortController();

    requestRoadRoutes({
      origin: selectedHome.coordinates,
      destination: selectedDestination.coordinates,
      modes: selectedModes,
      signal: abortController.signal,
    })
      .then((routes) => setRoadRouteResult({
        requestKey: routeRequestKey,
        routes,
        unavailable: false,
      }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setRoadRouteResult({
          requestKey: routeRequestKey,
          routes: [],
          unavailable: true,
        });
      });

    return () => abortController.abort();
  }, [routeRequestKey, selectedDestination, selectedHome, selectedModes]);

  function toggleMode(mode: CommuteMode) {
    if (selectedModes.includes(mode) && selectedModes.length === 1) return;
    const nextModes = selectedModes.includes(mode)
      ? selectedModes.filter((item) => item !== mode)
      : [...selectedModes, mode];

    setSelectedModes(nextModes);
    if (!nextModes.includes(displayedMode)) setDisplayedMode(nextModes[0]);
  }

  function changeAudience(option: "student" | "intern") {
    setAudience(option);
    const nextDestination = places.find((place) =>
      option === "student" ? place.category === "Campus" : place.category === "Company",
    );
    setSelectedDestination(isStarterCity && nextDestination ? placeAsSearchResult(nextDestination) : null);
    const nextModes: CommuteMode[] = option === "student"
      ? ["transit", "bike"]
      : ["transit", "drive"];
    setSelectedModes(nextModes);
    setDisplayedMode(option === "student" ? "bike" : "drive");
  }

  return (
    <section className="map-experience" aria-label="Personalized area guide">
      <aside className="map-preference-panel">
        <div className="routine-heading">
          <p className="eyebrow">Your routine</p>
          <h2>What brings you here?</h2>
        </div>

        <div className="routine-switch" aria-label="Choose student or intern routine">
          {(["student", "intern"] as const).map((option) => (
            <button
              type="button"
              key={option}
              className={audience === option ? "is-active" : ""}
              aria-pressed={audience === option}
              onClick={() => changeAudience(option)}
            >
              {option === "student" ? "University student" : "Company intern"}
            </button>
          ))}
        </div>

        <LocationSearch
          key={`${audience}-${city.id}-${selectedDestination?.id ?? "empty"}`}
          kind="destination"
          label={audience === "student" ? "University or campus" : "Company or workplace"}
          placeholder={audience === "student" ? "Search universities…" : "Search employers…"}
          value={selectedDestination?.label ?? ""}
          proximity={city.coordinates}
          boundingBox={city.boundingBox}
          onSelect={setSelectedDestination}
        />

        {isStarterCity && localDestinations.length > 0 && (
          <div className="destination-quick-picks" aria-label="Suggested destinations">
            <span>Quick picks</span>
            <div>
              {localDestinations.map((place) => (
                <button
                  type="button"
                  key={place.id}
                  className={selectedDestination?.id === place.id ? "is-active" : ""}
                  onClick={() => setSelectedDestination(placeAsSearchResult(place))}
                >
                  {place.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <label className="saved-home-picker" htmlFor="saved-home">
          <span>Saved home to compare</span>
          <select
            id="saved-home"
            value={selectedHomeId ?? ""}
            onChange={(event) => setSelectedHomeId(
              event.target.value ? Number(event.target.value) : null,
            )}
          >
            <option value="">Choose a saved home</option>
            {visibleSavedListings.map((listing) => (
              <option key={listing.id} value={listing.id}>
                {listing.title} · ${listing.rent}/month
              </option>
            ))}
          </select>
        </label>

        {visibleSavedListings.length === 0 && (
          <p className="saved-home-empty">
            No mapped saved homes in {city.shortLabel}. Save a listing in this city first,
            then return here to animate its commute.
            <Link href="/#listings">Browse homes ↗</Link>
          </p>
        )}

        <fieldset className="commute-mode-picker">
          <legend>How would you travel?</legend>
          <div>
            {commuteModes.map((mode) => (
              <button
                type="button"
                key={mode}
                className={selectedModes.includes(mode) ? "is-active" : ""}
                aria-pressed={selectedModes.includes(mode)}
                onClick={() => toggleMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="map-route-mode-picker">
          <legend>Route shown on map</legend>
          <div>
            {selectedModes.map((mode) => (
              <button
                type="button"
                key={mode}
                className={displayedMode === mode ? "is-active" : ""}
                aria-pressed={displayedMode === mode}
                onClick={() => setDisplayedMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
          <small>Comparison uses every selected mode; the map visualizes this one.</small>
        </fieldset>

        <label className="commute-limit" htmlFor="commute-limit">
          <span>Maximum commute <strong>{maxCommuteMinutes} min</strong></span>
          <input
            id="commute-limit"
            type="range"
            min="10"
            max="90"
            step="5"
            value={maxCommuteMinutes}
            onChange={(event) => setMaxCommuteMinutes(Number(event.target.value))}
          />
        </label>

        <div className="commute-summary">
          <span>City</span>
          <strong>{city.shortLabel}</strong>
          <span>Routine</span>
          <strong>{audience}</strong>
          <span>Preferred</span>
          <strong>{selectedModes.join(" + ")}</strong>
        </div>

        <CommuteComparison
          estimates={commuteEstimates}
          roadRoutes={roadRoutes}
          hasHome={Boolean(selectedHome?.coordinates)}
          hasDestination={Boolean(selectedDestination)}
          maxCommuteMinutes={maxCommuteMinutes}
          routesLoading={routesLoading}
          routesUnavailable={routesUnavailable}
        />

        <div className="area-place-list" aria-label={`Places in ${city.shortLabel}`}>
          <div>
            <p className="eyebrow">Places in {city.shortLabel}</p>
            <span>{mapPlaces.length} places</span>
          </div>
          {mapPlaces.map((place) => (
            <article key={place.id} className={place.id === selectedDestination?.id ? "is-highlighted" : ""}>
              <i aria-hidden="true">{place.category.slice(0, 1)}</i>
              <div><strong>{place.name}</strong><span>{place.category} · {place.description}</span></div>
            </article>
          ))}
          {mapPlaces.length === 0 && <p className="area-place-list__empty">Search for a destination to start your city routine.</p>}
        </div>
      </aside>

      <LocationMap
        places={mapPlaces}
        highlightedPlaceId={selectedDestination?.id ?? ""}
        savedListings={visibleSavedListings}
        selectedHomeId={selectedHomeId}
        onSelectSavedHome={setSelectedHomeId}
        focusCoordinates={selectedDestination?.coordinates ?? city.coordinates}
        roadRoute={displayedRoadRoute}
        displayedMode={displayedMode}
      />
    </section>
  );
}
