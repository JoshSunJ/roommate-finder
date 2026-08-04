import type { Listing } from "./types";

export const listings: Listing[] = [
  { id: 1, ownerId: 1, title: "Sunny private room near SJSU", rent: 1200, location: "Downtown San Jose, CA", description: "Furnished room in a quiet three-bedroom apartment, a short walk from campus.", bedrooms: 3, bathroomType: "Shared", availableFrom: "August 1, 2026", postedBy: "Alice", status: "active", coordinates: { latitude: 37.3319, longitude: -121.8816 } },
  { id: 2, ownerId: 1, title: "Room in downtown apartment", rent: 1050, location: "San Jose, CA", description: "Bright apartment with in-unit laundry and utilities included in the monthly rent.", bedrooms: 2, bathroomType: "Private", availableFrom: "August 15, 2026", postedBy: "Marcus", status: "active", coordinates: { latitude: 37.3293, longitude: -121.8916 } },
  { id: 3, ownerId: 1, title: "Calm house close to transit", rent: 950, location: "Japantown, San Jose, CA", description: "A friendly house share with easy light-rail access and a backyard for studying or relaxing.", bedrooms: 4, bathroomType: "Shared", availableFrom: "September 1, 2026", postedBy: "Priya", status: "active", coordinates: { latitude: 37.3501, longitude: -121.8942 } },
];
