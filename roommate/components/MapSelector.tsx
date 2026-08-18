"use client";

import { useState } from "react";
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
  // Optional chaining keeps the component safe even if mock data is empty.
  const [selectedPreferenceId, setSelectedPreferenceId] = useState(
    preferences[0]?.id ?? "",
  );

  const selectedPreference = preferences.find(
    (preference) => preference.id === selectedPreferenceId,
  );

  if (!selectedPreference) {
    return <p className="empty-state">No commute profiles are available yet.</p>;
  }

  return (
    <section className="map-experience" aria-label="Personalized city guide">
      <div className="map-preference-panel">
        <p className="eyebrow">Choose your city routine</p>
        <label htmlFor="commute-profile">
          I am in San Jose for
          <select
            id="commute-profile"
            value={selectedPreferenceId}
            onChange={(event) => setSelectedPreferenceId(event.target.value)}
          >
            {preferences.map((preference) => (
              <option key={preference.id} value={preference.id}>
                {preference.label}
              </option>
            ))}
          </select>
        </label>

        <p className="commute-summary">
          You prefer {selectedPreference.preferredTravelModes.join(" and ")} and
          want a commute of up to {selectedPreference.maxCommuteMinutes} minutes.
        </p>
      </div>

      <LocationMap
        places={places}
        highlightedPlaceId={selectedPreference.primaryDestinationId}
        savedListings={savedListings}
      />
    </section>
  );
}
