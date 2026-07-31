import type { MapPreferences } from "@/features/preferences/types";

export const preferences: MapPreferences[] = [
  {
    id: "sjsu-student",
    label: "SJSU student",
    preferredTravelModes: ["bike", "transit"],
    primaryDestinationId: "sjsu",
    maxCommuteMinutes: 20,
  },
  {
    id: "paypal-intern",
    label: "PayPal intern",
    preferredTravelModes: ["walk", "drive"],
    primaryDestinationId: "paypal",
    maxCommuteMinutes: 30,
  },
  {
    id: "adobe-intern",
    label: "Adobe intern",
    preferredTravelModes: ["ride share", "drive"],
    primaryDestinationId: "adobe",
    maxCommuteMinutes: 10,
  },
];
