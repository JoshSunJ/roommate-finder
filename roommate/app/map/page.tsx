import Link from "next/link";
import MapSelector from "@/components/MapSelector";
import { preferences } from "@/features/preferences/data";
import { getPlaces } from "@/features/places/service";

export default async function MapPage() {
  const places = await getPlaces();
  return (
    <main className="page-shell">
      <Link href="/" className="back-link">← All listings</Link>
      <section className="map-header"><p className="eyebrow">San Jose starter map</p><h1>Explore student and intern essentials</h1><p>Choose a routine to see the city through that person’s commute and daily needs.</p></section>
      <MapSelector places={places} preferences={preferences} />
      <div className="place-list">{places.map((place) => <article key={place.id}><p className="eyebrow">{place.category}</p><h2>{place.name}</h2><p>{place.description}</p></article>)}</div>
    </main>
  );
}
