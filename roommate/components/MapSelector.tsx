"use client";

import { useMemo, useState } from "react";

import LocationMap from "@/components/LocationMap";
import LocationSearch from "@/components/LocationSearch";
import type { Listing } from "@/features/listings/types";
import type { LocationSearchResult } from "@/features/location-search/types";
import type { Place, PlaceCategory } from "@/features/places/types";
import type { CommuteMode } from "@/features/preferences/types";

type Props = {
  places: Place[];
  savedListings: Listing[];
};

const commuteModes: CommuteMode[] = ["transit", "drive", "bike", "walk", "ride share"];

const defaultCity: LocationSearchResult = {
  id: "unitern.san-jose",
  label: "San Jose, California, United States",
  shortLabel: "San Jose",
  type: "place",
  coordinates: { latitude: 37.3352, longitude: -121.8811 },
  boundingBox: [-122.08, 37.12, -121.68, 37.55],
};

function placeAsSearchResult(place: Place): LocationSearchResult {
  return {
    id: place.id,
    label: `${place.name} · ${place.description}`,
    shortLabel: place.name,
    type: "poi",
    coordinates: place.coordinates,
  };
}

function isInsideCity(listing: Listing, city: LocationSearchResult) {
  if (!listing.coordinates) return false;
  if (city.boundingBox) {
    const [west, south, east, north] = city.boundingBox;
    return listing.coordinates.longitude >= west
      && listing.coordinates.longitude <= east
      && listing.coordinates.latitude >= south
      && listing.coordinates.latitude <= north;
  }

  return Math.abs(listing.coordinates.latitude - city.coordinates.latitude) < 0.55
    && Math.abs(listing.coordinates.longitude - city.coordinates.longitude) < 0.7;
}

export default function MapSelector({ places, savedListings }: Props) {
  const initialCampus = places.find((place) => place.category === "Campus") ?? places[0];
  const [audience, setAudience] = useState<"student" | "intern">("student");
  const [selectedCity, setSelectedCity] = useState(defaultCity);
  const [selectedDestination, setSelectedDestination] = useState<LocationSearchResult | null>(
    initialCampus ? placeAsSearchResult(initialCampus) : null,
  );
  const [selectedModes, setSelectedModes] = useState<CommuteMode[]>(["transit", "bike"]);
  const [maxCommuteMinutes, setMaxCommuteMinutes] = useState(30);

  const isStarterCity = selectedCity.id === defaultCity.id;
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
    () => savedListings.filter((listing) => isInsideCity(listing, selectedCity)),
    [savedListings, selectedCity],
  );

  function toggleMode(mode: CommuteMode) {
    setSelectedModes((current) =>
      current.includes(mode)
        ? current.length > 1 ? current.filter((item) => item !== mode) : current
        : [...current, mode],
    );
  }

  function changeAudience(option: "student" | "intern") {
    setAudience(option);
    const nextDestination = places.find((place) =>
      option === "student" ? place.category === "Campus" : place.category === "Company",
    );
    setSelectedDestination(isStarterCity && nextDestination ? placeAsSearchResult(nextDestination) : null);
    setSelectedModes(option === "student" ? ["transit", "bike"] : ["transit", "drive"]);
  }

  return (
    <section className="map-experience" aria-label="Personalized area guide">
      <aside className="map-preference-panel">
        <div className="routine-heading">
          <p className="eyebrow">Your routine</p>
          <h2>What brings you here?</h2>
        </div>

        <LocationSearch
          key={selectedCity.id}
          kind="city"
          label="Search a US city"
          placeholder="Seattle, Austin, New York…"
          value={selectedCity.label}
          onSelect={(city) => {
            setSelectedCity(city);
            setSelectedDestination(null);
          }}
        />

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
          key={`${audience}-${selectedCity.id}-${selectedDestination?.id ?? "empty"}`}
          kind="destination"
          label={audience === "student" ? "University or campus" : "Company or workplace"}
          placeholder={audience === "student" ? "Search universities…" : "Search employers…"}
          value={selectedDestination?.label ?? ""}
          proximity={selectedCity.coordinates}
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
          <strong>{selectedCity.shortLabel}</strong>
          <span>Routine</span>
          <strong>{audience}</strong>
          <span>Preferred</span>
          <strong>{selectedModes.join(" + ")}</strong>
        </div>

        <div className="area-place-list" aria-label={`Places in ${selectedCity.shortLabel}`}>
          <div>
            <p className="eyebrow">Places in {selectedCity.shortLabel}</p>
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
        focusCoordinates={selectedDestination?.coordinates ?? selectedCity.coordinates}
      />
    </section>
  );
}
