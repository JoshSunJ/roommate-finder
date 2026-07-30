import Link from "next/link";
import LocationMap from "@/components/LocationMap";
import { getPlaces } from "@/features/places/service";

export default async function MapPage() {
  const places = await getPlaces();
  return (
    <main className="page-shell">
      <Link href="/" className="back-link">← All listings</Link>
      <section className="map-header"><p className="eyebrow">San Jose starter map</p><h1>Explore student and intern essentials</h1><p>Markers show campus, companies, libraries, and grocery options around SJSU.</p></section>
      <LocationMap places={places} />
      <div className="place-list">{places.map((place) => <article key={place.id}><p className="eyebrow">{place.category}</p><h2>{place.name}</h2><p>{place.description}</p></article>)}</div>
    </main>
  );
}
