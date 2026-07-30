import type { Listing } from "./types";

// This array is a temporary data source. Later, the service can read the same
// Listing shape from a database without forcing the page or components to change.
export const listings: Listing[] = [
  {
    id: 1,
    title: "Sunny private room near SJSU",
    rent: 1200,
    location: "Downtown San Jose, CA",
    description: "Furnished room in a quiet three-bedroom apartment, a short walk from campus.",
    bedrooms: 3,
    bathroomType: "Shared",
    availableFrom: "August 1, 2026",
    postedBy: "Alice",
  },
  {
    id: 2,
    title: "Room in downtown apartment",
    rent: 1050,
    location: "San Jose, CA",
    description: "Bright apartment with in-unit laundry and utilities included in the monthly rent.",
    bedrooms: 2,
    bathroomType: "Private",
    availableFrom: "August 15, 2026",
    postedBy: "Marcus",
  },
  {
    id: 3,
    title: "Calm house close to transit",
    rent: 950,
    location: "Japantown, San Jose, CA",
    description: "A friendly house share with easy light-rail access and a backyard for studying or relaxing.",
    bedrooms: 4,
    bathroomType: "Shared",
    availableFrom: "September 1, 2026",
    postedBy: "Priya",
  },
];
