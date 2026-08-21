"use client";

import { useMemo, useState } from "react";
import LocationMap from "@/components/LocationMap";
import type { Place } from "@/features/places/types";
import type { MapPreferences } from "@/features/preferences/types";
import type { Listing } from "@/features/listings/types";

type Props = {
  places: Place[];
  preferences: MapPreferences[];
  savedListings: Listing[];
};

export default function MapSelector({ places, preferences, savedListings }: Props) {
  const [audience, setAudience] = useState<"student" | "intern">("student");
  const [selectedPreferenceId, setSelectedPreferenceId] = useState(
    preferences[0]?.id ?? "",
  );

  const audiencePreferences = useMemo(
    () => preferences.filter((preference) => preference.id.includes(audience)),
    [audience, preferences],
  );

  const selectedPreference = preferences.find(
    (preference) => preference.id === selectedPreferenceId,
  );

  if (!selectedPreference) {
    return <p className="empty-state">No commute profiles are available yet.</p>;
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
                const nextPreference = preferences.find((preference) =>
                  preference.id.includes(option),
                );
                if (nextPreference) setSelectedPreferenceId(nextPreference.id);
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
            value={selectedPreferenceId}
            onChange={(event) => setSelectedPreferenceId(event.target.value)}
          >
            {audiencePreferences.map((preference) => (
              <option key={preference.id} value={preference.id}>
                {preference.label}
              </option>
            ))}
          </select>
        </label>

        <div className="commute-summary">
          <span>Preferred</span>
          <strong>{selectedPreference.preferredTravelModes.join(" + ")}</strong>
          <span>Commute goal</span>
          <strong>≤ {selectedPreference.maxCommuteMinutes} min</strong>
        </div>

        <div className="area-place-list" aria-label="Places in this area">
          <div>
            <p className="eyebrow">Nearby essentials</p>
            <span>{places.length} places</span>
          </div>
          {places.map((place) => (
            <article key={place.id} className={place.id === selectedPreference.primaryDestinationId ? "is-highlighted" : ""}>
              <i aria-hidden="true">{place.category.slice(0, 1)}</i>
              <div><strong>{place.name}</strong><span>{place.category} · {place.description}</span></div>
            </article>
          ))}
        </div>
      </aside>

      <LocationMap
        places={places}
        highlightedPlaceId={selectedPreference.primaryDestinationId}
        savedListings={savedListings}
      />
    </section>
  );
}
