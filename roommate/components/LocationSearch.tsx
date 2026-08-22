"use client";

import { useEffect, useId, useRef, useState } from "react";

import type {
  LocationSearchKind,
  LocationSearchResult,
} from "@/features/location-search/types";
import type { Coordinates } from "@/features/listings/types";

type Props = {
  kind: LocationSearchKind;
  label: string;
  placeholder: string;
  onSelect: (result: LocationSearchResult) => void;
  onInputChange?: () => void;
  proximity?: Coordinates;
  value?: string;
  name?: string;
  required?: boolean;
};

export default function LocationSearch({
  kind,
  label,
  placeholder,
  onSelect,
  onInputChange,
  proximity,
  value = "",
  name,
  required = false,
}: Props) {
  const inputId = useId();
  const [query, setQuery] = useState(value);
  const [selectedLabel, setSelectedLabel] = useState(value);
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const requestNumber = useRef(0);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2 || trimmedQuery === selectedLabel) {
      return;
    }

    const controller = new AbortController();
    const currentRequest = ++requestNumber.current;
    const timeout = window.setTimeout(async () => {
      setStatus("loading");
      setMessage("");

      const params = new URLSearchParams({ q: trimmedQuery, kind });
      if (proximity) {
        params.set("latitude", String(proximity.latitude));
        params.set("longitude", String(proximity.longitude));
      }

      try {
        const response = await fetch(`/api/location-search?${params}`, {
          signal: controller.signal,
        });
        const body = await response.json();
        if (currentRequest !== requestNumber.current) return;

        if (!response.ok) {
          setResults([]);
          setStatus("error");
          setMessage(body.error ?? "Could not search locations.");
          return;
        }

        setResults(body.results ?? []);
        setStatus("idle");
        setMessage(body.results?.length ? "" : "No locations found.");
      } catch (error) {
        if (controller.signal.aborted) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Search failed.");
      }
    }, 320);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [kind, proximity, query, selectedLabel]);

  return (
    <div className="location-search">
      <label htmlFor={inputId}>{label}</label>
      <div className="location-search__field">
        <span aria-hidden="true">⌕</span>
        <input
          id={inputId}
          name={name}
          required={required}
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            setSelectedLabel("");
            if (nextQuery.trim().length < 2) {
              setResults([]);
              setStatus("idle");
              setMessage("");
            }
            onInputChange?.();
          }}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={results.length > 0}
          aria-controls={`${inputId}-results`}
        />
        {status === "loading" && <small>Searching…</small>}
      </div>

      {results.length > 0 && (
        <ul id={`${inputId}-results`} className="location-search__results">
          {results.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                onClick={() => {
                  setQuery(result.label);
                  setSelectedLabel(result.label);
                  setResults([]);
                  setMessage("");
                  onSelect(result);
                }}
              >
                <strong>{result.shortLabel}</strong>
                <span>{result.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {message && <p className="location-search__message">{message}</p>}
    </div>
  );
}
