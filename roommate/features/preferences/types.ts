export type CommuteMode =
    | "transit"
    | "drive"
    | "bike"
    | "walk"
    | "ride share";

export interface MapPreferences {
  // This identifies the preference profile itself, such as "sjsu-student".
  id: string;
  // This is the human-friendly label shown in the selector.
  label: string;
  preferredTravelModes: CommuteMode[];
  // This points to a Place, such as "sjsu" or "paypal".
  primaryDestinationId: string;
  maxCommuteMinutes: number;
}
