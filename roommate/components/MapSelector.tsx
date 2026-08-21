"use client";

import { useMemo, useState } from "react";
import LocationMap from "@/components/LocationMap";
import type { Place } from "@/features/places/types";
import type { CommuteMode } from "@/features/preferences/types";
import type { Listing } from "@/features/listings/types";

type Props = {
  places: Place[];
  savedListings: Listing[];
};

const commuteModes: CommuteMode[] = ["transit", "drive", "bike", "walk", "ride share"];

export default function MapSelector({ places, savedListings }: Props) {
  const [audience, setAudience] = useState<"student" | "intern">("student");
  const [selectedDestinationId, setSelectedDestinationId] = useState(
    places.find((place) => place.category === "Campus")?.id ?? places[0]?.id ?? "",
  );
  const [selectedModes, setSelectedModes] = useState<CommuteMode[]>(["transit", "bike"]);
  const [maxCommuteMinutes, setMaxCommuteMinutes] = useState(30);

  const destinationOptions = useMemo(
    () => places.filter((place) =>
      audience === "student" ? place.category === "Campus" : place.category === "Company",
    ),
    [audience, places],
  );

  function toggleMode(mode: CommuteMode) {
    setSelectedModes((current) =>
      current.includes(mode)
        ? current.length > 1 ? current.filter((item) => item !== mode) : current
        : [...current, mode],
    );
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
              onClick={() => {
                setAudience(option);
                const nextDestination = places.find((place) =>
                  option === "student"
                    ? place.category === "Campus"
                    : place.category === "Company",
                );
                if (nextDestination) setSelectedDestinationId(nextDestination.id);
                setSelectedModes(option === "student" ? ["transit", "bike"] : ["transit", "drive"]);
              }}
            >
              {option === "student" ? "University student" : "Company intern"}
            </button>
          ))}
        </div>

        <label className="routine-destination" htmlFor="commute-profile">
          Destination
          <select
            id="commute-profile"
            value={selectedDestinationId}
            onChange={(event) => setSelectedDestinationId(event.target.value)}
          >
            {destinationOptions.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name}
              </option>
            ))}
          </select>
        </label>

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
          <span>Routine</span>
          <strong>{audience}</strong>
          <span>Preferred</span>
          <strong>{selectedModes.join(" + ")}</strong>
        </div>

        <div className="area-place-list" aria-label="Places in this area">
          <div>
            <p className="eyebrow">Nearby essentials</p>
            <span>{places.length} places</span>
          </div>
          {places.map((place) => (
            <article key={place.id} className={place.id === selectedDestinationId ? "is-highlighted" : ""}>
              <i aria-hidden="true">{place.category.slice(0, 1)}</i>
              <div><strong>{place.name}</strong><span>{place.category} · {place.description}</span></div>
            </article>
          ))}
        </div>
      </aside>

      <LocationMap
        places={places}
        highlightedPlaceId={selectedDestinationId}
        savedListings={savedListings}
      />
    </section>
  );
}
