import "server-only";

import { cookies } from "next/headers";

import {
  CITY_PREFERENCE_COOKIE,
  defaultCity,
  deserializeCityPreference,
} from "@/features/location-search/city-preference";

export async function getCityPreference() {
  const cookieStore = await cookies();
  return deserializeCityPreference(cookieStore.get(CITY_PREFERENCE_COOKIE)?.value)
    ?? defaultCity;
}
