"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import LocationSearch from "@/components/LocationSearch";
import type { CityPreference } from "@/features/location-search/city-preference";

type Props = { city: CityPreference };

export default function HomeCitySearch({ city }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  async function selectCity(nextCity: CityPreference) {
    setStatus("saving");
    try {
      const response = await fetch("/api/city-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextCity),
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      setStatus("idle");
      router.replace("/#listings");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="home-city-search">
      <LocationSearch
        key={city.id}
        kind="city"
        label="Where are you headed?"
        placeholder="Search any US city…"
        value={city.label}
        onSelect={selectCity}
      />
      <p role="status">
        {status === "saving"
          ? "Updating your city…"
          : status === "error"
            ? "We could not save that city. Try again."
            : `Showing housing around ${city.shortLabel}.`}
      </p>
    </div>
  );
}
