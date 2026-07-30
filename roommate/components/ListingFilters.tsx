import Link from "next/link";
import FilterButton from "@/components/FilterButton";
import type { ListingFilters } from "@/features/listings/types";

type Props = {
  filters: ListingFilters;
  locations: string[];
};

export default function ListingFilters({ filters, locations }: Props) {
  return (
    <form action="/" className="listing-filters">
      <label>
        Maximum monthly rent
        <select defaultValue={filters.maxRent?.toString() ?? ""} name="maxRent">
          <option value="">Any budget</option>
          <option value="1000">Up to $1,000</option>
          <option value="1100">Up to $1,100</option>
          <option value="1200">Up to $1,200</option>
        </select>
      </label>

      <label>
        Location
        <select defaultValue={filters.location ?? ""} name="location">
          <option value="">Any location</option>
          {locations.map((location) => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
      </label>

      <label>
        Bedrooms in the home
        <select defaultValue={filters.minBedrooms?.toString() ?? ""} name="minBedrooms">
          <option value="">Any size</option>
          <option value="2">2 or more</option>
          <option value="3">3 or more</option>
          <option value="4">4 or more</option>
        </select>
      </label>

      <div className="filter-actions">
        <FilterButton />
        <Link href="/">Clear</Link>
      </div>
    </form>
  );
}
